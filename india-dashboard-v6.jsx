import { useState, useMemo, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ComposedChart, Legend, Cell
} from "recharts";

// ─── THEME SYSTEM ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#080C14",
    surface: "#0D1320",
    card: "#111B2E",
    cardHover: "#152034",
    border: "#1C2D45",
    borderBright: "#253D5B",
    text: "#D4E2F4",
    muted: "#7A9BBE",
    dim: "#3D5A7A",
    accent: "#E8A838",
    accentDim: "rgba(232,168,56,0.12)",
    accentGlow: "rgba(232,168,56,0.25)",
    green: "#22C55E",
    greenDim: "rgba(34,197,94,0.12)",
    red: "#EF4444",
    redDim: "rgba(239,68,68,0.12)",
    blue: "#38BDF8",
    blueDim: "rgba(56,189,248,0.1)",
    purple: "#A78BFA",
    teal: "#2DD4BF",
    orange: "#FB923C",
    grid: "rgba(28,45,69,0.8)",
    tooltipBg: "#0D1B2E",
  },
  light: {
    bg: "#F7F8FA",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardHover: "#F0F4F8",
    border: "#E2E8F0",
    borderBright: "#CBD5E1",
    text: "#0F172A",
    muted: "#64748B",
    dim: "#94A3B8",
    accent: "#C2851A",
    accentDim: "rgba(194,133,26,0.08)",
    accentGlow: "rgba(194,133,26,0.2)",
    green: "#16A34A",
    greenDim: "rgba(22,163,74,0.08)",
    red: "#DC2626",
    redDim: "rgba(220,38,38,0.08)",
    blue: "#0284C7",
    blueDim: "rgba(2,132,199,0.08)",
    purple: "#7C3AED",
    teal: "#0D9488",
    orange: "#EA580C",
    grid: "rgba(203,213,225,0.6)",
    tooltipBg: "#FFFFFF",
  }
};

const MONO = "'IBM Plex Mono','Fira Code',monospace";
const SANS = "'DM Sans','Plus Jakarta Sans',sans-serif";
const DISPLAY = "'Fraunces','Playfair Display',Georgia,serif";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const D_NIFTY = [
  {d:"Jan-22",v:17340},{d:"Feb-22",v:16794},{d:"Mar-22",v:17465},{d:"Apr-22",v:17102},
  {d:"May-22",v:16585},{d:"Jun-22",v:15780},{d:"Jul-22",v:17158},{d:"Aug-22",v:17759},
  {d:"Sep-22",v:17094},{d:"Oct-22",v:18145},{d:"Nov-22",v:18758},{d:"Dec-22",v:18105},
  {d:"Jan-23",v:17604},{d:"Feb-23",v:17465},{d:"Mar-23",v:17359},{d:"Apr-23",v:18065},
  {d:"May-23",v:18534},{d:"Jun-23",v:18936},{d:"Jul-23",v:19646},{d:"Aug-23",v:19253},
  {d:"Sep-23",v:19638},{d:"Oct-23",v:19079},{d:"Nov-23",v:19795},{d:"Dec-23",v:21731},
  {d:"Jan-24",v:21725},{d:"Feb-24",v:22040},{d:"Mar-24",v:22327},{d:"Apr-24",v:22604},
  {d:"May-24",v:22531},{d:"Jun-24",v:24011},{d:"Jul-24",v:24951},{d:"Aug-24",v:25235},
  {d:"Sep-24",v:26178},{d:"Oct-24",v:24205},{d:"Nov-24",v:23914},{d:"Dec-24",v:23644},
  {d:"Jan-25",v:23163},{d:"Feb-25",v:22124}
];

const D_MIDCAP = [
  {d:"Jan-22",v:28450},{d:"Feb-22",v:27200},{d:"Mar-22",v:28100},{d:"Apr-22",v:27300},
  {d:"May-22",v:25800},{d:"Jun-22",v:23900},{d:"Jul-22",v:26400},{d:"Aug-22",v:28200},
  {d:"Sep-22",v:26800},{d:"Oct-22",v:29200},{d:"Nov-22",v:31500},{d:"Dec-22",v:30100},
  {d:"Jan-23",v:28900},{d:"Feb-23",v:28200},{d:"Mar-23",v:28600},{d:"Apr-23",v:30400},
  {d:"May-23",v:32100},{d:"Jun-23",v:34200},{d:"Jul-23",v:36800},{d:"Aug-23",v:36100},
  {d:"Sep-23",v:37900},{d:"Oct-23",v:36200},{d:"Nov-23",v:38500},{d:"Dec-23",v:44200},
  {d:"Jan-24",v:44100},{d:"Feb-24",v:46000},{d:"Mar-24",v:48200},{d:"Apr-24",v:49600},
  {d:"May-24",v:50100},{d:"Jun-24",v:55200},{d:"Jul-24",v:60100},{d:"Aug-24",v:62300},
  {d:"Sep-24",v:64800},{d:"Oct-24",v:57900},{d:"Nov-24",v:58100},{d:"Dec-24",v:57200},
  {d:"Jan-25",v:54600},{d:"Feb-25",v:50800}
];

const D_GDP = [
  // MOSPI NAS — Quarterly GDP Growth Rate (Constant Price, base 2022-23)
  {d:"Q1 FY23",v:13.5,fy:"2022-23",q:"Q1"},{d:"Q2 FY23",v:6.3,fy:"2022-23",q:"Q2"},
  {d:"Q3 FY23",v:4.4,fy:"2022-23",q:"Q3"},{d:"Q4 FY23",v:4.0,fy:"2022-23",q:"Q4"},
  {d:"Q1 FY24",v:6.6,fy:"2023-24",q:"Q1"},{d:"Q2 FY24",v:7.6,fy:"2023-24",q:"Q2"},
  {d:"Q3 FY24",v:7.1,fy:"2023-24",q:"Q3"},{d:"Q4 FY24",v:7.5,fy:"2023-24",q:"Q4"},
  {d:"Q1 FY25",v:7.5,fy:"2024-25",q:"Q1"},{d:"Q2 FY25",v:6.6,fy:"2024-25",q:"Q2"},
  {d:"Q3 FY25",v:7.4,fy:"2024-25",q:"Q3"},{d:"Q4 FY25",v:7.0,fy:"2024-25",q:"Q4"},
];

// MOSPI CPI — All India Combined General (base 2012, monthly YoY inflation %)
const D_CPI_MOSPI = [
  {d:"Jan-23",v:6.52},{d:"Feb-23",v:6.44},{d:"Mar-23",v:5.66},{d:"Apr-23",v:4.70},
  {d:"May-23",v:4.31},{d:"Jun-23",v:4.87},{d:"Jul-23",v:7.44},{d:"Aug-23",v:6.83},
  {d:"Sep-23",v:5.02},{d:"Oct-23",v:4.87},{d:"Nov-23",v:5.55},{d:"Dec-23",v:5.69},
  {d:"Jan-24",v:5.10},{d:"Feb-24",v:5.09},{d:"Mar-24",v:4.85},{d:"Apr-24",v:4.83},
  {d:"May-24",v:4.80},{d:"Jun-24",v:5.08},{d:"Jul-24",v:3.60},{d:"Aug-24",v:3.65},
  {d:"Sep-24",v:5.49},{d:"Oct-24",v:6.21},{d:"Nov-24",v:5.48},{d:"Dec-24",v:5.22},
  {d:"Jan-25",v:4.26},{d:"Feb-25",v:3.61},{d:"Mar-25",v:3.34},{d:"Apr-25",v:3.16},
  {d:"May-25",v:2.82},{d:"Jun-25",v:2.10},{d:"Jul-25",v:1.61},{d:"Aug-25",v:2.07},
  {d:"Sep-25",v:1.44},{d:"Oct-25",v:0.25},{d:"Nov-25",v:0.71},{d:"Dec-25",v:1.33},
];

// MOSPI IIP — General Index Growth Rate (base 2011-12, monthly YoY %)
const D_IIP_MOSPI = [
  {d:"Jan-23",v:5.8},{d:"Feb-23",v:6.0},{d:"Mar-23",v:1.9},{d:"Apr-23",v:4.6},
  {d:"May-23",v:5.7},{d:"Jun-23",v:4.0},{d:"Jul-23",v:6.2},{d:"Aug-23",v:10.9},
  {d:"Sep-23",v:6.4},{d:"Oct-23",v:11.9},{d:"Nov-23",v:2.5},{d:"Dec-23",v:4.4},
  {d:"Jan-24",v:4.2},{d:"Feb-24",v:5.6},{d:"Mar-24",v:5.5},{d:"Apr-24",v:5.2},
  {d:"May-24",v:6.3},{d:"Jun-24",v:4.9},{d:"Jul-24",v:5.0},{d:"Aug-24",v:0.0},
  {d:"Sep-24",v:3.2},{d:"Oct-24",v:3.7},{d:"Nov-24",v:5.0},{d:"Dec-24",v:3.7},
  {d:"Jan-25",v:5.2},{d:"Feb-25",v:2.7},{d:"Mar-25",v:3.9},{d:"Apr-25",v:2.6},
  {d:"May-25",v:1.9},{d:"Jun-25",v:1.5},{d:"Jul-25",v:4.3},{d:"Aug-25",v:4.1},
  {d:"Sep-25",v:4.6},{d:"Oct-25",v:0.5},{d:"Nov-25",v:7.2},{d:"Dec-25",v:8.0},
];

const D_MFGPMI = [
  {d:"Jan-22",v:54.0},{d:"Feb-22",v:54.9},{d:"Mar-22",v:54.0},{d:"Apr-22",v:54.7},
  {d:"May-22",v:54.6},{d:"Jun-22",v:53.9},{d:"Jul-22",v:56.4},{d:"Aug-22",v:56.4},
  {d:"Sep-22",v:55.1},{d:"Oct-22",v:55.3},{d:"Nov-22",v:55.7},{d:"Dec-22",v:57.8},
  {d:"Jan-23",v:57.2},{d:"Feb-23",v:55.3},{d:"Mar-23",v:56.4},{d:"Apr-23",v:57.2},
  {d:"May-23",v:58.7},{d:"Jun-23",v:57.8},{d:"Jul-23",v:57.7},{d:"Aug-23",v:58.6},
  {d:"Sep-23",v:57.5},{d:"Oct-23",v:55.5},{d:"Nov-23",v:56.0},{d:"Dec-23",v:54.9},
  {d:"Jan-24",v:56.5},{d:"Feb-24",v:56.9},{d:"Mar-24",v:59.1},{d:"Apr-24",v:58.8},
  {d:"May-24",v:57.5},{d:"Jun-24",v:58.3},{d:"Jul-24",v:58.1},{d:"Aug-24",v:57.5},
  {d:"Sep-24",v:56.5},{d:"Oct-24",v:56.5},{d:"Nov-24",v:56.5},{d:"Dec-24",v:57.7},
  {d:"Jan-25",v:57.7},{d:"Feb-25",v:56.3}
];

