# Diamonds EDA Project

Exploratory Data Analysis of the classic Diamonds dataset (53,940 diamonds) — statistical summaries, correlation analysis, and key price-influencing factors.

## Contents

- `Diamonds_EDA_Report.docx` — full written report with findings and charts
- `diamonds.csv` — raw dataset (carat, cut, color, clarity, depth, table, price, dimensions)
- `summary.py` — generates statistical summaries (shape, missing values, correlations, group stats)
- `plots.py` — generates all six charts used in the report
- `build_report.js` — assembles the Word report from the summary stats and charts
- `charts/` — the six PNG charts referenced in the report

## Key Findings

- Carat is the strongest driver of price (r = 0.92); physical dimensions (x/y/z) are largely redundant with carat.
- Raw average price by cut/color/clarity is misleading due to a Simpson's Paradox: lower grades often have larger average carat weight. Price-per-carat is the fairer comparison.
- Once normalized for size, better cut, color, and clarity grades do command a price premium, as expected.

## Reproducing the analysis

```bash
pip install pandas matplotlib seaborn scipy
python summary.py     # statistical summary, printed to console
python plots.py        # regenerates charts/ as PNGs
node build_report.js   # rebuilds Diamonds_EDA_Report.docx
```
