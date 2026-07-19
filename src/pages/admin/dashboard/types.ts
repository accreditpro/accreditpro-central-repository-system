// ============================================================================
// Admin Dashboard Types — Matches Spring Boot backend response
// Endpoints:
// - GET /api/admin/dashboard/summary (full dashboard)
// - GET /api/admin/dashboard/stats
// - GET /api/admin/dashboard/top-institutions
// - GET /api/admin/dashboard/recent-activities
// - GET /api/admin/dashboard/repository-completion
// - GET /api/admin/dashboard/institution-growth
// - GET /api/admin/dashboard/category-distribution
// ============================================================================

/** Stat card as returned by the backend */
export interface DashboardStatCard {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  change: number;
  changeLabel: string;
  chartData: { value: number }[] | null;
}

/** Monthly institution growth data point */
export interface InstitutionGrowthData {
  month: string;
  total: number;
  active: number;
  new: number;
}

/** Institution category distribution data point */
export interface CategoryDistributionData {
  name: string;
  value: number;
  fill?: string;
}

/** Weekly repository completion data point */
export interface RepositoryCompletionData {
  week: string;
  completion: number;
  target: number;
}

/** Top institution as returned by the backend */
export interface TopInstitutionData {
  id: number;
  name: string;
  category: string;
  status: string;
  documentsUploaded: number;
  repositoryCompletion: number;
  lastActive: string;
}

/** Recent activity as returned by the backend */
export interface RecentActivityData {
  id: string;
  type: string;
  title: string;
  description: string;
  institution: string;
  timestamp: string;
  user: string;
}

/** Summary response from /api/admin/dashboard/summary */
export interface DashboardSummaryResponse {
  stats: DashboardStatCard[];
  institutionGrowth: InstitutionGrowthData[];
  categoryDistribution: CategoryDistributionData[];
  repositoryCompletion: RepositoryCompletionData[];
  topInstitutions: TopInstitutionData[];
  recentActivities: RecentActivityData[];
}

/** Full dashboard data payload from backend */
export interface AdminDashboardData {
  stats: DashboardStatCard[];
  institutionGrowth: InstitutionGrowthData[];
  categoryDistribution: CategoryDistributionData[];
  repositoryCompletion: RepositoryCompletionData[];
  topInstitutions: TopInstitutionData[];
  recentActivities: RecentActivityData[];
}
