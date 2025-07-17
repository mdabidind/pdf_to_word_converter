# lambda_function.py
import os
import subprocess
import boto3
from tempfile import mkdtemp

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    tmp_dir = mkdtemp()
    
    try:
        # 1. Get PDF from upload
        pdf_file = event['body']['pdf']
        pdf_path = os.path.join(tmp_dir, 'input.pdf')
        with open(pdf_path, 'wb') as f:
            f.write(pdf_file.read())
        
        # 2. Convert using LibreOffice
        output_format = event['body'].get('format', 'docx')
        subprocess.run([
            '/opt/libreoffice/program/soffice',
            '--headless',
            '--convert-to', output_format,
            '--outdir', tmp_dir,
            pdf_path
        ], check=True)
        
        # 3. Return converted file
        output_file = os.path.join(tmp_dir, 'input.' + output_format)
        with open(output_file, 'rb') as f:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': 'attachment; filename=converted.docx'
                },
                'body': f.read(),
                'isBase64Encoded': True
            }
            
    finally:
        # Clean up
        for f in os.listdir(tmp_dir):
            os.remove(os.path.join(tmp_dir, f))
        os.rmdir(tmp_dir)
