import cors from "cors";
import express from "express";
import { AnomalyService } from "./services/anomalyService";
import { createDatasetService } from "./services/datasetService";

const app = express();
const port = process.env.PORT ?? 4000;
const datasetService = createDatasetService();
const anomalyService = new AnomalyService();

datasetService.load();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "iot-anomaly-backend",
        recordsLoaded: datasetService.getTotalCount()
    });
});

app.get("/api/sensors", (req, res) => {
    const limit = Number(req.query.limit ?? 20);
    const sensors = datasetService.getSensors(limit);

    res.json({
        count: datasetService.getTotalCount(),
        data: anomalyService.enrichMany(sensors)
    });
});

app.get("/api/sensors/latest", (_req, res) => {
    const sensor = datasetService.getLatestSensor();

    if (!sensor) {
        res.status(404).json({ message: "No sensor records found" });
        return;
    }

    res.json(anomalyService.enrich(sensor));
});

app.get("/api/sensors/stream", (_req, res) => {
    const sensor = datasetService.getNextStreamSensor();

    if (!sensor) {
        res.status(404).json({ message: "No sensor records found" });
        return;
    }

    res.json(anomalyService.enrich(sensor));
});

app.use((_req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.listen(port, () => {
    console.log(`Backend API running on http://localhost:${port}`);
});
