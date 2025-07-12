document.getElementById('convertBtn').addEventListener('click', async function() {
    const fileInput = document.getElementById('pdfFile');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    
    if (!fileInput.files.length) {
        statusDiv.textContent = 'Please select a PDF file first';
        return;
    }
    
    statusDiv.textContent = 'Processing PDF...';
    downloadLink.style.display = 'none';
    
    try {
        // Load required libraries dynamically
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/docx/7.8.2/docx.min.js');
        
        // Get the PDF file
        const pdfFile = fileInput.files[0];
        const pdfData = await readFileAsArrayBuffer(pdfFile);
        
        // Initialize PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument(pdfData).promise;
        
        // Create Word document
        const { Document, Paragraph, TextRun, Packer } = docx;
        const doc = new Document();
        const children = [];
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
            statusDiv.textContent = `Processing page ${i} of ${pdf.numPages}...`;
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ');
            
            children.push(new Paragraph({
                children: [new TextRun(text)],
                spacing: { after: 200 }
            }));
        }
        
        doc.addSection({ children });
        
        // Generate Word file
        statusDiv.textContent = 'Generating Word document...';
        const docxBlob = await Packer.toBlob(doc);
        
        // Create download link
        const downloadBtn = document.getElementById('docxDownload');
        const fileName = pdfFile.name.replace('.pdf', '') + '.docx';
        downloadBtn.href = URL.createObjectURL(docxBlob);
        downloadBtn.download = fileName;
        downloadBtn.textContent = `Download ${fileName}`;
        downloadLink.style.display = 'block';
        
        statusDiv.textContent = 'Conversion complete!';
        
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        console.error(error);
    }
});

// Helper function to load scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Helper function to read file as ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
