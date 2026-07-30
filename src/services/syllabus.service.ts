import { apiService } from './api.service';

// ============ API Response Types ============

// ============ Generate CO Types ============

export interface GenerateCORequest {
  workflowType: 'generate-co';
  inputs: {
    courseName: string;
    courseContent: string;
  };
  model: string;
  temperature: number;
  useCache: boolean;
}

export interface GenerateCOResult {
  co_code: string;
  description: string;
  blooms_level: string;
  blooms_level_code: string;
  mapped_units: number[];
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  ai_generated: boolean;
  approved: boolean;
  faculty_modified: boolean;
  confidence_score: number;
}

export interface GenerateCOResponse {
  success: boolean;
  workflowType: string;
  data: {
    ai_suggested_course_outcomes: GenerateCOResult[];
    [key: string]: unknown;
  };
  metadata: {
    promptPath: string;
    hasValidationError: boolean;
  };
  cached: boolean;
  executionTimeMs: number;
}

// ============ CO-PO Mapping Types ============

/** A single Course Outcome formatted for the CO-PO mapping API */
export interface COPOMappingCourseOutcome {
  co_code: string;
  course_outcome_description: string;
  blooms_taxonomy_level: string;
  mapped_units: string[];
  mapped_topics: string[];
}

export interface GenerateCOPOMappingRequest {
  workflowType: 'generate-co-po';
  inputs: {
    courseName: string;
    courseContent: string;
    courseOutcomes: COPOMappingCourseOutcome[];
  };
  model: string;
  temperature: number;
  useCache: boolean;
}

export interface COPOMappingItem {
  co_code: string;
  po_mappings: Array<{
    po_code: string;
    level: number;
  }>;
  average: number;
}

export interface POSummaryItem {
  po_code: string;
  average: number;
  coverage_percentage: number;
}

export interface OverallSummary {
  overall_average: number;
  total_cos: number;
  total_pos: number;
  mapped_pos: number;
  unmapped_pos: number;
}

export interface GenerateCOPOMappingResponse {
  success: boolean;
  workflowType: string;
  data: {
    co_po_mapping: {
      matrix: COPOMappingItem[];
      po_summary: POSummaryItem[];
      overall_summary: OverallSummary;
    };
    [key: string]: unknown;
  };
  metadata: {
    promptPath: string;
    hasValidationError: boolean;
  };
  cached: boolean;
  executionTimeMs: number;
}

// ============ Gap Analysis Types ============

export interface GapAnalysisRequest {
  workflowType: 'gap-analysis';
  inputs: {
    course: {
      name: string;
      code: string;
      department: string;
      program: string;
      regulation: string;
    };
    courseOutcomes: Array<{
      code: string;
      description: string;
      blooms: string;
    }>;
    analysis: {
      completionPercentage: number;
      weakPOs: Array<{
        code: string;
        name: string;
        average: number;
        coverage: number;
        mappedCOs: string[];
      }>;
      missingPOs: string[];
    };
  };
  model: string;
  temperature: number;
  useCache: boolean;
}

export interface GapAnalysisWeakPO {
  po_code: string;
  po_name: string;
  coverage_percentage: number;
  average_mapping: number;
  mapped_cos: string[];
  reason: string;
  recommendation: string;
  expected_improvement: string;
}

export interface GapAnalysisMissingPO {
  po_code: string;
  po_name: string;
  reason: string;
  recommendation: string;
}

export interface GapAnalysisRecommendedActivity {
  activity_type: string;
  title: string;
  description: string;
  mapped_po: string;
  mapped_co: string;
  duration: string;
  blooms_level: string;
  expected_evidence: string[];
}

export interface GapAnalysisResponse {
  success: boolean;
  workflowType: string;
  data: {
    completion_percentage: number;
    weak_pos: GapAnalysisWeakPO[];
    missing_pos: GapAnalysisMissingPO[];
    recommended_activities: GapAnalysisRecommendedActivity[];
    [key: string]: unknown;
  };
  metadata: {
    promptPath: string;
    hasValidationError: boolean;
  };
  cached: boolean;
  executionTimeMs: number;
}

interface SyllabusTopic {
  topic_number: number;
  topic_name: string;
}

interface SyllabusUnit {
  unit_number: number;
  unit_name: string;
  lecture_hours: number;
  description: string;
  topics: SyllabusTopic[];
}

