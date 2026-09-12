"use client";

import { FormFieldDetail } from "@/utils/mindaras-api-types";

type Props = {
  field: FormFieldDetail;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  accentColor: string;
};

export default function DynamicFieldInput({ field, value, onChange, error, accentColor }: Props) {
  const options: string[] = field.options ? JSON.parse(field.options) : [];
  const accentStyle = { "--accent-color": accentColor } as React.CSSProperties;

  const labelBlock = (
    <div className="mb-2">
      <span className="text-sm font-normal text-[#1C2434]">
        {field.fieldLabel}
        {field.isRequired && <span className="ml-0.5 text-red-600">*</span>}
      </span>
    </div>
  );

  if (field.fieldType === "select") {
    return (
      <div style={accentStyle}>
        {labelBlock}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 border-b border-gray-300 bg-transparent py-1.5 text-sm text-[#1C2434] focus:border-b-2 focus:border-[var(--accent-color)] focus:outline-none"
        >
          <option value="" disabled>
            Choose
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
      <div style={accentStyle}>
        {labelBlock}
        <div className="space-y-2.5">
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-3 text-sm text-[#1C2434]">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="size-4 accent-[var(--accent-color)]"
              />
              {opt}
            </label>
          ))}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.fieldType === "textarea") {
    return (
      <div style={accentStyle}>
        {labelBlock}
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          className="w-full resize-none border-0 border-b border-gray-300 bg-transparent py-1.5 text-sm text-[#1C2434] placeholder:text-gray-400 focus:border-b-2 focus:border-[var(--accent-color)] focus:outline-none"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // text / email / number / date
  return (
    <div style={accentStyle}>
      {labelBlock}
      <input
        type={field.fieldType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.fieldType === "date" ? undefined : "Your answer"}
        className="w-full border-0 border-b border-gray-300 bg-transparent py-1.5 text-sm text-[#1C2434] placeholder:text-gray-400 focus:border-b-2 focus:border-[var(--accent-color)] focus:outline-none"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}