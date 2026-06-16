"""
ETF Beta Hedging — yfinance Data Fetcher
=========================================
Fetches 5+ years of dividend-adjusted prices, raw dividends, and
indicated dividend yields for the following tickers:

    ^GSPC  (S&P 500 Index — proxy for ^SPX)
    JEPI   (JPMorgan Equity Premium Income ETF)
    JEPQ   (JPMorgan Nasdaq Equity Premium Income ETF)
    SDS    (ProShares UltraShort S&P 500)
    IGLD   (iShares Gold Trust Micro)
    BCCC   (Blockchain Coinvestors Acq. Corp / placeholder)
    AIPI   (REX AI Equity Premium Income ETF)
    TLTW   (iShares 20+ Yr Treasury Bond BuyWrite ETF)
    TBT    (ProShares UltraShort 20+ Year Treasury)

Outputs
-------
    etf_beta_hedging/
    ├── output/
    │   ├── prices_adj.csv          — monthly dividend-adjusted closes
    │   ├── prices_adj_daily.csv    — daily dividend-adjusted closes
    │   ├── dividends.csv           — all cash dividend events
    │   ├── indicated_yield.csv     — trailing-12-month indicated yield (monthly)
    │   └── summary.csv            — latest price, TTM dividend, indicated yield
    └── fetch_etf_data.py           (this file)

Run
---
    pip install yfinance pandas
    python etf_beta_hedging/fetch_etf_data.py
"""

import os
import sys
from datetime import datetime, timedelta

try:
    import yfinance as yf
    import pandas as pd
except ImportError:
    print("ERROR: pip install yfinance pandas")
    sys.exit(1)

# ── Configuration ────────────────────────────────────────────────────────────

# ^SPX is not always available on yfinance; ^GSPC is the canonical S&P 500
TICKERS = {
    "^GSPC": "S&P 500 Index (^SPX proxy)",
    "JEPI":  "JPMorgan Equity Premium Income ETF",
    "JEPQ":  "JPMorgan Nasdaq Equity Premium Income ETF",
    "SDS":   "ProShares UltraShort S&P 500",
    "IGLD":  "iShares Gold Trust Micro",
    "BCCC":  "Blockchain Coinvestors Acq. Corp",
    "AIPI":  "REX AI Equity Premium Income ETF",
    "TLTW":  "iShares 20+ Yr Treasury Bond BuyWrite ETF",
    "TBT":   "ProShares UltraShort 20+ Year Treasury",
}

START_DATE = "2020-01-01"   # > 6 years of history
END_DATE   = datetime.today().strftime("%Y-%m-%d")

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")


# ── Helpers ──────────────────────────────────────────────────────────────────

def ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def _unwrap_series(df: pd.DataFrame, col: str) -> pd.Series:
    """Handle MultiIndex columns produced by yfinance 0.2+."""
    if isinstance(df.columns, pd.MultiIndex):
        level0 = df.columns.get_level_values(0)
        if col in level0:
            return df[col].iloc[:, 0]
        return df.iloc[:, 0]
    if col in df.columns:
        return df[col]
    return df.iloc[:, 0]


def fetch_daily_adj(ticker: str) -> pd.Series:
    """
    Download dividend-adjusted daily closes (auto_adjust=True folds splits
    and dividends into the price series — equivalent to 'gross dividend price').
    """
    try:
        df = yf.download(
            ticker,
            start=START_DATE,
            end=END_DATE,
            interval="1d",
            auto_adjust=True,
            progress=False,
        )
    except Exception as e:
        print(f"  [WARN] Download failed for {ticker}: {e}")
        return pd.Series(dtype=float, name=ticker)
    if df.empty:
        print(f"  [WARN] No price data for {ticker}")
        return pd.Series(dtype=float, name=ticker)
    series = _unwrap_series(df, "Close").rename(ticker)
    series.index = pd.to_datetime(series.index)
    return series.dropna()


def fetch_dividends(ticker: str) -> pd.Series:
    """Return the full cash-dividend history for ticker."""
    try:
        t = yf.Ticker(ticker)
        divs = t.dividends
    except Exception as e:
        print(f"  [WARN] Could not fetch dividends for {ticker}: {e}")
        return pd.Series(dtype=float, name=ticker)
    if divs is None or divs.empty:
        print(f"  [INFO] No dividend history for {ticker}")
        return pd.Series(dtype=float, name=ticker)
    divs.index = pd.to_datetime(divs.index).tz_localize(None)
    divs = divs[divs.index >= START_DATE].rename(ticker)
    return divs


def trailing_12m_dividend(divs: pd.Series, date: pd.Timestamp) -> float:
    """Sum dividends paid in the 12 months ending on `date`."""
    window_start = date - pd.DateOffset(months=12)
    mask = (divs.index > window_start) & (divs.index <= date)
    return float(divs[mask].sum())