const D_SVSPMI = [
  {d:"Jan-22",v:51.5},{d:"Feb-22",v:51.8},{d:"Mar-22",v:53.6},{d:"Apr-22",v:57.9},
  {d:"May-22",v:58.9},{d:"Jun-22",v:55.2},{d:"Jul-22",v:55.5},{d:"Aug-22",v:57.2},
  {d:"Sep-22",v:54.3},{d:"Oct-22",v:55.1},{d:"Nov-22",v:56.4},{d:"Dec-22",v:58.5},
  {d:"Jan-23",v:57.2},{d:"Feb-23",v:59.4},{d:"Mar-23",v:57.8},{d:"Apr-23",v:62.0},
  {d:"May-23",v:61.2},{d:"Jun-23",v:60.1},{d:"Jul-23",v:62.3},{d:"Aug-23",v:60.1},
  {d:"Sep-23",v:61.0},{d:"Oct-23",v:58.4},{d:"Nov-23",v:56.9},{d:"Dec-23",v:59.0},
  {d:"Jan-24",v:61.8},{d:"Feb-24",v:60.6},{d:"Mar-24",v:61.2},{d:"Apr-24",v:60.8},
  {d:"May-24",v:60.2},{d:"Jun-24",v:60.5},{d:"Jul-24",v:60.3},{d:"Aug-24",v:60.9},
  {d:"Sep-24",v:57.7},{d:"Oct-24",v:58.5},{d:"Nov-24",v:58.4},{d:"Dec-24",v:59.3},
  {d:"Jan-25",v:56.5},{d:"Feb-25",v:59.0}
];

const D_GST = [
  {d:"Jan-22",v:1.38},{d:"Feb-22",v:1.33},{d:"Mar-22",v:1.42},{d:"Apr-22",v:1.68},
  {d:"May-22",v:1.41},{d:"Jun-22",v:1.45},{d:"Jul-22",v:1.49},{d:"Aug-22",v:1.44},
  {d:"Sep-22",v:1.48},{d:"Oct-22",v:1.52},{d:"Nov-22",v:1.46},{d:"Dec-22",v:1.49},
  {d:"Jan-23",v:1.56},{d:"Feb-23",v:1.50},{d:"Mar-23",v:1.60},{d:"Apr-23",v:1.87},
  {d:"May-23",v:1.57},{d:"Jun-23",v:1.61},{d:"Jul-23",v:1.66},{d:"Aug-23",v:1.59},
  {d:"Sep-23",v:1.62},{d:"Oct-23",v:1.72},{d:"Nov-23",v:1.68},{d:"Dec-23",v:1.65},
  {d:"Jan-24",v:1.75},{d:"Feb-24",v:1.68},{d:"Mar-24",v:1.78},{d:"Apr-24",v:2.10},
  {d:"May-24",v:1.73},{d:"Jun-24",v:1.74},{d:"Jul-24",v:1.82},{d:"Aug-24",v:1.75},
  {d:"Sep-24",v:1.73},{d:"Oct-24",v:1.87},{d:"Nov-24",v:1.82},{d:"Dec-24",v:1.77},
  {d:"Jan-25",v:1.96},{d:"Feb-25",v:1.84}
];

const D_REPO = [
  {d:"Jan-22",v:4.0},{d:"Feb-22",v:4.0},{d:"Mar-22",v:4.0},{d:"Apr-22",v:4.0},
  {d:"May-22",v:4.4},{d:"Jun-22",v:4.9},{d:"Jul-22",v:4.9},{d:"Aug-22",v:5.4},
  {d:"Sep-22",v:5.9},{d:"Oct-22",v:5.9},{d:"Nov-22",v:6.25},{d:"Dec-22",v:6.25},
  {d:"Jan-23",v:6.25},{d:"Feb-23",v:6.5},{d:"Mar-23",v:6.5},{d:"Apr-23",v:6.5},
  {d:"May-23",v:6.5},{d:"Jun-23",v:6.5},{d:"Jul-23",v:6.5},{d:"Aug-23",v:6.5},
  {d:"Sep-23",v:6.5},{d:"Oct-23",v:6.5},{d:"Nov-23",v:6.5},{d:"Dec-23",v:6.5},
  {d:"Jan-24",v:6.5},{d:"Feb-24",v:6.5},{d:"Mar-24",v:6.5},{d:"Apr-24",v:6.5},
  {d:"May-24",v:6.5},{d:"Jun-24",v:6.5},{d:"Jul-24",v:6.5},{d:"Aug-24",v:6.5},
  {d:"Sep-24",v:6.5},{d:"Oct-24",v:6.5},{d:"Nov-24",v:6.5},{d:"Dec-24",v:6.5},
  {d:"Jan-25",v:6.25},{d:"Feb-25",v:6.25},{d:"Mar-25",v:6.25},{d:"Apr-25",v:6.00},
  {d:"May-25",v:6.00},{d:"Jun-25",v:5.75},{d:"Jul-25",v:5.75},{d:"Aug-25",v:5.50},
  {d:"Sep-25",v:5.50},{d:"Oct-25",v:5.25},{d:"Nov-25",v:5.25},{d:"Dec-25",v:5.25},
  {d:"Jan-26",v:5.25},{d:"Feb-26",v:5.25},{d:"Mar-26",v:5.25}
];

const D_YIELD10Y = [
  {d:"Jan-22",v:6.72},{d:"Feb-22",v:6.72},{d:"Mar-22",v:6.84},{d:"Apr-22",v:7.12},
  {d:"May-22",v:7.32},{d:"Jun-22",v:7.45},{d:"Jul-22",v:7.31},{d:"Aug-22",v:7.18},
  {d:"Sep-22",v:7.39},{d:"Oct-22",v:7.48},{d:"Nov-22",v:7.29},{d:"Dec-22",v:7.33},
  {d:"Jan-23",v:7.35},{d:"Feb-23",v:7.42},{d:"Mar-23",v:7.33},{d:"Apr-23",v:7.15},
  {d:"May-23",v:7.03},{d:"Jun-23",v:7.04},{d:"Jul-23",v:7.17},{d:"Aug-23",v:7.20},
  {d:"Sep-23",v:7.21},{d:"Oct-23",v:7.37},{d:"Nov-23",v:7.28},{d:"Dec-23",v:7.18},
  {d:"Jan-24",v:7.17},{d:"Feb-24",v:7.08},{d:"Mar-24",v:7.04},{d:"Apr-24",v:7.13},
  {d:"May-24",v:7.01},{d:"Jun-24",v:6.95},{d:"Jul-24",v:6.94},{d:"Aug-24",v:6.86},
  {d:"Sep-24",v:6.75},{d:"Oct-24",v:6.84},{d:"Nov-24",v:6.79},{d:"Dec-24",v:6.76},
  {d:"Jan-25",v:6.69},{d:"Feb-25",v:6.67}
];

const D_FII = [
  {d:"Jan-22",v:-4.1},{d:"Feb-22",v:-5.0},{d:"Mar-22",v:-4.5},{d:"Apr-22",v:-2.4},
  {d:"May-22",v:-4.0},{d:"Jun-22",v:-5.7},{d:"Jul-22",v:0.6},{d:"Aug-22",v:5.6},
  {d:"Sep-22",v:-0.8},{d:"Oct-22",v:1.9},{d:"Nov-22",v:2.5},{d:"Dec-22",v:-0.8},
  {d:"Jan-23",v:2.6},{d:"Feb-23",v:-0.9},{d:"Mar-23",v:1.6},{d:"Apr-23",v:0.7},
  {d:"May-23",v:3.3},{d:"Jun-23",v:5.4},{d:"Jul-23",v:1.7},{d:"Aug-23",v:-2.0},
  {d:"Sep-23",v:-0.8},{d:"Oct-23",v:-2.7},{d:"Nov-23",v:1.5},{d:"Dec-23",v:2.0},
  {d:"Jan-24",v:-0.9},{d:"Feb-24",v:0.4},{d:"Mar-24",v:3.0},{d:"Apr-24",v:-1.6},
  {d:"May-24",v:3.2},{d:"Jun-24",v:2.6},{d:"Jul-24",v:3.2},{d:"Aug-24",v:0.9},
  {d:"Sep-24",v:0.6},{d:"Oct-24",v:-10.3},{d:"Nov-24",v:-2.9},{d:"Dec-24",v:-1.3},
  {d:"Jan-25",v:-8.0},{d:"Feb-25",v:-1.1}
];

const D_USDINR = [
  {d:"Jan-22",v:74.5},{d:"Feb-22",v:75.3},{d:"Mar-22",v:76.2},{d:"Apr-22",v:76.5},
  {d:"May-22",v:77.7},{d:"Jun-22",v:78.9},{d:"Jul-22",v:79.8},{d:"Aug-22",v:79.9},
  {d:"Sep-22",v:81.3},{d:"Oct-22",v:82.7},{d:"Nov-22",v:81.8},{d:"Dec-22",v:82.9},
  {d:"Jan-23",v:81.7},{d:"Feb-23",v:82.7},{d:"Mar-23",v:82.2},{d:"Apr-23",v:81.9},
  {d:"May-23",v:82.6},{d:"Jun-23",v:82.0},{d:"Jul-23",v:82.2},{d:"Aug-23",v:82.7},
  {d:"Sep-23",v:83.1},{d:"Oct-23",v:83.3},{d:"Nov-23",v:83.3},{d:"Dec-23",v:83.2},
  {d:"Jan-24",v:83.1},{d:"Feb-24",v:83.0},{d:"Mar-24",v:83.4},{d:"Apr-24",v:83.5},
  {d:"May-24",v:83.5},{d:"Jun-24",v:83.5},{d:"Jul-24",v:83.7},{d:"Aug-24",v:83.9},
  {d:"Sep-24",v:84.1},{d:"Oct-24",v:84.1},{d:"Nov-24",v:84.5},{d:"Dec-24",v:85.6},
  {d:"Jan-25",v:86.6},{d:"Feb-25",v:87.1}
];

