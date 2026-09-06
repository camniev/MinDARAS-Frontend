"use client";

import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { FieldError } from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { BuilderField } from "@/utils/event-pulse-data";
import { Trash1 } from "@tailgrids/icons";

type Props = {
  field: BuilderField;
  onRemove: () => void;
};

const TICKET_OPTIONS = ["General Admission", "VIP Pass", "Student"];

export default function FormPreviewField({ field, onRemove }: Props) {
  return (
    <div className="group relative">
      {!field.locked && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${field.label}`}
          className="absolute -top-1.5 -right-1.5 z-10 flex size-6 items-center justify-center rounded-full border border-card-border bg-card-background text-icon-secondary opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-red-600"
        >
          <Trash1 className="size-3.5" />
        </button>
      )}

      {field.inputType === "select" ? (
        <div className="flex flex-col gap-1.5">
          <Select defaultSelectedKey={TICKET_OPTIONS[0]} className="w-full" aria-label={field.label}>
            <Label>
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </Label>
            <SelectTrigger className="w-full border-card-border">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent className="min-w-(--trigger-width)">
              {TICKET_OPTIONS.map((opt) => (
                <SelectItem key={opt} id={opt} textValue={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : field.inputType === "textarea" ? (
        <TextField className="gap-1.5">
          <Label>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </Label>
          <TextArea rows={3} placeholder={`Enter ${field.label.toLowerCase()}`} />
        </TextField>
      ) : field.inputType === "checkbox" ? (
        <Checkbox>{field.label}</Checkbox>
      ) : (
        <TextField className="gap-1.5">
          <Label>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </Label>
          <Input
            type={field.inputType}
            placeholder={
              field.inputType === "email"
                ? "john@example.com"
                : field.inputType === "date"
                  ? undefined
                  : field.inputType === "number"
                    ? "0"
                    : "John Doe"
            }
            className="w-full"
          />
          <FieldError />
        </TextField>
      )}
    </div>
  );
}
