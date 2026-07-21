// ============================================================================
// Mission & Vision Types — matches backend API endpoints
// ============================================================================

/**
 * Mission & Vision data shape as returned by GET and expected by PUT.
 */
export interface MissionVisionData {
  academicYear: string;
  department: string;
  vision: string;
  mission: string[];
  coreValues: string[];
  peos: string[];
  pos: string[];
  psos: string[];
  qualityPolicy: string;
  departmentStrengths: string[];
  motto: string;
}

/**
 * GET /api/v1/department-coordinator/mission-vision
 *
 * Query params:
 *   - academicYear (string, required) — format YYYY-YY, e.g. "2025-26"
 *   - departmentId  (number, required)
 */
export interface MissionVisionQueryParams {
  academicYear: string;
  departmentId: number;
}

/**
 * PUT /api/v1/app/settings/password
 *
 * Query params:
 *   - departmentId (number, required)
 *
 * Request body matches MissionVisionData.
 */
export type MissionVisionUpdateRequest = MissionVisionData;