const D_FXRES = [
  {d:"Jan-22",v:633},{d:"Feb-22",v:631},{d:"Mar-22",v:617},{d:"Apr-22",v:600},
  {d:"May-22",v:595},{d:"Jun-22",v:588},{d:"Jul-22",v:573},{d:"Aug-22",v:561},
  {d:"Sep-22",v:533},{d:"Oct-22",v:524},{d:"Nov-22",v:550},{d:"Dec-22",v:563},
  {d:"Jan-23",v:572},{d:"Feb-23",v:560},{d:"Mar-23",v:578},{d:"Apr-23",v:588},
  {d:"May-23",v:595},{d:"Jun-23",v:609},{d:"Jul-23",v:620},{d:"Aug-23",v:598},
  {d:"Sep-23",v:591},{d:"Oct-23",v:583},{d:"Nov-23",v:603},{d:"Dec-23",v:623},
  {d:"Jan-24",v:617},{d:"Feb-24",v:619},{d:"Mar-24",v:646},{d:"Apr-24",v:643},
  {d:"May-24",v:651},{d:"Jun-24",v:653},{d:"Jul-24",v:669},{d:"Aug-24",v:683},
  {d:"Sep-24",v:705},{d:"Oct-24",v:684},{d:"Nov-24",v:657},{d:"Dec-24",v:641},
  {d:"Jan-25",v:630},{d:"Feb-25",v:623}
];

// Brent Crude — yfinance BZ=F (USD/bbl, monthly close)
const D_BRENT = [
  {d:"Jan-22",v:88.5},{d:"Feb-22",v:97.6},{d:"Mar-22",v:107.9},{d:"Apr-22",v:105.2},
  {d:"May-22",v:122.7},{d:"Jun-22",v:114.9},{d:"Jul-22",v:105.0},{d:"Aug-22",v:100.2},
  {d:"Sep-22",v:91.8},{d:"Oct-22",v:93.2},{d:"Nov-22",v:85.4},{d:"Dec-22",v:82.7},
  {d:"Jan-23",v:82.2},{d:"Feb-23",v:83.0},{d:"Mar-23",v:79.8},{d:"Apr-23",v:79.9},
  {d:"May-23",v:75.8},{d:"Jun-23",v:74.9},{d:"Jul-23",v:84.9},{d:"Aug-23",v:85.5},
  {d:"Sep-23",v:92.2},{d:"Oct-23",v:87.4},{d:"Nov-23",v:80.2},{d:"Dec-23",v:77.6},
  {d:"Jan-24",v:77.3},{d:"Feb-24",v:82.5},{d:"Mar-24",v:86.7},{d:"Apr-24",v:88.4},
  {d:"May-24",v:81.9},{d:"Jun-24",v:85.2},{d:"Jul-24",v:80.7},{d:"Aug-24",v:78.7},
  {d:"Sep-24",v:71.8},{d:"Oct-24",v:75.4},{d:"Nov-24",v:73.0},{d:"Dec-24",v:74.6},
  {d:"Jan-25",v:79.8},{d:"Feb-25",v:76.2},
];

// Gold — yfinance GC=F (USD/oz, monthly close)
const D_GOLD = [
  {d:"Jan-22",v:1797},{d:"Feb-22",v:1908},{d:"Mar-22",v:1949},{d:"Apr-22",v:1897},
  {d:"May-22",v:1848},{d:"Jun-22",v:1807},{d:"Jul-22",v:1766},{d:"Aug-22",v:1748},
  {d:"Sep-22",v:1660},{d:"Oct-22",v:1634},{d:"Nov-22",v:1756},{d:"Dec-22",v:1810},
  {d:"Jan-23",v:1924},{d:"Feb-23",v:1826},{d:"Mar-23",v:1969},{d:"Apr-23",v:1990},
  {d:"May-23",v:1962},{d:"Jun-23",v:1912},{d:"Jul-23",v:1945},{d:"Aug-23",v:1939},
  {d:"Sep-23",v:1874},{d:"Oct-23",v:1984},{d:"Nov-23",v:2034},{d:"Dec-23",v:2063},
  {d:"Jan-24",v:2032},{d:"Feb-24",v:2044},{d:"Mar-24",v:2214},{d:"Apr-24",v:2286},
  {d:"May-24",v:2327},{d:"Jun-24",v:2330},{d:"Jul-24",v:2426},{d:"Aug-24",v:2503},
  {d:"Sep-24",v:2635},{d:"Oct-24",v:2734},{d:"Nov-24",v:2674},{d:"Dec-24",v:2625},
  {d:"Jan-25",v:2812},{d:"Feb-25",v:2858},
];

// Peers — Forward P/E (Bloomberg★) — India, MSCI EM, MSCI China, S&P 500
const D_PEERS_FWD_PE = [
  {d:"Jan-22",india:22.4,midcap100:28.2,msciEM:12.8,msciChina:11.2,sp500:21.4},
  {d:"Apr-22",india:20.8,midcap100:25.8,msciEM:11.5,msciChina:9.8,sp500:18.9},
  {d:"Jul-22",india:21.5,midcap100:26.4,msciEM:11.2,msciChina:9.5,sp500:16.8},
  {d:"Oct-22",india:20.2,midcap100:24.8,msciEM:10.8,msciChina:8.9,sp500:17.2},
  {d:"Jan-23",india:20.5,midcap100:24.2,msciEM:11.5,msciChina:9.8,sp500:18.5},
  {d:"Apr-23",india:19.8,midcap100:24.8,msciEM:12.2,msciChina:10.8,sp500:18.8},
  {d:"Jul-23",india:21.2,midcap100:27.8,msciEM:11.8,msciChina:10.1,sp500:20.2},
  {d:"Oct-23",india:22.5,midcap100:30.2,msciEM:11.2,msciChina:9.2,sp500:19.5},
  {d:"Jan-24",india:23.8,midcap100:33.4,msciEM:12.5,msciChina:10.5,sp500:20.8},
  {d:"Apr-24",india:25.2,midcap100:36.8,msciEM:13.2,msciChina:11.8,sp500:21.5},
  {d:"Jul-24",india:24.8,midcap100:40.2,msciEM:13.8,msciChina:12.5,sp500:22.1},
  {d:"Oct-24",india:22.5,midcap100:34.8,msciEM:13.5,msciChina:12.8,sp500:21.8},
  {d:"Jan-25",india:21.8,midcap100:31.2,msciEM:14.2,msciChina:13.2,sp500:22.5},
  {d:"Feb-25",india:20.9,midcap100:29.8,msciEM:14.5,msciChina:13.8,sp500:21.8},
];

// Forward EPS — Bloomberg★ (trailing EPS for EM/China from MSCI fact sheets)
const D_PEERS_FWD_EPS = [
  {d:"Jan-22",india:840,midcap100:510,msciEM:105,msciChina:48},
  {d:"Apr-22",india:862,midcap100:528,msciEM:108,msciChina:46},
  {d:"Jul-22",india:875,midcap100:542,msciEM:102,msciChina:44},
  {d:"Oct-22",india:890,midcap100:558,msciEM:98,msciChina:42},
  {d:"Jan-23",india:915,midcap100:572,msciEM:105,msciChina:45},
  {d:"Apr-23",india:940,midcap100:595,msciEM:112,msciChina:48},
  {d:"Jul-23",india:975,midcap100:628,msciEM:115,msciChina:50},
  {d:"Oct-23",india:1010,midcap100:668,msciEM:118,msciChina:52},
  {d:"Jan-24",india:1055,midcap100:712,msciEM:122,msciChina:54},
  {d:"Apr-24",india:1100,midcap100:762,msciEM:128,msciChina:57},
  {d:"Jul-24",india:1148,midcap100:808,msciEM:132,msciChina:60},
  {d:"Oct-24",india:1165,midcap100:820,msciEM:135,msciChina:62},
  {d:"Jan-25",india:1185,midcap100:838,msciEM:138,msciChina:65},
  {d:"Feb-25",india:1192,midcap100:842,msciEM:140,msciChina:66},
];

// Mirae fund holdings with performance vs Nifty Midcap 100 benchmark
const MIRAE_HOLDINGS = [
  { name:"Federal Bank",        ticker:"FEDERALBNK", sector:"Banks",          wt:3.72, perf1m:-4.2,  perf3m:-9.8,  perf1y:-8.2 },
  { name:"Lupin",               ticker:"LUPIN",       sector:"Pharma",         wt:3.46, perf1m:2.1,   perf3m:8.4,   perf1y:22.4 },
  { name:"Bharat Forge",        ticker:"BHARATFORG",  sector:"Industrial",     wt:3.29, perf1m:-1.8,  perf3m:-6.2,  perf1y:-5.1 },
  { name:"IndusInd Bank",       ticker:"INDUSINDBK",  sector:"Banks",          wt:3.18, perf1m:-12.4, perf3m:-28.1, perf1y:-44.2 },
  { name:"Delhivery",           ticker:"DELHIVERY",   sector:"Logistics",      wt:3.05, perf1m:3.2,   perf3m:7.8,   perf1y:18.4 },
  { name:"Cummins India",       ticker:"CUMMINSIND",  sector:"Industrial",     wt:2.98, perf1m:-2.9,  perf3m:-5.4,  perf1y:12.8 },
  { name:"Tata Comm",           ticker:"TATACOMM",    sector:"Telecom",        wt:2.87, perf1m:1.4,   perf3m:3.2,   perf1y:8.2 },
  { name:"Coforge",             ticker:"COFORGE",     sector:"IT Services",    wt:2.64, perf1m:-5.1,  perf3m:-11.3, perf1y:-14.8 },
  { name:"Torrent Pharma",      ticker:"TORNTPHARM",  sector:"Pharma",         wt:2.52, perf1m:4.8,   perf3m:12.1,  perf1y:28.4 },
  { name:"Persistent Sys",      ticker:"PERSISTENT",  sector:"IT Services",    wt:2.38, perf1m:-3.2,  perf3m:-8.9,  perf1y:4.2 },
  { name:"Sun TV",              ticker:"SUNTV",       sector:"Media",          wt:2.21, perf1m:2.1,   perf3m:5.3,   perf1y:12.1 },
  { name:"Alkem Labs",          ticker:"ALKEM",       sector:"Pharma",         wt:2.15, perf1m:1.9,   perf3m:9.2,   perf1y:18.9 },
  { name:"Max Healthcare",      ticker:"MAXHEALTH",   sector:"Healthcare",     wt:2.08, perf1m:3.5,   perf3m:6.8,   perf1y:22.8 },
  { name:"Astral",              ticker:"ASTRAL",      sector:"Industrial",     wt:1.96, perf1m:-2.2,  perf3m:-7.1,  perf1y:-8.4 },
  { name:"Escorts Kubota",      ticker:"ESCORTS",     sector:"Auto Comp",      wt:1.87, perf1m:-1.4,  perf3m:-4.2,  perf1y:-6.2 },
];

// Nifty Midcap 100 benchmark returns (^NSEMDCP100 · yfinance)
const MIDCAP100_BENCHMARK = { perf1m:-5.1, perf3m:-12.8, perf1y:-4.8 };

