from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from app.services.stock_data_service import StockDataService
from app.services.financial_engine import FinancialEngine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

# ─── CAP Thresholds ───────────────────────────────────────────────────────────
CAP_THRESHOLDS = {
    "small":  (0,        50_000),
    "mid":    (50_000,  300_000),
    "large":  (300_000, 99_999_999),
}

# ─── Horizon Weights ──────────────────────────────────────────────────────────
HORIZON_WEIGHTS = {
    "short":  {"momentum": 0.40, "growth": 0.20, "quality": 0.20, "value": 0.20},
    "medium": {"momentum": 0.20, "growth": 0.30, "quality": 0.30, "value": 0.20},
    "long":   {"momentum": 0.10, "growth": 0.30, "quality": 0.35, "value": 0.25},
}

# ─── Sector Aliases ───────────────────────────────────────────────────────────
SECTOR_ALIASES = {
    "it": "Technology", "tech": "Technology", "technology": "Technology",
    "banking": "Financial Services", "finance": "Financial Services",
    "financial": "Financial Services", "financial services": "Financial Services",
    "energy": "Energy", "oil": "Energy", "oil & gas": "Energy",
    "telecom": "Telecom", "telecommunications": "Telecom",
    "pharma": "Healthcare", "healthcare": "Healthcare", "pharma & healthcare": "Healthcare",
    "fmcg": "FMCG", "consumer": "FMCG",
    "auto": "Auto", "automobile": "Auto",
    "infra": "Infrastructure", "infrastructure": "Infrastructure",
    "materials": "Materials", "metals": "Materials",
    "realty": "Real Estate", "real estate": "Real Estate",
    "chemicals": "Chemicals",
    "insurance": "Insurance",
    "manufacturing": "Manufacturing",
}

# ─── Seeded tickers that use StockDataService (live + fallback) ───────────────
SEEDED_TICKERS = {
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
    "BHARTIARTL", "SBIN", "GS", "JPM", "MS", "AAPL", "MSFT", "NVDA"
}
SEEDED_META = {
    "RELIANCE":   {"sector": "Energy",            "cap_type": "large", "exchange": "NSE",    "currency": "INR"},
    "TCS":        {"sector": "Technology",         "cap_type": "large", "exchange": "NSE",    "currency": "INR"},
    "INFY":       {"sector": "Technology",         "cap_type": "large", "exchange": "NSE",    "currency": "INR"},
    "HDFCBANK":   {"sector": "Financial Services", "cap_type": "large", "exchange": "NSE",    "currency": "INR"},
    "ICICIBANK":  {"sector": "Financial Services", "cap_type": "large", "exchange": "NSE",    "currency": "INR"},
    "BHARTIARTL": {"sector": "Telecom",            "cap_type": "large", "exchange": "NSE",    "currency": "INR"},
    "SBIN":       {"sector": "Financial Services", "cap_type": "large", "exchange": "NSE",    "currency": "INR"},
    "GS":         {"sector": "Financial Services", "cap_type": "large", "exchange": "NYSE",   "currency": "USD"},
    "JPM":        {"sector": "Financial Services", "cap_type": "large", "exchange": "NYSE",   "currency": "USD"},
    "MS":         {"sector": "Financial Services", "cap_type": "large", "exchange": "NYSE",   "currency": "USD"},
    "AAPL":       {"sector": "Technology",         "cap_type": "large", "exchange": "NASDAQ", "currency": "USD"},
    "MSFT":       {"sector": "Technology",         "cap_type": "large", "exchange": "NASDAQ", "currency": "USD"},
    "NVDA":       {"sector": "Technology",         "cap_type": "large", "exchange": "NASDAQ", "currency": "USD"},
}

