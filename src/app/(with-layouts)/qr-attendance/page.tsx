import type { Metadata } from "next";
import QrAttendancePageClient from "./_components/qr-attendance-page-client";

export const metadata: Metadata = {
  title: "QR Attendance",
};

export default function QrAttendancePage() {
  return <QrAttendancePageClient />;
}