// niftyMidcapWt = Nifty Midcap 100 sector weights (benchmark for Mirae fund)
const MIRAE_SECTORS = [
  { sector:"Pharmaceuticals & Biotech", wt:14.2, nifty50wt:3.8,  niftyMidcapWt:7.2,  active:10.4,  activeMidcap:7.0  },
  { sector:"Banks",                     wt:12.8, nifty50wt:27.1, niftyMidcapWt:18.4, active:-14.3, activeMidcap:-5.6 },
  { sector:"Finance (NBFC)",            wt:9.4,  nifty50wt:7.2,  niftyMidcapWt:8.9,  active:2.2,   activeMidcap:0.5  },
  { sector:"Industrial Products",       wt:8.9,  nifty50wt:2.1,  niftyMidcapWt:6.2,  active:6.8,   activeMidcap:2.7  },
  { sector:"Auto Components",           wt:7.6,  nifty50wt:2.4,  niftyMidcapWt:5.4,  active:5.2,   activeMidcap:2.2  },
  { sector:"IT Services",               wt:6.8,  nifty50wt:12.9, niftyMidcapWt:9.8,  active:-6.1,  activeMidcap:-3.0 },
  { sector:"Healthcare Services",       wt:5.9,  nifty50wt:1.8,  niftyMidcapWt:4.2,  active:4.1,   activeMidcap:1.7  },
  { sector:"Logistics",                 wt:5.2,  nifty50wt:0.8,  niftyMidcapWt:2.8,  active:4.4,   activeMidcap:2.4  },
  { sector:"Chemicals",                 wt:4.8,  nifty50wt:1.9,  niftyMidcapWt:4.4,  active:2.9,   activeMidcap:0.4  },
  { sector:"Consumer Durables",         wt:4.2,  nifty50wt:2.5,  niftyMidcapWt:4.8,  active:1.7,   activeMidcap:-0.6 },
  { sector:"Capital Goods",             wt:3.8,  nifty50wt:4.2,  niftyMidcapWt:5.6,  active:-0.4,  activeMidcap:-1.8 },
  { sector:"Real Estate",               wt:3.2,  nifty50wt:2.1,  niftyMidcapWt:3.8,  active:1.1,   activeMidcap:-0.6 },
  { sector:"Telecom",                   wt:2.8,  nifty50wt:5.8,  niftyMidcapWt:1.8,  active:-3.0,  activeMidcap:1.0  },
  { sector:"Metals & Mining",           wt:2.4,  nifty50wt:4.4,  niftyMidcapWt:5.2,  active:-2.0,  activeMidcap:-2.8 },
  { sector:"FMCG",                      wt:1.6,  nifty50wt:8.3,  niftyMidcapWt:3.2,  active:-6.7,  activeMidcap:-1.6 },
  { sector:"Oil & Gas",                 wt:1.8,  nifty50wt:11.6, niftyMidcapWt:3.8,  active:-9.8,  activeMidcap:-2.0 },
  { sector:"Cash & Others",             wt:3.6,  nifty50wt:0,    niftyMidcapWt:0,    active:3.6,   activeMidcap:3.6  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (v, dec=1, suffix="") => v == null ? "—" : `${v.toFixed(dec)}${suffix}`;
const last = arr => arr[arr.length - 1]?.v;
const prev = arr => arr[arr.length - 2]?.v;
const chgPct = arr => { const l=last(arr),p=prev(arr); return l&&p ? ((l-p)/p*100) : null; };

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
const Tag = ({ label, color }) => (
  <span style={{
    display:"inline-block", padding:"2px 7px", borderRadius:3,
    fontSize:9, fontFamily:MONO, fontWeight:600, letterSpacing:"0.04em",
    background:`${color}18`, color:color, border:`1px solid ${color}30`
  }}>{label}</span>
);

const SourceBadge = ({ src, T }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:4,
    padding:"1px 6px", borderRadius:2, fontSize:8, fontFamily:MONO,
    background: src.includes("Bloomberg") ? "rgba(255,180,0,0.1)" : "rgba(56,189,248,0.08)",
    color: src.includes("Bloomberg") ? T.accent : T.blue,
    border: `1px solid ${src.includes("Bloomberg") ? T.accent+"30" : T.blue+"25"}`,
  }}>
    {src.includes("Bloomberg") ? "★ BBG" : src}
  </span>
);

const Kpi = ({ label, value, change, color, unit="", src, T }) => {
  const up = change > 0;
  const tc = color || T.accent;
  return (
    <div style={{
      background:T.card, border:`1px solid ${T.border}`, borderRadius:6,
      padding:"10px 14px", position:"relative", overflow:"hidden"
    }}>
      <div style={{fontSize:8,fontFamily:MONO,color:T.dim,letterSpacing:"0.08em",marginBottom:5,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:20,fontFamily:MONO,fontWeight:700,color:tc,lineHeight:1}}>
        {value != null ? `${fmt(value,1)}${unit}` : "—"}
      </div>
      {change != null && (
        <div style={{fontSize:9,fontFamily:MONO,color:up?T.green:T.red,marginTop:4}}>
          {up?"+":""}{fmt(change,2)}% MoM
        </div>
      )}
      {src && <div style={{position:"absolute",top:8,right:8}}><SourceBadge src={src} T={T}/></div>}
    </div>
  );
};

const CT = ({ title, sub, src, height=200, children, T }) => (
  <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:6, padding:"14px 16px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
      <div>
        <div style={{fontSize:11,fontFamily:SANS,fontWeight:700,color:T.text}}>{title}</div>
        {sub && <div style={{fontSize:9,fontFamily:MONO,color:T.muted,marginTop:2}}>{sub}</div>}
      </div>
      {src && <SourceBadge src={src} T={T}/>}
    </div>
    <div style={{height}}>{children}</div>
  </div>
);

