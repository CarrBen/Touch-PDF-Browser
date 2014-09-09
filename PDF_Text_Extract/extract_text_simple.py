PDF_PATH = '..\\PDFs_Sorted'
SOLR_UPDATE_ROOT = 'http://127.0.0.1:8983/solr/update'

import subprocess
import os
import json
import urllib.parse
import urllib.request

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

def process_pdf(PDF):
    p = count_pages(PDF)
    split_path = PDF
    split_path, issue_name = os.path.split(split_path)
    issue_name = issue_name.replace('.pdf','')
    split_path, month = os.path.split(split_path)
    split_path, year = os.path.split(split_path)
    split_path, pub = os.path.split(split_path)
    print(issue_name,month,year,pub)
    return
    for page in p:
        record = {}
        record['pub_id'] = pub
        record['issue_name'] = issue_name
        record['issue_id'] = record['issue_name'] + "-%d" % page
        record['year'] = int(year)
        record['month'] = month
        record['page'] = page
        record['text'] = extract_page(PDF, page+1)
        print(record)
        post_json = json.dumps([record]).encode()
        print(post_json[:500])
        post_url = SOLR_UPDATE_ROOT + "/json?commit=true"
        post_req = urllib.request.Request(post_url, post_json, {'Content-type':'text/json'})
        urllib.request.urlopen(post_req)

pdf_dirs = os.walk(PDF_PATH)
for path, dirs, files in pdf_dirs:
    for file in files:
        if '.json' not in file:
            process_pdf(os.path.join(os.path.abspath(path), file))
