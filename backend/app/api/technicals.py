import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta
from app.services.stock_data_service import StockDataService
from app.services.technical_engine import TechnicalEngine
from app.schemas.stock import TechnicalResponse, PriceChartPoint

router = APIRouter(prefix="/technicals", tags=["Technicals"])

@router.get("/{ticker}", response_model=TechnicalResponse)
def get_technical_analysis(ticker: str, timeframe: str = Query("1Y")):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    curr_px = data['current_price']
    
    # Generate 252 trading days of realistic daily OHLCV price series
    np.random.seed(abs(hash(ticker)) % 10000)
    num_days = 252
    dates = [datetime.now() - timedelta(days=num_days - i) for i in range(num_days)]
    
    # Simulate geometric Brownian motion with drift
    returns = np.random.normal(0.0005, 0.015, num_days)
    price_series = [curr_px * 0.82]
    for r in returns[1:]:
        price_series.append(price_series[-1] * (1.0 + r))
    price_series[-1] = curr_px # set last to current price

    highs = [p * (1 + abs(np.random.normal(0, 0.008))) for p in price_series]
    lows = [p * (1 - abs(np.random.normal(0, 0.008))) for p in price_series]
    opens = [p * (1 + np.random.normal(0, 0.004)) for p in price_series]
    volumes = [int(np.random.uniform(1000000, 5000000)) for _ in price_series]

    df = pd.DataFrame({
        "date": [d.strftime("%Y-%m-%d") for d in dates],
        "open": opens,
        "high": highs,
        "low": lows,
        "close": price_series,
        "volume": volumes
    })

    indicators, patterns, metrics = TechnicalEngine.calculate_indicators(df)

    # Build chart points with moving averages and NIFTY 50 overlay
    chart_points = []
    nifty_base = 24500.0
    for i in range(len(df)):
        row = df.iloc[i]
        nifty_val = round(nifty_base * (1 + (i / len(df)) * 0.12 + np.random.normal(0, 0.003)), 2)
        chart_points.append(PriceChartPoint(
            date=row['date'],
            open=round(float(row['open']), 2),
            high=round(float(row['high']), 2),
            low=round(float(row['low']), 2),
            close=round(float(row['close']), 2),
            volume=float(row['volume']),
            sma_20=indicators.sma_20 if i >= len(df) - 20 else round(float(row['close']), 2),
            sma_50=indicators.sma_50 if i >= len(df) - 50 else round(float(row['close']), 2),
            sma_200=indicators.sma_200,
            rsi=indicators.rsi_14,
            nifty50_close=nifty_val
        ))

    return TechnicalResponse(
        ticker=data['ticker'],
        current_price=curr_px,
        indicators=indicators,
        patterns=patterns,
        chart_data=chart_points,
        metrics=metrics
    )
