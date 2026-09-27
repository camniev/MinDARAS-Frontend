import { FormFieldDetail, FormSection } from "@/utils/mindaras-api-types";

export function computeNextSectionId(
  currentSection: FormSection,
  fields: FormFieldDetail[],
  values: Record<string, string>,
): string | null {
  const routingField = fields.find(
    (f) => f.sectionId === currentSection.sectionId && f.branchingConfig,
  );
  if (routingField) {
    const answer = values[routingField.fieldId];
    const rules = routingField.branchingConfig ? JSON.parse(routingField.branchingConfig) : {};
    if (answer && rules[answer]) return rules[answer];
  }
  return currentSection.defaultNextSectionId;
}