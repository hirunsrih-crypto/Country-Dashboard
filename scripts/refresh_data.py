#!/usr/bin/env python3
"""
India Dashboard v6 — Weekly Data Refresh
=========================================
Auto-refreshes the following D_* arrays in india-dashboard-v6.jsx:

  AUTO (this script):
    D_NIFTY, D_MIDCAP, D_USDINR, D_BRENT, D_GOLD  — yfinance
    D_CPI_MOSPI, D_IIP_MOSPI, D_GDP                — MOSPI public API

  MANUAL (update in JSX directly):
    D_REPO, D_YIELD10Y, D_FXRES  — RBI DBIE (CORS-blocked)
    D_FII                         — NSDL (no public API)
    D_MFGPMI, D_SVSPMI           — S&P Global PDF release
    D_GST                         — GST Council PDF
    D_PEERS_FWD_PE, D_PEERS_FWD_EPS — Bloomberg terminal

Usage:
    pip install yfinance requests pandas
    python scripts/refresh_data.py
"""

import re
import sys
import json
from pathlib import Path
from datetime import datetime

try:
    import yfinance as yf
    import requests
    import pandas as pd
except ImportError:
    print("Missing dependencies. Run:  pip install yfinance requests pandas")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────
JSX_PATH   = Path(__file__).parent.parent / "india-dashboard-v6.jsx"
START_DATE = "2022-01-01"
MOSPI_BASE = "https://mospi.gov.in/api"
MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun",
               "Jul","Aug","Sep","Oct","Nov","Dec"]

# ── Helpers ───────────────────────────────────────────────────────────────────
def mmm_yy(year, month_name):
    m = datetime.strptime(month_name, "%B").month
    return f"{MONTHS[m-1]}-{str(year)[2:]}"

def patch_array(jsx_content, var_name, new_js_body):
    """Replace  const VAR = [ ... ];  with new content."""
    pattern = rf'(const {re.escape(var_name)} = \[)[^\]]*?(\];)'
    # Multi-line replace
    pattern = rf'const {re.escape(var_name)} = \[[\s\S]*?\n\];'
    replacement = new_js_body
    updated, n = re.subn(pattern, replacement, jsx_content)
    if n == 0:
        print(f"  ⚠  {var_name}: pattern not found — skipped")
    return updated

def write_jsx(content):
    JSX_PATH.write_text(content, encoding="utf-8")

def read_jsx():
    return JSX_PATH.read_text(encoding="utf-8")

# ── yfinance fetchers ─────────────────────────────────────────────────────────
def fetch_yf_monthly(ticker, label, decimals=1):
    """Download daily, resample to month-end, then append the latest
    daily close if it belongs to a month newer than the last month-end
    (i.e. we are mid-month and the current month isn't closed yet)."""
    try:
        df = yf.download(ticker, start=START_DATE, interval="1d",
                         progress=False, auto_adjust=True)
        if df.empty:
            raise ValueError("empty dataframe")

        close = df["Close"].dropna()
        monthly = close.resample("ME").last().dropna()

        data = [
            {"d": f"{MONTHS[d.month-1]}-{str(d.year)[2:]}",
             "v": round(float(v), decimals)}
            for d, v in monthly.items()
        ]

        # Append latest daily close if it's from the current (incomplete) month
        latest_daily_date  = close.index[-1]
        last_month_end     = monthly.index[-1]
        if (latest_daily_date.year, latest_daily_date.month) > \
           (last_month_end.year,    last_month_end.month):
            latest_val = round(float(close.iloc[-1]), decimals)
            latest_lbl = f"{MONTHS[latest_daily_date.month-1]}-{str(latest_daily_date.year)[2:]}"
            data.append({"d": latest_lbl, "v": latest_val})

        print(f"  ✓  {label:<22} {len(data)} months  (latest: {data[-1]['d']} = {data[-1]['v']})")
        return data
    except Exception as e:
        print(f"  ✗  {label}: {e}")
        return None

def build_simple_array(var_name, data):
    rows = [f'  {{d:"{r["d"]}",v:{r["v"]}}}' for r in data]
    return f"const {var_name} = [\n" + ",\n".join(rows) + "\n];"

# ── MOSPI fetchers ────────────────────────────────────────────────────────────
def fetch_mospi_cpi():
    try:
        r = requests.get(f"{MOSPI_BASE}/CPI/data", params={
            "base_year":   "2012",
            "series":      "Current",
            "state_code":  "99",
            "sector_code": "3",
            "group_code":  "0",
            "year":        "2022,2023,2024,2025,2026",
            "limit":       "70",
            "Format":      "JSON",
        }, timeout=20)
        r.raise_for_status()
        records = r.json()["data"]
        records.sort(key=lambda x: (
            x["year"],
            datetime.strptime(x["month"], "%B").month
        ))
        data = [
            {"d": mmm_yy(rec["year"], rec["month"]),
             "v": round(float(rec["inflation"]), 2)}
            for rec in records
        ]
        print(f"  ✓  {'CPI (MOSPI)':<22} {len(data)} months  (latest: {data[-1]['d']} = {data[-1]['v']}%)")
        return data
    except Exception as e:
        print(f"  ✗  CPI (MOSPI): {e}")
        return None

