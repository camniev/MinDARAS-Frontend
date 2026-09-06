// Mock data layer for the Event Management feature (Events, Form Builder,
// Registration List, QR Attendance). Swap these arrays / helper functions
// for real API calls (see src/services/api for the pattern used elsewhere
// in this template) when you wire this up to a backend.

export type EventStatus = "Active" | "Draft" | "Completed";

export type EventItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string; // e.g. "Oct 15, 2026"
  time: string; // e.g. "09:00 AM"
  location: string;
  status: EventStatus;
  capacity: number;
  registered: number;
};

export const EVENT_CATEGORIES = [
  "Tech Conference",
  "Workshop",
  "Bootcamp",
  "Networking",
  "Webinar",
] as const;

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    category: "Tech Conference",
    title: "Tech Summit 2026",
    description: "Annual gathering of technology leaders and developers.",
    date: "Oct 15, 2026",
    time: "09:00 AM",
    location: "Grand Convention Hall",
    status: "Active",
    capacity: 400,
    registered: 286,
  },
  {
    id: "evt-2",
    category: "Bootcamp",
    title: "Marketing Growth Bootcamp",
    description: "Two-day intensive on growth marketing and analytics.",
    date: "Nov 3, 2026",
    time: "10:00 AM",
    location: "Innovation Hub, Floor 4",
    status: "Active",
    capacity: 120,
    registered: 74,
  },
  {
    id: "evt-3",
    category: "Workshop",
    title: "Product Design Sprint",
    description: "Hands-on workshop covering rapid prototyping methods.",
    date: "Sep 28, 2026",
    time: "01:00 PM",
    location: "Design Studio B",
    status: "Draft",
    capacity: 60,
    registered: 12,
  },
];

export type RegistrationStatus = "Pending" | "Checked-In";

export type Registration = {
  id: string;
  attendee: string;
  email: string;
  eventId: string;
  eventTitle: string;
  ticketType: string;
  ticketCode: string;
  status: RegistrationStatus;
  checkInTime: string | null;
};

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: "reg-1",
    attendee: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    eventId: "evt-1",
    eventTitle: "Tech Summit 2026",
    ticketType: "VIP Pass",
    ticketCode: "TS2026-8821",
    status: "Pending",
    checkInTime: null,
  },
  {
    id: "reg-2",
    attendee: "Marcus Lee",
    email: "marcus.lee@example.com",
    eventId: "evt-1",
    eventTitle: "Tech Summit 2026",
    ticketType: "General Admission",
    ticketCode: "TS2026-8822",
    status: "Checked-In",
    checkInTime: "09:14 AM",
  },
  {
    id: "reg-3",
    attendee: "Priya Nair",
    email: "priya.nair@example.com",
    eventId: "evt-1",
    eventTitle: "Tech Summit 2026",
    ticketType: "General Admission",
    ticketCode: "TS2026-8823",
    status: "Pending",
    checkInTime: null,
  },
  {
    id: "reg-4",
    attendee: "Diego Alvarez",
    email: "diego.alvarez@example.com",
    eventId: "evt-2",
    eventTitle: "Marketing Growth Bootcamp",
    ticketType: "General Admission",
    ticketCode: "MGB2026-0114",
    status: "Checked-In",
    checkInTime: "10:02 AM",
  },
  {
    id: "reg-5",
    attendee: "Hannah Kim",
    email: "hannah.kim@example.com",
    eventId: "evt-2",
    eventTitle: "Marketing Growth Bootcamp",
    ticketType: "VIP Pass",
    ticketCode: "MGB2026-0115",
    status: "Pending",
    checkInTime: null,
  },
  {
    id: "reg-6",
    attendee: "Omar Farouk",
    email: "omar.farouk@example.com",
    eventId: "evt-3",
    eventTitle: "Product Design Sprint",
    ticketType: "General Admission",
    ticketCode: "PDS2026-0032",
    status: "Pending",
    checkInTime: null,
  },
];

export type FormFieldType = {
  id: string;
  label: string;
  inputType: "text" | "email" | "select" | "number" | "date" | "textarea" | "checkbox";
};

export const AVAILABLE_FIELD_TYPES: FormFieldType[] = [
  { id: "text", label: "Single Line Text", inputType: "text" },
  { id: "email", label: "Email Address", inputType: "email" },
  { id: "select", label: "Dropdown Select", inputType: "select" },
  { id: "number", label: "Number", inputType: "number" },
  { id: "date", label: "Date", inputType: "date" },
  { id: "textarea", label: "Long Answer", inputType: "textarea" },
  { id: "checkbox", label: "Checkbox", inputType: "checkbox" },
];

export type BuilderField = {
  key: string;
  typeId: string;
  label: string;
  inputType: FormFieldType["inputType"];
  required: boolean;
  locked?: boolean;
};

export const DEFAULT_BUILDER_FIELDS: BuilderField[] = [
  { key: "field-name", typeId: "text", label: "Full Name", inputType: "text", required: true, locked: true },
  { key: "field-email", typeId: "email", label: "Email Address", inputType: "email", required: true, locked: true },
  {
    key: "field-ticket",
    typeId: "select",
    label: "Ticket Type",
    inputType: "select",
    required: true,
    locked: true,
  },
];
