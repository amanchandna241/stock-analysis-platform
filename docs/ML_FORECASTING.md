# 🔮 ML Ensemble Price Target Forecasting & Volatility Regimes

An institutional-grade Machine Learning time-series forecasting and volatility classification engine integrated into the **Antigravity Stock Research & Analysis Platform**.

---

## 📌 Executive Summary

The **ML Ensemble Forecasting Engine** provides multi-horizon equity price target projections ($30\text{-day}, 90\text{-day}, 180\text{-day}$) by combining **Geometric Brownian Motion (GBM) Monte Carlo simulations**, **dampened polynomial trend regressions**, and **Parkinson intraday volatility metrics**. 

Rather than relying on single point estimate forecasts, the engine constructs **80% and 95% confidence interval channels** and automatically classifies stocks into distinct **Volatility Regimes** (`Low Volatility`, `Breakout Risk`, `Drawdown Hazard`, `Mean-Reverting`).

---

## 🧮 Mathematical Foundations & Methodology

### 1. Geometric Brownian Motion (GBM) & Monte Carlo Simulation
Under market asset price dynamics, stock prices follow continuous-time stochastic process model:

$$S_t = S_0 \exp\left( \left( \mu - \frac{1}{2}\sigma^2 \right) t + \sigma \sqrt{t} \, Z_t \right)$$

Where:
- $S_0$: Current real-time spot price
- $\mu$: Annualized daily log return drift ($\mu = \mathbb{E}[\ln(S_t / S_{t-1})] \times 252$)
- $\sigma$: Close-to-Close annualized volatility ($\sigma = \text{std}(\text{returns}) \times \sqrt{252}$)
- $Z_t \sim \mathcal{N}(0, 1)$: Standard normal stochastic random variable

The model executes **1,000 independent Monte Carlo price path iterations** over the forecast horizon.

#### Confidence Intervals & Quantile Percentiles:
- **Bear Case Target**: $10^{\text{th}}$ percentile of final simulated prices
- **Base Case Target**: $50^{\text{th}}$ percentile (Median) of final simulated prices
- **Bull Case Target**: $90^{\text{th}}$ percentile of final simulated prices
- **Upper / Lower 95% Confidence Bounds**: $97.5^{\text{th}}$ and $2.5^{\text{th}}$ percentiles across each time step $t$

---

### 2. Dampened Polynomial Trend Regression
Linear extrapolation over long time horizons often leads to unbounded growth assumptions. The engine fits a $1^{\text{st}}$-degree polynomial trend line over recent price history ($N=60$ days) and applies exponential decay dampening:

$$\text{Trend}(t) = S_0 + \left( \text{slope} \cdot t \cdot e^{-\lambda t} \right)$$

Where $\lambda = 0.015$ prevents unrealistic long-horizon price divergence while preserving near-term momentum dynamics.

---

### 3. Parkinson Intraday Volatility Engine
Traditional Close-to-Close volatility ignores intraday price swings. The **Parkinson Volatility** metric utilizes daily High ($H_i$) and Low ($L_i$) price bounds for enhanced variance estimation:

$$\sigma_P = \sqrt{ \frac{1}{4 \ln 2 \cdot N} \sum_{i=1}^N \left( \ln \frac{H_i}{L_i} \right)^2 } \times \sqrt{252}$$

#### Parkinson Ratio:
$$\text{Ratio}_P = \frac{\sigma_P}{\sigma_C}$$
A Parkinson ratio $> 1.15$ signals significant intraday variance and expanding volatility channels.

---

## 📊 Volatility Regime Classification Matrix

The engine dynamically evaluates price action and volatility ratios to assign stocks to one of four regimes:

| Volatility Regime | Condition Criteria | Operational Narrative | UI Badge |
| :--- | :--- | :--- | :--- |
| **Extreme Drawdown Hazard** | Annualized Volatility $> 35\%$ AND $30\text{D Return} < -8\%$ | High structural volatility combined with sharp downward momentum. Risk caution advised. | 🔴 Red |
| **High Volatility / Breakout Risk** | Annualized Volatility $\ge 25\%$ AND Parkinson Ratio $> 1.15$ | Elevated intraday price swings and expanding channels suggest an imminent breakout. | 🟡 Amber |
| **Low Volatility / Steady Consolidation**| Annualized Volatility $< 18\%$ AND $\|30\text{D Return}\| < 4\%$ | Subdued volatility and tight trading range indicating institutional accumulation. | 🟢 Emerald |
| **Mean-Reverting Range-Bound** | Default baseline state | Normal volatility bounds with prices oscillating around mid-term moving averages. | 🔵 Blue |

---

## ⚖️ Ensemble Model Composition & Weights

