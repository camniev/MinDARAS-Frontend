// src/lib/events.ts
import { apiGet } from "@/lib/api-client";
import { ApiEvent } from "@/utils/mindaras-api-types";

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