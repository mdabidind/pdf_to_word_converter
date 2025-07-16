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
    let conversionInProgress = false;

    // Event Listeners
    dropZone.addEventListener('click', () => fileInput.click());
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
            handleFileSelect({ target: { files } });
        }
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length) {
            currentFile = files[0];
            
            // Validate file
            if (!currentFile.name.toLowerCase().endsWith('.pdf')) {
                showError('Please select a PDF file');
                convertBtn.disabled = true;
                return;
            }
            
            // Validate file size (10MB max)
            if (currentFile.size > 10 * 1024 * 1024) {
                showError('File too large (max 10MB)');
                convertBtn.disabled = true;
                return;
            }
            
            fileInfo.innerHTML = `
                <strong>${currentFile.name}</strong><br>
                <small>${formatFileSize(currentFile.size)}</small>
            `;
            
            convertBtn.disabled = false;
            hideError();
        }
    }

    async function startConversion() {
        if (!currentFile || conversionInProgress) return;
        
        conversionInProgress = true;
        convertBtn.disabled = true;
        showProgress();
        hideError();
        hideResult();
        
        try {
            // Simulate conversion process (replace with actual API call)
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                updateProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    conversionInProgress = false;
                    showResult();
                    
                    // Set download link (in real implementation, this would be the actual file URL)
                    const format = document.getElementById('format').value;
                    const fileName = currentFile.name.replace('.pdf', '') + '.' + format;
                    downloadBtn.setAttribute('download', fileName);
                }
            }, 300);
            
        } catch (error) {
            console.error("Conversion error:", error);
            showError(error.message || "Conversion failed. Please try again.");
            conversionInProgress = false;
        }
    }

    function updateProgress(value) {
        const percent = Math.min(100, Math.max(0, Math.round(value)));
        progressFill.style.width = percent + '%';
        progressText.textContent = getProgressMessage(percent);
    }

    function getProgressMessage(percent) {
        if (percent < 30) return "Uploading your file...";
        if (percent < 70) return "Converting to Word format...";
        if (percent < 100) return "Finalizing document...";
        return "Conversion complete!";
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
        errorMessage.textContent = message;
        errorSection.classList.remove('hidden');
    }

    function hideError() {
        errorSection.classList.add('hidden');
    }

    function resetConverter() {
        currentFile = null;
        fileInput.value = '';
        fileInfo.innerHTML = '';
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
});
