"use client";

import { useEffect, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { fetchStreamSensor, type SensorRecord } from "../lib/api";

type StatusTone = "green" | "amber" | "red" | "blue" | "purple";

interface SummaryCardData {
    label: string;
    value: string;
    helper: string;
    accent: StatusTone;
    valueTone?: StatusTone;
}

interface SensorReading {
    label: string;
    value: string;
    unit: string;
    helper: string;
    accent: StatusTone;
}

interface AlertItem {
    id: number;
    time: string;
    title: string;
    detail: string;
    severity: "warning" | "critical";
}

interface SensorHistoryPoint {
    time: string;
    airTemperature: number;
    processTemperature: number;
    rotationalSpeed: number;
    torque: number;
    toolWear: number;
}

interface TrendChartConfig {
    title: string;
    dataKey: keyof Omit<SensorHistoryPoint, "time">;
    unit: string;
    color: string;
}

const sensorReadingMetadata: Array<Omit<SensorReading, "value">> = [
    {
        label: "Air temperature",
        unit: "K",
        helper: "อุณหภูมิรอบเครื่องจักร",
        accent: "blue"
    },
    {
        label: "Process temperature",
        unit: "K",
        helper: "ความร้อนขณะเครื่องทำงาน",
        accent: "red"
    },
    {
        label: "Rotational speed",
        unit: "rpm",
        helper: "ความเร็วรอบของเพลา",
        accent: "green"
    },
    {
        label: "Torque",
        unit: "Nm",
        helper: "ภาระโหลดเชิงกล",
        accent: "amber"
    },
    {
        label: "Tool wear",
        unit: "min",
        helper: "เวลาการใช้งานสะสม",
        accent: "purple"
    }
];

const trendCharts: TrendChartConfig[] = [
    {
        title: "Air temperature",
        dataKey: "airTemperature",
        unit: "K",
        color: "#0284c7"
    },
    {
        title: "Process temperature",
        dataKey: "processTemperature",
        unit: "K",
        color: "#dc2626"
    },
    {
        title: "Rotational speed",
        dataKey: "rotationalSpeed",
        unit: "rpm",
        color: "#059669"
    },
    {
        title: "Torque",
        dataKey: "torque",
        unit: "Nm",
        color: "#d97706"
    },
    {
        title: "Tool wear",
        dataKey: "toolWear",
        unit: "min",
        color: "#7c3aed"
    }
];

const valueToneStyles: Record<StatusTone, string> = {
    amber: "text-amber-700",
    red: "text-rose-700",
    green: "text-emerald-700",
    blue: "text-sky-700",
    purple: "text-violet-700"
};

const AccentStyles: Record<StatusTone, string> = {
    green: "border-t-emerald-500",
    amber: "border-t-amber-500",
    red: "border-t-rose-500",
    blue: "border-t-sky-500",
    purple: "border-t-violet-500"
};

const POLLING_INTERVAL_MS = 5000;
const MAX_HISTORY_POINTS = 25;
const MAX_ALERTS = 5;

function mapSensorToHistoryPoint(sensor: SensorRecord): SensorHistoryPoint {
    return {
        time: `#${sensor.udi}`,
        airTemperature: sensor.airTemperatureK,
        processTemperature: sensor.processTemperatureK,
        rotationalSpeed: sensor.rotationalSpeedRpm,
        torque: sensor.torqueNm,
        toolWear: sensor.toolWearMin
    };
}

function createAnomalyAlert(sensor: SensorRecord): AlertItem {
    const topRiskFactor = sensor.anomaly.riskFactors[0];
    const riskContext = topRiskFactor
        ? `ปัจจัยหลักคือ ${topRiskFactor.feature} ค่า ${topRiskFactor.value}, z-score ${topRiskFactor.zScore}, contribution ${topRiskFactor.contribution}`
        : "ยังไม่มี risk factor หลักจากข้อมูลแถวนี้";

    return {
        id: sensor.udi,
        time: new Date().toLocaleTimeString(),
        title: `เครื่อง ${sensor.productId}`,
        detail: `คะแนนความผิดปกติ ${sensor.anomaly.anomalyScore}%, คะแนนสุขภาพ ${sensor.anomaly.healthScore}%. ${riskContext}`,
        severity: sensor.anomaly.status === "anomaly" ? "critical" : "warning"
    };
}

function SummaryCard({ card }: { card: SummaryCardData }) {
    return (
        <article
            className={`rounded-lg border border-t-4 border-slate-200 bg-white p-5 shadow-sm ${AccentStyles[card.accent]}`}
        >
            <p className="text-sm font-medium text-slate-500">
                {card.label}
            </p>
            <p
                className={`mt-4 text-2xl font-semibold ${card.valueTone ? valueToneStyles[card.valueTone] : "text-slate-950"}`}
            >
                {card.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{card.helper}</p>
        </article>
    );
}

function SensorCard({ reading }: { reading: SensorReading }) {
    return (
        <article
            className={`rounded-lg border border-t-4 border-slate-200 bg-white p-5 shadow-sm ${AccentStyles[reading.accent]}`}
        >
            <p className="text-sm font-medium text-slate-500">
                {reading.label}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-950">
                    {reading.value}
                </span>
                <span className="text-sm font-medium text-slate-500">
                    {reading.unit}
                </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{reading.helper}</p>
        </article>
    );
}

function MlModelInsight({ sensor }: { sensor: SensorRecord | null }) {
    const topRiskFactor = sensor?.anomaly.riskFactors[0];

    return (
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                        ML Model Insight
                    </h2>
                    <p className="text-sm text-slate-500">
                        ระบบวิเคราะห์ความเสี่ยงจากค่าเบี่ยงเบนของเซนเซอร์และค่าน้ำหนักจากโมเดล Machine Learning
                    </p>
                </div>
                <div className="text-sm font-medium text-slate-500">
                    {sensor ? `Dataset row #${sensor.udi}` : "Waiting for stream"}
                </div>
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">
                    Top contributor
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {topRiskFactor ? topRiskFactor.feature : "None"}
                </p>
                {topRiskFactor ? (
                    <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                        <span>Value {topRiskFactor.value}</span>
                        <span>z-score {topRiskFactor.zScore}</span>
                        <span>Weight {topRiskFactor.importance}</span>
                        <span>Contribution {topRiskFactor.contribution}</span>
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-slate-500">
                        ข้อมูลล่าสุดยังอยู่ในเกณฑ์ปกติ
                    </p>
                )}
            </div>

            {sensor && sensor.anomaly.riskFactors.length > 0 && (
                <div className="mt-5">
                    <h3 className="text-sm font-semibold text-slate-950">
                        Risk factors
                    </h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {sensor.anomaly.riskFactors.map((factor) => (
                            <div
                                key={factor.feature}
                                className="rounded-lg border border-slate-200 p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-950">
                                            {factor.feature}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Value {factor.value}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                                        +{factor.contribution}
                                    </span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-500">
                                    <span>z-score {factor.zScore}</span>
                                    <span>weight {factor.importance}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function SensorTrendChart({
    chart,
    data
}: {
    chart: TrendChartConfig;
    data: SensorHistoryPoint[];
}) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-950">
                    {chart.title}
                </h3>
                <span className="text-xs font-medium text-slate-400">
                    {chart.unit}
                </span>
            </div>
            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 8, right: 12, bottom: 0, left: -18 }}
                    >
                        <CartesianGrid
                            stroke="#e2e8f0"
                            strokeDasharray="3 3"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="time"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={48}
                        />
                        <Tooltip
                            formatter={(value) => [
                                `${value} ${chart.unit}`,
                                chart.title
                            ]}
                            contentStyle={{
                                borderRadius: "8px",
                                borderColor: "#e2e8f0"
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey={chart.dataKey}
                            stroke={chart.color}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
}

function AlertRow({ alert }: { alert: AlertItem }) {
    const severityStyle =
        alert.severity === "critical"
            ? "bg-rose-100 text-rose-700"
            : "bg-amber-100 text-amber-700";
    const severityLabel =
        alert.severity === "critical" ? "ผิดปกติ" : "เฝ้าระวัง";

    return (
        <li className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-950">
                        {alert.title}
                    </span>
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityStyle}`}
                    >
                        {severityLabel}
                    </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                    {alert.detail}
                </p>
            </div>
            <time className="text-sm font-medium text-slate-400">
                {alert.time}
            </time>
        </li>
    );
}

export default function Home() {
    const [sensor, setSensor] = useState<SensorRecord | null>(null);
    const [sensorHistory, setSensorHistory] = useState<SensorHistoryPoint[]>(
        []
    );
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadStreamSensor() {
            try {
                const streamedSensor = await fetchStreamSensor();

                if (!isMounted) {
                    return;
                }

                setSensor(streamedSensor);
                setSensorHistory((currentHistory) => [
                    ...currentHistory,
                    mapSensorToHistoryPoint(streamedSensor)
                ].slice(-MAX_HISTORY_POINTS));
                if (streamedSensor.anomaly.status !== "normal") {
                    setAlerts((currentAlerts) => {
                        const alreadyExists = currentAlerts.some(
                            (alert) => alert.id === streamedSensor.udi
                        );

                        if (alreadyExists) {
                            return currentAlerts;
                        }

                        return [
                            createAnomalyAlert(streamedSensor),
                            ...currentAlerts
                        ].slice(0, MAX_ALERTS);
                    });
                }
                setLastUpdated(new Date());
                setErrorMessage(null);
            } catch {
                if (isMounted) {
                    setErrorMessage("ไม่สามารถดึงข้อมูลเซนเซอร์ล่าสุดได้");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadStreamSensor();
        const intervalId = window.setInterval(
            loadStreamSensor,
            POLLING_INTERVAL_MS
        );

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, []);

    const currentReadings: SensorReading[] = sensor
        ? [
              {
                  ...sensorReadingMetadata[0],
                  value: sensor.airTemperatureK.toFixed(1),
              },
              {
                  ...sensorReadingMetadata[1],
                  value: sensor.processTemperatureK.toFixed(1),
              },
              {
                  ...sensorReadingMetadata[2],
                  value: sensor.rotationalSpeedRpm.toLocaleString(),
              },
              {
                  ...sensorReadingMetadata[3],
                  value: sensor.torqueNm.toFixed(1),
              },
              {
                  ...sensorReadingMetadata[4],
                  value: sensor.toolWearMin.toString(),
              }
          ]
        : sensorReadingMetadata.map((reading) => ({
              ...reading,
              value: isLoading ? "..." : "--"
          }));

    const dashboardSummaryCards: SummaryCardData[] = [
        {
            label: "Machine status",
            value: sensor
                ? sensor.anomaly.status === "anomaly"
                    ? "Anomaly"
                    : sensor.anomaly.status === "warning"
                      ? "Warning"
                      : "Normal"
                : isLoading
                  ? "Loading"
                  : "Unavailable",
            helper: sensor ? `สถานะเครื่องจักร ${sensor.productId}` : "กำลังเชื่อมต่อ API",
            accent: "green",
            valueTone:
                sensor?.anomaly.status === "anomaly"
                    ? "red"
                    : sensor?.anomaly.status === "warning"
                      ? "amber"
                    : errorMessage
                      ? "amber"
                      : undefined
        },
        {
            label: "Health score",
            value: sensor ? `${sensor.anomaly.healthScore}%` : "--",
            helper: "คะแนนสุขภาพ",
            accent: "blue"
        },
        {
            label: "Anomaly score",
            value: sensor ? `${sensor.anomaly.anomalyScore}%` : "--",
            helper: "คะแนนความผิดปกติ",
            accent: "amber",
            valueTone:
                sensor?.anomaly.status === "anomaly"
                    ? "red"
                    : sensor?.anomaly.status === "warning"
                      ? "amber"
                      : undefined
        },
        {
            label: "Latest timestamp",
            value: lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : isLoading
                  ? "Loading"
                  : "--",
            helper: sensor ? `Dataset row #${sensor.udi}` : "เวลาปัจจุบัน",
            accent: "red"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <header className="border-b border-slate-200 pb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                        IoT Machine Monitoring
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold text-slate-950">
                        Anomaly Detection Dashboard
                    </h1>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                        หน้าจอติดตามสถานะเครื่องจักรจากข้อมูลเซนเซอร์
                        พร้อมคะแนนสุขภาพ สัญญาณความผิดปกติ
                        และรายการแจ้งเตือนล่าสุด
                    </p>
                    {errorMessage ? (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            {errorMessage} Retrying every 5 seconds.
                        </div>
                    ) : null}
                </header>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {dashboardSummaryCards.map((card) => (
                        <SummaryCard key={card.label} card={card} />
                    ))}
                </section>

                <section className="mt-8">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">
                                Current Sensor Readings
                            </h2>
                            <p className="text-sm text-slate-500">
                                ข้อมูลล่าสุดจากระบบติดตามเครื่องจักร
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {trendCharts.map((chart, index) => (
                            <div key={chart.dataKey} className="space-y-4">
                                <SensorTrendChart chart={chart} data={sensorHistory} />
                                <SensorCard reading={currentReadings[index]} />
                            </div>
                        ))}
                    </div>
                </section>

                <MlModelInsight sensor={sensor} />

                <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">
                                Recent Anomaly Alerts
                            </h2>
                            <p className="text-sm text-slate-500">
                                รายการผิดปกติล่าสุดจากระบบติดตามเครื่องจักร
                            </p>
                        </div>
                    </div>
                    {alerts.length > 0 ? (
                        <ul className="mt-2">
                            {alerts.map((alert) => (
                                <AlertRow key={alert.id} alert={alert} />
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            ยังไม่พบสถานะเฝ้าระวังหรือผิดปกติจากข้อมูลที่ stream เข้ามา
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}
