import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
    AnomalyResult,
    EnrichedSensorRecord,
    RiskFactor,
    SensorRecord
} from "../types/sensor";

type FeatureName =
    | "airTemperatureK"
    | "processTemperatureK"
    | "rotationalSpeedRpm"
    | "torqueNm"
    | "toolWearMin";

interface FeatureStatistics {
    mean: number;
    std: number;
    min: number;
    max: number;
}

type FeatureStatisticsMap = Record<FeatureName, FeatureStatistics>;
type FeatureImportanceMap = Record<FeatureName, number>;

interface ExportedAnomalyModel {
    metadata?: {
        modelType?: string;
    };
    featureStatistics?: Partial<Record<FeatureName, FeatureStatistics>>;
    featureImportance?: Partial<Record<FeatureName, number>>;
    scoringParameters?: {
        anomalyScoreThreshold?: number;
        zScoreWarningThreshold?: number;
        zScoreCriticalThreshold?: number;
    };
}

const MAX_SCORE = 100;
const DEFAULT_ANOMALY_SCORE_THRESHOLD = 50;

const FEATURE_LABELS: Record<FeatureName, string> = {
    airTemperatureK: "Air temperature",
    processTemperatureK: "Process temperature",
    rotationalSpeedRpm: "Rotational speed",
    torqueNm: "Torque",
    toolWearMin: "Tool wear"
};

const FALLBACK_FEATURE_STATISTICS: FeatureStatisticsMap = {
    airTemperatureK: { mean: 300.0049, std: 2.0003, min: 295.3, max: 304.5 },
    processTemperatureK: {
        mean: 310.0056,
        std: 1.4837,
        min: 305.7,
        max: 313.8
    },
    rotationalSpeedRpm: {
        mean: 1538.7761,
        std: 179.2841,
        min: 1168,
        max: 2886
    },
    torqueNm: { mean: 39.9869, std: 9.9689, min: 3.8, max: 76.6 },
    toolWearMin: { mean: 107.951, std: 63.6541, min: 0, max: 253 }
};

const FALLBACK_FEATURE_IMPORTANCE: FeatureImportanceMap = {
    airTemperatureK: 0.092968,
    processTemperatureK: 0.058584,
    rotationalSpeedRpm: 0.31326,
    torqueNm: 0.320186,
    toolWearMin: 0.215002
};

const FALLBACK_MODEL: ExportedAnomalyModel = {
    metadata: {
        modelType: "FallbackStatistics"
    },
    featureStatistics: FALLBACK_FEATURE_STATISTICS,
    featureImportance: FALLBACK_FEATURE_IMPORTANCE,
    scoringParameters: {
        anomalyScoreThreshold: DEFAULT_ANOMALY_SCORE_THRESHOLD,
        zScoreWarningThreshold: 2,
        zScoreCriticalThreshold: 3
    }
};

export class AnomalyService {
    private readonly model: ExportedAnomalyModel;

    private loadModel(): ExportedAnomalyModel {
        const modelPath = path.resolve(
            process.cwd(),
            "src/model/anomalyModel.json"
        );

        if (!existsSync(modelPath)) {
            return FALLBACK_MODEL;
        }

        try {
            return JSON.parse(readFileSync(modelPath, "utf-8")) as ExportedAnomalyModel;
        } catch {
            return FALLBACK_MODEL;
        }
    }

    constructor() {
        this.model = this.loadModel();
    }

    private getFeatureStatistics(feature: FeatureName): FeatureStatistics {
        return (
            this.model.featureStatistics?.[feature] ??
            FALLBACK_FEATURE_STATISTICS[feature]
        );
    }

