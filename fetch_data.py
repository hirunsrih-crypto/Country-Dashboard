"""
DAOL Investment — yfinance Data Fetcher
Replaces all market-price series in data.js with live yfinance data.
Non-market data (GDP, CPI, PMI, IIP, Repo, FII, CAD, FwdPE) remains static.

Run:  python fetch_data.py
Output: data.js (overwritten with fresh data)
"""

import json
import sys
from datetime import datetime

try:
    import yfinance as yf
    import pandas as pd
except ImportError:
    print("ERROR: Install dependencies first:  pip install yfinance pandas")
    sys.exit(1)

START = "2022-01-01"
TODAY = datetime.today().strftime("%Y-%m-%d")

def fmt(dt):
    """Format datetime to YY-MM label."""
    return dt.strftime("%y-%m")

def fetch_monthly(ticker, col="Close"):
    """Fetch daily data, resample to month-end close. More reliable than interval='1mo'."""
    df = yf.download(ticker, start=START, end=TODAY, interval="1d",
                     auto_adjust=True, progress=False)
    if df.empty:
        print(f"  WARNING: No data for {ticker}")
        return [], []
    # Handle MultiIndex columns (yfinance 0.2+)
    if isinstance(df.columns, pd.MultiIndex):
        series = df[col].iloc[:, 0] if col in df.columns.get_level_values(0) else df.iloc[:, 0]
    else:
        series = df[col]
    series = series.dropna()
    # Resample to monthly last trading day
    monthly = series.resample("ME").last().dropna()
    labels = [fmt(dt) for dt in monthly.index]
    values = [round(float(v), 2) for v in monthly.values]
    return labels, values

def fetch_quarterly_close(ticker):
    """Fetch monthly data, resample to quarter-end, return (q-labels, values)."""
    df = yf.download(ticker, start=START, end=TODAY, interval="1mo",
                     auto_adjust=True, progress=False)
    if df.empty:
        return [], []
    df = df[["Close"]].dropna()
    df_q = df.resample("QE").last()
    labels = [f"{d.year % 100:02d}Q{(d.month-1)//3+1}" for d in df_q.index]
    values = [round(float(v), 2) for v in df_q["Close"]]
    return labels, values

def normalize(values, base_idx=0):
    """Normalize series to 100 at base_idx."""
    base = values[base_idx]
    return [round(v / base * 100, 1) for v in values]

print("Fetching market data via yfinance...")
print(f"  Range: {START} to {TODAY}\n")

# ── 1. NIFTY 50 ──────────────────────────────────────────────────────────────
print("  [1/8] Nifty 50  (^NSEI)")
nifty_d, nifty_v = fetch_monthly("^NSEI")

# ── 2. SENSEX ────────────────────────────────────────────────────────────────
print("  [2/8] Sensex  (^BSESN)")
sensex_d, sensex_v = fetch_monthly("^BSESN")

# ── 3. BRENT CRUDE ───────────────────────────────────────────────────────────
# Try BZ=F (Brent futures); fall back to CL=F (WTI crude) if out of range
print("  [3/8] Brent Crude  (BZ=F -> CL=F fallback)")
brent_d, brent_v = fetch_monthly("BZ=F")
if not brent_v or brent_v[-1] > 200 or brent_v[-1] < 20:
    print(f"  BZ=F out of range ({brent_v[-1] if brent_v else 'empty'}), trying CL=F")
    brent_d, brent_v = fetch_monthly("CL=F")

# ── 4. GOLD ──────────────────────────────────────────────────────────────────
# GLD ETF price * 10 ≈ gold spot USD/oz (more stable than GC=F futures roll)
print("  [4/8] Gold  (GLD ETF x10)")
gold_d, gold_v_raw = fetch_monthly("GLD")
gold_v = [round(v * 10, 0) for v in gold_v_raw] if gold_v_raw else []
if not gold_v or gold_v[-1] < 500:
    print("  GLD failed, falling back to GC=F futures")
    gold_d, gold_v = fetch_monthly("GC=F")

# ── 5. USD/INR ───────────────────────────────────────────────────────────────
print("  [5/8] USD/INR  (INR=X)")
usdinr_d, usdinr_v = fetch_monthly("INR=X")

# ── 6. S&P 500 (for normalized performance) ──────────────────────────────────
print("  [6/8] S&P 500  (^GSPC)")
sp_d, sp_v_raw = fetch_monthly("^GSPC")

