# mQuickCalc Utility MCP Server

[![Smithery](https://smithery.ai/badge/mquickcalc-utility-mcp)](https://smithery.ai/servers/19820393768/mquickcalc-utility-mcp)
[![npm version](https://img.shields.io/npm/v/@eyetoolkit/mquickcalc-utility-mcp)](https://www.npmjs.com/package/@eyetoolkit/mquickcalc-utility-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Unit conversion, percentage calculations, date math, and more — available directly inside any AI agent.**

Stop copy-pasting into browser calculators. mQuickCalc Utility MCP gives your AI agent 14 high-frequency conversion and calculation tools that work in any conversation.

**14 production-ready tools:** Length · weight · temperature · volume · area · speed · time · power · energy · data storage · percentage · tip · date difference · age

> Perfect for: developers building AI agents, automation workflows, international applications, cross-border tools.

## Tools

| Tool | Description |
|------|-------------|
| `length_converter` | m, cm, mm, km, inch, foot, yard, mile, nautical mile |
| `weight_converter` | kg, g, mg, lb, oz, stone, ton |
| `temperature_converter` | Celsius, Fahrenheit, Kelvin |
| `volume_converter` | L, mL, gallon (US/UK), quart, pint, cup, fl oz, m³ |
| `area_converter` | m², km², hectare, acre, sq ft, sq inch, sq mile |
| `speed_converter` | m/s, km/h, mph, knots, ft/s |
| `time_converter` | seconds, minutes, hours, days, weeks, years |
| `power_converter` | watt, kilowatt, megawatt, horsepower, BTU/h |
| `energy_converter` | joule, kJ, calorie, kcal, Wh, kWh, eV |
| `data_storage_converter` | bit, byte, KB, MB, GB, TB, PB |
| `percentage_calculator` | X% of Y, percentage change, increase/decrease |
| `tip_calculator` | Tip amount, per-person split, total |
| `date_difference_calculator` | Days between two dates, working days |
| `age_calculator` | Exact age in years, months, days from birthdate |

## Installation

### Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm 9+

### Quick install

```bash
npm install -g @eyetoolkit/mquickcalc-utility-mcp
```

### Build from source

```bash
npm install
npm run build
```

### Test locally

```bash
node dist/index.js
```

## Claude Desktop Integration

Add to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mquickcalc-utility": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-utility/dist/index.js"]
    }
  }
}
```

Then restart Claude Desktop.

## Usage Examples

```
Convert 100 miles to kilometers:
→ length_converter({ value: 100, from: "mile", to: "km" })

What is 15% of $450?
→ percentage_calculator({ operation: "percent_of", value: 450, percent: 15 })

How many days between 2025-01-01 and 2025-12-31?
→ date_difference_calculator({ startDate: "2025-01-01", endDate: "2025-12-31" })

Split a $127 bill among 4 people with 18% tip:
→ tip_calculator({ amount: 127, tipPercent: 18, people: 4 })
```

## Pricing

**Free tier:** All 14 tools, no API key required.

## License

MIT
