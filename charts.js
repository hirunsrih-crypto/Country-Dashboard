// === DAOL Investment — Charts & UI Logic ===

// === THEME ===
function toggleTheme() {
    const d = document.documentElement;
    const isDark = d.getAttribute('data-theme') === 'dark';
    d.setAttribute('data-theme', isDark ? '' : 'dark');
    document.getElementById('theme-btn').textContent = isDark ? '◑' : '☀';
    initCharts();
    updateMetrics();
}

// === TABS ===
function setTab(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('sec-' + id).classList.add('active');
    btn.classList.add('active');
    setTimeout(initCharts, 50);
}

function setCountry(c) {
    document.querySelectorAll('.country-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('btn-' + c).classList.add('active');
}

// === CHART HELPERS ===
const charts = {};

function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#F1F5F9' : '#0F172A',
        grid: isDark ? '#2A3042' : '#E2E5ED',
        accent: isDark ? '#818CF8' : '#4F46E5',
        green: isDark ? '#34D399' : '#10B981',
        red: isDark ? '#F87171' : '#EF4444',
        blue: isDark ? '#60A5FA' : '#3B82F6',
        amber: isDark ? '#FBBF24' : '#F59E0B',
        purple: isDark ? '#A78BFA' : '#8B5CF6',
        pink: isDark ? '#F472B6' : '#EC4899',
        muted: isDark ? '#64748B' : '#94A3B8',
        bg: isDark ? '#0B0F1A' : '#F8F9FC',
        card: isDark ? '#1A1F2E' : '#FFFFFF',
    };
}

function mkChart(id, type, labels, datasets, opts = {}) {
    const c = getColors();
    if (charts[id]) charts[id].destroy();
    const el = document.getElementById(id);
    if (!el || !el.getContext) return;

    const defaults = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
            legend: {
                display: opts.legend !== false && datasets.length > 1,
                labels: {
                    color: c.muted,
                    font: { family: 'Inter', size: 11, weight: '500' },
                    boxWidth: 12, padding: 14, usePointStyle: true, pointStyleWidth: 10
                }
            },
            tooltip: {
                backgroundColor: c.card,
                titleColor: c.text,
                bodyColor: c.text,
                borderColor: c.grid,
                borderWidth: 1,
                titleFont: { family: 'Inter', size: 11, weight: '600' },
                bodyFont: { family: 'Inter', size: 11 },
                padding: 12,
                cornerRadius: 8,
                boxPadding: 4,
                usePointStyle: true,
                displayColors: true,
            }
        },
        scales: {
            x: {
                ticks: { color: c.muted, font: { family: 'Inter', size: 10 }, maxRotation: 0 },
                grid: { display: false },
                border: { color: c.grid }
            },
            y: {
                ticks: { color: c.muted, font: { family: 'Inter', size: 10 } },
                grid: { color: c.grid + '80', lineWidth: 0.5 },
                border: { display: false },
                ...(opts.yOpts || {})
            }
        },
        elements: {
            point: { radius: opts.dots ? 3 : 0, hoverRadius: 5, borderWidth: 2, backgroundColor: c.card },
            line: { tension: 0.35, borderWidth: 2.5 }
        },
        ...(opts.extra || {})
    };

    charts[id] = new Chart(el, { type, data: { labels, datasets }, options: defaults });
}

// === GRADIENT HELPER ===
function createGradient(ctx, color, height) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height || 280);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '02');
    return gradient;
}

