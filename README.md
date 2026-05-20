# IoT Anomaly Detection Dashboard

Beginner-friendly portfolio project for simulating an IoT machine monitoring dashboard and detecting machine anomalies from sensor data.

The project uses a JavaScript/TypeScript stack and keeps the implementation intentionally lightweight: simple REST APIs, in-memory dataset loading, and rule-based anomaly scoring.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Recharts
- Backend: Node.js, Express, TypeScript
- CSV parsing: csv-parse
- Offline ML: Python, pandas, scikit-learn
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
|       |-- model/
|       |   `-- anomalyModel.json
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
|-- ml/
|   |-- requirements.txt
|   `-- train_model.py
|-- .gitignore
`-- README.md
```

## Current Features

- Displays a responsive frontend dashboard with streamed sensor data
- Shows summary cards for machine status, health score, anomaly score, and latest timestamp
- Shows current sensor readings for temperature, rotational speed, torque, and tool wear
- Shows recent anomaly alerts generated from streamed anomaly rows
- Shows sensor trend charts with Recharts using streamed data
- Loads the existing `data/ai4i2020.csv` file in the backend
- Parses CSV data safely with `csv-parse`
- Stores sensor records in memory
- Exposes basic REST APIs for sensor data
- Simulates realtime polling by returning one sensor row at a time
- Adds lightweight rule-based anomaly detection
- Returns anomaly status, anomaly score, and machine health score with sensor rows
- Includes an offline Python ML training script that exports model statistics to JSON

## Frontend Dashboard

The frontend connects to the backend with simple polling. It does not use WebSockets.

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

## Offline ML Pipeline

The main application runtime stays JavaScript/TypeScript-based. Python is used only for offline training and analysis.

The training script is:

```text
ml/train_model.py
```

It reads:

```text
data/ai4i2020.csv
```

It trains a simple `RandomForestClassifier` with these sensor features:

- Air temperature
- Process temperature
- Rotational speed
- Torque
- Tool wear

The target column is:

```text
Machine failure
```

Run the pipeline:

```bash
cd ml
pip install -r requirements.txt
python train_model.py
```

The script exports model statistics to:

```text
backend/src/model/anomalyModel.json
```

The exported JSON includes:

- Model metadata
- Evaluation metrics
- Feature statistics: mean, standard deviation, min, max
- Feature importance
- Simple scoring parameters for a future TypeScript inference layer

The backend does not run Python during requests. In a later step, the Node.js backend can read `anomalyModel.json` and use those statistics to improve the current rule-based anomaly scoring.

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

The backend uses lightweight TypeScript scoring at runtime. It reads exported statistics from:

```text
backend/src/model/anomalyModel.json
```

The backend does not run Python during API requests.

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
- Feature means and standard deviations
- Feature min and max training ranges
- Feature importance exported by the offline model
- Simple scoring parameters exported in JSON

The score is capped between `0` and `100`.

```text
healthScore = 100 - anomalyScore
```

The response can return:

```text
status: "normal" | "warning" | "anomaly"
```

If `anomalyScore` reaches the exported anomaly threshold, the row is marked as:

```text
status: "anomaly"
```

Lower scores are marked as `warning` or `normal` depending on the calculated risk.

The response also includes `riskFactors`, which show which sensor features contributed most to the score.


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
- Python is used only for offline ML training/export, not as an API server
