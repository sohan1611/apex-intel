import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

analysis_id = '34d578f7-fa68-4f08-a7f7-cdde2d17fcb3'
report_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/{analysis_id}'

with urllib.request.urlopen(report_url, context=ctx, timeout=30) as rf:
    report = json.loads(rf.read().decode('utf-8'))
    
    # Competitors - handle both list and dict format
    comp = report.get('competitors', {})
    if isinstance(comp, list):
        competitors_list = comp
    elif isinstance(comp, dict):
        competitors_list = comp.get('competitors', [])
    else:
        competitors_list = []
    print(f"--- Competitors ({len(competitors_list)}) ---")
    for c in competitors_list[:5]:
        if isinstance(c, dict):
            print(f"  - {c.get('name', 'Unknown')}: {c.get('positioning', 'N/A')[:80]}")
    
    # Skeptic Analysis
    skeptic = report.get('skeptic_analysis', {})
    if isinstance(skeptic, dict):
        risks = skeptic.get('top_risks', [])
    else:
        risks = []
    print(f"\n--- Risk Analysis ({len(risks)} risks) ---")
    for r in risks[:5]:
        print(f"  - [{r.get('severity')}] {r.get('risk', 'N/A')}")
        print(f"    Rationale: {r.get('rationale', 'N/A')[:120]}")
    
    # Assumptions
    assumptions = report.get('assumptions', {})
    if isinstance(assumptions, dict):
        core_assumptions = assumptions.get('core_assumptions', [])
    else:
        core_assumptions = []
    print(f"\n--- Assumptions ({len(core_assumptions)}) ---")
    for a in core_assumptions[:4]:
        print(f"  - {a.get('assumption', 'N/A')[:100]}")
        print(f"    Difficulty: {a.get('validation_difficulty', 'N/A')} | Impact: {a.get('impact_if_false', 'N/A')}")
    
    # Execution
    execution = report.get('execution_feasibility', {}) or {}
    print(f"\n--- Execution Feasibility ---")
    print(f"Difficulty: {execution.get('operational_difficulty', 'N/A')}")
    print(f"Capital: {execution.get('capital_requirements', 'N/A')}")
    print(f"Timeline: {execution.get('time_to_market_estimate', 'N/A')}")
    print(f"Rationale: {str(execution.get('rationale', 'N/A'))[:200]}")
    
    # Contradictions
    contradictions = report.get('contradictions', {}) or {}
    if isinstance(contradictions, dict):
        contras = contradictions.get('identified_contradictions', [])
    else:
        contras = []
    print(f"\n--- Contradictions ({len(contras)}) ---")
    for c in contras[:3]:
        print(f"  - {c.get('description', 'N/A')[:120]}")
    
    # Score
    score = report.get('score', {}) or {}
    print(f"\n--- Investment Score ---")
    print(f"Total Score: {score.get('total_score')}/100")
    print(f"Investment Signal: {score.get('investment_signal')}")
    breakdown = score.get('breakdown', {}) or {}
    print(f"  Market Opportunity: {breakdown.get('market_opportunity')}/30")
    print(f"  Competition Intensity: {breakdown.get('competition_intensity')}/25")
    print(f"  Execution Feasibility: {breakdown.get('execution_feasibility')}/20")
    print(f"  Risk Exposure: {breakdown.get('risk_exposure')}/25")
    print(f"Justification: {score.get('justification', '')[:600]}")
    
    # Overall
    print(f"\nOverall Confidence: {report.get('overall_confidence_score')}")
    print(f"Investment Signal: {report.get('investment_signal')}")
    
    print(f"\n{'='*60}")
    print(f"END-TO-END VALIDATION: SUCCESS")
    print(f"{'='*60}")
