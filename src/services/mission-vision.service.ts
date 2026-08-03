import { apiService } from './api.service';
import {
  MissionVisionData,
  MissionVisionQueryParams,
  MissionVisionUpdateRequest,
} from '@/types/mission-vision.types';

/**
 * Mission & Vision Service — wraps all /api/v1/department-coordinator/mission-vision endpoints.
 *
 * All methods require `departmentId` to scope requests to the current department.
 * The apiService automatically injects the Bearer token and unwraps ApiResponse<T>.
 */
class MissionVisionService {
  private readonly baseUrl = '/v1/department-coordinator/mission-vision';

  /**
   * GET /api/v1/department-coordinator/mission-vision
   *
   * Fetches the department's mission, vision, core values, PEOs, PSOs, etc.
   * for a given academic year and department.
   */
  async getMissionVision(params: MissionVisionQueryParams): Promise<MissionVisionData> {
    const query = new URLSearchParams();
    query.set('academicYear', params.academicYear);
    query.set('departmentId', String(params.departmentId));

    return apiService.get<MissionVisionData>(`${this.baseUrl}?${query.toString()}`);
  }

  /**
   * PUT /api/v1/department-coordinator/mission-vision
   *
   * Updates the department's mission, vision, core values, PEOs, PSOs, etc.
   * The departmentId is passed as a query parameter, and the full data object
   * is sent as the request body.
   */
  async updateMissionVision(
    departmentId: number,
    data: MissionVisionUpdateRequest
  ): Promise<MissionVisionData> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));

    return apiService.put<MissionVisionData>(`${this.baseUrl}?${query.toString()}`, data);
  }
}

export const missionVisionService = new MissionVisionService();
