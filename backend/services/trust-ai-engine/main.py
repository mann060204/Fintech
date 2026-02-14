from fastapi import FastAPI
from pydantic import BaseModel
from trust_score import TrustScoreCalculator

app = FastAPI()
calculator = TrustScoreCalculator()

class TransactionHistory(BaseModel):
    total_transactions: int
    successful_payments: int
    failed_payments: int
    defaults: int
    average_transaction_amount: float

class TrustScoreRequest(BaseModel):
    user_id: str
    history: TransactionHistory

@app.post("/calculate-trust-score")
def calculate_trust_score(request: TrustScoreRequest):
    history_dict = request.history.dict()
    score = calculator.calculate_score(history_dict)
    level = calculator.get_trust_level(score)
    
    return {
        "user_id": request.user_id,
        "trust_score": score,
        "level": level
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
