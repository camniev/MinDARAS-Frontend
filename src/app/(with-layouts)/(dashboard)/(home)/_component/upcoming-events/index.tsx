// (with-layouts)/(dashboard)/(home)/_component/upcoming-events/index.tsx
"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { ApiError } from "@/lib/api-client";
import { fetchActiveEvents } from "@/lib/events";
import { ApiEvent } from "@/utils/mindaras-api-types";
import { ChevronDown, ChevronLeft, ChevronRight, MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back up to Sunday
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

// An event "occurs" on a given day if that day falls within its date range —
// this is what makes a multi-day event (e.g. Oct 5–6) show up under both days.
function eventOccursOn(event: ApiEvent, day: Date): boolean {
  const start = new Date(event.eventStartDate);
  const end = new Date(event.eventEndDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return day >= start && day <= end;
}

function formatTimeRange(event: ApiEvent, day: Date): string {
  const start = new Date(event.eventStartDate);
  const end = new Date(event.eventEndDate);
  const isSingleDayEvent = start.toDateString() === end.toDateString();

  if (!isSingleDayEvent) {
    // multi-day event — a specific clock time for "today" isn't meaningful
    return isSameDay(day, start)
      ? `Starts ${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
      : isSameDay(day, end)
        ? `Ends ${end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
        : "Ongoing";
  }

  const fmt = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveEvents()
      .then(setEvents)
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Couldn't load events.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const eventsOnSelectedDay = useMemo(
    () => events.filter((e) => eventOccursOn(e, selectedDate)),
    [events, selectedDate],
  );

  function goToWeek(offsetDays: number) {
    const nextWeekStart = addDays(weekStart, offsetDays);
    setWeekStart(nextWeekStart);
    setSelectedDate(nextWeekStart); // land on that week's Sunday by default
  }

  const monthLabel = selectedDate.toLocaleDateString(undefined, { month: "long" });

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg leading-7 font-semibold text-text-primary">Upcoming Events</h2>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-background-gray-secondary_alt px-3 py-2">
        <button
          type="button"
          onClick={() => goToWeek(-7)}
          aria-label="Previous week"
          className="flex size-7 items-center justify-center rounded-full bg-white text-text-secondary shadow-sm hover:text-brand-500"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-text-primary">{monthLabel}</span>
        <button
          type="button"
          onClick={() => goToWeek(7)}
          aria-label="Next week"
          className="flex size-7 items-center justify-center rounded-full bg-white text-text-secondary shadow-sm hover:text-brand-500"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const selected = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelectedDate(day)}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                  selected ? "bg-brand-500 text-white" : "text-text-tertiary"
                }`}
              >
                {WEEKDAY_LABELS[day.getDay()]}
              </span>
              <span
                className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium ${
                  selected
                    ? "border border-brand-200 bg-brand-50 text-brand-600"
                    : "text-text-secondary"
                }`}
              >
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 pt-1">
        {isLoading ? (
          <div className="h-20 animate-pulse rounded-lg bg-background-gray-secondary_alt" />
        ) : loadError ? (
          <p className="py-6 text-center text-sm text-text-tertiary">{loadError}</p>
        ) : eventsOnSelectedDay.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-tertiary">No events on this day.</p>
        ) : (
          eventsOnSelectedDay.map((event) => {
            const isExpanded = expandedEventId === event.eventId;
            return (
              <div key={event.eventId} className="rounded-lg border border-card-border">
                <button
                  type="button"
                  onClick={() => setExpandedEventId(isExpanded ? null : event.eventId)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{event.eventName}</p>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      {formatTimeRange(event, selectedDate)}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-4 shrink-0 text-text-tertiary transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isExpanded && (
                  <div className="space-y-2 border-t border-card-border px-4 py-3">
                    {event.eventLocation && (
                      <p className="flex items-center gap-2 text-xs text-text-secondary">
                        <MapMarker5 className="size-3.5 text-icon-secondary" />
                        {event.eventLocation}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {event.eventCategoryName && (
                          <Badge color="blue" size="sm">{event.eventCategoryName}</Badge>
                        )}
                        <span className="text-xs text-text-tertiary">
                          {event.registrationCount} registered
                        </span>
                      </div>
                      <Link
                        href={`/events/${event.eventId}`}
                        className="text-xs font-medium text-brand-500 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}