"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "@/components/tailgrids/core/accordion";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { FormFieldDetail, RegistrationListItem } from "@/utils/mindaras-api-types";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Aggregation,
  aggregateByField,
  Bucket,
  donutLabel,
  topWithOthers,
  truncateLabel,
} from "./statistics-model";

// fieldName values of the locked default fields (see DEFAULT_BUILDER_FIELDS). Office also lists the
// name used by forms created before the defaults were changed, so existing events still get a chart.
const SECTIONS = [
  { key: "gender", title: "Gender", fieldNames: ["gender_choice_select"] },
  { key: "country", title: "Country", fieldNames: ["country"] },
  {
    key: "office",
    title: "Agency / Organization / Office",
    fieldNames: ["office", "office_agency_affiliation"],
  },
  { key: "position", title: "Position / Designation", fieldNames: ["position_designation"] },
] as const;

const MAX_BARS = 10;
const PALETTE = ["#5750F1", "#8DD3BB", "#FFA70B", "#F87171", "#38BDF8", "#A78BFA", "#34D399", "#FB923C"];
const BRAND = "#5750F1";
const BRAND_LIGHT = "#C4C0FA";

const hideZero = (value: unknown) => (Number(value) > 0 ? String(value) : "");

type DonutDatum = { name: string; value: number };

