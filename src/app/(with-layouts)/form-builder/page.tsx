import type { Metadata } from "next";
import FormBuilderPageClient from "./_components/form-builder-page-client";

export const metadata: Metadata = {
  title: "Registration Form Builder",
};

export default function FormBuilderPage() {
  return <FormBuilderPageClient />;
}
