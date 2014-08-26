#Runs on Python 2.7.8
import os
import os.path
import json
import calendar

JPG_DIR = "C:/RealDocs/Web/Touch_PDF_Browser/JPGs"
#This assumes English locale
MONTHS = calendar.month_name[1:]
MONTHS_DICT = {mon[:3].lower():mon for mon in MONTHS}

#Clean old auto generated index files
for path, dir, files in os.walk(JPG_DIR):
    remove = False
    if len(files) > 0:
        if 'index.json' in files:
            with open(os.path.join(path, 'index.json'), 'r') as f:
                data = json.load(f)
                try:
                    if data['_auto_generated']:
                        remove = True
                except:
                    pass
                
            if remove:
                print('Removing %s' % os.path.join(path, 'index.json'))
                os.remove(os.path.join(path, 'index.json'))

#Write new index files
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
            #Otherwise its either a month or issue
            if len(dir[0]) == 3:
                id = 'month_id'
            else:
                id = 'issue_id'
                
        for d in dir:
            item_dict = {}
            if 'year' in id:
                item_dict[id] = int(d)
                
            if 'month' in id:
                item_dict[id] = d
                item_dict['name'] = MONTHS_DICT[d]
                
            if 'issue' in id:
                item_dict[id] = d.split('_')[-1]
                item_dict['name'] = d.replace('_',' ')
            index_dict['data'].append(item_dict)
            
        with open(os.path.join(path, 'index.json'), 'w') as f:
            index_dict['_auto_generated'] = True
            json.dump(index_dict, f, indent=4)


    if len(dir) == 0 and len(files) > 0:
        #We are doing the pages of an issue
        index_dict = {'data':[]}
        count = len(files)
        for i, img in enumerate(files):
            item_dict = {}
            item_dict['src'] = os.path.join(os.path.relpath(path, JPG_DIR),
                                            img)
            item_dict['page_id'] = i
            if i < count - 1:
                item_dict['next_page'] = i + 1
            else:
                item_dict['next_page'] = None

            if i > 0:
                item_dict['prev_page'] = i - 1
            else:
                item_dict['prev_page'] = None
            index_dict['data'].append(item_dict)
                
        with open(os.path.join(path, 'index.json'), 'w') as f:
            f.write('//Auto generated\n')
            json.dump(index_dict, f, indent=4)
        
        

            