# ── 7. MSCI EM (EEM) ─────────────────────────────────────────────────────────
print("  [7/8] MSCI EM  (EEM)")
em_d, em_v_raw = fetch_monthly("EEM")

# ── 8. MSCI China (MCHI) + Mirae proxy (INDA) ────────────────────────────────
print("  [8/8] MSCI China (MCHI) & India ETF (INDA)")
china_d, china_v_raw = fetch_monthly("MCHI")
mirae_d, mirae_v_raw = fetch_monthly("INDA")

# ── Normalize performance series (base=100 at first common date) ─────────────
# Align all four to same date range using the shortest series
norm_series = {
    "sp":    (sp_d,    sp_v_raw),
    "em":    (em_d,    em_v_raw),
    "china": (china_d, china_v_raw),
    "mirae": (mirae_d, mirae_v_raw),
}
# Find common dates
common_dates = None
for k, (d, v) in norm_series.items():
    s = set(d)
    common_dates = s if common_dates is None else common_dates & s

if common_dates:
    common_dates = sorted(common_dates)
    norm_filtered = {}
    for k, (d, v) in norm_series.items():
        idx_map = {date: val for date, val in zip(d, v)}
        filtered_v = [idx_map[dt] for dt in common_dates if dt in idx_map]
        norm_filtered[k] = normalize(filtered_v)
    norm_d = [dt for dt in common_dates if all(dt in dict(zip(d, v)) for _, (d, v) in norm_series.items())]
else:
    # fallback: use sp dates
    norm_d = sp_d
    norm_filtered = {
        "sp":    normalize(sp_v_raw),
        "em":    normalize(em_v_raw) if len(em_v_raw) == len(sp_v_raw) else em_v_raw,
        "china": normalize(china_v_raw) if len(china_v_raw) == len(sp_v_raw) else china_v_raw,
        "mirae": normalize(mirae_v_raw) if len(mirae_v_raw) == len(sp_v_raw) else mirae_v_raw,
    }

# ── Latest values for metric cards ───────────────────────────────────────────
latest = {
    "nifty":    f"{nifty_v[-1]:,.0f}" if nifty_v else "N/A",
    "sensex":   f"{sensex_v[-1]:,.0f}" if sensex_v else "N/A",
    "brent":    f"${brent_v[-1]:.0f}/bbl" if brent_v else "N/A",
    "gold":     f"${gold_v[-1]:,.0f}/oz" if gold_v else "N/A",
    "usdinr":   f"{usdinr_v[-1]:.1f}" if usdinr_v else "N/A",
    "nifty_date": nifty_d[-1] if nifty_d else "",
}

# ── Brent Crude factor score ──────────────────────────────────────────────────
brent_latest = brent_v[-1] if brent_v else 73
if brent_latest < 65:
    brent_score, brent_signal, brent_rationale = "+2", "Very Bullish", "Below $65 — very low oil cost for India"
elif brent_latest < 75:
    brent_score, brent_signal, brent_rationale = "+1", "Bullish", f"Below $75 comfort zone for India"
elif brent_latest < 85:
    brent_score, brent_signal, brent_rationale = "0", "Neutral", f"$75–85 neutral range"
elif brent_latest < 95:
    brent_score, brent_signal, brent_rationale = "-1", "Bearish", f"$85–95 elevated oil cost pressure"
else:
    brent_score, brent_signal, brent_rationale = "-2", "Very Bearish", f">$95 — severe oil cost drag"

# ── Gold factor score ─────────────────────────────────────────────────────────
gold_latest = gold_v[-1] if gold_v else 2860
if gold_latest > 2800:
    gold_score, gold_signal, gold_rationale = "+1", "Bullish", "Elevated but stabilizing; not risk-off signal"
elif gold_latest > 2500:
    gold_score, gold_signal, gold_rationale = "0", "Neutral", "$2500–2800 neutral range"
else:
    gold_score, gold_signal, gold_rationale = "0", "Neutral", "Below $2500"

print("\n--- Latest Values ---")
for k, v in latest.items():
    print(f"  {k:12s}: {v}")
print(f"\n  Brent score: {brent_score}  ({brent_signal})")
print(f"  Gold  score: {gold_score}  ({gold_signal})")

