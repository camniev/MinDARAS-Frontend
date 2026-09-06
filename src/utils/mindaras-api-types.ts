// src/utils/event-pulse-api-types.ts

export type SaveEventPayload = {
  eventName: string;
  eventCategoryId: string; // GUID
  eventStartDate: string;  // ISO 8601
  eventEndDate: string;    // ISO 8601
  eventLocation?: string;
  description?: string;
  capacity?: number;
  userId: string; // GUID
};

export type SaveEventResponse = {
  message: string;
  eventId: string;
  eventRefNo: string;
};

export type FormFieldPayload = {
  fieldName: string;
  fieldLabel: string;
  fieldType: string; // one of FormFieldTypes constants — keep in sync with backend
  isRequired: boolean;
  options?: string; // JSON-stringified array for select/checkbox
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

export type EventCategory = {
  id: string;
  name: string;
};