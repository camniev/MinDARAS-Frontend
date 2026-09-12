"use client";

import { ApiError } from "@/lib/api-client";
import { fetchEventById, fetchFormForEvent, registerForEvent } from "@/lib/events";
import { resolveAssetUrl } from "@/lib/resolve-asset-url";
import { EventDetail, FormDefinitionDetail, RegistrationConfirmation } from "@/utils/mindaras-api-types";
import { DEFAULT_FORM_THEME } from "@/utils/mindaras-data";
import { useEffect, useState } from "react";
import DynamicFieldInput from "./dynamic-field-input";
import RegistrationSuccess from "./registration-success";
import { deriveStatus } from "@/utils/map-api-event";

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

  const [event, setEvent] = useState<EventDetail | null>(null);

  const theme = form?.theme ?? DEFAULT_FORM_THEME;
  const backgroundImageUrl = resolveAssetUrl(theme.backgroundImageUrl);
  const headerImageUrl = resolveAssetUrl(theme.headerImageUrl);
  const accentColor = theme.primaryColor ?? "#3C50E0";

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
    Promise.all([fetchFormForEvent(eventId), fetchEventById(eventId)])
      .then(([formData, eventData]) => {
        if (!formData) {
          setLoadError("Registration isn't open for this event yet.");
          return;
        }
        setForm(formData);
        setEvent(eventData);
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
    return (
      <Shell style={pageBackgroundStyle}>
        <div className="h-64 w-full animate-pulse rounded-lg bg-white/70" />
      </Shell>
    );
  }

  if (confirmation) {
    return (
      <Shell style={pageBackgroundStyle}>
        <RegistrationSuccess confirmation={confirmation} />
      </Shell>
    );
  }

  if (loadError || !form) {
    return (
      <Shell style={pageBackgroundStyle}>
        <div className="space-y-2 rounded-lg bg-white py-12 text-center shadow-sm">
          <p className="text-sm text-gray-500">{loadError ?? "This form isn't available."}</p>
        </div>
      </Shell>
    );
  }

  const eventStatus = event ? deriveStatus(event.eventStartDate, event.eventEndDate) : null;
  const isRegistrationOpen = form?.isActive && eventStatus === "Upcoming";

  // ...after the existing isLoading / confirmation / loadError checks, before the main return:
  if (!isRegistrationOpen) {
    return (
      <Shell style={pageBackgroundStyle}>
        <div className="space-y-2 rounded-lg bg-white py-12 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            {eventStatus === "Completed"
              ? "This event has already taken place."
              : eventStatus === "Ongoing"
                ? "This event is currently underway — registration is closed."
                : "Registration for this event is currently closed."}
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell style={pageBackgroundStyle}>
      {headerImageUrl && (
        <img
          src={headerImageUrl}
          alt=""
          className="mb-3 aspect-[4/1] w-full rounded-lg object-cover"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="h-2.5 w-full" style={{ backgroundColor: accentColor }} />
          <div className="space-y-3 p-6">
            <h1
              className="text-[28px] leading-9 font-normal"
              style={{ color: theme.headerTextColor ?? "#1C2434" }}
            >
              {theme.headerText || form.formName}
            </h1>
            {form.formDescription && (
              <p className="border-t border-gray-100 pt-3 text-sm leading-6 text-gray-600">
                {form.formDescription}
              </p>
            )}
            <p className="text-xs text-red-600">* Required</p>
          </div>
        </div>

        {form.formFields.map((field) => (
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md px-6 py-2 text-sm font-medium text-white shadow-sm transition disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => setValues({})}
            className="text-sm font-medium"
            style={{ color: accentColor }}
          >
            Clear form
          </button>
        </div>
      </form>
    </Shell>
  );
}