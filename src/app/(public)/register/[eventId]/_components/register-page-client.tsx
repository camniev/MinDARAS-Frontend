"use client";

import { ApiError } from "@/lib/api-client";
import { fetchFormForEvent, registerForEvent } from "@/lib/events";
import { resolveAssetUrl } from "@/lib/resolve-asset-url";
import { computeNextSectionId } from "@/utils/compute-section-path";
import { FormDefinitionDetail, RegistrationConfirmation } from "@/utils/mindaras-api-types";
import { DEFAULT_FORM_THEME } from "@/utils/mindaras-data";
import { useEffect, useMemo, useState } from "react";
import DynamicFieldInput from "./dynamic-field-input";
import RegistrationSuccess from "./registration-success";

function Shell({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div className="h-full w-full overflow-y-auto px-4 py-10" style={style}>
      <div className="mx-auto w-full max-w-[640px]">{children}</div>
    </div>
  );
}

export default function RegisterPageClient({ eventId }: { eventId: string }) {
  const [form, setForm] = useState<FormDefinitionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<RegistrationConfirmation | null>(null);

  const sortedSections = useMemo(
    () => (form ? [...form.sections].sort((a, b) => a.orderIndex - b.orderIndex) : []),
    [form],
  );
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [visitedPath, setVisitedPath] = useState<string[]>([]);

  useEffect(() => {
    if (sortedSections.length > 0 && !currentSectionId) {
      setCurrentSectionId(sortedSections[0].sectionId);
      setVisitedPath([sortedSections[0].sectionId]);
    }
  }, [sortedSections, currentSectionId]);

  const theme = form?.theme ?? DEFAULT_FORM_THEME;
  const backgroundImageUrl = resolveAssetUrl(theme.backgroundImageUrl);
  const headerImageUrl = resolveAssetUrl(theme.headerImageUrl);
  const accentColor = theme.primaryColor ?? "#3C50E0";
  const pageBackgroundStyle: React.CSSProperties =
    theme.backgroundType === "image" && backgroundImageUrl
      ? { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }
      : { backgroundColor: theme.backgroundColor ?? "#F4F5F7" };

  useEffect(() => {
    fetchFormForEvent(eventId)
      .then((data) => {
        if (!data) {
          setLoadError("Registration isn't open for this event yet.");
          return;
        }
        setForm(data);
      })
      .catch(() => setLoadError("Couldn't load the registration form."))
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const currentSection = sortedSections.find((s) => s.sectionId === currentSectionId) ?? null;
  const currentFields = form?.formFields.filter((f) => f.sectionId === currentSectionId) ?? [];
  const isTerminal = currentSection ? !currentSection.defaultNextSectionId && !currentFields.some((f) => f.branchingConfig) : false;

  function validateCurrentSection(): boolean {
    const errors: Record<string, string[]> = {};
    for (const field of currentFields) {
      const value = values[field.fieldId];
      if (field.isRequired && !value?.trim()) {
        errors[field.fieldId] = [`${field.fieldLabel} is required.`];
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNext() {
    if (!validateCurrentSection() || !form || !currentSection) return;
    const nextId = computeNextSectionId(currentSection, form.formFields, values);
    if (!nextId) return; // shouldn't happen if isTerminal gated the button correctly
    setCurrentSectionId(nextId);
    setVisitedPath((prev) => [...prev, nextId]);
  }

  function handleBack() {
    setVisitedPath((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setCurrentSectionId(next[next.length - 1]);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!validateCurrentSection()) return;

    const visitedFieldIds = new Set(
      form.formFields.filter((f) => visitedPath.includes(f.sectionId)).map((f) => f.fieldId),
    );

    setIsSubmitting(true);
    try {
      const result = await registerForEvent(eventId, {
        responses: [...visitedFieldIds].map((fieldId) => ({ fieldId, value: values[fieldId] ?? "" })),
      });
      setConfirmation(result);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const byFieldId: Record<string, string[]> = {};
        for (const f of form.formFields) {
          if (err.fieldErrors[f.fieldName]) byFieldId[f.fieldId] = err.fieldErrors[f.fieldName];
        }
        setFieldErrors(byFieldId);
      } else {
        setLoadError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <Shell style={pageBackgroundStyle}><div className="h-64 w-full animate-pulse rounded-lg bg-white/70" /></Shell>;
  if (confirmation) return <Shell style={pageBackgroundStyle}><RegistrationSuccess confirmation={confirmation} /></Shell>;
  if (loadError || !form || !currentSection) {
    return <Shell style={pageBackgroundStyle}><div className="space-y-2 rounded-lg bg-white py-12 text-center shadow-sm"><p className="text-sm text-gray-500">{loadError ?? "This form isn't available."}</p></div></Shell>;
  }

  return (
    <Shell style={pageBackgroundStyle}>
      {headerImageUrl && (
        <img src={headerImageUrl} alt="" className="mb-3 aspect-[4/1] w-full rounded-lg object-cover" />
      )}

      {/* Note: no <form>/onSubmit here — every action below is an explicit
          onClick, so nothing can be triggered by Enter or implicit browser
          form-submission semantics. This is deliberate: it's what guarantees
          the Submit button only ever fires from a real, deliberate click. */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="h-2.5 w-full" style={{ backgroundColor: accentColor }} />
          <div className="space-y-3 p-6">
            {/* Persistent form identity — stays visible on every step */}
            <div>
              <h1 className="text-2xl leading-8 font-normal" style={{ color: theme.headerTextColor ?? "#1C2434" }}>
                {theme.headerText || form.formName}
              </h1>
              {form.formDescription && (
                <p className="mt-1 text-sm leading-6 text-gray-600">{form.formDescription}</p>
              )}
            </div>

            {/* Current step — changes as the participant advances */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-text-tertiary">
                Step {visitedPath.length} of {sortedSections.length}
              </p>
              <h2 className="text-lg leading-6 font-medium text-text-primary">{currentSection.title}</h2>
              {currentSection.description && (
                <p className="mt-1 text-sm leading-6 text-gray-600">{currentSection.description}</p>
              )}
            </div>
          </div>
        </div>

        {currentFields.map((field) => (
          <div key={field.fieldId} className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
            <DynamicFieldInput
              field={field}
              value={values[field.fieldId] ?? ""}
              onChange={(val) => setValues((prev) => ({ ...prev, [field.fieldId]: val }))}
              error={fieldErrors[field.fieldId]?.[0]}
              accentColor={accentColor}
            />
          </div>
        ))}

        <div className="flex items-center justify-between px-1">
          {visitedPath.length > 1 ? (
            <button type="button" onClick={handleBack} className="text-sm font-medium" style={{ color: accentColor }}>
              Back
            </button>
          ) : <span />}

          {isTerminal ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-md px-6 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md px-6 py-2 text-sm font-medium text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}