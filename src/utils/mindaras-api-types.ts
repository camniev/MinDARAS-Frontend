// src/utils/mindaras-api-types.ts

// payloads for events
export type SaveEventPayload = {
  eventName: string;
  eventCategoryId: string; // GUID
  eventStartDate: string;  // ISO 8601
  eventEndDate: string;    // ISO 8601
  eventLocation?: string;
  description?: string;
  eventCapacity?: number;
  userId: string; // GUID
};

export type ApiEvent = {
  eventId: string;
  eventName: string;
  eventRefNo: string;
  eventStartDate: string; // ISO, no timezone offset
  eventEndDate: string;
  eventCategoryName: string | null;
  description: string | null;
  eventLocation: string | null;
  eventCapacity: number | null;
  registrationCount: number;
  checkedInCount: number;
};

export type SaveEventResponse = {
  message: string;
  eventId: string;
  eventRefNo: string;
};

export type EventCategory = {
  eventCategoryId: string;
  eventCategoryName: string;
};
// end payloads for events

// new types and payload for form definition and form fields
export type FormFieldDetail = {
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  options: string | null;
  orderIndex: number;
  isLocked: boolean;
};

// type for FormThem
export type FormTheme = {
  backgroundType: "color" | "image";
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  primaryColor: string | null;
  headerImageUrl: string | null;
  headerText: string | null;
  headerTextColor: string | null;
};

// type for FormDefinitionDetail
export type FormDefinitionDetail = {
  formId: string;
  formName: string;
  formDescription: string | null;
  formFields: FormFieldDetail[];
  theme: FormTheme | null;
};

export type FormFieldPayload = {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  options: string;
  isLocked: boolean;
};

export type SaveEventFormPayload = {
  eventId: string;
  userId: string;
  formName: string;
  formDescription?: string;
  formFields: FormFieldPayload[];
};

export type SaveEventFormResponse = {
  message: string;
};
// payloads for form definition and form fields

// new types to display and add registration items
export type EventDetail = ApiEvent & {
  isActive: boolean;
  formId: string | null;
};

export type RegistrationResponseItem = {
  fieldId: string;
  fieldLabel: string;
  fieldValue: string;
};

export type RegistrationListItem = {
  registrationId: string;
  participantCode: string;
  qrCode: string;
  registrationDate: string;
  checkInTime: string | null; // null => Pending
  responses: RegistrationResponseItem[];
};

// types for registration/saving participants data
// src/utils/mindaras-api-types.ts — add
export type FieldResponsePayload = {
  fieldId: string;
  value: string;
};

export type RegisterParticipantPayload = {
  responses: FieldResponsePayload[];
};

export type RegistrationConfirmation = {
  registrationId: string;
  participantCode: string;
  qrCode: string;
  eventName: string;
};

// ASP.NET Core's ValidationProblemDetails shape
export type ValidationErrorResponse = {
  title: string;
  status: number;
  errors: Record<string, string[]>;
};

// type for result from scanning QR code
export type ScanResult = {
  result: "success" | "already-checked-in" | "invalid";
  attendeeName: string | null;
  attendeeEmail: string | null;
  eventName: string | null;
  participantCode: string | null;
  checkInTime: string | null;
};