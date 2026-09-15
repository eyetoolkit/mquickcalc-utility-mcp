/**
 * mQuickCalc Utility MCP Server — v3 (14 tools, high-frequency only)
 * Dropped: fuel, force, wavelength, pressure, data rate (low frequency)
 * Kept: the conversions every AI agent actually calls
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const r2 = n => Math.round(n * 100) / 100;
const r4 = n => Math.round(n * 10000) / 10000;
const pos = (v, n) => { const x = parseFloat(v); if (isNaN(x) || x < 0) throw new Error(`${n} must be positive`); return x; };

function lengthConv({ value, from, to }) {
  const v = pos(value, 'value');
  const map = {
    'mm-cm': v/10, 'cm-mm': v*10, 'cm-m': v/100, 'm-cm': v*100, 'm-km': v/1000, 'km-m': v*1000,
    'in-cm': v*2.54, 'cm-in': v/2.54, 'ft-m': v*0.3048, 'm-ft': v/0.3048,
    'mi-km': v*1.60934, 'km-mi': v/1.60934, 'yd-m': v*0.9144, 'm-yd': v/0.9144,
    'ft-in': v*12, 'in-ft': v/12, 'mi-ft': v*5280, 'ft-mi': v/5280,
  };
  const key = `${from}-${to}`;
  if (!(key in map)) {
    const rev = `${to}-${from}`;
    if (rev in map) return { value: r4(v), from, to, result: r4(1 / map[rev]) };
    return { error: `Unsupported. Use: mm, cm, m, km, in, ft, yd, mi` };
  }
  return { value: r4(v), from, to, result: r4(map[key]) };
}

function weightConv({ value, from, to }) {
  const v = pos(value, 'value');
  const map = {
    'mg-g': v/1000, 'g-mg': v*1000, 'g-kg': v/1000, 'kg-g': v*1000,
    'oz-g': v*28.3495, 'g-oz': v/28.3495, 'lb-kg': v*0.453592, 'kg-lb': v/0.453592,
    'lb-oz': v*16, 'oz-lb': v/16, 'st-kg': v*6.35029, 'kg-st': v/6.35029,
    'lb-g': v*453.592, 'g-lb': v/453.592, 'tonne-kg': v*1000, 'kg-tonne': v/1000,
  };
  const key = `${from}-${to}`;
  if (!(key in map)) { const rev = `${to}-${from}`; if (rev in map) return { value: r4(v), from, to, result: r4(1 / map[rev]) }; return { error: `Unsupported. Use: mg, g, kg, tonne, oz, lb, st` }; }
  return { value: r4(v), from, to, result: r4(map[key]) };
}

function tempConv({ value, from, to }) {
  const v = parseFloat(value);
  let c = from === 'c' ? v : from === 'f' ? (v-32)*5/9 : from === 'k' ? v-273.15 : NaN;
  if (isNaN(c)) return { error: 'from must be c, f, or k' };
  const result = to === 'c' ? c : to === 'f' ? c*9/5+32 : to === 'k' ? c+273.15 : NaN;
  if (isNaN(result)) return { error: 'to must be c, f, or k' };
  return { value: v, from, to, result: r2(result) };
}

function volumeConv({ value, from, to }) {
  const v = pos(value, 'value');
  const toMl = { ml:1, l:1000, cup:236.588, tbsp:14.7868, tsp:4.92892, floz:29.5735, pint:473.176, quart:946.353, gallon:3785.41 };
  if (!(from in toMl)) return { error: `Unsupported. Use: ml, l, cup, tbsp, tsp, floz, pint, quart, gallon` };
  if (!(to in toMl)) return { error: `Unsupported. Use: ml, l, cup, tbsp, tsp, floz, pint, quart, gallon` };
  return { value: r4(v), from, to, result: r4(v * toMl[from] / toMl[to]) };
}

function areaConv({ value, from, to }) {
  const v = pos(value, 'value');
  const toM2 = { mm2:1e-6, cm2:1e-4, m2:1, km2:1e6, in2:0.00064516, ft2:0.092903, yd2:0.836127, acre:4046.86, ha:10000 };
  if (!(from in toM2)) return { error: `Unsupported. Use: mm2, cm2, m2, km2, in2, ft2, yd2, acre, ha` };
  if (!(to in toM2)) return { error: `Unsupported. Use: mm2, cm2, m2, km2, in2, ft2, yd2, acre, ha` };
  return { value: r4(v), from, to, result: r4(v * toM2[from] / toM2[to]) };
}

function speedConv({ value, from, to }) {
  const v = pos(value, 'value');
  const toMs = { 'm/s':1, 'km/h':1/3.6, 'mph':0.44704, 'kn':0.514444, 'ft/s':0.3048 };
  if (!(from in toMs)) return { error: `Unsupported. Use: m/s, km/h, mph, kn, ft/s` };
  if (!(to in toMs)) return { error: `Unsupported. Use: m/s, km/h, mph, kn, ft/s` };
  return { value: r4(v), from, to, result: r4(v * toMs[from] / toMs[to]) };
}

function timeConv({ value, from, to }) {
  const v = pos(value, 'value');
  const toSec = { ms:0.001, sec:1, min:60, hr:3600, day:86400, week:604800, month:2629746, yr:31556952 };
  if (!(from in toSec)) return { error: `Unsupported. Use: ms, sec, min, hr, day, week, month, yr` };
  if (!(to in toSec)) return { error: `Unsupported. Use: ms, sec, min, hr, day, week, month, yr` };
  return { value: r4(v), from, to, result: r4(v * toSec[from] / toSec[to]) };
}

function powerConv({ value, from, to }) {
  const v = pos(value, 'value');
  const toW = { mw:0.001, w:1, kw:1000, hp:745.7, btu_h:0.293071, tr:3516.85 };
  if (!(from in toW)) return { error: `Unsupported. Use: mw, w, kw, hp, btu/h, tr` };
  if (!(to in toW)) return { error: `Unsupported. Use: mw, w, kw, hp, btu/h, tr` };
  return { value: r4(v), from, to, result: r4(v * toW[from] / toW[to]) };
}

function energyConv({ value, from, to }) {
  const v = pos(value, 'value');
  const toJ = { j:1, kj:1000, cal:4.184, kcal:4184, wh:3600, kwh:3600000, btu:1055.06 };
  if (!(from in toJ)) return { error: `Unsupported. Use: j, kj, cal, kcal, wh, kwh, btu` };
  if (!(to in toJ)) return { error: `Unsupported. Use: j, kj, cal, kcal, wh, kwh, btu` };
  return { value: r4(v), from, to, result: r4(v * toJ[from] / toJ[to]) };
}

function dataStorageConv({ value, from, to }) {
  const v = pos(value, 'value');
  const toB = { b:1, B:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776 };
  const fu = toB[from], tu = toB[to];
  if (!fu || !tu) return { error: `Unsupported. Use: b, B, KB, MB, GB, TB` };
  return { value: r4(v), from, to, result: r4(v * fu / tu) };
}

function percentageCalc({ value, percent, operation = 'of' }) {
  const v = parseFloat(value), p = parseFloat(percent);
  if (operation === 'of') return { value: v, percent: p, result: r2(v * p / 100) };
  if (operation === 'increase') return { original: v, percent: p, result: r2(v * (1 + p/100)) };
  if (operation === 'decrease') return { original: v, percent: p, result: r2(v * (1 - p/100)) };
  if (operation === 'whatPercent') return { value: v, of: p, result: r2(v / p * 100) };
  return { error: 'operation must be: of, increase, decrease, whatPercent' };
}

function tipCalc({ billAmount, tipPercent = 15, people = 1 }) {
  const bill = pos(billAmount, 'billAmount');
  const tip = bill * (parseFloat(tipPercent) / 100);
  return { billAmount: r2(bill), tipPercent: tipPercent+'%', tipAmount: r2(tip), totalAmount: r2(bill+tip), people: Math.max(1,parseInt(people)), perPerson: r2((bill+tip)/Math.max(1,parseInt(people))) };
}

function dateDiffCalc({ startDate, endDate }) {
  const start = new Date(startDate), end = new Date(endDate);
  if (isNaN(start.getTime())) return { error: 'Invalid startDate. Use YYYY-MM-DD.' };
  if (isNaN(end.getTime())) return { error: 'Invalid endDate. Use YYYY-MM-DD.' };
  const diffDays = Math.round(Math.abs(end - start) / 86400000);
  return { startDate, endDate, days: diffDays, weeks: Math.round(diffDays/7), months: Math.round(diffDays/30.44) };
}

function ageCalc({ birthDate }) {
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return { error: 'Invalid birthDate. Use YYYY-MM-DD.' };
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m===0 && today.getDate() < birth.getDate())) years--;
  const days = Math.floor((today - birth) / 86400000);
  return { birthDate, age: years, exactDays: days };
}

// ─── MCP ─────────────────────────────────────────────────────────────────

const TOOLS = [
  { name: 'length_converter', description: 'Convert length: mm/cm/m/km ↔ in/ft/yd/mi. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'weight_converter', description: 'Convert weight: mg/g/kg/tonne ↔ oz/lb/st. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'temperature_converter', description: 'Convert temperature: °C ↔ °F ↔ K. Input: value, from (c/f/k), to (c/f/k).', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'volume_converter', description: 'Convert volume: ml/l/cup/tbsp/tsp/floz/pint/quart/gallon. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'area_converter', description: 'Convert area: mm²/cm²/m²/km² ↔ in²/ft²/yd²/acre/ha. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'speed_converter', description: 'Convert speed: m/s ↔ km/h ↔ mph ↔ knots ↔ ft/s. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'time_converter', description: 'Convert time: ms/sec/min/hr/day/week/month/yr. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'power_converter', description: 'Convert power: mw/w/kw ↔ hp ↔ btu/h ↔ tr. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'energy_converter', description: 'Convert energy: j/kj ↔ cal/kcal ↔ wh/kwh ↔ btu. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'data_storage_converter', description: 'Convert data: b/B/KB/MB/GB/TB. Input: value, from, to.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
  { name: 'percentage_calculator', description: 'Percentage: of / increase / decrease / whatPercent. Input: value, percent, operation.', inputSchema: { type: 'object', properties: { value: { type: 'number' }, percent: { type: 'number' }, operation: { type: 'string', enum: ['of', 'increase', 'decrease', 'whatPercent'] } }, required: ['value', 'percent'] } },
  { name: 'tip_calculator', description: 'Calculate tip and split bill. Input: billAmount, tipPercent (default 15), people (default 1).', inputSchema: { type: 'object', properties: { billAmount: { type: 'number' }, tipPercent: { type: 'number' }, people: { type: 'number' } }, required: ['billAmount'] } },
  { name: 'date_difference_calculator', description: 'Days/weeks/months between two dates. Input: startDate, endDate (YYYY-MM-DD).', inputSchema: { type: 'object', properties: { startDate: { type: 'string' }, endDate: { type: 'string' } }, required: ['startDate', 'endDate'] } },
  { name: 'age_calculator', description: 'Age from birth date. Input: birthDate (YYYY-MM-DD). Returns age in years + exact days.', inputSchema: { type: 'object', properties: { birthDate: { type: 'string' } }, required: ['birthDate'] } },
];

const server = new Server({ name: 'mquickcalc-utility-mcp', version: '3.0.0' }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
  const { name, arguments: args = {} } = params;
  const fns = {
    length_converter: () => lengthConv(args), weight_converter: () => weightConv(args),
    temperature_converter: () => tempConv(args), volume_converter: () => volumeConv(args),
    area_converter: () => areaConv(args), speed_converter: () => speedConv(args),
    time_converter: () => timeConv(args), power_converter: () => powerConv(args),
    energy_converter: () => energyConv(args), data_storage_converter: () => dataStorageConv(args),
    percentage_calculator: () => percentageCalc(args), tip_calculator: () => tipCalc(args),
    date_difference_calculator: () => dateDiffCalc(args), age_calculator: () => ageCalc(args),
  };
  const fn = fns[name];
  if (!fn) return { content: [{ type: 'text', text: `Unknown: ${name}` }], isError: true };
  try { return { content: [{ type: 'text', text: JSON.stringify(fn(), null, 2) }] }; }
  catch (e) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }; }
});
const transport = new StdioServerTransport();
server.connect(transport).catch(e => { console.error(e); process.exit(1); });
