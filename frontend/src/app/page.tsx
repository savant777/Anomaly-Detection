"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

type StatusTone = "green" | "amber" | "red" | "blue";

interface SummaryCardData {
    label: string;
    value: string;
    helper: string;
    tone: StatusTone;
}

interface SensorReading {
    label: string;
    value: string;
    unit: string;
    helper: string;
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

const latestSensor = {
    timestamp: "2026-05-20 02:24",
    machineStatus: "Normal",
    healthScore: 88,
    anomalyScore: 12,
    readings: [
        {
            label: "Air temperature",
            value: "299.1",
            unit: "K",
            helper: "อุณหภูมิรอบเครื่องจักร"
        },
        {
            label: "Process temperature",
            value: "309.4",
            unit: "K",
            helper: "ความร้อนขณะเครื่องทำงาน"
        },
        {
            label: "Rotational speed",
            value: "1,482",
            unit: "rpm",
            helper: "ความเร็วรอบของเพลา"
        },
        {
            label: "Torque",
            value: "42.8",
            unit: "Nm",
            helper: "ภาระโหลดเชิงกล"
        },
        {
            label: "Tool wear",
            value: "64",
            unit: "min",
            helper: "เวลาการใช้งานสะสม"
        }
    ] satisfies SensorReading[]
};

const summaryCards: SummaryCardData[] = [
    {
        label: "Machine status",
        value: latestSensor.machineStatus,
        helper: "สถานะเครื่องจักร",
        tone: "green"
    },
    {
        label: "Health score",
        value: `${latestSensor.healthScore}%`,
        helper: "คะแนนสุขภาพ ประเมินจากกฎพื้นฐาน",
        tone: "blue"
    },
    {
        label: "Anomaly score",
        value: `${latestSensor.anomalyScore}%`,
        helper: "คะแนนความผิดปกติ",
        tone: "amber"
    },
    {
        label: "Latest timestamp",
        value: latestSensor.timestamp,
        helper: "เวลาจำลองของข้อมูล",
        tone: "red"
    }
];

const sensorHistory: SensorHistoryPoint[] = [
    {
        time: "01:40",
        airTemperature: 298.6,
        processTemperature: 308.8,
        rotationalSpeed: 1460,
        torque: 41.1,
        toolWear: 58
    },
    {
        time: "01:50",
        airTemperature: 298.8,
        processTemperature: 309.0,
        rotationalSpeed: 1498,
        torque: 43.2,
        toolWear: 59
    },
    {
        time: "02:00",
        airTemperature: 299.0,
        processTemperature: 309.2,
        rotationalSpeed: 1510,
        torque: 46.8,
        toolWear: 61
    },
    {
        time: "02:10",
        airTemperature: 299.2,
        processTemperature: 309.6,
        rotationalSpeed: 1442,
        torque: 51.6,
        toolWear: 62
    },
    {
        time: "02:20",
        airTemperature: 299.1,
        processTemperature: 309.4,
        rotationalSpeed: 1482,
        torque: 42.8,
        toolWear: 64
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

const mockAlerts: AlertItem[] = [
    {
        id: 1,
        time: "02:18",
        title: "แรงบิดสูงกว่าช่วงปกติ",
        detail: "เครื่อง M14860 รายงานค่า 51.6 Nm ระหว่างโหลดเพิ่มชั่วคราว",
        severity: "warning"
    },
    {
        id: 2,
        time: "01:52",
        title: "แนวโน้ม Tool wear สูง",
        detail: "รอบก่อนหน้าพบค่า tool wear สูงถึง 190 นาที",
        severity: "warning"
    },
    {
        id: 3,
        time: "01:25",
        title: "พบ machine failure flag",
        detail: "ข้อมูลย้อนหลังมี failure label ที่ควรตรวจสอบ",
        severity: "critical"
    }
];

const toneStyles: Record<StatusTone, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700"
};

function SummaryCard({ card }: { card: SummaryCardData }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${toneStyles[card.tone]}`}
            >
                {card.label}
            </div>
            <p className="mt-4 text-2xl font-semibold text-slate-950">
                {card.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{card.helper}</p>
        </article>
    );
}

function SensorCard({ reading }: { reading: SensorReading }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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

function SensorTrendChart({ chart }: { chart: TrendChartConfig }) {
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
                        data={sensorHistory}
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
                            dot={{ r: 3 }}
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
        alert.severity === "critical" ? "Critical" : "Warning";

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
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <header className="border-b border-slate-200 pb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                        IoT Machine Monitoring
                    </p>
                    <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="text-4xl font-semibold text-slate-950">
                                Anomaly Detection Dashboard
                            </h1>
                            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                                หน้าจอติดตามสถานะเครื่องจักรจากข้อมูลเซนเซอร์
                                พร้อมคะแนนสุขภาพ สัญญาณความผิดปกติ
                                และรายการแจ้งเตือนล่าสุด
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                            Mock data mode
                        </div>
                    </div>
                </header>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
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
                                ค่าจำลองล่าสุดจากระบบติดตามเครื่องจักร
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {latestSensor.readings.map((reading) => (
                            <SensorCard
                                key={reading.label}
                                reading={reading}
                            />
                        ))}
                    </div>
                </section>

                <section className="mt-8">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">
                                Sensor Trends
                            </h2>
                            <p className="text-sm text-slate-500">
                                ข้อมูลย้อนหลังจำลองสำหรับเตรียมหน้าจอก่อนเชื่อมต่อ API
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {trendCharts.map((chart) => (
                            <SensorTrendChart
                                key={chart.dataKey}
                                chart={chart}
                            />
                        ))}
                    </div>
                </section>

                <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">
                                Recent Anomaly Alerts
                            </h2>
                            <p className="text-sm text-slate-500">
                                รายการแจ้งเตือนจำลองสำหรับออกแบบหน้าจอก่อนเชื่อมต่อ
                                API
                            </p>
                        </div>
                    </div>
                    <ul className="mt-2">
                        {mockAlerts.map((alert) => (
                            <AlertRow key={alert.id} alert={alert} />
                        ))}
                    </ul>
                </section>
            </div>
        </main>
    );
}
