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

