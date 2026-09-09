"use client";

import { ScanResult } from "@/utils/mindaras-api-types";
import { CheckCircle1, InfoCircle, Search1 } from "@tailgrids/icons";

type Props = {
  result: ScanResult | null; // null = nothing scanned yet this session
};

export default function ScanResultCard({ result }: Props) {
  if (!result) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-card-border p-6 text-center">
        <Search1 className="mx-auto size-10 text-text-tertiary/50" />
        <p className="text-sm text-text-tertiary">Awaiting scan input...</p>
      </div>
    );
  }

  if (result.result === "invalid") {
    return (
      <div className="space-y-2 rounded-xl border border-badge-error-background bg-badge-error-background/60 p-6 text-center">
        <InfoCircle className="mx-auto size-10 text-badge-error-icon-color" />
        <h4 className="font-bold text-badge-error-text">Invalid Ticket Code</h4>
        <p className="text-xs text-badge-error-text/80">This QR code doesn&apos;t match any registration.</p>
      </div>
    );
  }

  if (result.result === "already-checked-in") {
    return (
      <div className="space-y-2 rounded-xl border border-badge-warning-background bg-badge-warning-background/60 p-6 text-center">
        <InfoCircle className="mx-auto size-10 text-badge-warning-icon-color" />
        <h4 className="font-bold text-badge-warning-text">Already Checked In</h4>
        <p className="text-xs text-badge-warning-text/80">{result.attendeeName}</p>
        <p className="font-mono text-xs text-badge-warning-text/70">
          {result.participantCode} &bull;{" "}
          {result.checkInTime ? new Date(result.checkInTime).toLocaleTimeString() : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-badge-success-background bg-badge-success-background/60 p-6 text-center">
      <CheckCircle1 className="mx-auto size-10 text-badge-success-icon-color" />
      <h4 className="font-bold text-badge-success-text">Check-In Successful</h4>
      <p className="text-sm font-medium text-badge-success-text/90">{result.attendeeName}</p>
      <p className="text-xs text-badge-success-text/70">{result.eventName}</p>
      <p className="font-mono text-xs text-badge-success-text/70">{result.participantCode}</p>
    </div>
  );
}