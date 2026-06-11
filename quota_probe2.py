import urllib.request
import urllib.error
import json
import time
import ssl
import datetime

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

print(f"Timestamp: {datetime.datetime.now().isoformat()}")

# Quota probe: submit a minimal valid analysis (min 10 chars)
url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze'
data = json.dumps({'input_type': 'text', 'content': 'Quota probe test request for checking Gemini availability'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        resp = json.loads(f.read().decode('utf-8'))
        analysis_id = resp.get('analysis_id')
        print(f"Analysis ID: {analysis_id}")
        print(f"Initial Status: {resp.get('status')}")
        
    # Wait 20s for DataAgent to attempt a single Gemini call
    print("Waiting 20s for DataAgent to call Gemini...")
    time.sleep(20)
    
    status_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{analysis_id}/status'
    with urllib.request.urlopen(status_url, context=ctx) as sf:
        status_resp = json.loads(sf.read().decode('utf-8'))
        status = status_resp.get('status')
        phase = status_resp.get('current_phase')
        error_log = status_resp.get('error_log')
        print(f"\nStatus: {status} | Phase: {phase}")
        if error_log:
            err_str = str(error_log)
            print(f"Error Log: {err_str[:500]}")
            if '429' in err_str or 'RESOURCE_EXHAUSTED' in err_str:
                print("\n>>> QUOTA STILL EXHAUSTED <<<")
            else:
                print("\n>>> FAILED FOR NON-QUOTA REASON <<<")
        elif status in ('structuring', 'analysis', 'contradictions', 'synthesis', 'scoring', 'completed'):
            print("\n>>> QUOTA IS AVAILABLE - Pipeline is progressing <<<")
        else:
            print(f"\n>>> Status: {status} - Need more time <<<")
except Exception as e:
    print(f"Error: {e}")
