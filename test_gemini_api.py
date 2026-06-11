import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

API_KEY = "dummy"

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

system_prompt = """\
You are a data structuring analyst at a top-tier investment research firm.
Your ONLY job is to extract objective, factual information from a raw
company description and optional scraped web content.

STRICT RULES:
  1. Strip ALL marketing fluff, buzzwords, superlatives, and unsubstantiated
     claims (e.g. "revolutionary", "world-class", "disruptive").
  2. Distil the text down to concrete, verifiable facts.
  3. If you cannot determine a field with reasonable confidence, set it
     to null — NEVER fabricate or guess.
  4. Return ONLY valid JSON matching the schema below — no commentary,
     no markdown, no extra keys.
  5. Do NOT add information that is not present in the source text.

OUTPUT SCHEMA:
{
  "core_value_prop": "<string or null>",
  "target_customer_segment": "<string or null>",
  "revenue_model": "<string or null>",
  "industry": "<string or null>",
  "product_type": "<string or null>"
}
"""

user_prompt = """\
Analyse the following company information and extract structured facts.

=== RAW INPUT (pitch deck / description) ===
B2B healthcare analytics SaaS

=== SCRAPED WEB CONTENT (may be empty) ===
No additional scraped content available.

Return ONLY a JSON object with these fields:
{
  "core_value_prop": "<string or null — the core value proposition stripped of marketing language>",
  "target_customer_segment": "<string or null — who is the primary customer>",
  "revenue_model": "<string or null — how does this company make money>",
  "industry": "<string or null — primary industry classification>",
  "product_type": "<string or null — type of product/service offered>"
}
"""

payload = {
    "system_instruction": {"parts": [{"text": system_prompt}]},
    "contents": [{"parts": [{"text": user_prompt}]}],
    "generationConfig": {
        "temperature": 0.2,
        "maxOutputTokens": 2000,
        "responseMimeType": "application/json"
    }
}

req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        print(f.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Error {e.code}: {e.read().decode('utf-8')}")