interface SyllabusCourseObjective {
  objective_number: number;
  description: string;
}

interface SyllabusBook {
  book_number: number;
  title: string;
  authors: string[];
  edition: string | null;
  publisher: string;
  year: string | null;
  isbn?: string | null;
}

interface SyllabusCourseDetails {
  course_code: string;
  course_name: string;
  regulation: string | null;
  department: string;
  programme: string;
  semester: number;
  year: number;
  credits: number;
  lecture_hours: number;
  tutorial_hours: number;
  practical_hours: number;
  total_contact_hours: number;
  course_type: string;
  prerequisites: string[];
  course_description: string | null;
}

interface SyllabusCourseFile {
  file_name: string;
  original_file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string | null;
  blob_url: string | null;
  uploaded_at: string | null;
  uploaded_by: string | null;
  extraction_status: string;
  ai_confidence: number;
}

interface SyllabusValidation {
  missing_fields: string[];
  warnings: string[];
  errors: string[];
}

interface SyllabusMetadata {
  version: number;
  units_count: number;
  text_book_count: number;
  reference_book_count: number;
  course_objectives_count: number;
  generated_by: string;
  generated_on: string | null;
}

interface SyllabusCourseOutcome {
  description?: string;
  bloomsLevel?: string;
  unit?: string;
}

interface SyllabusResponseData {
  status: string;
  message: string;
  units: SyllabusUnit[];
  assignments: unknown[];
  references: unknown[];
  remarks: unknown[];
  validation: SyllabusValidation;
  metadata: SyllabusMetadata;
  course_file: SyllabusCourseFile;
  course_details: SyllabusCourseDetails;
  course_objectives: SyllabusCourseObjective[];
  text_books: SyllabusBook[];
  reference_books: SyllabusBook[];
  course_outcomes: SyllabusCourseOutcome[];
  assessment_methods: unknown[];
  laboratory_experiments: unknown[];
  course_content: string;
}

interface SyllabusApiResponse {
  success: boolean;
  workflowType: string;
  data: SyllabusResponseData;
  metadata: {
    promptPath: string;
    hasValidationError: boolean;
  };
  cached: boolean;
  executionTimeMs: number;
}

// ============ Service Functions ============

const SYLLABUS_ANALYZE_PATH = '/api/v1/workflows/syllabus/analyze';
const GENERATE_CO_PATH = '/api/v1/workflows/generate-cos';
const GENERATE_COPO_PATH = '/api/v1/workflows/generate-co-po-mapping';
const GAP_ANALYSIS_PATH = '/api/v1/workflows/perform-gap-analysis';
const REVISED_MAPPING_PATH = '/api/v1/workflows/generate-revised-mapping';

/**
 * Upload a course syllabus file for AI analysis and extraction.
 * @param courseCode - The code of the course (e.g., "CS501")
 * @param department - The department name
 * @param file - The syllabus file (docx, pdf, etc.)
 */
export async function extractSyllabus(
  courseCode: string,
  department: string,
  file: File
): Promise<SyllabusApiResponse> {
  const formData = new FormData();
  formData.append('courseCode', courseCode);
  formData.append('department', department);
  formData.append('file', file);

  try {
    const data = await apiService.post<SyllabusApiResponse>(SYLLABUS_ANALYZE_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!data.success) {
      throw new Error(data.data?.message || 'Syllabus analysis returned unsuccessful status');
    }

    return data;
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error?.message) {
      throw error;
    }
    throw new Error('Syllabus analysis failed unexpectedly');
  }
}

/**
 * Generate Course Outcomes from extracted course content using AI.
 * Called after the syllabus/analyze endpoint returns course_content.
 * @param courseName - The name of the course
 * @param courseContent - The extracted course content from the analyze step
 */
/**
 * Generate CO-PO mapping matrix from course content using AI.
 * @param courseName - The name of the course
 * @param courseContent - The extracted course content from the analyze step
 * @param courseOutcomes - The course outcomes (from Step4) with rich metadata
 */
