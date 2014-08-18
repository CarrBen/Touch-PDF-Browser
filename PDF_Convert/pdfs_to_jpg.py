#Runs on Python 2.7.8, ImageMagick convert.exe on the System PATH
#and Ghostscript with the bin and lib on the system path
OUTPUT_DIR = "C:/RealDocs/Web/Touch_PDF_Browser/JPGs"
INPUT_DIR = "C:/RealDocs/Web/Touch_PDF_Browser/PDFs"

IMAGE_MAGICK_PATH = "C:\Program Files\ImageMagick-6.8.9-Q16"

JPG_QUALITY = 80
CONVERT_CMD = "%s -density 300 -quality %d \"%s\" \"%s\""

import subprocess
import os
import os.path

CONVERT = os.path.join(IMAGE_MAGICK_PATH, "convert.exe")
STARTUP_INFO = subprocess.STARTUPINFO()
STARTUP_INFO.dwFlags |= subprocess.STARTF_USESHOWWINDOW

PDFs = os.walk(INPUT_DIR)
os.chdir(OUTPUT_DIR)

for path, dir, files in PDFs:
    if len(files) == 0:
        continue
    if 'Image' in os.path.split(path)[1]:
        continue
    pdf_in = os.path.join(path, files[0])
    jpg_out = os.path.join(OUTPUT_DIR, os.path.split(path)[1],
                           files[0].replace('.pdf', '.jpg'))

    if not os.path.isdir(os.path.split(path)[1]):
        os.mkdir(os.path.split(path)[1])
    os.chdir(os.path.split(path)[1])

    print("Processing %s" % files[0])
    subprocess.call(CONVERT_CMD % (CONVERT, JPG_QUALITY, pdf_in, jpg_out),
                    startupinfo=STARTUP_INFO)
    os.chdir('..')
