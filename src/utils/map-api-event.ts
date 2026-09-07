// src/utils/map-api-event.ts
import { ApiEvent } from "@/utils/mindaras-api-types";
import { EventItem, EventStatus } from "@/utils/event-pulse-data";

function deriveStatus(endDateIso: string): EventStatus {
  const end = new Date(endDateIso);
  return end.getTime() < Date.now() ? "Completed" : "Active";
}

// Some records have a midnight end-of-day time with no real "time" meaning
// (e.g. all-day multi-day events) — detect that and skip showing a clock time.
function formatDateTime(startIso: string) {
  const start = new Date(startIso);
  const isMidnight = start.getHours() === 0 && start.getMinutes() === 0;

  const date = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const time = isMidnight
    ? "All day"
    : start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

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
    status: deriveStatus(apiEvent.eventEndDate),
    capacity: apiEvent.eventCapacity ?? undefined,
    registered: undefined, // no count available from this endpoint yet
  };
}