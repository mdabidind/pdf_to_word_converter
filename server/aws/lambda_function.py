import os
import subprocess
import boto3
from tempfile import mkdtemp
import base64

def lambda_handler(event, context):
    # Create temp directory
    tmp_dir = mkdtemp()
    
    try:
        # Get file and format from request
        file_content = base64.b64decode(event['body']['file'])
        file_format = event['body'].get('format', 'docx')
        file_name = event['body'].get('filename', 'document.pdf')
        
        # Save PDF
        pdf_path = os.path.join(tmp_dir, file_name)
        with open(pdf_path, 'wb') as f:
            f.write(file_content)
        
        # Convert using LibreOffice
        subprocess.run([
            '/opt/libreoffice/program/soffice',
            '--headless',
            '--convert-to', file_format,
            '--outdir', tmp_dir,
            pdf_path
        ], check=True)
        
        # Get converted file
        output_name = os.path.splitext(file_name)[0] + '.' + file_format
        output_path = os.path.join(tmp_dir, output_name)
        
        with open(output_path, 'rb') as f:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': f'attachment; filename="{output_name}"'
                },
                'body': base64.b64encode(f.read()).decode('utf-8'),
                'isBase64Encoded': True
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
        
    finally:
        # Clean up
        for f in os.listdir(tmp_dir):
            os.remove(os.path.join(tmp_dir, f))
        os.rmdir(tmp_dir)
