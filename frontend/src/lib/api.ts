export interface SensorRecord {
    udi: number;
    productId: string;
    type: string;
    airTemperatureK: number;
    processTemperatureK: number;
    rotationalSpeedRpm: number;
    torqueNm: number;
    toolWearMin: number;
    machineFailure: boolean;
    anomaly: {
        status: "normal" | "anomaly";
        anomalyScore: number;
        healthScore: number;
    };
}

const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function fetchLatestSensor(): Promise<SensorRecord> {
    const response = await fetch(`${backendUrl}/api/sensors/latest`);

    if (!response.ok) {
        throw new Error("Failed to fetch latest sensor data");
    }

    return response.json() as Promise<SensorRecord>;
}

