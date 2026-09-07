// src/lib/event-categories.ts
import { apiGet } from "@/lib/api-client";
import { EventCategory } from "@/utils/mindaras-api-types";

export function fetchEventCategories() {
    return apiGet<EventCategory[]>("/api/EventCategory/FetchActiveEventCategories");
}