import cors from "cors";
import express from "express";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "iot-anomaly-backend"
  });
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});

