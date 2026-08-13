import pandas as pd
import numpy as np

df = pd.read_csv("diamonds.csv")

print("=== SHAPE ===")
print(df.shape)

print("\n=== DTYPES ===")
print(df.dtypes)

print("\n=== MISSING VALUES ===")
print(df.isnull().sum())

print("\n=== DUPLICATES ===")
print(df.duplicated().sum())

print("\n=== NUMERIC SUMMARY ===")
print(df.describe().T)

print("\n=== CATEGORICAL SUMMARY ===")
for col in ['cut', 'color', 'clarity']:
    print(f"\n-- {col} --")
    print(df[col].value_counts())

print("\n=== SUSPICIOUS ZERO DIMENSIONS ===")
print(df[(df.x==0)|(df.y==0)|(df.z==0)].shape[0], "rows with a zero dimension")

print("\n=== CORRELATION MATRIX (numeric) ===")
numeric_cols = ['carat','depth','table','price','x','y','z']
print(df[numeric_cols].corr().round(3))

print("\n=== PRICE CORRELATION RANKED ===")
print(df[numeric_cols].corr()['price'].sort_values(ascending=False))

print("\n=== MEAN PRICE BY CUT ===")
print(df.groupby('cut', observed=True)['price'].mean().sort_values(ascending=False))

print("\n=== MEAN PRICE BY COLOR ===")
print(df.groupby('color', observed=True)['price'].mean().sort_values(ascending=False))

print("\n=== MEAN PRICE BY CLARITY ===")
print(df.groupby('clarity', observed=True)['price'].mean().sort_values(ascending=False))

print("\n=== MEAN CARAT BY CUT (confound check) ===")
print(df.groupby('cut', observed=True)['carat'].mean().sort_values(ascending=False))
