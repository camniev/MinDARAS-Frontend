// src/lib/events.ts
import { apiGet } from "@/lib/api-client";
import { ApiEvent } from "@/utils/mindaras-api-types";

export function fetchActiveEvents() {
  return apiGet<ApiEvent[]>("/api/Event/FetchActiveEvents");
}