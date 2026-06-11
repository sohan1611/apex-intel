import urllib.request
import urllib.error
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/4f2c2700-0b95-4b8f-be67-bc06789010ab'
req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        resp = json.loads(f.read().decode('utf-8'))
        print("Status:", resp.get("status"))
        print("Keys in response:", list(resp.keys()))
        print("Score:", resp.get("score"))
        print("Red flags:", resp.get("red_flags"))
        print("Competitors:", len(resp.get("competitors", [])))
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    print(e.read().decode('utf-8'))
