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

// === INIT ===
document.addEventListener('DOMContentLoaded', initCharts);
