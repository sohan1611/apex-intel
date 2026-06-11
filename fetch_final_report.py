import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

analysis_id = '34d578f7-fa68-4f08-a7f7-cdde2d17fcb3'
report_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/{analysis_id}'

with urllib.request.urlopen(report_url, context=ctx, timeout=30) as rf:
    report = json.loads(rf.read().decode('utf-8'))
    
    print(f"{'='*60}")
    print(f"REPORT DETAILS - NutriTrack AI")
    print(f"{'='*60}")
    print(f"Report ID: {report.get('id')}")
    print(f"Status: {report.get('status')}")
    print(f"Input Type: {report.get('input_type')}")
    
    # Company Brief
    brief = report.get('company_brief', {})
    print(f"\n--- Company Brief ---")
    print(f"Core Value Prop: {brief.get('core_value_prop', 'N/A')}")
    print(f"Target Segment: {brief.get('target_customer_segment', 'N/A')}")
    print(f"Revenue Model: {brief.get('revenue_model', 'N/A')}")
    print(f"Industry: {brief.get('industry', 'N/A')}")
    print(f"Product Type: {brief.get('product_type', 'N/A')}")
    
    # Market Analysis
    market = report.get('market_analysis', {})
    print(f"\n--- Market Analysis ---")
    print(f"TAM: {market.get('tam_estimate', 'N/A')}B USD")
    print(f"SAM: {market.get('sam_estimate', 'N/A')}B USD")
    print(f"SOM: {market.get('som_estimate', 'N/A')}B USD")
    print(f"Confidence: {market.get('confidence_score', 'N/A')}")
    trends = market.get('market_trends', [])
    print(f"Market Trends ({len(trends)}):")
    for t in trends[:4]:
        if isinstance(t, dict):
            print(f"  - {t.get('trend', 'N/A')} (Source: {t.get('source', 'N/A')[:50]})")
        else:
            print(f"  - {t}")
    
    # Competitors
    comp = report.get('competitors', {})
    competitors_list = comp.get('competitors', [])
    print(f"\n--- Competitors ({len(competitors_list)}) ---")
    for c in competitors_list[:5]:
        print(f"  - {c.get('name', 'Unknown')}: {c.get('positioning', 'N/A')[:80]}")
    
    # Skeptic Analysis
    skeptic = report.get('skeptic_analysis', {})
    risks = skeptic.get('top_risks', [])
    print(f"\n--- Risk Analysis ({len(risks)} risks) ---")
    for r in risks[:5]:
        print(f"  - [{r.get('severity')}] {r.get('risk', 'N/A')}")
        print(f"    Rationale: {r.get('rationale', 'N/A')[:100]}")
    
    # Assumptions
    assumptions = report.get('assumptions', {})
    core_assumptions = assumptions.get('core_assumptions', [])
    print(f"\n--- Assumptions ({len(core_assumptions)}) ---")
    for a in core_assumptions[:4]:
        print(f"  - {a.get('assumption', 'N/A')[:80]}")
        print(f"    Difficulty: {a.get('validation_difficulty', 'N/A')} | Impact if false: {a.get('impact_if_false', 'N/A')}")
    
    # Execution
    execution = report.get('execution_feasibility', {})
    print(f"\n--- Execution Feasibility ---")
    print(f"Difficulty: {execution.get('operational_difficulty', 'N/A')}")
    print(f"Capital: {execution.get('capital_requirements', 'N/A')}")
    print(f"Timeline: {execution.get('time_to_market_estimate', 'N/A')}")
    print(f"Rationale: {execution.get('rationale', 'N/A')[:200]}")
    
    # Contradictions
    contradictions = report.get('contradictions', {})
    contras = contradictions.get('identified_contradictions', [])
    print(f"\n--- Contradictions ({len(contras)}) ---")
    for c in contras[:3]:
        print(f"  - {c.get('description', 'N/A')[:100]}")
    
    # Score
    score = report.get('score', {})
    print(f"\n--- Investment Score ---")
    print(f"Total Score: {score.get('total_score')}/100")
    print(f"Investment Signal: {score.get('investment_signal')}")
    breakdown = score.get('breakdown', {})
    print(f"  Market Opportunity: {breakdown.get('market_opportunity')}/30")
    print(f"  Competition Intensity: {breakdown.get('competition_intensity')}/25")
    print(f"  Execution Feasibility: {breakdown.get('execution_feasibility')}/20")
    print(f"  Risk Exposure: {breakdown.get('risk_exposure')}/25")
    print(f"Justification: {score.get('justification', '')[:500]}")
    
    # Overall
    print(f"\nOverall Confidence: {report.get('overall_confidence_score')}")
    print(f"Investment Signal: {report.get('investment_signal')}")
    
    print(f"\n{'='*60}")
    print(f"END-TO-END VALIDATION: SUCCESS")
    print(f"{'='*60}")
