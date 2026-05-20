# IoT Anomaly Detection Dashboard

A portfolio project that simulates an IoT machine monitoring system, streams sensor readings, scores machine health, and explains anomaly risk using exported ML model statistics.

The main application runs on a JavaScript/TypeScript stack. Python is used only for offline model training and analysis.

## Project Overview

This project uses the AI4I 2020 Predictive Maintenance Dataset to simulate machine sensor monitoring. The backend streams one sensor row at a time, enriches it with anomaly and health scores, and returns risk factors that explain which sensor values contributed most to the current risk.

The frontend displays a responsive monitoring dashboard with live-updating sensor cards, trend charts, ML model insights, and recent warning/anomaly alerts.

## Screenshots

![Dashboard screenshot](https://res.cloudinary.com/dx4da8o3m/image/upload/v1779245492/image_zvemua.png)
![Dashboard demo](https://res.cloudinary.com/dx4da8o3m/image/upload/v1779246298/ezgif-4972a18feef3637e_wyw77q.gif)

## Features

- Realtime sensor monitoring simulation with REST polling
- Machine status, anomaly score, and health score
- Streaming sensor trend charts with Recharts
- Recent monitoring alerts for warning and anomaly states
- ML-based risk factors from exported model statistics
- z-score based sensor deviation analysis
- Feature-importance weighted anomaly scoring
- Offline ML training pipeline with scikit-learn
- Beginner-friendly TypeScript backend inference layer

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript |
| ML Pipeline | Python, pandas, scikit-learn |
| Model | RandomForestClassifier |
| Dataset | AI4I 2020 Predictive Maintenance Dataset |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## ML Pipeline

The ML pipeline lives in `ml/train_model.py`.

It trains a simple `RandomForestClassifier` offline using these sensor features:

- Air temperature
- Process temperature
- Rotational speed
- Torque
- Tool wear

The target column is `Machine failure`.

After training, the script exports model statistics to:

```text
backend/src/model/anomalyModel.json
```

The exported JSON includes:

- Model metadata
- Feature statistics: mean, standard deviation, min, max
- Feature importance
- Basic scoring parameters
- Evaluation output from the offline training run

Python is not used during API requests. At runtime, the Node.js backend reads the exported JSON and performs lightweight scoring in TypeScript.

### Runtime Scoring

The backend calculates anomaly risk by:

1. Comparing each live sensor value against the exported feature mean and standard deviation.
2. Calculating a z-score style deviation for each feature.
3. Weighting each feature score using exported feature importance.
4. Adding extra signal when the dataset row has a machine failure label.
5. Producing `status`, `anomalyScore`, `healthScore`, and `riskFactors`.

This keeps inference simple, explainable, and easy to run on a normal Node.js API server.

## System Architecture

```text
AI4I CSV Dataset
      |
      | offline training
      v
Python ML Pipeline
      |
      | exports model statistics
      v
backend/src/model/anomalyModel.json
      |
      | read at backend startup/runtime
      v
Node.js + Express API
      |
      | REST polling
      v
Next.js Dashboard
      |
      | visualizes
      v
Sensor Cards, Trend Charts, ML Insights, Alerts
```

## Local Development

Install dependencies separately for each app.

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend URL:

```text
http://localhost:4000
```

Build and run production backend locally:

```bash
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

### Offline ML Training

```bash
cd ml
pip install -r requirements.txt
python train_model.py
```

This regenerates:

```text
backend/src/model/anomalyModel.json
```

## Environment Variables

### Backend

Create `backend/.env` for local development:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
```

`backend/.env.example` is included as a reference.

### Frontend

Create `frontend/.env.local` when the backend URL is not the default:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## Deployment

### Backend on Render

Deploy the backend as a Render Web Service.

```text
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

Render environment variables:

```text
FRONTEND_URL=https://anomaly-detection-two.vercel.app
```

Render provides `PORT` automatically.

### Frontend on Vercel

Deploy the frontend as a Vercel project.

```text
Root Directory: frontend
Build Command: npm run build
```

Vercel environment variables:

```text
NEXT_PUBLIC_BACKEND_URL=https://anomaly-detection-ev0a.onrender.com
```

## API Endpoints

Base URL:

```text
http://localhost:4000
```

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | API health check and dataset load count |
| GET | `/api/sensors` | Returns a small list of enriched sensor rows |
| GET | `/api/sensors/latest` | Returns the latest enriched sensor row |
| GET | `/api/sensors/stream` | Returns one enriched row at a time for polling simulation |

Example anomaly response shape:

```json
{
  "anomaly": {
    "status": "normal",
    "anomalyScore": 12,
    "healthScore": 88,
    "riskFactors": []
  }
}
```

## Future Improvements

- Add frontend screenshot and demo GIF
- Add API response examples for warning and anomaly cases
- Add lightweight backend tests for dataset loading and anomaly scoring
- Add frontend component tests for dashboard states
- Add frontend deployment configuration notes after Vercel setup
- Add model version metadata to exported ML statistics
- Improve alert filtering and dashboard controls

