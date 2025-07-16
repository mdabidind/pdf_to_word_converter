document.addEventListener('DOMContentLoaded', () => {
    // Initialize all elements
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const fileInfo = document.getElementById('file-info');
    const convertBtn = document.getElementById('convert-btn');
    const progressSection = document.getElementById('progress-section');
    const resultSection = document.getElementById('result-section');
    const errorSection = document.getElementById('error-section');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.getElementById('progress-text');
    const downloadBtn = document.getElementById('download-btn');
    const retryBtn = document.getElementById('retry-btn');
    
    // Ensure all status sections are hidden initially
    progressSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    
    // File selection handlers
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Conversion button handler
    convertBtn.addEventListener('click', startConversion);
    
    // Retry button handler
    retryBtn.addEventListener('click', resetConverter);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropZone.classList.add('highlight');
    }
    
    function unhighlight() {
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
            const file = files[0];
            
            // Validate file
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                showError('Please select a PDF file');
                return;
            }
            
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                showError('File too large (max 10MB)');
                return;
            }
            
            // Display file info
            fileInfo.innerHTML = `
                <strong>${file.name}</strong><br>
                <small>${formatFileSize(file.size)}</small>
            `;
            
            // Enable convert button
            convertBtn.disabled = false;
            
            // Clear any previous errors
            hideError();
        }
    }
    
    function startConversion() {
        if (convertBtn.disabled) return;
        
        // Show progress, hide other sections
        progressSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        
        // Simulate conversion (replace with actual API call)
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            updateProgress(progress);
            
            if (progress >= 100) {
                clearInterval(interval);
                showResult();
            }
        }, 300);
    }
    
    function updateProgress(percent) {
        const progress = Math.min(100, Math.max(0, Math.round(percent)));
        progressFill.style.width = `${progress}%`;
        
        // Update progress text based on stage
        if (progress < 30) {
            progressText.textContent = 'Uploading your file...';
        } else if (progress < 70) {
            progressText.textContent = 'Converting to Word format...';
        } else if (progress < 100) {
            progressText.textContent = 'Finalizing document...';
        } else {
            progressText.textContent = 'Conversion complete!';
        }
    }
    
    function showResult() {
        progressSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        
        // Set download link (in real implementation, this would be the actual file URL)
        const format = document.getElementById('format').value;
        const fileName = fileInput.files[0].name.replace('.pdf', '') + '.' + format;
        downloadBtn.setAttribute('download', fileName);
    }
    
    function showError(message) {
        errorSection.classList.remove('hidden');
        errorSection.querySelector('h3').textContent = message || 'Conversion Failed';
        convertBtn.disabled = true;
    }
    
    function hideError() {
        errorSection.classList.add('hidden');
    }
    
    function resetConverter() {
        fileInput.value = '';
        fileInfo.innerHTML = '';
        convertBtn.disabled = true;
        progressSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
