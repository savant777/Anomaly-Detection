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
        status: "normal" | "warning" | "anomaly";
        anomalyScore: number;
        healthScore: number;
        riskFactors: Array<{
            feature: string;
            value: number;
            zScore: number;
            importance: number;
            contribution: number;
        }>;
    };
}

const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function fetchStreamSensor(): Promise<SensorRecord> {
    const response = await fetch(`${backendUrl}/api/sensors/stream`);

    if (!response.ok) {
        throw new Error("Failed to fetch streamed sensor data");
    }

    return response.json() as Promise<SensorRecord>;
}
