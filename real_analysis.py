import urllib.request
import urllib.error
import json
import time
import ssl
import datetime

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

print(f"=== APEX INTEL PRODUCTION VALIDATION ===")
print(f"Timestamp: {datetime.datetime.now().isoformat()}")

# Real business description for meaningful analysis
content = '''EcoCharge AI is an AI-powered EV charging infrastructure marketplace designed specifically for Eastern India. We connect commercial real estate owners, shopping malls, and fleet operators with top-tier EV charging network providers. Our AI uses spatial data, traffic patterns, and grid capacity to recommend optimal installation sites, predicting ROI with 90% accuracy. Target customers are commercial property owners and regional fleet operators. The revenue model includes a 10% marketplace transaction fee on hardware installations and a monthly SaaS fee of 200 dollars for predictive maintenance analytics. Founded in early 2025, operating currently in Kolkata and Bhubaneswar with 5 pilot mall partners. The team comprises former Tesla regional directors and AI engineers from IIT Kharagpur.'''

url = 'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze'
data = json.dumps({'input_type': 'text', 'content': content}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        resp = json.loads(f.read().decode('utf-8'))
        analysis_id = resp.get('analysis_id')
        print(f"\nAnalysis ID: {analysis_id}")
        print(f"Initial Status: {resp.get('status')}")
        
    transitions = []
    last_status = None
    
    for i in range(90):
        time.sleep(5)
        status_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{analysis_id}/status'
        try:
            with urllib.request.urlopen(status_url, context=ctx) as sf:
                status_resp = json.loads(sf.read().decode('utf-8'))
                status = status_resp.get('status')
                phase = status_resp.get('current_phase')
                progress = status_resp.get('progress')
                
                if status != last_status:
                    transitions.append({'status': status, 'phase': phase, 'time': datetime.datetime.now().isoformat()})
                    last_status = status
                
                print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Status: {status} | Phase: {phase} | Progress: {progress}%")
                
                if status == 'completed':
                    print(f"\n{'='*60}")
                    print(f"ANALYSIS COMPLETED SUCCESSFULLY")
                    print(f"{'='*60}")
                    print(f"\nStatus Transitions:")
                    for t in transitions:
                        print(f"  {t['time']} -> {t['status']}")
                    
                    # Fetch the full report
                    time.sleep(2)
                    report_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/{analysis_id}'
                    with urllib.request.urlopen(report_url, context=ctx) as rf:
                        report = json.loads(rf.read().decode('utf-8'))
                        
                        print(f"\n{'='*60}")
                        print(f"REPORT DETAILS")
                        print(f"{'='*60}")
                        print(f"Report ID: {report.get('id')}")
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
                        print(f"TAM: B")
                        print(f"SAM: B")
                        print(f"SOM: B")
                        print(f"Confidence: {market.get('confidence_score', 'N/A')}")
                        trends = market.get('market_trends', [])
                        print(f"Trends ({len(trends)}):")
                        for t in trends[:3]:
                            print(f"  - {t.get('trend', t) if isinstance(t, dict) else t}")
                        
                        # Competitors
                        comp = report.get('competitors', {})
                        competitors_list = comp.get('competitors', [])
                        print(f"\n--- Competitors ({len(competitors_list)}) ---")
                        for c in competitors_list[:5]:
                            print(f"  - {c.get('name', 'Unknown')}: {c.get('positioning', 'N/A')}")
                        
                        # Score
                        score = report.get('score', {})
                        print(f"\n--- Investment Score ---")
                        print(f"Total Score: {score.get('total_score')}/100")
                        print(f"Investment Signal: {score.get('investment_signal')}")
                        breakdown = score.get('breakdown', {})
                        print(f"  Market Opportunity: {breakdown.get('market_opportunity')}/30")
                        print(f"  Competition: {breakdown.get('competition_intensity')}/25")
                        print(f"  Execution: {breakdown.get('execution_feasibility')}/20")
                        print(f"  Risk: {breakdown.get('risk_exposure')}/25")
                        print(f"Justification: {score.get('justification', '')[:500]}")
                        
                        # Red Flags
                        red_flags = report.get('red_flags', [])
                        if not red_flags:
                            # Try from synthesis
                            synth = report.get('synthesis') or report.get('contradictions', {})
                        print(f"\n--- Skeptic Analysis ---")
                        skeptic = report.get('skeptic_analysis', {})
                        risks = skeptic.get('top_risks', [])
                        print(f"Top Risks ({len(risks)}):")
                        for r in risks[:5]:
                            print(f"  - [{r.get('severity')}] {r.get('risk', 'N/A')}")
                        
                        # Assumptions
                        assumptions = report.get('assumptions', {})
                        core_assumptions = assumptions.get('core_assumptions', [])
                        print(f"\n--- Assumptions ({len(core_assumptions)}) ---")
                        for a in core_assumptions[:3]:
                            print(f"  - {a.get('assumption', 'N/A')} (Impact: {a.get('impact_if_false', 'N/A')})")
                        
                        # Execution
                        execution = report.get('execution_feasibility', {})
                        print(f"\n--- Execution Feasibility ---")
                        print(f"Difficulty: {execution.get('operational_difficulty', 'N/A')}")
                        print(f"Capital: {execution.get('capital_requirements', 'N/A')}")
                        print(f"Timeline: {execution.get('time_to_market_estimate', 'N/A')}")
                        
                        print(f"\n{'='*60}")
                        print(f"END-TO-END VALIDATION: SUCCESS")
                        print(f"{'='*60}")
                    break
                    
                elif status == 'failed':
                    print(f"\n{'='*60}")
                    print(f"ANALYSIS FAILED")
                    print(f"{'='*60}")
                    error_log = status_resp.get('error_log')
                    print(f"Error: {json.dumps(error_log, indent=2) if isinstance(error_log, dict) else error_log}")
                    break
        except Exception as e:
            print(f"Polling error (retrying): {e}")
            
except Exception as e:
    print(f"Submission error: {e}")
