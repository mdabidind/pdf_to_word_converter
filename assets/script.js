document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('pdfFile');
    const fileDropArea = document.getElementById('fileDropArea');
    const fileName = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const progressBar = document.getElementById('progressBar');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const downloadBtn = document.getElementById('docxDownload');

    // Disable convert button initially
    convertBtn.disabled = true;

    // File selection handler
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            fileName.textContent = this.files[0].name;
            convertBtn.disabled = false;
        }
    });

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        fileDropArea.classList.add('highlight');
    }

    function unhighlight() {
        fileDropArea.classList.remove('highlight');
    }

    fileDropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        fileName.textContent = files[0].name;
        convertBtn.disabled = false;
    }

    // Conversion handler with progress tracking
    convertBtn.addEventListener('click', async function() {
        if (!fileInput.files.length) return;

        const pdfFile = fileInput.files[0];
        
        // Validate file size
        if (pdfFile.size > 10 * 1024 * 1024) {
            statusDiv.textContent = 'File too large (max 10MB)';
            statusDiv.style.color = 'var(--error)';
            return;
        }

        // UI updates
        convertBtn.disabled = true;
        btnText.textContent = 'Processing...';
        btnIcon.textContent = '⌛';
        statusDiv.textContent = 'Starting conversion...';
        statusDiv.style.color = 'var(--text)';
        downloadLink.style.display = 'none';

        try {
            // Read PDF file
            const pdfData = await readFileAsArrayBuffer(pdfFile);
            
            // Load PDF document with progress tracking
            const loadingTask = pdfjsLib.getDocument({ data: pdfData });
            
            loadingTask.onProgress = function(progressData) {
                const percent = Math.round((progressData.loaded / progressData.total) * 100);
                progressBar.style.width = `${percent}%`;
            };
            
            const pdf = await loadingTask.promise;
            
            // Create Word document
            const doc = new docx.Document();
            const paragraphs = [];
            const totalPages = pdf.numPages;
            
            // Process each page with progress updates
            for (let i = 1; i <= totalPages; i++) {
                statusDiv.textContent = `Processing page ${i} of ${totalPages}...`;
                progressBar.style.width = `${(i / totalPages) * 100}%`;
                
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join('\n');
                
                paragraphs.push(new docx.Paragraph({
                    children: [new docx.TextRun(pageText)],
                    spacing: { after: 200 }
                }));
                
                // Small delay to keep UI responsive
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Generate Word file
            statusDiv.textContent = 'Generating Word document...';
            const docxBlob = await docx.Packer.toBlob(doc);
            
            // Create download link
            const outputName = pdfFile.name.replace(/\.pdf$/i, '') + '.docx';
            const url = URL.createObjectURL(docxBlob);
            
            downloadBtn.href = url;
            downloadBtn.download = outputName;
            downloadBtn.querySelector('span').textContent = `Download ${outputName}`;
            downloadLink.style.display = 'block';
            
            // Clean up
            URL.revokeObjectURL(url);
            
            // Final UI updates
            statusDiv.textContent = 'Conversion complete!';
            statusDiv.style.color = 'var(--success)';
            btnText.textContent = 'Convert to Word';
            btnIcon.textContent = '→';
            progressBar.style.width = '0%';
            
        } catch (error) {
            console.error('Conversion error:', error);
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.style.color = 'var(--error)';
            btnText.textContent = 'Convert to Word';
            btnIcon.textContent = '→';
            progressBar.style.width = '0%';
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
