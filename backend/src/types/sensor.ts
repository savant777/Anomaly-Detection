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
    failureTypes: {
        twf: boolean;
        hdf: boolean;
        pwf: boolean;
        osf: boolean;
        rnf: boolean;
    };
}

export type AnomalyStatus = "normal" | "warning" | "anomaly";

export interface RiskFactor {
    feature: string;
    value: number;
    zScore: number;
    importance: number;
    contribution: number;
}

export interface AnomalyResult {
    status: AnomalyStatus;
    anomalyScore: number;
    healthScore: number;
    riskFactors: RiskFactor[];
}

export interface EnrichedSensorRecord extends SensorRecord {
    anomaly: AnomalyResult;
}
