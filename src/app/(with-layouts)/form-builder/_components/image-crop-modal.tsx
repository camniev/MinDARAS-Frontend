// src/app/(with-layouts)/form-builder/_components/image-crop-modal.tsx
"use client";

import { getCroppedImageBlob } from "@/utils/crop-image";
import { useCallback, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";

type Props = {
  imageSrc: string;
  aspect: number;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
};

export default function ImageCropModal({ imageSrc, aspect, onCancel, onCropped }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleApply() {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onCropped(blob);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Adjust Image</h2>
          <p className="text-sm text-text-tertiary">Drag to reposition, scroll or use the slider to zoom.</p>
        </div>

        <div className="relative h-80 w-full bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="space-y-4 border-t border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background-gray-secondary_alt"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing || !croppedAreaPixels}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isProcessing ? "Applying…" : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}