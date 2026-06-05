import os
import re
import glob

def fix_agents():
    agent_files = glob.glob("agents/*.py")
    
    for filepath in agent_files:
        if "base_agent.py" in filepath or "__init__.py" in filepath:
            continue
            
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Find the agent class name
        class_match = re.search(r"class (\w+)\(BaseAgent\):", content)
        if not class_match:
            continue
        class_name = class_match.group(1)

        # Find the system prompt variable name. It's usually imported from backend.core.prompts
        # and passed to _call_llm
        sys_prompt_match = re.search(r"system_prompt=([A-Z_]+)", content)
        if not sys_prompt_match:
            print(f"Could not find system prompt for {filepath}")
            continue
        sys_prompt_var = sys_prompt_match.group(1)

        # Replace __init__ block
        init_pattern = re.compile(r"    def __init__\(self\) -> None:\n        super\(\)\.__init__\(\n            name=\"[^\"]+\",\n            description=\([\s\S]*?\),\n        \)", re.MULTILINE)
        
        replacement = f"""    @property
    def agent_name(self) -> str:
        return "{class_name}"

    @property
    def system_prompt(self) -> str:
        return {sys_prompt_var}

    def __init__(self) -> None:
        super().__init__()"""

        # Some might not have description in parenthesis but string literals
        init_pattern_2 = re.compile(r"    def __init__\(self\) -> None:\n        super\(\)\.__init__\(\n            name=\"[^\"]+\",\n            description=\"[^\"]+\",\n        \)", re.MULTILINE)

        if init_pattern.search(content):
            content = init_pattern.sub(replacement, content)
        elif init_pattern_2.search(content):
            content = init_pattern_2.sub(replacement, content)
        else:
            print(f"Warning: Could not match __init__ in {filepath}")

        # Fix _call_llm usage
        call_llm_pattern = re.compile(r"self\._call_llm\(\s*system_prompt=[A-Z_]+,\s*user_prompt=user_prompt,?\s*\)")
        content = call_llm_pattern.sub("self._call_llm(user_prompt)", content)
        
        call_llm_pattern2 = re.compile(r"self\._call_llm\(\s*user_prompt=user_prompt,?\s*system_prompt=[A-Z_]+,?\s*\)")
        content = call_llm_pattern2.sub("self._call_llm(user_prompt)", content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"Fixed {filepath}")

if __name__ == "__main__":
    fix_agents()