    private getNormalizedImportanceWeights(): Record<FeatureName, number> {
        const rawWeights: Record<FeatureName, number> = {
            airTemperatureK:
                this.model.featureImportance?.airTemperatureK ??
                FALLBACK_FEATURE_IMPORTANCE.airTemperatureK,
            processTemperatureK:
                this.model.featureImportance?.processTemperatureK ??
                FALLBACK_FEATURE_IMPORTANCE.processTemperatureK,
            rotationalSpeedRpm:
                this.model.featureImportance?.rotationalSpeedRpm ??
                FALLBACK_FEATURE_IMPORTANCE.rotationalSpeedRpm,
            torqueNm:
                this.model.featureImportance?.torqueNm ??
                FALLBACK_FEATURE_IMPORTANCE.torqueNm,
            toolWearMin:
                this.model.featureImportance?.toolWearMin ??
                FALLBACK_FEATURE_IMPORTANCE.toolWearMin
        };
        const totalWeight = Object.values(rawWeights).reduce(
            (total, weight) => total + weight,
            0
        );

        if (totalWeight === 0) {
            return {
                airTemperatureK: 0.2,
                processTemperatureK: 0.2,
                rotationalSpeedRpm: 0.2,
                torqueNm: 0.2,
                toolWearMin: 0.2
            };
        }

        return {
            airTemperatureK: rawWeights.airTemperatureK / totalWeight,
            processTemperatureK: rawWeights.processTemperatureK / totalWeight,
            rotationalSpeedRpm: rawWeights.rotationalSpeedRpm / totalWeight,
            torqueNm: rawWeights.torqueNm / totalWeight,
            toolWearMin: rawWeights.toolWearMin / totalWeight
        };
    }

    private getStatus(
        anomalyScore: number,
        anomalyScoreThreshold: number
    ): "normal" | "warning" | "anomaly" {
        if (anomalyScore >= anomalyScoreThreshold) {
            return "anomaly";
        }

        if (anomalyScore >= anomalyScoreThreshold * 0.6) {
            return "warning";
        }

        return "normal";
    }

    private calculateZScore(value: number, statistics: FeatureStatistics): number {
        const standardDeviation = statistics.std || 1;
        const zScore = Math.abs(value - statistics.mean) / standardDeviation;
        const outsideTrainingRange =
            value < statistics.min || value > statistics.max ? 1 : 0;

        return zScore + outsideTrainingRange;
    }

    private calculateFeatureScores(
        record: SensorRecord,
        criticalThreshold: number
    ): RiskFactor[] {
        const featureValues: Record<FeatureName, number> = {
            airTemperatureK: record.airTemperatureK,
            processTemperatureK: record.processTemperatureK,
            rotationalSpeedRpm: record.rotationalSpeedRpm,
            torqueNm: record.torqueNm,
            toolWearMin: record.toolWearMin
        };
        const importanceWeights = this.getNormalizedImportanceWeights();

        return Object.entries(featureValues).map(([feature, value]) => {
            const featureName = feature as FeatureName;
            const statistics = this.getFeatureStatistics(featureName);
            const zScore = this.calculateZScore(value, statistics);
            const featureScore = Math.min(zScore / criticalThreshold, 1) * MAX_SCORE;
            const importance = importanceWeights[featureName];

            return {
                feature: FEATURE_LABELS[featureName],
                value,
                zScore: Number(zScore.toFixed(2)),
                importance: Number(importance.toFixed(4)),
                contribution: Number((featureScore * importance).toFixed(2))
            };
        });
    }

    analyze(record: SensorRecord): AnomalyResult {
        const zScoreWarningThreshold =
            this.model.scoringParameters?.zScoreWarningThreshold ??
            FALLBACK_MODEL.scoringParameters?.zScoreWarningThreshold ??
            2;
        const zScoreCriticalThreshold =
            this.model.scoringParameters?.zScoreCriticalThreshold ??
            FALLBACK_MODEL.scoringParameters?.zScoreCriticalThreshold ??
            3;
        const anomalyScoreThreshold =
            this.model.scoringParameters?.anomalyScoreThreshold ??
            DEFAULT_ANOMALY_SCORE_THRESHOLD;

        const featureScores = this.calculateFeatureScores(
            record,
            zScoreCriticalThreshold
        );
        const weightedSensorScore = featureScores.reduce(
            (total, factor) => total + factor.contribution,
            0
        );

        const labelScore = record.machineFailure ? 35 : 0;
        const anomalyScore = Math.min(
            Math.round(weightedSensorScore + labelScore),
            MAX_SCORE
        );
        const healthScore = MAX_SCORE - anomalyScore;

        return {
            status: this.getStatus(anomalyScore, anomalyScoreThreshold),
            anomalyScore,
            healthScore,
            riskFactors: featureScores
                .filter((factor) => factor.zScore >= zScoreWarningThreshold)
                .sort((a, b) => b.contribution - a.contribution)
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
