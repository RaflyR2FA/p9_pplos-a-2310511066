import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

np.random.seed(42)
jarak_km = np.random.uniform(50, 800, 1000)
kapasitas = np.random.choice([10, 20, 30, 40, 50], 1000)
is_holiday = np.random.choice([0, 1], 1000)
harga_ideal = (
    150000
    + (jarak_km * 1000)
    + ((50 - kapasitas) * 4000)
    + (is_holiday * (80000 + ((50 - kapasitas) * 2000)))
    + np.random.normal(0, 10000, 1000)
)
harga_ideal = np.round(harga_ideal / 1000) * 1000

df = pd.DataFrame({
    'jarak_km': jarak_km,
    'kapasitas': kapasitas,
    'is_holiday': is_holiday,
    'harga_ideal': harga_ideal
})

X = df[['jarak_km', 'kapasitas', 'is_holiday']]
y = df['harga_ideal']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("=== Evaluasi Model Machine Learning ===")
print(f"Mean Absolute Error (MAE): Rp {mae:,.2f}")
print(f"R2 Score: {r2:.4f}")

model_path = os.path.join(os.path.dirname(__file__), 'pricing_model.pkl')
joblib.dump(pipeline, model_path)

print(f"\nModel & Scaler Pipeline berhasil disimpan di: {model_path}")