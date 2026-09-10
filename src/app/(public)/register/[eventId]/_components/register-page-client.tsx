"use client";

import { Card } from "@/components/tailgrids/core/card";
import { ApiError } from "@/lib/api-client";
import { fetchFormForEvent, registerForEvent } from "@/lib/events";
import { resolveAssetUrl } from "@/lib/resolve-asset-url";
import { FormDefinitionDetail, RegistrationConfirmation } from "@/utils/mindaras-api-types";
import { DEFAULT_FORM_THEME } from "@/utils/mindaras-data";
import { useEffect, useState } from "react";
import DynamicFieldInput from "./dynamic-field-input";
import RegistrationSuccess from "./registration-success";

export default function RegisterPageClient({ eventId }: { eventId: string }) {
  const [form, setForm] = useState<FormDefinitionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<RegistrationConfirmation | null>(null);

  const theme = form?.theme ?? DEFAULT_FORM_THEME;
  const backgroundImageUrl = resolveAssetUrl(theme.backgroundImageUrl);
  const headerImageUrl = resolveAssetUrl(theme.headerImageUrl);

  const pageBackgroundStyle: React.CSSProperties =
    theme.backgroundType === "image" && backgroundImageUrl
      ? {
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const result = await registerForEvent(eventId, {
        responses: form.formFields.map((f) => ({
          fieldId: f.fieldId,
          value: values[f.fieldId] ?? "",
        })),
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

  // shared page shell — every state (loading/error/success/form) renders through this
  // so the themed background is consistent even before the form data arrives
  function Shell({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex w-full min-h-screen justify-center px-4 py-10" style={pageBackgroundStyle}>
        <div className="w-full max-w-[640px]">{children}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Shell>
        <Card className="h-64 w-full animate-pulse bg-background-gray-secondary_alt" />
      </Shell>
    );
  }

  if (confirmation) {
    return (
      <Shell>
        <RegistrationSuccess confirmation={confirmation} />
      </Shell>
    );
  }

  if (loadError || !form) {
    return (
      <Shell>
        <Card className="space-y-2 py-12 text-center">
          <p className="text-sm text-text-tertiary">{loadError ?? "This form isn't available."}</p>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card className="space-y-6 p-6 sm:p-8">
        {headerImageUrl && (
          <img src={headerImageUrl} alt="" className="mx-auto h-20 object-contain" />
        )}

        <div>
          <h1
            className="text-xl leading-7 font-semibold"
            style={{ color: theme.headerTextColor ?? undefined }}
          >
            {theme.headerText || form.formName}
          </h1>
          {form.formDescription && (
            <p className="mt-1 text-sm leading-5 text-text-tertiary">{form.formDescription}</p>
          )}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {form.formFields.map((field) => (
            <DynamicFieldInput
              key={field.fieldId}
              field={field}
              value={values[field.fieldId] ?? ""}
              onChange={(val) => setValues((prev) => ({ ...prev, [field.fieldId]: val }))}
              error={fieldErrors[field.fieldId]?.[0]}
            />
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg py-3 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: theme.primaryColor ?? "#3C50E0" }}
          >
            {isSubmitting ? "Submitting…" : "Submit Registration"}
          </button>
        </form>
      </Card>
    </Shell>
  );
}