export async function generateCOPOMapping(
  courseName: string,
  courseContent: string,
  courseOutcomes: COPOMappingCourseOutcome[] = []
): Promise<GenerateCOPOMappingResponse> {
  const payload: GenerateCOPOMappingRequest = {
    workflowType: 'generate-co-po',
    inputs: {
      courseName,
      courseContent,
      courseOutcomes,
    },
    model: 'gpt-4o',
    temperature: 0.3,
    useCache: false,
  };

  try {
    const data = await apiService.post<GenerateCOPOMappingResponse>(GENERATE_COPO_PATH, payload);

    if (!data.success) {
      throw new Error('CO-PO mapping generation returned unsuccessful status');
    }

    return data;
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error?.message) {
      throw error;
    }
    throw new Error('CO-PO mapping generation failed unexpectedly');
  }
}

/**
 * Generate Revised CO-PO Mapping based on gap analysis results.
 * @param params - The revised mapping request parameters
 */
export async function generateRevisedMapping(
  params: RevisedMappingRequest
): Promise<RevisedMappingResponse> {
  try {
    const data = await apiService.post<RevisedMappingResponse>(REVISED_MAPPING_PATH, params);

    if (!data.success) {
      throw new Error('Revised mapping generation returned unsuccessful status');
    }

    return data;
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error?.message) {
      throw error;
    }
    throw new Error('Revised mapping generation failed unexpectedly');
  }
}

/**
 * Perform Gap Analysis using the CO-PO mapping results.
 * @param params - The gap analysis request parameters
 */
export async function performGapAnalysis(
  params: GapAnalysisRequest
): Promise<GapAnalysisResponse> {
  try {
    const data = await apiService.post<GapAnalysisResponse>(GAP_ANALYSIS_PATH, params);

    if (!data.success) {
      throw new Error('Gap analysis returned unsuccessful status');
    }

    return data;
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error?.message) {
      throw error;
    }
    throw new Error('Gap analysis failed unexpectedly');
  }
}

/**
 * Generate Course Outcomes from extracted course content using AI.
 * Called after the syllabus/analyze endpoint returns course_content.
 * @param courseName - The name of the course
 * @param courseContent - The extracted course content from the analyze step
 */
export async function generateCourseOutcomes(
  courseName: string,
  courseContent: string
): Promise<GenerateCOResponse> {
  const payload: GenerateCORequest = {
    workflowType: 'generate-co',
    inputs: {
      courseName,
      courseContent,
    },
    model: 'gpt-4o',
    temperature: 0.3,
    useCache: false,
  };

  try {
    const data = await apiService.post<GenerateCOResponse>(GENERATE_CO_PATH, payload);

    if (!data.success) {
      throw new Error('Course outcomes generation returned unsuccessful status');
    }

    return data;
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error?.message) {
      throw error;
    }
    throw new Error('Course outcomes generation failed unexpectedly');
  }
}

// ============ Revised Mapping Types ============

export interface RevisedMappingRequest {
  workflowType: 'revised-mapping';
  inputs: {
    courseName: string;
    gapAnalysis: {
      completion_percentage: number;
      weak_pos: Array<{
        po_code: string;
        po_name: string;
        coverage_percentage: number;
        average_mapping: number;
        mapped_cos: string[];
        reason: string;
        recommendation: string;
        expected_improvement: string;
      }>;
      missing_pos: Array<{
        po_code: string;
        po_name: string;
        reason: string;
        recommendation: string;
      }>;
      recommended_activities: Array<{
        activity_type: string;
        title: string;
        description: string;
        mapped_po: string;
        mapped_co: string;
        duration: string;
        blooms_level: string;
        expected_evidence: string[];
      }>;
    };
    currentMapping: {
      matrix: Array<{
        co_code: string;
        po_mappings: Array<{ po_code: string; level: number }>;
        average: number;
      }>;
      po_summary: Array<{
        po_code: string;
        average: number;
        coverage_percentage: number;
      }>;
      overall_summary: {
        overall_average: number;
        total_cos: number;
        total_pos: number;
        mapped_pos: number;
        unmapped_pos: number;
      };
    };
  };
  model: string;
  temperature: number;
  useCache: boolean;
}

export interface RevisedMappingResponse {
  success: boolean;
  workflowType: string;
  data: Record<string, unknown>;
  metadata: {
    promptPath: string;
    hasValidationError: boolean;
  };
  cached: boolean;
  executionTimeMs: number;
}

export type {
  SyllabusUnit,
  SyllabusCourseObjective,
  SyllabusBook,
  SyllabusCourseDetails,
  SyllabusValidation,
  SyllabusMetadata,
  SyllabusCourseOutcome,
  SyllabusResponseData,
  SyllabusApiResponse,
};
