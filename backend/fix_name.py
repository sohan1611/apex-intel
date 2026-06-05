import os
import glob
import re

def fix_name():
    agent_files = glob.glob("agents/*.py")
    
    for filepath in agent_files:
        if "base_agent.py" in filepath or "__init__.py" in filepath:
            continue
            
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        content = content.replace("self.name", "self.agent_name")

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"Fixed {filepath}")

if __name__ == "__main__":
    fix_name()
