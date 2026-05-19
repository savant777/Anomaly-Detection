import cors from "cors";
import express from "express";
import { createDatasetService } from "./services/datasetService";

const app = express();
const port = process.env.PORT ?? 4000;
const datasetService = createDatasetService();

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

    res.json({
        count: datasetService.getTotalCount(),
        data: datasetService.getSensors(limit)
    });
});

app.get("/api/sensors/latest", (_req, res) => {
    const sensor = datasetService.getLatestSensor();

    if (!sensor) {
        res.status(404).json({ message: "No sensor records found" });
        return;
    }

    res.json(sensor);
});

app.get("/api/sensors/stream", (_req, res) => {
    const sensor = datasetService.getNextStreamSensor();

    if (!sensor) {
        res.status(404).json({ message: "No sensor records found" });
        return;
    }

    res.json(sensor);
});

app.use((_req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.listen(port, () => {
    console.log(`Backend API running on http://localhost:${port}`);
});
