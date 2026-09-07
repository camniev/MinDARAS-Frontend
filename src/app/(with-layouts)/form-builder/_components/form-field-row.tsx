"use client";

import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { BuilderField } from "@/utils/mindaras-data";
import { slugify } from "@/utils/slugify";
import { Trash1 } from "@tailgrids/icons";

type Props = {
  field: BuilderField;
  existingFieldNames: string[]; // other fields' fieldName values, for slug de-dup
  onChange: (updated: BuilderField) => void;
  onRemove: () => void;
};

export default function FormFieldRow({ field, existingFieldNames, onChange, onRemove }: Props) {
  function handleLabelChange(newLabel: string) {
    onChange({
      ...field,
      label: newLabel,
      // keep fieldName in sync with the label unless it's a locked/default
      // field, whose technical key should stay stable once created
      fieldName: field.locked ? field.fieldName : slugify(newLabel, existingFieldNames),
    });
  }

  function handleOptionsTextChange(text: string) {
    const options = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    onChange({ ...field, options });
  }

  return (
    <div className="group relative space-y-3 rounded-xl border border-card-border p-4">
      {!field.locked && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${field.label || "field"}`}
          className="absolute -top-2.5 -right-2.5 z-10 flex size-6 items-center justify-center rounded-full border border-card-border bg-card-background text-icon-secondary opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-red-600"
        >
          <Trash1 className="size-3.5" />
        </button>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-text-tertiary">Field Label</Label>
          <Input
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="e.g. Office"
            className="w-full"
            disabled={field.locked}
          />
        </div>

        <label className="flex shrink-0 items-center gap-2 pt-4 text-xs text-text-secondary">
          <Checkbox
            isSelected={field.required}
            onChange={(isSelected) => onChange({ ...field, required: isSelected })}
            isDisabled={field.locked}
          />
          Required
        </label>
      </div>

      <p className="font-mono text-[11px] text-text-tertiary">
        key: {field.fieldName || "—"}
      </p>

      {field.inputType === "select" && (
        <div className="space-y-1">
          <Label className="text-xs text-text-tertiary">Options (one per line)</Label>
          <TextArea
            rows={3}
            value={field.options.join("\n")}
            onChange={(e) => handleOptionsTextChange(e.target.value)}
            placeholder={"General Admission\nVIP Pass\nStudent"}
          />
        </div>
      )}
    </div>
  );
}