document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('pdfFile');
    const convertBtn = document.getElementById('convertBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const downloadBtn = document.getElementById('docxDownload');
    
    // Set PDF.js worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    
    convertBtn.addEventListener('click', async function() {
        if (!fileInput.files.length) {
            statusDiv.textContent = 'Please select a PDF file first';
            return;
        }
        
        statusDiv.textContent = 'Starting conversion...';
        downloadLink.style.display = 'none';
        
        try {
            const pdfFile = fileInput.files[0];
            const pdfData = await readFileAsArrayBuffer(pdfFile);
            
            // Load PDF document
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            
            // Create Word document using docx
            const doc = new docx.Document();
            const children = [];
            
            // Process each page
            for (let i = 1; i <= pdf.numPages; i++) {
                statusDiv.textContent = `Processing page ${i} of ${pdf.numPages}...`;
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                
                children.push(new docx.Paragraph({
                    children: [new docx.TextRun(pageText)],
                    spacing: { after: 200 }
                }));
            }
            
            doc.addSection({ children });
            
            // Generate Word file
            statusDiv.textContent = 'Generating Word document...';
            const docxBlob = await docx.Packer.toBlob(doc);
            
            // Create download link
            const fileName = pdfFile.name.replace(/\.pdf$/i, '') + '.docx';
            downloadBtn.href = URL.createObjectURL(docxBlob);
            downloadBtn.download = fileName;
            downloadBtn.textContent = `Download ${fileName}`;
            downloadLink.style.display = 'block';
            
            statusDiv.textContent = 'Conversion complete!';
            
        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            console.error('Conversion error:', error);
        }
    });
    
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
});
