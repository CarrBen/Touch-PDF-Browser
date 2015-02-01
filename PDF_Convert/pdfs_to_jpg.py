#Runs on Python 3.4.1, may run on 2.7.8,
#ImageMagick convert.exe on the System PATH
#and Ghostscript with the bin and lib on the system path
#OUTPUT_DIR = "C:/RealDocs/Web/Touch_PDF_Browser/JPGs"
OUTPUT_DIR = "D:/Touch_PDF_Browser/JPGs"
#OUTPUT_DIR = "C:/RealDocs/Web/Touch_PDF_Browser/demo/JPGs"
#INPUT_DIR = "C:/RealDocs/Web/Touch_PDF_Browser/PDFs_Sorted/carol"
INPUT_DIR = "D:/Touch_PDF_Browser/PDFs_Sorted/carol"

IMAGE_MAGICK_PATH = "C:\Program Files\ImageMagick-6.8.9-Q16"

JPG_QUALITY = 95
CONVERT_CMD = "%s -density 300 -quality %d \"%s\" \"%s\""

import subprocess
import os
import os.path

CONVERT = os.path.join(IMAGE_MAGICK_PATH, "convert.exe")
STARTUP_INFO = subprocess.STARTUPINFO()
STARTUP_INFO.dwFlags |= subprocess.STARTF_USESHOWWINDOW

PDFs = os.walk(INPUT_DIR)
os.chdir(OUTPUT_DIR)

PDF_List = []
for path, dir, files in PDFs:
    PDF_List.append((path, dir, files))

def convert_pdf(triplet):
    path, dir, files = triplet
    if len(files) == 0:
        return
    if 'Image' in os.path.split(path)[1]:
        return
    for file in files:
        if '.pdf' not in file[-5:]:
            return
        pdf_in = os.path.join(path, file)
        relpath = os.path.relpath(path, INPUT_DIR)
        issue_name = file.replace('.pdf', '')
        relpath = os.path.join(relpath, issue_name.replace(' ','_'))
        jpg_out = os.path.join(OUTPUT_DIR, relpath,
                               '%d.jpg')

        #The directory we want to put the JPGs in
        needed_dir = os.path.join(OUTPUT_DIR, relpath)
        #The directory we need to create next, this may be above the needed_dir
        current_needed_dir = needed_dir
        while not os.path.isdir(needed_dir):
            try:
                #Try and make the current_needed_dir and if we manage...
                os.mkdir(current_needed_dir)
                #Set the current_needed_dir to the needed_dir and try that
                current_needed_dir = needed_dir
            except:
                #If we fail, its probably a windows error that means we need to
                #create directories that come above the needed dir
                current_needed_dir = os.path.split(current_needed_dir)[0]
                
        os.chdir(os.path.join(OUTPUT_DIR, relpath))

        print("Processing %s" % file)
        subprocess.call(CONVERT_CMD % (CONVERT, JPG_QUALITY, pdf_in, jpg_out),
                        startupinfo=STARTUP_INFO)
        os.chdir(OUTPUT_DIR)

if __name__ == '__main__':
    from multiprocessing import Pool
    p = Pool(8)
    p.map(convert_pdf, PDF_List)
