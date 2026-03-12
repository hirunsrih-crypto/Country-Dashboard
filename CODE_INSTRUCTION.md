# India Country Dashboard — v6 Technical Reference

**File:** `india-dashboard-v6.jsx`  
**Purpose:** Country-theme investment decision framework for the DAOL-Bharat fund, targeting the Mirae Asset India Mid Cap Fund with benchmark Nifty Midcap 100  
**Stack:** React · Recharts · hardcoded static data (no live API calls at runtime)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                          │
│  MOSPI MCP  ·  yfinance  ·  RBI DBIE  ·  NSDL  ·  S&P │
│  (fetched offline, pasted as const arrays in JSX)       │
└─────────────────────┬───────────────────────────────────┘
                      │ D_* constants
┌─────────────────────▼───────────────────────────────────┐
│              React Component Tree                       │
│  IndiaDashboardV6                                       │
│   ├─ ThemeToggle (light / dark)                         │
│   ├─ KPI Row                                            │
│   └─ TabRouter → OverviewTab │ MacroTab │ ExternalTab   │
│                  │ PeersTab  │ SectorTab │ SourcesTab   │
└─────────────────────────────────────────────────────────┘
```

The dashboard is a **single self-contained JSX file**. All data is pre-fetched and embedded as JavaScript constant arrays (`D_*`) at the top of the file. There are no runtime API calls, no backend, and no environment variables required to render.

---

## 2. Data Sources

### 2.1 MOSPI MCP (Ministry of Statistics — Model Context Protocol)

The MOSPI MCP server is the primary source for Indian macroeconomic statistics. Data is fetched via a 4-step workflow:

```
step1_know_about_mospi_api()          → discover all 19 datasets
step2_get_indicators(dataset)         → list indicator codes
step3_get_metadata(dataset, params)   → get valid filter values
step4_get_data(dataset, filters)      → fetch the actual data
```

| Series in Dashboard | Dataset | Key Params | Variable |
|---|---|---|---|
| GDP Growth Rate (YoY %) | `NAS` | `base_year=2022-23`, `indicator_code=22`, Quarterly | `D_GDP` |
| CPI Inflation (YoY %) | `CPI` | `base_year=2012`, `sector=Combined`, `state=All India`, `group_code=0` | `D_CPI_MOSPI` |
| IIP General Index (YoY %) | `IIP` | `base_year=2011-12`, `category_code=4` (General) | `D_IIP_MOSPI` |
| Unemployment Rate | `PLFS` | `frequency_code=1` (Annual), `indicator_code=3` | MOSPI tab only |

**Record format:** `{ t: "MMM-YY", v: number }` — month label + value.

**MOSPI tab sub-views (3):**
- **OVERVIEW** — 4 charts: GDP, CPI, IIP, PLFS unemployment
- **KPI** — 9 indicator cards + CPI sub-component breakdown
- **CATALOGUE** — Scrollable reference table of all 19 available MOSPI datasets

### 2.2 yfinance

Used for all market price series. All tickers are fetched at daily interval.

| Series | Ticker | Variable | Tab |
|---|---|---|---|
| Nifty 50 Index | `^NSEI` | `D_NIFTY` | Overview, Peers |
| Nifty Midcap 100 | `^NSEMDCP100` | `D_MIDCAP` | Overview, Sector, Peers |
| Mirae Fund Price | `0P0001CRE5` | inline in PeersTab | Peers |
| USD/INR | `USDINR=X` | `D_USDINR` | Overview, External |
| Brent Crude | `BZ=F` | `D_BRENT` | External |
| Gold Spot | `GC=F` | `D_GOLD` | External |


### 2.3 RBI DBIE (Database on Indian Economy)

| Series | Description | Variable |
|---|---|---|
| Repo Rate | RBI Policy Repo Rate (%) | `D_REPO` |
| 10Y G-Sec Yield | FBIL / CCIL benchmark yield (%) | `D_YIELD10Y` |
| FX Reserves | Total foreign exchange reserves (USD bn) | `D_FXRES` |

**URL:** `https://dbie.rbi.org.in`