function DonutChart({
  data,
  total,
  colors = PALETTE,
}: {
  data: DonutDatum[];
  total: number;
  colors?: string[];
}) {
  return (
    <ChartContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={100}
          paddingAngle={2}
          label={donutLabel(total)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartContainer>
  );
}

// "Overlay" bars: a narrow Checked-In bar drawn over a wide Registered bar for the same category.
// Recharts centres each bar on its own category band, so giving the two series separate
// (second one hidden) x-axes makes them share a centre instead of sitting side by side.
function OverlayBars({ buckets }: { buckets: Bucket[] }) {
  return (
    <ChartContainer width="100%" height={380}>
      <BarChart data={buckets} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          xAxisId="registered"
          dataKey="label"
          interval={0}
          angle={-30}
          textAnchor="end"
          height={70}
          fontSize={11}
          tickFormatter={truncateLabel(14)}
        />
        <XAxis xAxisId="checkedIn" dataKey="label" hide />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip />
        <Legend verticalAlign="top" height={28} />
        <Bar
          xAxisId="registered"
          dataKey="registered"
          name="Registered"
          fill={BRAND_LIGHT}
          barSize={40}
          radius={[4, 4, 0, 0]}
        >
          <LabelList dataKey="registered" position="top" fontSize={11} />
        </Bar>
        <Bar
          xAxisId="checkedIn"
          dataKey="checkedIn"
          name="Checked-In"
          fill={BRAND}
          barSize={20}
          radius={[4, 4, 0, 0]}
        >
          <LabelList
            dataKey="checkedIn"
            position="insideTop"
            fill="#fff"
            fontSize={11}
            formatter={hideZero}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function HorizontalBars({ buckets }: { buckets: Bucket[] }) {
  return (
    <ChartContainer width="100%" height={Math.max(220, buckets.length * 38 + 40)}>
      <BarChart
        data={buckets}
        layout="vertical"
        margin={{ top: 8, right: 36, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} fontSize={12} />
        <YAxis
          type="category"
          dataKey="label"
          width={170}
          interval={0}
          fontSize={11}
          tickFormatter={truncateLabel(26)}
        />
        <Tooltip />
        <Bar dataKey="registered" name="Registered" fill={BRAND} barSize={22} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="registered" position="right" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function VerticalBars({ buckets }: { buckets: Bucket[] }) {
  return (
    <ChartContainer width="100%" height={380}>
      <BarChart data={buckets} margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          interval={0}
          angle={-30}
          textAnchor="end"
          height={70}
          fontSize={11}
          tickFormatter={truncateLabel(16)}
        />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip />
        <Bar dataKey="registered" name="Registered" fill={BRAND} barSize={36} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="registered" position="top" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

type Props = {
  registrations: RegistrationListItem[];
  fields?: FormFieldDetail[];
};

const NO_FIELDS: FormFieldDetail[] = [];

export default function EventStatistics({ registrations, fields = NO_FIELDS }: Props) {
  const sections = useMemo(
    () =>
      SECTIONS.map((section) => {
        const field = fields.find((f) =>
          (section.fieldNames as readonly string[]).includes(f.fieldName),
        );
        const aggregation: Aggregation | null = field
          ? aggregateByField(registrations, field.fieldId)
          : null;
        return { ...section, field, aggregation };
      }),
    [registrations, fields],
  );

  const attendance = useMemo(() => {
    const total = registrations.length;
    const checkedIn = registrations.filter((r) => r.checkInTime).length;
    return {
      total,
      checkedIn,
      notCheckedIn: total - checkedIn,
      percent: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
    };
  }, [registrations]);

  function renderChart(key: (typeof SECTIONS)[number]["key"], aggregation: Aggregation) {
    const { buckets, answered } = aggregation;
    switch (key) {
      case "gender":
        return (
          <DonutChart
            data={buckets.map((b) => ({ name: b.label, value: b.registered }))}
            total={answered}
          />
        );
      case "country":
        return <OverlayBars buckets={topWithOthers(buckets, MAX_BARS)} />;
      case "office":
        return <HorizontalBars buckets={topWithOthers(buckets, MAX_BARS)} />;
      case "position":
        return <VerticalBars buckets={topWithOthers(buckets, MAX_BARS)} />;
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg leading-7 font-semibold text-text-primary">Event Statistics</h2>
        <p className="text-sm text-text-tertiary">
          Attendance and a breakdown of registration responses. Expand a section to see its chart.
        </p>
      </div>

      <AccordionRoot variant="style_one">
        <AccordionItem>
          <AccordionTrigger>
            <span className="flex flex-wrap items-center gap-x-2">
              Attendance
              {attendance.total > 0 && (
                <span className="text-xs font-normal text-text-tertiary">
                  {attendance.percent}% checked in
                </span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {attendance.total === 0 ? (
              <p className="text-sm text-text-tertiary">No registrations yet.</p>
            ) : (
              <>
                <div className="mb-2">
                  <p className="text-3xl leading-9 font-semibold text-text-primary">
                    {attendance.percent}%
                  </p>
                  <p className="text-sm text-text-tertiary">
                    {attendance.checkedIn} of {attendance.total} registrations checked in
                  </p>
                </div>
                <DonutChart
                  data={[
                    { name: "Checked-In", value: attendance.checkedIn },
                    { name: "Not Checked-In", value: attendance.notCheckedIn },
                  ]}
                  total={attendance.total}
                  colors={[BRAND, BRAND_LIGHT]}
                />
                <p className="mt-3 text-xs text-text-tertiary">
                  Checked in means scanned at least once. For multi-day events this doesn&apos;t
                  show attendance per day.
                </p>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {sections.map(({ key, title, field, aggregation }) => (
          <AccordionItem key={key}>
            <AccordionTrigger>
              <span className="flex flex-wrap items-center gap-x-2">
                {title}
                {aggregation && (
                  <span className="text-xs font-normal text-text-tertiary">
                    {aggregation.answered} response{aggregation.answered === 1 ? "" : "s"}
                  </span>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {!field || !aggregation ? (
                <p className="text-sm text-text-tertiary">
                  This form doesn&apos;t include a {title} field, so there&apos;s nothing to chart.
                </p>
              ) : aggregation.answered === 0 ? (
                <p className="text-sm text-text-tertiary">No responses yet.</p>
              ) : (
                <>
                  {renderChart(key, aggregation)}
                  <p className="mt-3 text-xs text-text-tertiary">
                    Based on {aggregation.answered} of {aggregation.total} registrations
                    {aggregation.answered < aggregation.total
                      ? "; the rest didn't answer this question (for example, they declined consent)."
                      : "."}
                  </p>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionRoot>
    </section>
  );
}
