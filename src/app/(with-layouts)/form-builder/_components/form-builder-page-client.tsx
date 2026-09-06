"use client";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  AVAILABLE_FIELD_TYPES,
  BuilderField,
  DEFAULT_BUILDER_FIELDS,
  INITIAL_EVENTS,
} from "@/utils/event-pulse-data";
import { Plus } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";
import FormPreviewField from "./form-preview-field";

let fieldCounter = 0;

export default function FormBuilderPageClient() {
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_EVENTS[0]?.id ?? "");
  const [fields, setFields] = useState<BuilderField[]>(DEFAULT_BUILDER_FIELDS);

  const selectedEvent = INITIAL_EVENTS.find((e) => e.id === selectedEventId);

  function addField(typeId: string) {
    const fieldType = AVAILABLE_FIELD_TYPES.find((t) => t.id === typeId);
    if (!fieldType) return;

    fieldCounter += 1;
    setFields((prev) => [
      ...prev,
      {
        key: `custom-${fieldType.id}-${fieldCounter}`,
        typeId: fieldType.id,
        label: fieldType.label,
        inputType: fieldType.inputType,
        required: false,
      },
    ]);
    toast.success(`Added "${fieldType.label}" field`);
  }

  function removeField(key: string) {
    setFields((prev) => prev.filter((f) => f.key !== key));
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
            Registration Form Builder
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Customize participant details captured during sign-up.
          </p>
        </div>

        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/", label: "Home" },
            { href: "/form-builder", label: "Form Builder" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 px-2 lg:grid-cols-3 lg:px-5">
        <Card className="h-fit space-y-4 p-5 lg:col-span-1">
          <div>
            <h2 className="font-semibold text-text-primary">Building form for</h2>
            <Select
              value={selectedEventId}
              onChange={(val) => setSelectedEventId(val as string)}
              className="mt-2 w-full"
              aria-label="Select event"
            >
              <SelectTrigger className="w-full border-card-border">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent className="min-w-(--trigger-width)">
                {INITIAL_EVENTS.map((event) => (
                  <SelectItem key={event.id} id={event.id} textValue={event.title}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 border-t border-card-border pt-4">
            <h2 className="font-semibold text-text-primary">Add Form Fields</h2>
            <div className="space-y-2">
              {AVAILABLE_FIELD_TYPES.map((fieldType) => (
                <button
                  key={fieldType.id}
                  type="button"
                  onClick={() => addField(fieldType.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-card-border p-3 text-sm font-medium text-text-primary transition hover:bg-background-gray-secondary_alt"
                >
                  <span>{fieldType.label}</span>
                  <Plus className="size-4 text-icon-secondary" />
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-6 p-6 shadow-sm lg:col-span-2">
          <div className="border-b border-card-border pb-4">
            <span className="text-xs font-semibold tracking-wider text-brand-500 uppercase">
              Preview
            </span>
            <h2 className="text-xl leading-7 font-semibold text-text-primary">
              Event Registration{selectedEvent ? `: ${selectedEvent.title}` : ""}
            </h2>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("This is a preview — connect it to your registration API to go live.");
            }}
          >
            {fields.map((field) => (
              <FormPreviewField key={field.key} field={field} onRemove={() => removeField(field.key)} />
            ))}

            <Button type="submit" className="w-full py-3">
              Submit Registration
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
