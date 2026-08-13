const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  AlignmentType, PageBreak, TableOfContents, LevelFormat
} = require("docx");

const PAGE = { width: 12240, height: 15840 }; // US Letter
const ACCENT = "8B1E3F"; // deep ruby, diamond-report feel
const DARK = "1F1F1F";

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 300 },
    children: [new TextRun({ text, size: 22, ...opts })],
  });
}
function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80, line: 290 },
  });
}
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 260 },
    children: [new TextRun({ text, italics: true, size: 19, color: "555555" })],
  });
}
function img(path, width, height) {
  const data = fs.readFileSync(path);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60 },
    children: [new ImageRun({ data, type: "png", transformation: { width, height } })],
  });
}
function statRow(label, value, header=false) {
  const shade = header ? { fill: "8B1E3F", type: ShadingType.CLEAR } : undefined;
  const color = header ? "FFFFFF" : DARK;
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 5000, type: WidthType.DXA },
        shading: shade,
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: header, color, size: 20 })] })],
      }),
      new TableCell({
        width: { size: 3600, type: WidthType.DXA },
        shading: shade,
        children: [new Paragraph({ children: [new TextRun({ text: value, bold: header, color, size: 20 })] })],
      }),
    ],
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT }] },
    ],
  },
  sections: [
    {
      properties: { page: { size: PAGE, margin: { top: 1080, bottom: 1080, left: 1260, right: 1260 } } },
      children: [
        // Title page
        new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Exploratory Data Analysis", bold: true, size: 52, color: ACCENT })] }),
        new Paragraph({ spacing: { before: 120, after: 40 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "The Diamonds Dataset", bold: true, size: 32, color: DARK })] }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Statistical Summary · Correlation Analysis · Key Influencing Factors", size: 22, italics: true, color: "666666" })] }),
        new Paragraph({ spacing: { before: 500 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "53,940 diamonds  ·  10 variables  ·  price range $326 – $18,823", size: 20, color: "888888" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        h1("1. Introduction & Objective"),
        body("This report presents an exploratory data analysis (EDA) of the classic Diamonds dataset, which records the price and physical/quality attributes of 53,940 round-cut diamonds. The goal is to understand the shape of the data, identify data-quality issues, quantify relationships between variables, and determine which factors most strongly influence price — while surfacing any misleading patterns along the way."),
        body("The dataset contains 10 variables: carat (weight), cut, color, clarity, depth %, table %, price (USD), and the physical dimensions x/y/z (mm)."),

        h1("2. Dataset Overview & Data Quality"),
        h2("2.1 Structure"),
        new Table({
          width: { size: 8600, type: WidthType.DXA },
          rows: [
            statRow("Metric", "Value", true),
            statRow("Rows", "53,940"),
            statRow("Columns", "10 (7 numeric, 3 categorical)"),
            statRow("Missing values", "0"),
            statRow("Exact duplicate rows", "146 (0.27%)"),
            statRow("Rows with a zero dimension (x/y/z)", "20 (likely data-entry errors)"),
          ],
        }),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        body("The data is essentially complete — no missing values — but is not perfectly clean: 146 exact duplicate rows and 20 rows with an impossible zero dimension (e.g. z = 0mm) were found. These were excluded from the visual analysis below to avoid distorting scale and correlation estimates, though they represent a negligible fraction (<0.4%) of the data."),

        h2("2.2 Categorical Variables"),
        bullet("Cut: 5 levels — Ideal (40%) is the most common, followed by Premium (26%), Very Good (22%), Good (9%), and Fair (3%)."),
        bullet("Color: 7 levels (D = colorless/best, J = most tinted). G is most common; the distribution is fairly balanced across grades."),
        bullet("Clarity: 8 levels from I1 (worst) to IF (flawless). SI1 and VS2 are the most common grades; flawless (IF) stones are rare (3.3%)."),

        h1("3. Statistical Summary"),
        new Table({
          width: { size: 8600, type: WidthType.DXA },
          rows: [
            statRow("Variable", "Mean / Notes", true),
            statRow("Carat", "0.80 (median 0.70), right-skewed, max 5.01"),
            statRow("Price", "$3,933 (median $2,401), heavily right-skewed"),
            statRow("Depth %", "61.7% (tight distribution, std 1.4)"),
            statRow("Table %", "57.5% (tight distribution, std 2.2)"),
          ],
        }),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        img("fig1_price_distribution.png", 600, 229),
        caption("Figure 1 — Price is heavily right-skewed (many affordable stones, a long tail of expensive ones). On a log10 scale, the distribution becomes far more symmetric, indicating price grows multiplicatively with quality/size."),

        new Paragraph({ children: [new PageBreak()] }),
        h1("4. Correlation Analysis"),
        body("To identify what drives price, we computed pairwise Pearson correlations between all numeric variables."),
        img("fig2_correlation_heatmap.png", 460, 390),
        caption("Figure 2 — Correlation matrix of numeric features."),
        h2("4.1 Key Findings"),
        bullet("Carat (weight) is by far the strongest predictor of price (r = 0.92)."),
        bullet("The physical dimensions x, y, z are highly correlated with carat and each other (r > 0.95) — they are largely redundant measures of size, and also correlate strongly with price (r ≈ 0.86–0.88) purely because they encode size."),
        bullet("Table % and depth % have very weak correlation with price (r = 0.13 and r = -0.01), suggesting these proportion metrics affect visual quality more than market price directly."),
        bullet("Depth % and table % are mildly negatively correlated (r = -0.30), reflecting a geometric trade-off in how a stone is cut."),

        img("fig3_carat_vs_price.png", 540, 396),
        caption("Figure 3 — Carat vs. price, colored by cut. Price rises non-linearly with carat, and the relationship is not a single clean curve — cut quality shifts the curve, and variance in price grows with carat size."),

        h1("5. Category Effects: Cut, Color, Clarity"),
        img("fig4_price_by_category.png", 610, 187),
        caption("Figure 4 — Mean price by cut, color, and clarity."),
        body("At first glance, the cut chart is counter-intuitive: Ideal-cut diamonds have the lowest average price, and Premium/Fair cuts appear the most expensive. Similarly, better color/clarity grades (D, IF) show lower average prices than worse grades (J, SI2). This runs opposite to what \"quality\" should imply — this is investigated in Section 6."),

        new Paragraph({ children: [new PageBreak()] }),
        h1("6. A Closer Look: Simpson's Paradox"),
        body("The pattern in Section 5 is a textbook case of Simpson's Paradox — a confounding variable (carat) reverses the apparent relationship. Ideal-cut diamonds are disproportionately smaller (mean 0.70 carat) than Fair-cut diamonds (mean 1.05 carat), because cutters are more willing to sacrifice a larger rough stone for a lower cut grade. Since carat dominates price, low-cut-but-large stones can out-price high-cut-but-small stones on average."),
        img("fig5_simpsons_paradox.png", 600, 235),
        caption("Figure 5 — Left: Fair-cut diamonds are on average nearly 50% larger than Ideal-cut diamonds. Right: once price is normalized per carat, the ranking flips — Premium cut actually commands the highest $/carat, and Fair the lowest, which matches quality intuition."),
        body("Takeaway: never interpret a category's raw average price without checking whether group sizes/carats differ. Price-per-carat is the fairer lens for comparing cut, color, and clarity quality, and under that lens quality grades behave as expected: better clarity and better color modestly increase price-per-carat, and Premium/Ideal cuts out-earn Fair cuts."),

        h1("7. Secondary Features: Depth & Table"),
        img("fig6_depth_table.png", 600, 229),
        caption("Figure 6 — Depth % and table % are tightly clustered around ~61.7% and ~57.5% respectively (dashed line = median), consistent with cutters converging on proportions known to maximize brilliance. Outliers outside this narrow band likely indicate poorly-cut stones."),

        h1("8. Summary of Key Insights"),
        bullet("Carat is the dominant driver of price (r = 0.92); dimensions x/y/z are redundant proxies for the same signal."),
        bullet("Table % and depth % barely correlate with price directly — they matter for visual brilliance, not raw market value."),
        bullet("Raw average price by cut/color/clarity is misleading due to a strong confound with carat (Simpson's Paradox); price-per-carat is the correct metric for judging quality effects."),
        bullet("Once normalized for size, quality grades behave intuitively: Premium and Ideal cuts, better color, and better clarity all command a price-per-carat premium."),
        bullet("The dataset is largely clean (~0% missing) but contains 146 duplicate rows and 20 physically impossible records that should be removed before modeling."),
        bullet("Price is heavily right-skewed; a log-price transform is recommended before any regression or ML modeling on this data."),

        h1("9. Suggested Next Steps"),
        bullet("Fit a multiple regression or gradient-boosted model using carat, cut, color, and clarity to predict log(price), then examine feature importance directly."),
        bullet("Engineer a volume feature (x × y × z) to test whether it out-performs carat alone."),
        bullet("Investigate the 20 zero-dimension and 146 duplicate rows to decide whether to correct or drop them before modeling."),
        bullet("Segment analysis by carat bucket (e.g. <0.5, 0.5–1, 1–2, 2+) to see if quality effects on price-per-carat change at different size tiers."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("Diamonds_EDA_Report.docx", buf);
  console.log("done");
});
