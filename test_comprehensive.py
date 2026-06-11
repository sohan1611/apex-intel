import asyncio
from backend.agents.comprehensive_agent import ComprehensiveAnalysisAgent

async def test():
    agent = ComprehensiveAnalysisAgent()
    context = {
        "company_brief": "EcoCharge AI is an EV charging marketplace...",
        "search_results": "- Result 1\n- Result 2"
    }
    try:
        res = await agent.run(context)
        print("Result:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
