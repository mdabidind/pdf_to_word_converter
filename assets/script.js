document.addEventListener('DOMContentLoaded', () => {
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

    let currentFile = null;

    fileInput.addEventListener('change', handleFileSelect);
    convertBtn.addEventListener('click', simulateConversion);
    retryBtn.addEventListener('click', resetConverter);

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
            if (!currentFile.name.toLowerCase().endsWith('.pdf')) {
                fileInfo.innerHTML = '<span style="color: var(--error)">Please select a PDF file</span>';
                convertBtn.disabled = true;
                return;
            }
            fileInfo.innerHTML = `<strong>${currentFile.name}</strong><small>${formatFileSize(currentFile.size)}</small>`;
            convertBtn.disabled = false;
            hideError();
        }
    }

    function simulateConversion() {
        if (!currentFile) return;
        showProgress();
        hideError();
        hideResult();
        convertBtn.disabled = true;

        updateProgress(30, "Simulating conversion...");
        setTimeout(() => {
            updateProgress(60, "Almost ready...");
            setTimeout(() => {
                updateProgress(100, "Conversion complete!");

                const baseName = currentFile.name.replace(/\.pdf$/i, '');
                const format = document.getElementById('format').value || 'docx';
                const fileName = `${baseName}.${format}`;
                const ghPageUrl = `https://mdabidind.github.io/pdf_to_word_converter/output/${fileName}`;

                downloadBtn.href = ghPageUrl;
                downloadBtn.download = fileName;
                downloadBtn.onclick = null;

                showResult();
            }, 1000);
        }, 1000);
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
});
