from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import (
    dashboard, stocks, financials, profitability_growth,
    valuation, peers, technicals, governance, earnings, rag, news, thesis, mutual_funds
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Production-grade AI-Powered Stock Analysis Platform focusing on Indian Equities (NSE/BSE) & Mutual Funds."
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router endpoints
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(stocks.router, prefix=settings.API_V1_STR)
app.include_router(financials.router, prefix=settings.API_V1_STR)
app.include_router(profitability_growth.router, prefix=settings.API_V1_STR)
app.include_router(valuation.router, prefix=settings.API_V1_STR)
app.include_router(peers.router, prefix=settings.API_V1_STR)
app.include_router(technicals.router, prefix=settings.API_V1_STR)
app.include_router(governance.router, prefix=settings.API_V1_STR)
app.include_router(earnings.router, prefix=settings.API_V1_STR)
app.include_router(rag.router, prefix=settings.API_V1_STR)
app.include_router(news.router, prefix=settings.API_V1_STR)
app.include_router(thesis.router, prefix=settings.API_V1_STR)
app.include_router(mutual_funds.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Apex Equity Research API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
