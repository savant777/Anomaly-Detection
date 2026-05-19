import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "IoT Anomaly Detection",
    description: "Machine monitoring dashboard portfolio project"
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th">
            <body>{children}</body>
        </html>
    );
}

