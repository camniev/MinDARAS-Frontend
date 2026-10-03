import { apiGet } from "@/lib/api-client";
import { DashboardSummary } from "@/utils/mindaras-api-types";

export function fetchDivisionStatistics() {
  return apiGet<DashboardSummary>("/api/Dashboard/DivisionStatistics");
}