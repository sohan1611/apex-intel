print("STARTING PYTHON SCRIPT...", flush=True)
import os
print("OS IMPORTED", flush=True)
import uvicorn
print("UVICORN IMPORTED", flush=True)
from fastapi import FastAPI
print("FASTAPI IMPORTED", flush=True)
app = FastAPI()
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Dummy test server running"}

if __name__ == "__main__":
    print("STARTING UVICORN NOW...", flush=True)
    uvicorn.run("backend.main_test:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
