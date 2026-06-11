import urllib.request, json, ssl, time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

print('Waiting 120s for Railway redeploy...')
time.sleep(120)

analysis_id = '34d578f7-fa68-4f08-a7f7-cdde2d17fcb3'
report_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/{analysis_id}'

with urllib.request.urlopen(report_url, context=ctx, timeout=30) as rf:
    report = json.loads(rf.read().decode('utf-8'))
    
    print(f'Report ID: {report.get(\"id\")}')
    print(f'Status: {report.get(\"status\")}')
    
    # Company Brief
    brief = report.get('company_brief', {}) or {}
    print(f'\n=== Company Brief ===')
    print(f'Value Prop: {brief.get(\"core_value_prop\", \"N/A\")}')
    print(f'Segment: {brief.get(\"target_customer_segment\", \"N/A\")}')
    
    # Market
    market = report.get('market_analysis', {}) or {}
    print(f'\n=== Market ===')
    print(f'TAM: {market.get(\"tam_estimate\")}B | SAM: {market.get(\"sam_estimate\")}B | SOM: {market.get(\"som_estimate\")}B')
    
    # Competitors
    comp = report.get('competitors', [])
    print(f'\n=== Competitors ({len(comp)}) ===')
    for c in comp[:3]:
        print(f'  {c.get(\"name\", \"?\")}')
    
    # Risks
    risks = report.get('skeptic_analysis', [])
    print(f'\n=== Risks ({len(risks)}) ===')
    for r in risks[:3]:
        print(f'  [{r.get(\"severity\")}] {r.get(\"risk\", \"?\")}')
    
    # Assumptions
    assumptions = report.get('assumptions', [])
    print(f'\n=== Assumptions ({len(assumptions)}) ===')
    for a in assumptions[:3]:
        print(f'  {a.get(\"assumption\", \"?\")[:80]}')
    
    # Execution
    exec_f = report.get('execution_feasibility', {}) or {}
    print(f'\n=== Execution ===')
    print(f'Difficulty: {exec_f.get(\"operational_difficulty\")} | Capital: {exec_f.get(\"capital_requirements\")} | Timeline: {exec_f.get(\"time_to_market_estimate\")}')
    
    # Score
    score = report.get('score')
    print(f'\n=== Score ===')
    if score:
        print(f'Total: {score.get(\"total_score\")}/100 | Signal: {score.get(\"investment_signal\")}')
        bd = score.get('breakdown', {})
        print(f'  Market: {bd.get(\"market_opportunity\")}/30 | Competition: {bd.get(\"competition_intensity\")}/25')
        print(f'  Execution: {bd.get(\"execution_feasibility\")}/20 | Risk: {bd.get(\"risk_exposure\")}/25')
    else:
        print('Score: None (scoring engine failed for this report)')
    
    print(f'\nOverall Confidence: {report.get(\"overall_confidence_score\")}')
    print(f'Investment Signal: {report.get(\"investment_signal\")}')
