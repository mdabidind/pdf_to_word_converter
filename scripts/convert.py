import os
import pytesseract
from pdf2image import convert_from_path
from docx import Document
from PIL import Image

def convert_pdf_to_word(pdf_path, output_path):
    """Convert PDF to Word with OCR"""
    doc = Document()
    images = convert_from_path(pdf_path)
    
    for i, image in enumerate(images):
        temp_img = f"temp_page_{i}.png"
        image.save(temp_img, 'PNG')
        
        text = pytesseract.image_to_string(Image.open(temp_img))
        doc.add_paragraph(text)
        os.remove(temp_img)
    
    doc.save(output_path)

if __name__ == "__main__":
    convert_pdf_to_word("input.pdf", "output.docx")
