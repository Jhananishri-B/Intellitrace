import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# PARAMETERS
TOTAL_ACCOUNTS = 5000
MULE_RATIO = 0.05
MULE_COUNT = int(TOTAL_ACCOUNTS * MULE_RATIO)

# OPTIONS
account_types = ["Savings", "Current"]
occupations = ["Student", "Engineer", "Business", "Teacher", "Unemployed", "Freelancer"]
income_ranges = ["Low", "Medium", "High"]

data = []

for i in range(TOTAL_ACCOUNTS):
    customer_id = f"CUST{i+1:05d}"
    account_id = f"ACC{i+1:05d}"

    is_mule = 1 if i < MULE_COUNT else 0

    # Account Type
    account_type = random.choice(account_types)

    # Account Open Date
    if is_mule:
        # Recent accounts for mules
        open_days = random.randint(1, 180)
    else:
        open_days = random.randint(180, 1500)

    account_open_date = datetime.today() - timedelta(days=open_days)

    # KYC Status
    kyc_verified_status = random.choice(["Verified", "Verified", "Verified", "Pending"])

    # Age
    age = random.randint(18, 65)

    # Occupation
    occupation = random.choice(occupations)

    # Income
    if is_mule:
        income = random.choice(["Low", "Low", "Medium"])
    else:
        income = random.choice(income_ranges)

    # Credit Score
    if is_mule:
        credit_score = random.randint(300, 600)
    else:
        credit_score = random.randint(600, 850)

    # Risk Category
    if is_mule:
        risk = random.choice(["High", "Medium"])
    else:
        risk = random.choice(["Low", "Medium"])

    # Average Balance
    if is_mule:
        balance = random.randint(1000, 20000)
    else:
        balance = random.randint(20000, 500000)

    data.append([
        customer_id,
        account_id,
        account_type,
        account_open_date.date(),
        kyc_verified_status,
        age,
        occupation,
        income,
        risk,
        credit_score,
        balance,
        is_mule
    ])

columns = [
    "customer_id",
    "account_id",
    "account_type",
    "account_open_date",
    "kyc_verified_status",
    "customer_age",
    "customer_occupation",
    "customer_income_range",
    "customer_risk_category",
    "credit_score",
    "average_monthly_balance",
    "is_mule_account"
]

df = pd.DataFrame(data, columns=columns)

# Save dataset
df.to_csv("customers.csv", index=False)

print("✅ customers.csv generated successfully!")
print(df.head())