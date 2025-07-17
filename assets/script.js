document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const fileInfo = document.getElementById('file-info');
    const convertBtn = document.getElementById('convert-btn');
    const progressSection = document.getElementById('progress-section');
    const resultSection = document.getElementById('result-section');
    const errorSection = document.getElementById('error-section');
    const downloadBtn = document.getElementById('download-btn');
    const retryBtn = document.getElementById('retry-btn');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const errorMessage = document.getElementById('error-message');

    // State
    let currentFile = null;
    let convertedFileUrl = null;

    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    convertBtn.addEventListener('click', startConversion);
    retryBtn.addEventListener('click', resetConverter);

    // Drag and Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(event => {
        dropZone.addEventListener(event, highlightDropZone, false);
    });

    ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, unhighlightDropZone, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);

    // Functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlightDropZone() {
        dropZone.classList.add('highlight');
    }

    function unhighlightDropZone() {
        dropZone.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            handleFileSelect({ target: fileInput });
        }
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length) {
            currentFile = files[0];
            
            // Validate file
            if (!currentFile.name.toLowerCase().endsWith('.pdf')) {
                fileInfo.innerHTML = '<span style="color: var(--error)">Please select a PDF file</span>';
                convertBtn.disabled = true;
                return;
            }
            
            // Update UI
            fileInfo.innerHTML = `
                <strong>${currentFile.name}</strong>
                <small>${formatFileSize(currentFile.size)}</small>
            `;
            
            convertBtn.disabled = false;
            hideError();
        }
    }

    async function startConversion() {
        if (!currentFile || convertBtn.disabled) return;
        
        showProgress();
        hideError();
        hideResult();
        convertBtn.disabled = true;
        
        try {
            // 1. Upload file
            updateProgress(20, "Uploading file...");
            const formData = new FormData();
            formData.append('pdf', currentFile);
            formData.append('format', document.getElementById('format').value);
            
            // 2. Call conversion API
            updateProgress(40, "Converting to Word...");
            const response = await fetch('YOUR_BACKEND_ENDPOINT', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            
            // 3. Handle response
            updateProgress(80, "Preparing download...");
            const wordBlob = await response.blob();
            createDownloadLink(wordBlob);
            
            updateProgress(100, "Conversion complete!");
            setTimeout(showResult, 500);
            
        } catch (error) {
            console.error("Conversion error:", error);
            showError(error.message || "Conversion failed. Please try again.");
            hideProgress();
        }
    }

    function createDownloadLink(blob) {
        if (convertedFileUrl) {
            URL.revokeObjectURL(convertedFileUrl);
        }
        
        convertedFileUrl = URL.createObjectURL(blob);
        const fileName = currentFile.name.replace('.pdf', '') + '.' + document.getElementById('format').value;
        
        downloadBtn.href = convertedFileUrl;
        downloadBtn.download = fileName;
        downloadBtn.onclick = null; // Remove any previous click handlers
    }

    function updateProgress(percent, message) {
        const progress = Math.min(100, Math.max(0, Math.round(percent)));
        progressFill.style.width = `${progress}%`;
        progressText.textContent = message;
    }

    function showProgress() {
        progressSection.classList.remove('hidden');
    }

    function hideProgress() {
        progressSection.classList.add('hidden');
    }

    function showResult() {
        resultSection.classList.remove('hidden');
    }

    function hideResult() {
        resultSection.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.textContent = message || 'Conversion Failed';
        errorSection.classList.remove('hidden');
    }

    function hideError() {
        errorSection.classList.add('hidden');
    }

    function resetConverter() {
        if (convertedFileUrl) {
            URL.revokeObjectURL(convertedFileUrl);
            convertedFileUrl = null;
        }
        
        fileInput.value = '';
        fileInfo.innerHTML = 'No file chosen';
        convertBtn.disabled = true;
        hideProgress();
        hideResult();
        hideError();
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Clean up when leaving page
    window.addEventListener('beforeunload', () => {
        if (convertedFileUrl) {
            URL.revokeObjectURL(convertedFileUrl);
        }
    });
});
