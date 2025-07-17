# PDF to Word Converter Setup

## Frontend Deployment
1. Upload these files to your web server:
   - `index.html`
   - `assets/style.css`
   - `assets/script.js`

2. Update the API endpoint in `script.js` (uncomment your chosen provider)

## Backend Setup

### AWS Lambda
1. Create Lambda function with Python 3.8+
2. Add LibreOffice layer: `arn:aws:lambda:us-east-1:764866452798:layer:libreoffice:1`
3. Set timeout to 2 minutes
4. Add API Gateway trigger
5. Deploy `lambda_function.py`

### Google Cloud Functions
1. Install gcloud CLI
2. Run:
   ```bash
   gcloud functions deploy convertPdfToWord \
     --runtime nodejs14 \
     --trigger-http \
     --allow-unauthenticated \
     --memory=2GB \
     --timeout=540s \
     --source=server/google-cloud
