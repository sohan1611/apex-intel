import os
import uvicorn
from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Dummy test server running"}

if __name__ == "__main__":
    uvicorn.run("backend.main_test:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
