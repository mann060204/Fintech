from fastapi import FastAPI
from pydantic import BaseModel
from context_manager import ContextManager

app = FastAPI()
context_manager = ContextManager()

class ContextRequest(BaseModel):
    latitude: float
    longitude: float

@app.post("/analyze-context")
def analyze_context(request: ContextRequest):
    result = context_manager.check_sensitivity(request.latitude, request.longitude)
    
    return {
        "suppress_notifications": result["is_sensitive"],
        "reason": result["reason"],
        "location_type": result["location_type"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
