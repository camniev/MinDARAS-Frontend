"use client";

import { useCountries } from "@/hooks/use-countries";
import { FormFieldDetail } from "@/utils/mindaras-api-types";

type Props = {
  field: FormFieldDetail;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  accentColor: string;
  countries: string[];
  countriesLoading: boolean;
  countriesError: string | null;
};

export default function DynamicFieldInput({ field, value, onChange, error, accentColor, countries, countriesLoading, countriesError }: Props) {
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

  if (field.fieldName === "country") {
    const countryOptions = countries.length > 0
      ? countries
      : field.options;

    return (
      <div className="w-full">
        <label
          htmlFor={field.fieldId}
          className="mb-2 block text-sm font-medium"
        >
          {field.fieldLabel ?? field.fieldLabel}
          {field.isRequired && (
            <span className="text-red-500"> *</span>
          )}
        </label>

        <select
          id={field.fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.isRequired}
          disabled={countriesLoading}
          className="w-full border-0 border-b border-gray-300 bg-transparent py-1.5 text-sm text-[#1C2434] focus:border-b-2 focus:border-[var(--accent-color)] focus:outline-none"
        >
          <option value="">
            {countriesLoading
              ? "Loading countries..."
              : countriesError
                ? "Unable to load countries"
                : "Select a country"}
          </option>

          {countryOptions.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        {countriesError && (
          <p className="mt-1 text-sm text-red-500">
            {countriesError}
          </p>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }

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

  if (field.fieldType === "datetime") {
    return (
      <div style={accentStyle}>
        {labelBlock}
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 border-b border-gray-300 bg-transparent py-1.5 text-sm text-[#1C2434] focus:border-b-2 focus:border-[var(--accent-color)] focus:outline-none"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // if (field.fieldName === "country") {
  //   return (
  //     <div className="w-full">
  //       <label
  //         htmlFor={field.fieldId}
  //         className="mb-2 block text-sm font-medium"
  //       >
  //         {field.fieldLabel}
  //         {field.isRequired && (
  //           <span className="text-red-500"> *</span>
  //         )}
  //       </label>

  //       <select
  //         id={field.fieldId}
  //         name={field.fieldName}
  //         value={value}
  //         onChange={(e) => onChange(e.target.value)}
  //         required={field.isRequired}
  //         disabled={countriesLoading}
  //         className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
  //         style={{ accentColor }}
  //       >
  //         <option value="">
  //           {countriesLoading
  //             ? "Loading countries..."
  //             : "Select a country"}
  //         </option>

  //         {countries.map((country) => (
  //           <option key={country} value={country}>
  //             {country}
  //           </option>
  //         ))}
  //       </select>

  //       {countriesError && (
  //         <p className="mt-1 text-sm text-red-500">
  //           {countriesError}
  //         </p>
  //       )}

  //       {error && (
  //         <p className="mt-1 text-sm text-red-500">
  //           {error}
  //         </p>
  //       )}
  //     </div>
  //   );
  // }

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