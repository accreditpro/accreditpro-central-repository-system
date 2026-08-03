import { apiService } from '@/services/api.service';
import {
  Template,
  TemplateCategory,
  TemplateUploadRequest,
  TemplateReplaceRequest,
  TEMPLATE_CATEGORIES,
  CATEGORY_TO_API,
  categoryFromApi,
} from '@/types/template.types';

const USER_KEY = 'accreditpro-user';

/**
 * Read the current user's ID from localStorage.
 * Returns null if no user is stored.
 */
function getCurrentUserId(): number | null {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id ?? null;
    }
  } catch {
    // Malformed storage
  }
  return null;
}

class TemplateService {
  /**
   * GET /api/admin/templates
   *
   * Fetches templates from the backend. Accepts an optional category filter
   * (TitleCase) which is converted to UPPER_CASE for the API query param.
   */
  async getTemplates(category?: TemplateCategory): Promise<Template[]> {
    const params: Record<string, string> = {};
    if (category) {
      params.category = CATEGORY_TO_API[category];
    }
    const response = await apiService.get<Template[]>('/admin/templates', { params });
    return response.map(t => ({
      ...t,
      category: categoryFromApi(t.category as string),
    }));
  }

  /**
   * POST /api/admin/templates/upload
   *
   * Multipart form-data:
   * - `request`: JSON string of TemplateUploadRequest
   * - `file`: the template file (CSV or XLSX)
   */
  async uploadTemplate(
    file: File,
    category: TemplateCategory,
    name: string,
    description: string
  ): Promise<Template> {
    const userId = getCurrentUserId();
    if (userId === null) {
      throw new Error('User not authenticated. Please log in again.');
    }

    const request: TemplateUploadRequest = {
      name,
      category: CATEGORY_TO_API[category],
      description,
      uploadedByUserId: userId,
    };

    const formData = new FormData();
    formData.append('request', JSON.stringify(request));
    formData.append('file', file);

    // apiService.post unwraps ApiResponse → returns `data` field directly
    const response = await apiService.post<Template>('/admin/templates/upload', formData);

    return {
      ...response,
      category,
    };
  }

  /**
   * POST /api/admin/templates/{id}/replace
   *
   * Multipart form-data:
   * - `request`: JSON string of TemplateReplaceRequest (notes + uploadedByUserId)
   * - `file`: the replacement template file (CSV or XLSX)
   */
  async replaceTemplate(id: number, file: File, notes: string): Promise<Template> {
    const userId = getCurrentUserId();
    if (userId === null) {
      throw new Error('User not authenticated. Please log in again.');
    }

    const request: TemplateReplaceRequest = {
      notes,
      uploadedByUserId: userId,
    };

    const formData = new FormData();
    formData.append('request', JSON.stringify(request));
    formData.append('file', file);

    const response = await apiService.post<Template>(`/admin/templates/${id}/replace`, formData);

    return {
      ...response,
      category: categoryFromApi(response.category as string),
    };
  }

  async deactivateTemplate(_id: number): Promise<void> {
    // Mock — real API will be integrated later
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * GET /api/admin/templates/{id}
   *
   * Fetches a single template with full details including version history.
   * Used by the View Details action in the templates table.
   */
  async getTemplateById(id: number): Promise<Template> {
    const response = await apiService.get<Template>(`/admin/templates/${id}`);
    return {
      ...response,
      category: categoryFromApi(response.category as string),
    };
  }

  /**
   * GET /api/admin/templates/{id}/download
   *
   * Downloads the template file. The backend returns the file as a binary
   * blob. The download method handles filename extraction and triggers
   * the browser download dialog.
   */
  async downloadTemplate(id: number): Promise<void> {
    await apiService.download(`/admin/templates/${id}/download`);
  }

  getCategories(): TemplateCategory[] {
    return TEMPLATE_CATEGORIES;
  }
}

export const templateService = new TemplateService();
