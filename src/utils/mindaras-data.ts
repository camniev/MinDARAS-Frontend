// src/utils/mindaras-data.ts — update EventItem, keep the rest of the file as-is

export type EventStatus = "Active" | "Draft" | "Completed";

export type EventItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: EventStatus;
  capacity?: number;   // API can return null — no capacity set yet
  registered?: number; // no registration-count endpoint yet
};

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
  key: string;          // stable React key, client-only, never sent to the API
  typeId: string;       // matches AVAILABLE_FIELD_TYPES[].id
  fieldName: string;    // technical key sent to the API as "fieldName"
  label: string;        // display label sent as "fieldLabel" — user-editable
  inputType: FormFieldType["inputType"];
  required: boolean;
  options: string[];    // only meaningful when inputType === "select"
  locked?: boolean;     // true for the default Name/Email/Ticket Type fields
};

export const DEFAULT_BUILDER_FIELDS: BuilderField[] = [
  {
    key: "field-name",
    typeId: "text",
    fieldName: "full_name",
    label: "Full Name",
    inputType: "text",
    required: true,
    options: [],
    locked: true,
  },
  {
    key: "field-email",
    typeId: "email",
    fieldName: "email",
    label: "Email Address",
    inputType: "email",
    required: true,
    options: [],
    locked: true,
  },
];