import urllib.request
import urllib.error
import json
import time
import ssl
import datetime

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

analysis_id = 'a1042745-86a2-4351-8da7-3a151266c6da'
print(f"Monitoring analysis: {analysis_id}")
print(f"Start: {datetime.datetime.now().isoformat()}")

for i in range(60):
    time.sleep(5)
    status_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/analyze/{analysis_id}/status'
    try:
        with urllib.request.urlopen(status_url, context=ctx) as sf:
            status_resp = json.loads(sf.read().decode('utf-8'))
            status = status_resp.get('status')
            phase = status_resp.get('current_phase')
            progress = status_resp.get('progress')
            print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Status: {status} | Phase: {phase} | Progress: {progress}%")
            
            if status == 'completed':
                print(f"\n=== ANALYSIS COMPLETED ===")
                print(f"End: {datetime.datetime.now().isoformat()}")
                
                # Fetch the report
                report_url = f'https://apex-intel-production-ae8f.up.railway.app/api/v1/report/{analysis_id}'
                with urllib.request.urlopen(report_url, context=ctx) as rf:
                    report = json.loads(rf.read().decode('utf-8'))
                    print(f"\nReport ID: {report.get('report_id', report.get('id'))}")
                    print(f"Analysis ID: {report.get('analysis_id', analysis_id)}")
                    
                    # Score
                    score = report.get('score', {})
                    print(f"\nTotal Score: {score.get('total_score')}")
                    print(f"Investment Signal: {score.get('investment_signal')}")
                    breakdown = score.get('breakdown', {})
                    print(f"  Market Opportunity: {breakdown.get('market_opportunity')}")
                    print(f"  Competition: {breakdown.get('competition_intensity')}")
                    print(f"  Execution: {breakdown.get('execution_feasibility')}")
                    print(f"  Risk: {breakdown.get('risk_exposure')}")
                    print(f"Justification: {score.get('justification', '')[:300]}...")
                    
                    # Synthesis
                    synthesis = report.get('synthesis', {})
                    print(f"\nExecutive Summary: {synthesis.get('executive_summary', '')[:400]}...")
                    
                    # Red Flags
                    red_flags = synthesis.get('red_flags', [])
                    print(f"\nRed Flags ({len(red_flags)}):")
                    for rf_item in red_flags[:5]:
                        print(f"  - [{rf_item.get('severity')}] {rf_item.get('flag')}")
                    
                    # Market
                    market = synthesis.get('market_overview', {})
                    print(f"\nMarket: TAM=B SAM=B SOM=B")
                    
                    # Top-level keys
                    print(f"\nAll report keys: {list(report.keys())}")
                break
                
            elif status == 'failed':
                print(f"\n=== ANALYSIS FAILED ===")
                error_log = status_resp.get('error_log')
                print(f"Error: {error_log}")
                break
    except Exception as e:
        print(f"Polling error: {e}")
