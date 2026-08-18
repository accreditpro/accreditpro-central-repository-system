import { apiService } from '@/services/api.service';
import {
  CreateInstitutionRequest,
  CreateInstitutionResponse,
  Institution,
  InstitutionListApiResponse,
  InstitutionQueryParams,
  InstitutionSummary,
} from '@/types/institution.types';
import {
  AdminDashboardData,
  DashboardSummaryResponse,
  DashboardStatCard,
  TopInstitutionData,
  RecentActivityData,
  RepositoryCompletionData,
  InstitutionGrowthData,
  CategoryDistributionData,
} from '@/pages/admin/dashboard/types';
import {
  AnalyticsCard,
  InstitutionGrowthData as AnalyticsInstitutionGrowthData,
  InstitutionDistributionData,
  TopInstitutionData as AnalyticsTopInstitutionData,
  RepositoryCompletionData as AnalyticsRepositoryCompletionData,
  ActivityHeatmapData,
  RecentActivityItem,
  AnalyticsOverviewData,
} from '@/pages/admin/analytics/types';

/**
 * AdminService — API calls for Super Admin functionality.
 * All endpoints require SUPER_ADMIN role + Bearer token.
 *
 * Endpoints:
 * - GET /api/admin/dashboard/summary — Full dashboard data
 * - GET /api/admin/dashboard/stats — Stats cards only
 * - GET /api/admin/dashboard/top-institutions — Top institutions
 * - GET /api/admin/dashboard/recent-activities — Recent activities
 * - GET /api/admin/dashboard/repository-completion — Repository completion
 * - GET /api/admin/dashboard/institution-growth — Institution growth
 * - GET /api/admin/dashboard/category-distribution — Category distribution
 */
