"use client";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { ApiError, apiGet } from "@/lib/api-client";
import { saveEventForm, fetchFormForEvent } from "@/lib/events";
import {
  AVAILABLE_FIELD_TYPES,
  BuilderField,
  DEFAULT_BUILDER_FIELDS,
} from "@/utils/mindaras-data";
import { ApiEvent, FormFieldPayload } from "@/utils/mindaras-api-types";
import { Plus } from "@tailgrids/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FormFieldRow from "./form-field-row";

// TODO: replace with real authenticated user id once auth is wired up
const CURRENT_USER_ID = "C035AF19-1469-4EC9-84C3-5E095B8602B0";

let fieldCounter = 0;

export default function FormBuilderPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  const [formName, setFormName] = useState("Event Registration");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<BuilderField[]>(DEFAULT_BUILDER_FIELDS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setIsLoadingEvent(false);
      setIsLoadingForm(false);
      return;
    }

    apiGet<ApiEvent[]>("/api/Event/FetchActiveEvents")
      .then((events) => {
        const match = events.find((e) => e.eventId === eventId) ?? null;
        setEvent(match);
      })
      .catch(() => toast.error("Couldn't load event details"))
      .finally(() => setIsLoadingEvent(false));

    fetchFormForEvent(eventId)
      .then((existingForm) => {
        if (!existingForm) {
          // no form yet — keep the defaults, this is a genuine "Create"
          return;
        }

        setFormName(existingForm.formName);
        setFormDescription(existingForm.formDescription ?? "");
        setFields(
          existingForm.formFields.map((f) => ({
            key: f.fieldId, // stable now — it's a real DB id, not a client-generated one
            typeId: f.fieldType,
            fieldName: f.fieldName,
            label: f.fieldLabel,
            inputType: f.fieldType as BuilderField["inputType"],
            required: f.isRequired,
            options: f.options ? (JSON.parse(f.options) as string[]) : [],
            locked: f.isLocked,
          })),
        );
      })
      .catch(() => toast.error("Couldn't load the existing form"))
      .finally(() => setIsLoadingForm(false));
  }, [eventId]);

  function addField(typeId: string) {
    const fieldType = AVAILABLE_FIELD_TYPES.find((t) => t.id === typeId);
    if (!fieldType) return;

    fieldCounter += 1;
    const key = `custom-${fieldType.id}-${fieldCounter}`;

    setFields((prev) => [
      ...prev,
      {
        key,
        typeId: fieldType.id,
        fieldName: `${fieldType.id}_${fieldCounter}`, // placeholder until labeled
        label: "",
        inputType: fieldType.inputType,
        required: false,
        options: fieldType.inputType === "select" ? ["Option 1", "Option 2"] : [],
      },
    ]);
  }

  function updateField(key: string, updated: BuilderField) {
    setFields((prev) => prev.map((f) => (f.key === key ? updated : f)));
  }

  function removeField(key: string) {
    setFields((prev) => prev.filter((f) => f.key !== key));
  }

  async function handleSave() {
    if (!eventId) {
      toast.error("No event selected — create or open an event first.");
      return;
    }
    if (!formName.trim()) {
      toast.error("Please give the form a name.");
      return;
    }
    const unlabeled = fields.find((f) => !f.label.trim());
    if (unlabeled) {
      toast.error("Every field needs a label before saving.");
      return;
    }

    const formFields: FormFieldPayload[] = fields.map((f) => ({
      fieldName: f.fieldName,
      fieldLabel: f.label.trim(),
      fieldType: f.inputType,
      isRequired: f.required,
      options: f.inputType === "select" && f.options.length > 0
        ? JSON.stringify(f.options)
        : undefined,
      isLocked: Boolean(f.locked),
    }));

    setIsSaving(true);
    try {
      const payload = {
          eventId,
          userId: CURRENT_USER_ID,
          formName: formName.trim(),
          formDescription: formDescription.trim() || undefined,
          formFields,
      };

      console.log(JSON.stringify(payload, null, 2));

      await saveEventForm(payload);

      toast.success("Registration form saved");
      router.push(`/events/${eventId}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      toast.error("Couldn't save form", { description: message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
            Registration Form Builder
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            {isLoadingEvent
              ? "Loading event…"
              : event
                ? `Building the form for "${event.eventName}"`
                : eventId
                  ? "Couldn't find that event."
                  : "Open this page from an event's Create Event flow."}
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
        <Card className="h-fit space-y-2 p-5 lg:col-span-1">
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
        </Card>

        <Card className="space-y-6 p-6 shadow-sm lg:col-span-2">
          <div className="space-y-4 border-b border-card-border pb-6">
            <TextField className="gap-1.5">
              <Label htmlFor="form-name">Form Name</Label>
              <Input
                id="form-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Event Registration"
                className="w-full"
              />
            </TextField>
            <TextField className="gap-1.5">
              <Label htmlFor="form-description">Form Description</Label>
              <TextArea
                id="form-description"
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="What should participants know before filling this out?"
              />
            </TextField>
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <FormFieldRow
                key={field.key}
                field={field}
                existingFieldNames={fields.filter((f) => f.key !== field.key).map((f) => f.fieldName)}
                onChange={(updated) => updateField(field.key, updated)}
                onRemove={() => removeField(field.key)}
              />
            ))}
          </div>

          <Button onClick={handleSave} className="w-full py-3" isDisabled={isSaving || isLoadingForm || !eventId}>
            {isLoadingForm ? "Loading form…" : isSaving ? "Saving…" : "Save Form"}
          </Button>
        </Card>
      </div>
    </div>
  );
}