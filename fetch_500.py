import urllib.request
import urllib.error
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/63662a5e-d497-4855-a9b7-dc8d4aec01ae/status'
req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        print(f.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print('Error:', e)
