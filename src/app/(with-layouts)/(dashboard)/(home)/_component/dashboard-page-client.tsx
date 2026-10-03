// _component/dashboard-page-client.tsx
"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { ApiError } from "@/lib/api-client";
import { fetchDivisionStatistics } from "@/lib/dashboard";
import { cn } from "@/utils/cn";
import { DashboardSummary } from "@/utils/mindaras-api-types";
import { Calendar, CheckCircle1, UserMultiple1 } from "@tailgrids/icons";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import UpcomingEvents from "./upcoming-events";

const STATUS_COLOR: Record<string, "success" | "gray" | "warning" | "blue" | "error"> = {
  Upcoming: "blue",
  Ongoing: "success",
  Completed: "gray",
  Cancelled: "error",
};

export default function DashboardPageClient() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchDivisionStatistics()
      .then(setData)
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : "Couldn't load dashboard data.";
        setLoadError(message);
        toast.error("Couldn't load dashboard", { description: message });
      })
      .finally(() => setIsLoading(false));
  }, []);

  

  const topEvents = useMemo(() => {
    const events = data?.events ?? [];
    return events
      .filter((e) => e.status === "Upcoming" || e.status === "Ongoing")
      .sort((a, b) => b.registrationCount - a.registrationCount)
      .slice(0, 10)
      .map((e) => ({
        name: e.eventName,
        Registrations: e.registrationCount,
        "Checked-In": e.checkedInCount,
      }));
  }, [data]);

  function truncateLabel(value: string) {
    return value.length > 14 ? `${value.slice(0, 14)}…` : value;
  }

  if (isLoading) {
    return (
      <div className="mt-6 space-y-5 px-2 lg:px-6">
        <Card className="h-28 animate-pulse bg-background-gray-secondary_alt" />
        <Card className="h-80 animate-pulse bg-background-gray-secondary_alt" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mt-6 px-2 lg:px-6">
        <Card className="py-12 text-center text-sm text-text-tertiary">{loadError}</Card>
      </div>
    );
  }

  if (!data?.division) {
    return (
      <div className="mt-6 px-2 lg:px-6">
        <Card className="py-12 text-center text-sm text-text-tertiary">
          Your account isn&apos;t assigned to a division yet, so there&apos;s nothing to show here.
        </Card>
      </div>
    );
  }

  const { division, events } = data;

  const summaryCards = [
    { id: "events", title: "Total Events", value: division.eventCount, icon: <Calendar />, bg: "bg-badge-blue-background", fg: "text-badge-blue-icon-color" },
    { id: "registrations", title: "Total Registrations", value: division.registrationCount, icon: <UserMultiple1 />, bg: "bg-badge-purple-background", fg: "text-badge-purple-icon-color" },
    { id: "checked-in", title: "Total Checked-In", value: division.checkedInCount, icon: <CheckCircle1 />, bg: "bg-badge-success-background", fg: "text-badge-success-icon-color" },
  ];

  return (
    <div className="mt-6 space-y-5 px-2 lg:px-6">
      <div>
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Dashboard</h1>
        <p className="text-sm leading-5 text-text-tertiary">
          {division.divisionOfficeName} ({division.divisionOfficeAbbrev})
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {summaryCards.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className={cn("flex size-8 items-center justify-center rounded-lg [&>svg]:size-4.5", c.bg, c.fg)}>
                {c.icon}
              </div>
            </CardHeader>
            <CardContent className="mt-4 p-0">
              <div className="mb-1 text-2xl leading-8 font-semibold text-text-primary">{c.value}</div>
              <span className="text-sm leading-5 font-medium text-text-tertiary">{c.title}</span>
            </CardContent>
          </Card>
        ))}
      </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
                <Card className="p-5">
                  <h2 className="mb-4 text-lg leading-7 font-semibold text-text-primary">
                    Top 10 Events — Registrations vs. Check-Ins
                  </h2>
                  {topEvents.length === 0 ? (
                    <p className="py-10 text-center text-sm text-text-tertiary">
                      No upcoming or ongoing events in your division.
                    </p>
                  ) : (
                    <ChartContainer config={{}} className="w-full" width="100%" height={360}>
                      <BarChart data={topEvents} margin={{ bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          fontSize={11}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                          tickFormatter={truncateLabel}
                        />
                        <YAxis allowDecimals={false} fontSize={12} />
                        <Tooltip />
                        <Legend verticalAlign="top" height={32} />
                        <Bar dataKey="Registrations" fill="#5750F1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Checked-In" fill="#8DD3BB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </Card>
            </div>
            <UpcomingEvents />
        </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="overflow-hidden p-0">
          <TableRoot className="w-full table-fixed rounded-none border-none">
            <TableHeader>
              <TableRow className="bg-background-gray-secondary_alt">
                <TableHead className="px-6 py-2.5 text-xs font-semibold text-text-secondary" style={{ width: '40%'}}>Event Name</TableHead>
                <TableHead className="px-6 py-2.5 text-xs font-semibold text-text-secondary" style={{ width: '20%'}}>Schedule</TableHead>
                <TableHead className="px-6 py-2.5 text-xs font-semibold text-text-secondary">Status</TableHead>
                <TableHead className="px-6 py-2.5 text-xs font-semibold text-text-secondary">Registrations</TableHead>
                <TableHead className="px-6 py-2.5 text-xs font-semibold text-text-secondary">Checked-In</TableHead>
                <TableHead className="px-6 py-2.5 text-xs font-semibold text-text-secondary">Attendance Rate (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell className="p-6 text-center text-sm text-text-tertiary" colSpan={5}>
                    No events yet.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((e) => {
                  const attendanceRate =
                    e.registrationCount > 0 ? (e.checkedInCount / e.registrationCount) * 100 : null;

                  return (
                    <TableRow key={e.eventId} className="[&_td]:border-none">
                      <TableCell className="h-14 px-6 py-3 text-sm font-medium text-text-primary">{e.eventName}</TableCell>
                      <TableCell className="h-14 px-6 py-3 text-sm font-medium text-text-primary">{e.eventDateRange}</TableCell>
                      <TableCell className="h-14 px-6 py-3">
                        <Badge color={STATUS_COLOR[e.status] ?? "gray"} size="sm">{e.status}</Badge>
                      </TableCell>
                      <TableCell className="h-14 px-6 py-3 text-sm text-text-secondary">{e.registrationCount}</TableCell>
                      <TableCell className="h-14 px-6 py-3 text-sm text-text-secondary">{e.checkedInCount}</TableCell>
                      <TableCell className="h-14 px-6 py-3 text-sm text-text-secondary">
                        {attendanceRate === null ? "—" : `${attendanceRate.toFixed(1)}%`}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </TableRoot>
        </CardContent>
      </Card>
    </div>
  );
}