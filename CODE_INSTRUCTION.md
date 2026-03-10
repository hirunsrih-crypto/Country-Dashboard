# DAOL Investment — India Economic & Peer Valuation Dashboard
## Claude Code Execution Instructions

---

## Quick Start

Open the `india-dashboard.html` file in any modern browser. No server needed — it's a standalone single-file dashboard.

```bash
# If using Claude Code or terminal:
open india-dashboard.html          # macOS
xdg-open india-dashboard.html     # Linux
start india-dashboard.html         # Windows
```

---

## Architecture

### Single-File HTML Dashboard
- **Chart.js 4.4.1** via CDN for all visualizations
- **Theme toggle**: Clean white (default) ↔ dark mode
- **5 tabs**: Overview, Macro, External, Peers, Analysis
- **No build step** — pure HTML/CSS/JS, runs anywhere

### Data Sources
| Source | Coverage | Notes |
|--------|----------|-------|
| Bloomberg Terminal (DAOL) | Index, Macro, External, Peers | Primary; uploaded as `India_Meta_Data.xlsx` |
| RBI/MOSPI/CMIE | CPI, Unemployment | Supplementary known macro data |
| Training knowledge | Gold, Brent | Price-only; supplement with yfinance when available |

### Econometric Model
- **Method**: OLS Linear Regression (scikit-learn)
- **Frequency**: Quarterly (2022Q1 — 2025Q4, 16 observations)
- **Dependent**: Nifty quarterly returns (%), Mirae quarterly returns (%)
- **Independent (standardized)**: GDP, CPI, PMI, Repo Rate, FII Flow, IIP, Brent Δ, Gold Δ
- **Nifty R²**: 0.865 | **Mirae R²**: 0.666

---

## Updating Data

### Option 1: Update Bloomberg Data
1. Pull new monthly data from Bloomberg Terminal
2. Update the `India_Meta_Data.xlsx` file (same sheet structure)
3. Run the Python extraction script below
4. Replace the `D` object in the HTML file

### Option 2: Supplement with yfinance (when network allows)

```python
import yfinance as yf
import pandas as pd

# Fetch latest data
tickers = {
    "^NSEI": "Nifty 50",
    "^BSESN": "Sensex",
    "GC=F": "Gold",
    "BZ=F": "Brent Crude",
    "INR=X": "USD/INR",
    "INDA": "iShares India ETF",
}

for ticker, name in tickers.items():
    df = yf.download(ticker, start="2022-01-01", interval="1mo")
    print(f"{name}: {len(df)} points, Latest: {df['Close'].iloc[-1]:.2f}")
```

### Option 3: Re-run Econometric Model

```python
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

# Load your quarterly data (GDP, CPI, PMI, Repo, FII, IIP, Brent, Gold)
# Build DataFrame with Nifty/Mirae quarterly returns as dependent variable

features = ['gdp', 'cpi', 'pmi', 'repo', 'fii', 'iip', 'brent_ret', 'gold_ret']
X = df_model[features].values
y = df_model['nifty_ret'].values

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = LinearRegression()
model.fit(X_scaled, y)

print(f"R² = {model.score(X_scaled, y):.3f}")
for i, f in enumerate(features):
    print(f"  {f}: β = {model.coef_[i]:+.3f}")
```

---

## Scoring Framework

### Factor Scoring Rules (-2 to +2)

| Factor | -2 | -1 | 0 | +1 | +2 |
|--------|----|----|---|----|----|
| GDP Growth | <5% | 5-6% | 6-7% | 7-8% | >8% |
| CPI | >8% | 7-8% | 5-6% | 4-5% | <4% |
| PMI | <50 | 50-52 | 52-55 | 55-58 | >58 |
| Repo Rate | — | >7% | 6.5-7% | 5.5-6.5% | <5.5% |
| FII Flow | <-1000 | -1000 to -500 | -500 to 0 | 0 to 500 | >500 |
| IIP | <0% | 0-2% | 2-4% | 4-6% | >6% |
| Brent | >$95 | $85-95 | $75-85 | $65-75 | <$65 |
| Gold | — | — | $2500-2800 | >$2800 | — |

### Weights (EM-adjusted)
```
GDP: 15% | CPI: 10% | PMI: 12% | Repo: 10% | FII: 18% | IIP: 10% | Brent: 13% | Gold: 12%
```

### Decision Mapping
| Composite Score | Decision |
|----------------|----------|
| ≤ -1.5 | UNDERWEIGHT |
| -1.5 to -0.5 | SLIGHTLY UNDERWEIGHT |
| -0.5 to +0.5 | NEUTRAL |
| +0.5 to +1.5 | SLIGHTLY OVERWEIGHT |
| > +1.5 | OVERWEIGHT |

---

## Extending the Dashboard

### Add Israel Data
1. Upload Israel Bloomberg data with same sheet structure
2. Add new data object `D_IL` in the HTML
3. Wire `setCountry('israel')` to switch data source
4. Reuse same chart/table components

### Add NEWSDATA.io Integration
```javascript
// In HTML, add news panel with fetch:
async function fetchNews(query, country) {
    const url = `https://newsdata.io/api/1/latest?apikey=YOUR_KEY&q=${query}&country=${country}&category=business&sentiment=positive`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results; // Array of articles with sentiment
}
```

### Add Real-Time Refresh
```javascript
// Poll yfinance proxy or your own API every 5 minutes
setInterval(async () => {
    const res = await fetch('/api/india-data');
    const newData = await res.json();
    updateCharts(newData);
}, 300000);
```

---

## File Structure
```
india-dashboard.html          ← Main dashboard (open in browser)
CLAUDE_CODE_INSTRUCTION.md    ← This file
India_Meta_Data.xlsx          ← Bloomberg source data
```

## Model Limitations
- Small sample size (16 quarterly observations) — R² may be overfitted
- OLS assumes linear relationships — non-linear effects not captured
- Brent/Gold data uses USD prices, not INR-adjusted
- Mirae fund has price-only data from Bloomberg (no P/E, no EPS)
- Supplementary CPI/unemployment data from training knowledge (verify against MOSPI/CMIE)
- GDP coefficient is negative (counter-intuitive) — reflects "sell the news" dynamic, not causal

---

*DAOL Investment · DAOL-Bharat Fund · Analyst: Sharkky*
*Last updated: March 2026*
