// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('pdfFile');
    const convertBtn = document.getElementById('convertBtn');
    const statusDiv = document.getElementById('status');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    // File selection handler
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            // Display file name
            fileNameDisplay.textContent = this.files[0].name;
            
            // Enable convert button
            convertBtn.disabled = false;
            
            // Clear any previous status
            statusDiv.textContent = '';
            
            console.log('File selected, convert button enabled'); // Debug log
        } else {
            convertBtn.disabled = true;
        }
    });

    // Conversion handler
    convertBtn.addEventListener('click', async function() {
        if (!fileInput.files || fileInput.files.length === 0) {
            showStatus('Please select a PDF file first', 'error');
            return;
        }

        const pdfFile = fileInput.files[0];
        
        try {
            // Start conversion
            showStatus('Converting...', 'info');
            convertBtn.disabled = true;
            
            // Read and process the PDF
            const pdfData = await readFileAsArrayBuffer(pdfFile);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            
            // Create Word document
            const doc = new docx.Document();
            const paragraphs = [];
            
            for (let i = 1; i <= pdf.numPages; i++) {
                showStatus(`Processing page ${i} of ${pdf.numPages}`, 'info');
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join('\n');
                
                paragraphs.push(new docx.Paragraph({
                    children: [new docx.TextRun(pageText)],
                    spacing: { after: 200 }
                }));
            }
            
            // Generate and download Word file
            const docxBlob = await docx.Packer.toBlob(doc);
            createDownloadLink(pdfFile.name, docxBlob);
            
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

    function createDownloadLink(originalName, blob) {
        const downloadLink = document.getElementById('downloadLink');
        const downloadBtn = document.getElementById('docxDownload');
        const fileName = originalName.replace(/\.pdf$/i, '') + '.docx';
        const url = URL.createObjectURL(blob);
        
        downloadBtn.onclick = function() {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        };
        downloadBtn.href = url;
        downloadBtn.download = fileName;
        downloadBtn.querySelector('span').textContent = `Download ${fileName}`;
        downloadLink.style.display = 'flex';
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type;
    }
});
