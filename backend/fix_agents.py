import os
import glob

def fix_agent_files():
    base_dir = r"c:\Users\KIIT\Downloads\Apex AI\backend\agents"
    for py_file in glob.glob(os.path.join(base_dir, "*.py")):
        if py_file.endswith("base_agent.py"):
            continue
            
        with open(py_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "def __init__(self) -> None:" in content:
            content = content.replace(
                "def __init__(self) -> None:\n        super().__init__()",
                "def __init__(self, model_name: str = \"gemini-2.5-flash\") -> None:\n        super().__init__(model_name=model_name)"
            )
            # Just in case there was no super() or different formatting
            content = content.replace(
                "def __init__(self) -> None:\n        super().__init__(model_name=model_name)",
                "def __init__(self, model_name: str = \"gemini-2.5-flash\") -> None:\n        super().__init__(model_name=model_name)"
            )
            with open(py_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {os.path.basename(py_file)}")
            
if __name__ == "__main__":
    fix_agent_files()
