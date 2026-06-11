import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/reports'
    with urllib.request.urlopen(url, context=ctx) as rf:
        resp = json.loads(rf.read().decode('utf-8'))
        reports = [r for r in resp.get('reports', []) if r.get('status') == 'completed']
        if reports:
            print("Completed Report ID:", reports[-1].get('id'))
            print("Analysis ID:", reports[-1].get('analysis_id'))
            
            # Fetch full report
            r_url = f"https://apex-intel-production-ae8f.up.railway.app/api/v1/report/{reports[-1].get('analysis_id')}"
            with urllib.request.urlopen(r_url, context=ctx) as rrf:
                full = json.loads(rrf.read().decode('utf-8'))
                print("Summary:", full.get('score', {}).get('justification', ''))
except Exception as e:
    print("Error:", e)
