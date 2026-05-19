# IoT Anomaly Detection Dashboard

Beginner-friendly portfolio project for simulating an IoT machine monitoring dashboard and detecting machine anomalies from sensor data.

The project uses a JavaScript/TypeScript stack and keeps the implementation intentionally lightweight: simple REST APIs, in-memory dataset loading, and rule-based anomaly scoring.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Recharts
- Backend: Node.js, Express, TypeScript
- CSV parsing: csv-parse
- Dataset: AI4I 2020 Predictive Maintenance Dataset

## Project Structure

```text
.
|-- backend/
|   |-- package.json
|   |-- tsconfig.json
|   `-- src/
|       |-- server.ts
|       |-- services/
|       |   |-- anomalyService.ts
|       |   `-- datasetService.ts
|       `-- types/
|           `-- sensor.ts
|-- data/
|   `-- ai4i2020.csv
|-- frontend/
|   |-- package.json
|   |-- tailwind.config.ts
|   |-- tsconfig.json
|   `-- src/
|       `-- app/
|           |-- globals.css
|           |-- layout.tsx
|           `-- page.tsx
|-- .gitignore
`-- README.md
```

## Current Features

- Displays a responsive frontend dashboard with mock sensor data
- Shows summary cards for machine status, health score, anomaly score, and latest timestamp
- Shows current sensor readings for temperature, rotational speed, torque, and tool wear
- Shows mock recent anomaly alerts
- Shows mock sensor trend charts with Recharts
- Loads the existing `data/ai4i2020.csv` file in the backend
- Parses CSV data safely with `csv-parse`
- Stores sensor records in memory
- Exposes basic REST APIs for sensor data
- Simulates realtime polling by returning one sensor row at a time
- Adds lightweight rule-based anomaly detection
- Returns anomaly status, anomaly score, and machine health score with sensor rows

## Frontend Dashboard

The frontend currently uses mock data only. It does not connect to the backend API yet.

Dashboard sections:

- Header with project title and short description
- Summary cards
- Current sensor readings
- Sensor trend charts
- Recent anomaly alerts

The trend charts are built with Recharts and cover:

- Air temperature
- Process temperature
- Rotational speed
- Torque
- Tool wear

## Backend API

The backend runs on `http://localhost:4000`.

### GET /health

Returns basic API status and the number of records loaded.

### GET /api/sensors

Returns a small list of enriched sensor rows.

Optional query:

```text
?limit=20
```

The API caps the limit to avoid returning too much data at once.

### GET /api/sensors/latest

Returns the latest sensor row from the dataset with anomaly information.

### GET /api/sensors/stream

Returns one sensor row per request. The backend moves forward through the dataset and loops back to the first row after the final row.

This is used to simulate realtime polling without WebSockets.

## Anomaly Detection

The backend uses a simple rule-based scoring system instead of a machine learning framework.

Each sensor row is enriched with:

```json
{
  "anomaly": {
    "status": "normal",
    "anomalyScore": 0,
    "healthScore": 100
  }
}
```

The anomaly score uses:

- Dataset `machineFailure` label
- Tool wear
- Torque
- Rotational speed
- Difference between process temperature and air temperature

The score is capped between `0` and `100`.

```text
healthScore = 100 - anomalyScore
```

If `anomalyScore >= 50`, the row is marked as:

```text
status: "anomaly"
```

Otherwise, it is marked as:

```text
status: "normal"
```

## Run Locally

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

Build backend:

```bash
npm run build
```

Start built backend:

```bash
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

## Development Notes

- No database is used yet
- No authentication is included
- No Docker, Redis, or WebSockets are included
- Dataset loading happens in memory when the backend starts
- The anomaly logic is intentionally simple and readable for junior developers
- The frontend still uses mock data and will connect to the backend API in a later step