### 2.4 NSDL (National Securities Depository)

| Series | Description | Variable |
|---|---|---|
| FII Net Equity Flows | Monthly net FPI equity flows (USD bn) | `D_FII` |

**URL:** `https://www.nsdl.co.in/` → FPI/FII data section

### 2.5 S&P Global (Free PMI Release)

| Series | Description | Variable |
|---|---|---|
| Manufacturing PMI | Monthly India Mfg PMI (50 = expansion) | `D_MFGPMI` |
| Services PMI | Monthly India Svcs PMI | `D_SVSPMI` |

**Source:** Free monthly press release PDF at `spglobal.com`. Not available via API — must be manually transcribed.

### 2.6 GST Council

| Series | Description | Variable |
|---|---|---|
| GST Revenue | Monthly GST collection (₹ trillion) | `D_GST` |

**Source:** `gst.gov.in` → Monthly Revenue Bulletin PDF.

### 2.7 Bloomberg Terminal (★ — Not Migrated)

Two series remain Bloomberg-only with no free equivalent:

| Series | Bloomberg Field | Notes |
|---|---|---|
| Forward P/E | `BEST_PE_RATIO` | Consensus analyst estimates — proprietary |
| Forward EPS | `BEST_EPS` | Consensus EPS — proprietary |

These populate the **Peers** tab valuation comparison (India vs MSCI EM vs MSCI China vs S&P 500). The dashboard displays a `★ BBG` source badge on all affected cards and charts.

### 2.8 Static Data

The following are manually curated and embedded as static constants:

| Data | Variable | Description |
|---|---|---|
| Mirae sector weights | `miraeSectors` | Mirae_factsheet.pdf |
| Nifty 50 sector weights | `niftyWts` | ind_nifty50.pdf |
| Nifty Midcap 100 sector weights | `niftyMidcapWts` | ind_niftymidcap100.pdf |
| Mirae top holdings | `miraeholdings` | Mirae_factsheet.pdf |
| Midcap 100 benchmark returns | `bmkReturns` | 1M / 3M / 1Y benchmark performance |
| Peers forward P/E | `D_PEERS_FWD_PE` | India / MSCI EM / MSCI China / S&P 500 |
| Peers forward EPS | `D_PEERS_FWD_EPS` | Same peer set, EPS consensus |

---

## 3. Data Flow

```
Offline data fetch
──────────────────
1. Run Python snippet (see Section 7, or Data Sources tab in dashboard)
2. Copy output values into D_* arrays at top of JSX file
3. Save and reload the React component

Runtime rendering
─────────────────
IndiaDashboardV6 renders →
  reads D_* constants →
  passes to chart components via props →
  Recharts renders SVG
```

**There is no live data binding.** The dashboard must be manually refreshed each time new data is available. Recommended update cadence:

| Frequency | Series |
|---|---|
| Monthly | Nifty 50, Midcap 100, MAIMRCU.HK, USD/INR, Brent, Gold, FII flows, PMI, GST, CPI, IIP |
| Quarterly | GDP (NAS), PLFS unemployment |
| As released | Repo Rate (RBI policy meetings ~6×/yr), FX Reserves (monthly sufficient) |

---

## 4. UI Structure — Tab by Tab

### Tab 1: Overview

One-page summary of key signals for a quick market read.

| Component | Data | Chart Type |
|---|---|---|
| KPI Row | Nifty 50, Midcap 100, Repo Rate, FII Flows, Brent, Gold | Stat cards with MoM delta |
| Nifty vs Midcap 100 | `D_NIFTY`, `D_MIDCAP` (Jan-22=100) | Normalized line chart |
| PMI Dual-Line | `D_MFGPMI`, `D_SVSPMI` | Line chart + 50-threshold reference line |
| FII Flows | `D_FII` | Bar chart (green = inflow, red = outflow) |
| USD/INR + 10Y Yield | `D_USDINR`, `D_YIELD10Y` | Dual-axis line chart |

### Tab 2: Macro

India macro scorecard — growth, inflation, industrial output, monetary policy.

