"use client";

import { Button } from "@/components/tailgrids/core/button";
import { useEffect, useRef, useState } from "react";

const READER_ELEMENT_ID = "qr-attendance-reader";

type Props = {
  onScan: (decodedText: string) => void;
};

export default function Scanner({ onScan }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, []);

  async function activateCamera() {
    setError(null);
    try {
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      if (scannerRef.current) return;

      const scanner = new Html5QrcodeScanner(
        READER_ELEMENT_ID,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        /* verbose= */ false,
      );

      scanner.render(
        (decodedText: string) => onScan(decodedText),
        () => {
          // Ignore per-frame decode failures — expected while aiming the camera.
        },
      );

      scannerRef.current = scanner;
      setIsActive(true);
    } catch {
      setError("Couldn't access the camera. Check browser permissions and try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div
        id={READER_ELEMENT_ID}
        className="w-full overflow-hidden rounded-xl border border-card-border [&_button]:rounded-lg [&_button]:bg-brand-500 [&_button]:px-3 [&_button]:py-1.5 [&_button]:text-white [&_select]:rounded-lg [&_select]:border [&_select]:border-card-border [&_select]:px-2 [&_select]:py-1"
      />

      {!isActive && (
        <Button onClick={activateCamera} className="w-full py-2.5">
          Activate Camera
        </Button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
