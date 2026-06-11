import requests
import time
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"
PAYLOAD = {
    "input_type": "text",
    "content": "AI-powered EV charging infrastructure marketplace for Eastern India"
}

def print_step(msg):
    print(f"[*] {msg}")

def run_test():
    start_time = time.time()
    
    # 1. Start Analysis
    print_step("POST /api/v1/analyze")
    resp = requests.post(f"{BASE_URL}/analyze", json=PAYLOAD)
    if resp.status_code != 200:
        print(f"Error starting analysis: {resp.text}")
        sys.exit(1)
    
    analysis_id = resp.json()["analysis_id"]
    print(f"    Started analysis. ID: {analysis_id}")
    
    # 2. Poll Status
    print_step("Polling GET /api/v1/analyze/{id}/status")
    report_id = None
    while True:
        status_resp = requests.get(f"{BASE_URL}/analyze/{analysis_id}/status")
        if status_resp.status_code != 200:
            print(f"Error polling status: {status_resp.text}")
            sys.exit(1)
            
        data = status_resp.json()
        status = data["status"]
        print(f"    Status: {status} (Progress: {data.get('progress', 0)}%)")
        
        if status == "completed":
            report_id = data["report_id"]
            break
        elif status == "failed":
            print(f"Analysis failed: {data}")
            sys.exit(1)
            
        time.sleep(3)
        
    end_time = time.time()
    exec_time = end_time - start_time
    print_step(f"Analysis completed in {exec_time:.2f} seconds.")
    
    # 3. Fetch Report
    print_step(f"GET /api/v1/report/{report_id}")
    report_resp = requests.get(f"{BASE_URL}/report/{report_id}")
    if report_resp.status_code != 200:
        print(f"Error fetching report: {report_resp.text}")
        sys.exit(1)
        
    report = report_resp.json()
    
    # Check all fields
    print_step("Validating Report Fields:")
    fields_to_check = [
        "company_brief", "market_analysis", "competitors",
        "assumptions", "contradictions", "execution_feasibility",
        "score_breakdown"
    ]
    
    missing = []
    for field in fields_to_check:
        val = report.get(field)
        if not val:
            missing.append(field)
            print(f"    [FAIL] {field} is empty or null")
        else:
            print(f"    [PASS] {field} is populated")
            
    if missing:
        print(f"WARNING: The following fields are missing from the report: {missing}")
    
    print("\n==== REPORT HIGHLIGHTS ====")
    print(f"Signal: {report.get('signal', 'UNKNOWN')}")
    print(f"Confidence Score: {report.get('confidence_score', 0)}")
    
    with open("report_output.json", "w") as f:
        json.dump(report, f, indent=2)
    print("Full report saved to report_output.json")

if __name__ == "__main__":
    run_test()
