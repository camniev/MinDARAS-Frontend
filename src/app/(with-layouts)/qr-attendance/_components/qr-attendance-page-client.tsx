"use client";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { INITIAL_REGISTRATIONS, Registration } from "@/utils/event-pulse-data";
import { useState } from "react";
import { toast } from "sonner";
import ScanResultCard, { ScanResult } from "./scan-result-card";
import Scanner from "./scanner";

export default function QrAttendancePageClient() {
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [result, setResult] = useState<ScanResult>({ kind: "empty" });

  function handleScan(decodedText: string) {
    const code = decodedText.trim();
    const match = registrations.find((r) => r.ticketCode === code);

    if (!match) {
      setResult({ kind: "invalid", code });
      toast.error("Invalid ticket code", { description: code });
      return;
    }

    if (match.status === "Checked-In") {
      setResult({ kind: "already-checked-in", registration: match });
      toast.warning("Already checked in", { description: match.attendee });
      return;
    }

    const checkInTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updated: Registration = { ...match, status: "Checked-In", checkInTime };

    setRegistrations((prev) => prev.map((r) => (r.id === match.id ? updated : r)));
    setResult({ kind: "success", registration: updated });
    toast.success("Checked in", { description: `${match.attendee} — ${match.eventTitle}` });
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
            QR Attendance Scanner
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Scan participant ticket QR codes to record attendance live.
          </p>
        </div>

        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/", label: "Home" },
            { href: "/qr-attendance", label: "QR Attendance" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 px-2 md:grid-cols-2 lg:px-5">
        <Card className="space-y-4 p-6">
          <h2 className="text-lg leading-7 font-semibold text-text-primary">Camera</h2>
          <Scanner onScan={handleScan} />
          <p className="text-xs text-text-tertiary">
            Tip: try scanning a ticket QR that encodes one of the codes from your Registration
            List, e.g. <span className="font-mono">TS2026-8821</span>.
          </p>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg leading-7 font-semibold text-text-primary">Last Scanned Ticket</h2>
          <ScanResultCard result={result} />
        </Card>
      </div>
    </div>
  );
}
