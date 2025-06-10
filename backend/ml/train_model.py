import random
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OrdinalEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error
import joblib
import os

# -------- 1. Define Values --------
brands = ['Samsung', 'Dawlance', 'Haier', 'Super Asia', 'PEL', 'TCL', 'Gree', 'Waves']
conditions = ['New', 'Like New', 'Used', 'For Parts']
appliance_types = ['Refrigerator', 'Washing Machine', 'Microwave', 'AC', 'Heater']
working_statuses = ['Fully functional', 'Minor issue', 'Not working']

brand_priority = {b: i for i, b in enumerate(brands)}
condition_priority = {'New': 3, 'Like New': 2, 'Used': 1, 'For Parts': 0}
status_priority = {'Fully functional': 2, 'Minor issue': 1, 'Not working': 0}

def generate_data(n=500):
    data = []
    current_year = 2025
    for _ in range(n):
        brand = random.choice(brands)
        condition = random.choices(conditions, weights=[0.1, 0.3, 0.5, 0.1])[0]
        appliance_type = random.choice(appliance_types)
        year = random.randint(2015, 2024)
        warranty_remaining = max(0, random.randint(-2, 24))
        working_status = random.choices(working_statuses, weights=[0.7, 0.2, 0.1])[0]

        # Generate base price
        base_price = 80000 if brand == 'Samsung' else 50000
        price = (
            base_price
            * (0.9 if condition == 'Like New' else 0.7 if condition == 'Used' else 0.4 if condition == 'For Parts' else 1.0)
            * (1 - (current_year - year) * 0.05)
            * (1 + (warranty_remaining / 24) * 0.2)
            * (1.0 if working_status == 'Fully functional' else 0.8 if working_status == 'Minor issue' else 0.5)
        )
        price = max(price + random.uniform(-5000, 5000), 10000)  # Add noise, ensure not < 10k

        data.append({
            "brand": brand,
            "condition": condition,
            "year": year,
            "appliance_type": appliance_type,
            "warranty_remaining": warranty_remaining,
            "working_status": working_status,
            "price": int(price)
        })

    return pd.DataFrame(data)

df = generate_data(600)

# -------- 3. Preprocessing --------
categorical_ordinal = ['brand', 'condition', 'working_status']
categorical_nominal = ['appliance_type']
numeric_features = ['year', 'warranty_remaining']

# Encoders
ordinal_encoder = OrdinalEncoder(categories=[
    brands,                          # brand
    ['New', 'Like New', 'Used', 'For Parts'],  # condition
    ['Fully functional', 'Minor issue', 'Not working']  # working_status
])

onehot_encoder = OneHotEncoder(handle_unknown='ignore')

preprocessor = ColumnTransformer(
    transformers=[
        ('ord', ordinal_encoder, categorical_ordinal),
        ('onehot', onehot_encoder, categorical_nominal),
    ],
    remainder='passthrough'  # for numeric_features
)

# -------- 4. Build Pipeline --------
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
])

# -------- 5. Train & Evaluate --------
X = df[categorical_ordinal + categorical_nominal + numeric_features]
y = df['price']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))

print(f"Model trained. RMSE on test set: PKR {rmse:.2f}")

# -------- 6. Save Model & Encoders --------
os.makedirs("ml", exist_ok=True)
joblib.dump(model, "ml/model.pkl")
print("Model saved to ml/model.pkl")