def fetch_mospi_iip():
    try:
        r = requests.get(f"{MOSPI_BASE}/IIP/data", params={
            "base_year":     "2011-12",
            "type":          "General",
            "category_code": "4",
            "year":          "2022,2023,2024,2025,2026",
            "month_code":    "1,2,3,4,5,6,7,8,9,10,11,12",
            "limit":         "70",
            "Format":        "JSON",
        }, timeout=20)
        r.raise_for_status()
        records = r.json()["data"]
        records.sort(key=lambda x: (
            x["year"],
            datetime.strptime(x["month"], "%B").month
        ))
        data = [
            {"d": mmm_yy(rec["year"], rec["month"]),
             "v": round(float(rec["growth_rate"]), 1)}
            for rec in records
        ]
        print(f"  ✓  {'IIP (MOSPI)':<22} {len(data)} months  (latest: {data[-1]['d']} = {data[-1]['v']}%)")
        return data
    except Exception as e:
        print(f"  ✗  IIP (MOSPI): {e}")
        return None

def fetch_mospi_gdp():
    FY_SHORT = {
        "2022-23": "FY23", "2023-24": "FY24",
        "2024-25": "FY25", "2025-26": "FY26", "2026-27": "FY27",
    }
    FY_ORDER = {v: i for i, v in enumerate(FY_SHORT.values())}
    Q_ORDER  = {"Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4}
    try:
        r = requests.get(f"{MOSPI_BASE}/NAS/data", params={
            "base_year":      "2022-23",
            "series":         "Current",
            "frequency_code": "Quarterly",
            "indicator_code": "22",
            "year":           "2022-23,2023-24,2024-25,2025-26,2026-27",
            "limit":          "40",
            "Format":         "JSON",
        }, timeout=20)
        r.raise_for_status()
        records = r.json()["data"]
        records.sort(key=lambda x: (
            FY_ORDER.get(FY_SHORT.get(x["year"], ""), 99),
            Q_ORDER.get(x["quarter"], 0)
        ))
        data = []
        for rec in records:
            fy_short = FY_SHORT.get(rec["year"], rec["year"])
            q        = rec["quarter"]
            label    = f"{q} {fy_short}"
            v        = round(float(rec["constant_price"]), 1)
            data.append({"d": label, "v": v, "fy": rec["year"], "q": q})
        print(f"  ✓  {'GDP (MOSPI NAS)':<22} {len(data)} quarters (latest: {data[-1]['d']} = {data[-1]['v']}%)")
        return data
    except Exception as e:
        print(f"  ✗  GDP (MOSPI NAS): {e}")
        return None

def build_gdp_array(data):
    rows = [f'  {{d:"{r["d"]}",v:{r["v"]},fy:"{r["fy"]}",q:"{r["q"]}"}}' for r in data]
    return "const D_GDP = [\n  // MOSPI NAS — Quarterly GDP Growth Rate (Constant Price, base 2022-23)\n" + ",\n".join(rows) + "\n];"

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    print(f"\n{'='*60}")
    print(f"  India Dashboard — Weekly Data Refresh")
    print(f"  {now}")
    print(f"{'='*60}\n")

    # ── Fetch ──────────────────────────────────────────────────────────────
    print("[ yfinance ]")
    nifty  = fetch_yf_monthly("^NSEI",       "Nifty 50",        0)
    midcap = fetch_yf_monthly("^NSEMDCP100", "Nifty Midcap 100",0)
    usdinr = fetch_yf_monthly("USDINR=X",    "USD/INR",         1)
    brent  = fetch_yf_monthly("BZ=F",        "Brent Crude",     1)
    gold   = fetch_yf_monthly("GC=F",        "Gold Spot",       0)

    print("\n[ MOSPI API ]")
    cpi = fetch_mospi_cpi()
    iip = fetch_mospi_iip()
    gdp = fetch_mospi_gdp()

    # ── Patch JSX ─────────────────────────────────────────────────────────
    print("\n[ Patching JSX ]")
    jsx = read_jsx()

    patches = [
        ("D_NIFTY",      nifty,  build_simple_array("D_NIFTY",      nifty)  if nifty  else None),
        ("D_MIDCAP",     midcap, build_simple_array("D_MIDCAP",     midcap) if midcap else None),
        ("D_USDINR",     usdinr, build_simple_array("D_USDINR",     usdinr) if usdinr else None),
        ("D_BRENT",      brent,  build_simple_array("D_BRENT",      brent)  if brent  else None),
        ("D_GOLD",       gold,   build_simple_array("D_GOLD",       gold)   if gold   else None),
        ("D_CPI_MOSPI",  cpi,    build_simple_array("D_CPI_MOSPI",  cpi)    if cpi    else None),
        ("D_IIP_MOSPI",  iip,    build_simple_array("D_IIP_MOSPI",  iip)    if iip    else None),
        ("D_GDP",        gdp,    build_gdp_array(gdp)                        if gdp    else None),
    ]

    changed = 0
    for var_name, data, new_body in patches:
        if new_body:
            jsx = patch_array(jsx, var_name, new_body)
            print(f"  ✓  {var_name} patched")
            changed += 1
        else:
            print(f"  –  {var_name} skipped (fetch failed, keeping existing)")

    if changed:
        write_jsx(jsx)
        print(f"\n✅  {changed} arrays updated in {JSX_PATH.name}")
    else:
        print("\n⚠  No arrays updated.")
        sys.exit(1)

    print(f"\n{'='*60}\n")

if __name__ == "__main__":
    main()
