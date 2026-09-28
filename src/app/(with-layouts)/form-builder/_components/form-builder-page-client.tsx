"use client";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { ApiError, apiGet } from "@/lib/api-client";
import { saveEventForm, fetchFormForEvent } from "@/lib/events";
import {
  BuilderField,
  BuilderSection,
  createDefaultSections,
  DEFAULT_BUILDER_FIELDS,
  DEFAULT_FORM_THEME,
} from "@/utils/mindaras-data";
import { ApiEvent, FormFieldPayload, FormTheme } from "@/utils/mindaras-api-types";
import { ColourPalette3, Close } from "@tailgrids/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import SectionCard from "./section-card";
import ThemeEditor from "./theme-editor";

const CURRENT_USER_ID = "C035AF19-1469-4EC9-84C3-5E095B8602B0";
let fieldCounter = 0;

export default function FormBuilderPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(true);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Compute the default sections ONCE, in a single ref, so `sections` and
  // `fields` initial state derive from the exact same section IDs instead of
  // each generating their own independent random GUIDs.
  const initialSectionsRef = useRef<BuilderSection[]>(null);
  if (initialSectionsRef.current === null) {
    initialSectionsRef.current = createDefaultSections();
  }

  const [sections, setSections] = useState<BuilderSection[]>(initialSectionsRef.current);
  const [fields, setFields] = useState<BuilderField[]>(() => {
  const [firstSection, personalInfoSection] = initialSectionsRef.current!;
  return DEFAULT_BUILDER_FIELDS.map((f) => ({
    ...f,
    sectionId: f.fieldName === "full_name" ? personalInfoSection.sectionId : firstSection.sectionId,
  }));
});

  const [isSaving, setIsSaving] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [theme, setTheme] = useState<FormTheme>(DEFAULT_FORM_THEME);

  useEffect(() => {
    if (!eventId) {
      setIsLoadingEvent(false);
      setIsLoadingForm(false);
      return;
    }

    let cancelled = false;

    Promise.all([
      apiGet<ApiEvent[]>("/api/Event/FetchActiveEvents").catch(() => {
        toast.error("Couldn't load event details");
        return null;
      }),
      fetchFormForEvent(eventId).catch(() => {
        toast.error("Couldn't load the existing form");
        return null;
      }),
    ])
      .then(([events, existingForm]) => {
        if (cancelled) return;

        const matchedEvent = events?.find((e) => e.eventId === eventId) ?? null;
        setEvent(matchedEvent);

        // Runs for new AND existing forms, now that the event name is guaranteed to be known.
        if (matchedEvent) {
          setFormName(`[REGISTRATION FORM] ${matchedEvent.eventName}`);
        }

        if (!existingForm) return; // brand-new form: keep the default sections/fields

        setFormDescription(existingForm.formDescription ?? "");
        if (existingForm.theme) setTheme(existingForm.theme);

        setSections(
          existingForm.sections.map((s) => ({
            sectionId: s.sectionId,
            title: s.title,
            description: s.description ?? "",
            orderIndex: s.orderIndex,
            defaultNextSectionId: s.defaultNextSectionId,
          })),
        );

        setFields(
          existingForm.formFields.map((f) => {
            let options: string[] = [];
            try {
              options = f.options ? JSON.parse(f.options) : [];
            } catch {
              console.error(`Couldn't parse options for field "${f.fieldName}":`, f.options);
              toast.error(`Field "${f.fieldLabel}" has corrupted options data — check it in the builder.`);
            }

            let branchingConfig: Record<string, string> | undefined;
            try {
              branchingConfig = f.branchingConfig ? JSON.parse(f.branchingConfig) : undefined;
            } catch {
              console.error(`Couldn't parse branching config for field "${f.fieldName}":`, f.branchingConfig);
              toast.error(`Field "${f.fieldLabel}" has corrupted branching data — check it in the builder.`);
            }

            return {
              key: f.fieldId,
              typeId: f.fieldType,
              fieldName: f.fieldName,
              label: f.fieldLabel,
              inputType: f.fieldType as BuilderField["inputType"],
              required: f.isRequired,
              options,
              locked: f.isLocked,
              sectionId: f.sectionId,
              branchingConfig,
            };
          }),
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingEvent(false);
        setIsLoadingForm(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  function addSection() {
    const newId = crypto.randomUUID();
    setSections((prev) => {
      const withoutLast = prev.slice(0, -1);
      const last = prev[prev.length - 1]; // assumed terminal (e.g. "Submit")
      const secondToLast = withoutLast[withoutLast.length - 1];

      const updated = [...withoutLast];
      if (secondToLast) {
        updated[updated.length - 1] = { ...secondToLast, defaultNextSectionId: newId };
      }

      return [
        ...updated,
        { sectionId: newId, title: `Section ${prev.length}`, description: "", orderIndex: prev.length - 1, defaultNextSectionId: last.sectionId },
        { ...last, orderIndex: prev.length },
      ];
    });
  }

  function updateSection(updated: BuilderSection) {
    setSections((prev) => prev.map((s) => (s.sectionId === updated.sectionId ? updated : s)));
  }

  function removeSection(sectionId: string) {
    let bridgeTarget: string | null = null;

    setSections((prev) => {
      const target = prev.find((s) => s.sectionId === sectionId);
      bridgeTarget = target?.defaultNextSectionId ?? null;
      const remaining = prev.filter((s) => s.sectionId !== sectionId);
      return remaining.map((s) =>
        s.defaultNextSectionId === sectionId ? { ...s, defaultNextSectionId: bridgeTarget } : s,
      );
    });

    setFields((prev) =>
      prev
        .filter((f) => f.sectionId !== sectionId)
        .map((f) => {
          if (!f.branchingConfig) return f;
          const hasDanglingRule = Object.values(f.branchingConfig).includes(sectionId);
          if (!hasDanglingRule) return f;

          const fixed = { ...f.branchingConfig };
          for (const key of Object.keys(fixed)) {
            if (fixed[key] === sectionId) {
              if (bridgeTarget) fixed[key] = bridgeTarget;
              else delete fixed[key]; // no bridge target — fall back to "continue normally"
            }
          }
          return { ...f, branchingConfig: fixed };
        }),
    );
  }

  function addField(sectionId: string, typeId: string) {
    const fieldType = [
      { id: "text", label: "Single Line Text", inputType: "text" as const },
      { id: "email", label: "Email Address", inputType: "email" as const },
      { id: "select", label: "Dropdown Select", inputType: "select" as const },
      { id: "number", label: "Number", inputType: "number" as const },
      { id: "date", label: "Date", inputType: "date" as const },
      { id: "datetime", label: "Date & Time", inputType: "datetime" as const },
      { id: "textarea", label: "Long Answer", inputType: "textarea" as const },
      { id: "checkbox", label: "Checkboxes", inputType: "checkbox" as const },
    ].find((t) => t.id === typeId);
    if (!fieldType) return;

    fieldCounter += 1;
    setFields((prev) => [
      ...prev,
      {
        key: `custom-${fieldType.id}-${fieldCounter}`,
        typeId: fieldType.id,
        fieldName: `${fieldType.id}_${fieldCounter}`,
        label: "",
        inputType: fieldType.inputType,
        required: false,
        options: fieldType.inputType === "select" || fieldType.inputType === "checkbox" ? ["Option 1", "Option 2"] : [],
        sectionId,
      },
    ]);
  }

  function updateField(updated: BuilderField) {
    setFields((prev) => prev.map((f) => (f.key === updated.key ? updated : f)));
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
        fieldName: `${original.fieldName}_copy${fieldCounter}`,
      };
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  }

  async function handleSave() {
    if (!eventId) return toast.error("No event selected.");
    if (!formName.trim()) return toast.error("Please give the form a name.");
    if (fields.some((f) => !f.label.trim())) return toast.error("Every field needs a label before saving.");

    const formFields: FormFieldPayload[] = fields.map((f) => ({
      fieldName: f.fieldName,
      fieldLabel: f.label.trim(),
      fieldType: f.inputType,
      isRequired: f.required,
      options: (f.inputType === "select" || f.inputType === "checkbox") && f.options.length > 0 ? JSON.stringify(f.options) : "",
      isLocked: Boolean(f.locked),
      sectionId: f.sectionId,
      branchingConfig: f.branchingConfig && Object.keys(f.branchingConfig).length > 0 ? JSON.stringify(f.branchingConfig) : undefined,
    }));

    setIsSaving(true);
    try {
      await saveEventForm({
        eventId,
        userId: CURRENT_USER_ID,
        formName: formName.trim(),
        formDescription: formDescription.trim() || undefined,
        formFields,
        sections,
        theme,
      });
      toast.success("Registration form saved");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      toast.error("Couldn't save form", { description: message });
    } finally {
      setIsSaving(false);
    }
  }

  const allFieldNames = fields.map((f) => f.fieldName);

  return (
    <div className="relative mt-6">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 pb-5 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Registration Form Builder</h1>
          <p className="text-sm leading-5 text-text-tertiary">
            {isLoadingEvent ? "Loading event…" : event ? `Building the form for "${event.eventName}"` : "Open this page from an event's Create Event flow."}
          </p>
        </div>
        <Breadcrumbs dividerType="chevron" items={[{ href: "/", label: "Home" }, { href: "/form-builder", label: "Form Builder" }]} />
      </div>

      <div className="mx-auto max-w-[720px] space-y-4 px-2 pb-24 lg:px-0">
        <Card className="space-y-3 overflow-hidden p-0">
          <div className="h-2 w-full bg-brand-500" />
          <div className="space-y-3 p-6">
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter Form Name"
              className="w-full border-0 border-b border-transparent bg-transparent p-0 text-2xl font-normal focus:border-b-2 focus:border-brand-500 focus:outline-none"
            />
            <TextArea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Enter Form Description"
              rows={2}
              className="w-full resize-none border-0 border-b border-gray-100 bg-transparent p-0 text-sm text-text-secondary focus:border-brand-500 focus:outline-none"
            />
          </div>
        </Card>

        {sections
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((section) => (
            <SectionCard
              key={section.sectionId}
              section={section}
              sections={sections}
              fields={fields.filter((f) => f.sectionId === section.sectionId)}
              isOnlySection={sections.length <= 1} // don't let them delete down past info+submit
              onChangeSection={updateSection}
              onRemoveSection={() => removeSection(section.sectionId)}
              onAddField={addField}
              onChangeField={updateField}
              onRemoveField={removeField}
              onDuplicateField={duplicateField}
              allFieldNames={allFieldNames}
            />
          ))}

        <button
          type="button"
          onClick={addSection}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-text-secondary hover:border-brand-500 hover:text-brand-500"
        >
          + Add Section
        </button>

        <Button onClick={handleSave} className="w-full py-3" isDisabled={isSaving || isLoadingForm || !eventId}>
          {isLoadingForm ? "Loading form…" : isSaving ? "Saving…" : "Save Form"}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setIsThemeOpen(true)}
        className="fixed top-32 right-4 z-20 hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-text-secondary shadow-lg hover:text-brand-500 lg:flex"
      >
        <ColourPalette3 className="size-4.5" />
        Customize theme
      </button>

      {isThemeOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setIsThemeOpen(false)}>
          <div className="flex h-full w-full max-w-md flex-col bg-background-gray-secondary_alt_2 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <h2 className="text-lg font-semibold text-text-primary">Customize Theme</h2>
              <button type="button" onClick={() => setIsThemeOpen(false)} className="rounded-md p-1.5 text-text-tertiary hover:bg-background-gray-secondary_alt">
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