// === INIT ALL CHARTS ===
function initCharts() {
    const c = getColors();

    // --- Overview ---
    const niftyCtx = document.getElementById('c-nifty');
    if (niftyCtx) {
        const grad = createGradient(niftyCtx.getContext('2d'), c.accent);
        mkChart('c-nifty', 'line', D.nifty.d, [{
            label: 'Nifty 50', data: D.nifty.v,
            borderColor: c.accent, backgroundColor: grad, fill: true
        }]);
    }

    mkChart('c-gdp', 'bar', D.gdp.d, [{
        label: 'GDP %', data: D.gdp.v,
        backgroundColor: D.gdp.v.map(v => v >= 7 ? c.green + 'CC' : c.accent + '99'),
        borderRadius: 4, borderSkipped: false
    }]);

    // --- Macro ---
    const cpiCtx = document.getElementById('c-cpi');
    if (cpiCtx) {
        const grad = createGradient(cpiCtx.getContext('2d'), c.red);
        mkChart('c-cpi', 'line', D.cpi.d, [{
            label: 'CPI YoY %', data: D.cpi.v,
            borderColor: c.red, backgroundColor: grad, fill: true
        }], { dots: true });
    }

    mkChart('c-pmi', 'line', D.pmi_mfg.d, [
        { label: 'Manufacturing', data: D.pmi_mfg.v, borderColor: c.accent },
        { label: 'Services', data: D.pmi_svc.v, borderColor: c.blue }
    ], { dots: true });

    mkChart('c-iip', 'bar', D.iip.d, [{
        label: 'IIP YoY %', data: D.iip.v,
        backgroundColor: D.iip.v.map(v => v >= 0 ? c.green + 'CC' : c.red + 'CC'),
        borderRadius: 3, borderSkipped: false
    }]);

    const unempCtx = document.getElementById('c-unemp');
    if (unempCtx) {
        const grad = createGradient(unempCtx.getContext('2d'), c.amber, 180);
        mkChart('c-unemp', 'line', D.unemp.d, [{
            label: 'Unemployment %', data: D.unemp.v,
            borderColor: c.amber, backgroundColor: grad, fill: true
        }], { dots: true });
    }

    const repoCtx = document.getElementById('c-repo');
    if (repoCtx) {
        const grad = createGradient(repoCtx.getContext('2d'), c.purple, 180);
        mkChart('c-repo', 'line', D.repo.d, [{
            label: 'Repo Rate %', data: D.repo.v,
            borderColor: c.purple, backgroundColor: grad, fill: true, stepped: true
        }]);
    }

    // --- External ---
    const brentCtx = document.getElementById('c-brent');
    if (brentCtx) {
        const grad = createGradient(brentCtx.getContext('2d'), c.accent, 220);
        mkChart('c-brent', 'line', D.brent.d, [{
            label: 'Brent USD/bbl', data: D.brent.v,
            borderColor: c.accent, backgroundColor: grad, fill: true
        }], { dots: true });
    }

    const goldCtx = document.getElementById('c-gold');
    if (goldCtx) {
        const grad = createGradient(goldCtx.getContext('2d'), c.amber, 220);
        mkChart('c-gold', 'line', D.gold.d, [{
            label: 'Gold USD/oz', data: D.gold.v,
            borderColor: c.amber, backgroundColor: grad, fill: true
        }], { dots: true });
    }

    mkChart('c-fii', 'bar', D.fii.d, [{
        label: 'FII Net $mn', data: D.fii.v,
        backgroundColor: D.fii.v.map(v => v >= 0 ? c.green + 'CC' : c.red + 'CC'),
        borderRadius: 3, borderSkipped: false
    }]);

    const usdinrCtx = document.getElementById('c-usdinr');
    if (usdinrCtx) {
        const grad = createGradient(usdinrCtx.getContext('2d'), c.blue, 180);
        mkChart('c-usdinr', 'line', D.usdinr.d, [{
            label: 'USD/INR', data: D.usdinr.v,
            borderColor: c.blue, backgroundColor: grad, fill: true
        }], { dots: true });
    }

    const cadCtx = document.getElementById('c-cad');
    if (cadCtx) {
        const grad = createGradient(cadCtx.getContext('2d'), c.red, 180);
        mkChart('c-cad', 'line', D.cad.d, [{
            label: 'CAD % GDP', data: D.cad.v,
            borderColor: c.red, backgroundColor: grad, fill: true
        }], { dots: true });
    }

    // --- Peers ---
    mkChart('c-fwdpe', 'line', D.fwdpe.d, [
        { label: 'India (Nifty)', data: D.fwdpe.india, borderColor: c.accent, borderWidth: 3 },
        { label: 'MSCI EM', data: D.fwdpe.em, borderColor: c.green },
        { label: 'MSCI China', data: D.fwdpe.china, borderColor: c.red, borderDash: [5, 3] },
        { label: 'S&P 500', data: D.fwdpe.sp, borderColor: c.blue, borderDash: [8, 4] }
    ], { dots: true, yOpts: { min: 8, max: 28 } });

    const premCtx = document.getElementById('c-premium');
    if (premCtx) {
        const grad = createGradient(premCtx.getContext('2d'), c.accent, 220);
        mkChart('c-premium', 'line', D.premium.d, [{
            label: 'India Premium vs EM %', data: D.premium.v,
            borderColor: c.accent, backgroundColor: grad, fill: true
        }], { dots: true, yOpts: { min: 0, max: 100 } });
    }

    const normAll = [...D.norm.sp, ...D.norm.em, ...D.norm.china, ...D.norm.mirae];
    const normMin = Math.floor(Math.min(...normAll) / 10) * 10;
    const normMax = Math.ceil(Math.max(...normAll) / 10) * 10 + 10;
    mkChart('c-norm', 'line', D.norm.d, [
        { label: 'S&P 500', data: D.norm.sp, borderColor: c.blue },
        { label: 'MSCI EM', data: D.norm.em, borderColor: c.green },
        { label: 'MSCI China', data: D.norm.china, borderColor: c.red, borderDash: [5, 3] },
        { label: 'Mirae India MC', data: D.norm.mirae, borderColor: c.pink, borderWidth: 3 }
    ], { dots: true, yOpts: { min: normMin, max: normMax } });
}