# ─── Extended Mini-Universe ───────────────────────────────────────────────────
# Format: revenue/pat/ebitda = [FY22, FY23, FY24, FY25] (4 values for 3Y CAGR)
#         cfo/capex/equity/debt = [FY25] (single value, only [-1] is used)
# All amounts in Cr INR unless currency=USD
MINI_UNIVERSE: Dict[str, Dict[str, Any]] = {

    # ──────────────────────────── LARGE CAP (>300K Cr) ──────────────────────
    "KOTAKBANK": {
        "name": "Kotak Mahindra Bank", "sector": "Financial Services",
        "industry": "Private Sector Banking", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 378000, "current_price": 1921, "change_percent": 0.52,
        "pe_ratio": 21.5, "pb_ratio": 3.2, "ev_ebitda": 14.5, "dividend_yield": 0.11,
        "high_52w": 2063, "low_52w": 1544,
        "revenue": [24000, 29000, 35000, 40000], "pat": [7200, 9100, 12000, 15200],
        "ebitda": [12500, 15800, 20000, 25000], "cfo": [13000], "capex": [800], "equity": [98000], "debt": [32000],
    },
    "AXISBANK": {
        "name": "Axis Bank Limited", "sector": "Financial Services",
        "industry": "Private Sector Banking", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 315000, "current_price": 1018, "change_percent": 0.72,
        "pe_ratio": 13.8, "pb_ratio": 2.1, "ev_ebitda": 11.5, "dividend_yield": 0.14,
        "high_52w": 1148, "low_52w": 890,
        "revenue": [28000, 39000, 53000, 63000], "pat": [7100, 10200, 15200, 23000],
        "ebitda": [18000, 26000, 35000, 44000], "cfo": [16000], "capex": [1200], "equity": [122000], "debt": [90000],
    },
    "WIPRO": {
        "name": "Wipro Limited", "sector": "Technology",
        "industry": "IT Services & Consulting", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 268000, "current_price": 515, "change_percent": -0.32,
        "pe_ratio": 22.8, "pb_ratio": 4.1, "ev_ebitda": 15.2, "dividend_yield": 0.19,
        "high_52w": 592, "low_52w": 398,
        "revenue": [72000, 90500, 90000, 97000], "pat": [10200, 12500, 11700, 12500],
        "ebitda": [16200, 19800, 18000, 19300], "cfo": [11800], "capex": [2200], "equity": [72000], "debt": [2500],
    },
    "HCLTECH": {
        "name": "HCL Technologies Limited", "sector": "Technology",
        "industry": "IT Services & Consulting", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 462000, "current_price": 1702, "change_percent": 0.44,
        "pe_ratio": 28.5, "pb_ratio": 7.2, "ev_ebitda": 19.8, "dividend_yield": 4.50,
        "high_52w": 1950, "low_52w": 1235,
        "revenue": [75000, 97500, 107000, 118000], "pat": [12100, 15700, 16400, 17600],
        "ebitda": [18500, 24000, 26200, 28800], "cfo": [17000], "capex": [1900], "equity": [65000], "debt": [1000],
    },
    "SUNPHARMA": {
        "name": "Sun Pharmaceutical Industries", "sector": "Healthcare",
        "industry": "Pharmaceuticals", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 395000, "current_price": 1648, "change_percent": 0.28,
        "pe_ratio": 40.5, "pb_ratio": 7.8, "ev_ebitda": 25.2, "dividend_yield": 0.85,
        "high_52w": 1960, "low_52w": 1310,
        "revenue": [32000, 37000, 43000, 50000], "pat": [5800, 7200, 9500, 11200],
        "ebitda": [8500, 10300, 13100, 15600], "cfo": [8000], "capex": [2500], "equity": [50000], "debt": [3000],
    },
    "ITC": {
        "name": "ITC Limited", "sector": "FMCG",
        "industry": "Cigarettes & FMCG Diversified", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 563000, "current_price": 452, "change_percent": 0.15,
        "pe_ratio": 27.2, "pb_ratio": 8.4, "ev_ebitda": 18.8, "dividend_yield": 2.95,
        "high_52w": 520, "low_52w": 408,
        "revenue": [60000, 70000, 75000, 80000], "pat": [14200, 17400, 19500, 21000],
        "ebitda": [22000, 27200, 30100, 32800], "cfo": [20500], "capex": [2500], "equity": [68000], "debt": [500],
    },
    "LTIM": {
        "name": "LTIMindtree Limited", "sector": "Technology",
        "industry": "IT Services & Consulting", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 154000, "current_price": 5198, "change_percent": -0.54,
        "pe_ratio": 38.2, "pb_ratio": 8.5, "ev_ebitda": 25.2, "dividend_yield": 1.52,
        "high_52w": 6767, "low_52w": 4500,
        "revenue": [14000, 18000, 22000, 24000], "pat": [2500, 3400, 4100, 4500],
        "ebitda": [3800, 5000, 6100, 6800], "cfo": [4500], "capex": [500], "equity": [18000], "debt": [200],
    },
    "ONGC": {
        "name": "Oil & Natural Gas Corporation", "sector": "Energy",
        "industry": "Oil & Gas Exploration", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 343000, "current_price": 272, "change_percent": 0.85,
        "pe_ratio": 8.8, "pb_ratio": 1.1, "ev_ebitda": 5.5, "dividend_yield": 3.82,
        "high_52w": 345, "low_52w": 213,
        "revenue": [130000, 165000, 163000, 155000], "pat": [9600, 31000, 40000, 35000],
        "ebitda": [45000, 75000, 80000, 72000], "cfo": [50000], "capex": [30000], "equity": [315000], "debt": [35000],
    },
    "POWERGRID": {
        "name": "Power Grid Corporation of India", "sector": "Infrastructure",
        "industry": "Power Transmission", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 308000, "current_price": 330, "change_percent": 0.61,
        "pe_ratio": 18.5, "pb_ratio": 3.9, "ev_ebitda": 10.8, "dividend_yield": 3.52,
        "high_52w": 366, "low_52w": 218,
        "revenue": [39000, 42000, 45000, 47000], "pat": [12000, 14000, 15200, 16700],
        "ebitda": [33000, 36000, 38800, 41000], "cfo": [18000], "capex": [10000], "equity": [80000], "debt": [142000],
    },
    "NTPC": {
        "name": "NTPC Limited", "sector": "Infrastructure",
        "industry": "Power Generation", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 388000, "current_price": 382, "change_percent": 0.70,
        "pe_ratio": 18.8, "pb_ratio": 2.5, "ev_ebitda": 9.9, "dividend_yield": 2.52,
        "high_52w": 448, "low_52w": 278,
        "revenue": [145000, 170000, 178000, 185000], "pat": [13200, 17100, 20000, 21800],
        "ebitda": [42000, 50000, 57000, 61000], "cfo": [25000], "capex": [25000], "equity": [155000], "debt": [290000],
    },
    "BAJFINANCE": {
        "name": "Bajaj Finance Limited", "sector": "Financial Services",
        "industry": "Consumer Finance & NBFC", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 490000, "current_price": 7995, "change_percent": 0.32,
        "pe_ratio": 34.5, "pb_ratio": 6.8, "ev_ebitda": 22.8, "dividend_yield": 0.36,
        "high_52w": 9000, "low_52w": 6188,
        "revenue": [28000, 42000, 57000, 73000], "pat": [7300, 11000, 14500, 17000],
        "ebitda": [18000, 27500, 37500, 48500], "cfo": [18500], "capex": [1200], "equity": [72000], "debt": [282000],
    },
    "TATAMOTORS": {
        "name": "Tata Motors Limited", "sector": "Auto",
        "industry": "Passenger & Commercial Vehicles", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 318000, "current_price": 848, "change_percent": 1.22,
        "pe_ratio": 12.5, "pb_ratio": 3.4, "ev_ebitda": 8.2, "dividend_yield": 0.41,
        "high_52w": 1180, "low_52w": 660,
        "revenue": [280000, 350000, 440000, 490000], "pat": [-14000, 2400, 23000, 32000],
        "ebitda": [18000, 35000, 62000, 76000], "cfo": [35000], "capex": [28000], "equity": [95000], "debt": [95000],
    },
    "MARUTI": {
        "name": "Maruti Suzuki India Limited", "sector": "Auto",
        "industry": "Passenger Vehicles", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 380000, "current_price": 12180, "change_percent": 0.58,
        "pe_ratio": 28.8, "pb_ratio": 5.2, "ev_ebitda": 18.5, "dividend_yield": 1.22,
        "high_52w": 13680, "low_52w": 10000,
        "revenue": [100000, 117000, 144000, 160000], "pat": [3700, 7700, 12500, 14200],
        "ebitda": [8000, 12800, 18800, 21500], "cfo": [15000], "capex": [4000], "equity": [74000], "debt": [0],
    },
    "HINDUNILVR": {
        "name": "Hindustan Unilever Limited", "sector": "FMCG",
        "industry": "Personal Care & Home Products", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 580000, "current_price": 2468, "change_percent": -0.20,
        "pe_ratio": 55.5, "pb_ratio": 11.2, "ev_ebitda": 38.5, "dividend_yield": 1.86,
        "high_52w": 2980, "low_52w": 2170,
        "revenue": [51000, 58000, 61000, 62000], "pat": [8500, 10000, 10200, 10800],
        "ebitda": [13500, 15700, 15900, 16600], "cfo": [11200], "capex": [1500], "equity": [52000], "debt": [200],
    },
    "M&M": {
        "name": "Mahindra & Mahindra Limited", "sector": "Auto",
        "industry": "Utility Vehicles & Tractors", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 387000, "current_price": 3102, "change_percent": 0.88,
        "pe_ratio": 28.8, "pb_ratio": 6.2, "ev_ebitda": 18.8, "dividend_yield": 0.76,
        "high_52w": 3370, "low_52w": 1590,
        "revenue": [73000, 102000, 133000, 152000], "pat": [5800, 7400, 10200, 13500],
        "ebitda": [12000, 17000, 24200, 29500], "cfo": [15000], "capex": [9000], "equity": [62000], "debt": [8000],
    },
    "BAJAJFINSV": {
        "name": "Bajaj Finserv Limited", "sector": "Financial Services",
        "industry": "Insurance & Finance Holding", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 265000, "current_price": 1682, "change_percent": 0.45,
        "pe_ratio": 22.5, "pb_ratio": 4.1, "ev_ebitda": 15.5, "dividend_yield": 0.18,
        "high_52w": 2029, "low_52w": 1420,
        "revenue": [65000, 90000, 120000, 145000], "pat": [7200, 10400, 14200, 18200],
        "ebitda": [25000, 38000, 52000, 66000], "cfo": [22000], "capex": [2000], "equity": [112000], "debt": [260000],
    },
    "NESTLEIND": {
        "name": "Nestle India Limited", "sector": "FMCG",
        "industry": "Packaged Foods", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 235000, "current_price": 2448, "change_percent": 0.12,
        "pe_ratio": 82.5, "pb_ratio": 122.5, "ev_ebitda": 56.2, "dividend_yield": 1.65,
        "high_52w": 2778, "low_52w": 2100,
        "revenue": [14800, 18100, 20000, 21200], "pat": [2100, 2800, 3000, 3100],
        "ebitda": [3800, 4700, 5200, 5500], "cfo": [3500], "capex": [1000], "equity": [1900], "debt": [0],
    },
    "TITAN": {
        "name": "Titan Company Limited", "sector": "Consumer",
        "industry": "Jewellery & Watches", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 320000, "current_price": 3598, "change_percent": 0.65,
        "pe_ratio": 93.2, "pb_ratio": 32.5, "ev_ebitda": 69.2, "dividend_yield": 0.35,
        "high_52w": 3886, "low_52w": 2784,
        "revenue": [28800, 40600, 49000, 52000], "pat": [2200, 3300, 3500, 3900],
        "ebitda": [3200, 4600, 5000, 5500], "cfo": [3600], "capex": [1200], "equity": [9900], "debt": [500],
    },
    "ASIANPAINT": {
        "name": "Asian Paints Limited", "sector": "Materials",
        "industry": "Paints & Coatings", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 248000, "current_price": 2592, "change_percent": -0.38,
        "pe_ratio": 58.5, "pb_ratio": 16.2, "ev_ebitda": 38.8, "dividend_yield": 1.15,
        "high_52w": 3394, "low_52w": 2200,
        "revenue": [25000, 34000, 35000, 35500], "pat": [3000, 4700, 5200, 4600],
        "ebitda": [5200, 7500, 7800, 7100], "cfo": [5100], "capex": [2000], "equity": [15200], "debt": [500],
    },
    "ADANIENT": {
        "name": "Adani Enterprises Limited", "sector": "Conglomerate",
        "industry": "Diversified Infrastructure & Mining", "cap_type": "large", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 340000, "current_price": 3005, "change_percent": 1.05,
        "pe_ratio": 72.5, "pb_ratio": 9.5, "ev_ebitda": 38.5, "dividend_yield": 0.05,
        "high_52w": 3743, "low_52w": 2025,
        "revenue": [70000, 138000, 100000, 115000], "pat": [1200, 2500, 3200, 4800],
        "ebitda": [6500, 12000, 14000, 17000], "cfo": [8000], "capex": [12000], "equity": [36000], "debt": [55000],
    },

    # ──────────────────────────── MID CAP (50K–300K Cr) ─────────────────────
    "TATASTEEL": {
        "name": "Tata Steel Limited", "sector": "Materials",
        "industry": "Steel & Iron", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 190000, "current_price": 152, "change_percent": 0.92,
        "pe_ratio": 18.8, "pb_ratio": 1.8, "ev_ebitda": 7.2, "dividend_yield": 1.8,
        "high_52w": 184, "low_52w": 120,
        "revenue": [175000, 243000, 233000, 228000], "pat": [12000, 8200, 6100, 8500],
        "ebitda": [38000, 38000, 28000, 32000], "cfo": [20000], "capex": [15000], "equity": [106000], "debt": [86000],
    },
    "HINDALCO": {
        "name": "Hindalco Industries Limited", "sector": "Materials",
        "industry": "Aluminium & Copper", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 136000, "current_price": 608, "change_percent": 0.78,
        "pe_ratio": 12.5, "pb_ratio": 1.8, "ev_ebitda": 7.5, "dividend_yield": 0.82,
        "high_52w": 773, "low_52w": 490,
        "revenue": [148000, 220000, 215000, 225000], "pat": [10800, 13500, 10700, 12500],
        "ebitda": [25000, 35000, 28000, 32000], "cfo": [18000], "capex": [10000], "equity": [76000], "debt": [56000],
    },
    "JSWSTEEL": {
        "name": "JSW Steel Limited", "sector": "Materials",
        "industry": "Steel & Iron", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 222000, "current_price": 898, "change_percent": 0.68,
        "pe_ratio": 29.2, "pb_ratio": 3.8, "ev_ebitda": 12.5, "dividend_yield": 1.52,
        "high_52w": 1063, "low_52w": 750,
        "revenue": [100000, 140000, 145000, 155000], "pat": [9000, 8600, 6700, 8000],
        "ebitda": [22000, 23000, 17000, 21000], "cfo": [15000], "capex": [12000], "equity": [60000], "debt": [65000],
    },
    "DRREDDY": {
        "name": "Dr. Reddy's Laboratories", "sector": "Healthcare",
        "industry": "Pharmaceuticals", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 120000, "current_price": 1442, "change_percent": 0.35,
        "pe_ratio": 22.5, "pb_ratio": 4.5, "ev_ebitda": 14.5, "dividend_yield": 0.85,
        "high_52w": 1600, "low_52w": 1100,
        "revenue": [19400, 24000, 27000, 30000], "pat": [2700, 4600, 6500, 7500],
        "ebitda": [4500, 7000, 9500, 11000], "cfo": [7000], "capex": [1800], "equity": [26000], "debt": [8000],
    },
    "CIPLA": {
        "name": "Cipla Limited", "sector": "Healthcare",
        "industry": "Pharmaceuticals", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 105000, "current_price": 1302, "change_percent": 0.55,
        "pe_ratio": 28.5, "pb_ratio": 5.8, "ev_ebitda": 18.5, "dividend_yield": 0.55,
        "high_52w": 1702, "low_52w": 1100,
        "revenue": [19000, 22200, 25000, 27500], "pat": [1800, 2700, 3800, 4500],
        "ebitda": [4000, 5200, 6500, 7800], "cfo": [5000], "capex": [1500], "equity": [18000], "debt": [1500],
    },
    "GRASIM": {
        "name": "Grasim Industries Limited", "sector": "Materials",
        "industry": "Cement & Textiles", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 185000, "current_price": 2698, "change_percent": 0.32,
        "pe_ratio": 22.8, "pb_ratio": 2.2, "ev_ebitda": 10.8, "dividend_yield": 0.86,
        "high_52w": 2900, "low_52w": 1875,
        "revenue": [22000, 28000, 32000, 35000], "pat": [5200, 6800, 7500, 8200],
        "ebitda": [8500, 11000, 12500, 13800], "cfo": [8000], "capex": [5000], "equity": [86000], "debt": [10000],
    },
    "CHOLAFIN": {
        "name": "Cholamandalam Investment Finance", "sector": "Financial Services",
        "industry": "Vehicle Finance NBFC", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 112000, "current_price": 1452, "change_percent": 0.64,
        "pe_ratio": 25.5, "pb_ratio": 5.2, "ev_ebitda": 16.5, "dividend_yield": 0.52,
        "high_52w": 1652, "low_52w": 1085,
        "revenue": [8000, 11000, 16000, 21000], "pat": [2200, 2900, 3500, 4500],
        "ebitda": [5000, 6800, 10000, 13000], "cfo": [6000], "capex": [400], "equity": [22000], "debt": [95000],
    },
    "MUTHOOTFIN": {
        "name": "Muthoot Finance Limited", "sector": "Financial Services",
        "industry": "Gold Loans NBFC", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 58000, "current_price": 1448, "change_percent": 0.38,
        "pe_ratio": 14.8, "pb_ratio": 2.8, "ev_ebitda": 10.5, "dividend_yield": 1.22,
        "high_52w": 2063, "low_52w": 1280,
        "revenue": [10500, 13000, 15500, 18000], "pat": [3600, 4000, 4200, 5000],
        "ebitda": [7000, 8500, 10000, 12000], "cfo": [5000], "capex": [300], "equity": [20000], "debt": [62000],
    },
    "GODREJCP": {
        "name": "Godrej Consumer Products", "sector": "FMCG",
        "industry": "Personal Care & Household Products", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 98000, "current_price": 1018, "change_percent": 0.22,
        "pe_ratio": 45.8, "pb_ratio": 9.2, "ev_ebitda": 30.8, "dividend_yield": 1.22,
        "high_52w": 1412, "low_52w": 898,
        "revenue": [10500, 13000, 14200, 15000], "pat": [1200, 1800, 2100, 2400],
        "ebitda": [2200, 3200, 3500, 3800], "cfo": [2500], "capex": [500], "equity": [10500], "debt": [2500],
    },
    "BERGER": {
        "name": "Berger Paints India Limited", "sector": "Materials",
        "industry": "Paints & Coatings", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 61000, "current_price": 530, "change_percent": 0.45,
        "pe_ratio": 58.8, "pb_ratio": 12.2, "ev_ebitda": 38.8, "dividend_yield": 0.65,
        "high_52w": 620, "low_52w": 445,
        "revenue": [8000, 10200, 10500, 11200], "pat": [700, 900, 1050, 1200],
        "ebitda": [1300, 1700, 1850, 2100], "cfo": [1200], "capex": [500], "equity": [5000], "debt": [500],
    },
    "HAVELLS": {
        "name": "Havells India Limited", "sector": "Consumer",
        "industry": "Consumer Electricals", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 85000, "current_price": 1358, "change_percent": 0.55,
        "pe_ratio": 55.8, "pb_ratio": 12.2, "ev_ebitda": 38.8, "dividend_yield": 0.52,
        "high_52w": 1740, "low_52w": 1208,
        "revenue": [13500, 17200, 18500, 20000], "pat": [900, 1200, 1550, 1800],
        "ebitda": [1450, 2000, 2400, 2800], "cfo": [1800], "capex": [400], "equity": [7000], "debt": [100],
    },
    "POLYCAB": {
        "name": "Polycab India Limited", "sector": "Manufacturing",
        "industry": "Wires, Cables & Electricals", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 90000, "current_price": 6195, "change_percent": 0.72,
        "pe_ratio": 42.8, "pb_ratio": 9.5, "ev_ebitda": 28.8, "dividend_yield": 0.65,
        "high_52w": 7595, "low_52w": 4500,
        "revenue": [10500, 14200, 17500, 20000], "pat": [700, 1020, 1400, 1800],
        "ebitda": [1100, 1600, 2200, 2800], "cfo": [1500], "capex": [500], "equity": [9500], "debt": [100],
    },
    "DMART": {
        "name": "Avenue Supermarts Limited (DMart)", "sector": "Consumer",
        "industry": "Supermarket & Grocery Retail", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 480000, "current_price": 4798, "change_percent": 0.32,
        "pe_ratio": 105.8, "pb_ratio": 18.5, "ev_ebitda": 68.8, "dividend_yield": 0.0,
        "high_52w": 5000, "low_52w": 3340,
        "revenue": [27800, 35000, 42000, 50000], "pat": [1500, 2200, 2700, 3500],
        "ebitda": [2500, 3500, 4200, 5200], "cfo": [4000], "capex": [2500], "equity": [26000], "debt": [500],
    },
    "NAUKRI": {
        "name": "Info Edge (India) Limited", "sector": "Technology",
        "industry": "Online Classifieds & Recruitment", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 95000, "current_price": 7805, "change_percent": 0.48,
        "pe_ratio": 72.8, "pb_ratio": 12.5, "ev_ebitda": 52.8, "dividend_yield": 0.95,
        "high_52w": 8530, "low_52w": 5900,
        "revenue": [1300, 1900, 2500, 2900], "pat": [500, 900, 1100, 1250],
        "ebitda": [650, 1100, 1400, 1700], "cfo": [1300], "capex": [150], "equity": [7600], "debt": [0],
    },
    "COFORGE": {
        "name": "Coforge Limited", "sector": "Technology",
        "industry": "IT Services & Digital Transformation", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 38000, "current_price": 6205, "change_percent": -0.42,
        "pe_ratio": 48.8, "pb_ratio": 12.8, "ev_ebitda": 32.8, "dividend_yield": 1.22,
        "high_52w": 8200, "low_52w": 4520,
        "revenue": [5100, 7200, 9000, 10500], "pat": [500, 680, 750, 850],
        "ebitda": [900, 1200, 1350, 1600], "cfo": [900], "capex": [200], "equity": [3000], "debt": [1200],
    },
    "PERSISTENT": {
        "name": "Persistent Systems Limited", "sector": "Technology",
        "industry": "IT Services & Software Products", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 76000, "current_price": 5100, "change_percent": 0.58,
        "pe_ratio": 55.8, "pb_ratio": 14.5, "ev_ebitda": 38.8, "dividend_yield": 0.52,
        "high_52w": 6500, "low_52w": 3900,
        "revenue": [5200, 7200, 9500, 11500], "pat": [650, 950, 1300, 1700],
        "ebitda": [950, 1350, 1850, 2400], "cfo": [1500], "capex": [200], "equity": [5200], "debt": [200],
    },
    "MPHASIS": {
        "name": "Mphasis Limited", "sector": "Technology",
        "industry": "IT Services & BPO", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 48000, "current_price": 2552, "change_percent": -0.28,
        "pe_ratio": 34.8, "pb_ratio": 7.2, "ev_ebitda": 22.8, "dividend_yield": 2.55,
        "high_52w": 3272, "low_52w": 1902,
        "revenue": [9100, 12000, 13500, 14500], "pat": [1250, 1700, 1850, 2000],
        "ebitda": [2000, 2800, 2900, 3100], "cfo": [2000], "capex": [200], "equity": [6700], "debt": [200],
    },
    "TATATECH": {
        "name": "Tata Technologies Limited", "sector": "Technology",
        "industry": "Engineering R&D Services", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 55000, "current_price": 1102, "change_percent": 0.62,
        "pe_ratio": 62.8, "pb_ratio": 20.5, "ev_ebitda": 45.8, "dividend_yield": 2.05,
        "high_52w": 1400, "low_52w": 810,
        "revenue": [3500, 4500, 5200, 5800], "pat": [450, 600, 720, 820],
        "ebitda": [650, 850, 1050, 1200], "cfo": [900], "capex": [150], "equity": [2700], "debt": [200],
    },
    "TORNTPHARMA": {
        "name": "Torrent Pharmaceuticals", "sector": "Healthcare",
        "industry": "Pharmaceuticals", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 80000, "current_price": 2705, "change_percent": 0.32,
        "pe_ratio": 40.8, "pb_ratio": 9.5, "ev_ebitda": 22.8, "dividend_yield": 1.22,
        "high_52w": 3055, "low_52w": 1950,
        "revenue": [7500, 9000, 10000, 11000], "pat": [900, 1200, 1650, 2000],
        "ebitda": [1900, 2400, 2900, 3300], "cfo": [2000], "capex": [600], "equity": [8000], "debt": [5000],
    },
    "DIVIS": {
        "name": "Divi's Laboratories Limited", "sector": "Healthcare",
        "industry": "Pharma API & Custom Synthesis", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 118000, "current_price": 4450, "change_percent": 0.42,
        "pe_ratio": 58.5, "pb_ratio": 9.8, "ev_ebitda": 38.5, "dividend_yield": 0.95,
        "high_52w": 5052, "low_52w": 3188,
        "revenue": [7000, 8200, 7000, 8500], "pat": [2000, 2500, 1700, 2100],
        "ebitda": [3200, 3800, 2800, 3400], "cfo": [2500], "capex": [800], "equity": [12000], "debt": [0],
    },
    "HDFCLIFE": {
        "name": "HDFC Life Insurance Company", "sector": "Insurance",
        "industry": "Life Insurance", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 145000, "current_price": 680, "change_percent": 0.58,
        "pe_ratio": 80.2, "pb_ratio": 10.5, "ev_ebitda": 55.5, "dividend_yield": 0.38,
        "high_52w": 762, "low_52w": 511,
        "revenue": [60000, 72000, 85000, 98000], "pat": [1200, 1400, 1600, 1800],
        "ebitda": [4000, 4800, 5500, 6500], "cfo": [5000], "capex": [200], "equity": [14000], "debt": [0],
    },
    "SBILIFE": {
        "name": "SBI Life Insurance Company", "sector": "Insurance",
        "industry": "Life Insurance", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 160000, "current_price": 1602, "change_percent": 0.42,
        "pe_ratio": 68.5, "pb_ratio": 10.2, "ev_ebitda": 48.5, "dividend_yield": 0.25,
        "high_52w": 1820, "low_52w": 1265,
        "revenue": [65000, 80000, 95000, 110000], "pat": [1500, 1700, 2100, 2400],
        "ebitda": [5000, 6000, 7200, 8500], "cfo": [6000], "capex": [200], "equity": [16000], "debt": [0],
    },
    "IRFC": {
        "name": "Indian Railway Finance Corporation", "sector": "Financial Services",
        "industry": "Government Finance", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 205000, "current_price": 163, "change_percent": 0.62,
        "pe_ratio": 28.8, "pb_ratio": 3.5, "ev_ebitda": 18.8, "dividend_yield": 1.22,
        "high_52w": 229, "low_52w": 128,
        "revenue": [18000, 22000, 26000, 30000], "pat": [5900, 6300, 6700, 7200],
        "ebitda": [16000, 20000, 24000, 28000], "cfo": [8000], "capex": [100], "equity": [58000], "debt": [352000],
    },
    "LUPIN": {
        "name": "Lupin Limited", "sector": "Healthcare",
        "industry": "Pharmaceuticals", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 95000, "current_price": 2090, "change_percent": 0.78,
        "pe_ratio": 28.5, "pb_ratio": 5.8, "ev_ebitda": 19.5, "dividend_yield": 0.48,
        "high_52w": 2320, "low_52w": 1350,
        "revenue": [15200, 17600, 19000, 21500], "pat": [1100, 1600, 2800, 3500],
        "ebitda": [2400, 3200, 4500, 5500], "cfo": [4000], "capex": [1200], "equity": [16000], "debt": [2000],
    },
    "AUBANK": {
        "name": "AU Small Finance Bank", "sector": "Financial Services",
        "industry": "Small Finance Banking", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 52000, "current_price": 648, "change_percent": 0.85,
        "pe_ratio": 22.5, "pb_ratio": 3.2, "ev_ebitda": 14.5, "dividend_yield": 0.12,
        "high_52w": 815, "low_52w": 548,
        "revenue": [4500, 5800, 7500, 9800], "pat": [1200, 1500, 1800, 2200],
        "ebitda": [3200, 4100, 5500, 7200], "cfo": [3000], "capex": [500], "equity": [16000], "debt": [58000],
    },
    "BANKBARODA": {
        "name": "Bank of Baroda", "sector": "Financial Services",
        "industry": "Public Sector Banking", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 128000, "current_price": 248, "change_percent": 0.92,
        "pe_ratio": 8.5, "pb_ratio": 1.2, "ev_ebitda": 6.5, "dividend_yield": 2.85,
        "high_52w": 280, "low_52w": 195,
        "revenue": [80000, 105000, 130000, 148000], "pat": [7000, 14100, 17800, 19000],
        "ebitda": [28000, 40000, 50000, 58000], "cfo": [20000], "capex": [1500], "equity": [107000], "debt": [180000],
    },
    "CANBK": {
        "name": "Canara Bank", "sector": "Financial Services",
        "industry": "Public Sector Banking", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 95000, "current_price": 105, "change_percent": 0.72,
        "pe_ratio": 7.5, "pb_ratio": 1.1, "ev_ebitda": 5.8, "dividend_yield": 3.5,
        "high_52w": 128, "low_52w": 88,
        "revenue": [68000, 88000, 105000, 120000], "pat": [5700, 10600, 14500, 16800],
        "ebitda": [22000, 34000, 42000, 50000], "cfo": [18000], "capex": [1200], "equity": [88000], "debt": [155000],
    },
    "PIDILITIND": {
        "name": "Pidilite Industries Limited", "sector": "Materials",
        "industry": "Adhesives & Construction Chemicals", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 142000, "current_price": 2798, "change_percent": 0.32,
        "pe_ratio": 82.8, "pb_ratio": 22.8, "ev_ebitda": 56.5, "dividend_yield": 0.55,
        "high_52w": 3100, "low_52w": 2318,
        "revenue": [8500, 10800, 11000, 12200], "pat": [1150, 1600, 1700, 2000],
        "ebitda": [2000, 2800, 2900, 3300], "cfo": [2200], "capex": [500], "equity": [6300], "debt": [100],
    },
    "ALKEM": {
        "name": "Alkem Laboratories", "sector": "Healthcare",
        "industry": "Pharmaceuticals", "cap_type": "mid", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 67000, "current_price": 5620, "change_percent": 0.48,
        "pe_ratio": 28.5, "pb_ratio": 5.8, "ev_ebitda": 19.5, "dividend_yield": 1.02,
        "high_52w": 6300, "low_52w": 4500,
        "revenue": [9200, 11000, 12500, 13500], "pat": [1400, 1800, 2100, 2500],
        "ebitda": [2200, 2700, 3200, 3700], "cfo": [3000], "capex": [600], "equity": [11500], "debt": [500],
    },

    # ──────────────────────────── SMALL CAP (<50K Cr) ────────────────────────
    "IRCTC": {
        "name": "Indian Railway Catering & Tourism", "sector": "Consumer",
        "industry": "Online Travel & Catering", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 44000, "current_price": 780, "change_percent": 1.02,
        "pe_ratio": 45.8, "pb_ratio": 22.8, "ev_ebitda": 32.8, "dividend_yield": 0.75,
        "high_52w": 1100, "low_52w": 728,
        "revenue": [1500, 2500, 3800, 4500], "pat": [500, 950, 1100, 1200],
        "ebitda": [700, 1200, 1500, 1800], "cfo": [1500], "capex": [200], "equity": [2000], "debt": [0],
    },
    "RITES": {
        "name": "RITES Limited", "sector": "Infrastructure",
        "industry": "Engineering Consultancy", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 8500, "current_price": 355, "change_percent": 0.68,
        "pe_ratio": 15.8, "pb_ratio": 3.5, "ev_ebitda": 12.5, "dividend_yield": 4.52,
        "high_52w": 785, "low_52w": 310,
        "revenue": [2200, 2500, 2900, 3200], "pat": [450, 500, 550, 600],
        "ebitda": [750, 850, 950, 1050], "cfo": [600], "capex": [100], "equity": [1700], "debt": [0],
    },
    "IREDA": {
        "name": "Indian Renewable Energy Development Agency", "sector": "Financial Services",
        "industry": "Green Finance NBFC", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 25000, "current_price": 198, "change_percent": 1.55,
        "pe_ratio": 22.5, "pb_ratio": 3.5, "ev_ebitda": 14.5, "dividend_yield": 0.85,
        "high_52w": 310, "low_52w": 152,
        "revenue": [2800, 3500, 4800, 6200], "pat": [800, 1100, 1500, 1900],
        "ebitda": [2200, 2900, 3900, 5100], "cfo": [2500], "capex": [100], "equity": [7200], "debt": [52000],
    },
    "APLAPOLLO": {
        "name": "APL Apollo Tubes Limited", "sector": "Materials",
        "industry": "Steel Tubes & Pipes", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 38000, "current_price": 1488, "change_percent": 0.88,
        "pe_ratio": 48.8, "pb_ratio": 12.5, "ev_ebitda": 32.5, "dividend_yield": 0.52,
        "high_52w": 1842, "low_52w": 1210,
        "revenue": [9000, 12500, 18000, 21000], "pat": [350, 550, 720, 800],
        "ebitda": [600, 900, 1200, 1400], "cfo": [900], "capex": [400], "equity": [3000], "debt": [1500],
    },
    "ASTRAL": {
        "name": "Astral Limited", "sector": "Materials",
        "industry": "Pipes & Adhesives", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 45000, "current_price": 1690, "change_percent": 0.42,
        "pe_ratio": 68.5, "pb_ratio": 15.2, "ev_ebitda": 45.5, "dividend_yield": 0.18,
        "high_52w": 2318, "low_52w": 1460,
        "revenue": [3500, 4800, 5500, 6200], "pat": [300, 500, 600, 700],
        "ebitda": [600, 850, 1000, 1150], "cfo": [900], "capex": [400], "equity": [3000], "debt": [500],
    },
    "SUPREMEIND": {
        "name": "Supreme Industries Limited", "sector": "Materials",
        "industry": "Plastic Pipes & Products", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 28000, "current_price": 2248, "change_percent": 0.62,
        "pe_ratio": 35.8, "pb_ratio": 8.5, "ev_ebitda": 22.5, "dividend_yield": 0.75,
        "high_52w": 2950, "low_52w": 1900,
        "revenue": [6500, 8200, 9500, 10500], "pat": [550, 700, 800, 900],
        "ebitda": [900, 1100, 1300, 1500], "cfo": [1000], "capex": [500], "equity": [3300], "debt": [200],
    },
    "CERA": {
        "name": "Cera Sanitaryware Limited", "sector": "Consumer",
        "industry": "Sanitaryware & Tiles", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 8000, "current_price": 6200, "change_percent": 0.38,
        "pe_ratio": 28.5, "pb_ratio": 5.5, "ev_ebitda": 18.5, "dividend_yield": 1.02,
        "high_52w": 9330, "low_52w": 5990,
        "revenue": [1300, 1700, 2000, 2200], "pat": [175, 245, 290, 330],
        "ebitda": [300, 410, 490, 560], "cfo": [350], "capex": [120], "equity": [1450], "debt": [50],
    },
    "KAJARIA": {
        "name": "Kajaria Ceramics Limited", "sector": "Consumer",
        "industry": "Tiles & Sanitaryware", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 13500, "current_price": 1062, "change_percent": 0.55,
        "pe_ratio": 35.5, "pb_ratio": 6.8, "ev_ebitda": 22.5, "dividend_yield": 0.95,
        "high_52w": 1360, "low_52w": 948,
        "revenue": [3200, 3800, 4200, 4600], "pat": [275, 340, 390, 430],
        "ebitda": [520, 620, 710, 790], "cfo": [600], "capex": [200], "equity": [2000], "debt": [150],
    },
    "VGUARD": {
        "name": "V-Guard Industries Limited", "sector": "Consumer",
        "industry": "Consumer Electricals", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 9500, "current_price": 442, "change_percent": 0.72,
        "pe_ratio": 38.5, "pb_ratio": 7.8, "ev_ebitda": 25.5, "dividend_yield": 0.45,
        "high_52w": 500, "low_52w": 298,
        "revenue": [3500, 4500, 5200, 5800], "pat": [175, 220, 250, 290],
        "ebitda": [320, 400, 470, 540], "cfo": [380], "capex": [100], "equity": [1200], "debt": [50],
    },
    "RELAXO": {
        "name": "Relaxo Footwears Limited", "sector": "Consumer",
        "industry": "Footwear", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 10500, "current_price": 830, "change_percent": -0.32,
        "pe_ratio": 52.8, "pb_ratio": 9.5, "ev_ebitda": 32.5, "dividend_yield": 0.36,
        "high_52w": 1102, "low_52w": 768,
        "revenue": [2600, 3100, 3200, 3400], "pat": [140, 180, 200, 230],
        "ebitda": [280, 340, 370, 420], "cfo": [350], "capex": [150], "equity": [1100], "debt": [100],
    },
    "PAGEIND": {
        "name": "Page Industries Limited", "sector": "Consumer",
        "industry": "Innerwear & Apparel", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 35000, "current_price": 31500, "change_percent": 0.28,
        "pe_ratio": 58.5, "pb_ratio": 25.2, "ev_ebitda": 38.5, "dividend_yield": 1.12,
        "high_52w": 44948, "low_52w": 30500,
        "revenue": [3500, 4400, 4800, 5100], "pat": [400, 540, 580, 620],
        "ebitda": [700, 880, 960, 1020], "cfo": [780], "capex": [150], "equity": [1400], "debt": [150],
    },
    "RADICO": {
        "name": "Radico Khaitan Limited", "sector": "FMCG",
        "industry": "Spirits & Beverages", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 24500, "current_price": 1850, "change_percent": 0.62,
        "pe_ratio": 55.5, "pb_ratio": 9.5, "ev_ebitda": 35.5, "dividend_yield": 0.32,
        "high_52w": 2400, "low_52w": 1478,
        "revenue": [2900, 3300, 3700, 4200], "pat": [200, 280, 350, 420],
        "ebitda": [420, 530, 640, 750], "cfo": [500], "capex": [150], "equity": [2600], "debt": [800],
    },
    "BIOCON": {
        "name": "Biocon Limited", "sector": "Healthcare",
        "industry": "Biologics & Biosimilars", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 25000, "current_price": 210, "change_percent": -0.48,
        "pe_ratio": 62.5, "pb_ratio": 3.5, "ev_ebitda": 22.5, "dividend_yield": 0.24,
        "high_52w": 340, "low_52w": 188,
        "revenue": [8000, 10000, 12500, 14000], "pat": [100, 200, 350, 500],
        "ebitda": [1800, 2200, 2800, 3200], "cfo": [2000], "capex": [2000], "equity": [7000], "debt": [10000],
    },
    "LAURUS": {
        "name": "Laurus Labs Limited", "sector": "Healthcare",
        "industry": "Pharma APIs & FDFs", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 18500, "current_price": 346, "change_percent": 0.88,
        "pe_ratio": 32.5, "pb_ratio": 5.5, "ev_ebitda": 22.5, "dividend_yield": 0.58,
        "high_52w": 560, "low_52w": 300,
        "revenue": [4200, 5300, 4800, 5500], "pat": [800, 990, 600, 700],
        "ebitda": [1400, 1700, 1200, 1450], "cfo": [1000], "capex": [600], "equity": [3400], "debt": [1500],
    },
    "GRANULES": {
        "name": "Granules India Limited", "sector": "Healthcare",
        "industry": "Pharmaceuticals & Nutraceuticals", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 10500, "current_price": 425, "change_percent": 0.72,
        "pe_ratio": 22.5, "pb_ratio": 3.8, "ev_ebitda": 14.5, "dividend_yield": 0.52,
        "high_52w": 550, "low_52w": 365,
        "revenue": [3300, 3900, 4500, 5100], "pat": [350, 420, 490, 550],
        "ebitda": [620, 730, 840, 960], "cfo": [700], "capex": [350], "equity": [2800], "debt": [1500],
    },
    "TANLA": {
        "name": "Tanla Platforms Limited", "sector": "Technology",
        "industry": "CPaaS & Enterprise Messaging", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 8200, "current_price": 590, "change_percent": -0.52,
        "pe_ratio": 15.5, "pb_ratio": 4.2, "ev_ebitda": 10.5, "dividend_yield": 3.05,
        "high_52w": 1000, "low_52w": 540,
        "revenue": [2500, 3200, 3800, 4200], "pat": [400, 550, 600, 620],
        "ebitda": [650, 850, 950, 1000], "cfo": [800], "capex": [100], "equity": [2000], "debt": [50],
    },
    "CDSL": {
        "name": "Central Depository Services (India)", "sector": "Financial Services",
        "industry": "Capital Market Infrastructure", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 18500, "current_price": 1772, "change_percent": 0.62,
        "pe_ratio": 45.5, "pb_ratio": 12.5, "ev_ebitda": 35.5, "dividend_yield": 0.62,
        "high_52w": 2196, "low_52w": 980,
        "revenue": [500, 720, 900, 1100], "pat": [230, 380, 480, 560],
        "ebitda": [310, 500, 640, 750], "cfo": [600], "capex": [30], "equity": [1500], "debt": [0],
    },
    "KFINTECH": {
        "name": "KFin Technologies Limited", "sector": "Financial Services",
        "industry": "Registry & Investor Services", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 15500, "current_price": 1018, "change_percent": 0.78,
        "pe_ratio": 42.5, "pb_ratio": 9.5, "ev_ebitda": 28.5, "dividend_yield": 0.78,
        "high_52w": 1200, "low_52w": 545,
        "revenue": [500, 700, 900, 1100], "pat": [150, 230, 310, 400],
        "ebitda": [220, 330, 450, 570], "cfo": [450], "capex": [40], "equity": [1700], "debt": [0],
    },
    "ANGELONE": {
        "name": "Angel One Limited", "sector": "Financial Services",
        "industry": "Retail Stockbroking", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 20000, "current_price": 2258, "change_percent": 0.92,
        "pe_ratio": 18.5, "pb_ratio": 5.8, "ev_ebitda": 12.5, "dividend_yield": 2.25,
        "high_52w": 3645, "low_52w": 1820,
        "revenue": [1500, 2500, 4200, 5200], "pat": [500, 900, 1500, 1800],
        "ebitda": [700, 1200, 2000, 2500], "cfo": [2000], "capex": [200], "equity": [3500], "debt": [100],
    },
    "METROPOLIS": {
        "name": "Metropolis Healthcare Limited", "sector": "Healthcare",
        "industry": "Diagnostics & Pathology", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 7200, "current_price": 1440, "change_percent": 0.48,
        "pe_ratio": 38.5, "pb_ratio": 7.5, "ev_ebitda": 25.5, "dividend_yield": 0.85,
        "high_52w": 2058, "low_52w": 1350,
        "revenue": [1000, 1200, 1350, 1500], "pat": [130, 165, 185, 210],
        "ebitda": [240, 290, 330, 370], "cfo": [280], "capex": [120], "equity": [960], "debt": [50],
    },
    "DIXON": {
        "name": "Dixon Technologies (India) Limited", "sector": "Manufacturing",
        "industry": "EMS & Consumer Electronics", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 45000, "current_price": 7592, "change_percent": 1.25,
        "pe_ratio": 95.5, "pb_ratio": 22.5, "ev_ebitda": 65.5, "dividend_yield": 0.12,
        "high_52w": 9201, "low_52w": 4810,
        "revenue": [6500, 10000, 14000, 18000], "pat": [200, 350, 500, 620],
        "ebitda": [350, 580, 820, 1050], "cfo": [700], "capex": [400], "equity": [2000], "debt": [800],
    },
    "KAYNES": {
        "name": "Kaynes Technology India Limited", "sector": "Manufacturing",
        "industry": "EMS & IoT Manufacturing", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 9200, "current_price": 2390, "change_percent": 1.35,
        "pe_ratio": 75.5, "pb_ratio": 15.5, "ev_ebitda": 52.5, "dividend_yield": 0.08,
        "high_52w": 3880, "low_52w": 1752,
        "revenue": [950, 1380, 1900, 2600], "pat": [60, 110, 150, 200],
        "ebitda": [100, 180, 260, 360], "cfo": [200], "capex": [250], "equity": [600], "debt": [500],
    },
    "SYRMA": {
        "name": "Syrma SGS Technology Limited", "sector": "Manufacturing",
        "industry": "EMS & PCB Assembly", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 7500, "current_price": 565, "change_percent": 0.92,
        "pe_ratio": 55.5, "pb_ratio": 8.5, "ev_ebitda": 38.5, "dividend_yield": 0.12,
        "high_52w": 750, "low_52w": 398,
        "revenue": [900, 1400, 2100, 2800], "pat": [50, 100, 140, 180],
        "ebitda": [90, 170, 250, 340], "cfo": [180], "capex": [200], "equity": [900], "debt": [400],
    },
    "MAPMYINDIA": {
        "name": "C.E. Info Systems (MapmyIndia)", "sector": "Technology",
        "industry": "Digital Mapping & Location Tech", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 8500, "current_price": 1642, "change_percent": -0.32,
        "pe_ratio": 52.5, "pb_ratio": 12.5, "ev_ebitda": 38.5, "dividend_yield": 0.42,
        "high_52w": 2380, "low_52w": 1450,
        "revenue": [200, 300, 380, 450], "pat": [90, 140, 170, 200],
        "ebitda": [120, 180, 225, 270], "cfo": [200], "capex": [40], "equity": [680], "debt": [0],
    },
    "CREDITACC": {
        "name": "CreditAccess Grameen Limited", "sector": "Financial Services",
        "industry": "Microfinance", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 18000, "current_price": 1095, "change_percent": 0.48,
        "pe_ratio": 15.5, "pb_ratio": 2.8, "ev_ebitda": 10.5, "dividend_yield": 1.15,
        "high_52w": 1890, "low_52w": 940,
        "revenue": [1800, 2500, 3500, 4500], "pat": [600, 1000, 1400, 1600],
        "ebitda": [1500, 2100, 2900, 3700], "cfo": [1800], "capex": [100], "equity": [6500], "debt": [22000],
    },
    "AAVAS": {
        "name": "AAVAS Financiers Limited", "sector": "Financial Services",
        "industry": "Affordable Housing Finance", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 12000, "current_price": 1552, "change_percent": 0.62,
        "pe_ratio": 22.5, "pb_ratio": 3.2, "ev_ebitda": 14.5, "dividend_yield": 0.12,
        "high_52w": 1960, "low_52w": 1310,
        "revenue": [1000, 1300, 1650, 2100], "pat": [280, 370, 460, 580],
        "ebitda": [850, 1100, 1400, 1800], "cfo": [500], "capex": [50], "equity": [3700], "debt": [15000],
    },
    "NYKAA": {
        "name": "FSN E-Commerce Ventures (Nykaa)", "sector": "Consumer",
        "industry": "Beauty & Fashion E-Commerce", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 38000, "current_price": 185, "change_percent": -0.62,
        "pe_ratio": 288.5, "pb_ratio": 22.5, "ev_ebitda": 105.5, "dividend_yield": 0.0,
        "high_52w": 228, "low_52w": 148,
        "revenue": [3700, 5100, 6400, 7800], "pat": [5, 30, 80, 130],
        "ebitda": [80, 200, 350, 520], "cfo": [300], "capex": [500], "equity": [1700], "debt": [800],
    },
    "UJJIVAN": {
        "name": "Ujjivan Small Finance Bank", "sector": "Financial Services",
        "industry": "Small Finance Banking", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 12500, "current_price": 39, "change_percent": 0.52,
        "pe_ratio": 8.5, "pb_ratio": 1.5, "ev_ebitda": 6.5, "dividend_yield": 2.02,
        "high_52w": 55, "low_52w": 32,
        "revenue": [2800, 3800, 5200, 6200], "pat": [1100, 1500, 1900, 1800],
        "ebitda": [2400, 3200, 4400, 5200], "cfo": [2500], "capex": [300], "equity": [8500], "debt": [38000],
    },
    "EQUITASBNK": {
        "name": "Equitas Small Finance Bank", "sector": "Financial Services",
        "industry": "Small Finance Banking", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 8500, "current_price": 80, "change_percent": 0.42,
        "pe_ratio": 10.5, "pb_ratio": 1.2, "ev_ebitda": 7.5, "dividend_yield": 1.25,
        "high_52w": 108, "low_52w": 67,
        "revenue": [1800, 2500, 3400, 4200], "pat": [500, 700, 850, 1000],
        "ebitda": [1500, 2100, 2900, 3600], "cfo": [1800], "capex": [200], "equity": [7000], "debt": [28000],
    },
    "ROUTE": {
        "name": "Route Mobile Limited", "sector": "Technology",
        "industry": "CPaaS & Cloud Communications", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 4500, "current_price": 1380, "change_percent": -0.42,
        "pe_ratio": 25.5, "pb_ratio": 3.8, "ev_ebitda": 15.5, "dividend_yield": 0.58,
        "high_52w": 1970, "low_52w": 1180,
        "revenue": [1200, 1600, 2000, 2400], "pat": [120, 165, 190, 220],
        "ebitda": [200, 270, 330, 400], "cfo": [300], "capex": [100], "equity": [1200], "debt": [100],
    },
    "NAZARA": {
        "name": "Nazara Technologies Limited", "sector": "Technology",
        "industry": "Gaming & Sports Media", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 8200, "current_price": 800, "change_percent": 1.02,
        "pe_ratio": 95.5, "pb_ratio": 8.5, "ev_ebitda": 68.5, "dividend_yield": 0.0,
        "high_52w": 1065, "low_52w": 720,
        "revenue": [700, 1050, 1300, 1600], "pat": [40, 65, 85, 110],
        "ebitda": [70, 110, 145, 188], "cfo": [150], "capex": [80], "equity": [950], "debt": [50],
    },
    "DATAMATICS": {
        "name": "Datamatics Global Services", "sector": "Technology",
        "industry": "AI, Automation & IT Services", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 4200, "current_price": 680, "change_percent": 0.62,
        "pe_ratio": 18.5, "pb_ratio": 3.2, "ev_ebitda": 12.5, "dividend_yield": 0.88,
        "high_52w": 800, "low_52w": 450,
        "revenue": [1200, 1500, 1700, 1900], "pat": [140, 180, 210, 250],
        "ebitda": [230, 285, 330, 390], "cfo": [280], "capex": [80], "equity": [1300], "debt": [100],
    },
    "AMBER": {
        "name": "Amber Enterprises India Limited", "sector": "Manufacturing",
        "industry": "AC Components & EMS", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 9800, "current_price": 3048, "change_percent": 0.78,
        "pe_ratio": 45.5, "pb_ratio": 6.5, "ev_ebitda": 28.5, "dividend_yield": 0.08,
        "high_52w": 4000, "low_52w": 2100,
        "revenue": [5000, 7000, 8500, 10000], "pat": [100, 150, 190, 240],
        "ebitda": [250, 380, 480, 590], "cfo": [400], "capex": [400], "equity": [1500], "debt": [1500],
    },
    "PNBHOUSING": {
        "name": "PNB Housing Finance Limited", "sector": "Financial Services",
        "industry": "Housing Finance NBFC", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 22000, "current_price": 898, "change_percent": 0.68,
        "pe_ratio": 14.5, "pb_ratio": 1.8, "ev_ebitda": 9.5, "dividend_yield": 0.56,
        "high_52w": 1035, "low_52w": 650,
        "revenue": [6500, 7000, 7500, 8500], "pat": [1000, 1300, 1600, 1900],
        "ebitda": [5500, 6000, 6500, 7500], "cfo": [2000], "capex": [100], "equity": [12000], "debt": [80000],
    },
    "RAILVIKAS": {
        "name": "Rail Vikas Nigam Limited (RVNL)", "sector": "Infrastructure",
        "industry": "Railway Infrastructure", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 48000, "current_price": 232, "change_percent": 1.08,
        "pe_ratio": 35.5, "pb_ratio": 8.5, "ev_ebitda": 22.5, "dividend_yield": 0.85,
        "high_52w": 648, "low_52w": 195,
        "revenue": [12000, 17000, 22000, 26000], "pat": [900, 1200, 1450, 1700],
        "ebitda": [1400, 1900, 2400, 2900], "cfo": [1500], "capex": [300], "equity": [5600], "debt": [1000],
    },
    "JINDALSAW": {
        "name": "Jindal SAW Limited", "sector": "Materials",
        "industry": "Steel Pipes & Tubes", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 23000, "current_price": 360, "change_percent": 0.72,
        "pe_ratio": 12.5, "pb_ratio": 1.8, "ev_ebitda": 8.5, "dividend_yield": 1.52,
        "high_52w": 510, "low_52w": 298,
        "revenue": [8500, 11000, 14000, 15000], "pat": [850, 1500, 2200, 2300],
        "ebitda": [1200, 2000, 2900, 3100], "cfo": [2000], "capex": [600], "equity": [12500], "debt": [4500],
    },
    "CROMPTON": {
        "name": "Crompton Greaves Consumer Electricals", "sector": "Consumer",
        "industry": "Consumer Electricals & Pumps", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 15500, "current_price": 245, "change_percent": 0.52,
        "pe_ratio": 28.5, "pb_ratio": 5.5, "ev_ebitda": 18.5, "dividend_yield": 0.82,
        "high_52w": 305, "low_52w": 218,
        "revenue": [5200, 6200, 6900, 7500], "pat": [340, 400, 430, 500],
        "ebitda": [620, 740, 820, 910], "cfo": [650], "capex": [150], "equity": [2800], "debt": [250],
    },
    "CARTRADE": {
        "name": "CarTrade Tech Limited", "sector": "Technology",
        "industry": "Online Auto Classifieds", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 4800, "current_price": 1048, "change_percent": 0.42,
        "pe_ratio": 85.5, "pb_ratio": 5.8, "ev_ebitda": 52.5, "dividend_yield": 0.0,
        "high_52w": 1448, "low_52w": 690,
        "revenue": [280, 380, 480, 580], "pat": [10, 30, 50, 70],
        "ebitda": [20, 55, 85, 120], "cfo": [100], "capex": [40], "equity": [830], "debt": [0],
    },
    "BSOFT": {
        "name": "Birlasoft Limited", "sector": "Technology",
        "industry": "IT Services & Enterprise Digital", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 18500, "current_price": 670, "change_percent": 0.68,
        "pe_ratio": 28.5, "pb_ratio": 5.2, "ev_ebitda": 18.2, "dividend_yield": 1.12,
        "high_52w": 860, "low_52w": 520,
        "revenue": [4100, 4800, 5200, 5800], "pat": [460, 330, 560, 620],
        "ebitda": [640, 710, 840, 950], "cfo": [700], "capex": [120], "equity": [2800], "debt": [0],
    },
    "ZENSARTECH": {
        "name": "Zensar Technologies Limited", "sector": "Technology",
        "industry": "IT Consulting & Software", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 16200, "current_price": 715, "change_percent": 0.52,
        "pe_ratio": 24.8, "pb_ratio": 4.5, "ev_ebitda": 15.5, "dividend_yield": 1.45,
        "high_52w": 820, "low_52w": 470,
        "revenue": [4200, 4840, 4900, 5400], "pat": [410, 325, 665, 710],
        "ebitda": [610, 560, 880, 960], "cfo": [750], "capex": [100], "equity": [3200], "debt": [0],
    },
    "CYIENT": {
        "name": "Cyient Limited", "sector": "Technology",
        "industry": "Engineering & Technology Solutions", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 19500, "current_price": 1780, "change_percent": 0.42,
        "pe_ratio": 28.2, "pb_ratio": 5.1, "ev_ebitda": 17.8, "dividend_yield": 1.68,
        "high_52w": 2450, "low_52w": 1560,
        "revenue": [4500, 6000, 7100, 7800], "pat": [520, 510, 690, 760],
        "ebitda": [820, 1080, 1280, 1420], "cfo": [900], "capex": [150], "equity": [3800], "debt": [800],
    },
    "SONACOMS": {
        "name": "Sona BLW Precision Forgings", "sector": "Auto",
        "industry": "Automotive Systems & EV Components", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 42000, "current_price": 710, "change_percent": 0.88,
        "pe_ratio": 72.5, "pb_ratio": 14.2, "ev_ebitda": 45.2, "dividend_yield": 0.42,
        "high_52w": 785, "low_52w": 510,
        "revenue": [2100, 2670, 3180, 3900], "pat": [340, 395, 520, 640],
        "ebitda": [560, 690, 890, 1100], "cfo": [750], "capex": [350], "equity": [3000], "debt": [400],
    },
    "CRAFTSMAN": {
        "name": "Craftsman Automation Limited", "sector": "Auto",
        "industry": "Precision Engineering & Auto Components", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 11500, "current_price": 5450, "change_percent": 0.65,
        "pe_ratio": 38.5, "pb_ratio": 6.8, "ev_ebitda": 16.5, "dividend_yield": 0.22,
        "high_52w": 6300, "low_52w": 3900,
        "revenue": [2200, 3180, 4450, 5200], "pat": [160, 248, 305, 360],
        "ebitda": [520, 680, 920, 1100], "cfo": [700], "capex": [450], "equity": [1800], "debt": [1200],
    },
    "CEATLTD": {
        "name": "CEAT Limited", "sector": "Auto",
        "industry": "Tyres & Rubber Products", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 11000, "current_price": 2720, "change_percent": 0.35,
        "pe_ratio": 18.2, "pb_ratio": 2.8, "ev_ebitda": 10.5, "dividend_yield": 1.10,
        "high_52w": 3150, "low_52w": 2100,
        "revenue": [9300, 11300, 11950, 13100], "pat": [70, 180, 630, 680],
        "ebitda": [710, 970, 1620, 1750], "cfo": [1200], "capex": [700], "equity": [3800], "debt": [2100],
    },
    "SUVENPHAR": {
        "name": "Suven Pharmaceuticals Limited", "sector": "Healthcare",
        "industry": "Pharma CDMO & Specialty Chemicals", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 16000, "current_price": 628, "change_percent": 0.58,
        "pe_ratio": 48.5, "pb_ratio": 8.2, "ev_ebitda": 32.5, "dividend_yield": 0.35,
        "high_52w": 740, "low_52w": 460,
        "revenue": [1320, 1340, 1050, 1280], "pat": [450, 410, 300, 360],
        "ebitda": [600, 580, 420, 510], "cfo": [450], "capex": [150], "equity": [1950], "debt": [0],
    },
    "JBCHEPHARM": {
        "name": "J.B. Chemicals & Pharmaceuticals", "sector": "Healthcare",
        "industry": "Pharmaceuticals & Formulations", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 28000, "current_price": 1810, "change_percent": 0.72,
        "pe_ratio": 49.5, "pb_ratio": 9.8, "ev_ebitda": 30.5, "dividend_yield": 0.48,
        "high_52w": 1980, "low_52w": 1320,
        "revenue": [2420, 3150, 3480, 3950], "pat": [380, 410, 550, 640],
        "ebitda": [580, 760, 960, 1120], "cfo": [800], "capex": [200], "equity": [2850], "debt": [300],
    },
    "NATCOPHARM": {
        "name": "Natco Pharma Limited", "sector": "Healthcare",
        "industry": "Pharma APIs & Formulations", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 22000, "current_price": 1230, "change_percent": 1.15,
        "pe_ratio": 16.5, "pb_ratio": 3.8, "ev_ebitda": 11.2, "dividend_yield": 1.25,
        "high_52w": 1580, "low_52w": 780,
        "revenue": [2040, 2810, 3960, 4400], "pat": [170, 715, 1388, 1550],
        "ebitda": [380, 1020, 1850, 2050], "cfo": [1400], "capex": [250], "equity": [5800], "debt": [300],
    },
    "ECLERX": {
        "name": "eClerx Services Limited", "sector": "Technology",
        "industry": "KPO & Analytics Services", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 14000, "current_price": 2860, "change_percent": 0.62,
        "pe_ratio": 26.5, "pb_ratio": 6.8, "ev_ebitda": 16.8, "dividend_yield": 0.05,
        "high_52w": 3200, "low_52w": 2100,
        "revenue": [2160, 2670, 2900, 3250], "pat": [415, 488, 510, 570],
        "ebitda": [670, 780, 820, 910], "cfo": [680], "capex": [100], "equity": [2100], "debt": [0],
    },
    "HFCL": {
        "name": "HFCL Limited", "sector": "Telecom",
        "industry": "Telecom Equipment & Optical Fiber", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 16500, "current_price": 115, "change_percent": 0.95,
        "pe_ratio": 48.5, "pb_ratio": 4.8, "ev_ebitda": 25.5, "dividend_yield": 0.18,
        "high_52w": 158, "low_52w": 68,
        "revenue": [4700, 4740, 4460, 5100], "pat": [325, 318, 338, 410],
        "ebitda": [690, 660, 620, 750], "cfo": [550], "capex": [300], "equity": [3400], "debt": [800],
    },
    "TEJASNET": {
        "name": "Tejas Networks Limited", "sector": "Telecom",
        "industry": "Telecom Hardware & Networking", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 21000, "current_price": 1230, "change_percent": 1.42,
        "pe_ratio": 85.0, "pb_ratio": 7.2, "ev_ebitda": 42.0, "dividend_yield": 0.0,
        "high_52w": 1490, "low_52w": 650,
        "revenue": [550, 920, 2470, 3800], "pat": [-60, -35, 63, 180],
        "ebitda": [40, 75, 290, 520], "cfo": [350], "capex": [400], "equity": [2900], "debt": [1200],
    },
    "CENTURYPLY": {
        "name": "Century Plyboards (India) Limited", "sector": "Materials",
        "industry": "Plywood, MDF & Laminates", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 18000, "current_price": 810, "change_percent": 0.48,
        "pe_ratio": 52.5, "pb_ratio": 8.5, "ev_ebitda": 32.5, "dividend_yield": 0.12,
        "high_52w": 915, "low_52w": 610,
        "revenue": [3000, 3620, 3900, 4350], "pat": [310, 380, 350, 390],
        "ebitda": [530, 610, 590, 680], "cfo": [550], "capex": [350], "equity": [2150], "debt": [500],
    },
    "GREENPANEL": {
        "name": "Greenpanel Industries Limited", "sector": "Materials",
        "industry": "MDF & Wood Panels", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 4200, "current_price": 342, "change_percent": -0.28,
        "pe_ratio": 28.5, "pb_ratio": 3.2, "ev_ebitda": 16.5, "dividend_yield": 0.44,
        "high_52w": 460, "low_52w": 290,
        "revenue": [1620, 1780, 1560, 1720], "pat": [240, 190, 140, 165],
        "ebitda": [430, 360, 270, 310], "cfo": [300], "capex": [200], "equity": [1320], "debt": [250],
    },
    "HOMEFIRST": {
        "name": "Home First Finance Company", "sector": "Financial Services",
        "industry": "Affordable Housing Finance", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 9500, "current_price": 1080, "change_percent": 0.78,
        "pe_ratio": 30.5, "pb_ratio": 4.5, "ev_ebitda": 20.2, "dividend_yield": 0.32,
        "high_52w": 1180, "low_52w": 760,
        "revenue": [600, 790, 1150, 1450], "pat": [186, 228, 305, 380],
        "ebitda": [480, 620, 890, 1120], "cfo": [400], "capex": [30], "equity": [2100], "debt": [7800],
    },
    "MANAPPURAM": {
        "name": "Manappuram Finance Limited", "sector": "Financial Services",
        "industry": "Gold Loans & Microfinance", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 17500, "current_price": 206, "change_percent": 0.65,
        "pe_ratio": 7.8, "pb_ratio": 1.4, "ev_ebitda": 5.8, "dividend_yield": 1.95,
        "high_52w": 230, "low_52w": 138,
        "revenue": [6100, 6700, 8700, 10200], "pat": [1320, 1500, 2190, 2400],
        "ebitda": [4200, 4600, 6100, 7200], "cfo": [3500], "capex": [150], "equity": [12500], "debt": [32000],
    },
    "CANFINHOME": {
        "name": "Can Fin Homes Limited", "sector": "Financial Services",
        "industry": "Housing Finance NBFC", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 11000, "current_price": 825, "change_percent": 0.42,
        "pe_ratio": 14.2, "pb_ratio": 2.6, "ev_ebitda": 10.8, "dividend_yield": 0.48,
        "high_52w": 910, "low_52w": 680,
        "revenue": [2000, 2750, 3500, 4100], "pat": [470, 620, 750, 860],
        "ebitda": [1800, 2450, 3100, 3650], "cfo": [1500], "capex": [20], "equity": [4200], "debt": [31000],
    },
    "SAPPHIRE": {
        "name": "Sapphire Foods India (KFC/Pizza Hut)", "sector": "Consumer",
        "industry": "Quick Service Restaurants (QSR)", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 9200, "current_price": 340, "change_percent": 0.32,
        "pe_ratio": 125.0, "pb_ratio": 7.2, "ev_ebitda": 28.5, "dividend_yield": 0.0,
        "high_52w": 380, "low_52w": 280,
        "revenue": [1720, 2260, 2590, 2950], "pat": [46, 233, 51, 85],
        "ebitda": [310, 430, 460, 540], "cfo": [450], "capex": [250], "equity": [1280], "debt": [850],
    },
    "DEVYANI": {
        "name": "Devyani International (KFC/Costa Coffee)", "sector": "Consumer",
        "industry": "Quick Service Restaurants (QSR)", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 21000, "current_price": 174, "change_percent": -0.42,
        "pe_ratio": 210.0, "pb_ratio": 18.5, "ev_ebitda": 35.2, "dividend_yield": 0.0,
        "high_52w": 205, "low_52w": 142,
        "revenue": [2080, 2990, 3550, 4200], "pat": [155, 263, -10, 55],
        "ebitda": [470, 650, 680, 820], "cfo": [650], "capex": [400], "equity": [1150], "debt": [1800],
    },
    "WESTLIFE": {
        "name": "Westlife Foodworld (McDonald's India)", "sector": "Consumer",
        "industry": "Quick Service Restaurants (QSR)", "cap_type": "small", "exchange": "NSE", "currency": "INR",
        "market_cap_cr": 12500, "current_price": 802, "change_percent": 0.18,
        "pe_ratio": 145.0, "pb_ratio": 22.0, "ev_ebitda": 36.5, "dividend_yield": 0.42,
        "high_52w": 965, "low_52w": 710,
        "revenue": [1580, 2270, 2390, 2680], "pat": [ -2, 112, 69, 92],
        "ebitda": [210, 370, 360, 420], "cfo": [380], "capex": [220], "equity": [570], "debt": [980],
    },
}


