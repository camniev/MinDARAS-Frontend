"use client";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { ApiError } from "@/lib/api-client";
import { fetchActiveEvents } from "@/lib/events";
import { cn } from "@/utils/cn";
import { EventItem, EventStatus } from "@/utils/mindaras-data";
import { mapApiEventToEventItem } from "@/utils/map-api-event";
import { Calendar, CheckCircle1, Search1, UserMultiple1 } from "@tailgrids/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CreateEventDialog from "./create-event-dialog";
import EventCard from "./event-card";

const STATUS_FILTERS: Array<{ id: "all" | EventStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "Upcoming", label: "Upcoming" },
  { id: "Ongoing", label: "Ongoing" },
  { id: "Completed", label: "Completed" },
  { id: "Cancelled", label: "Cancelled" },
];

function isSameMonth(iso: string, reference: Date) {
  const d = new Date(iso);
  return d.getFullYear() === reference.getFullYear() && d.getMonth() === reference.getMonth();
}

export default function EventsPageClient() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EventStatus>("all");

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const apiEvents = await fetchActiveEvents();
      setEvents(apiEvents.map(mapApiEventToEventItem));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't load events.";
      setLoadError(message);
      toast.error("Couldn't load events", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filtered = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;

      // Completed events only show if they wrapped up this calendar month —
      // keeps the grid from accumulating years of finished events by default.
      // if (e.status === "Completed" && !isSameMonth(e.endDateIso, now)) return false;
      //if (e.status === "Completed") return false;

      if (search.trim()) {
        const term = search.toLowerCase();
        const haystack = `${e.title} ${e.category} ${e.location}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [events, search, statusFilter]);

  const stats = useMemo(() => {
    const ongoing = events.filter((e) => e.status === "Ongoing").length;
    const totalRegistered = events.reduce((sum, e) => sum + (e.registered ?? 0), 0);
    return [
      { id: "total", title: "Total Events", value: events.length, icon: <Calendar />, iconBgClass: "bg-badge-blue-background", iconColorClass: "text-badge-blue-icon-color" },
      { id: "active", title: "Active Events", value: ongoing, icon: <CheckCircle1 />, iconBgClass: "bg-badge-success-background", iconColorClass: "text-badge-success-icon-color" },
      { id: "registered", title: "Total Registrations", value: totalRegistered, icon: <UserMultiple1 />, iconBgClass: "bg-badge-purple-background", iconColorClass: "text-badge-purple-icon-color" },
    ];
  }, [events]);

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Events Management</h1>
          <p className="text-sm leading-5 text-text-tertiary">Create and oversee your upcoming events.</p>
        </div>
        <Breadcrumbs
          dividerType="chevron"
          items={[{ href: "/", label: "Home" }, { href: "/events", label: "Events" }]}
        />
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <div className="flex items-center justify-end">
          <CreateEventDialog onCreate={(event) => setEvents((prev) => [event, ...prev])} />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className={cn("flex size-8 items-center justify-center rounded-lg [&>svg]:size-4.5", item.iconBgClass, item.iconColorClass)}>
                  {item.icon}
                </div>
              </CardHeader>
              <CardContent className="mt-4 p-0">
                <div className="mb-1 text-2xl leading-8 font-semibold text-text-primary">{item.value}</div>
                <span className="text-sm leading-5 font-medium text-text-tertiary">{item.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="w-full sm:max-w-70">
            <InputGroupAddon align="inline-start" className="pr-1 text-text-secondary">
              <Search1 />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search events…"
              className="text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                  statusFilter === f.id
                    ? "border-brand-500 bg-brand-50 text-brand-600"
                    : "border-card-border text-text-secondary hover:bg-background-gray-secondary_alt",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-48 animate-pulse bg-background-gray-secondary_alt" />
            ))}
          </div>
        ) : loadError ? (
          <Card className="space-y-3 py-10 text-center">
            <p className="text-sm text-text-tertiary">{loadError}</p>
            <Button appearance="outline" size="sm" className="mx-auto" onClick={loadEvents}>
              Retry
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="py-12 text-center text-sm text-text-tertiary">
            {events.length === 0 ? "No events yet. Create your first event to get started." : "No events match your filters."}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}