document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const convertBtn = document.getElementById('convert-btn');
    const progress = document.getElementById('progress');
    const result = document.getElementById('result');
    const downloadLink = document.getElementById('download-link');
    
    let file = null;
    
    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFiles(files);
        }
    }
    
    fileElem.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
        file = files[0];
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }
        dropArea.innerHTML = `<p>${file.name} (${formatFileSize(file.size)})</p>`;
    }
    
    convertBtn.addEventListener('click', async () => {
        if (!file) {
            alert('Please select a PDF file first');
            return;
        }
        
        progress.classList.remove('hidden');
        result.classList.add('hidden');
        
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('format', document.getElementById('format').value);
        
        try {
            // Create a GitHub Actions workflow dispatch
            const response = await fetch(`https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/actions/workflows/convert.yml/dispatches`, {
                method: 'POST',
                headers: {
                    'Authorization': 'token YOUR_GITHUB_TOKEN',
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    ref: 'main',
                    inputs: {
                        filename: file.name,
                        format: document.getElementById('format').value
                    }
                })
            });
            
            if (!response.ok) throw new Error('Conversion failed');
            
            // Poll for result (simplified - in production use GitHub API to check artifacts)
            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;
                const progressValue = Math.min(100, attempts * 10);
                document.querySelector('progress').value = progressValue;
                
                if (attempts >= 10) {
                    clearInterval(poll);
                    progress.classList.add('hidden');
                    downloadLink.href = `https://github.com/YOUR_USERNAME/YOUR_REPO/raw/main/converted/${file.name.replace('.pdf', '')}.${document.getElementById('format').value}`;
                    downloadLink.download = file.name.replace('.pdf', '') + '.' + document.getElementById('format').value;
                    result.classList.remove('hidden');
                }
            }, 2000);
            
        } catch (error) {
            console.error(error);
            alert('Conversion failed: ' + error.message);
            progress.classList.add('hidden');
        }
    });
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