# ─── Scoring Function ─────────────────────────────────────────────────────────
def _score_stock(data: dict, weights: dict) -> dict:
    rev    = data.get("revenue", [1] * 4)
    pat    = data.get("pat",     [1] * 4)
    ebitda = data.get("ebitda",  [1] * 4)
    cfo    = data.get("cfo",     [1])
    capex  = data.get("capex",   [1])
    equity = data.get("equity",  [1])
    debt   = data.get("debt",    [1])

    rev_3y  = FinancialEngine.calculate_cagr(rev[-4], rev[-1], 3)
    pat_3y  = FinancialEngine.calculate_cagr(pat[-4], pat[-1], 3)

    last_rev    = max(1.0, rev[-1])
    last_equity = max(1.0, equity[-1])
    last_cap_em = max(1.0, equity[-1] + debt[-1])
    ebitda_margin = (ebitda[-1] / last_rev) * 100
    roe  = (pat[-1] / last_equity) * 100
    roce = ((ebitda[-1] * 0.82) / last_cap_em) * 100
    fcf  = cfo[-1] - capex[-1]
    fcf_margin = (fcf / last_rev) * 100

    growth_score  = min(100.0, max(0.0, (rev_3y + pat_3y) * 2.5))
    quality_score = min(100.0, max(0.0, (roe * 0.4) + (ebitda_margin * 0.4) + (fcf_margin * 1.0)))
    pe  = data.get("pe_ratio", 30)
    pb  = data.get("pb_ratio", 3)
    ev_eb = data.get("ev_ebitda", 15)
    value_score = min(100.0, max(0.0, 100 - (pe * 0.8) - (pb * 2) - (ev_eb * 0.5)))

    curr   = data.get("current_price", 100)
    hi_52w = data.get("high_52w", curr * 1.2)
    lo_52w = data.get("low_52w",  curr * 0.8)
    rng = hi_52w - lo_52w
    pct_from_low = ((curr - lo_52w) / max(1.0, rng)) * 100 if rng > 0 else 50
    momentum_score = min(100.0, max(0.0, pct_from_low))

    composite = (
        weights["growth"]   * growth_score +
        weights["quality"]  * quality_score +
        weights["value"]    * value_score +
        weights["momentum"] * momentum_score
    )

    return {
        "composite":      round(composite, 2),
        "growth_score":   round(growth_score, 2),
        "quality_score":  round(quality_score, 2),
        "value_score":    round(value_score, 2),
        "momentum_score": round(momentum_score, 2),
        "rev_3y_cagr":    round(rev_3y, 2),
        "pat_3y_cagr":    round(pat_3y, 2),
        "roe":            round(roe, 2),
        "ebitda_margin":  round(ebitda_margin, 2),
        "pe_ratio":       pe,
        "pb_ratio":       pb,
        "div_yield":      data.get("dividend_yield", 0),
    }


