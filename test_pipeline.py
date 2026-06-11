import urllib.request
import urllib.error
import json
import time
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze'
data = json.dumps({
    'input_type': 'text',
    'content': 'OpenAI is an AI research and deployment company.'
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

print("Waiting 120 seconds for railway to deploy the bugfix...")
time.sleep(120)

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        resp = json.loads(f.read().decode('utf-8'))
        print('POST returned 200!')
        analysis_id = resp.get('analysis_id')
        print('Got analysis_id:', analysis_id)

        print('Polling for status...')
        for _ in range(40):
            time.sleep(5)
            status_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{analysis_id}/status'
            status_req = urllib.request.Request(status_url)
            with urllib.request.urlopen(status_req, context=ctx) as sf:
                status_resp = json.loads(sf.read().decode('utf-8'))
                print('Status:', status_resp.get('status'), '| Phase:', status_resp.get('current_phase'))
                if status_resp.get('status') == 'completed':
                    print('Pipeline completed successfully!')
                    break
                elif status_resp.get('status') == 'failed':
                    print('Pipeline failed again. Error Log:', status_resp.get('error_log'))
                    break
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    print(e.read().decode('utf-8'))
