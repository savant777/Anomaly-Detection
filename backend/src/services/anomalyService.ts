import type {
    AnomalyResult,
    EnrichedSensorRecord,
    SensorRecord
} from "../types/sensor";

const MAX_SCORE = 100;
const ANOMALY_THRESHOLD = 50;

export class AnomalyService {
    analyze(record: SensorRecord): AnomalyResult {
        let score = 0;

        // มี label จาก dataset ว่า machine failure
        if (record.machineFailure) {
            score += 55;
        }

        // ค่า tool waer สูง หมายถึงใช้งานนานเกิน
        if (record.toolWearMin >= 200) {
            score += 20;
        } else if (record.toolWearMin >= 150) {
            score += 10;
        }

        // ค่า torque สูง หมายถึงความเครียดของเครื่องจักรมาก
        if (record.torqueNm >= 60) {
            score += 20;
        } else if (record.torqueNm >= 50) {
            score += 10;
        }

        // ค่า rotation speed ที่สูงหรือต่ำเกินถือว่าผิดปกติ
        if (
            record.rotationalSpeedRpm < 1200 ||
            record.rotationalSpeedRpm > 2500
        ) {
            score += 15;
        }

        const temperatureGap =
            record.processTemperatureK - record.airTemperatureK;

        // ความแตกต่างระหว่าง process temp กับ air temp ถ้ามากเกินไปแปลว่าเครื่องจักรร้อนเกิน
        if (temperatureGap >= 12) {
            score += 10;
        }

        const anomalyScore = Math.min(score, MAX_SCORE);
        const healthScore = MAX_SCORE - anomalyScore;

        return {
            status:
                anomalyScore >= ANOMALY_THRESHOLD ? "anomaly" : "normal",
            anomalyScore,
            healthScore
        };
    }

    enrich(record: SensorRecord): EnrichedSensorRecord {
        return {
            ...record,
            anomaly: this.analyze(record)
        };
    }

    enrichMany(records: SensorRecord[]): EnrichedSensorRecord[] {
        return records.map((record) => this.enrich(record));
    }
}
