"use client";

import { Card } from "@/components/tailgrids/core/card";
import { AVAILABLE_FIELD_TYPES, BuilderField, BuilderSection } from "@/utils/mindaras-data";
import { Plus, Trash1 } from "@tailgrids/icons";
import { useState } from "react";
import FormFieldRow from "./form-field-row";

type Props = {
  section: BuilderSection;
  sections: BuilderSection[];
  fields: BuilderField[];
  isOnlySection: boolean;
  onChangeSection: (updated: BuilderSection) => void;
  onRemoveSection: () => void;
  onAddField: (sectionId: string, typeId: string) => void;
  onChangeField: (updated: BuilderField) => void;
  onRemoveField: (key: string) => void;
  onDuplicateField: (key: string) => void;
  allFieldNames: string[];
};

export default function SectionCard({
  section,
  sections,
  fields,
  isOnlySection,
  onChangeSection,
  onRemoveSection,
  onAddField,
  onChangeField,
  onRemoveField,
  onDuplicateField,
  allFieldNames,
}: Props) {
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  return (
    <Card className="space-y-4 border-t-4 border-t-brand-500 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <input
            value={section.title}
            onChange={(e) => onChangeSection({ ...section, title: e.target.value })}
            placeholder="Section title"
            className="w-full border-0 border-b border-transparent bg-transparent pb-1 text-lg font-medium text-text-primary focus:border-b-2 focus:border-brand-500 focus:outline-none"
          />
          <input
            value={section.description}
            onChange={(e) => onChangeSection({ ...section, description: e.target.value })}
            placeholder="Section description (optional)"
            className="w-full border-0 border-b border-transparent bg-transparent pb-1 text-sm text-text-tertiary focus:border-b-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        {!isOnlySection && (
          <button
            type="button"
            onClick={onRemoveSection}
            aria-label="Remove section"
            className="shrink-0 rounded-md p-2 text-text-tertiary hover:bg-red-50 hover:text-red-600"
          >
            <Trash1 className="size-4" />
          </button>
        )}
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        {fields.length === 0 && (
          <p className="text-sm text-text-tertiary italic">No fields in this section yet.</p>
        )}
        {fields.map((field) => (
          <FormFieldRow
            key={field.key}
            field={field}
            sections={sections}
            existingFieldNames={allFieldNames.filter((n) => n !== field.fieldName)}
            onChange={onChangeField}
            onRemove={() => onRemoveField(field.key)}
            onDuplicate={() => onDuplicateField(field.key)}
          />
        ))}
      </div>

      <div className="relative border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setShowFieldPicker((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:underline"
        >
          <Plus className="size-4" />
          Add field to this section
        </button>

        {showFieldPicker && (
          <div className="absolute z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
            {AVAILABLE_FIELD_TYPES.map((ft) => (
              <button
                key={ft.id}
                type="button"
                onClick={() => {
                  onAddField(section.sectionId, ft.id);
                  setShowFieldPicker(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-background-gray-secondary_alt"
              >
                {ft.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}