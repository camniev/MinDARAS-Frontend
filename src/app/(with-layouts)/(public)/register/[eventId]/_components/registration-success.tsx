// src/app/(public)/register/[eventId]/_components/registration-success.tsx
"use client";

import { Card } from "@/components/tailgrids/core/card";
import { RegistrationConfirmation } from "@/utils/mindaras-api-types";
import { CheckCircle1 } from "@tailgrids/icons";
import { QRCodeSVG } from "qrcode.react";

export default function RegistrationSuccess({ confirmation }: { confirmation: RegistrationConfirmation }) {
  return (
    <Card className="space-y-4 p-8 text-center">
      <CheckCircle1 className="mx-auto size-12 text-badge-success-icon-color" />
      <div>
        <h1 className="text-xl leading-7 font-semibold text-text-primary">You&apos;re registered!</h1>
        <p className="mt-1 text-sm text-text-tertiary">{confirmation.eventName}</p>
      </div>

      <div className="flex justify-center py-4">
        <div className="rounded-xl border border-card-border bg-white p-4">
          <QRCodeSVG value={confirmation.qrCode} size={180} />
        </div>
      </div>

      <p className="font-mono text-sm text-text-secondary">{confirmation.participantCode}</p>
      <p className="text-xs text-text-tertiary">
        Save this QR code — present it at the venue entrance for check-in.
      </p>
    </Card>
  );
}