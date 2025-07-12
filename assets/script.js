document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const fileInput = document.getElementById('pdfFile');
    const fileInputLabel = document.getElementById('fileInputLabel');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const convertBtn = document.getElementById('convertBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const downloadBtn = document.getElementById('docxDownload');

    // File selection handler
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            const file = this.files[0];
            fileNameDisplay.textContent = file.name;
            convertBtn.disabled = false;
            statusDiv.textContent = '';
        }
    });

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileInputLabel.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        fileInputLabel.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileInputLabel.addEventListener(eventName, unhighlight, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        fileInputLabel.style.background = '#e1f0fa';
        fileInputLabel.style.borderColor = '#2980b9';
    }

    function unhighlight() {
        fileInputLabel.style.background = '#f8f9fa';
        fileInputLabel.style.borderColor = '#3498db';
    }

    fileInputLabel.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            fileNameDisplay.textContent = files[0].name;
            convertBtn.disabled = false;
            statusDiv.textContent = '';
        }
    });

    // Conversion handler
    convertBtn.addEventListener('click', async function() {
        if (!fileInput.files.length) {
            showStatus('Please select a PDF file first', 'error');
            return;
        }

        const pdfFile = fileInput.files[0];
        
        // Validate file size
        if (pdfFile.size > 10 * 1024 * 1024) {
            showStatus('File too large (max 10MB)', 'error');
            return;
        }

        showStatus('Starting conversion...', 'info');
        downloadLink.style.display = 'none';
        convertBtn.disabled = true;

        try {
            // Read PDF file
            showStatus('Reading PDF...', 'info');
            const pdfData = await readFileAsArrayBuffer(pdfFile);
            
            // Process PDF
            showStatus('Processing content...', 'info');
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            
            // Create Word document
            const doc = new docx.Document();
            const paragraphs = [];
            
            for (let i = 1; i <= pdf.numPages; i++) {
                showStatus(`Processing page ${i}/${pdf.numPages}`, 'info');
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join('\n');
                
                paragraphs.push(new docx.Paragraph({
                    children: [new docx.TextRun(pageText)],
                    spacing: { after: 200 }
                }));
            }
            
            // Generate Word file
            showStatus('Creating Word document...', 'info');
            const docxBlob = await docx.Packer.toBlob(doc);
            
            // Create download
            const fileName = pdfFile.name.replace(/\.pdf$/i, '') + '.docx';
            downloadBtn.href = URL.createObjectURL(docxBlob);
            downloadBtn.download = fileName;
            downloadBtn.querySelector('span').textContent = `Download ${fileName}`;
            downloadLink.style.display = 'flex';
            
            showStatus('Conversion complete!', 'success');
            
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
            console.error('Conversion error:', error);
        } finally {
            convertBtn.disabled = false;
        }
    });

    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type;
    }
});
