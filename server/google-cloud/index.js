const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

exports.convertPdfToWord = async (req, res) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-'));
    
    try {
        if (!req.body || !req.body.file) {
            return res.status(400).send('No PDF file uploaded');
        }

        const fileContent = Buffer.from(req.body.file, 'base64');
        const format = req.body.format || 'docx';
        const fileName = req.body.filename || 'document.pdf';
        const pdfPath = path.join(tmpDir, fileName);
        
        // Save uploaded file
        fs.writeFileSync(pdfPath, fileContent);
        
        // Convert using LibreOffice
        execSync(`/usr/bin/libreoffice --headless --convert-to ${format} --outdir ${tmpDir} ${pdfPath}`);
        
        // Send converted file
        const outputName = path.parse(fileName).name + '.' + format;
        const outputPath = path.join(tmpDir, outputName);
        
        res.download(outputPath, outputName, (err) => {
            // Clean up
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).send('Conversion failed');
        
        // Clean up on error
        if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    }
};
