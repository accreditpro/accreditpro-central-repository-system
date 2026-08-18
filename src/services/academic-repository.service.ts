import { apiService } from './api.service';

export interface AcademicRepositorySummary {
  academicYear: string;
  departmentId: number;
  dataCompleteness: number;
  evidenceScore: number;
  verificationScore: number;
  readinessScore: number;
  sections: any[];
}

export interface ApiCalendarEvent {
  id?: number | string;
  departmentId?: number;
  academicYear: string;
  yearOfStudy: string;
  semester: string;
  description: string;
  startDate: string;
  endDate: string;
  duration?: number;
}

export interface ApiValueAddedCourse {
  id?: number | string;
  departmentId?: number;
  academicYear: string;
  yearOfStudy: string;
  semester: string;
  courseName: string;
  fromDate?: string;
  toDate?: string;
  timeFrom?: string;
  timeTo?: string;
  courseInstructor: string;
  duration?: string;
  studentsEnrolled?: number;
  studentsParticipated?: number;
  certificationProvided?: boolean;
  certificatesIssued?: number;
}

export interface ApiTimetableEntry {
  id?: number | string;
  departmentId?: number;
  academicYear: string;
  yearOfStudy: string;
  semester: string;
  section: string;
  period: number;
  day: string;
  timeFrom?: string;
  timeTo?: string;
  courseCode: string;
  classInCharge: string;
  wef?: string;
}

export interface ApiAddOnProgram {
  id?: number | string;
  departmentId?: number;
  academicYear: string;
  yearOfStudy: string;
  semester: string;
  topic: string;
  fromDate?: string;
  toDate?: string;
  timeFrom?: string;
  timeTo?: string;
  coordinator: string;
  duration?: string;
  studentsEnrolled?: number;
  studentsParticipated?: number;
  certificationProvided?: boolean;
  certificatesIssued?: number;
}

class AcademicRepositoryService {
  private readonly baseUrl = '/v1/academic-repository';

  async getDashboardSummary(
    academicYear: string,
    departmentId: number
  ): Promise<AcademicRepositorySummary> {
    const query = new URLSearchParams();
    query.set('academicYear', academicYear);
    query.set('departmentId', String(departmentId));

    return apiService.get<AcademicRepositorySummary>(
      `${this.baseUrl}/dashboard/summary?${query.toString()}`
    );
  }

  async getCalendarEvents(academicYear: string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('academicYear', academicYear);
    query.set('departmentId', String(departmentId));
    query.set('size', '1000'); // Fetch all for frontend filtering
    return apiService.get<any>(`${this.baseUrl}/academic-calendar?${query.toString()}`);
  }

