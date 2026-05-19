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
