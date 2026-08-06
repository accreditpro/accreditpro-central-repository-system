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
    try {
      const params: Record<string, string> = {};
      if (category && CATEGORY_TO_API[category]) {
        params.category = CATEGORY_TO_API[category];
      }
      const raw = await apiService.get<any>('/admin/templates', { params });

      let items: any[] = [];
      if (Array.isArray(raw)) {
        items = raw;
      } else if (raw && Array.isArray(raw.data)) {
        items = raw.data;
      } else if (raw && Array.isArray(raw.content)) {
        items = raw.content;
      }

      return items.map((t: any, idx: number) => {
        const rawStatus = String(t.status || 'ACTIVE').toLowerCase();
        const normStatus: any = rawStatus === 'inactive' ? 'inactive' : rawStatus === 'draft' ? 'draft' : 'active';
        return {
          id: Number(t.id || idx + 1),
          name: t.name || t.templateName || 'Unnamed Template',
          category: t.category ? categoryFromApi(String(t.category)) : (category || 'Academic'),
          version: String(t.version || t.versionNumber || '1.0'),
          uploadedBy: t.uploadedBy || t.uploadedByName || t.uploader?.name || 'Super Admin',
          uploadedDate: t.uploadedDate || t.createdAt || t.updatedAt || new Date().toISOString().split('T')[0],
          status: normStatus,
          fileType: (t.fileType || t.extension || 'CSV').toLowerCase() as any,
          fileSize: t.fileSize || t.size || '15 KB',
          description: t.description || '',
          downloads: t.downloads ?? t.downloadCount ?? 0,
          versionHistory: Array.isArray(t.versionHistory) ? t.versionHistory : [],
        };
      });
    } catch (error) {
      console.warn('API error fetching templates, returning empty list:', error);
      return [];
    }
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

  /**
   * PATCH /api/admin/templates/{id}/status
   *
   * Updates template status (ACTIVE | INACTIVE)
   */
  async updateTemplateStatus(id: number, status: 'active' | 'inactive'): Promise<Template> {
    const apiStatus = status === 'active' ? 'ACTIVE' : 'INACTIVE';
    const response = await apiService.patch<Template>(`/admin/templates/${id}/status`, {
      status: apiStatus,
    });
    return {
      ...response,
      category: categoryFromApi(response.category as string),
    };
  }

  async deactivateTemplate(id: number, currentStatus: TemplateStatus = 'active'): Promise<void> {
    const targetStatus = currentStatus === 'active' ? 'INACTIVE' : 'ACTIVE';
    await apiService.patch(`/admin/templates/${id}/status`, {
      status: targetStatus,
    });
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
