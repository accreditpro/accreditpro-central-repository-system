import { apiService } from './api.service';
import { DashboardData, DashboardQueryParams } from '@/types/dashboard.types';

/**
 * Dashboard Service — wraps GET /api/v1/department-coordinator/dashboard.
 *
 * Returns all data needed for the Department Coordinator dashboard:
 * KPIs, department info, repository health, recent uploads, etc.
 */
class DashboardService {
  private readonly baseUrl = '/v1/department-coordinator/dashboard';

  /**
   * GET /api/v1/department-coordinator/dashboard
   *
   * Fetches the full dashboard payload for the given academic year and department.
   */
  async getDashboard(params: DashboardQueryParams): Promise<DashboardData> {
    const query = new URLSearchParams();
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.departmentId) query.set('departmentId', String(params.departmentId));

    const res = await apiService.get<any>(`${this.baseUrl}?${query.toString()}`);
    return (res?.data ?? res) as DashboardData;
  }

  /**
   * GET /api/v1/department-coordinator/dashboard/complete
   */
  async getCompleteDashboard(params: DashboardQueryParams): Promise<DashboardData> {
    const query = new URLSearchParams();
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.departmentId) query.set('departmentId', String(params.departmentId));

    const res = await apiService.get<any>(`${this.baseUrl}/complete?${query.toString()}`);
    return (res?.data ?? res) as DashboardData;
  }

  /**
   * GET /api/v1/department-coordinator/dashboard/metrics/kpi
   */
  async getKPISummary(params: DashboardQueryParams): Promise<any> {
    const query = new URLSearchParams();
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.departmentId) query.set('departmentId', String(params.departmentId));

    return apiService.get<any>(`${this.baseUrl}/metrics/kpi?${query.toString()}`);
  }

  /**
   * GET /api/v1/department-coordinator/dashboard/metrics/health
   */
  async getRepositoryHealthMetrics(params: DashboardQueryParams): Promise<any> {
    const query = new URLSearchParams();
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.departmentId) query.set('departmentId', String(params.departmentId));

    return apiService.get<any>(`${this.baseUrl}/metrics/health?${query.toString()}`);
  }

  /**
   * GET /api/v1/department-coordinator/master-data/academic-years
   */
  async getAcademicYears(): Promise<string[]> {
    const res = await apiService.get<any>('/v1/department-coordinator/master-data/academic-years');
    const data = res?.data ?? res;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.academicYears)) return data.academicYears;
    return [];
  }

  /**
   * GET /api/v1/department-coordinator/master-data/department-info
   */
  async getDepartmentInfo(departmentId: number | string): Promise<any> {
    const res = await apiService.get<any>(`/v1/department-coordinator/master-data/department-info?departmentId=${departmentId}`);
    return res?.data ?? res;
  }
}

export const dashboardService = new DashboardService();
