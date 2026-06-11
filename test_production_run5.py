import urllib.request
import urllib.error
import json
import time
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze'
data = json.dumps({'input_type': 'text', 'content': 'B2B healthcare analytics SaaS'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

print("Sleeping 120s for Railway deploy...")
time.sleep(120)

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        resp = json.loads(f.read().decode('utf-8'))
        analysis_id = resp.get('analysis_id')
        print(f"Analysis ID: {analysis_id}")
        
    for _ in range(60):
        time.sleep(5)
        status_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{analysis_id}/status'
        with urllib.request.urlopen(status_url, context=ctx) as sf:
            status_resp = json.loads(sf.read().decode('utf-8'))
            status = status_resp.get('status')
            phase = status_resp.get('current_phase')
            print(f"Status: {status} | Phase: {phase}")
            if status == 'completed':
                print("Test Passed!")
                break
            elif status == 'failed':
                print("Test Failed!")
                print(status_resp.get('error_log'))
                break
except Exception as e:
    print("Error:", e)
