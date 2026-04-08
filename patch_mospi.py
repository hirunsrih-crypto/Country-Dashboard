import re, datetime as dt
from pathlib import Path

JSX_PATH = Path("india-dashboard-v6.jsx")
MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

def mmm_yy(year, month_name):
    m = dt.datetime.strptime(month_name, "%B").month
    return f"{MONTHS[m-1]}-{str(year)[2:]}"

def patch_array(content, var_name, new_body):
    pattern = rf'const {re.escape(var_name)} = \[[\s\S]*?\n\];'
    updated, n = re.subn(pattern, new_body, content)
    if n == 0:
        print(f"  WARN {var_name}: pattern not found")
    return updated

def build_simple_array(var_name, data):
    rows = [f'  {{d:"{r["d"]}",v:{r["v"]}}}' for r in data]
    return f"const {var_name} = [\n" + ",\n".join(rows) + "\n];"

# CPI
cpi_raw = [
    {"year":2022,"month":"January","inflation":"6.01"},{"year":2022,"month":"February","inflation":"6.07"},{"year":2022,"month":"March","inflation":"6.95"},{"year":2022,"month":"April","inflation":"7.79"},{"year":2022,"month":"May","inflation":"7.04"},{"year":2022,"month":"June","inflation":"7.01"},{"year":2022,"month":"July","inflation":"6.71"},{"year":2022,"month":"August","inflation":"7.00"},{"year":2022,"month":"September","inflation":"7.41"},{"year":2022,"month":"October","inflation":"6.77"},{"year":2022,"month":"November","inflation":"5.88"},{"year":2022,"month":"December","inflation":"5.72"},
    {"year":2023,"month":"January","inflation":"6.52"},{"year":2023,"month":"February","inflation":"6.44"},{"year":2023,"month":"March","inflation":"5.66"},{"year":2023,"month":"April","inflation":"4.70"},{"year":2023,"month":"May","inflation":"4.31"},{"year":2023,"month":"June","inflation":"4.87"},{"year":2023,"month":"July","inflation":"7.44"},{"year":2023,"month":"August","inflation":"6.83"},{"year":2023,"month":"September","inflation":"5.02"},{"year":2023,"month":"October","inflation":"4.87"},{"year":2023,"month":"November","inflation":"5.55"},{"year":2023,"month":"December","inflation":"5.69"},
    {"year":2024,"month":"January","inflation":"5.10"},{"year":2024,"month":"February","inflation":"5.09"},{"year":2024,"month":"March","inflation":"4.85"},{"year":2024,"month":"April","inflation":"4.83"},{"year":2024,"month":"May","inflation":"4.80"},{"year":2024,"month":"June","inflation":"5.08"},{"year":2024,"month":"July","inflation":"3.60"},{"year":2024,"month":"August","inflation":"3.65"},{"year":2024,"month":"September","inflation":"5.49"},{"year":2024,"month":"October","inflation":"6.21"},{"year":2024,"month":"November","inflation":"5.48"},{"year":2024,"month":"December","inflation":"5.22"},
    {"year":2025,"month":"January","inflation":"4.26"},{"year":2025,"month":"February","inflation":"3.61"},{"year":2025,"month":"March","inflation":"3.34"},{"year":2025,"month":"April","inflation":"3.16"},{"year":2025,"month":"May","inflation":"2.82"},{"year":2025,"month":"June","inflation":"2.10"},{"year":2025,"month":"July","inflation":"1.61"},{"year":2025,"month":"August","inflation":"2.07"},{"year":2025,"month":"September","inflation":"1.44"},{"year":2025,"month":"October","inflation":"0.25"},{"year":2025,"month":"November","inflation":"0.71"},{"year":2025,"month":"December","inflation":"1.33"},
]
cpi = [{"d": mmm_yy(r["year"], r["month"]), "v": round(float(r["inflation"]), 2)} for r in cpi_raw]
print(f"CPI: {len(cpi)} records, latest: {cpi[-1]}")

