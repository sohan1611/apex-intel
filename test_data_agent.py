import asyncio
import os

with open('.env', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            os.environ[k] = v

os.environ['LLM_PROVIDER'] = 'gemini'

from backend.agents.data_agent import DataAgent

async def main():
    agent = DataAgent()
    try:
        res = await agent.run({'raw_input': 'B2B healthcare analytics SaaS'})
        print("Result:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
