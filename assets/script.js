async function startConversion() {
    if (!currentFile) {
        showError("Please select a PDF file first");
        return;
    }

    showProgress();
    hideError();
    
    try {
        // 1. Validate file
        if (currentFile.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error("File too large (max 10MB)");
        }

        // 2. Prepare for upload
        const fileContent = await toBase64(currentFile);
        const format = document.getElementById('format').value;
        const uniqueId = Date.now();

        // 3. Store file temporarily (simulated)
        const storeResponse = await fetch('https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/contents/temp_uploads/' + uniqueId + '.pdf', {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + GH_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Temporary upload for conversion',
                content: fileContent
            })
        });

        if (!storeResponse.ok) {
            throw new Error("Failed to upload file");
        }

        // 4. Trigger conversion
        const convertResponse = await fetch(`https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/actions/workflows/convert.yml/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': 'token ' + GH_TOKEN,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    file_id: uniqueId.toString(),
                    format: format
                }
            })
        });

        if (!convertResponse.ok) {
            throw new Error("Conversion trigger failed");
        }

        // 5. Poll for completion
        await waitForCompletion(uniqueId, format);

    } catch (error) {
        console.error("Conversion error:", error);
        showError(error.message || "Conversion failed. Please try again.");
        hideProgress();
    }
}

async function waitForCompletion(fileId, format) {
    let attempts = 0;
    const maxAttempts = 30; // ~3 minutes timeout
    
    while (attempts < maxAttempts) {
        attempts++;
        updateProgress((attempts/maxAttempts) * 100);
        
        // Check for artifact
        const artifactResponse = await fetch(`https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/actions/artifacts`, {
            headers: {
                'Authorization': 'token ' + GH_TOKEN,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const artifacts = await artifactResponse.json();
        const ourArtifact = artifacts.artifacts.find(a => a.name === `converted-${fileId}`);
        
        if (ourArtifact) {
            // Get download URL
            const downloadUrl = `https://github.com/YOUR_USERNAME/YOUR_REPO/suites/${ourArtifact.workflow_run.id}/artifacts/${ourArtifact.id}`;
            showResult(downloadUrl);
            return;
        }
        
        await new Promise(r => setTimeout(r, 6000)); // Wait 6 seconds
    }
    
    throw new Error("Conversion timed out");
}

function showError(message) {
    const errorDiv = document.getElementById('error-message') || document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').appendChild(errorDiv);
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) errorDiv.remove();
}
