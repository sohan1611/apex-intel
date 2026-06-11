import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

analysis_id = '34d578f7-fa68-4f08-a7f7-cdde2d17fcb3'
report_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/{analysis_id}'

with urllib.request.urlopen(report_url, context=ctx, timeout=30) as rf:
    report = json.loads(rf.read().decode('utf-8'))
    
    # Dump raw structures for each section
    for key in ['company_brief', 'market_analysis', 'competitors', 'skeptic_analysis', 'assumptions', 'execution_feasibility', 'contradictions', 'red_flags', 'score', 'overall_confidence_score', 'investment_signal']:
        val = report.get(key)
        val_str = json.dumps(val, indent=2) if val else str(val)
        print(f'\n=== {key} (type={type(val).__name__}) ===')
        print(val_str[:400])
