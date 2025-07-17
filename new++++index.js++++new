// index.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

exports.convertPdfToWord = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No PDF file uploaded');
        }

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-'));
        const pdfPath = path.join(tmpDir, 'input.pdf');
        const outputFormat = req.body.format || 'docx';
        
        // Save uploaded file
        fs.writeFileSync(pdfPath, req.file.buffer);
        
        // Convert using LibreOffice
        execSync(`libreoffice --headless --convert-to ${outputFormat} --outdir ${tmpDir} ${pdfPath}`);
        
        // Send converted file
        const outputFile = path.join(tmpDir, `input.${outputFormat}`);
        res.download(outputFile, `converted.${outputFormat}`, () => {
            // Clean up
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).send('Conversion failed');
    }
};
