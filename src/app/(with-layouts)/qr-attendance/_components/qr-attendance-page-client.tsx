"use client";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { scanTicket } from "@/lib/attendance";
import { ApiError } from "@/lib/api-client";
import { ScanResult } from "@/utils/mindaras-api-types";
import { useRef, useState } from "react";
import { toast } from "sonner";
import ScanResultCard from "./scan-result-card";
import Scanner, { ScannerHandle } from "./scanner";

// TODO: replace with real authenticated user id once auth is wired up
const CURRENT_USER_ID = "C035AF19-1469-4EC9-84C3-5E095B8602B0";

export default function QrAttendancePageClient() {
  const scannerRef = useRef<ScannerHandle>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleScan(decodedText: string) {
    setIsProcessing(true);
    try {
      const scanResult = await scanTicket(decodedText.trim(), CURRENT_USER_ID);
      setResult(scanResult);

      if (scanResult.result === "success") {
        toast.success("Checked in", { description: `${scanResult.attendeeName} — ${scanResult.eventName}` });
      } else if (scanResult.result === "already-checked-in") {
        toast.warning("Already checked in", { description: scanResult.attendeeName ?? undefined });
      } else {
        toast.error("Invalid ticket code");
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't reach the server.";
      setResult({
        result: "invalid",
        attendeeName: null,
        attendeeEmail: null,
        eventName: null,
        participantCode: null,
        checkInTime: null,
      });
      toast.error("Scan failed", { description: message });
    } finally {
      setIsProcessing(false);
    }
  }

  function handleScanNext() {
    setResult(null);
    scannerRef.current?.resume();
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
          <Scanner ref={scannerRef} onScan={handleScan} />
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg leading-7 font-semibold text-text-primary">Last Scanned Ticket</h2>
          <ScanResultCard result={isProcessing ? null : result} />
          {result && (
            <Button onClick={handleScanNext} className="w-full py-2.5" isDisabled={isProcessing}>
              Scan Next Ticket
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}