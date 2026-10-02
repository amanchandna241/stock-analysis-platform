from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from app.services.ml_forecast_engine import ml_forecast_engine

router = APIRouter(prefix="/ml", tags=["Machine Learning Forecast"])

@router.get("/forecast/{ticker}")
def get_stock_ml_forecast(
    ticker: str,
    days: int = Query(90, ge=7, le=365, description="Forecast horizon window in days (7 to 365)")
) -> Dict[str, Any]:
    """
    Returns Machine Learning Ensemble Price Target Forecasts, Monte Carlo Simulation outcomes,
    Confidence Interval channels, and Parkinson Volatility Regime Classifications for a given ticker.
    """
    try:
        data = ml_forecast_engine.generate_forecast(ticker.upper(), forecast_days=days)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ML forecast for {ticker}: {str(e)}")
