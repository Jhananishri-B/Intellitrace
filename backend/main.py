from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tx_df = pd.DataFrame()
customers_df = pd.DataFrame()

@app.on_event("startup")
def load_data():
    global tx_df, customers_df
    try:
        tx_df = pd.read_csv("../transactions.csv", low_memory=False)
        # Parse timestamp
        tx_df['timestamp'] = pd.to_datetime(tx_df['timestamp'], errors='coerce')
        tx_df['date'] = tx_df['timestamp'].dt.date
        customers_df = pd.read_csv("../customers.csv")
        print("Data loaded:", len(tx_df), "transactions")
    except Exception as e:
        print("Error:", e)


@app.get("/api/dashboard/stats")
def get_stats():
    total_tx    = len(tx_df)
    total_fraud = int(tx_df["is_fraud"].sum()) if not tx_df.empty else 0
    fraud_rate  = round((total_fraud / total_tx) * 100, 2) if total_tx > 0 else 0
    return {
        "totalTransactions": total_tx,
        "totalFraud": total_fraud,
        "fraudRate": fraud_rate,
        "totalCustomers": len(customers_df),
    }


@app.get("/api/dashboard/recent-frauds")
def get_recent_frauds():
    if tx_df.empty:
        return []
    df = tx_df[tx_df["is_fraud"] == 1].tail(100).copy()
    df = df.fillna("N/A")
    df['timestamp'] = df['timestamp'].astype(str)
    return df.to_dict(orient="records")


@app.get("/api/dashboard/transactions")
def get_transactions():
    if tx_df.empty:
        return []
    df = tx_df.tail(200).copy()
    df = df.fillna("N/A")
    df['timestamp'] = df['timestamp'].astype(str)
    return df.to_dict(orient="records")


@app.get("/api/dashboard/analytics")
def get_analytics():
    if tx_df.empty:
        return {}

    # Fraud by type
    fraud_only = tx_df[tx_df["is_fraud"] == 1]
    by_type = (
        fraud_only.groupby("fraud_type")
        .size()
        .reset_index(name="count")
        .rename(columns={"fraud_type": "type"})
        .to_dict(orient="records")
    )

    # Fraud by channel
    by_channel = (
        fraud_only.groupby("channel")
        .size()
        .reset_index(name="count")
        .to_dict(orient="records")
    )

    # Over time — last 30 days
    valid = tx_df.dropna(subset=["date"]).copy()
    valid["date"] = valid["date"].astype(str)
    recent_dates = sorted(valid["date"].unique())[-30:]
    recent = valid[valid["date"].isin(recent_dates)]
    
    over_time = []
    for d in recent_dates:
        day_df = recent[recent["date"] == d]
        fraud_day  = day_df[day_df["is_fraud"] == 1]
        normal_day = day_df[day_df["is_fraud"] == 0]
        over_time.append({
            "date":         d,
            "fraudAmount":  round(float(fraud_day["amount"].sum()), 2),
            "normalAmount": round(float(normal_day["amount"].sum()), 2),
            "fraudCount":   int(len(fraud_day)),
            "normalCount":  int(len(normal_day)),
        })

    return {
        "byType": by_type,
        "byChannel": by_channel,
        "overTime": over_time,
    }


@app.get("/api/dashboard/model-metrics")
def get_model_metrics():
    return {
        "accuracy":  0.0387,
        "precision": 0.0387,
        "recall":    0.9667,
        "f1_score":  0.0745,
        "roc_auc":   0.5833,
    }
