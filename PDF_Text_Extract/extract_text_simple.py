PDF_PATH = '..\\PDFs_Sorted'
SOLR_UPDATE_ROOT = 'http://127.0.0.1:8983/solr/update'

import subprocess
import os

activate_this = 'Scripts\\activate_this.py'
exec(open(activate_this).read(), dict(__file__=activate_this))

def count_pages(pdf_path):
    identify = subprocess.check_output('identify -density 4 "%s"' % pdf_path,
                                       stderr=subprocess.STDOUT)
    pages = []
    for line in identify.decode().split('\n'):
        try:
            i = int(line[line.find('[')+1:line.find(']')])
            pages.append(i)
        except:
            pass
    return pages
    
def extract_page(pdf_path, pageno):
    base_cmd = 'Scripts\\python Scripts\\pdf2txt.py -p %d "%s"'
    try:
        text = subprocess.check_output(base_cmd % (pageno, pdf_path),
                                stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        print(e.output.decode())
        return
    return text.decode()

PDF = 'C:\\RealDocs\\Web\\Touch_PDF_Browser\\PDFs_Sorted\\jog\\1966\\feb\\John O Gauntlet 13.pdf'
p = count_pages(PDF)
for page in p:
    print(extract_page(PDF, page+1))