def _build_rationale(data: dict, scores: dict, horizon: str) -> List[str]:
    points = []
    if scores["rev_3y_cagr"] >= 15:
        points.append(f"Revenue CAGR of {scores['rev_3y_cagr']:.1f}% over 3 years demonstrates strong top-line momentum.")
    if scores["pat_3y_cagr"] >= 15:
        points.append(f"PAT growth of {scores['pat_3y_cagr']:.1f}% CAGR shows improving profitability.")
    if scores["roe"] >= 15:
        points.append(f"ROE of {scores['roe']:.1f}% indicates efficient use of shareholder capital.")
    if scores["ebitda_margin"] >= 20:
        points.append(f"EBITDA margin of {scores['ebitda_margin']:.1f}% reflects strong pricing power.")
    if scores["value_score"] >= 55:
        points.append(f"Trading at P/E {scores['pe_ratio']:.1f}x — attractively valued relative to growth profile.")
    if scores["momentum_score"] >= 65:
        points.append("Price momentum near 52-week highs signals sustained market confidence.")
    if scores["momentum_score"] <= 30:
        points.append("Significant pullback from 52-week highs may present a re-entry opportunity.")
    if horizon == "long":
        points.append("Well-positioned as a long-horizon quality compounder.")
    if horizon == "short":
        points.append("Near-term price momentum supports a short-horizon tactical trade.")
    if not points:
        points.append("Balanced risk-return profile across growth, quality, and valuation metrics.")
    return points[:4]


