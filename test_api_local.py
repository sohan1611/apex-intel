import urllib.request
import urllib.error
import json
import time

url = 'http://127.0.0.1:8000/api/v1/analyze'
data = json.dumps({
    'input_type': 'text',
    'content': 'Acme Corp is a B2B SaaS company that provides AI-driven analytics for the healthcare industry.'
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as f:
        resp = json.loads(f.read().decode('utf-8'))
        print('POST returned 200/202!')
        print('Response:', resp)
        analysis_id = resp.get('analysis_id')
        print('Got analysis_id:', analysis_id)

        for _ in range(30):
            time.sleep(2)
            status_url = f'http://127.0.0.1:8000/api/v1/analyze/{analysis_id}/status'
            status_req = urllib.request.Request(status_url)
            with urllib.request.urlopen(status_req) as sf:
                status_resp = json.loads(sf.read().decode('utf-8'))
                print('Status:', status_resp)
                if status_resp.get('status') in ['completed', 'failed']:
                    break
except urllib.error.URLError as e:
    print('URL Error:', e)
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    print(e.read().decode('utf-8'))
