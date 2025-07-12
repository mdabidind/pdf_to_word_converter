# pdf_to_word_converter
# PDF to Word Converter (GitHub Version)

Converts PDFs to Word documents using GitHub Actions.

## How to Use

1. Upload your PDF to any public URL
2. Go to Actions tab in this repository
3. Run the "PDF to Word Converter" workflow
4. Enter the PDF URL when prompted
5. Download the converted file from artifacts

## Limitations

- GitHub Actions has a 6-hour maximum runtime
- Free accounts have 2000 minutes/month
- PDF must be publicly accessible
- Max 10MB file size (GitHub artifact limit)

## Advanced Setup

For automatic browser uploads:

1. Create a GitHub Personal Access Token
2. Set up a serverless function to:
   - Accept file uploads
   - Push to GitHub repo
   - Trigger workflow
   - Return download link
