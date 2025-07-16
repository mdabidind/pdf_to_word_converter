document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const fileInfo = document.getElementById('file-info');
    const convertBtn = document.getElementById('convert-btn');
    const progressSection = document.getElementById('progress-section');
    const resultSection = document.getElementById('result-section');
    const downloadBtn = document.getElementById('download-btn');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // State
    let currentFile = null;
    let convertedFileUrl = null;

    // Event listeners
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    convertBtn.addEventListener('click', startConversion);
    downloadBtn.addEventListener('click', downloadFile);

    // Drag and drop
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
                alert('Please select a PDF file');
                return;
            }
            
            // Update UI
            fileInfo.innerHTML = `
                <div class="file-display">
                    <strong>${currentFile.name}</strong>
                    <span>${formatFileSize(currentFile.size)}</span>
                </div>
            `;
            
            convertBtn.disabled = false;
        }
    }

    function startConversion() {
        if (!currentFile) return;
        
        // Show progress
        progressSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        convertBtn.disabled = true;
        
        // Simulate conversion (replace with actual API call)
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            updateProgress(progress);
            
            if (progress >= 100) {
                clearInterval(interval);
                completeConversion();
            }
        }, 300);
    }

    function updateProgress(percent) {
        const progress = Math.min(100, Math.max(0, Math.round(percent)));
        progressFill.style.width = `${progress}%`;
        
        if (progress < 30) {
            progressText.textContent = 'Uploading file...';
        } else if (progress < 70) {
            progressText.textContent = 'Converting to Word...';
        } else {
            progressText.textContent = 'Finalizing document...';
        }
    }

    function completeConversion() {
        progressSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        
        // Create download URL for the converted file
        const format = document.getElementById('format').value;
        const fileName = currentFile.name.replace('.pdf', `.${format}`);
        
        // In a real implementation, this would be the actual converted file
        // For demo, we'll create a dummy download
        convertedFileUrl = URL.createObjectURL(new Blob(['Dummy Word file content'], { type: 'application/msword' }));
        downloadBtn.href = convertedFileUrl;
        downloadBtn.download = fileName;
    }

    function downloadFile(e) {
        if (!convertedFileUrl) {
            e.preventDefault();
            alert('File not ready yet');
        }
        // The actual download will proceed automatically
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