# ── Static data (macro/policy — not available on yfinance) ───────────────────
STATIC = {
    "cpi": {
        "d": ["22-01","22-03","22-06","22-09","22-12","23-03","23-06","23-09","23-12",
              "24-03","24-06","24-09","24-12","25-03","25-06","25-09","25-12"],
        "v": [6.01,6.95,7.01,7.41,5.72,5.66,4.81,5.02,5.69,4.85,5.08,5.49,5.22,3.34,3.30,3.70,4.20]
    },
    "pmi_mfg": {
        "d": ["23-03","23-06","23-09","23-12","24-03","24-06","24-09","24-12",
              "25-03","25-06","25-09","25-12","26-02"],
        "v": [56.4,57.8,57.5,54.9,59.1,58.4,56.5,56.4,58.1,58.4,57.7,55.0,56.9]
    },
    "pmi_svc": {
        "d": ["23-03","23-06","23-09","23-12","24-03","24-06","24-09","24-12",
              "25-03","25-06","25-09","25-12","26-02"],
        "v": [57.8,58.5,61.0,59.0,61.2,60.5,57.7,59.3,58.5,60.4,60.9,58.0,58.1]
    },
    "iip": {
        "d": ["22-01","22-04","22-07","22-10","23-01","23-04","23-07","23-10",
              "24-01","24-04","24-07","24-10","25-01","25-04","25-07","25-10","26-02"],
        "v": [1.98,6.66,2.21,-4.07,5.81,4.61,6.18,11.89,4.21,5.19,4.98,3.73,5.21,2.57,4.27,0.53,4.83]
    },
    "unemp": {
        "d": ["22-01","22-06","22-09","22-12","23-03","23-09","23-12","24-03",
              "24-09","24-12","25-03","25-09","25-12"],
        "v": [6.57,7.80,6.43,8.30,7.80,7.09,8.70,7.40,7.80,8.50,7.40,7.50,8.00]
    },
    "repo": {
        "d": ["22-01","22-05","22-06","22-08","22-09","22-12","23-02","25-02",
              "25-04","25-06","25-12"],
        "v": [4.0,4.4,4.9,5.4,5.9,6.25,6.5,6.25,6.0,5.5,5.25]
    },
    "gdp": {
        "d": ["22Q1","22Q2","22Q3","23Q1","23Q2","23Q3","23Q4","24Q1","24Q3",
              "24Q4","25Q1","25Q2","25Q3","25Q4"],
        "v": [5.5,13.5,6.0,6.9,6.6,7.6,7.1,7.5,6.6,7.4,7.0,6.7,8.4,7.8]
    },
    "fii": {
        "d": ["22-01","22-03","22-06","22-08","22-10","22-12","23-03","23-06",
              "23-09","23-11","24-02","24-06","24-09","24-12","25-02","25-04",
              "25-07","25-10","26-01","26-02"],
        "v": [-272,1145,-33,534,839,-430,288,1444,-345,1169,507,186,-767,-625,
              -1376,20,-703,-855,207,-601]
    },
    "cad": {
        "d": ["22Q1","22Q3","23Q1","23Q3","24Q1","24Q3","25Q1","25Q3","26Q1"],
        "v": [-1.09,-2.56,-2.08,-1.16,-0.74,-0.86,-0.60,-0.34,-0.40]
    },
    "fwdpe": {
        "d": ["22-01","22-06","22-12","23-06","23-12","24-03","24-06","24-09",
              "24-12","25-03","25-06","25-09","25-12","26-02"],
        "india": [24.9,18.9,22.1,20.1,23.3,20.2,21.7,23.9,22.1,20.1,22.4,22.0,23.7,20.0],
        "em":    [13.0,11.3,11.4,13.3,14.1,12.5,13.2,14.0,13.5,12.4,13.5,15.4,15.8,18.1],
        "china": [13.8,12.7,12.2,10.8,10.5,9.5,9.9,11.7,11.0,11.5,11.8,15.1,13.7,13.6],
        "sp":    [22.1,16.6,17.6,20.5,22.1,21.7,22.6,24.2,24.8,20.9,23.5,25.2,25.6,21.9]
    },
    "premium": {
        "d": ["22-01","22-06","22-09","22-12","23-06","23-12","24-06","24-09",
              "24-12","25-03","25-06","25-09","25-12","26-02"],
        "v": [91.6,67.1,93.4,93.9,51.9,65.8,64.6,70.8,63.2,62.6,66.8,43.1,49.9,10.0]
    },
}

# ── Build output data.js ──────────────────────────────────────────────────────
now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

def js_arr(lst, indent=4):
    return json.dumps(lst, separators=(",", ":"))