  async createCalendarEvent(departmentId: number, data: ApiCalendarEvent): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.post<any>(`${this.baseUrl}/academic-calendar?${query.toString()}`, data);
  }

  async updateCalendarEvent(
    id: number | string,
    departmentId: number,
    data: ApiCalendarEvent
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.put<any>(`${this.baseUrl}/academic-calendar/${id}?${query.toString()}`, data);
  }

  async deleteCalendarEvent(id: number | string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.delete<any>(`${this.baseUrl}/academic-calendar/${id}?${query.toString()}`);
  }

  async bulkSaveCalendarEvents(
    departmentId: number,
    data: { academicYear: string; yearOfStudy: string; semester: string; events: any[] }
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.post<any>(`${this.baseUrl}/academic-calendar/bulk?${query.toString()}`, data);
  }

  // --- Value Added Courses APIs ---

  async getValueAddedCourses(academicYear: string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('academicYear', academicYear);
    query.set('departmentId', String(departmentId));
    query.set('size', '1000');
    return apiService.get<any>(`${this.baseUrl}/value-added-courses?${query.toString()}`);
  }

  async createValueAddedCourse(departmentId: number, data: ApiValueAddedCourse): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.post<any>(`${this.baseUrl}/value-added-courses?${query.toString()}`, data);
  }

  async updateValueAddedCourse(
    id: number | string,
    departmentId: number,
    data: ApiValueAddedCourse
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.put<any>(
      `${this.baseUrl}/value-added-courses/${id}?${query.toString()}`,
      data
    );
  }

  async deleteValueAddedCourse(id: number | string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.delete<any>(`${this.baseUrl}/value-added-courses/${id}?${query.toString()}`);
  }

  async bulkSaveValueAddedCourses(
    departmentId: number,
    data: { academicYear: string; yearOfStudy: string; semester: string; courses: any[] }
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.post<any>(
      `${this.baseUrl}/value-added-courses/bulk?${query.toString()}`,
      data
    );
  }

  // --- Timetable APIs ---

  async getTimetableEntries(academicYear: string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('academicYear', academicYear);
    query.set('departmentId', String(departmentId));
    query.set('size', '1000');
    return apiService.get<any>(`${this.baseUrl}/timetable?${query.toString()}`);
  }

  async createTimetableEntry(departmentId: number, data: ApiTimetableEntry): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.post<any>(`${this.baseUrl}/timetable?${query.toString()}`, data);
  }

  async updateTimetableEntry(
    id: number | string,
    departmentId: number,
    data: ApiTimetableEntry
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.put<any>(`${this.baseUrl}/timetable/${id}?${query.toString()}`, data);
  }

  async deleteTimetableEntry(id: number | string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.delete<any>(`${this.baseUrl}/timetable/${id}?${query.toString()}`);
  }

  async bulkSaveTimetable(
    departmentId: number,
    data: {
      academicYear: string;
      yearOfStudy: string;
      semester: string;
      section: string;
      entries: any[];
    }
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.post<any>(`${this.baseUrl}/timetable/bulk?${query.toString()}`, data);
  }

  // --- Add-On Programs APIs ---

  async getAddOnPrograms(academicYear: string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('academicYear', academicYear);
    query.set('departmentId', String(departmentId));
    query.set('size', '1000');
    return apiService.get<any>(`${this.baseUrl}/addon-programs?${query.toString()}`);
  }

  async createAddOnProgram(departmentId: number, data: ApiAddOnProgram): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.post<any>(`${this.baseUrl}/addon-programs?${query.toString()}`, data);
  }

  async updateAddOnProgram(
    id: number | string,
    departmentId: number,
    data: ApiAddOnProgram
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.put<any>(`${this.baseUrl}/addon-programs/${id}?${query.toString()}`, data);
  }

  async deleteAddOnProgram(id: number | string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.delete<any>(`${this.baseUrl}/addon-programs/${id}?${query.toString()}`);
  }

  async bulkSaveAddOnPrograms(
    departmentId: number,
    data: { academicYear: string; yearOfStudy: string; semester: string; programs: any[] }
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.post<any>(`${this.baseUrl}/addon-programs/bulk?${query.toString()}`, data);
  }

  // --- Evidence APIs ---

  async getEvidenceDocuments(
    academicYear: string,
    departmentId: number,
    params?: any
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('academicYear', academicYear);
    query.set('departmentId', String(departmentId));
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.set(key, String(value));
      });
    }
    return apiService.get<any>(`${this.baseUrl}/evidence?${query.toString()}`);
  }

  async uploadEvidenceDocument(
    departmentId: number,
    uploadedBy: number,
    file: File,
    data: any
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    query.set('uploadedBy', String(uploadedBy));

    const formData = new FormData();
    formData.append('file', file);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });

    return apiService.post<any>(`${this.baseUrl}/evidence/upload?${query.toString()}`, formData);
  }

  async downloadEvidenceDocument(id: number | string): Promise<any> {
    return apiService.get<any>(`${this.baseUrl}/evidence/${id}/download`);
  }

  async deleteEvidenceDocument(id: number | string, departmentId: number): Promise<any> {
    const query = new URLSearchParams();
    query.set('departmentId', String(departmentId));
    return apiService.delete<any>(`${this.baseUrl}/evidence/${id}?${query.toString()}`);
  }

  async verifyEvidenceDocument(
    id: number | string,
    verifiedBy: number,
    status: string,
    notes?: string
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set('verifiedBy', String(verifiedBy));
    const payload: any = { verificationStatus: status };
    if (notes) payload.verificationNotes = notes;
    return apiService.put<any>(
      `${this.baseUrl}/evidence/${id}/verify?${query.toString()}`,
      payload
    );
  }
}

export const academicRepositoryService = new AcademicRepositoryService();
