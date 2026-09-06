"use client";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import { EventItem, INITIAL_EVENTS } from "@/utils/event-pulse-data";
import { Calendar, CheckCircle1, UserMultiple1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import CreateEventDialog from "./create-event-dialog";
import EventCard from "./event-card";

export default function EventsPageClient() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);

  const stats = useMemo(() => {
    const active = events.filter((e) => e.status === "Active").length;
    const totalRegistered = events.reduce((sum, e) => sum + e.registered, 0);
    return [
      {
        id: "total",
        title: "Total Events",
        value: events.length,
        icon: <Calendar />,
        iconBgClass: "bg-badge-blue-background",
        iconColorClass: "text-badge-blue-icon-color",
      },
      {
        id: "active",
        title: "Active Events",
        value: active,
        icon: <CheckCircle1 />,
        iconBgClass: "bg-badge-success-background",
        iconColorClass: "text-badge-success-icon-color",
      },
      {
        id: "registered",
        title: "Total Registrations",
        value: totalRegistered,
        icon: <UserMultiple1 />,
        iconBgClass: "bg-badge-purple-background",
        iconColorClass: "text-badge-purple-icon-color",
      },
    ];
  }, [events]);

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
            Events Management
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Create and oversee your upcoming events.
          </p>
        </div>

        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/", label: "Home" },
            { href: "/events", label: "Events" },
          ]}
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

        {events.length === 0 ? (
          <Card className="py-12 text-center text-sm text-text-tertiary">
            No events yet. Create your first event to get started.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
