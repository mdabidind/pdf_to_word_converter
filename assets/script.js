// Verify libraries are loaded before executing
if (typeof docx === 'undefined' || typeof pdfjsLib === 'undefined') {
    document.getElementById('status').textContent = 
        'Error: Required libraries not loaded. Please refresh the page.';
    document.getElementById('convertBtn').disabled = true;
} else {
    // Initialize converter only if libraries are loaded
    document.addEventListener('DOMContentLoaded', function() {
        const fileInput = document.getElementById('pdfFile');
        const convertBtn = document.getElementById('convertBtn');
        const statusDiv = document.getElementById('status');
        const downloadLink = document.getElementById('downloadLink');
        const downloadBtn = document.getElementById('docxDownload');

        // Enable convert button when file is selected
        fileInput.addEventListener('change', function() {
            convertBtn.disabled = !this.files.length;
            if (this.files.length) {
                statusDiv.textContent = '';
            }
        });

        convertBtn.addEventListener('click', async function() {
            if (!fileInput.files.length) {
                statusDiv.textContent = 'Please select a PDF file first';
                statusDiv.style.color = '#e74c3c';
                return;
            }
            
            statusDiv.textContent = 'Starting conversion...';
            statusDiv.style.color = '#2c3e50';
            downloadLink.style.display = 'none';
            convertBtn.disabled = true;
            
            try {
                const pdfFile = fileInput.files[0];
                
                // Validate file size
                if (pdfFile.size > 10 * 1024 * 1024) {
                    throw new Error('File too large (max 10MB)');
                }
                
                // Read file
                statusDiv.textContent = 'Reading PDF file...';
                const pdfData = await readFileAsArrayBuffer(pdfFile);
                
                // Load PDF document
                statusDiv.textContent = 'Processing PDF content...';
                const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                
                // Create Word document
                const doc = new docx.Document();
                const paragraphs = [];
                
                // Process each page with progress updates
                for (let i = 1; i <= pdf.numPages; i++) {
                    statusDiv.textContent = `Processing page ${i} of ${pdf.numPages}...`;
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    
                    paragraphs.push(new docx.Paragraph({
                        children: [new docx.TextRun(pageText)],
                        spacing: { after: 200 }
                    }));
                }
                
                // Generate Word file
                statusDiv.textContent = 'Creating Word document...';
                const docxBlob = await docx.Packer.toBlob(doc);
                
                // Create download link
                const fileName = pdfFile.name.replace(/\.pdf$/i, '') + '.docx';
                downloadBtn.href = URL.createObjectURL(docxBlob);
                downloadBtn.download = fileName;
                downloadBtn.textContent = `Download ${fileName}`;
                downloadLink.style.display = 'block';
                
                statusDiv.textContent = 'Conversion complete!';
                statusDiv.style.color = '#27ae60';
                
            } catch (error) {
                statusDiv.textContent = `Error: ${error.message}`;
                statusDiv.style.color = '#e74c3c';
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
    });
}
