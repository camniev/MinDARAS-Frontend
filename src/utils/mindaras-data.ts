// src/utils/mindaras-data.ts — update EventItem, keep the rest of the file as-is

import { FormTheme } from "./mindaras-api-types";

export type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled"; // ← add "Cancelled"

export type EventItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: EventStatus;
  capacity?: number;
  registered?: number;
  checkedIn?: number;
  startDateIso: string;
  endDateIso: string;
};

export type FormFieldType = {
  id: string;
  label: string;
  inputType: "text" | "email" | "select" | "number" | "date" | "textarea" | "checkbox" | "datetime";
};

export const AVAILABLE_FIELD_TYPES: FormFieldType[] = [
  { id: "text", label: "Single Line Text", inputType: "text" },
  { id: "email", label: "Email Address", inputType: "email" },
  { id: "select", label: "Dropdown Select", inputType: "select" },
  { id: "number", label: "Number", inputType: "number" },
  { id: "date", label: "Date", inputType: "date" },
  { id: "datetime", label: "Date & Time", inputType: "datetime" },
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
  sectionId: string;         // ← new
  branchingConfig?: Record<string, string>; // option value -> target sectionId
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
    sectionId: ""
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
    sectionId: ""
  },
  {
    key: "field-position",
    typeId: "text",
    fieldName: "position_designation",
    label: "Position / Designation",
    inputType: "text",
    required: true,
    options: [],
    locked: true,
    sectionId: ""
  },
  {
    key: "field-office",
    typeId: "text",
    fieldName: "office",
    label: "Agency / Office / Division",
    inputType: "text",
    required: true,
    options: [],
    locked: true,
    sectionId: ""
  },
  {
    key: "field-sc-choice",
    typeId: "select",
    fieldName: "sc_choice_select",
    label: "Senior Citizen?",
    inputType: "select",
    required: true,
    options: ["Yes", "No"],
    locked: true,
    sectionId: ""
  },
  {
    key: "field-pwd-choice",
    typeId: "select",
    fieldName: "pwd_choice_select",
    label: "Are you a Person With Disability (PWD)?",
    inputType: "select",
    required: true,
    options: ["Yes", "No"],
    locked: true,
    sectionId: ""
  },
  {
    key: "field-contact-number",
    typeId: "text",
    fieldName: "contact_number",
    label: "Contact Number",
    inputType: "text",
    required: true,
    options: [],
    locked: true,
    sectionId: ""
  },
];

export const PERSONAL_INFO_FIELD_NAMES = new Set([
  "full_name",
  "position_designation",
  "office",
  "sc_choice_select",
  "pwd_choice_select",
  "contact_number",
]);

export type BuilderSection = {
  sectionId: string;
  title: string;
  description: string;
  orderIndex: number;
  defaultNextSectionId: string | null;
};

export function createDefaultSections(): BuilderSection[] {
  const firstSectionId = crypto.randomUUID();
  const personalInfoId = crypto.randomUUID();
  const submitId = crypto.randomUUID();
  return [
    { sectionId: firstSectionId, title: "Data Privacy Consent", description: "", orderIndex: 0, defaultNextSectionId: personalInfoId },
    { sectionId: personalInfoId, title: "Personal Information", description: "", orderIndex: 1, defaultNextSectionId: submitId },
    { sectionId: submitId, title: "Submit", description: "", orderIndex: 2, defaultNextSectionId: null },
  ];
}

export const DEFAULT_FORM_THEME: FormTheme = {
  backgroundType: "color",
  backgroundColor: "#F4F5F7",
  backgroundImageUrl: null,
  primaryColor: "#3C50E0",
  headerImageUrl: null,
  headerText: null,
  headerTextColor: "#1C2434",
};