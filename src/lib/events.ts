// src/lib/events.ts
import { apiGet } from "@/lib/api-client";
import { ApiEvent, EventDetail, RegistrationListItem, FormDefinitionDetail } from "@/utils/mindaras-api-types";
import { ApiError } from "@/lib/api-client";

export function fetchActiveEvents() {
  return apiGet<ApiEvent[]>("/api/Event/FetchActiveEvents");
}

// add alongside the existing fetchActiveEvents
import { apiPost } from "@/lib/api-client";
import { SaveEventFormPayload, SaveEventFormResponse } from "@/utils/mindaras-api-types";

export function saveEventForm(payload: SaveEventFormPayload) {
  return apiPost<SaveEventFormResponse, SaveEventFormPayload>(
    "/api/Event/SaveEventForms",
    payload,
  );
}

export function fetchEventById(eventId: string) {
  return apiGet<EventDetail>(`/api/Event/${eventId}`);
}

export function fetchRegistrationsForEvent(eventId: string) {
  return apiGet<RegistrationListItem[]>(`/api/Registration/${eventId}/Registrations`);
}

export async function fetchFormForEvent(eventId: string): Promise<FormDefinitionDetail | null> {
  try {
    return await apiGet<FormDefinitionDetail>(`/api/FormDefinition/${eventId}/Form`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// api call for registration/saving participants data
import { RegisterParticipantPayload, RegistrationConfirmation } from "@/utils/mindaras-api-types";

export function registerForEvent(eventId: string, payload: RegisterParticipantPayload) {
  return apiPost<RegistrationConfirmation, RegisterParticipantPayload>(
    `/api/Registration/${eventId}/Register`,
    payload,
  );
}