lines = [
    f"// === DAOL Investment — India Dashboard Data ===",
    f"// Market data: yfinance (auto-updated {now_str})",
    f"// Macro data: Bloomberg Terminal (DAOL), RBI, MOSPI, CMIE — update manually",
    f"// Tickers: ^NSEI, ^BSESN, BZ=F, XAUUSD=X, INR=X, ^GSPC, EEM, MCHI, INDA",
    f"",
    f"const D = {{",
    f"  // ── yfinance market series ──────────────────────────────────────────────",
    f"  nifty: {{",
    f"    d: {js_arr(nifty_d)},",
    f"    v: {js_arr([round(v) for v in nifty_v])}",
    f"  }},",
    f"  sensex: {{",
    f"    d: {js_arr(sensex_d)},",
    f"    v: {js_arr([round(v) for v in sensex_v])}",
    f"  }},",
    f"  brent: {{",
    f"    d: {js_arr(brent_d)},",
    f"    v: {js_arr([round(v, 1) for v in brent_v])}",
    f"  }},",
    f"  gold: {{",
    f"    d: {js_arr(gold_d)},",
    f"    v: {js_arr([round(v) for v in gold_v])}",
    f"  }},",
    f"  usdinr: {{",
    f"    d: {js_arr(usdinr_d)},",
    f"    v: {js_arr([round(v, 2) for v in usdinr_v])}",
    f"  }},",
    f"  norm: {{",
    f"    d: {js_arr(norm_d)},",
    f"    sp:    {js_arr(norm_filtered.get('sp', []))},",
    f"    em:    {js_arr(norm_filtered.get('em', []))},",
    f"    china: {js_arr(norm_filtered.get('china', []))},",
    f"    mirae: {js_arr(norm_filtered.get('mirae', []))}",
    f"  }},",
    f"",
    f"  // ── Static macro/policy data (Bloomberg / RBI / MOSPI / CMIE) ──────────",
]

for key, val in STATIC.items():
    if key in ("fwdpe", "premium"):
        continue
    lines.append(f"  {key}: {{")
    lines.append(f"    d: {js_arr(val['d'])},")
    lines.append(f"    v: {js_arr(val['v'])}")
    lines.append(f"  }},")

# fwdpe (multi-series)
fwdpe = STATIC["fwdpe"]
lines += [
    f"  fwdpe: {{",
    f"    d:     {js_arr(fwdpe['d'])},",
    f"    india: {js_arr(fwdpe['india'])},",
    f"    em:    {js_arr(fwdpe['em'])},",
    f"    china: {js_arr(fwdpe['china'])},",
    f"    sp:    {js_arr(fwdpe['sp'])}",
    f"  }},",
]

# premium
prem = STATIC["premium"]
lines += [
    f"  premium: {{",
    f"    d: {js_arr(prem['d'])},",
    f"    v: {js_arr(prem['v'])}",
    f"  }},",
    f"",
    f"  // ── Latest values (for metric cards) ────────────────────────────────────",
    f"  latest: {{",
    f"    nifty:   {round(nifty_v[-1]) if nifty_v else 'null'},",
    f"    sensex:  {round(sensex_v[-1]) if sensex_v else 'null'},",
    f"    brent:   {round(brent_v[-1], 1) if brent_v else 'null'},",
    f"    gold:    {round(gold_v[-1]) if gold_v else 'null'},",
    f"    usdinr:  {round(usdinr_v[-1], 2) if usdinr_v else 'null'},",
    f"    brentScore: '{brent_score}',",
    f"    brentSignal: '{brent_signal}',",
    f"    brentRationale: '{brent_rationale}',",
    f"    goldScore: '{gold_score}',",
    f"    goldSignal: '{gold_signal}',",
    f"    goldRationale: '{gold_rationale}'",
    f"  }}",
    f"}};",
]

output = "\n".join(lines)

out_path = "data.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(output)

print(f"\nDONE: data.js updated")
print(f"  Nifty latest : {nifty_v[-1] if nifty_v else 'N/A'}  ({nifty_d[-1] if nifty_d else ''})")
print(f"  Brent latest : ${brent_v[-1] if brent_v else 'N/A'}  -> score {brent_score}")
print(f"  Gold  latest : ${gold_v[-1] if gold_v else 'N/A'}  -> score {gold_score}")
print(f"  USD/INR      : {usdinr_v[-1] if usdinr_v else 'N/A'}")
print(f"  Data points  : Nifty={len(nifty_v)}, Brent={len(brent_v)}, Gold={len(gold_v)}")
print("\nRun this script anytime to refresh market data.")
