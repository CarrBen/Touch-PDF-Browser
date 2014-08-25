#Runs on Python 2.7.8
import os
import os.path
import json
import calendar

JPG_DIR = "C:/RealDocs/Web/Touch_PDF_Browser/JPGs"
#This assumes English locale
MONTHS = calendar.month_name[1:]
MONTHS_DICT = {mon[:3].lower():mon for mon in MONTHS}

for path, dir, files in os.walk(JPG_DIR):
    #If there are no files (only directories)
    #Or the only file present is expected (index.json or names.json)
    if len(files) == 1:
        if 'index.json' in files[0]:
            #Assume the index.json has already been created manually
            continue
        if 'names.json' in files[0]:
            for d in dir:
                print(d)
    if len(files) == 0 and len(dir) > 0:
        index_dict = {'data':[]}
        try:
            #If this succeeds assume the the directory is a year
            int(dir[0])
            id = 'year_id'
        except ValueError:
            #Otherwise its a month
            id = 'month_id'
        for d in dir:
            item_dict = {}
            item_dict[id] = d
            if 'month' in id:
                item_dict['name'] = MONTHS_DICT[d]
            index_dict['data'].append(item_dict)
        print(index_dict)
            
        
        
        

            
