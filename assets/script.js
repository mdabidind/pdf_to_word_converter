document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('pdfFile');
    const convertBtn = document.getElementById('convertBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const downloadBtn = document.getElementById('docxDownload');

    // Enable convert button when file is selected
    fileInput.addEventListener('change', function() {
        convertBtn.disabled = !this.files.length;
    });

    convertBtn.addEventListener('click', async function() {
        if (!fileInput.files.length) {
            statusDiv.textContent = 'Please select a PDF file first';
            return;
        }
        
        statusDiv.textContent = 'Starting conversion...';
        downloadLink.style.display = 'none';
        convertBtn.disabled = true;
        
        try {
            // Verify libraries are loaded
            if (typeof docx === 'undefined') {
                throw new Error('Word conversion library not loaded');
            }
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF library not loaded');
            }

            const pdfFile = fileInput.files[0];
            const pdfData = await readFileAsArrayBuffer(pdfFile);
            
            // Load PDF document
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            
            // Create Word document
            const doc = new docx.Document();
            const paragraphs = [];
            
            // Process each page
            for (let i = 1; i <= pdf.numPages; i++) {
                statusDiv.textContent = `Processing page ${i} of ${pdf.numPages}...`;
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join('\n');
                
                paragraphs.push(new docx.Paragraph({
                    children: [new docx.TextRun(pageText)],
                    spacing: { after: 200 }
                }));
            }
            
            doc.addSection({ children: paragraphs });
            
            // Generate Word file
            statusDiv.textContent = 'Generating Word document...';
            const docxBlob = await docx.Packer.toBlob(doc);
            
            // Create download link
            const fileName = pdfFile.name.replace(/\.pdf$/i, '') + '.docx';
            const url = URL.createObjectURL(docxBlob);
            downloadBtn.href = url;
            downloadBtn.download = fileName;
            downloadBtn.textContent = `Download ${fileName}`;
            downloadLink.style.display = 'block';
            
            statusDiv.textContent = 'Conversion complete!';
            
            // Clean up memory when download link is clicked
            downloadBtn.addEventListener('click', function() {
                setTimeout(() => URL.revokeObjectURL(url), 100);
            });
            
        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
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
