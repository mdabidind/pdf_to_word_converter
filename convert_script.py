from pdf2docx import Converter
import os

input_pdf = 'input.pdf'
output_docx = 'output/converted_xyz.docx'

os.makedirs('output', exist_ok=True)

cv = Converter(input_pdf)
cv.convert(output_docx, start=0, end=None)
cv.close()
