// ============================================================================
// Dashboard Types — matches GET /api/v1/department-coordinator/dashboard
// ============================================================================

// ── Department Info ──

export interface DashboardDepartmentInfo {
  id: number;
  name: string;
  code: string;
  coordinator: string;
  programOfferingsCount: number;
  specializations: string[];
  academicYear: string;
}

// ── KPI Shape (used by repositoryKpis, pendingKpis, overallReadinessKpi) ──

export interface DashboardKpi {
  repositoryType?: string;
  label: string;
  value: number;
  suffix?: string;
  trend: number;
  trendLabel: string;
  trendPositive: boolean;
  icon: string;
  color: string;
}

// ── Repository Health ──

export interface RepositoryHealthItem {
  repositoryType: string;
  label: string;
  readiness: number;
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationPercent: number;
  icon: string;
  color: string;
}

export interface DashboardRepositoryHealth {
  overallReadiness: number;
  repositories: RepositoryHealthItem[];
}

// ── Repository Workspace ──

export interface DashboardWorkspace {
  repositoryType: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

// ── Recent Uploads ──

export interface DashboardRecentUpload {
  id: number;
  fileName: string;
  repository: string;
  recordsCount: number;
  uploadedDate: string;
  status: string;
}

export interface DashboardRecentUploads {
  totalCount: number;
  uploads: DashboardRecentUpload[];
}

// ── Readiness Analytics ──

export interface ReadinessAnalyticItem {
  repositoryType: string;
  label: string;
  readiness: number;
  color: string;
}

export interface DashboardReadinessAnalytics {
  formula: string;
  analytics: ReadinessAnalyticItem[];
}

// ── Main Dashboard Data ──

export interface DashboardData {
  departmentInfo: DashboardDepartmentInfo;
  repositoryKpis: DashboardKpi[];
  pendingKpis: DashboardKpi[];
  overallReadinessKpi: DashboardKpi;
  repositoryHealth: DashboardRepositoryHealth;
  repositoryWorkspaces: DashboardWorkspace[];
  recentUploads: DashboardRecentUploads;
  readinessAnalytics: DashboardReadinessAnalytics;
}

export interface DashboardQueryParams {
  academicYear: string;
  departmentId: number;
}
