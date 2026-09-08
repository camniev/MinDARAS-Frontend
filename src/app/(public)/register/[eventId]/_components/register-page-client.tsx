"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { ApiError } from "@/lib/api-client";
import { fetchFormForEvent, registerForEvent } from "@/lib/events";
import { FormDefinitionDetail, RegistrationConfirmation } from "@/utils/mindaras-api-types";
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

  if (isLoading) {
    return <Card className="h-64 animate-pulse bg-background-gray-secondary_alt" />;
  }

  if (confirmation) {
    return <RegistrationSuccess confirmation={confirmation} />;
  }

  if (loadError || !form) {
    return (
      <Card className="space-y-2 py-12 text-center">
        <p className="text-sm text-text-tertiary">{loadError ?? "This form isn't available."}</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <h1 className="text-xl leading-7 font-semibold text-text-primary">{form.formName}</h1>
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

        <Button type="submit" className="w-full py-3" isDisabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit Registration"}
        </Button>
      </form>
    </Card>
  );
}