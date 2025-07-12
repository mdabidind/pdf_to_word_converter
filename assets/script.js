// Main conversion function with robust error handling
function setupConverter() {
    const fileInput = document.getElementById('pdfFile');
    const convertBtn = document.getElementById('convertBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const downloadBtn = document.getElementById('docxDownload');

    // File selection handler
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            document.getElementById('fileNameDisplay').textContent = this.files[0].name;
            convertBtn.disabled = false;
            statusDiv.textContent = '';
        }
    });

    // Conversion handler with proper error catching
    convertBtn.addEventListener('click', async function() {
        if (!fileInput.files || !fileInput.files.length) {
            showStatus('Please select a PDF file first', 'error');
            return;
        }

        const pdfFile = fileInput.files[0];
        
        try {
            // Validate file
            if (pdfFile.size > 10 * 1024 * 1024) {
                throw new Error('File too large (max 10MB)');
            }
            if (!pdfFile.type.includes('pdf') && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
                throw new Error('Please select a PDF file');
            }

            showStatus('Starting conversion...', 'info');
            convertBtn.disabled = true;
            downloadLink.style.display = 'none';

            // Read file
            const pdfData = await readFileAsArrayBuffer(pdfFile);
            
            // Process PDF
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
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
            const objectUrl = URL.createObjectURL(docxBlob);
            
            downloadBtn.onclick = function() {
                setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
            };
            downloadBtn.href = objectUrl;
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

    // Helper functions
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
        statusDiv.className = type || 'info';
    }
}

// Initialize when libraries are ready
if (typeof docx !== 'undefined' && typeof pdfjsLib !== 'undefined') {
    document.addEventListener('DOMContentLoaded', setupConverter);
} else {
    document.getElementById('status').textContent = 
        'Error: Conversion libraries not loaded. Please refresh the page.';
}