def compute_indicated_yield(
    price_monthly: pd.Series,
    divs: pd.Series,
) -> pd.Series:
    """
    Indicated dividend yield = TTM dividends / price  (at each month-end).
    Returned as a decimal (multiply by 100 for %).
    """
    yields = {}
    for dt, price in price_monthly.items():
        if pd.isna(price) or price == 0:
            continue
        ttm_div = trailing_12m_dividend(divs, dt)
        yields[dt] = ttm_div / price if ttm_div > 0 else 0.0
    return pd.Series(yields, name=price_monthly.name)


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    ensure_output_dir()
    print(f"\nETF Beta Hedging — Data Fetch")
    print(f"Period : {START_DATE}  →  {END_DATE}")
    print(f"Output : {OUTPUT_DIR}\n")
    print("=" * 60)

    all_daily:    dict[str, pd.Series] = {}
    all_monthly:  dict[str, pd.Series] = {}
    all_divs:     dict[str, pd.Series] = {}
    all_yields:   dict[str, pd.Series] = {}
    summary_rows: list[dict]           = []

    for ticker, label in TICKERS.items():
        print(f"\n[{ticker}]  {label}")

        # 1. Dividend-adjusted daily closes
        daily = fetch_daily_adj(ticker)
        if not daily.empty:
            all_daily[ticker] = daily
            # Resample to month-end
            monthly = daily.resample("ME").last().dropna()
            all_monthly[ticker] = monthly
            print(f"  Prices : {len(daily)} daily rows  |  {len(monthly)} monthly rows")
        else:
            monthly = pd.Series(dtype=float, name=ticker)

        # 2. Dividends
        divs = fetch_dividends(ticker)
        if not divs.empty:
            all_divs[ticker] = divs
            print(f"  Divs   : {len(divs)} events  |  total ${divs.sum():.4f}")

        # 3. Indicated yield (monthly)
        if not monthly.empty:
            yld = compute_indicated_yield(monthly, divs if not divs.empty else pd.Series(dtype=float))
            all_yields[ticker] = yld

            latest_price = float(daily.iloc[-1]) if not daily.empty else float("nan")
            ttm_div      = trailing_12m_dividend(divs, pd.Timestamp(END_DATE)) if not divs.empty else 0.0
            ind_yield    = (ttm_div / latest_price * 100) if latest_price and latest_price > 0 else 0.0
            ann_freq     = round(len(divs) / max((pd.Timestamp(END_DATE) - divs.index.min()).days / 365.25, 1), 1) if not divs.empty else 0
            last_div     = float(divs.iloc[-1]) if not divs.empty else 0.0

            summary_rows.append({
                "Ticker":             ticker,
                "Description":        label,
                "Latest_Date":        daily.index[-1].strftime("%Y-%m-%d") if not daily.empty else "",
                "Latest_Adj_Price":   round(latest_price, 4),
                "TTM_Dividends_$":    round(ttm_div, 4),
                "Indicated_Yield_%":  round(ind_yield, 4),
                "Last_Dividend_$":    round(last_div, 4),
                "Approx_Annual_Freq": ann_freq,
                "Div_Events_Total":   len(divs),
                "Price_Rows_Daily":   len(daily),
            })
            print(f"  Yield  : {ind_yield:.2f}%  (TTM ${ttm_div:.4f} / ${latest_price:.4f})")

    # ── Save CSVs ─────────────────────────────────────────────────────────────

    print("\n" + "=" * 60)
    print("Saving outputs …")

    # Daily adj prices
    if all_daily:
        df_daily = pd.DataFrame(all_daily)
        df_daily.index.name = "Date"
        df_daily.to_csv(os.path.join(OUTPUT_DIR, "prices_adj_daily.csv"))
        print(f"  ✓  prices_adj_daily.csv     ({df_daily.shape[0]} rows × {df_daily.shape[1]} tickers)")

    # Monthly adj prices
    if all_monthly:
        df_monthly = pd.DataFrame(all_monthly)
        df_monthly.index.name = "Date"
        df_monthly.to_csv(os.path.join(OUTPUT_DIR, "prices_adj.csv"))
        print(f"  ✓  prices_adj.csv           ({df_monthly.shape[0]} rows × {df_monthly.shape[1]} tickers)")

    # Dividends (stacked)
    if all_divs:
        parts = []
        for tkr, s in all_divs.items():
            tmp = s.reset_index()
            tmp.columns = ["Date", "Dividend"]
            tmp["Ticker"] = tkr
            parts.append(tmp)
        df_divs = pd.concat(parts).sort_values(["Ticker", "Date"])
        df_divs.to_csv(os.path.join(OUTPUT_DIR, "dividends.csv"), index=False)
        print(f"  ✓  dividends.csv            ({len(df_divs)} total dividend events)")

    # Monthly indicated yields
    if all_yields:
        df_yields = pd.DataFrame(all_yields) * 100   # convert to %
        df_yields.index.name = "Date"
        df_yields.columns.name = "Ticker"
        df_yields.to_csv(os.path.join(OUTPUT_DIR, "indicated_yield.csv"))
        print(f"  ✓  indicated_yield.csv      ({df_yields.shape[0]} rows × {df_yields.shape[1]} tickers) — values in %")

    # Summary
    if summary_rows:
        df_summary = pd.DataFrame(summary_rows)
        df_summary.to_csv(os.path.join(OUTPUT_DIR, "summary.csv"), index=False)
        print(f"  ✓  summary.csv              ({len(df_summary)} tickers)\n")
        print(df_summary.to_string(index=False))

    print("\nDone.\n")


if __name__ == "__main__":
    main()
