import { apiService } from './api.service';
import {
  DashboardData,
  DashboardQueryParams,
} from '@/types/dashboard.types';

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
    query.set('academicYear', params.academicYear);
    query.set('departmentId', String(params.departmentId));

    return apiService.get<DashboardData>(
      `${this.baseUrl}?${query.toString()}`
    );
  }
}

export const dashboardService = new DashboardService();
