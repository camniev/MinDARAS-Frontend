"use client";

import { BuilderField, BuilderSection } from "@/utils/mindaras-data";
import { slugify } from "@/utils/slugify";
import { Copy1, Plus, Trash1 } from "@tailgrids/icons";

type Props = {
  field: BuilderField;
  sections: BuilderSection[];
  existingFieldNames: string[];
  onChange: (updated: BuilderField) => void;
  onRemove: () => void;
  onDuplicate: () => void;
};

const TYPE_LABELS: Record<BuilderField["inputType"], string> = {
  text: "Short answer",
  email: "Email",
  select: "Dropdown",
  number: "Number",
  date: "Date",
  datetime: "Date & Time",
  textarea: "Paragraph",
  checkbox: "Checkboxes",
};

const HAS_CHOICES = (inputType: BuilderField["inputType"]) =>
  inputType === "select" || inputType === "checkbox";

export default function FormFieldRow({
  field,
  sections,
  existingFieldNames,
  onChange,
  onRemove,
  onDuplicate,
}: Props) {
  function handleLabelChange(newLabel: string) {
    onChange({
      ...field,
      label: newLabel,
      fieldName: field.locked ? field.fieldName : slugify(newLabel, existingFieldNames),
    });
  }

  function updateOption(index: number, value: string) {
    const oldValue = field.options[index];
    const next = [...field.options];
    next[index] = value;

    // if this option had a branching rule attached, move the rule to follow
    // the renamed option rather than silently orphaning it under the old text
    const branchingConfig = field.branchingConfig ? { ...field.branchingConfig } : undefined;
    if (branchingConfig && oldValue in branchingConfig) {
      const target = branchingConfig[oldValue];
      delete branchingConfig[oldValue];
      branchingConfig[value] = target;
    }

    onChange({ ...field, options: next, branchingConfig });
  }

  function addOption() {
    onChange({ ...field, options: [...field.options, `Option ${field.options.length + 1}`] });
  }

  function removeOption(index: number) {
    const removed = field.options[index];
    const branchingConfig = field.branchingConfig ? { ...field.branchingConfig } : undefined;
    if (branchingConfig) delete branchingConfig[removed];

    onChange({
      ...field,
      options: field.options.filter((_, i) => i !== index),
      branchingConfig,
    });
  }

  function updateBranch(option: string, targetSectionId: string) {
    const branchingConfig = { ...(field.branchingConfig ?? {}) };
    if (targetSectionId) {
      branchingConfig[option] = targetSectionId;
    } else {
      delete branchingConfig[option];
    }
    onChange({ ...field, branchingConfig });
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="absolute inset-y-0 left-0 w-1 bg-brand-500" />

      <div className="space-y-4 p-5 pl-6 sm:p-6 sm:pl-7">
        <div className="flex items-start justify-between gap-4">
          <input
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Question"
            disabled={field.locked}
            className="w-full border-0 border-b border-transparent bg-transparent pb-1.5 text-base font-normal text-text-primary placeholder:text-text-tertiary focus:border-b-2 focus:border-brand-500 focus:outline-none disabled:text-text-secondary"
          />
          <span className="shrink-0 rounded-md bg-background-gray-secondary_alt px-2.5 py-1 text-xs font-medium text-text-tertiary">
            {TYPE_LABELS[field.inputType]}
          </span>
        </div>

        <p className="-mt-2 font-mono text-[11px] text-text-tertiary">key: {field.fieldName || "—"}</p>

        {/* Options / choices editor — now covers BOTH select and checkbox */}
        {HAS_CHOICES(field.inputType) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-tertiary">
              {field.inputType === "checkbox" ? "Choices" : "Options"}
            </p>
            {field.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={
                    field.inputType === "checkbox"
                      ? "size-4 shrink-0 rounded border border-gray-300"
                      : "size-4 shrink-0 rounded-full border border-gray-300"
                  }
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="w-full border-0 border-b border-gray-200 bg-transparent py-1 text-sm text-text-secondary focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  aria-label="Remove option"
                  className="text-text-tertiary hover:text-red-600"
                >
                  <Trash1 className="size-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-sm text-brand-500 hover:underline"
            >
              <Plus className="size-3.5" />
              Add {field.inputType === "checkbox" ? "choice" : "option"}
            </button>
          </div>
        )}

        {/* Branching editor — only meaningful once there are choices to branch on */}
        {HAS_CHOICES(field.inputType) && field.options.length > 0 && sections.length > 1 && (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-text-tertiary">
              Branch to a section based on the answer
            </p>
            {field.options.map((opt) => (
              <div key={opt} className="flex items-center gap-2 text-sm">
                <span className="w-28 shrink-0 truncate text-text-secondary">{opt || "(empty)"}</span>
                <span className="text-text-tertiary">→</span>
                <select
                  value={field.branchingConfig?.[opt] ?? ""}
                  onChange={(e) => updateBranch(opt, e.target.value)}
                  className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm"
                >
                  <option value="">Continue normally</option>
                  {sections.map((s) => (
                    <option key={s.sectionId} value={s.sectionId}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {field.locked && (
          <p className="text-xs text-text-tertiary italic">
            This is a default field — its type and technical key can&apos;t be changed.
          </p>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onDuplicate}
              aria-label="Duplicate question"
              className="rounded-md p-2 text-text-tertiary hover:bg-background-gray-secondary_alt hover:text-text-primary"
            >
              <Copy1 className="size-4" />
            </button>
            {!field.locked && (
              <button
                type="button"
                onClick={onRemove}
                aria-label="Delete question"
                className="rounded-md p-2 text-text-tertiary hover:bg-red-50 hover:text-red-600"
              >
                <Trash1 className="size-4" />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Required
            <button
              type="button"
              role="switch"
              aria-checked={field.required}
              onClick={() => !field.locked && onChange({ ...field, required: !field.required })}
              disabled={field.locked}
              className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                field.required ? "justify-end bg-brand-500" : "justify-start bg-gray-300"
              } disabled:opacity-60`}
            >
              <span className="size-4 rounded-full bg-white shadow-sm" />
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}