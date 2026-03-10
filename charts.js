// === DAOL Investment — Charts & UI Logic ===

// === THEME ===
function toggleTheme() {
    const d = document.documentElement;
    const isDark = d.getAttribute('data-theme') === 'dark';
    d.setAttribute('data-theme', isDark ? '' : 'dark');
    document.getElementById('theme-btn').textContent = isDark ? '◑' : '☀';
    initCharts();
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

    mkChart('c-norm', 'line', D.norm.d, [
        { label: 'S&P 500', data: D.norm.sp, borderColor: c.blue },
        { label: 'MSCI EM', data: D.norm.em, borderColor: c.green },
        { label: 'MSCI China', data: D.norm.china, borderColor: c.red, borderDash: [5, 3] },
        { label: 'Mirae India MC', data: D.norm.mirae, borderColor: c.pink, borderWidth: 3 }
    ], { dots: true, yOpts: { min: 50, max: 170 } });
}

// === LIVE METRIC CARDS (from D.latest) ===
function updateMetrics() {
    const L = D.latest;
    if (!L) return;

    // Helper: set inner HTML of element by id if it exists
    function set(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) {
            const valEl = el.querySelector('.metric-value');
            if (valEl) valEl.textContent = text;
        }
    }

    // Overview metrics
    if (L.nifty) set('m-nifty', `<div class="metric-label">Nifty 50</div><div class="metric-value">${L.nifty.toLocaleString()}</div><div class="metric-sub">Live (yfinance)</div>`);
    if (L.sensex) set('m-sensex', `<div class="metric-label">Sensex</div><div class="metric-value">${L.sensex.toLocaleString()}</div>`);
    if (L.usdinr) set('m-usdinr-top', `<div class="metric-label">USD/INR</div><div class="metric-value">${L.usdinr.toFixed(2)}</div>`);

    // External metrics
    if (L.brent) {
        const col = L.brent > 95 ? 'var(--red)' : L.brent > 85 ? 'var(--amber)' : 'var(--green)';
        set('m-brent', `<div class="metric-label">Brent Crude</div><div class="metric-value" style="color:${col}">$${Math.round(L.brent)}/bbl</div>`);
    }
    if (L.gold) {
        set('m-gold', `<div class="metric-label">Gold</div><div class="metric-value" style="color:var(--amber)">$${L.gold.toLocaleString()}/oz</div>`);
    }
    if (L.usdinr) {
        set('m-usdinr2', `<div class="metric-label">USD/INR</div><div class="metric-value">${L.usdinr.toFixed(2)}</div>`);
    }

    // Update Brent row in factor table
    if (L.brent && L.brentScore) {
        const brentScoreNum = parseFloat(L.brentScore);
        const pillClass = brentScoreNum >= 0 ? 'score-pos' : 'score-neg';
        const signalColor = brentScoreNum >= 0 ? 'var(--green)' : 'var(--red)';
        const brentRow = document.getElementById('row-brent');
        if (brentRow) {
            brentRow.cells[1].textContent = `$${Math.round(L.brent)}/bbl`;
            brentRow.cells[2].innerHTML = `<span class="score-pill ${pillClass}">${L.brentScore}</span>`;
            brentRow.cells[4].textContent = L.brentSignal;
            brentRow.cells[4].style.color = signalColor;
            brentRow.cells[5].textContent = L.brentRationale;
        }
    }
    // Update Gold row
    if (L.gold && L.goldScore) {
        const goldScoreNum = parseFloat(L.goldScore);
        const pillClass = goldScoreNum >= 0 ? 'score-pos' : 'score-neg';
        const signalColor = goldScoreNum >= 0 ? 'var(--green)' : 'var(--red)';
        const goldRow = document.getElementById('row-gold');
        if (goldRow) {
            goldRow.cells[1].textContent = `$${L.gold.toLocaleString()}/oz`;
            goldRow.cells[2].innerHTML = `<span class="score-pill ${pillClass}">${L.goldScore}</span>`;
            goldRow.cells[4].textContent = L.goldSignal;
            goldRow.cells[4].style.color = signalColor;
            goldRow.cells[5].textContent = L.goldRationale;
        }
    }

    // Recompute composite score dynamically
    recomputeScore();
}

// === COMPOSITE SCORE RECOMPUTATION ===
function recomputeScore() {
    const L = D.latest;
    if (!L) return;

    // Fixed scores (static macro data)
    const staticScores = {
        gdp: 1, cpi: 1, pmi: 1, repo: 1, fii: -1, iip: 1
    };
    // Weights
    const weights = {
        gdp: 0.15, cpi: 0.10, pmi: 0.12, repo: 0.10,
        fii: 0.18, iip: 0.10, brent: 0.13, gold: 0.12
    };

    const brentScore = parseFloat(L.brentScore || 1);
    const goldScore  = parseFloat(L.goldScore  || 1);

    let composite = 0;
    for (const [k, w] of Object.entries(weights)) {
        let score = staticScores[k] !== undefined ? staticScores[k] :
                    k === 'brent' ? brentScore : goldScore;
        composite += score * w;
    }
    composite = Math.round(composite * 100) / 100;

    let decision, decisionColor;
    if (composite <= -1.5)       { decision = 'UNDERWEIGHT';           decisionColor = 'var(--red)'; }
    else if (composite <= -0.5)  { decision = 'SLIGHTLY UNDERWEIGHT';  decisionColor = 'var(--red)'; }
    else if (composite <= 0.5)   { decision = 'NEUTRAL';               decisionColor = 'var(--amber)'; }
    else if (composite <= 1.5)   { decision = 'SLIGHTLY OVERWEIGHT';   decisionColor = 'var(--green)'; }
    else                         { decision = 'OVERWEIGHT';            decisionColor = 'var(--green)'; }

    const box = document.getElementById('decision-box');
    if (box) {
        const valEl = box.querySelector('.decision-value');
        const scoreEl = box.querySelector('.decision-score');
        if (valEl) valEl.textContent = decision;
        if (scoreEl) scoreEl.textContent = `Composite Score: ${composite >= 0 ? '+' : ''}${composite.toFixed(2)} / 2.00`;
        // Update gauge pointer text
        const pointerEl = box.querySelector('[style*="text-align:center"]');
        if (pointerEl) pointerEl.textContent = `▲ Current: ${composite >= 0 ? '+' : ''}${composite.toFixed(2)} (${decision} zone)`;
    }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    updateMetrics();
});
