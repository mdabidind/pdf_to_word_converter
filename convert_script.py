from pdf2docx import Converter
import os

input_path = 'input/sample.pdf'
output_path = 'output/converted_xyz.docx'

os.makedirs('output', exist_ok=True)

cv = Converter(input_path)
cv.convert(output_path)
cv.close()