class AdminService {
  /**
   * Fetch full admin dashboard summary (all data in one call).
   * GET /api/admin/dashboard/summary
   */
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return apiService.get<DashboardSummaryResponse>('/admin/dashboard/summary');
  }

  /**
   * Fetch dashboard stats cards only.
   * GET /api/admin/dashboard/stats
   */
  async getDashboardStats(refresh = false): Promise<DashboardStatCard[]> {
    return apiService.get<DashboardStatCard[]>('/admin/dashboard/stats', {
      params: { refresh },
    });
  }

  /**
   * Fetch top institutions.
   * GET /api/admin/dashboard/top-institutions
   */
  async getTopInstitutions(limit = 5): Promise<TopInstitutionData[]> {
    return apiService.get<TopInstitutionData[]>('/admin/dashboard/top-institutions', {
      params: { limit },
    });
  }

  /**
   * Fetch recent activities.
   * GET /api/admin/dashboard/recent-activities
   */
  async getRecentActivities(limit = 10): Promise<RecentActivityData[]> {
    return apiService.get<RecentActivityData[]>('/admin/dashboard/recent-activities', {
      params: { limit },
    });
  }

  /**
   * Fetch repository completion data.
   * GET /api/admin/dashboard/repository-completion
   */
  async getRepositoryCompletion(): Promise<RepositoryCompletionData[]> {
    return apiService.get<RepositoryCompletionData[]>('/admin/dashboard/repository-completion');
  }

  /**
   * Fetch institution growth data.
   * GET /api/admin/dashboard/institution-growth
   */
  async getInstitutionGrowth(): Promise<InstitutionGrowthData[]> {
    return apiService.get<InstitutionGrowthData[]>('/admin/dashboard/institution-growth');
  }

  /**
   * Fetch category distribution data.
   * GET /api/admin/dashboard/category-distribution
   */
  async getCategoryDistribution(): Promise<CategoryDistributionData[]> {
    return apiService.get<CategoryDistributionData[]>('/admin/dashboard/category-distribution');
  }

  /**
   * Fetch analytics summary (stat cards).
   * GET /api/admin/analytics/summary?timeRange={timeRange}
   * @param timeRange — e.g. '12months', '30days', '7days'
   */
  async getAnalyticsSummary(timeRange = '12months'): Promise<AnalyticsCard[]> {
    return apiService.get<AnalyticsCard[]>('/admin/analytics/summary', {
      params: { timeRange },
    });
  }

  /**
   * Fetch analytics institution growth data.
   * GET /api/admin/analytics/institution-growth?timeRange={timeRange}
   * @param timeRange — e.g. '12months', '30days', '7days'
   */
  async getAnalyticsInstitutionGrowth(
    timeRange = '12months'
  ): Promise<AnalyticsInstitutionGrowthData[]> {
    return apiService.get<AnalyticsInstitutionGrowthData[]>('/admin/analytics/institution-growth', {
      params: { timeRange },
    });
  }

  /**
   * Fetch analytics institution distribution data.
   * GET /api/admin/analytics/distribution?timeRange={timeRange}
   * @param timeRange — e.g. '12months', '30days', '7days'
   */
  async getAnalyticsDistribution(timeRange = '12months'): Promise<InstitutionDistributionData[]> {
    // API returns `fill` but the type uses `color` — map accordingly
    const raw = await apiService.get<{ name: string; value: number; fill: string }[]>(
      '/admin/analytics/distribution',
      {
        params: { timeRange },
      }
    );
    return raw.map(item => ({
      name: item.name,
      value: item.value,
      color: item.fill,
    }));
  }

  /**
   * Fetch analytics top institutions.
   * GET /api/admin/analytics/top-institutions?timeRange={timeRange}&limit={limit}
   * @param timeRange — e.g. '12months', '30days', '7days'
   * @param limit — number of results (default 10)
   */
  async getAnalyticsTopInstitutions(
    timeRange = '12months',
    limit = 10
  ): Promise<AnalyticsTopInstitutionData[]> {
    return apiService.get<AnalyticsTopInstitutionData[]>('/admin/analytics/top-institutions', {
      params: { timeRange, limit },
    });
  }

  /**
   * Fetch analytics repository completion data.
   * GET /api/admin/analytics/repository-completion?timeRange={timeRange}&limit={limit}
   * @param timeRange — e.g. '12months', '30days', '7days'
   * @param limit — number of results (default 10)
   */
  async getAnalyticsRepositoryCompletion(
    timeRange = '12months',
    limit = 10
  ): Promise<AnalyticsRepositoryCompletionData[]> {
    return apiService.get<AnalyticsRepositoryCompletionData[]>(
      '/admin/analytics/repository-completion',
      {
        params: { timeRange, limit },
      }
    );
  }

  /**
   * Fetch analytics activity heatmap data.
   * GET /api/admin/analytics/activity-heatmap?timeRange={timeRange}
   * @param timeRange — e.g. '12months', '30days', '7days'
   */
  async getAnalyticsActivityHeatmap(timeRange = '12months'): Promise<ActivityHeatmapData[]> {
    return apiService.get<ActivityHeatmapData[]>('/admin/analytics/activity-heatmap', {
      params: { timeRange },
    });
  }

  /**
   * Normalize an API activity type string to the RecentActivityItem union.
   */
  private normalizeActivityType(type: string): RecentActivityItem['type'] {
    if (type.includes('create') || type.includes('created')) return 'create';
    if (type.includes('update') || type.includes('updated')) return 'update';
    if (type.includes('upload') || type.includes('uploaded')) return 'upload';
    if (type.includes('delete') || type.includes('deleted')) return 'delete';
    if (type.includes('login') || type.includes('logged')) return 'login';
    return 'update'; // safe default
  }

  /**
   * Fetch analytics recent activity data.
   * GET /api/admin/analytics/recent-activity?timeRange={timeRange}&limit={limit}
   * API returns `title` but the RecentActivity component expects `action` — map accordingly.
   * @param timeRange — e.g. '12months', '30days', '7days'
   * @param limit — number of results (default 10)
   */
  async getAnalyticsRecentActivity(
    timeRange = '12months',
    limit = 10
  ): Promise<RecentActivityItem[]> {
    const raw = await apiService.get<
      {
        id: string;
        type: string;
        title: string;
        description: string;
        institution: string;
        timestamp: string;
        user: string;
      }[]
    >('/admin/analytics/recent-activity', {
      params: { timeRange, limit },
    });
    return raw.map(item => ({
      id: item.id,
      action: item.title,
      user: item.user,
      institution: item.institution,
      timestamp: item.timestamp,
      type: this.normalizeActivityType(item.type),
    }));
  }

  /**
   * Fetch full analytics overview (all data in one call, ideal for exports).
   * GET /api/admin/analytics/overview?timeRange={timeRange}
   * @param timeRange — e.g. '12months', '30days', '7days'
   */
  async getAnalyticsOverview(timeRange = '12months'): Promise<AnalyticsOverviewData> {
    return apiService.get<AnalyticsOverviewData>('/admin/analytics/overview', {
      params: { timeRange },
    });
  }

  /**
   * Fetch admin dashboard data (legacy endpoint).
   * GET /api/admin/dashboard
   */
  async getDashboard(): Promise<AdminDashboardData> {
    return apiService.get<AdminDashboardData>('/admin/dashboard');
  }

  /**
   * Fetch paginated list of institutions.
   * GET /api/v1/super-admin/institutions
   */
  async getInstitutions(params: InstitutionQueryParams): Promise<InstitutionListApiResponse> {
    const queryParams: Record<string, string | number> = {
      page: params.page,
      pageSize: params.pageSize,
    };
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'all') queryParams.status = params.status;
    if (params.category && params.category !== 'all') queryParams.category = params.category;
    if (params.state && params.state !== 'all') queryParams.state = params.state;
    if (params.repositoryCompletion && params.repositoryCompletion !== 'all')
      queryParams.repositoryCompletion = params.repositoryCompletion;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDirection) queryParams.sortDirection = params.sortDirection;

    return apiService.get<InstitutionListApiResponse>('/v1/super-admin/institutions', {
      params: queryParams,
    });
  }

  /**
   * Convert a base64 data URL to a Blob with the correct MIME type.
   */
  private dataURLToBlob(dataURL: string): Blob {
    const [header, base64Data] = dataURL.split(',');
    const mimeMatch = header?.match(/:(.*?);/);
    const mimeType = mimeMatch?.[1] || 'image/png';
    const byteChars = atob(base64Data || dataURL);
    const byteArrays: BlobPart[] = [];
    for (let offset = 0; offset < byteChars.length; offset += 512) {
      const slice = byteChars.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
  }

  /**
   * Build FormData from a CreateInstitutionRequest.
   * Supports Spring Boot @RequestPart("request") with application/json Blob,
   * and @RequestPart(value = "logo", required = false) MultipartFile.
   */
  private buildCreatePayload(
    request: CreateInstitutionRequest
  ): FormData {
    const formData = new FormData();
    const logo = request.basicInfo.logo;

    if (logo && logo.startsWith('data:')) {
      const blob = this.dataURLToBlob(logo);
      const extension = blob.type.split('/')[1] || 'png';
      formData.append('logo', blob, `logo.${extension}`);
    }

    const dataWithoutBase64Logo: CreateInstitutionRequest = {
      ...request,
      basicInfo: {
        ...request.basicInfo,
        logo: logo && !logo.startsWith('data:') ? logo : '',
      },
    };

    const requestBlob = new Blob([JSON.stringify(dataWithoutBase64Logo)], {
      type: 'application/json',
    });
    formData.append('request', requestBlob);

    return formData;
  }

  /**
   * Create a new institution.
   * POST /api/v1/super-admin/institutions
   *
   * Sends multipart/form-data with 'request' JSON Blob + optional 'logo' File.
   */
  async createInstitution(data: CreateInstitutionRequest): Promise<CreateInstitutionResponse> {
    const payload = this.buildCreatePayload(data);
    return apiService.post<CreateInstitutionResponse>('/v1/super-admin/institutions', payload);
  }

  /**
   * Update an existing institution.
   * PUT /api/v1/super-admin/institutions/{id}
   */
  async updateInstitution(
    id: number | string,
    data: CreateInstitutionRequest
  ): Promise<CreateInstitutionResponse> {
    const payload = this.buildCreatePayload(data);
    return apiService.put<CreateInstitutionResponse>(`/v1/super-admin/institutions/${id}`, payload);
  }

  /**
   * Fetch a single institution by ID.
   * GET /api/v1/super-admin/institutions/{id}
   */
  async getInstitutionById(id: number | string): Promise<CreateInstitutionResponse> {
    return apiService.get<CreateInstitutionResponse>(`/v1/super-admin/institutions/${id}`);
  }

  /**
   * Update institution status (activate/deactivate).
   * PATCH /api/v1/super-admin/institutions/{id}/status
   */
  async updateInstitutionStatus(
    id: number | string,
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | string
  ): Promise<InstitutionSummary> {
    const apiStatus = status.toUpperCase();
    return apiService.patch<InstitutionSummary>(`/v1/super-admin/institutions/${id}/status`, {
      status: apiStatus,
    });
  }

  /**
   * Delete an institution.
   * DELETE /api/v1/super-admin/institutions/{id}
   */
  async deleteInstitution(id: number | string): Promise<void> {
    await apiService.delete<void>(`/v1/super-admin/institutions/${id}`);
  }

  /**
   * Fetch list of distinct Indian states for filtering.
   * GET /api/v1/super-admin/institutions/states
   */
  async getStates(): Promise<string[]> {
    return apiService.get<string[]>('/v1/super-admin/institutions/states');
  }

  /**
   * Fetch list of distinct categories for filtering.
   * GET /api/v1/super-admin/institutions/categories
   */
  async getCategories(): Promise<string[]> {
    return apiService.get<string[]>('/v1/super-admin/institutions/categories');
  }

  /**
   * Impersonate institution administrator.
   * POST /api/v1/super-admin/institutions/{id}/impersonate
   */
  async impersonateInstitution(id: number | string): Promise<any> {
    return apiService.post<any>(`/v1/super-admin/institutions/${id}/impersonate`);
  }

  /**
   * Export institutions report in bulk CSV format.
   * GET /api/v1/super-admin/institutions/export
   */
  async exportInstitutions(params?: InstitutionQueryParams): Promise<void> {
    const queryParams: Record<string, string | number> = {};
    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.pageSize) queryParams.pageSize = params.pageSize;
      if (params.search) queryParams.search = params.search;
      if (params.status && params.status !== 'all') queryParams.status = params.status;
      if (params.category && params.category !== 'all') queryParams.category = params.category;
      if (params.state && params.state !== 'all') queryParams.state = params.state;
      if (params.repositoryCompletion && params.repositoryCompletion !== 'all')
        queryParams.repositoryCompletion = params.repositoryCompletion;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortDirection) queryParams.sortDirection = params.sortDirection;
    }
    const filename = `institutions_export_${new Date().toISOString().slice(0, 10)}.csv`;
    return apiService.download('/v1/super-admin/institutions/export', filename, queryParams);
  }

  /**
   * Bulk upload institutions via CSV.
   * POST /api/v1/super-admin/institutions/upload-csv
   */
  async uploadInstitutionCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<any>('/v1/super-admin/institutions/upload-csv', formData);
  }
}

export const adminService = new AdminService();
