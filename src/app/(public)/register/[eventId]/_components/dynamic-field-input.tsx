"use client";

import { Checkbox } from "@/components/tailgrids/core/checkbox";
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
import { FormFieldDetail } from "@/utils/mindaras-api-types";

type Props = {
  field: FormFieldDetail;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function DynamicFieldInput({ field, value, onChange, error }: Props) {
  const options: string[] = field.options ? JSON.parse(field.options) : [];

  if (field.fieldType === "select") {
    return (
      <div className="flex flex-col gap-1.5">
        <Select value={value} onChange={(val) => onChange(val as string)} className="w-full" aria-label={field.fieldLabel}>
          <Label>
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500"> *</span>}
          </Label>
          <SelectTrigger className="w-full border-card-border">
            <SelectValue placeholder="Select an option" />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent className="min-w-(--trigger-width)">
            {options.map((opt) => (
              <SelectItem key={opt} id={opt} textValue={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.fieldType === "checkbox") {
    const selected: string[] = value ? JSON.parse(value) : [];

    function toggle(opt: string) {
      const next = selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt];
      onChange(JSON.stringify(next));
    }

    return (
      <div className="space-y-2">
        <Label>
          {field.fieldLabel}
          {field.isRequired && <span className="text-red-500"> *</span>}
        </Label>
        <div className="space-y-1.5">
          {options.map((opt) => (
            <Checkbox key={opt} isSelected={selected.includes(opt)} onChange={() => toggle(opt)}>
              {opt}
            </Checkbox>
          ))}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.fieldType === "textarea") {
    return (
      <TextField className="gap-1.5">
        <Label>
          {field.fieldLabel}
          {field.isRequired && <span className="text-red-500"> *</span>}
        </Label>
        <TextArea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </TextField>
    );
  }

  return (
    <TextField className="gap-1.5">
      <Label>
        {field.fieldLabel}
        {field.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Input
        type={field.fieldType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </TextField>
  );
}