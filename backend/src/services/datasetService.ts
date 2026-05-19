import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { SensorRecord } from "../types/sensor";

type CsvSensorRow = Record<string, string>;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class DatasetService {
    private records: SensorRecord[] = [];
    private streamIndex = 0;

    constructor(private readonly csvPath: string) {}

    load(): void {
        const csvContent = readFileSync(this.csvPath, "utf-8");

        const rows = parse(csvContent, {
            bom: true,
            columns: true,
            skip_empty_lines: true,
            trim: true
        }) as CsvSensorRow[];

        this.records = rows.map((row) => this.mapCsvRowToSensorRecord(row));
    }

    getTotalCount(): number {
        return this.records.length;
    }

    getSensors(limit = DEFAULT_LIMIT): SensorRecord[] {
        const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
        return this.records.slice(0, safeLimit);
    }

    getLatestSensor(): SensorRecord | undefined {
        return this.records.at(-1);
    }

    getNextStreamSensor(): SensorRecord | undefined {
        if (this.records.length === 0) {
            return undefined;
        }

        const record = this.records[this.streamIndex];
        this.streamIndex = (this.streamIndex + 1) % this.records.length;

        return record;
    }

    private mapCsvRowToSensorRecord(row: CsvSensorRow): SensorRecord {
        return {
            udi: this.toNumber(row["UDI"]),
            productId: row["Product ID"],
            type: row["Type"],
            airTemperatureK: this.toNumber(row["Air temperature [K]"]),
            processTemperatureK: this.toNumber(row["Process temperature [K]"]),
            rotationalSpeedRpm: this.toNumber(row["Rotational speed [rpm]"]),
            torqueNm: this.toNumber(row["Torque [Nm]"]),
            toolWearMin: this.toNumber(row["Tool wear [min]"]),
            machineFailure: this.toBoolean(row["Machine failure"]),
            failureTypes: {
                twf: this.toBoolean(row["TWF"]),
                hdf: this.toBoolean(row["HDF"]),
                pwf: this.toBoolean(row["PWF"]),
                osf: this.toBoolean(row["OSF"]),
                rnf: this.toBoolean(row["RNF"])
            }
        };
    }

    private toNumber(value: string): number {
        const parsedValue = Number(value);

        if (Number.isNaN(parsedValue)) {
            throw new Error(`Invalid number in dataset: ${value}`);
        }

        return parsedValue;
    }

    private toBoolean(value: string): boolean {
        return value === "1";
    }
}

export function createDatasetService(): DatasetService {
    const datasetPath =
        process.env.DATASET_PATH ??
        path.resolve(process.cwd(), "../data/ai4i2020.csv");

    return new DatasetService(datasetPath);
}
