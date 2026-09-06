"use client";

import { Registration } from "@/utils/event-pulse-data";
import { CheckCircle1, InfoCircle, Search1 } from "@tailgrids/icons";

export type ScanResult =
  | { kind: "empty" }
  | { kind: "success"; registration: Registration }
  | { kind: "already-checked-in"; registration: Registration }
  | { kind: "invalid"; code: string };

export default function ScanResultCard({ result }: { result: ScanResult }) {
  if (result.kind === "empty") {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-card-border p-6 text-center">
        <Search1 className="mx-auto size-10 text-text-tertiary/50" />
        <p className="text-sm text-text-tertiary">Awaiting scan input...</p>
      </div>
    );
  }

  if (result.kind === "invalid") {
    return (
      <div className="space-y-2 rounded-xl border border-badge-error-background bg-badge-error-background/60 p-6 text-center">
        <InfoCircle className="mx-auto size-10 text-badge-error-icon-color" />
        <h4 className="font-bold text-badge-error-text">Invalid Ticket Code</h4>
        <p className="font-mono text-xs text-badge-error-text/80">Code: {result.code}</p>
      </div>
    );
  }

  const { registration } = result;

  if (result.kind === "already-checked-in") {
    return (
      <div className="space-y-2 rounded-xl border border-badge-warning-background bg-badge-warning-background/60 p-6 text-center">
        <InfoCircle className="mx-auto size-10 text-badge-warning-icon-color" />
        <h4 className="font-bold text-badge-warning-text">Already Checked In</h4>
        <p className="text-xs text-badge-warning-text/80">{registration.attendee}</p>
        <p className="font-mono text-xs text-badge-warning-text/70">
          {registration.ticketCode} &bull; {registration.checkInTime}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-badge-success-background bg-badge-success-background/60 p-6 text-center">
      <CheckCircle1 className="mx-auto size-10 text-badge-success-icon-color" />
      <h4 className="font-bold text-badge-success-text">Check-In Successful</h4>
      <p className="text-sm font-medium text-badge-success-text/90">{registration.attendee}</p>
      <p className="text-xs text-badge-success-text/70">{registration.eventTitle}</p>
      <p className="font-mono text-xs text-badge-success-text/70">{registration.ticketCode}</p>
    </div>
  );
}
