import urllib.request
import urllib.error
import json
import ssl
import datetime

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

print(f"Timestamp: {datetime.datetime.now().isoformat()}")

# Step 1: Verify backend health
print("\n--- Backend Health Check ---")
try:
    with urllib.request.urlopen('https://apex-intel-production-ae8f.up.railway.app/health', context=ctx) as f:
        print(f"Health: {f.read().decode('utf-8')}")
except Exception as e:
    print(f"Health check failed: {e}")

# Step 2: Minimal Gemini quota probe via a tiny analyze request
# We use the production /api/v1/analyze endpoint with minimal text
# and then immediately check the status to see if we get past structuring
print("\n--- Minimal Gemini Quota Probe ---")
print("Submitting minimal analysis request...")
url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze'
data = json.dumps({'input_type': 'text', 'content': 'Test'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        resp = json.loads(f.read().decode('utf-8'))
        analysis_id = resp.get('analysis_id')
        print(f"Analysis ID: {analysis_id}")
        print(f"Status: {resp.get('status')}")
        print("Waiting 15s for DataAgent to attempt Gemini call...")
        
    import time
    time.sleep(15)
    
    status_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{analysis_id}/status'
    with urllib.request.urlopen(status_url, context=ctx) as sf:
        status_resp = json.loads(sf.read().decode('utf-8'))
        status = status_resp.get('status')
        phase = status_resp.get('current_phase')
        error_log = status_resp.get('error_log')
        print(f"Status: {status} | Phase: {phase}")
        if error_log:
            print(f"Error Log: {error_log}")
        if status == 'failed' and '429' in str(error_log):
            print("\n>>> QUOTA STILL EXHAUSTED - STOPPING <<<")
        elif status == 'failed':
            print(f"\n>>> FAILED FOR NON-QUOTA REASON <<<")
        else:
            print(f"\n>>> QUOTA IS AVAILABLE - Pipeline progressing <<<")
except Exception as e:
    print(f"Error: {e}")