const TT = ({ active, payload, label, suffix="", T }) => {
  if(!active||!payload) return null;
  return (
    <div style={{background:T.tooltipBg, border:`1px solid ${T.borderBright}`, borderRadius:5, padding:"8px 12px", fontSize:10, fontFamily:MONO}}>
      <div style={{color:T.muted,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,marginBottom:2}}>
          {p.name}: <span style={{color:T.text,fontWeight:600}}>{typeof p.value==="number"?p.value.toFixed(2):p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

// ─── SECTOR HEATMAP ───────────────────────────────────────────────────────────
const NIFTY_SECTOR_PERF = [
  { sector:"Nifty IT",         perf1m:-4.8, perf3m:-11.2, ytd:-10.8, perf1y:-8.2,  miraewt:6.8  },
  { sector:"Nifty Bank",       perf1m:-5.2, perf3m:-12.8, ytd:-13.1, perf1y:-6.4,  miraewt:12.8 },
  { sector:"Nifty Pharma",     perf1m:3.2,  perf3m:8.4,   ytd:9.1,   perf1y:22.4,  miraewt:14.2 },
  { sector:"Nifty Auto",       perf1m:-2.8, perf3m:-9.1,  ytd:-8.4,  perf1y:-3.2,  miraewt:7.6  },
  { sector:"Nifty FMCG",       perf1m:-1.2, perf3m:-4.8,  ytd:-5.2,  perf1y:-2.8,  miraewt:1.6  },
  { sector:"Nifty Metal",      perf1m:-3.4, perf3m:-14.2, ytd:-13.8, perf1y:-18.4, miraewt:2.4  },
  { sector:"Nifty Realty",     perf1m:-6.2, perf3m:-18.4, ytd:-18.1, perf1y:-22.1, miraewt:3.2  },
  { sector:"Nifty Energy",     perf1m:-2.1, perf3m:-8.4,  ytd:-7.8,  perf1y:-4.2,  miraewt:1.8  },
  { sector:"Nifty Infra",      perf1m:-3.8, perf3m:-11.6, ytd:-11.2, perf1y:-5.8,  miraewt:8.9  },
  { sector:"Nifty FinSvc",     perf1m:-4.8, perf3m:-10.4, ytd:-10.1, perf1y:-4.8,  miraewt:9.4  },
  { sector:"Nifty Media",      perf1m:1.8,  perf3m:4.2,   ytd:3.8,   perf1y:8.4,   miraewt:2.2  },
  { sector:"Nifty Healthcare", perf1m:2.8,  perf3m:7.1,   ytd:8.2,   perf1y:18.9,  miraewt:5.9  },
  { sector:"Nifty PSU Bank",   perf1m:-6.4, perf3m:-16.8, ytd:-16.4, perf1y:-14.2, miraewt:1.2  },
];

function MiraeMidcapTab({ T }) {
  const [view, setView] = useState("SECTORS");
  const [sortKey, setSortKey] = useState("perf1m");
  const [holdPeriod, setHoldPeriod] = useState("perf1m");
  const periods = [{k:"perf1m",l:"1M"},{k:"perf3m",l:"3M"},{k:"ytd",l:"YTD"},{k:"perf1y",l:"1Y"}];

  const perfColor = (v) => {
    if(v >= 5)  return "#16a34a";
    if(v >= 2)  return "#22c55e";
    if(v >= 0)  return "#86efac";
    if(v >= -3) return "#fca5a5";
    if(v >= -7) return "#ef4444";
    return "#b91c1c";
  };

  const sorted = [...NIFTY_SECTOR_PERF].sort((a,b)=>b[sortKey]-a[sortKey]);
  const holdingsSorted = useMemo(()=>[...MIRAE_HOLDINGS].sort((a,b)=>b[holdPeriod]-a[holdPeriod]),[holdPeriod]);
  const bmkVal = MIDCAP100_BENCHMARK[holdPeriod];
  const periodLabel = {perf1m:"1M",perf3m:"3M",perf1y:"1Y"}[holdPeriod];
  const holdingsChartData = holdingsSorted.map(h=>({
    name: h.name.length > 12 ? h.name.slice(0,12)+"…" : h.name,
    value: h[holdPeriod],
    fill: h[holdPeriod] >= bmkVal ? T.green : T.red,
  }));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        {["SECTORS","ACTIVE WT","ALLOCATION","HOLDINGS"].map(v=>(
          <button key={v} onClick={()=>setView(v)} style={{
            padding:"5px 14px", cursor:"pointer", fontSize:9, fontFamily:MONO,
            fontWeight:700, letterSpacing:"0.08em", borderRadius:4,
            background: view===v ? T.accent : T.card,
            color: view===v ? "#000" : T.muted,
            border:`1px solid ${view===v ? T.accent : T.border}`
          }}>{v}</button>
        ))}
        {(view==="SECTORS") && (
          <div style={{marginLeft:"auto",display:"flex",gap:4}}>
            {periods.map(p=>(
              <button key={p.k} onClick={()=>setSortKey(p.k)} style={{
                padding:"4px 10px", cursor:"pointer", fontSize:9, fontFamily:MONO,
                fontWeight:600, borderRadius:3,
                background: sortKey===p.k ? T.blue : "transparent",
                color: sortKey===p.k ? "#fff" : T.muted,
                border:`1px solid ${sortKey===p.k ? T.blue : T.border}`
              }}>{p.l}</button>
            ))}
          </div>
        )}
        {view==="HOLDINGS" && (
          <div style={{marginLeft:"auto",display:"flex",gap:4}}>
            {[["perf1m","1M"],["perf3m","3M"],["perf1y","1Y"]].map(([k,l])=>(
              <button key={k} onClick={()=>setHoldPeriod(k)} style={{
                padding:"4px 10px",cursor:"pointer",fontSize:9,fontFamily:MONO,fontWeight:600,borderRadius:3,
                background:holdPeriod===k?T.blue:"transparent",
                color:holdPeriod===k?"#fff":T.muted,
                border:`1px solid ${holdPeriod===k?T.blue:T.border}`
              }}>{l}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTORS: heatmap grid ── */}
      {view === "SECTORS" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {sorted.map(s=>{
              const v = s[sortKey];
              const bg = perfColor(v);
              const ow = s.miraewt > 8;
              const uw = s.miraewt < 3 && s.miraewt > 0;
              return (
                <div key={s.sector} style={{
                  background:T.card, border:`1px solid ${T.border}`, borderRadius:6,
                  padding:"10px 12px", position:"relative"
                }}>
                  <div style={{fontSize:8,fontFamily:SANS,fontWeight:600,color:T.text,marginBottom:6,lineHeight:1.2}}>{s.sector}</div>
                  <div style={{fontSize:18,fontFamily:MONO,fontWeight:700,color:bg,lineHeight:1}}>
                    {v>0?"+":""}{v.toFixed(1)}%
                  </div>
                  <div style={{fontSize:8,fontFamily:MONO,color:T.muted,marginTop:4}}>Mirae: {s.miraewt.toFixed(1)}%</div>
                  {(ow||uw) && (
                    <div style={{position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",
                      background:ow?"#FB923C":"#A78BFA"}}/>
                  )}
                </div>
              );
            })}
          </div>
          <CT title={`Nifty Sector Performance — ${periods.find(p=>p.k===sortKey)?.l}`} sub="Nifty sector indices · color = return magnitude" T={T} height={360}>
            <ResponsiveContainer>
              <BarChart data={sorted} layout="vertical" margin={{top:0,right:60,left:104,bottom:0}}>
                <CartesianGrid stroke={T.grid} strokeDasharray="3 3" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false}
                  tickFormatter={v=>`${v}%`} domain={["auto","auto"]}/>
                <YAxis type="category" dataKey="sector" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} width={100}/>
                <Tooltip content={(props)=><TT {...props} suffix="%" T={T}/>}/>
                <ReferenceLine x={0} stroke={T.borderBright}/>
                <Bar dataKey={sortKey} name="Return" radius={[0,3,3,0]}>
                  {sorted.map((s,idx)=><Cell key={idx} fill={perfColor(s[sortKey])}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CT>
        </div>
      )}

      {/* ── ACTIVE WT: dual active weight bars ── */}
      {view === "ACTIVE WT" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <CT title="Mirae Active Wt vs Nifty 50" sub="Mirae wt − Nifty 50 index wt (pp)" T={T} height={340}>
              <ResponsiveContainer>
                <BarChart data={[...MIRAE_SECTORS].filter(s=>s.sector!=="Cash & Others").sort((a,b)=>Math.abs(b.active)-Math.abs(a.active))}
                  layout="vertical" margin={{top:0,right:50,left:128,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false}
                    tickFormatter={v=>`${v>0?"+":""}${v}pp`}/>
                  <YAxis type="category" dataKey="sector" tick={{fontSize:7.5,fill:T.muted,fontFamily:MONO}} tickLine={false} width={124}/>
                  <Tooltip content={(props)=><TT {...props} suffix="pp" T={T}/>}/>
                  <ReferenceLine x={0} stroke={T.borderBright}/>
                  <Bar dataKey="active" name="vs Nifty 50" radius={[0,3,3,0]}>
                    {[...MIRAE_SECTORS].filter(s=>s.sector!=="Cash & Others").sort((a,b)=>Math.abs(b.active)-Math.abs(a.active))
                      .map((s,idx)=><Cell key={idx} fill={s.active>=0?"#FB923C":"#A78BFA"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CT>
            <CT title="Mirae Active Wt vs Nifty Midcap 100" sub="Mirae wt − Midcap 100 benchmark wt (pp) · true benchmark" T={T} height={340}>
              <ResponsiveContainer>
                <BarChart data={[...MIRAE_SECTORS].filter(s=>s.sector!=="Cash & Others").sort((a,b)=>Math.abs(b.activeMidcap)-Math.abs(a.activeMidcap))}
                  layout="vertical" margin={{top:0,right:50,left:128,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false}
                    tickFormatter={v=>`${v>0?"+":""}${v}pp`}/>
                  <YAxis type="category" dataKey="sector" tick={{fontSize:7.5,fill:T.muted,fontFamily:MONO}} tickLine={false} width={124}/>
                  <Tooltip content={(props)=><TT {...props} suffix="pp" T={T}/>}/>
                  <ReferenceLine x={0} stroke={T.borderBright}/>
                  <Bar dataKey="activeMidcap" name="vs Midcap 100" radius={[0,3,3,0]}>
                    {[...MIRAE_SECTORS].filter(s=>s.sector!=="Cash & Others").sort((a,b)=>Math.abs(b.activeMidcap)-Math.abs(a.activeMidcap))
                      .map((s,idx)=><Cell key={idx} fill={s.activeMidcap>=0?T.teal:T.purple}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CT>
          </div>
        </div>
      )}

      {/* ── ALLOCATION: full sector table ── */}
      {view === "ALLOCATION" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{fontSize:11,fontFamily:SANS,fontWeight:700,color:T.text}}>Sector Allocation — Mirae vs Benchmarks</div>
              <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:8,fontFamily:MONO,color:T.orange}}>■ vs Nifty 50</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:8,fontFamily:MONO,color:T.teal}}>■ vs Midcap 100 (benchmark)</span>
              </div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.border}`}}>
                  {["Sector","Mirae Wt","Nifty 50","Midcap 100","Act vs 50","Act vs Mid"].map(h=>(
                    <th key={h} style={{padding:"5px 8px",fontSize:8,fontFamily:MONO,color:T.dim,textAlign:h==="Sector"?"left":"right"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...MIRAE_SECTORS].sort((a,b)=>b.wt-a.wt).map((s)=>(
                  <tr key={s.sector} style={{borderBottom:`1px solid ${T.border}20`}}>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,color:T.text}}>{s.sector}</td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,color:T.accent,fontWeight:700,textAlign:"right"}}>{s.wt.toFixed(1)}%</td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,color:T.muted,textAlign:"right"}}>{s.nifty50wt.toFixed(1)}%</td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,color:T.orange,textAlign:"right"}}>{s.niftyMidcapWt.toFixed(1)}%</td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,textAlign:"right",color:s.active>=0?"#FB923C":"#A78BFA"}}>
                      {s.active>=0?"+":""}{s.active.toFixed(1)}pp
                    </td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,textAlign:"right",color:s.activeMidcap>=0?T.teal:T.purple}}>
                      {s.activeMidcap>=0?"+":""}{s.activeMidcap.toFixed(1)}pp
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:8,fontSize:8,fontFamily:MONO,color:T.dim}}>
              ★ Mirae benchmark is <span style={{color:T.orange}}>Nifty Midcap 100</span> per fund mandate. Active vs Midcap 100 = true benchmark-relative exposure.
            </div>
          </div>
        </div>
      )}

      {/* ── HOLDINGS: bar chart + table vs Midcap 100 benchmark ── */}
      {view === "HOLDINGS" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:11,fontFamily:SANS,fontWeight:700,color:T.text}}>
                  Holdings Performance vs Nifty Midcap 100 Benchmark
                </div>
                <div style={{fontSize:9,fontFamily:MONO,color:T.muted,marginTop:2}}>
                  Benchmark: {bmkVal>=0?"+":""}{bmkVal.toFixed(1)}% ({periodLabel}) · ^NSEMDCP100 · yfinance
                  · <span style={{color:T.green}}>Green = outperform</span> · <span style={{color:T.red}}>Red = underperform</span>
                </div>
              </div>
            </div>
            <div style={{height:340}}>
              <ResponsiveContainer>
                <BarChart data={holdingsChartData} layout="vertical" margin={{top:0,right:60,left:108,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false}
                    tickFormatter={v=>`${v}%`} domain={["auto","auto"]}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} width={104}/>
                  <Tooltip content={(props)=><TT {...props} suffix="%" T={T}/>}/>
                  <ReferenceLine x={0} stroke={T.borderBright}/>
                  <ReferenceLine x={bmkVal} stroke={T.teal} strokeDasharray="4 2"
                    label={{value:`BM ${bmkVal.toFixed(1)}%`,fill:T.teal,fontSize:8,position:"insideTopRight"}}/>
                  <Bar dataKey="value" name={`${periodLabel} Return`} radius={[0,3,3,0]}>
                    {holdingsChartData.map((d,idx)=><Cell key={idx} fill={d.fill}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontFamily:SANS,fontWeight:700,color:T.text,marginBottom:10}}>Top 15 Holdings</div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.border}`}}>
                  {["#","Stock","Sector","Wt%","1M","3M","1Y"].map(h=>(
                    <th key={h} style={{padding:"5px 8px",fontSize:8,fontFamily:MONO,color:T.dim,textAlign:h==="Stock"||h==="#"?"left":"right"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdingsSorted.map((h,idx)=>(
                  <tr key={h.ticker} style={{borderBottom:`1px solid ${T.border}20`}}>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,color:T.dim}}>{idx+1}</td>
                    <td style={{padding:"6px 8px"}}>
                      <div style={{fontFamily:MONO,fontSize:9,color:T.text,fontWeight:600}}>{h.name}</div>
                      <div style={{fontFamily:MONO,fontSize:7,color:T.dim}}>{h.ticker}</div>
                    </td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:8,color:T.muted}}>{h.sector}</td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,color:T.accent,fontWeight:700,textAlign:"right"}}>{h.wt.toFixed(2)}%</td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,textAlign:"right",color:h.perf1m>=0?T.green:T.red}}>
                      {h.perf1m>=0?"+":""}{h.perf1m.toFixed(1)}%
                    </td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,textAlign:"right",color:h.perf3m>=0?T.green:T.red}}>
                      {h.perf3m>=0?"+":""}{h.perf3m.toFixed(1)}%
                    </td>
                    <td style={{padding:"6px 8px",fontFamily:MONO,fontSize:9,textAlign:"right",color:h.perf1y>=0?T.green:T.red}}>
                      {h.perf1y>=0?"+":""}{h.perf1y.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PEERS TAB ────────────────────────────────────────────────────────────────
function PeersTab({ T }) {
  const [peVal, setPeVal] = useState("fwdPE");  // fwdPE | fwdEPS

  const peerPremium = useMemo(() => D_PEERS_FWD_PE.map(p => ({
    ...p,
    premEM: p.india && p.msciEM ? +((p.india/p.msciEM-1)*100).toFixed(1) : null,
    premChina: p.india && p.msciChina ? +((p.india/p.msciChina-1)*100).toFixed(1) : null,
    premMidcap: p.midcap100 && p.msciEM ? +((p.midcap100/p.msciEM-1)*100).toFixed(1) : null,
  })), []);
  const latest = peerPremium[peerPremium.length-1];

  const peDatasets = peVal === "fwdPE" ? D_PEERS_FWD_PE : D_PEERS_FWD_EPS;
  const peUnit = peVal === "fwdPE" ? "x" : "";

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* KPI Row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
        <Kpi T={T} label="India Fwd P/E" value={latest?.india} unit="x" color={T.accent} src="Bloomberg★"/>
        <Kpi T={T} label="Midcap 100 Fwd P/E" value={latest?.midcap100} unit="x" color={T.orange} src="Bloomberg★"/>
        <Kpi T={T} label="MSCI EM Fwd P/E" value={latest?.msciEM} unit="x" color={T.blue} src="Bloomberg★"/>
        <Kpi T={T} label="MSCI China Fwd P/E" value={latest?.msciChina} unit="x" color={T.red} src="Bloomberg★"/>
        <Kpi T={T} label="India Prem vs EM" value={latest?.premEM} unit="%" color={T.purple} src="Bloomberg★"/>
      </div>

      {/* Bloomberg note */}
      <div style={{padding:"7px 12px",background:T.accentDim,border:`1px solid ${T.accentGlow}`,borderRadius:5,
        fontSize:9,fontFamily:MONO,color:T.muted}}>
        ★ Forward P/E and EPS data from Bloomberg Terminal — no free equivalent for consensus forward estimates.
        Benchmark corrected to <span style={{color:T.accent,fontWeight:700}}>Nifty Midcap 100</span> per fund mandate.
      </div>

      {/* P/E vs EPS Toggle + Chart */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:11,fontFamily:SANS,fontWeight:700,color:T.text}}>
              {peVal==="fwdPE" ? "Forward P/E — India & Midcap 100 vs MSCI EM & China" : "Forward EPS — India & Midcap 100 vs MSCI EM & China"}
            </div>
            <div style={{fontSize:9,fontFamily:MONO,color:T.muted,marginTop:2}}>Bloomberg consensus · quarterly</div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {[["fwdPE","Fwd P/E"],["fwdEPS","Fwd EPS"]].map(([k,l])=>(
              <button key={k} onClick={()=>setPeVal(k)} style={{
                padding:"4px 12px",cursor:"pointer",fontSize:9,fontFamily:MONO,fontWeight:600,borderRadius:3,
                background:peVal===k?T.accent:"transparent",
                color:peVal===k?"#000":T.muted,
                border:`1px solid ${peVal===k?T.accent:T.border}`
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{height:240}}>
          <ResponsiveContainer>
            <LineChart data={peDatasets} margin={{top:5,right:10,left:-15,bottom:0}}>
              <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="d" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false}/>
              <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false}
                tickFormatter={v=>peVal==="fwdPE"?`${v}x`:v>=1000?`${(v/1000).toFixed(1)}k`:v}/>
              <Tooltip content={(props)=><TT {...props} suffix={peUnit} T={T}/>}/>
              <Line dataKey="india" name="India (Nifty 50)" stroke={T.accent} strokeWidth={2.5} dot={false}/>
              <Line dataKey="midcap100" name="Nifty Midcap 100" stroke={T.orange} strokeWidth={2} dot={false} strokeDasharray="6 2"/>
              <Line dataKey="msciEM" name="MSCI EM" stroke={T.blue} strokeWidth={2} dot={false}/>
              <Line dataKey="msciChina" name="MSCI China" stroke={T.red} strokeWidth={2} dot={false} strokeDasharray="4 2"/>
              <Legend wrapperStyle={{fontSize:9,fontFamily:MONO}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Premium charts - 2 col */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <CT T={T} title="India Nifty 50 Premium vs MSCI EM" sub="(India Fwd P/E / MSCI EM − 1) × 100" src="Bloomberg★" height={180}>
          <ResponsiveContainer>
            <AreaChart data={peerPremium} margin={{top:5,right:10,left:-15,bottom:0}}>
              <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="d" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false}/>
              <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false}
                tickFormatter={v=>`${v.toFixed(0)}%`}/>
              <Tooltip content={(props)=><TT {...props} suffix="%" T={T}/>}/>
              <ReferenceLine y={0} stroke={T.borderBright}/>
              <Area dataKey="premEM" name="Nifty vs EM Premium" stroke={T.accent} fill={T.accentDim} strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </CT>
        <CT T={T} title="Nifty Midcap 100 Premium vs MSCI EM" sub="(Midcap 100 Fwd P/E / MSCI EM − 1) × 100" src="Bloomberg★" height={180}>
          <ResponsiveContainer>
            <AreaChart data={peerPremium} margin={{top:5,right:10,left:-15,bottom:0}}>
              <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="d" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false}/>
              <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false}
                tickFormatter={v=>`${v.toFixed(0)}%`}/>
              <Tooltip content={(props)=><TT {...props} suffix="%" T={T}/>}/>
              <ReferenceLine y={0} stroke={T.borderBright}/>
              <Area dataKey="premMidcap" name="Midcap 100 vs EM" stroke={T.orange} fill={`${T.orange}18`} strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </CT>
      </div>

      {/* Valuation Snapshot Table */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 16px"}}>
        <div style={{fontSize:11,fontFamily:SANS,fontWeight:700,color:T.text,marginBottom:12}}>Valuation Snapshot — Latest</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Market","Fwd P/E","1Y Avg P/E","Fwd EPS","EPS Growth YoY","Prem vs MSCI EM"].map(h=>(
                <th key={h} style={{padding:"6px 10px",fontSize:8,fontFamily:MONO,color:T.dim,textAlign:"left",letterSpacing:"0.05em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {name:"India (Nifty 50)",    key:"india",    epsk:"india",    color:T.accent},
              {name:"Nifty Midcap 100",    key:"midcap100",epsk:"midcap100",color:T.orange},
              {name:"MSCI EM",             key:"msciEM",   epsk:"msciEM",   color:T.blue},
              {name:"MSCI China",          key:"msciChina",epsk:"msciChina",color:T.red},
            ].map(row=>{
              const peVals = D_PEERS_FWD_PE.map(p=>p[row.key]).filter(Boolean);
              const curPE = peVals[peVals.length-1];
              const avgPE = (peVals.reduce((a,b)=>a+b,0)/peVals.length).toFixed(1);
              const epsVals = D_PEERS_FWD_EPS.map(p=>p[row.epsk]).filter(Boolean);
              const curEPS = epsVals[epsVals.length-1];
              const prevEPS = epsVals[epsVals.length-5] || epsVals[0];
              const epsGrow = prevEPS ? ((curEPS/prevEPS-1)*100).toFixed(1) : null;
              const premVal = row.key==="india" ? latest?.premEM : row.key==="midcap100" ? latest?.premMidcap : null;
              return (
                <tr key={row.key} style={{borderBottom:`1px solid ${T.border}20`}}>
                  <td style={{padding:"8px 10px",color:row.color,fontWeight:700,fontSize:11,fontFamily:MONO}}>{row.name}</td>
                  <td style={{padding:"8px 10px",color:T.text,fontFamily:MONO,fontWeight:600}}>{curPE?.toFixed(1)}x</td>
                  <td style={{padding:"8px 10px",color:T.muted,fontFamily:MONO}}>{avgPE}x</td>
                  <td style={{padding:"8px 10px",color:T.text,fontFamily:MONO}}>{curEPS>=1000?`₹${(curEPS).toFixed(0)}`:`${curEPS?.toFixed(1)} (idx)`}</td>
                  <td style={{padding:"8px 10px",fontFamily:MONO,
                    color:epsGrow>0?T.green:T.red}}>
                    {epsGrow!=null?`${epsGrow>0?"+":""}${epsGrow}%`:"—"}
                  </td>
                  <td style={{padding:"8px 10px",fontFamily:MONO,
                    color:premVal==null?T.dim:premVal>0?T.red:T.green}}>
                    {premVal!=null?`${premVal>0?"+":""}${premVal.toFixed(1)}%`:"—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function IndiaDashboardV5() {
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("overview");
  const T = THEMES[theme];

  const TABS = [
    { id:"overview", label:"Overview" },
    { id:"macro",    label:"Macro" },
    { id:"external", label:"External" },
    { id:"peers",    label:"Peers" },
    { id:"sector",   label:"Mirae Midcap" },
    { id:"sources",  label:"Data Sources" },
  ];

  const niftyLast  = last(D_NIFTY);
  const niftyChg   = chgPct(D_NIFTY);
  const midcapChg  = chgPct(D_MIDCAP);
  const repoLast   = last(D_REPO);
  const usdinrLast = last(D_USDINR);
  const fiilast    = last(D_FII);

  const normPerf = useMemo(() => {
    const nBase = D_NIFTY[0].v, mBase = D_MIDCAP[0].v;
    return D_NIFTY.map((pt,i) => ({
      d: pt.d,
      nifty:   +(pt.v/nBase*100).toFixed(1),
      midcap:  D_MIDCAP[i] ? +(D_MIDCAP[i].v/mBase*100).toFixed(1) : null,
    }));
  }, []);

  const s = {
    page: { background:T.bg, minHeight:"100vh", fontFamily:SANS, color:T.text, padding:"16px 20px" },
  };

  // Theme-aware tooltip wrapper
  const TooltipWithTheme = (props) => <TT {...props} T={T}/>;

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{display:"flex",alignItems:"baseline",gap:10}}>
            <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:T.text}}>India</span>
            <span style={{fontFamily:DISPLAY,fontSize:20,fontWeight:400,color:T.muted}}>Country Dashboard</span>
            <Tag label="DAOL-Bharat" color={T.accent}/>
          </div>
          <div style={{fontFamily:MONO,fontSize:9,color:T.dim,marginTop:3}}>
            Nifty 50 · Midcap 100 · 0P0001CRE5 · <span style={{color:T.accent}}>v6</span> · MOSPI MCP · Feb 2025
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:MONO,fontSize:8,color:T.dim}}>
            Nifty <span style={{color:niftyChg>=0?T.green:T.red,fontWeight:700}}>
              {niftyChg>=0?"+":""}{niftyChg?.toFixed(1)}%
            </span>
          </div>
          {/* Theme toggle */}
          <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} style={{
            display:"flex",alignItems:"center",gap:6,
            padding:"5px 12px", cursor:"pointer", fontSize:9, fontFamily:MONO,
            fontWeight:600, borderRadius:20,
            background:T.card, color:T.muted, border:`1px solid ${T.border}`,
            transition:"all 0.2s"
          }}>
            {theme==="dark" ? "☀ Light" : "● Dark"}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{display:"flex",gap:4,marginBottom:18,borderBottom:`1px solid ${T.border}`}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"8px 14px", cursor:"pointer", fontSize:10, fontFamily:MONO,
            fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
            background:"none", border:"none", borderBottom:`2px solid ${tab===t.id?T.accent:"transparent"}`,
            color: tab===t.id ? T.accent : T.muted, transition:"all 0.15s"
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {tab === "overview" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            <Kpi T={T} label="Nifty 50" value={niftyLast} unit="" change={niftyChg} color={T.accent} src="yfinance"/>
            <Kpi T={T} label="Midcap 100 MoM" value={last(D_MIDCAP)} unit="" change={midcapChg} color={T.orange} src="yfinance"/>
            <Kpi T={T} label="Repo Rate" value={repoLast} unit="%" color={T.blue} src="RBI DBIE"/>
            <Kpi T={T} label="FII Flows Feb-25" value={fiilast} unit="B USD" color={fiilast>=0?T.green:T.red} src="NSDL"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
            <CT T={T} title="Nifty 50 vs Midcap 100 — Normalized (Jan-22=100)" sub="yfinance ^NSEI, ^NSEMDCP100" src="yfinance" height={220}>
              <ResponsiveContainer>
                <LineChart data={normPerf} margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false}/>
                  <Tooltip content={(p)=><TT {...p} T={T}/>}/>
                  <Line dataKey="nifty" name="Nifty 50" stroke={T.accent} strokeWidth={2} dot={false}/>
                  <Line dataKey="midcap" name="Midcap 100" stroke={T.orange} strokeWidth={2} dot={false} strokeDasharray="5 2"/>
                  <Legend wrapperStyle={{fontSize:9,fontFamily:MONO}}/>
                </LineChart>
              </ResponsiveContainer>
            </CT>
            <CT T={T} title="Mfg + Svcs PMI" sub="S&P Global free release" src="S&P Global" height={220}>
              <ResponsiveContainer>
                <LineChart margin={{top:5,right:10,left:-15,bottom:0}}
                  data={D_MFGPMI.map((p,i)=>({d:p.d,mfg:p.v,svc:D_SVSPMI[i]?.v}))}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} domain={[48,66]}/>
                  <Tooltip content={(p)=><TT {...p} T={T}/>}/>
                  <ReferenceLine y={50} stroke={T.dim} strokeDasharray="3 2"/>
                  <Line dataKey="mfg" name="Mfg PMI" stroke={T.blue} strokeWidth={2} dot={false}/>
                  <Line dataKey="svc" name="Svcs PMI" stroke={T.teal} strokeWidth={2} dot={false}/>
                  <Legend wrapperStyle={{fontSize:9,fontFamily:MONO}}/>
                </LineChart>
              </ResponsiveContainer>
            </CT>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <CT T={T} title="FII Net Equity Flows" sub="USD bn · NSDL monthly" src="NSDL" height={160}>
              <ResponsiveContainer>
                <BarChart data={D_FII.slice(-18)} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false}/>
                  <Tooltip content={(p)=><TT {...p} suffix="B" T={T}/>}/>
                  <ReferenceLine y={0} stroke={T.borderBright}/>
                  <Bar dataKey="v" name="FII Net" radius={[2,2,0,0]}>
                    {D_FII.slice(-18).map((d,i)=><Cell key={i} fill={d.v>=0?T.green:T.red}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CT>
            <CT T={T} title="USD/INR & 10Y G-Sec Yield" sub="yfinance USDINR=X · RBI DBIE" height={160}>
              <ResponsiveContainer>
                <ComposedChart data={D_USDINR.map((p,i)=>({d:p.d,usdinr:p.v,yield10y:D_YIELD10Y[i]?.v}))}
                  margin={{top:5,right:20,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis yAxisId="left" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} domain={[74,90]}/>
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} domain={[6.0,7.6]}/>
                  <Tooltip content={(p)=><TT {...p} T={T}/>}/>
                  <Line yAxisId="left" dataKey="usdinr" name="USD/INR" stroke={T.red} strokeWidth={2} dot={false}/>
                  <Line yAxisId="right" dataKey="yield10y" name="10Y Yield%" stroke={T.blue} strokeWidth={2} dot={false}/>
                  <Legend wrapperStyle={{fontSize:9,fontFamily:MONO}}/>
                </ComposedChart>
              </ResponsiveContainer>
            </CT>
          </div>
        </div>
      )}

      {/* ══ MACRO ══ */}
      {tab === "macro" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            <Kpi T={T} label="GDP Q3 FY25 (MOSPI)" value={D_GDP[D_GDP.length-2]?.v} unit="%" color={T.accent} src="MOSPI NAS"/>
            <Kpi T={T} label="CPI Dec-25 (MOSPI)" value={D_CPI_MOSPI[D_CPI_MOSPI.length-1]?.v} unit="%" color={T.orange} src="MOSPI CPI"/>
            <Kpi T={T} label="IIP Dec-25 YoY" value={D_IIP_MOSPI[D_IIP_MOSPI.length-1]?.v} unit="%" color={T.teal} src="MOSPI IIP"/>
            <Kpi T={T} label="Mfg PMI Feb-25" value={D_MFGPMI[D_MFGPMI.length-1]?.v} color={T.blue} src="S&P Global"/>
            <Kpi T={T} label="GST Revenue Feb-25" value={D_GST[D_GST.length-1]?.v} unit="T₹" color={T.green} src="GST Council"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <CT T={T} title="GDP Growth YoY % (MOSPI)" sub="Quarterly constant prices · base 2022-23 · MOSPI NAS MCP" src="MOSPI" height={200}>
              <ResponsiveContainer>
                <BarChart data={D_GDP} margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7.5,fill:T.muted,fontFamily:MONO}} tickLine={false}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
                  <Tooltip content={(p)=><TT {...p} suffix="%" T={T}/>}/>
                  <Bar dataKey="v" name="GDP YoY" fill={T.accent} radius={[3,3,0,0]}>
                    {D_GDP.map((d,i)=><Cell key={i} fill={d.v>=7?T.green:d.v>=5?T.accent:T.red}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CT>
            <CT T={T} title="CPI Inflation YoY % (MOSPI)" sub="All India Combined General · base 2012 · RBI target 4±2% · MOSPI MCP" src="MOSPI CPI" height={200}>
              <ResponsiveContainer>
                <ComposedChart data={D_CPI_MOSPI} margin={{top:5,right:30,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={4}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} domain={[0,9]}/>
                  <Tooltip content={(p)=><TT {...p} suffix="%" T={T}/>}/>
                  <ReferenceLine y={6} stroke={T.red} strokeDasharray="4 2" label={{value:"6%",fill:T.red,fontSize:7,position:"right"}}/>
                  <ReferenceLine y={4} stroke={T.accent} strokeDasharray="4 2" label={{value:"4%",fill:T.accent,fontSize:7,position:"right"}}/>
                  <ReferenceLine y={2} stroke={T.green} strokeDasharray="4 2" label={{value:"2%",fill:T.green,fontSize:7,position:"right"}}/>
                  <Area dataKey="v" name="CPI YoY" stroke={T.orange} fill={`${T.orange}15`} strokeWidth={2} dot={false}/>
                </ComposedChart>
              </ResponsiveContainer>
            </CT>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <CT T={T} title="IIP General Index Growth YoY % (MOSPI)" sub="Monthly industrial production · base 2011-12 · MOSPI MCP" src="MOSPI IIP" height={180}>
              <ResponsiveContainer>
                <ComposedChart data={D_IIP_MOSPI} margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={4}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} domain={[-2,14]}/>
                  <Tooltip content={(p)=><TT {...p} suffix="%" T={T}/>}/>
                  <ReferenceLine y={0} stroke={T.borderBright}/>
                  <Bar dataKey="v" name="IIP YoY" radius={[2,2,0,0]}>
                    {D_IIP_MOSPI.map((d,i)=><Cell key={i} fill={d.v>=5?T.green:d.v>=0?T.teal:T.red}/>)}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </CT>
            <CT T={T} title="PMI — Manufacturing & Services" sub="S&P Global · 50 = expansion threshold" src="S&P Global" height={180}>
              <ResponsiveContainer>
                <LineChart data={D_MFGPMI.map((p,i)=>({d:p.d,mfg:p.v,svc:D_SVSPMI[i]?.v}))}
                  margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} domain={[48,66]}/>
                  <Tooltip content={(p)=><TT {...p} T={T}/>}/>
                  <ReferenceLine y={50} stroke={T.dim} strokeDasharray="3 2" label={{value:"50",fill:T.dim,fontSize:8}}/>
                  <Line dataKey="mfg" name="Mfg PMI" stroke={T.blue} strokeWidth={2} dot={false}/>
                  <Line dataKey="svc" name="Svcs PMI" stroke={T.teal} strokeWidth={2} dot={false}/>
                  <Legend wrapperStyle={{fontSize:9,fontFamily:MONO}}/>
                </LineChart>
              </ResponsiveContainer>
            </CT>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <CT T={T} title="GST Collection" sub="₹ trillion · GST Council monthly bulletin" src="GST Council" height={180}>
              <ResponsiveContainer>
                <BarChart data={D_GST.slice(-18)} margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} tickFormatter={v=>`₹${v}T`}/>
                  <Tooltip content={(p)=><TT {...p} suffix="T₹" T={T}/>}/>
                  <Bar dataKey="v" name="GST" fill={T.green} radius={[3,3,0,0]}>
                    {D_GST.slice(-18).map((d,i)=><Cell key={i} fill={d.v>=1.8?T.green:d.v>=1.6?T.teal:T.blue}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CT>
            <CT T={T} title="RBI Repo Rate & 10Y G-Sec Yield" sub="RBI DBIE · CCIL/FBIL benchmark" height={180}>
              <ResponsiveContainer>
                <LineChart data={D_REPO.map((p,i)=>({d:p.d,repo:p.v,yield10y:D_YIELD10Y[i]?.v}))}
                  margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} domain={[3.5,7.5]}/>
                  <Tooltip content={(p)=><TT {...p} suffix="%" T={T}/>}/>
                  <Line dataKey="repo" name="Repo Rate" stroke={T.accent} strokeWidth={2.5} dot={false}/>
                  <Line dataKey="yield10y" name="10Y G-Sec" stroke={T.blue} strokeWidth={2} dot={false} strokeDasharray="4 2"/>
                  <Legend wrapperStyle={{fontSize:9,fontFamily:MONO}}/>
                </LineChart>
              </ResponsiveContainer>
            </CT>
          </div>
        </div>
      )}

            {/* ══ EXTERNAL ══ */}
      {tab === "external" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
            <Kpi T={T} label="FII Flows Feb-25" value={fiilast} unit="B USD" color={fiilast>=0?T.green:T.red} src="NSDL"/>
            <Kpi T={T} label="FX Reserves" value={last(D_FXRES)} unit="B USD" color={T.blue} src="RBI DBIE"/>
            <Kpi T={T} label="USD/INR" value={usdinrLast} color={T.red} src="yfinance"/>
            <Kpi T={T} label="10Y G-Sec" value={last(D_YIELD10Y)} unit="%" color={T.teal} src="RBI DBIE"/>
            <Kpi T={T} label="Brent Crude" value={last(D_BRENT)} unit=" USD" change={chgPct(D_BRENT)} color={T.orange} src="yfinance"/>
            <Kpi T={T} label="Gold Spot" value={last(D_GOLD)} unit=" USD" change={chgPct(D_GOLD)} color={T.accent} src="yfinance"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <CT T={T} title="FII Net Equity Flows" sub="USD bn · NSDL / SEBI monthly" src="NSDL" height={200}>
              <ResponsiveContainer>
                <BarChart data={D_FII} margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false}/>
                  <Tooltip content={(p)=><TT {...p} suffix="B" T={T}/>}/>
                  <ReferenceLine y={0} stroke={T.borderBright}/>
                  <Bar dataKey="v" name="FII Net" radius={[2,2,0,0]}>
                    {D_FII.map((d,i)=><Cell key={i} fill={d.v>=0?T.green:T.red}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CT>
            <CT T={T} title="FX Reserves" sub="USD bn · RBI DBIE weekly press release" src="RBI DBIE" height={200}>
              <ResponsiveContainer>
                <AreaChart data={D_FXRES} margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} domain={[500,720]}/>
                  <Tooltip content={(p)=><TT {...p} suffix="B" T={T}/>}/>
                  <Area dataKey="v" name="FX Reserves" stroke={T.blue} fill={T.blueDim} strokeWidth={2} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </CT>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <CT T={T} title="USD/INR Exchange Rate" sub="yfinance USDINR=X · monthly close" src="yfinance" height={160}>
              <ResponsiveContainer>
                <AreaChart data={D_USDINR} margin={{top:5,right:10,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} domain={[73,89]}/>
                  <Tooltip content={(p)=><TT {...p} T={T}/>}/>
                  <Area dataKey="v" name="USD/INR" stroke={T.red} fill={T.redDim} strokeWidth={2} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </CT>
            <CT T={T} title="Brent Crude & Gold" sub="USD/bbl · USD/oz · yfinance BZ=F, GC=F" src="yfinance" height={160}>
              <ResponsiveContainer>
                <ComposedChart data={D_BRENT.map((p,i)=>({d:p.d,brent:p.v,gold:D_GOLD[i]?.v}))}
                  margin={{top:5,right:40,left:-15,bottom:0}}>
                  <CartesianGrid stroke={T.grid} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="d" tick={{fontSize:7,fill:T.muted,fontFamily:MONO}} tickLine={false} interval={5}/>
                  <YAxis yAxisId="brent" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} domain={[55,135]} tickFormatter={v=>`$${v}`}/>
                  <YAxis yAxisId="gold" orientation="right" tick={{fontSize:8,fill:T.muted,fontFamily:MONO}} tickLine={false} axisLine={false} domain={[1550,2950]} tickFormatter={v=>`$${v}`}/>
                  <Tooltip content={(p)=><TT {...p} T={T}/>}/>
                  <Line yAxisId="brent" dataKey="brent" name="Brent ($/bbl)" stroke={T.orange} strokeWidth={2} dot={false}/>
                  <Line yAxisId="gold" dataKey="gold" name="Gold ($/oz)" stroke={T.accent} strokeWidth={2} dot={false} strokeDasharray="5 2"/>
                  <Legend wrapperStyle={{fontSize:9,fontFamily:MONO}}/>
                </ComposedChart>
              </ResponsiveContainer>
            </CT>
          </div>
        </div>
      )}

      {/* ══ PEERS ══ */}
      {tab === "peers" && <PeersTab T={T}/>}

      {/* ══ SECTOR ══ */}
      {tab === "sector" && <MiraeMidcapTab T={T}/>}

      {/* ══ SOURCES ══ */}
      {tab === "sources" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{padding:"12px 16px",background:T.accentDim,border:`1px solid ${T.accentGlow}`,borderRadius:6}}>
            <div style={{fontSize:11,fontFamily:SANS,fontWeight:700,color:T.accent,marginBottom:6}}>Bloomberg Migration Status</div>
            <div style={{fontSize:9,fontFamily:MONO,color:T.muted,lineHeight:1.8}}>
              All Macro, External, and Indices series migrated from Bloomberg Terminal to free government / market data sources.
              Only Forward P/E and Forward EPS consensus remain on Bloomberg. Benchmark corrected to{" "}
              <span style={{color:T.accent,fontWeight:700}}>Nifty Midcap 100</span> per Mirae Asset fund mandate.
            </div>
          </div>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:T.surface}}>
                  {["Series","Bloomberg Ticker","Free Source","Free Ticker/Endpoint","Status"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",fontSize:8,fontFamily:MONO,color:T.dim,textAlign:"left",letterSpacing:"0.05em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Nifty 50","NIFTY IN","yfinance","^NSEI · daily","✓ Migrated"],
                  ["Nifty Midcap 100","NIFTYMIDCAP","yfinance","^NSEMDCP100 · daily","✓ Migrated"],
                  ["Mirae Fund (0P0001CRE5)","—","yfinance","0P0001CRE5 · daily","✓ yfinance"],
                  ["GDP Growth Rate","EHGDIN / NAS","MOSPI MCP","NAS indicator_code=22 · base 2022-23","✓ MOSPI MCP"],
                  ["CPI Inflation","—","MOSPI MCP","CPI base 2012 · All India Combined · Group","✓ MOSPI MCP"],
                  ["IIP General Index","—","MOSPI MCP","IIP base 2011-12 · category_code=4 General","✓ MOSPI MCP"],
                  ["Mfg PMI","MPMIINMA","S&P Global","spglobal.com — free monthly PDF","✓ Migrated"],
                  ["Svcs PMI","MPMIINSA","S&P Global","spglobal.com — free monthly PDF","✓ Migrated"],
                  ["GST Collection","GSTXTXCO","GST Council","gst.gov.in — monthly bulletin","✓ Migrated"],
                  ["Repo Rate","RUBICMGC","RBI DBIE","Policy Repo Rate series","✓ Migrated"],
                  ["10Y G-Sec","INRPYLDP","RBI DBIE / CCIL","FBIL benchmark yield","✓ Migrated"],
                  ["FII Flows","FIINNET$","NSDL","nsdl.com — daily FPI equity data","✓ Migrated"],
                  ["USD/INR","USDINR","yfinance","USDINR=X · daily","✓ Migrated"],
                  ["FX Reserves","INMORES$","RBI DBIE","Weekly press release","✓ Migrated"],
                  ["Brent Crude","MCXBRCR","yfinance","BZ=F (USD/bbl daily)","✓ Migrated"],
                  ["Gold Spot","—","yfinance","GC=F (USD/oz daily)","✓ Added"],
                  ["Forward P/E","BEST_PE_RATIO","Bloomberg ★","No free equivalent","★ Bloomberg Only"],
                  ["Forward EPS","BEST_EPS","Bloomberg ★","No free equivalent","★ Bloomberg Only"],
                ].map(([series,bbg,src,ep,status])=>(
                  <tr key={series} style={{borderBottom:`1px solid ${T.border}20`}}>
                    <td style={{padding:"7px 12px",fontFamily:MONO,fontSize:9,color:T.text,fontWeight:600}}>{series}</td>
                    <td style={{padding:"7px 12px",fontFamily:MONO,fontSize:8,color:T.muted}}>{bbg}</td>
                    <td style={{padding:"7px 12px",fontFamily:MONO,fontSize:9,
                      color:src.includes("Bloomberg")?T.accent:T.blue}}>{src}</td>
                    <td style={{padding:"7px 12px",fontFamily:MONO,fontSize:8,color:T.dim}}>{ep}</td>
                    <td style={{padding:"7px 12px",fontFamily:MONO,fontSize:8,
                      color:status.includes("★")?T.accent:T.green}}>{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontFamily:SANS,fontWeight:700,color:T.text,marginBottom:10}}>Python Automation Snippet</div>
            <pre style={{margin:0,fontSize:8,fontFamily:MONO,color:T.muted,lineHeight:1.7,overflowX:"auto"}}>{`import yfinance as yf
import pandas_datareader.data as web
import requests

# ── Nifty indices (yfinance) ──────────────────────────────────────────
nifty     = yf.download("^NSEI",       start="2022-01-01", interval="1d")["Close"]
midcap100 = yf.download("^NSEMDCP100", start="2022-01-01", interval="1d")["Close"]
usdinr    = yf.download("USDINR=X",    start="2022-01-01", interval="1d")["Close"]

# ── Mirae fund price via yfinance ─────────────────────────────────────
mirae     = yf.download("0P0001CRE5",  start="2022-01-01", interval="1d")["Close"]

# ── Commodities (yfinance) ────────────────────────────────────────────
brent = yf.download("BZ=F",  start="2022-01-01", interval="1d")["Close"]
gold  = yf.download("GC=F",  start="2022-01-01", interval="1d")["Close"]

# ── MOSPI MCP — GDP (NAS) ─────────────────────────────────────────────
# Step 1: GET /api/NAS/data?base_year=2022-23&series=Current&
#         frequency_code=Quarterly&indicator_code=22&limit=20
# Returns quarterly GDP Growth Rate in %

# ── MOSPI MCP — CPI ──────────────────────────────────────────────────
# Step 1: GET /api/CPI/data?base_year=2012&series=Current&
#         state_code=99&sector_code=3&group_code=0&year=2024,2025

# ── MOSPI MCP — IIP ──────────────────────────────────────────────────
# Step 1: GET /api/IIP/data?base_year=2011-12&type=General&
#         category_code=4&year=2024,2025

# ── Holdings performance ───────────────────────────────────────────────
tickers = ["FEDERALBNK.NS","LUPIN.NS","BHARATFORG.NS","INDUSINDBK.NS","DELHIVERY.NS"]
prices  = yf.download(tickers, start="2024-01-01", interval="1d")["Close"]
bm = midcap100.pct_change(periods=1) * 100  # vs Nifty Midcap 100 benchmark

# ── US 10Y (FRED) ─────────────────────────────────────────────────────
us10y = web.DataReader("DGS10", "fred", "2022-01-01")`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
