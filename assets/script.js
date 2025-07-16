// Configuration
const GITHUB_USER = 'your-username';
const REPO_NAME = 'pdf-to-word-converter';
const GH_TOKEN = 'ghp_your_token_here'; // Store in GitHub Secrets for production

document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileElem');
    const convertBtn = document.getElementById('convert-btn');
    const progressBar = document.querySelector('.progress-bar');
    const resultDiv = document.getElementById('result');
    const downloadLink = document.getElementById('download-link');
    
    let currentFile = null;
    
    // Drag and drop setup
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropArea.addEventListener(event, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(event => {
        dropArea.addEventListener(event, highlightArea, false);
    });
    
    ['dragleave', 'drop'].forEach(event => {
        dropArea.addEventListener(event, unhighlightArea, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFileSelect);
    
    convertBtn.addEventListener('click', startConversion);
    
    async function startConversion() {
        if (!currentFile) return;
        
        showProgress();
        
        try {
            // 1. Encode file for GitHub API
            const fileContent = await toBase64(currentFile);
            const format = document.getElementById('format').value;
            
            // 2. Trigger GitHub Action
            const response = await triggerConversion(
                currentFile.name,
                fileContent,
                format
            );
            
            // 3. Poll for artifact
            const downloadUrl = await waitForArtifact();
            showResult(downloadUrl);
            
        } catch (error) {
            console.error("Conversion failed:", error);
            alert("Conversion failed. Please try again.");
            hideProgress();
        }
    }
    
    async function triggerConversion(filename, content, format) {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/actions/workflows/convert.yml/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${GH_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: 'main',
                    inputs: {
                        filename: filename,
                        file_content: content,
                        format: format
                    }
                })
            }
        );
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        return response;
    }
    
    async function waitForArtifact() {
        let attempts = 0;
        
        while (attempts < 30) { // Max 3 minutes
            attempts++;
            updateProgress(attempts * 3.33);
            
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/actions/artifacts`,
                {
                    headers: {
                        'Authorization': `token ${GH_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            const data = await response.json();
            if (data.artifacts && data.artifacts.length > 0) {
                return `https://github.com/${GITHUB_USER}/${REPO_NAME}/suites/${data.artifacts[0].workflow_run.id}/artifacts/${data.artifacts[0].id}`;
            }
            
            await new Promise(resolve => setTimeout(resolve, 6000)); // Check every 6 seconds
        }
        
        throw new Error("Timeout waiting for artifact");
    }
    
    // Helper functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlightArea() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlightArea() {
        dropArea.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFiles(files);
        }
    }
    
    function handleFileSelect(e) {
        handleFiles(e.target.files);
    }
    
    function handleFiles(files) {
        currentFile = files[0];
        dropArea.innerHTML = `
            <p>${currentFile.name}</p>
            <small>${formatFileSize(currentFile.size)}</small>
        `;
    }
    
    function showProgress() {
        document.getElementById('progress').classList.remove('hidden');
        resultDiv.classList.add('hidden');
    }
    
    function hideProgress() {
        document.getElementById('progress').classList.add('hidden');
    }
    
    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
    }
    
    function showResult(url) {
        downloadLink.href = url;
        resultDiv.classList.remove('hidden');
        hideProgress();
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
});
