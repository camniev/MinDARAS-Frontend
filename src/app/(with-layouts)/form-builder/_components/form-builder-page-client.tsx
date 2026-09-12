"use client";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { ApiError, apiGet } from "@/lib/api-client";
import { saveEventForm, fetchFormForEvent, toggleFormStatus } from "@/lib/events";
import {
  AVAILABLE_FIELD_TYPES,
  BuilderField,
  DEFAULT_BUILDER_FIELDS,
} from "@/utils/mindaras-data";
import { ApiEvent, FormFieldPayload } from "@/utils/mindaras-api-types";
import { Close, ColourPalette3, Plus } from "@tailgrids/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FormFieldRow from "./form-field-row";
import { DEFAULT_FORM_THEME } from "@/utils/mindaras-data";
import { FormTheme } from "@/utils/mindaras-api-types";
import ThemeEditor from "./theme-editor";
import { slugify } from "@/utils/slugify";

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

  const [theme, setTheme] = useState<FormTheme>(DEFAULT_FORM_THEME);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const [isFormActive, setIsFormActive] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

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
        if (existingForm.theme) setTheme(existingForm.theme);
        setIsFormActive(existingForm.isActive);
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

  function duplicateField(key: string) {
    const original = fields.find((f) => f.key === key);
    if (!original || original.locked) return;

    fieldCounter += 1;
    setFields((prev) => {
      const index = prev.findIndex((f) => f.key === key);
      const copy: BuilderField = {
        ...original,
        key: `copy-${fieldCounter}`,
        label: `${original.label} (copy)`,
        fieldName: slugify(`${original.label} copy`, prev.map((f) => f.fieldName)),
      };
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  }

  async function handleToggleFormActive() {
    if (!eventId) return;
    const next = !isFormActive;
    setIsFormActive(next); // optimistic
    setIsTogglingStatus(true);
    try {
      await toggleFormStatus(eventId, next);
      toast.success(next ? "Form enabled — open for registration" : "Form disabled — registration closed");
    } catch {
      setIsFormActive(!next); // revert on failure
      toast.error("Couldn't update form status");
    } finally {
      setIsTogglingStatus(false);
    }
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
          theme,
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
    <div className="relative mt-6">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 pb-5 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
            Registration Form Builder
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">{/* unchanged */}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* only meaningful once a form actually exists to toggle */}
          {!isLoadingForm && (
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              {isFormActive ? "Open for registration" : "Registration closed"}
              <button
                type="button"
                role="switch"
                aria-checked={isFormActive}
                onClick={handleToggleFormActive}
                disabled={isTogglingStatus}
                className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                  isFormActive ? "justify-end bg-badge-success-icon-color" : "justify-start bg-gray-300"
                } disabled:opacity-60`}
              >
                <span className="size-4 rounded-full bg-white shadow-sm" />
              </button>
            </label>
          )}
          <Breadcrumbs
            dividerType="chevron"
            items={[
              { href: "/", label: "Home" },
              { href: "/form-builder", label: "Form Builder" },
            ]}
          />
        </div>
      </div>

      {/* Centered canvas — matches Google Forms' single-column document view */}
      <div className="mx-auto max-w-[720px] space-y-4 px-2 pb-24 lg:px-0">
        <TextField className="gap-1.5">
          <Label htmlFor="form-name" className="sr-only">
            Form Name
          </Label>
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="h-2 w-full bg-brand-500" />
            <div className="space-y-3 p-6">
              <Input
                id="form-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Untitled Form"
                className="w-full border-0 border-b border-transparent bg-transparent p-0 text-2xl font-normal focus:border-b-2 focus:border-brand-500 focus:outline-none"
              />
              <TextArea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Form description"
                rows={2}
                className="w-full resize-none border-0 border-b border-gray-100 bg-transparent p-0 text-sm text-text-secondary focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </TextField>

        {fields.map((field) => (
          <FormFieldRow
            key={field.key}
            field={field}
            existingFieldNames={fields.filter((f) => f.key !== field.key).map((f) => f.fieldName)}
            onChange={(updated) => updateField(field.key, updated)}
            onRemove={() => removeField(field.key)}
            onDuplicate={() => duplicateField(field.key)}
          />
        ))}

        <Button onClick={handleSave} className="w-full py-3" isDisabled={isSaving || isLoadingForm || !eventId}>
          {isLoadingForm ? "Loading form…" : isSaving ? "Saving…" : "Save Form"}
        </Button>
      </div>

      {/* Floating add-question toolbar — mirrors the vertical icon rail in Google Forms */}
      <div className="fixed top-40 right-4 z-20 hidden w-44 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg lg:flex">
        <p className="px-2 pt-1 pb-2 text-[11px] font-semibold tracking-wide text-text-tertiary uppercase">
          Add a question
        </p>
        {AVAILABLE_FIELD_TYPES.map((fieldType) => (
          <button
            key={fieldType.id}
            type="button"
            onClick={() => addField(fieldType.id)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-secondary transition hover:bg-background-gray-secondary_alt hover:text-brand-500"
          >
            <Plus className="size-4 shrink-0" />
            <span>{fieldType.label}</span>
          </button>
        ))}
        <div className="my-1 border-t border-gray-100" />
        <button
          type="button"
          onClick={() => setIsThemeOpen(true)}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-secondary transition hover:bg-background-gray-secondary_alt hover:text-brand-500"
        >
          <ColourPalette3 className="size-4 shrink-0" />
          <span>Customize theme</span>
        </button>
      </div>

      {/* Mobile fallback — the floating rail above only shows lg+; small screens get inline controls */}
      <div className="mx-auto max-w-[720px] space-y-3 px-2 lg:hidden">
        <Card className="space-y-2 p-4">
          <p className="text-xs font-semibold text-text-tertiary uppercase">Add a question</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_FIELD_TYPES.map((fieldType) => (
              <button
                key={fieldType.id}
                type="button"
                onClick={() => addField(fieldType.id)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-text-secondary hover:bg-background-gray-secondary_alt"
              >
                + {fieldType.label}
              </button>
            ))}
          </div>
        </Card>
        <Button
          appearance="outline"
          onClick={() => setIsThemeOpen(true)}
          className="w-full gap-2"
        >
          <ColourPalette3 className="size-4" />
          Customize theme
        </Button>
      </div>

      {/* Slide-in theme panel */}
      {isThemeOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/30"
          onClick={() => setIsThemeOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col bg-background-gray-secondary_alt_2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <h2 className="text-lg font-semibold text-text-primary">Customize Theme</h2>
              <button
                type="button"
                onClick={() => setIsThemeOpen(false)}
                className="rounded-md p-1.5 text-text-tertiary hover:bg-background-gray-secondary_alt"
              >
                <Close className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <ThemeEditor theme={theme} onChange={setTheme} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}