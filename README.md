# mQuickCalc Utility MCP Server

An MCP (Model Context Protocol) server exposing mQuickCalc's utility calculators — **22 unit conversions** plus common everyday calculators — to AI agents.

> **Use this as a free brand entry point.** AI agents that discover mQuickCalc through unit conversions may also install the Finance or Health MCP servers.

## Tools

| Category | Tools |
|----------|-------|
| **Length** | mm/cm/m/km ↔ in/ft/yd/mi/nmi |
| **Weight** | mg/g/kg/tonne ↔ oz/lb/st/ton-us/ton-uk |
| **Temperature** | °C ↔ °F ↔ K |
| **Volume** | ml/l/m³ ↔ cup/tbsp/tsp/floz/pint/quart/gallon/bbl |
| **Area** | mm²/cm²/m²/km² ↔ in²/ft²/yd²/acre/ha/mi² |
| **Speed** | m/s ↔ km/h ↔ mph ↔ knot ↔ ft/s ↔ mach |
| **Time** | ms/sec/min/hr/day/week/month/yr |
| **Pressure** | pa/kpa/bar/mbar/psi/atm/mmhg/torr |
| **Power** | mw/w/kw ↔ hp ↔ btu/h ↔ tr |
| **Energy** | j/kj/mj ↔ cal/kcal ↔ wh/kwh ↔ btu/ftlb |
| **Frequency** | hz ↔ khz ↔ mhz ↔ ghz ↔ thz |
| **Wavelength** | m/cm/mm/um/nm/angstrom |
| **Data Storage** | b/B/KB/MB/GB/TB |
| **Data Rate** | bps/kbps/mbps/gbps ↔ Bps/KBps/MBps/GBps |
| **Force** | N/kN/lbf/kgf/dyn/ozf |
| **Other** | Tip, Percentage, Date Difference, Age, Currency\*, Cooking, Fuel Consumption |

\* Currency uses static illustrative rates — not live forex.

## Installation

```bash
npm install
npm run build
```

## Claude Desktop Integration

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

## Usage Examples

```
→ length_converter({ value: 100, from: "mi", to: "km" })
→ temperature_converter({ value: 98.6, from: "f", to: "c" })
→ tip_calculator({ billAmount: 150, tipPercent: 18, people: 2 })
→ date_difference_calculator({ startDate: "2026-01-01", endDate: "2026-09-15" })
```

## License

MIT
