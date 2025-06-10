from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd  # ✅ Needed to convert input into DataFrame
import os

router = APIRouter(
    prefix="/predict",
    tags=["Price Prediction"]
)

# Load the trained model
MODEL_PATH = "ml/model.pkl"
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Trained model not found at 'ml/model.pkl'. Please train the model first.")

model = joblib.load(MODEL_PATH)

# ----- Request Schema -----
class PredictionRequest(BaseModel):
    brand: str
    condition: str
    year: int
    appliance_type: str
    warranty_remaining: int
    working_status: str

# ----- Response Schema -----
class PredictionResponse(BaseModel):
    predicted_price: int

# ----- Endpoint -----
@router.post("/", response_model=PredictionResponse)
async def predict_price(payload: PredictionRequest):
    try:
        # Convert to DataFrame (required by sklearn pipeline)
        input_df = pd.DataFrame([{
            "brand": payload.brand,
            "condition": payload.condition,
            "working_status": payload.working_status,
            "appliance_type": payload.appliance_type,
            "year": payload.year,
            "warranty_remaining": payload.warranty_remaining
        }])

        # Predict
        predicted = model.predict(input_df)[0]
        return {"predicted_price": int(predicted)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
