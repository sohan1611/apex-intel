import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/d0418912-9bda-4431-be75-b08a21be9460'
    with urllib.request.urlopen(url, context=ctx) as rf:
        report_data = json.loads(rf.read().decode('utf-8'))
        print("Report ID:", report_data.get('report_id'))
        print("Analysis ID:", report_data.get('analysis_id'))
        print("Summary:", report_data.get('executive_summary', '')[:150] + "...")
except Exception as e:
    print("Error:", e)