| Component | Data | Chart Type |
|---|---|---|
| KPI Row | GDP, CPI, IIP, PMI, GST | Stat cards |
| GDP Growth YoY % | `D_GDP` (MOSPI NAS, quarterly) | Bar chart |
| CPI Inflation YoY % | `D_CPI_MOSPI` + RBI 4% target + 6% upper bound | ComposedChart: bar + reference lines |
| IIP General YoY % | `D_IIP_MOSPI` | Bar chart (green ≥5%, teal ≥0%, red <0%) |
| PMI Mfg & Services | `D_MFGPMI`, `D_SVSPMI` | Dual-line + 50 threshold |
| GST Collections | `D_GST` | Bar chart |
| Repo Rate + 10Y Yield | `D_REPO`, `D_YIELD10Y` | Dual-axis line chart |

### Tab 3: External

India's external position — FX flows, currency, reserves, commodities.

| Component | Data | Chart Type |
|---|---|---|
| KPI Row (5 cards) | FII Flows, FX Reserves, USD/INR, 10Y Yield, Brent, Gold | Stat cards |
| FII Net Flows | `D_FII` | Bar chart |
| FX Reserves | `D_FXRES` | Area chart |
| USD/INR | `D_USDINR` | Line chart |
| Brent Crude | `D_BRENT` | Line chart |
| Gold Spot | `D_GOLD` | Line chart |
| Brent & Gold Normalized | Both rebased to 100 | Dual-line overlay |

### Tab 4: Peers

India valuation vs global peers; Mirae fund performance vs benchmark.

| Component | Data | Chart Type |
|---|---|---|
| Valuation KPIs | `D_PEERS_FWD_PE` (India, Midcap100, MSCI EM, China, S&P 500) | Stat cards (★ Bloomberg) |
| Mirae Fund vs Benchmark | `MAIMRCU.HK`, `D_NIFTY`, `D_MIDCAP` normalized | 3-line chart |
| Top Holdings vs Midcap 100 | `miraeholdings` (10 stocks), benchmark returns | Grouped bar chart |
| Forward P/E Time Series | `D_PEERS_FWD_PE` | Multi-line chart |
| India Premium vs EM | `(India P/E ÷ EM P/E − 1) × 100` | Area chart |
| Midcap 100 Premium vs EM | Same formula for Midcap 100 | Area chart |
| Forward EPS | `D_PEERS_FWD_EPS` | Multi-line chart |

### Tab 5: Sector · Mirae

Mirae fund sector positioning with active weight analysis against two benchmarks.

Four sub-views selectable via toggle buttons:

