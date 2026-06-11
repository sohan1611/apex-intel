import urllib.request
import urllib.error
import time
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

time.sleep(20)

url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/4f2c2700-0b95-4b8f-be67-bc06789010ab'
req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        print(f.read().decode('utf-8')[:500])
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print('Error:', e)
