import urllib.request
import urllib.error
import json
import time
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def run_test(content):
    print(f"Testing: {content}")
    url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze'
    data = json.dumps({'input_type': 'text', 'content': content}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    with urllib.request.urlopen(req, context=ctx) as f:
        resp = json.loads(f.read().decode('utf-8'))
        analysis_id = resp.get('analysis_id')
        print(f"Analysis ID: {analysis_id}")
        
    for _ in range(60):
        time.sleep(5)
        status_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{analysis_id}/status'
        try:
            with urllib.request.urlopen(status_url, context=ctx) as sf:
                status_resp = json.loads(sf.read().decode('utf-8'))
                status = status_resp.get('status')
                phase = status_resp.get('current_phase')
                print(f"Status: {status} | Phase: {phase}")
                if status == 'completed':
                    print("Test Passed!")
                    return analysis_id
                elif status == 'failed':
                    print("Test Failed!")
                    print(status_resp.get('error_log'))
                    return None
        except urllib.error.HTTPError as e:
            print("HTTP Error during polling:", e.code, e.read().decode('utf-8'))
            return None
            
test_cases = [
    "AI-powered EV charging infrastructure marketplace for Eastern India",
]

for tc in test_cases:
    analysis_id = run_test(tc)
    if analysis_id:
        print("Final Report:", analysis_id)
        report_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/{analysis_id}'
        with urllib.request.urlopen(report_url, context=ctx) as rf:
            report_data = json.loads(rf.read().decode('utf-8'))
            print("Keys:", report_data.keys())
