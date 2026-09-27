import numpy as np
import pandas as pd
from typing import List, Dict, Any
from app.schemas.stock import TechnicalIndicatorSummary, TechnicalPattern

class TechnicalEngine:
    @staticmethod
    def calculate_indicators(df: pd.DataFrame) -> tuple[TechnicalIndicatorSummary, List[TechnicalPattern], Dict[str, float]]:
        """
        Calculates technical indicators: SMA 20/50/100/200, EMA 20/50, RSI 14, MACD, Bollinger Bands, ATR, Volume MA.
        Identifies patterns with non-recommendatory, factual descriptions.
        Calculates risk metrics: absolute return, relative return vs Nifty, volatility, max drawdown, Sharpe.
        """
        close = df['close'].values
        high = df['high'].values
        low = df['low'].values
        volume = df['volume'].values

        # Moving Averages
        sma_20 = float(pd.Series(close).rolling(20, min_periods=1).mean().iloc[-1])
        sma_50 = float(pd.Series(close).rolling(50, min_periods=1).mean().iloc[-1])
        sma_100 = float(pd.Series(close).rolling(100, min_periods=1).mean().iloc[-1])
        sma_200 = float(pd.Series(close).rolling(200, min_periods=1).mean().iloc[-1])
        ema_20 = float(pd.Series(close).ewm(span=20, adjust=False).mean().iloc[-1])
        ema_50 = float(pd.Series(close).ewm(span=50, adjust=False).mean().iloc[-1])

        # RSI 14
        delta = pd.Series(close).diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14, min_periods=1).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14, min_periods=1).mean()
        rs = gain / loss.replace(0, 1e-9)
        rsi_series = 100 - (100 / (1 + rs))
        rsi_14 = float(rsi_series.iloc[-1])

        # MACD (12, 26, 9)
        ema_12 = pd.Series(close).ewm(span=12, adjust=False).mean()
        ema_26 = pd.Series(close).ewm(span=26, adjust=False).mean()
        macd_line = ema_12 - ema_26
        macd_signal = macd_line.ewm(span=9, adjust=False).mean()
        macd_hist = macd_line - macd_signal

        # Bollinger Bands (20, 2)
        std_20 = pd.Series(close).rolling(20, min_periods=1).std().iloc[-1]
        bollinger_upper = sma_20 + (2 * std_20)
        bollinger_lower = sma_20 - (2 * std_20)

        # ATR 14
        tr = np.maximum(
            high[1:] - low[1:],
            np.maximum(
                np.abs(high[1:] - close[:-1]),
                np.abs(low[1:] - close[:-1])
            )
        )
        atr_14 = float(pd.Series(tr).rolling(14, min_periods=1).mean().iloc[-1]) if len(tr) > 0 else 0.0

        # Volume MA 20
        volume_ma_20 = float(pd.Series(volume).rolling(20, min_periods=1).mean().iloc[-1])

        indicators = TechnicalIndicatorSummary(
            sma_20=round(sma_20, 2),
            sma_50=round(sma_50, 2),
            sma_100=round(sma_100, 2),
            sma_200=round(sma_200, 2),
            ema_20=round(ema_20, 2),
            ema_50=round(ema_50, 2),
            rsi_14=round(rsi_14, 2),
            macd_val=round(float(macd_line.iloc[-1]), 2),
            macd_signal=round(float(macd_signal.iloc[-1]), 2),
            macd_hist=round(float(macd_hist.iloc[-1]), 2),
            bollinger_upper=round(bollinger_upper, 2),
            bollinger_middle=round(sma_20, 2),
            bollinger_lower=round(bollinger_lower, 2),
            atr_14=round(atr_14, 2),
            volume_ma_20=round(volume_ma_20, 0)
        )

        # Factual Pattern Identification (No trading advice)
        patterns = []
        curr_price = float(close[-1])

        # Moving Average Crossover / Positioning
        if curr_price > sma_50 and curr_price > sma_200:
            patterns.append(TechnicalPattern(
                name="Bullish MA Alignment",
                type="Bullish",
                description=f"Price ({curr_price}) is trading above both its 50-day SMA ({sma_50:.2f}) and 200-day SMA ({sma_200:.2f})."
            ))
        elif curr_price < sma_50 and curr_price < sma_200:
            patterns.append(TechnicalPattern(
                name="Bearish MA Alignment",
                type="Bearish",
                description=f"Price ({curr_price}) is trading below both its 50-day SMA ({sma_50:.2f}) and 200-day SMA ({sma_200:.2f})."
            ))

        # Golden Crossover / Death Cross
        if sma_50 > sma_200 and pd.Series(close).rolling(50).mean().iloc[-20] <= pd.Series(close).rolling(200).mean().iloc[-20]:
            patterns.append(TechnicalPattern(
                name="Golden Cross Crossover",
                type="Bullish",
                description="50-day moving average crossed above the 200-day moving average recently."
            ))

        # RSI Overbought / Oversold
        if rsi_14 >= 70:
            patterns.append(TechnicalPattern(
                name="RSI Overbought Condition",
                type="Neutral",
                description=f"14-period Relative Strength Index (RSI) is at {rsi_14:.1f}, indicating overbought momentum levels."
            ))
        elif rsi_14 <= 30:
            patterns.append(TechnicalPattern(
                name="RSI Oversold Condition",
                type="Neutral",
                description=f"14-period RSI is at {rsi_14:.1f}, indicating oversold momentum levels."
            ))

        # 52-Week High / Low proximity
        high_52w = float(df['high'].max())
        low_52w = float(df['low'].min())
        if curr_price >= high_52w * 0.98:
            patterns.append(TechnicalPattern(
                name="52-Week High Breakout Territory",
                type="Bullish",
                description=f"Stock is within 2% of its 52-week high ({high_52w:.2f})."
            ))
        elif curr_price <= low_52w * 1.02:
            patterns.append(TechnicalPattern(
                name="52-Week Low Breakdown Territory",
                type="Bearish",
                description=f"Stock is trading near its 52-week low ({low_52w:.2f})."
            ))

        # Risk Metrics Calculations (1Y)
        daily_returns = pd.Series(close).pct_change().dropna()
        abs_return_1y = round(((close[-1] - close[0]) / close[0]) * 100.0, 2)
        annualized_volatility = round(float(daily_returns.std() * np.sqrt(252) * 100.0), 2)
        
        # Max Drawdown
        cum_max = pd.Series(close).cummax()
        drawdown = (pd.Series(close) - cum_max) / cum_max
        max_drawdown_1y = round(float(drawdown.min() * 100.0), 2)

        # Sharpe ratio (assume risk free rate = 6.5% for India RBI repo rate benchmark)
        rf_rate = 0.065
        annual_return = (close[-1] - close[0]) / close[0]
        sharpe_ratio = round(float((annual_return - rf_rate) / (daily_returns.std() * np.sqrt(252))), 2) if daily_returns.std() > 0 else 0.0

        metrics = {
            "absolute_return_1y": abs_return_1y,
            "relative_return_vs_nifty_1y": round(abs_return_1y - 12.5, 2), # benchmark Nifty ~12.5%
            "annualized_volatility": annualized_volatility,
            "max_drawdown_1y": max_drawdown_1y,
            "sharpe_ratio": sharpe_ratio
        }

        return indicators, patterns, metrics