# IIP
iip_raw = [
    {"year":2022,"month":"January","growth_rate":"2.0"},{"year":2022,"month":"February","growth_rate":"1.2"},{"year":2022,"month":"March","growth_rate":"2.2"},{"year":2022,"month":"April","growth_rate":"6.7"},{"year":2022,"month":"May","growth_rate":"19.7"},{"year":2022,"month":"June","growth_rate":"12.6"},{"year":2022,"month":"July","growth_rate":"2.2"},{"year":2022,"month":"August","growth_rate":"-0.7"},{"year":2022,"month":"September","growth_rate":"3.3"},{"year":2022,"month":"October","growth_rate":"-4.1"},{"year":2022,"month":"November","growth_rate":"7.6"},{"year":2022,"month":"December","growth_rate":"5.1"},
    {"year":2023,"month":"January","growth_rate":"5.8"},{"year":2023,"month":"February","growth_rate":"6.0"},{"year":2023,"month":"March","growth_rate":"1.9"},{"year":2023,"month":"April","growth_rate":"4.6"},{"year":2023,"month":"May","growth_rate":"5.7"},{"year":2023,"month":"June","growth_rate":"4.0"},{"year":2023,"month":"July","growth_rate":"6.2"},{"year":2023,"month":"August","growth_rate":"10.9"},{"year":2023,"month":"September","growth_rate":"6.4"},{"year":2023,"month":"October","growth_rate":"11.9"},{"year":2023,"month":"November","growth_rate":"2.5"},{"year":2023,"month":"December","growth_rate":"4.4"},
    {"year":2024,"month":"January","growth_rate":"4.2"},{"year":2024,"month":"February","growth_rate":"5.6"},{"year":2024,"month":"March","growth_rate":"5.5"},{"year":2024,"month":"April","growth_rate":"5.2"},{"year":2024,"month":"May","growth_rate":"6.3"},{"year":2024,"month":"June","growth_rate":"4.9"},{"year":2024,"month":"July","growth_rate":"5.0"},{"year":2024,"month":"August","growth_rate":"0.0"},{"year":2024,"month":"September","growth_rate":"3.2"},{"year":2024,"month":"October","growth_rate":"3.7"},{"year":2024,"month":"November","growth_rate":"5.0"},{"year":2024,"month":"December","growth_rate":"3.7"},
    {"year":2025,"month":"January","growth_rate":"5.2"},{"year":2025,"month":"February","growth_rate":"2.7"},{"year":2025,"month":"March","growth_rate":"3.9"},{"year":2025,"month":"April","growth_rate":"2.6"},{"year":2025,"month":"May","growth_rate":"1.9"},{"year":2025,"month":"June","growth_rate":"1.5"},{"year":2025,"month":"July","growth_rate":"4.3"},{"year":2025,"month":"August","growth_rate":"4.0"},{"year":2025,"month":"September","growth_rate":"4.6"},{"year":2025,"month":"October","growth_rate":"0.5"},{"year":2025,"month":"November","growth_rate":"7.2"},{"year":2025,"month":"December","growth_rate":"7.8"},
]
iip = [{"d": mmm_yy(r["year"], r["month"]), "v": round(float(r["growth_rate"]), 1)} for r in iip_raw]
print(f"IIP: {len(iip)} records, latest: {iip[-1]}")

# GDP
FY_SHORT = {"2022-23":"FY23","2023-24":"FY24","2024-25":"FY25","2025-26":"FY26","2026-27":"FY27"}
FY_ORDER = {v:i for i,v in enumerate(FY_SHORT.values())}
Q_ORDER  = {"Q1":1,"Q2":2,"Q3":3,"Q4":4}

gdp_raw = [
    {"year":"2023-24","quarter":"Q1","constant_price":"6.6"},
    {"year":"2023-24","quarter":"Q2","constant_price":"7.6"},
    {"year":"2023-24","quarter":"Q3","constant_price":"7.1"},
    {"year":"2023-24","quarter":"Q4","constant_price":"7.5"},
    {"year":"2024-25","quarter":"Q1","constant_price":"7.5"},
    {"year":"2024-25","quarter":"Q2","constant_price":"6.6"},
    {"year":"2024-25","quarter":"Q3","constant_price":"7.4"},
    {"year":"2024-25","quarter":"Q4","constant_price":"7"},
    {"year":"2025-26","quarter":"Q1","constant_price":"6.723407520559022"},
    {"year":"2025-26","quarter":"Q2","constant_price":"8.409534410995164"},
    {"year":"2025-26","quarter":"Q3","constant_price":"7.818079500051084"},
]
gdp_raw.sort(key=lambda x: (FY_ORDER.get(FY_SHORT.get(x["year"],""),99), Q_ORDER.get(x["quarter"],0)))
gdp = [{"d":f"{r['quarter']} {FY_SHORT.get(r['year'],r['year'])}","v":round(float(r["constant_price"]),1),"fy":r["year"],"q":r["quarter"]} for r in gdp_raw]
print(f"GDP: {len(gdp)} records, latest: {gdp[-1]}")

# Patch JSX
jsx = JSX_PATH.read_text(encoding="utf-8")
jsx = patch_array(jsx, "D_CPI_MOSPI", build_simple_array("D_CPI_MOSPI", cpi))
jsx = patch_array(jsx, "D_IIP_MOSPI", build_simple_array("D_IIP_MOSPI", iip))

gdp_rows = [f'  {{d:"{r["d"]}",v:{r["v"]},fy:"{r["fy"]}",q:"{r["q"]}"}}' for r in gdp]
gdp_body = "const D_GDP = [\n  // MOSPI NAS - Quarterly GDP Growth Rate (Constant Price, base 2022-23)\n" + ",\n".join(gdp_rows) + "\n];"
jsx = patch_array(jsx, "D_GDP", gdp_body)

JSX_PATH.write_text(jsx, encoding="utf-8")
print("JSX patched successfully")