// === HELPERS ===
function setEl(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
function setTxt(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

// "26-03" → "Mar 2026"
function fmtLabel(label) {
    if (!label) return '';
    const [y, m] = label.split('-');
    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]} 20${y}`;
}

// === LIVE METRIC CARDS (from D.latest + data series) ===
function updateMetrics() {
    const L = D.latest;
    if (!L) return;

    // ── Overview ──────────────────────────────────────────────────────────────
    if (L.nifty) setEl('m-nifty',
        `<div class="metric-label">Nifty 50</div>
         <div class="metric-value">${L.nifty.toLocaleString()}</div>
         <div class="metric-sub">${fmtLabel(D.nifty.d.at(-1))}</div>`);

    if (L.sensex) setEl('m-sensex',
        `<div class="metric-label">Sensex</div>
         <div class="metric-value">${L.sensex.toLocaleString()}</div>`);

    if (L.usdinr) setEl('m-usdinr-top',
        `<div class="metric-label">USD/INR</div>
         <div class="metric-value">${L.usdinr.toFixed(2)}</div>`);

    // India vs EM premium — from D.premium series
    if (D.premium && D.premium.v.length) {
        const prem = D.premium.v.at(-1);
        const maxPrem = Math.max(...D.premium.v);
        const col = Math.abs(prem) < 20 ? 'var(--amber)' : prem > 60 ? 'var(--red)' : 'var(--green)';
        const sub = prem < 15 ? 'Multi-year low premium' : 'vs MSCI EM fwd P/E';
        setEl('m-premium-top',
            `<div class="metric-label">India vs EM</div>
             <div class="metric-value" style="color:${col}">${prem >= 0 ? '+' : ''}${prem.toFixed(0)}%</div>
             <div class="metric-sub">${sub}</div>`);
    }

    // Nifty panel — subtitle + badge computed from data
    if (D.nifty.d.length >= 2) {
        setTxt('nifty-date-sub', `Monthly Close · ${fmtLabel(D.nifty.d[0])} — ${fmtLabel(D.nifty.d.at(-1))}`);
        const ret = (D.nifty.v.at(-1) - D.nifty.v[0]) / D.nifty.v[0] * 100;
        const badge = document.getElementById('nifty-badge');
        if (badge) {
            badge.textContent = `${ret >= 0 ? '▲' : '▼'} ${Math.abs(ret).toFixed(1)}%`;
            badge.style.background = ret >= 0 ? 'var(--green-bg)' : 'var(--red-bg)';
            badge.style.color      = ret >= 0 ? 'var(--green)'    : 'var(--red)';
        }
    }

    // ── External ──────────────────────────────────────────────────────────────
    if (L.brent) {
        const col = L.brent > 95 ? 'var(--red)' : L.brent > 85 ? 'var(--amber)' : 'var(--green)';
        setEl('m-brent',
            `<div class="metric-label">Brent Crude</div>
             <div class="metric-value" style="color:${col}">$${Math.round(L.brent)}/bbl</div>`);
    }
    if (L.gold) setEl('m-gold',
        `<div class="metric-label">Gold</div>
         <div class="metric-value" style="color:var(--amber)">$${L.gold.toLocaleString()}/oz</div>`);

    if (L.usdinr) setEl('m-usdinr2',
        `<div class="metric-label">USD/INR</div>
         <div class="metric-value">${L.usdinr.toFixed(2)}</div>`);

    // FII — latest value + panel badge
    if (D.fii && D.fii.v.length) {
        const fii = D.fii.v.at(-1);
        const col = fii >= 0 ? 'var(--green)' : 'var(--red)';
        setEl('m-fii',
            `<div class="metric-label">FII Net</div>
             <div class="metric-value" style="color:${col}">${fii >= 0 ? '+' : '-'}$${Math.abs(fii).toLocaleString()}mn</div>`);
        const fiiBadge = document.getElementById('fii-badge');
        if (fiiBadge) {
            fiiBadge.textContent       = fii >= 0 ? 'Net Inflow' : 'Net Outflow';
            fiiBadge.style.background  = fii >= 0 ? 'var(--green-bg)' : 'var(--red-bg)';
            fiiBadge.style.color       = fii >= 0 ? 'var(--green)'    : 'var(--red)';
        }
    }

    // CAD — latest value
    if (D.cad && D.cad.v.length) {
        const cad = D.cad.v.at(-1);
        setEl('m-cad',
            `<div class="metric-label">CAD % GDP</div>
             <div class="metric-value">${cad.toFixed(2)}%</div>`);
    }

    // ── Peers ─────────────────────────────────────────────────────────────────
    // Premium panel subtitle — show max→current compression
    if (D.premium && D.premium.v.length) {
        const prem = D.premium.v.at(-1);
        const maxPrem = Math.max(...D.premium.v);
        setTxt('premium-sub', `Forward P/E Premium % — Compressed from ${maxPrem.toFixed(0)}% to ${prem.toFixed(0)}%`);
    }

    // ── Analysis — Factor table rows (Brent & Gold) ───────────────────────────
    function updateFactorRow(rowId, val, score, signal, rationale) {
        const row = document.getElementById(rowId);
        if (!row) return;
        const num = parseFloat(score);
        const pillClass   = num >= 0 ? 'score-pos' : 'score-neg';
        const signalColor = num >= 0 ? 'var(--green)' : 'var(--red)';
        row.cells[1].textContent = val;
        row.cells[2].innerHTML   = `<span class="score-pill ${pillClass}">${score}</span>`;
        row.cells[4].textContent = signal;
        row.cells[4].style.color = signalColor;
        row.cells[5].textContent = rationale;
        row.cells[5].style.color    = 'var(--muted)';
        row.cells[5].style.fontSize = '11px';
    }
    if (L.brent && L.brentScore)
        updateFactorRow('row-brent', `$${Math.round(L.brent)}/bbl`, L.brentScore, L.brentSignal, L.brentRationale);
    if (L.gold && L.goldScore)
        updateFactorRow('row-gold', `$${L.gold.toLocaleString()}/oz`, L.goldScore, L.goldSignal, L.goldRationale);

    // ── Footer ────────────────────────────────────────────────────────────────
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    setTxt('footer-src',
        `Source: Bloomberg (DAOL Investment) · Market data: yfinance ${dateStr} · Macro: RBI, MOSPI, CMIE · OLS Model: 2022–2025`);

    recomputeScore();
}

// === COMPOSITE SCORE & THESIS ===
function recomputeScore() {
    const L = D.latest;
    if (!L) return;

    const staticScores = { gdp: 1, cpi: 1, pmi: 1, repo: 1, fii: -1, iip: 1 };
    const weights      = { gdp: 0.15, cpi: 0.10, pmi: 0.12, repo: 0.10, fii: 0.18, iip: 0.10, brent: 0.13, gold: 0.12 };

    const brentScore = parseFloat(L.brentScore || '1');
    const goldScore  = parseFloat(L.goldScore  || '1');

    let composite = 0;
    for (const [k, w] of Object.entries(weights)) {
        const s = staticScores[k] !== undefined ? staticScores[k] : k === 'brent' ? brentScore : goldScore;
        composite += s * w;
    }
    composite = Math.round(composite * 100) / 100;
    const sign = composite >= 0 ? '+' : '';

    let decision;
    if      (composite <= -1.5) decision = 'UNDERWEIGHT';
    else if (composite <= -0.5) decision = 'SLIGHTLY UNDERWEIGHT';
    else if (composite <=  0.5) decision = 'NEUTRAL';
    else if (composite <=  1.5) decision = 'SLIGHTLY OVERWEIGHT';
    else                        decision = 'OVERWEIGHT';

    // Decision box
    const box = document.getElementById('decision-box');
    if (box) {
        const valEl   = box.querySelector('.decision-value');
        const scoreEl = box.querySelector('.decision-score');
        if (valEl)   valEl.textContent   = decision;
        if (scoreEl) scoreEl.textContent = `Composite Score: ${sign}${composite.toFixed(2)} / 2.00`;
        // Gauge indicator text
        const gaugeText = box.querySelector('[style*="text-align:center"]');
        if (gaugeText) gaugeText.textContent =
            `▲ Current: ${sign}${composite.toFixed(2)}  (${decision.charAt(0) + decision.slice(1).toLowerCase()} zone)`;
    }

    // Gauge needle — position marker as % along the scale (-2 to +2 range)
    const needlePct = Math.min(Math.max((composite + 2) / 4 * 100, 2), 98);
    let needle = document.getElementById('gauge-needle');
    if (!needle) {
        const scale = document.querySelector('.gauge-scale');
        if (scale) {
            scale.style.position = 'relative';
            needle = document.createElement('div');
            needle.id = 'gauge-needle';
            needle.style.cssText =
                'position:absolute;top:-4px;width:3px;height:18px;background:var(--text);border-radius:2px;transform:translateX(-50%);transition:left .8s cubic-bezier(.4,0,.2,1);pointer-events:none';
            scale.appendChild(needle);
        }
    }
    if (needle) needle.style.left = needlePct + '%';

    // ── Investment Thesis text ─────────────────────────────────────────────
    const posCount = Object.values(staticScores).filter(s => s > 0).length +
                     (brentScore > 0 ? 1 : 0) + (goldScore > 0 ? 1 : 0);
    const negCount = 8 - posCount;
    const fiiLatest = D.fii && D.fii.v.length ? D.fii.v.at(-1) : -601;
    const brent     = L.brent ? Math.round(L.brent) : 73;
    const usdinr    = L.usdinr ? L.usdinr.toFixed(1) : '91.0';
    const premLatest = D.premium && D.premium.v.length ? D.premium.v.at(-1).toFixed(0) : '10';

    const recEl = document.getElementById('thesis-rec');
    if (recEl) recEl.innerHTML =
        `<strong style="color:var(--text)">Recommendation: ${decision}</strong> — Composite score ${sign}${composite.toFixed(2)} falls in the ${decision.charAt(0) + decision.slice(1).toLowerCase()} band.`;

    const bullEl = document.getElementById('thesis-bull');
    if (bullEl) bullEl.innerHTML =
        `<strong style="color:var(--text)">Bull Case:</strong> ${posCount} of 8 factors score positively. ` +
        `Macro fundamentals are strong (GDP 7.8%, CPI 4.2%, PMI expansionary). RBI easing cycle provides tailwind. ` +
        `Brent at $${brent}/bbl — ${brent < 75 ? 'sweet spot for India' : brent < 85 ? 'neutral range for India' : 'elevated — headwind for India'}. ` +
        `Valuation premium vs EM at ${premLatest}% suggests ${parseFloat(premLatest) < 20 ? 'significant de-rating complete' : 'some valuation cushion remains'}.`;

    const bearEl = document.getElementById('thesis-bear');
    if (bearEl) bearEl.innerHTML =
        `<strong style="color:var(--text)">Bear Case:</strong> FII flows at ${fiiLatest >= 0 ? '+' : '-'}$${Math.abs(fiiLatest).toLocaleString()}mn — ` +
        `${fiiLatest < 0 ? 'persistent outflows remain a drag' : 'turned positive, a bullish signal'}. ` +
        `INR at ${usdinr} creates headwind for USD-denominated returns. ` +
        `Mirae India Midcap underperforming broader EM since H2 2024, reflecting midcap de-rating.`;

    const riskEl = document.getElementById('thesis-risk');
    if (riskEl) {
        const swingFactor = fiiLatest < 0 ? 'FII flow reversal' : 'Brent crude escalation';
        const swingDesc   = fiiLatest < 0
            ? `FII outflows (18% weight) — shift to inflows would push composite to ~${(composite + 0.36).toFixed(2)}`
            : `Brent at $${brent} (13% weight) — sustained >$95 keeps score depressed`;
        riskEl.innerHTML =
            `<strong style="color:var(--text)">Key Risk:</strong> ${swingDesc}. ` +
            `${brentScore < 0 ? `High oil at $${brent} adds cost pressure for import-dependent India. ` : ''}` +
            `Monitor FII flows and RBI policy for composite score inflection.`;
    }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    updateMetrics();
});