# ─── Recommendation Endpoint ──────────────────────────────────────────────────
@router.get("")
def get_recommendations(
    cap_type: Optional[str]   = Query(None, description="small | mid | large"),
    sector:   Optional[str]   = Query(None, description="Technology, Financial Services, Energy, Healthcare, FMCG, Auto, Materials, Telecom, Insurance, Manufacturing, Infrastructure, Consumer"),
    horizon:  Optional[str]   = Query("medium", description="short | medium | long"),
    exchange: Optional[str]   = Query(None, description="NSE | NASDAQ | NYSE"),
    min_roe:  Optional[float] = Query(None, description="Minimum ROE %"),
    max_pe:   Optional[float] = Query(None, description="Maximum P/E ratio"),
    top_n:    int             = Query(5, ge=1, le=10),
):
    """
    Recommend top N stocks based on investment preferences.
    Scores 110+ stocks across growth, quality, value and momentum
    with horizon-tuned weighting across Small, Mid and Large caps.
    """
    horizon_key = (horizon or "medium").lower()
    if horizon_key not in HORIZON_WEIGHTS:
        horizon_key = "medium"
    weights = HORIZON_WEIGHTS[horizon_key]
    cap_filter = cap_type.lower() if cap_type else None
    sector_filter = SECTOR_ALIASES.get((sector or "").lower(), sector) if sector else None

    scored = []

    # ── 1. Original 13 seeded stocks via StockDataService ──
    for ticker, meta in SEEDED_META.items():
        if exchange and meta["exchange"].upper() != exchange.upper():
            continue
        if sector_filter and sector_filter.lower() not in meta["sector"].lower():
            continue
        data = StockDataService.get_stock_overview(ticker)
        if not data:
            continue
        mkt_cap = data.get("market_cap_cr", 0)
        if cap_filter:
            lo, hi = CAP_THRESHOLDS.get(cap_filter, (0, 99_999_999))
            if not (lo <= mkt_cap < hi) and meta.get("cap_type") != cap_filter:
                continue
        scores = _score_stock(data, weights)
        if min_roe is not None and scores["roe"] < min_roe:
            continue
        if max_pe is not None and scores["pe_ratio"] > max_pe:
            continue
        scored.append({
            "rank": 0, "ticker": data["ticker"], "name": data["name"],
            "sector": data.get("sector", meta["sector"]), "industry": data.get("industry", ""),
            "exchange": data.get("exchange", meta["exchange"]), "market_cap_cr": mkt_cap,
            "current_price": data.get("current_price"), "currency": data.get("currency", "INR"),
            "change_percent": data.get("change_percent", 0),
            "pe_ratio": data.get("pe_ratio"), "pb_ratio": data.get("pb_ratio"),
            "div_yield": data.get("dividend_yield"),
            "high_52w": data.get("high_52w"), "low_52w": data.get("low_52w"),
            "scores": scores,
            "rationale": _build_rationale(data, scores, horizon_key),
        })

    # ── 2. Extended mini-universe stocks ──
    for ticker, mini in MINI_UNIVERSE.items():
        if exchange and mini["exchange"].upper() != exchange.upper():
            continue
        if sector_filter and sector_filter.lower() not in mini["sector"].lower():
            continue
        if cap_filter:
            lo, hi = CAP_THRESHOLDS.get(cap_filter, (0, 99_999_999))
            mkt_cap = mini.get("market_cap_cr", 0)
            if not (lo <= mkt_cap < hi) and mini.get("cap_type") != cap_filter:
                continue
        scores = _score_stock(mini, weights)
        if min_roe is not None and scores["roe"] < min_roe:
            continue
        if max_pe is not None and scores["pe_ratio"] > max_pe:
            continue
        scored.append({
            "rank": 0, "ticker": mini.get("ticker", ticker), "name": mini["name"],
            "sector": mini["sector"], "industry": mini["industry"],
            "exchange": mini["exchange"], "market_cap_cr": mini.get("market_cap_cr", 0),
            "current_price": mini.get("current_price"), "currency": mini.get("currency", "INR"),
            "change_percent": mini.get("change_percent", 0),
            "pe_ratio": mini.get("pe_ratio"), "pb_ratio": mini.get("pb_ratio"),
            "div_yield": mini.get("dividend_yield"),
            "high_52w": mini.get("high_52w"), "low_52w": mini.get("low_52w"),
            "scores": scores,
            "rationale": _build_rationale(mini, scores, horizon_key),
        })

    scored.sort(key=lambda x: x["scores"]["composite"], reverse=True)
    for i, s in enumerate(scored[:top_n]):
        s["rank"] = i + 1

    return {
        "filters": {"cap_type": cap_type, "sector": sector_filter, "horizon": horizon_key, "exchange": exchange, "min_roe": min_roe, "max_pe": max_pe},
        "horizon_weights": weights,
        "total_screened": len(SEEDED_META) + len(MINI_UNIVERSE),
        "matches_found": len(scored),
        "recommendations": scored[:top_n],
    }
