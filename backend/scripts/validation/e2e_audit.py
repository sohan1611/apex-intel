from fastapi.testclient import TestClient
from backend.main import app

def run_audit():
    print("Starting End-to-End Backend Validation Audit...")
    
    # Mocks
    from backend.agents.base_agent import BaseAgent
    from backend.services.search_service import SearchService
    from backend.services.scraping_service import ScrapingService
    
    async def mock_call_llm(self, user_prompt):
        import json
        if "DataAgent" in self.agent_name:
            return json.dumps({"core_value_prop": "Dummy", "target_customer_segment": "Dummy", "revenue_model": "Dummy", "industry": "Dummy", "product_type": "Dummy"})
        elif "MarketAgent" in self.agent_name:
            return json.dumps({"tam_estimate": 10.0, "sam_estimate": 5.0, "som_estimate": 1.0, "market_trends": [], "confidence_score": 0.8, "uncertainty_factor": "None"})
        elif "CompetitorAgent" in self.agent_name:
            return json.dumps({"competitors": [], "market_concentration": "Low", "barrier_to_entry": "High"})
        elif "SkepticAgent" in self.agent_name:
            return json.dumps({"risks": [], "bull_case": "Good", "bear_case": "Bad"})
        elif "AssumptionAgent" in self.agent_name:
            return json.dumps({"assumptions": []})
        elif "ExecutionAgent" in self.agent_name:
            return json.dumps({"operational_difficulty": "Low", "capital_requirements": "Low", "technical_complexity": "Low", "regulatory_hurdles": []})
        elif "ContradictionAgent" in self.agent_name:
            return json.dumps({"contradictions": [], "unsubstantiated_claims": []})
        elif "SynthesizerAgent" in self.agent_name:
            return json.dumps({"executive_summary": "Summary", "investment_thesis": "Thesis", "red_flags": []})
        elif "ScoringEngine" in self.agent_name:
            return json.dumps({"total_score": 85.0, "investment_signal": "STRONG", "breakdown": {"market_opportunity": 25.0, "competition_intensity": 20.0, "execution_feasibility": 15.0, "risk_exposure": 25.0}, "justification": "Good"})
        return "{}"
        
    BaseAgent._call_llm = mock_call_llm
    
    async def mock_search(self, query): return [{"title": "Dummy", "snippet": "Dummy", "url": "http://dummy.com"}]
    SearchService.search = mock_search
    
    async def mock_scrape(self, url): return "Scraped dummy content"
    ScrapingService.scrape_url = mock_scrape
    
    with TestClient(app) as client:
        # 1. POST /analyze
        print("\n[1] Submitting analysis request...")
        response = client.post(
            "/api/v1/analyze",
        json={
            "input_type": "text",
            "content": "AI-powered EV charging infrastructure marketplace for Eastern India"
        }
    )
    if response.status_code != 200:
        print(f"FAILED: POST /analyze returned {response.status_code} - {response.text}")
        return
        
    data = response.json()
    analysis_id = data.get("analysis_id")
    print(f"SUCCESS: Analysis queued with ID: {analysis_id}")
    
    # 2. Poll GET /analyze/{id}/status
    print(f"\n[2] Polling status for {analysis_id}...")
    completed = False
    
    import time
    for i in range(20):  # Wait up to 20 seconds for the background task
        time.sleep(1)
        res = client.get(f"/api/v1/analyze/{analysis_id}/status")
        if res.status_code != 200:
            print(f"FAILED: GET /status returned {res.status_code}")
            return
            
        status_data = res.json()
        print(f"Status: {status_data['status']} | Progress: {status_data['progress']}% | Phase: {status_data['current_phase']}")
        
        if status_data['status'] == "completed":
            completed = True
            break
        elif status_data['status'] == "failed":
            print("FAILED: Orchestrator failed during execution.")
            break
            
    if not completed:
        print("FAILED: Analysis did not complete in time.")
        return
        
    print("\n[3] Fetching report data...")
    res = client.get(f"/api/v1/report/{analysis_id}")
    if res.status_code != 200:
        print(f"FAILED: GET /report returned {res.status_code}")
        return
        
    report = res.json()
    
    print("\n[Report Validation]")
    print(f"ID: {report.get('id')}")
    print(f"Company Brief: {'YES' if report.get('company_brief') else 'NO'}")
    print(f"Market Analysis: {'YES' if report.get('market_analysis') else 'NO'}")
    print(f"Competitors: {'YES' if report.get('competitors') else 'NO'}")
    print(f"Assumptions: {'YES' if report.get('assumptions') else 'NO'}")
    print(f"Skeptic Analysis: {'YES' if report.get('skeptic_analysis') else 'NO'}")
    print(f"Contradictions: {'YES' if report.get('contradictions') else 'NO'}")
    print(f"Execution Feasibility: {'YES' if report.get('execution_feasibility') else 'NO'}")
    print(f"Score Breakdown: {'YES' if report.get('score_breakdown') else 'NO'}")
    print(f"Confidence Score: {report.get('overall_confidence_score')}")
    print(f"Investment Signal: {report.get('investment_signal')}")
    
    if report.get('error_log'):
        print(f"\nERROR LOG FOUND: {report.get('error_log')}")

    print("\n[4] Testing GET /reports list...")
    res = client.get("/api/v1/reports")
    if res.status_code == 200:
        reports = res.json().get("reports", [])
        print(f"SUCCESS: Found {len(reports)} total reports in list.")
    else:
        print(f"FAILED: GET /reports returned {res.status_code}")

if __name__ == "__main__":
    run_audit()
