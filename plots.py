import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid", font_scale=1.05)
PALETTE = "flare"

df = pd.read_csv("diamonds.csv")
cut_order = ["Fair", "Good", "Very Good", "Premium", "Ideal"]
color_order = sorted(df['color'].unique())
clarity_order = ["I1","SI2","SI1","VS2","VS1","VVS2","VVS1","IF"]
df['cut'] = pd.Categorical(df['cut'], categories=cut_order, ordered=True)
df['clarity'] = pd.Categorical(df['clarity'], categories=clarity_order, ordered=True)

# clean obvious data errors for plotting (zero dims)
dfc = df[(df.x>0)&(df.y>0)&(df.z>0)&(df.y<20)&(df.z<10)].copy()

# 1. Price distribution
fig, axes = plt.subplots(1, 2, figsize=(11,4.2))
sns.histplot(df['price'], bins=60, color="#b5495b", ax=axes[0])
axes[0].set_title("Distribution of Price")
axes[0].set_xlabel("Price (USD)")
sns.histplot(np.log10(df['price']), bins=60, color="#4c72b0", ax=axes[1])
axes[1].set_title("Distribution of log10(Price)")
axes[1].set_xlabel("log10(Price)")
plt.tight_layout()
plt.savefig("fig1_price_distribution.png", dpi=150)
plt.close()

# 2. Correlation heatmap
numeric_cols = ['carat','depth','table','price','x','y','z']
plt.figure(figsize=(6.5,5.5))
corr = dfc[numeric_cols].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", center=0, vmin=-1, vmax=1, square=True, linewidths=0.5)
plt.title("Correlation Matrix — Numeric Features")
plt.tight_layout()
plt.savefig("fig2_correlation_heatmap.png", dpi=150)
plt.close()

# 3. Carat vs Price scatter, colored by cut
plt.figure(figsize=(7.5,5.5))
sample = dfc.sample(6000, random_state=42)
sns.scatterplot(data=sample, x="carat", y="price", hue="cut", hue_order=cut_order,
                 palette=PALETTE, alpha=0.55, s=18, linewidth=0)
plt.title("Carat vs. Price by Cut Quality")
plt.xlabel("Carat")
plt.ylabel("Price (USD)")
plt.legend(title="Cut", bbox_to_anchor=(1.02,1), loc="upper left")
plt.tight_layout()
plt.savefig("fig3_carat_vs_price.png", dpi=150)
plt.close()

# 4. Mean price by cut/color/clarity (bar charts)
fig, axes = plt.subplots(1, 3, figsize=(14,4.3))
sns.barplot(data=dfc, x="cut", y="price", order=cut_order, palette=PALETTE, ax=axes[0], errorbar=None)
axes[0].set_title("Mean Price by Cut")
axes[0].tick_params(axis='x', rotation=30)

sns.barplot(data=dfc, x="color", y="price", order=color_order, palette=PALETTE, ax=axes[1], errorbar=None)
axes[1].set_title("Mean Price by Color (D=best)")

sns.barplot(data=dfc, x="clarity", y="price", order=clarity_order, palette=PALETTE, ax=axes[2], errorbar=None)
axes[2].set_title("Mean Price by Clarity (worst→best)")
axes[2].tick_params(axis='x', rotation=40)
plt.tight_layout()
plt.savefig("fig4_price_by_category.png", dpi=150)
plt.close()

# 5. Simpson's paradox illustration: carat by cut, and price/carat ratio by cut
fig, axes = plt.subplots(1, 2, figsize=(11,4.3))
sns.boxplot(data=dfc, x="cut", y="carat", order=cut_order, palette=PALETTE, ax=axes[0], showfliers=False)
axes[0].set_title("Carat Size by Cut Quality")
axes[0].tick_params(axis='x', rotation=30)

dfc['price_per_carat'] = dfc['price']/dfc['carat']
sns.barplot(data=dfc, x="cut", y="price_per_carat", order=cut_order, palette=PALETTE, ax=axes[1], errorbar=None)
axes[1].set_title("Mean Price-per-Carat by Cut")
axes[1].tick_params(axis='x', rotation=30)
plt.tight_layout()
plt.savefig("fig5_simpsons_paradox.png", dpi=150)
plt.close()

# 6. Depth/table distributions (quality control features)
fig, axes = plt.subplots(1, 2, figsize=(11,4.2))
sns.histplot(dfc['depth'], bins=60, color="#55a868", ax=axes[0])
axes[0].set_title("Depth % Distribution")
axes[0].axvline(dfc['depth'].median(), color='black', linestyle='--', linewidth=1)
sns.histplot(dfc['table'], bins=60, color="#8172b2", ax=axes[1])
axes[1].set_title("Table % Distribution")
axes[1].axvline(dfc['table'].median(), color='black', linestyle='--', linewidth=1)
plt.tight_layout()
plt.savefig("fig6_depth_table.png", dpi=150)
plt.close()

print("All figures saved.")
print("price_per_carat by cut:")
print(dfc.groupby('cut', observed=True)['price_per_carat'].mean().sort_values(ascending=False))