| View | Description |
|---|---|
| **GRID** | Sector cards showing Mirae weight, Nifty 50 active weight, Midcap 100 weight |
| **BAR** | Horizontal bar: Mirae vs Nifty 50 weight per sector |
| **MIRAE** | Active weight vs Nifty 50 (over/underweight bar chart) |
| **MC100** | Active weight vs Nifty Midcap 100 (the fund's actual benchmark) — grouped bar chart + active weight bar + full comparison table |

Active weight formulas:
- vs Nifty 50: `Mirae Wt − Nifty50 Wt`
- vs MC100: `Mirae Wt − Midcap100 Wt`

### Tab 6: MOSPI ⬡

Live economic statistics from the Government of India's MOSPI MCP server.

| Sub-view | Content |
|---|---|
| **OVERVIEW** | 4 charts — GDP (quarterly), CPI (monthly), IIP (monthly), PLFS Unemployment (annual) |
| **KPI** | 9 indicator cards + CPI sub-component breakdown table |
| **CATALOGUE** | Reference table of all 19 MOSPI datasets: name, description, frequency, key indicators |

### Tab 7: Data Sources

Technical reference and reproducibility log. Contains:
1. Bloomberg migration status notice
2. Full migration table: 18 series (Series / Bloomberg Ticker / Free Source / Free Endpoint / Status)
3. Python automation snippet for offline data refresh

---

## 5. Component Reference

| Component | Props | Description |
|---|---|---|
| `CT` | `title, sub, src, height, children` | Card wrapper with title bar, source badge, chart slot |
| `Kpi` | `label, value, unit, change, color, src` | Stat card with optional MoM delta |
| `SourceBadge` | `src` | Colored label pill — gold for Bloomberg★, blue for free sources, green for MOSPI |
| `PeersTab` | `T` | Peers tab — valuation + Mirae vs benchmark chart |
| `SectorHeatmap` | `T` | Sector tab with 4 sub-views |
| `IndiaDashboardV6` | — | Root component: theme state, tab state, KPI row, tab router |

---

## 6. Theme System

The dashboard supports **light and dark modes** via a `darkMode` boolean state. All colors are defined in the `THEMES` object and passed as prop `T` to every component.

Key design tokens:

| Token | Role |
|---|---|
| `T.bg` | Page background |
| `T.card` | Card background |
| `T.accent` | Primary amber/gold (Bloomberg highlights, active selections) |
| `T.blue`, `T.teal`, `T.green`, `T.red`, `T.orange`, `T.purple` | Semantic chart colors |
| `T.text`, `T.muted`, `T.dim` | Text hierarchy |
| `T.mospiGreen`, `T.mospiBlue` | MOSPI-specific badge colors |

---

## 7. Python Data Refresh Workflow

```python
import yfinance as yf
import pandas_datareader.data as web

# Nifty indices
nifty     = yf.download("^NSEI",       start="2022-01-01", interval="1mo")["Close"]
midcap100 = yf.download("^NSEMDCP100", start="2022-01-01", interval="1mo")["Close"]
usdinr    = yf.download("USDINR=X",    start="2022-01-01", interval="1mo")["Close"]

# Mirae fund (HK-listed proxy)
mirae     = yf.download("MAIMRCU.HK",  start="2022-01-01", interval="1mo")["Close"]

# Commodities
brent     = yf.download("BZ=F",        start="2022-01-01", interval="1mo")["Close"]
gold      = yf.download("GC=F",        start="2022-01-01", interval="1mo")["Close"]

# MOSPI — GDP (NAS indicator_code=22, quarterly, base 2022-23)
# MOSPI — CPI (base 2012, state_code=99 All India, sector_code=3 Combined, group_code=0)
# MOSPI — IIP (base 2011-12, category_code=4 General)
# MOSPI — PLFS Unemployment (frequency_code=1, indicator_code=3)

# US 10Y yield for global context
us10y = web.DataReader("DGS10", "fred", "2022-01-01")
```

**Output format per series** (paste into corresponding `D_*` array in JSX):
```js
const D_NIFTY = [
  { t: "Jan-22", v: 17339 },
  { t: "Feb-22", v: 16793 },
  ...
];
```

---

## 8. Known Limitations

| Item | Detail |
|---|---|
| No live updates | All data is static; dashboard must be manually refreshed |
| Bloomberg-only series | Forward P/E and EPS have no free substitute for consensus estimates |
| MAIMRCU.HK as proxy | HK-listed share class, not the India-domiciled fund NAV — minor divergence possible |
| PMI manual entry | S&P Global PMI is released as a PDF; no machine-readable free API |
| CORS restriction | NSE direct API and some RBI endpoints block browser-side calls; use Python backend |
| MOSPI PLFS lag | Annual unemployment data has a 12–18 month publication lag |
| Sector weights static | Mirae sector weights must be updated manually after each monthly factsheet |

---

## 9. Version History

| Version | Key Changes |
|---|---|
| v1 | Bloomberg-only; all tickers via Bloomberg API |
| v2 | Bloomberg migration started; yfinance for indices |
| v3 | Dual light/dark theme; Recharts charts |
| v4 | Sector heatmap; Mirae holdings vs benchmark |
| v5 | Full Bloomberg migration; Midcap 100 as correct benchmark; MOSPI integration planned |
| **v6** | **Brent + Gold in External tab; MC100 active weight view in Sector tab; MOSPI MCP live data tab (19 datasets); Mirae fund price chart vs Nifty/Midcap 100 in Peers tab; PLFS unemployment** |
