from pdf2docx import Converter
import os

# Make sure input.pdf exists
input_path = 'input/sample.pdf'
output_path = 'output/converted_xyz.docx'

# Convert PDF to Word
cv = Converter(input_path)
cv.convert(output_path)
cv.close()
