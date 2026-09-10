// src/app/(with-layouts)/form-builder/_components/theme-editor.tsx
"use client";

import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { uploadThemeImage } from "@/lib/events";
import { FormTheme } from "@/utils/mindaras-api-types";
import { resolveAssetUrl } from "@/lib/resolve-asset-url";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  theme: FormTheme;
  onChange: (theme: FormTheme) => void;
};

export default function ThemeEditor({ theme, onChange }: Props) {
  const [uploadingField, setUploadingField] = useState<"background" | "header" | null>(null);

  const backgroundPreviewUrl = resolveAssetUrl(theme.backgroundImageUrl);
  const headerPreviewUrl = resolveAssetUrl(theme.headerImageUrl);

  function update(patch: Partial<FormTheme>) {
    onChange({ ...theme, ...patch });
  }

  async function handleImageUpload(file: File, target: "background" | "header") {
    setUploadingField(target);
    try {
      const { url } = await uploadThemeImage(file);
      if (target === "background") update({ backgroundImageUrl: url, backgroundType: "image" });
      else update({ headerImageUrl: url });
      toast.success("Image uploaded");
    } catch {
      toast.error("Couldn't upload image");
    } finally {
      setUploadingField(null);
    }
  }

  return (
    <Card className="space-y-5 p-6">
      <h2 className="font-semibold text-text-primary">Branding &amp; Theme</h2>

      {/* Background */}
      <div className="space-y-2">
        <Label>Background</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ backgroundType: "color" })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              theme.backgroundType === "color"
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-card-border text-text-secondary"
            }`}
          >
            Solid Color
          </button>
          <button
            type="button"
            onClick={() => update({ backgroundType: "image" })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              theme.backgroundType === "image"
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-card-border text-text-secondary"
            }`}
          >
            Image
          </button>
        </div>

        {theme.backgroundType === "color" ? (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.backgroundColor ?? "#F4F5F7"}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="h-9 w-14 cursor-pointer rounded border border-card-border"
            />
            <Input
              value={theme.backgroundColor ?? ""}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              placeholder="#F4F5F7"
              className="w-32"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "background")}
              disabled={uploadingField === "background"}
              className="text-sm text-text-secondary"
            />
            {backgroundPreviewUrl && (
              <img
                src={backgroundPreviewUrl}
                alt="Background preview"
                className="h-20 w-full rounded-lg border border-card-border object-cover"
              />
            )}
          </div>
        )}
      </div>

      {/* Primary color */}
      <div className="space-y-2">
        <Label>Accent Color (buttons, links)</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={theme.primaryColor ?? "#3C50E0"}
            onChange={(e) => update({ primaryColor: e.target.value })}
            className="h-9 w-14 cursor-pointer rounded border border-card-border"
          />
          <Input
            value={theme.primaryColor ?? ""}
            onChange={(e) => update({ primaryColor: e.target.value })}
            placeholder="#3C50E0"
            className="w-32"
          />
        </div>
      </div>

      {/* Header logo/banner */}
      <div className="space-y-2">
        <Label>Header Logo / Banner</Label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "header")}
          disabled={uploadingField === "header"}
          className="text-sm text-text-secondary"
        />
        {headerPreviewUrl && (
          <img
            src={headerPreviewUrl}
            alt="Header preview"
            className="h-16 rounded-lg border border-card-border object-contain"
          />
        )}
      </div>

      {/* Header text override + color */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="header-text">Header Text (optional)</Label>
          <Input
            id="header-text"
            value={theme.headerText ?? ""}
            onChange={(e) => update({ headerText: e.target.value || null })}
            placeholder="Defaults to form name"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="header-text-color">Header Text Color</Label>
          <div className="flex items-center gap-3">
            <input
              id="header-text-color"
              type="color"
              value={theme.headerTextColor ?? "#1C2434"}
              onChange={(e) => update({ headerTextColor: e.target.value })}
              className="h-9 w-14 cursor-pointer rounded border border-card-border"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}