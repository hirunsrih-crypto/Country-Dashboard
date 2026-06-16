# ETF Beta Hedging 0.01

Fetches 5+ years of **dividend-adjusted prices** and **indicated dividend yields**
via `yfinance` for a beta-hedging basket covering equity premium income, inverse
equity, gold, AI, and long-duration Treasury ETFs.

## Tickers

| Symbol  | Description |
|---------|-------------|
| `^GSPC` | S&P 500 Index (^SPX proxy) |
| `JEPI`  | JPMorgan Equity Premium Income ETF |
| `JEPQ`  | JPMorgan Nasdaq Equity Premium Income ETF |
| `SDS`   | ProShares UltraShort S&P 500 |
| `IGLD`  | iShares Gold Trust Micro |
| `BCCC`  | Blockchain Coinvestors Acq. Corp |
| `AIPI`  | REX AI Equity Premium Income ETF |
| `TLTW`  | iShares 20+ Yr Treasury Bond BuyWrite ETF |
| `TBT`   | ProShares UltraShort 20+ Year Treasury |

> **Note on `^SPX`**: Yahoo Finance exposes the S&P 500 as `^GSPC`. The script
> uses `^GSPC`; both tickers refer to the same index.

## Price methodology

`auto_adjust=True` in `yf.download()` returns the **dividend-adjusted close**
(also called the *total-return* or *gross-dividend-adjusted* price). This folds
all cash dividends and stock splits back into the price history so returns are
comparable across reinvestment periods.

## Indicated dividend yield

```
Indicated Yield (monthly) = TTM dividends paid / current price
```

TTM dividends = sum of all ex-dividend payments in the 12 months ending on
each month-end date. Values are stored as percentages in `indicated_yield.csv`.

## Quick start

```bash
pip install yfinance pandas
python etf_beta_hedging/fetch_etf_data.py
```

> **Network requirement**: the script calls `query1.finance.yahoo.com` and
> `query2.finance.yahoo.com`. Ensure outbound HTTPS to these hosts is allowed
> in your environment.

## Output files

All outputs are written to `etf_beta_hedging/output/`:

| File | Contents |
|------|----------|
| `prices_adj_daily.csv` | Daily dividend-adjusted closes (2020 → today) |
| `prices_adj.csv` | Month-end dividend-adjusted closes |
| `dividends.csv` | All cash dividend events (date, amount, ticker) |
| `indicated_yield.csv` | Monthly TTM indicated yield per ticker (%) |
| `summary.csv` | Latest price, TTM dividend $, indicated yield % per ticker |

## Coverage

History begins **2020-01-01** (≥ 6 years). Newer ETFs (e.g. AIPI launched
2024, JEPQ 2022) will have shorter histories; all available data is fetched.
