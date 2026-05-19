# IoT Anomaly Detection Dashboard

Beginner-friendly portfolio project for simulating an IoT machine monitoring dashboard and detecting machine anomalies from sensor data.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Recharts
- Backend: Node.js, Express, TypeScript
- Dataset: AI4I 2020 Predictive Maintenance Dataset

## Project Structure

```text
.
├── backend/
├── data/
│   └── ai4i2020.csv
├── frontend/
├── .gitignore
└── README.md
```

## Run Locally

Install dependencies separately for each app.

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:4000`.

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Current Status

Step 1 initializes the project scaffold only. Dataset loading, anomaly detection, dashboard charts, and simulated realtime polling will be added in later steps.

