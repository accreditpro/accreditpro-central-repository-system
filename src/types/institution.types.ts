export type InstitutionStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type InstitutionCategory = 'Engineering' | 'Medical' | 'Arts & Science' | 'Management' | 'Law' | 'Education' | 'Pharmacy';

export interface InstitutionAdmin {
  name: string;
  email: string;
  mobile: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  category: InstitutionCategory;
  state: string;
  city: string;
  status: InstitutionStatus;
  logo: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  district?: string;
  pincode?: string;
  admin?: InstitutionAdmin;
  usersCount: number;
  repositoryCompletion: number;
  documentsUploaded: number;
  establishedYear: number;
  accreditationStatus: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionFilters {
  search: string;
  status: InstitutionStatus | 'all';
  category: InstitutionCategory | 'all';
  state: string | 'all';
  repositoryCompletion: 'all' | 'below-50' | '50-75' | 'above-75';
}

export interface InstitutionSortConfig {
  key: keyof Institution;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface InstitutionListResponse {
  data: Institution[];
  pagination: PaginationConfig;
}

export interface InstitutionQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  category?: string;
  state?: string;
  repositoryCompletion?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}