The final price forecast trajectory blends three complementary forecasting approaches:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ML Ensemble Forecast Line                     │
├──────────────────────────────┬──────────────────────────────────┤
│ Model Component              │ Weight (%)                       │
├──────────────────────────────┼──────────────────────────────────┤
│ 1. Monte Carlo Median Path   │ 50%                              │
│ 2. Dampened Polynomial Trend │ 35%                              │
│ 3. GBM Constant Drift        │ 15%                              │
└──────────────────────────────┴──────────────────────────────────┘
```

---

## 🔌 API Endpoint Reference

### `GET /api/v1/ml/forecast/{ticker}`

Returns structured ML forecast metrics, Monte Carlo percentiles, confidence channels, and volatility regime analysis.

#### Query Parameters:
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `days` | `int` | `90` | Forecast horizon in days (Allowed: `7` to `365`) |

#### Sample Request:
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/ml/forecast/RELIANCE?days=90"
```

#### Sample Response JSON:
```json
{
  "ticker": "RELIANCE",
  "current_price": 1182.0,
  "currency": "INR",
  "forecast_days": 90,
  "volatility_metrics": {
    "close_to_close_annualized_pct": 21.45,
    "parkinson_annualized_pct": 24.80,
    "parkinson_ratio": 1.16,
    "daily_drift_pct": 0.0512,
    "annualized_drift_pct": 12.90
  },
  "volatility_regime": {
    "name": "Mean-Reverting Range-Bound",
    "description": "Normal volatility bounds with prices oscillating around mid-term moving averages.",
    "color": "blue"
  },
  "monte_carlo_outcomes": {
    "num_simulations": 1000,
    "bear_case": { "price": 1045.20, "return_pct": -11.57 },
    "base_case": { "price": 1245.50, "return_pct": 5.37 },
    "bull_case": { "price": 1410.80, "return_pct": 19.36 }
  },
  "horizons": {
    "target_30d": { "day": 30, "forecast_price": 1202.10, "upper_95": 1275.40, "lower_95": 1130.20 },
    "target_90d": { "day": 90, "forecast_price": 1245.50, "upper_95": 1410.80, "lower_95": 1045.20 },
    "target_180d": { "day": 180, "forecast_price": 1310.00, "upper_95": 1550.00, "lower_95": 980.00 }
  },
  "model_weights": {
    "monte_carlo_median": 50,
    "dampened_polynomial_trend": 35,
    "gbm_constant_drift": 15
  },
  "historical_chart": [ ... ],
  "forecast_chart": [ ... ]
}
```

---

## 💻 Frontend Implementation & UI Components

The feature is exposed through the **`ML Price Forecast`** tab on any stock research page (`/stock/[ticker]`):

- **Interactive Forecast Chart**: Built using `Recharts` (`ComposedChart`, `Area`, `Line`, `Tooltip`, `ResponsiveContainer`).
- **Shaded Confidence Bands**: Displays $95\%$ confidence interval envelopes.
- **Horizon Selector Buttons**: Toggle seamlessly between `30 Days`, `90 Days`, and `180 Days`.
- **Volatility Regime Badge**: Real-time color-coded indicators (`Red`, `Amber`, `Emerald`, `Blue`).

---

## 🧪 Verification & Unit Testing

Run unit tests via `pytest`:

```bash
# Execute ML Forecast test module
backend/venv/Scripts/pytest backend/tests/test_api_ml_forecast.py

# Execute full platform test suite
backend/venv/Scripts/pytest backend/tests
```

---

## 📁 Source Code Architecture

| Layer | Path | Description |
| :--- | :--- | :--- |
| **Engine Service** | [`backend/app/services/ml_forecast_engine.py`](file:///d:/projects/stock-analysis-platform/backend/app/services/ml_forecast_engine.py) | Monte Carlo simulation, Parkinson volatility & ensemble modeling |
| **API Router** | [`backend/app/api/ml_forecast.py`](file:///d:/projects/stock-analysis-platform/backend/app/api/ml_forecast.py) | FastAPI endpoint route `/api/v1/ml/forecast/{ticker}` |
| **Frontend Tab** | [`frontend/src/components/stock/MLForecastTab.tsx`](file:///d:/projects/stock-analysis-platform/frontend/src/components/stock/MLForecastTab.tsx) | Next.js interactive chart & metric cards component |
| **Stock Workspace** | [`frontend/src/app/stock/[ticker]/page.tsx`](file:///d:/projects/stock-analysis-platform/frontend/src/app/stock/%5Bticker%5D/page.tsx) | Research page integration |
| **Unit Tests** | [`backend/tests/test_api_ml_forecast.py`](file:///d:/projects/stock-analysis-platform/backend/tests/test_api_ml_forecast.py) | Test suite verification |
