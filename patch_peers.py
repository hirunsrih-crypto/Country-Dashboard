"""
Update D_PEERS_FWD_PE and D_PEERS_FWD_EPS in india-dashboard-v6.jsx
from India Meta Data.xlsx (monthly data Jan-22 through latest).

Column mapping:
  india fwd PE   -> MAIMRCU LX Equity PX_LAST     (col 16)
  msciChina fwdPE-> MXCN Index BEST_PE_RATIO       (col 4)
  msciEM fwdPE   -> MXEF Index BEST_PE_RATIO       (col 14)
  sp500 fwdPE    -> SPX Index BEST_PE_RATIO        (col 24)
  midcap100      -> not in Excel, set null

  msciChina fwdEPS -> MXCN BEST_EPS               (col 5)
  msciEM fwdEPS    -> MXEF BEST_EPS               (col 15)
  sp500 fwdEPS     -> SPX BEST_EPS                (col 25)
  india/midcap100  -> not in Excel, set null
"""

import re
import openpyxl
from pathlib import Path
from datetime import datetime

JSX_PATH = Path("india-dashboard-v6.jsx")
XLS_PATH = Path("India Meta Data.xlsx")
MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

def patch_const(content, var_name, new_body):
    pattern = rf'const {re.escape(var_name)} = \[[\s\S]*?\n\];'
    updated, n = re.subn(pattern, new_body, content)
    if n == 0:
        print(f"  WARN {var_name}: pattern not found")
    else:
        print(f"  OK   {var_name} patched")
    return updated

def num(val, digits=2):
    if isinstance(val, (int, float)):
        return round(float(val), digits)
    return None

def fmt(val):
    return str(val) if val is not None else "null"

# Load Excel
wb = openpyxl.load_workbook(str(XLS_PATH))
ws = wb["Sheet1"]
rows = list(ws.iter_rows(values_only=True))

fwd_pe_rows = []
fwd_eps_rows = []

for row in rows[2:]:
    if not isinstance(row[0], datetime):
        continue
    d = row[0]
    if d.year < 2022:
        continue
    label = f"{MONTHS[d.month-1]}-{str(d.year)[2:]}"

    india   = num(row[16], 2)   # MAIMRCU PX_LAST
    china   = num(row[4],  2)   # MXCN BEST_PE_RATIO
    em      = num(row[14], 2)   # MXEF BEST_PE_RATIO
    sp500   = num(row[24], 2)   # SPX BEST_PE_RATIO

    china_eps = num(row[5],  2)  # MXCN BEST_EPS
    em_eps    = num(row[15], 2)  # MXEF BEST_EPS
    sp500_eps = num(row[25], 2)  # SPX BEST_EPS

    fwd_pe_rows.append(
        f'  {{d:"{label}",india:{fmt(india)},midcap100:null,'
        f'msciEM:{fmt(em)},msciChina:{fmt(china)},sp500:{fmt(sp500)}}}'
    )
    fwd_eps_rows.append(
        f'  {{d:"{label}",india:null,midcap100:null,'
        f'msciEM:{fmt(em_eps)},msciChina:{fmt(china_eps)},sp500:{fmt(sp500_eps)}}}'
    )

print(f"Loaded {len(fwd_pe_rows)} monthly rows from Excel")
print(f"  First: {fwd_pe_rows[0]}")
print(f"  Last:  {fwd_pe_rows[-1]}")

pe_body  = "const D_PEERS_FWD_PE = [\n" + ",\n".join(fwd_pe_rows) + "\n];"
eps_body = "// Forward EPS -- Bloomberg (MXCN, MXEF, SPX BEST_EPS; india/midcap100 not in Excel)\nconst D_PEERS_FWD_EPS = [\n" + ",\n".join(fwd_eps_rows) + "\n];"

jsx = JSX_PATH.read_text(encoding="utf-8")
jsx = patch_const(jsx, "D_PEERS_FWD_PE", pe_body)

# D_PEERS_FWD_EPS has a comment line before it; handle that
pattern2 = r'// Forward EPS.*?\nconst D_PEERS_FWD_EPS = \[[\s\S]*?\n\];'
updated2, n2 = re.subn(pattern2, eps_body, jsx)
if n2 == 0:
    print("  WARN D_PEERS_FWD_EPS (with comment): trying without comment")
    jsx = patch_const(jsx, "D_PEERS_FWD_EPS", "const D_PEERS_FWD_EPS = [\n" + ",\n".join(fwd_eps_rows) + "\n];")
else:
    print(f"  OK   D_PEERS_FWD_EPS patched")
    jsx = updated2

JSX_PATH.write_text(jsx, encoding="utf-8")
print("Done.")
