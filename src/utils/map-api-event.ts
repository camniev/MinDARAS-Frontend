// src/utils/map-api-event.ts — export deriveStatus so create-event-dialog can reuse it
import { ApiEvent } from "@/utils/mindaras-api-types";
import { EventItem } from "./mindaras-data";

function formatDateTime(startIso: string) {
  const start = new Date(startIso);
  const isMidnight = start.getHours() === 0 && start.getMinutes() === 0;
  const date = start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const time = isMidnight ? "All day" : start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

export function mapApiEventToEventItem(apiEvent: ApiEvent): EventItem {
  const { date, time } = formatDateTime(apiEvent.eventStartDate);

  return {
    id: apiEvent.eventId,
    category: apiEvent.eventCategoryName ?? "Uncategorized",
    title: apiEvent.eventName,
    description: apiEvent.description ?? "No description provided.",
    date,
    time,
    location: apiEvent.eventLocation ?? "TBD",
    status: apiEvent.status, // ← from the backend now, not derived
    capacity: apiEvent.eventCapacity ?? undefined,
    registered: apiEvent.registrationCount,
    checkedIn: apiEvent.checkedInCount,
    startDateIso: apiEvent.eventStartDate,
    endDateIso: apiEvent.eventEndDate,
  };
}