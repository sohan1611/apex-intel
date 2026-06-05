import sys
import traceback

def validate_agents():
    print("Testing Agent Instantiation...")
    try:
        from backend.agents.data_agent import DataAgent
        from backend.agents.market_agent import MarketAgent
        from backend.agents.competitor_agent import CompetitorAgent
        from backend.agents.skeptic_agent import SkepticAgent
        from backend.agents.assumption_agent import AssumptionAgent
        from backend.agents.execution_agent import ExecutionAgent
        from backend.agents.contradiction_agent import ContradictionAgent
        from backend.agents.synthesizer import SynthesizerAgent
        from backend.agents.scoring_engine import ScoringEngine
        
        agents = [
            DataAgent(),
            MarketAgent(),
            CompetitorAgent(),
            SkepticAgent(),
            AssumptionAgent(),
            ExecutionAgent(),
            ContradictionAgent(),
            SynthesizerAgent(),
            ScoringEngine()
        ]
        
        for agent in agents:
            print(f"SUCCESS: Instantiated {agent.agent_name} with system prompt length: {len(agent.system_prompt)}")
            
        print("\nAll 9 agents successfully instantiated!")
    except Exception as e:
        print(f"FAILED to instantiate agents: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    validate_agents()
