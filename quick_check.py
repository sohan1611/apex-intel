import urllib.request, json, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Check both analyses
for aid in ['a1042745-86a2-4351-8da7-3a151266c6da']:
    url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{aid}/status'
    with urllib.request.urlopen(url, context=ctx) as f:
        print(f"Probe: {json.loads(f.read().decode('utf-8'))}")

# Get the latest reports list to find the new analysis
url2 = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/reports'
with urllib.request.urlopen(url2, context=ctx) as f:
    data = json.loads(f.read().decode('utf-8'))
    print(f"\nTotal reports: {data.get('total')}")
    for r in data.get('reports', [])[:5]:
        print(f"  ID: {r.get('id')} | Status: {r.get('status')} | Content: {str(r.get('input_content',''))[:60]}")
