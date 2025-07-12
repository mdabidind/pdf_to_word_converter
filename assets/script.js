// PDF to Word Converter - Full Browser Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements
    const fileInput = document.getElementById('pdfFile');
    const convertBtn = document.getElementById('convertBtn');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const downloadBtn = document.getElementById('docxDownload');
    
    // Set maximum file size (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    // Main conversion function
    convertBtn.addEventListener('click', async function() {
        // Reset UI
        statusDiv.textContent = '';
        statusDiv.className = '';
        downloadLink.style.display = 'none';
        
        // Validate input
        if (!fileInput.files.length) {
            showStatus('Please select a PDF file first', 'error');
            return;
        }
        
        const pdfFile = fileInput.files[0];
        
        // Check file size
        if (pdfFile.size > MAX_FILE_SIZE) {
            showStatus('File too large (max 5MB)', 'error');
            return;
        }
        
        try {
            // Show processing status
            showStatus('Loading conversion tools...', 'processing');
            
            // Load required libraries dynamically
            await Promise.all([
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/docx/7.8.2/docx.min.js')
            ]);
            
            // Initialize PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            
            // Read PDF file
            showStatus('Reading PDF file...', 'processing');
            const pdfData = await readFileAsArrayBuffer(pdfFile);
            
            // Parse PDF
            showStatus('Processing PDF content...', 'processing');
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            
            // Create Word document
            const { Document, Paragraph, TextRun, Packer } = docx;
            const doc = new Document();
            const children = [];
            
            // Process each page
            for (let i = 1; i <= pdf.numPages; i++) {
                showStatus(`Processing page ${i} of ${pdf.numPages}...`, 'processing');
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join('\n');
                
                children.push(new Paragraph({
                    children: [new TextRun(pageText)],
                    spacing: { after: 200 }
                }));
            }
            
            doc.addSection({ children });
            
            // Generate Word file
            showStatus('Creating Word document...', 'processing');
            const docxBlob = await Packer.toBlob(doc);
            
            // Create download link
            const fileName = pdfFile.name.replace(/\.pdf$/i, '') + '.docx';
            downloadBtn.href = URL.createObjectURL(docxBlob);
            downloadBtn.download = fileName;
            downloadBtn.textContent = `Download ${fileName}`;
            downloadLink.style.display = 'block';
            
            showStatus('Conversion complete!', 'success');
            
        } catch (error) {
            console.error('Conversion error:', error);
            showStatus(`Error: ${error.message}`, 'error');
        }
    });
    
    // Helper function to show status messages
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type;
    }
    
    // Helper function to load scripts dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                return resolve();
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }
    
    // Helper function to read file as ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
});
