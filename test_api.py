import urllib.request
import urllib.error
import json
import time

url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze'
data = json.dumps({
    'input_type': 'text',
    'content': 'Acme Corp is a B2B SaaS company that provides AI-driven analytics for the healthcare industry.'
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

print("Waiting 60 seconds for railway to deploy the new error_log changes...")
time.sleep(60)

try:
    with urllib.request.urlopen(req) as f:
        resp = json.loads(f.read().decode('utf-8'))
        print('POST returned 200/202!')
        analysis_id = resp.get('analysis_id')
        print('Got analysis_id:', analysis_id)

        for _ in range(30):
            time.sleep(5)
            status_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{analysis_id}/status'
            status_req = urllib.request.Request(status_url)
            with urllib.request.urlopen(status_req) as sf:
                status_resp = json.loads(sf.read().decode('utf-8'))
                print('Status:', status_resp.get('status'))
                if status_resp.get('status') in ['completed', 'failed']:
                    if status_resp.get('error_log'):
                        print('Error Log:', status_resp.get('error_log'))
                    else:
                        print('Full response:', status_resp)
                    break
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    print(e.read().decode('utf-8'))
