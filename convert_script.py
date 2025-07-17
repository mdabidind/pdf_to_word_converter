from pdf2docx import Converter
import os

input_folder = 'input'
output_folder = 'output'

os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.endswith('.pdf'):
        input_path = os.path.join(input_folder, filename)
        output_filename = filename.replace('.pdf', '.docx')
        output_path = os.path.join(output_folder, output_filename)

        cv = Converter(input_path)
        cv.convert(output_path)
        cv.close()

print("Conversion completed.")
