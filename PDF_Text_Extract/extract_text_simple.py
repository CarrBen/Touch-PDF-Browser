import subprocess
import os

activate_this = 'Scripts\\activate_this.py'
exec(open(activate_this).read(), dict(__file__=activate_this))

try:
    subprocess.check_output('Scripts\\python Scripts\\pdf2txt.py',
                            stderr=subprocess.STDOUT)
except subprocess.CalledProcessError as e:
    print(e.output.decode())
