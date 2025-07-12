// Debugging: Check if script is loaded
console.log('Main script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    const fileInput = document.getElementById('pdfFile');
    const convertBtn = document.getElementById('convertBtn');
    const statusDiv = document.getElementById('status');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    // Debug: Verify elements exist
    console.log('File input:', fileInput);
    console.log('Convert button:', convertBtn);

    // File selection handler
    fileInput.addEventListener('change', function() {
        console.log('File input changed');
        
        if (this.files && this.files.length > 0) {
            console.log('File selected:', this.files[0].name);
            
            // Display file name
            fileNameDisplay.textContent = this.files[0].name;
            
            // Enable convert button
            convertBtn.disabled = false;
            console.log('Convert button enabled:', convertBtn.disabled);
            
            // Clear any previous status
            statusDiv.textContent = '';
        } else {
            convertBtn.disabled = true;
            console.log('No file selected, button disabled');
        }
    });

    // Conversion handler
    convertBtn.addEventListener('click', async function() {
        console.log('Convert button clicked');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            showStatus('Please select a PDF file first', 'error');
            return;
        }

        const pdfFile = fileInput.files[0];
        console.log('Starting conversion for:', pdfFile.name);
        
        try {
            // Start conversion
            showStatus('Converting...', 'info');
            convertBtn.disabled = true;
            
            // Read and process the PDF
            const pdfData = await readFileAsArrayBuffer(pdfFile);
            console.log('PDF data loaded');
            
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            console.log('PDF document loaded, pages:', pdf.numPages);
            
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
            console.log('Conversion completed successfully');
            
        } catch (error) {
            console.error('Conversion error:', error);
            showStatus(`Error: ${error.message}`, 'error');
        } finally {
            convertBtn.disabled = false;
            console.log('Convert button re-enabled');
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
        downloadBtn.textContent = `Download ${fileName}`;
        downloadLink.style.display = 'block';
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type;
    }
});
