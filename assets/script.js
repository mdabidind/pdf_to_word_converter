document.getElementById('convertBtn').addEventListener('click', async function() {
    const fileInput = document.getElementById('pdfFile');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    
    if (!fileInput.files.length) {
        statusDiv.textContent = 'Please select a PDF file first';
        return;
    }
    
    statusDiv.textContent = 'Starting conversion...';
    downloadLink.style.display = 'none';
    
    try {
        // For GitHub Pages demo - actual conversion would happen via:
        // 1. GitHub Actions (for real processing)
        // 2. Or client-side library (for simple demo)
        
        // Simulate conversion delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real implementation, you would:
        // - Upload the file to your GitHub repo
        // - Trigger a workflow
        // - Wait for completion
        // - Get download link
        
        statusDiv.textContent = 'Conversion complete!';
        
        // Demo download link (would be real in actual implementation)
        const downloadBtn = document.getElementById('docxDownload');
        downloadBtn.href = URL.createObjectURL(new Blob(["Simulated Word file"], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
        downloadBtn.textContent = 'Download your_file.docx';
        downloadLink.style.display = 'block';
        
    } catch (error) {
        statusDiv.textContent = 'Error: ' + error.message;
    }
});
