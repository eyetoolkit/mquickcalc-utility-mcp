/**
 * mQuickCalc Utility MCP Server — unit conversions + common calculators
 * High-frequency tools AI agents call programmatically
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

function r2(n) { return Math.round(n * 100) / 100; }
function r4(n) { return Math.round(n * 10000) / 10000; }

// ─── Length ──────────────────────────────────────────────────────────────

function lengthConv({ value, from, to }) {
  const v = parseFloat(value);
  const conversions = {
    // Metric
    'mm-to-cm': v / 10, 'cm-to-mm': v * 10,
    'cm-to-m': v / 100, 'm-to-cm': v * 100,
    'm-to-km': v / 1000, 'km-to-m': v * 1000,
    'mm-to-m': v / 1000, 'm-to-mm': v * 1000,
    'cm-to-km': v / 100000, 'km-to-cm': v * 100000,
    // Imperial
    'in-to-cm': v * 2.54, 'cm-to-in': v / 2.54,
    'in-to-mm': v * 25.4, 'mm-to-in': v / 25.4,
    'ft-to-m': v * 0.3048, 'm-to-ft': v / 0.3048,
    'ft-to-in': v * 12, 'in-to-ft': v / 12,
    'yd-to-m': v * 0.9144, 'm-to-yd': v / 0.9144,
    'yd-to-ft': v * 3, 'ft-to-yd': v / 3,
    'mi-to-km': v * 1.60934, 'km-to-mi': v / 1.60934,
    'mi-to-m': v * 1609.34, 'm-to-mi': v / 1609.34,
    'mi-to-ft': v * 5280, 'ft-to-mi': v / 5280,
    // Nautical
    'nmi-to-km': v * 1.852, 'km-to-nmi': v / 1.852,
    'nmi-to-mi': v * 1.15078, 'mi-to-nmi': v / 1.15078,
  };
  const key = `${from}-to-${to}`;
  if (!(key in conversions)) {
    // Try reverse
    const rev = `${to}-to-${from}`;
    if (rev in conversions) return { value: r4(v), from, to, result: r4(1 / conversions[rev]), note: `Inverse of ${rev}` };
    return { error: `Conversion ${from}→${to} not supported. Supported: mm, cm, m, km, in, ft, yd, mi, nmi` };
  }
  return { value: r4(v), from, to, result: r4(conversions[key]) };
}

// ─── Weight / Mass ──────────────────────────────────────────────────────

function weightConv({ value, from, to }) {
  const v = parseFloat(value);
  const conversions = {
    'mg-to-g': v / 1000, 'g-to-mg': v * 1000,
    'g-to-kg': v / 1000, 'kg-to-g': v * 1000,
    'kg-to-tonne': v / 1000, 'tonne-to-kg': v * 1000,
    'mg-to-kg': v / 1000000, 'kg-to-mg': v * 1000000,
    'oz-to-g': v * 28.3495, 'g-to-oz': v / 28.3495,
    'oz-to-lb': v / 16, 'lb-to-oz': v * 16,
    'lb-to-kg': v * 0.453592, 'kg-to-lb': v / 0.453592,
    'lb-to-g': v * 453.592, 'g-to-lb': v / 453.592,
    'st-to-lb': v * 14, 'lb-to-st': v / 14,
    'st-to-kg': v * 6.35029, 'kg-to-st': v / 6.35029,
    'ton-us-to-kg': v * 907.185, 'kg-to-ton-us': v / 907.185,
    'ton-uk-to-kg': v * 1016.05, 'kg-to-ton-uk': v / 1016.05,
    'tonne-to-lb': v * 2204.62, 'lb-to-tonne': v / 2204.62,
  };
  const key = `${from}-to-${to}`;
  if (!(key in conversions)) return { error: `Conversion ${from}→${to} not supported. Supported: mg, g, kg, tonne, oz, lb, st, ton-us, ton-uk` };
  return { value: r4(v), from, to, result: r4(conversions[key]) };
}

// ─── Temperature ─────────────────────────────────────────────────────────

function tempConv({ value, from, to }) {
  const v = parseFloat(value);
  // Convert to Celsius first
  let c;
  if (from === 'c') c = v;
  else if (from === 'f') c = (v - 32) * 5 / 9;
  else if (from === 'k') c = v - 273.15;
  else return { error: 'from must be c, f, or k' };

  // Convert from Celsius to target
  let result;
  if (to === 'c') result = c;
  else if (to === 'f') result = c * 9 / 5 + 32;
  else if (to === 'k') result = c + 273.15;
  else return { error: 'to must be c, f, or k' };

  return { value: v, from, to, result: r2(result) };
}

// ─── Volume ──────────────────────────────────────────────────────────────

function volumeConv({ value, from, to }) {
  const v = parseFloat(value);
  const conversions = {
    'ml-to-l': v / 1000, 'l-to-ml': v * 1000,
    'm3-to-l': v * 1000, 'l-to-m3': v / 1000,
    'ml-to-m3': v / 1000000, 'm3-to-ml': v * 1000000,
    'cup-to-ml': v * 236.588, 'ml-to-cup': v / 236.588,
    'tbsp-to-ml': v * 14.7868, 'ml-to-tbsp': v / 14.7868,
    'tsp-to-ml': v * 4.92892, 'ml-to-tsp': v / 4.92892,
    'floz-to-ml': v * 29.5735, 'ml-to-floz': v / 29.5735,
    'pint-to-ml': v * 473.176, 'ml-to-pint': v / 473.176,
    'quart-to-ml': v * 946.353, 'ml-to-quart': v / 946.353,
    'gallon-to-l': v * 3.78541, 'l-to-gallon': v / 3.78541,
    'gallon-us-to-l': v * 3.78541, 'l-to-gallon-us': v / 3.78541,
    'gallon-uk-to-l': v * 4.54609, 'l-to-gallon-uk': v / 4.54609,
    'bbl-to-l': v * 158.987, 'l-to-bbl': v / 158.987,
  };
  const key = `${from}-to-${to}`;
  if (!(key in conversions)) return { error: `Conversion ${from}→${to} not supported. Supported: ml, l, m3, cup, tbsp, tsp, floz, pint, quart, gallon, gallon-us, gallon-uk, bbl` };
  return { value: r4(v), from, to, result: r4(conversions[key]) };
}

// ─── Area ────────────────────────────────────────────────────────────────

function areaConv({ value, from, to }) {
  const v = parseFloat(value);
  const conversions = {
    'mm2-to-cm2': v / 100, 'cm2-to-mm2': v * 100,
    'cm2-to-m2': v / 10000, 'm2-to-cm2': v * 10000,
    'm2-to-km2': v / 1000000, 'km2-to-m2': v * 1000000,
    'in2-to-cm2': v * 6.4516, 'cm2-to-in2': v / 6.4516,
    'ft2-to-m2': v * 0.092903, 'm2-to-ft2': v / 0.092903,
    'yd2-to-m2': v * 0.836127, 'm2-to-yd2': v / 0.836127,
    'acre-to-m2': v * 4046.86, 'm2-to-acre': v / 4046.86,
    'acre-to-ft2': v * 43560, 'ft2-to-acre': v / 43560,
    'ha-to-m2': v * 10000, 'm2-to-ha': v / 10000,
    'ha-to-acre': v * 2.47105, 'acre-to-ha': v / 2.47105,
    'km2-to-acre': v * 247.105, 'acre-to-km2': v / 247.105,
    'km2-to-mi2': v * 0.386102, 'mi2-to-km2': v / 0.386102,
    'mi2-to-acre': v * 640, 'acre-to-mi2': v / 640,
  };
  const key = `${from}-to-${to}`;
  if (!(key in conversions)) return { error: `Conversion ${from}→${to} not supported. Supported: mm2, cm2, m2, km2, in2, ft2, yd2, acre, ha, mi2` };
  return { value: r4(v), from, to, result: r4(conversions[key]) };
}

// ─── Speed ───────────────────────────────────────────────────────────────

function speedConv({ value, from, to }) {
  const v = parseFloat(value);
  // Convert to m/s first
  const toMs = { 'm/s': 1, 'km/h': 1/3.6, 'mph': 0.44704, 'kn': 0.514444, 'ft/s': 0.3048, 'mach': 343 };
  const fromMs = { 'm/s': 1, 'km/h': 3.6, 'mph': 1/0.44704, 'kn': 1/0.514444, 'ft/s': 1/0.3048, 'mach': 1/343 };
  if (!(from in toMs)) return { error: `from must be m/s, km/h, mph, kn, ft/s, or mach` };
  if (!(to in fromMs)) return { error: `to must be m/s, km/h, mph, kn, ft/s, or mach` };
  const ms = v * toMs[from];
  return { value: r4(v), from, to, result: r4(ms * fromMs[to]) };
}

// ─── Time ────────────────────────────────────────────────────────────────

function timeConv({ value, from, to }) {
  const v = parseFloat(value);
  const toSec = { 'ms': 0.001, 'sec': 1, 'min': 60, 'hr': 3600, 'day': 86400, 'week': 604800, 'month': 2629746, 'yr': 31556952 };
  if (!(from in toSec)) return { error: `from must be ms, sec, min, hr, day, week, month, yr` };
  if (!(to in toSec)) return { error: `to must be ms, sec, min, hr, day, week, month, yr` };
  return { value: r4(v), from, to, result: r4(v * toSec[from] / toSec[to]) };
}

// ─── Pressure ────────────────────────────────────────────────────────────

function pressureConv({ value, from, to }) {
  const v = parseFloat(value);
  const toPa = { 'pa': 1, 'kpa': 1000, 'bar': 100000, 'mbar': 100, 'psi': 6894.76, 'atm': 101325, 'mmhg': 133.322, 'inhg': 3386.39, 'torr': 133.322 };
  if (!(from in toPa)) return { error: `from must be pa, kpa, bar, mbar, psi, atm, mmhg, inhg, torr` };
  if (!(to in toPa)) return { error: `to must be pa, kpa, bar, mbar, psi, atm, mmhg, inhg, torr` };
  const pa = v * toPa[from];
  return { value: r4(v), from, to, result: r4(pa / toPa[to]) };
}

// ─── Power ───────────────────────────────────────────────────────────────

function powerConv({ value, from, to }) {
  const v = parseFloat(value);
  const toW = { 'mw': 0.001, 'w': 1, 'kw': 1000, 'mw-elec': 0.001, 'hp': 745.7, 'btu/h': 0.293071, 'tr': 3516.85 };
  if (!(from in toW)) return { error: `from must be mw, w, kw, hp, btu/h, tr` };
  if (!(to in toW)) return { error: `to must be mw, w, kw, hp, btu/h, tr` };
  const w = v * toW[from];
  return { value: r4(v), from, to, result: r4(w / toW[to]) };
}

// ─── Energy ──────────────────────────────────────────────────────────────

function energyConv({ value, from, to }) {
  const v = parseFloat(value);
  const toJ = { 'j': 1, 'kj': 1000, 'mj': 1000000, 'cal': 4.184, 'kcal': 4184, 'wh': 3600, 'kwh': 3600000, 'ev': 1.60218e-19, 'btu': 1055.06, 'ftlb': 1.35582 };
  if (!(from in toJ)) return { error: `from must be j, kj, mj, cal, kcal, wh, kwh, ev, btu, ftlb` };
  if (!(to in toJ)) return { error: `to must be j, kj, mj, cal, kcal, wh, kwh, ev, btu, ftlb` };
  const j = v * toJ[from];
  return { value: r4(v), from, to, result: r4(j / toJ[to]) };
}

// ─── Frequency / Wavelength ──────────────────────────────────────────────

function frequencyConv({ value, from, to }) {
  const v = parseFloat(value);
  const toHz = { 'hz': 1, 'khz': 1000, 'mhz': 1e6, 'ghz': 1e9, 'thz': 1e12 };
  if (!(from in toHz)) return { error: `from must be hz, khz, mhz, ghz, thz` };
  if (!(to in toHz)) return { error: `to must be hz, khz, mhz, ghz, thz` };
  return { value: r4(v), from, to, result: r4(v * toHz[from] / toHz[to]) };
}

function wavelengthConv({ value, from, to }) {
  const v = parseFloat(value);
  const toM = { 'm': 1, 'cm': 0.01, 'mm': 0.001, 'um': 1e-6, 'nm': 1e-9, 'angstrom': 1e-10 };
  if (!(from in toM)) return { error: `from must be m, cm, mm, um, nm, angstrom` };
  if (!(to in toM)) return { error: `to must be m, cm, mm, um, nm, angstrom` };
  return { value: r4(v), from, to, result: r4(v * toM[from] / toM[to]) };
}

// ─── Data Storage ────────────────────────────────────────────────────────

function dataStorageConv({ value, from, to }) {
  const v = parseFloat(value);
  const toB = { 'b': 1, 'kb': 1024, 'mb': 1048576, 'gb': 1073741824, 'tb': 1099511627776, 'pb': 1125899906842624, 'B': 1, 'KB': 1024, 'MB': 1048576, 'GB': 1073741824, 'TB': 1099511627776 };
  const key = `${from}-to-${to}`;
  // Try exact match first
  if (key in toB) return { value: r4(v), from, to, result: r4(v * toB[from] / toB[key.split('-')[2] ? toB[key.split('-')[2]] : 1] * (toB[key.split('-')[2]] || 1)) };
  // Simpler lookup
  const f = toB[from], t = toB[to];
  if (!f || !t) return { error: `Supported units: b, B, KB, MB, GB, TB (case-insensitive)` };
  return { value: r4(v), from, to, result: r4(v * f / t) };
}

// ─── Percentage ──────────────────────────────────────────────────────────

function percentageCalc({ value, percent, operation = 'of' }) {
  const v = parseFloat(value);
  const p = parseFloat(percent);
  if (operation === 'of') return { value: v, percent: p, result: r2(v * p / 100), note: `${p}% of ${v}` };
  if (operation === 'increase') return { original: v, percent: p, result: r2(v * (1 + p / 100)), note: `${v} increased by ${p}%` };
  if (operation === 'decrease') return { original: v, percent: p, result: r2(v * (1 - p / 100)), note: `${v} decreased by ${p}%` };
  if (operation === 'whatPercent') return { value: v, of: p, result: r2(v / p * 100), note: `${v} is what % of ${p}` };
  return { error: 'operation must be: of, increase, decrease, whatPercent' };
}

// ─── Tip ─────────────────────────────────────────────────────────────────

function tipCalc({ billAmount, tipPercent = 15, people = 1 }) {
  const bill = parseFloat(billAmount);
  const tip = bill * (parseFloat(tipPercent) / 100);
  const total = bill + tip;
  const perPerson = total / Math.max(1, parseInt(people));
  return { billAmount: r2(bill), tipPercent: tipPercent + '%', tipAmount: r2(tip), totalAmount: r2(total), people, perPerson: r2(perPerson) };
}

// ─── Date / Age ─────────────────────────────────────────────────────────

function dateDiffCalc({ startDate, endDate }) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime())) return { error: 'Invalid startDate. Use YYYY-MM-DD.' };
  if (isNaN(end.getTime())) return { error: 'Invalid endDate. Use YYYY-MM-DD.' };
  const diffMs = Math.abs(end - start);
  const diffDays = Math.round(diffMs / 86400000);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30.44);
  const diffYears = Math.round(diffDays / 365.25);
  return { startDate, endDate, differenceDays: diffDays, weeks: diffWeeks, months: diffMonths, years: r2(diffDays / 365.25) };
}

function ageCalc({ birthDate }) {
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return { error: 'Invalid birthDate. Use YYYY-MM-DD.' };
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  const diff = today - birth;
  const days = Math.floor(diff / 86400000);
  return { birthDate, age: years, ageExact: { days, weeks: Math.floor(days / 7), months: Math.floor(days / 30.44) } };
}

// ─── Currency (static rates — for live rates use a real API) ─────────────

function currencyConv({ value, from, to }) {
  const v = parseFloat(value);
  // Static illustrative rates (USD base) — 2024 approximate
  const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CNY: 7.24, CAD: 1.36, AUD: 1.53, CHF: 0.88, INR: 83.1, KRW: 1320, MXN: 17.15, BRL: 4.97, SGD: 1.34, HKD: 7.82, SEK: 10.42, NOK: 10.65, DKK: 6.87, NZD: 1.63, ZAR: 18.6, RUB: 92.5, TRY: 32.1, PLN: 3.98, THB: 35.8, IDR: 15650, PHP: 56.2, MYR: 4.72, VND: 24500 };
  const f = rates[from?.toUpperCase()], t = rates[to?.toUpperCase()];
  if (!f || !t) return { error: `Unsupported currency. USD/EUR/GBP/JPY/CNY/CAD/AUD/CHF/INR/KRW/MXN/BRL/SGD/HKD/SEK/NOK/DKK/NZD/ZAR/RUB/TRY/PLN/THB/IDR/PHP/MYR/VND supported.` };
  const usd = v / f;
  return { value: r2(v), from: from.toUpperCase(), to: to.toUpperCase(), result: r2(usd * t), note: 'Static illustrative rates (not live)' };
}

// ─── Cooking ─────────────────────────────────────────────────────────────

function cookingConv({ value, from, to }) {
  const v = parseFloat(value);
  const toMl = { 'tsp': 4.92892, 'tbsp': 14.7868, 'cup': 236.588, 'floz': 29.5735, 'ml': 1, 'l': 1000, 'pint': 473.176, 'quart': 946.353 };
  if (!(from in toMl)) return { error: `from must be tsp, tbsp, cup, floz, ml, l, pint, quart` };
  if (!(to in toMl)) return { error: `to must be tsp, tbsp, cup, floz, ml, l, pint, quart` };
  return { value: r4(v), from, to, result: r4(v * toMl[from] / toMl[to]) };
}

// ─── Fuel ────────────────────────────────────────────────────────────────

function fuelConv({ value, from, to }) {
  const v = parseFloat(value);
  const toL = { 'l/100km': 1, 'mpg-us': 235.215, 'mpg-uk': 282.481, 'km/l': 100/100 }; // simplified
  // L/100km is inverse — special handling
  if (from === 'l/100km' && to === 'mpg-us') return { value: r2(v), from, to, result: r2(235.215 / v) };
  if (from === 'mpg-us' && to === 'l/100km') return { value: r2(v), from, to, result: r2(235.215 / v) };
  if (from === 'l/100km' && to === 'mpg-uk') return { value: r2(v), from, to, result: r2(282.481 / v) };
  if (from === 'mpg-uk' && to === 'l/100km') return { value: r2(v), from, to, result: r2(282.481 / v) };
  if (from === 'km/l' && to === 'l/100km') return { value: r2(v), from, to, result: r2(100 / v) };
  if (from === 'l/100km' && to === 'km/l') return { value: r2(v), from, to, result: r2(100 / v) };
  return { value: r2(v), from, to, result: r2(v) };
}

// ─── Force ───────────────────────────────────────────────────────────────

function forceConv({ value, from, to }) {
  const v = parseFloat(value);
  const toN = { 'N': 1, 'kN': 1000, 'lbf': 4.44822, 'kgf': 9.80665, 'dyn': 0.00001, 'ozf': 0.278014 };
  if (!(from in toN)) return { error: `from must be N, kN, lbf, kgf, dyn, ozf` };
  if (!(to in toN)) return { error: `to must be N, kN, lbf, kgf, dyn, ozf` };
  return { value: r4(v), from, to, result: r4(v * toN[from] / toN[to]) };
}

// ─── Power / Data Rate ──────────────────────────────────────────────────

function dataRateConv({ value, from, to }) {
  const v = parseFloat(value);
  const toBps = { 'bps': 1, 'kbps': 1000, 'mbps': 1e6, 'gbps': 1e9, 'Bps': 8, 'KBps': 8000, 'MBps': 8e6, 'GBps': 8e9 };
  if (!(from in toBps)) return { error: `from must be bps, kbps, mbps, gbps, Bps, KBps, MBps, GBps` };
  if (!(to in toBps)) return { error: `to must be bps, kbps, mbps, gbps, Bps, KBps, MBps, GBps` };
  return { value: r4(v), from, to, result: r4(v * toBps[from] / toBps[to]) };
}

// ─── MCP Server ──────────────────────────────────────────────────────────

const TOOLS = [
  { name: 'length_converter', description: 'Convert length: mm/cm/m/km ↔ in/ft/yd/mi/nmi. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'weight_converter', description: 'Convert weight/mass: mg/g/kg/tonne ↔ oz/lb/st/ton-us/ton-uk. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'temperature_converter', description: 'Convert temperature: Celsius ↔ Fahrenheit ↔ Kelvin. Input: value, from (c/f/k), to (c/f/k).', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'volume_converter', description: 'Convert volume: ml/l/m³ ↔ cup/tbsp/tsp/floz/pint/quart/gallon/bbl. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'area_converter', description: 'Convert area: mm²/cm²/m²/km² ↔ in²/ft²/yd²/acre/ha/mi². Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'speed_converter', description: 'Convert speed: m/s ↔ km/h ↔ mph ↔ kn ↔ ft/s ↔ mach. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'time_converter', description: 'Convert time: ms/sec/min/hr/day/week/month/yr. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'pressure_converter', description: 'Convert pressure: pa/kpa/bar/mbar/psi/atm/mmhg/inhg/torr. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'power_converter', description: 'Convert power: mw/w/kw ↔ hp ↔ btu/h ↔ tr (ton of refrigeration). Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'energy_converter', description: 'Convert energy: j/kj/mj ↔ cal/kcal ↔ wh/kwh ↔ btu/ftlb/ev. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'frequency_converter', description: 'Convert frequency: hz ↔ khz ↔ mhz ↔ ghz ↔ thz. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'wavelength_converter', description: 'Convert wavelength: m/cm/mm/um/nm/angstrom. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'data_storage_converter', description: 'Convert data storage: b/B/KB/MB/GB/TB. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'data_rate_converter', description: 'Convert data transfer rate: bps/kbps/mbps/gbps ↔ Bps/KBps/MBps/GBps. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'percentage_calculator', description: 'Percentage operations: of / increase / decrease / whatPercent. Input: value, percent, operation.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, percent: { type: 'number' }, operation: { type: 'string', enum: ['of', 'increase', 'decrease', 'whatPercent'] } }, required: ['value', 'percent'] } },
  { name: 'tip_calculator', description: 'Calculate tip and split bill. Input: billAmount, tipPercent (default 15), people (default 1).', inputSchema: { type: 'object', properties: { billAmount: { type: 'number' }, tipPercent: { type: 'number' }, people: { type: 'number' } }, required: ['billAmount'] } },
  { name: 'date_difference_calculator', description: 'Calculate days/weeks/months/years between two dates. Input: startDate, endDate (YYYY-MM-DD).', inputSchema: { type: 'object', properties: { startDate: { type: 'string' }, endDate: { type: 'string' } }, required: ['startDate', 'endDate'] } },
  { name: 'age_calculator', description: 'Calculate age from birth date. Input: birthDate (YYYY-MM-DD). Returns age in years + exact days/weeks/months.', inputSchema: { type: 'object', properties: { birthDate: { type: 'string' } }, required: ['birthDate'] } },
  { name: 'currency_converter', description: 'Convert currency (static illustrative rates). Supports USD/EUR/GBP/JPY/CNY/CAD/AUD/CHF/INR/KRW/MXN/BRL/SGD/HKD/SEK/NOK/DKK/NZD/ZAR/RUB/TRY/PLN/THB/IDR/PHP/MYR/VND. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'cooking_converter', description: 'Convert cooking measurements: tsp/tbsp/cup/floz/ml/l/pint/quart. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'fuel_consumption_converter', description: 'Convert fuel consumption: L/100km ↔ mpg (US) ↔ mpg (UK) ↔ km/L. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'force_converter', description: 'Convert force: N/kN/lbf/kgf/dyn/ozf. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
];

const server = new Server({ name: 'mquickcalc-utility-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
  const { name, arguments: args = {} } = params;
  try {
    const fns = {
      length_converter: () => lengthConv(args), weight_converter: () => weightConv(args),
      temperature_converter: () => tempConv(args), volume_converter: () => volumeConv(args),
      area_converter: () => areaConv(args), speed_converter: () => speedConv(args),
      time_converter: () => timeConv(args), pressure_converter: () => pressureConv(args),
      power_converter: () => powerConv(args), energy_converter: () => energyConv(args),
      frequency_converter: () => frequencyConv(args), wavelength_converter: () => wavelengthConv(args),
      data_storage_converter: () => dataStorageConv(args), data_rate_converter: () => dataRateConv(args),
      percentage_calculator: () => percentageCalc(args), tip_calculator: () => tipCalc(args),
      date_difference_calculator: () => dateDiffCalc(args), age_calculator: () => ageCalc(args),
      currency_converter: () => currencyConv(args), cooking_converter: () => cookingConv(args),
      fuel_consumption_converter: () => fuelConv(args), force_converter: () => forceConv(args),
    };
    const fn = fns[name];
    if (!fn) return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    return { content: [{ type: 'text', text: JSON.stringify(fn(), null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(err => { console.error('Failed to start:', err); process.exit(1); });
