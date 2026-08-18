export type InstitutionStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type InstitutionCategory = 'Engineering' | 'Medical' | 'Arts & Science' | 'Management' | 'Law' | 'Education' | 'Pharmacy';

export interface InstitutionAdmin {
  name: string;
  email: string;
  mobile: string;
  temporaryPassword?: string;
  password?: string;
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

export interface BasicInfoPayload {
  name: string;
  code: string;
  category: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
}

export interface AddressPayload {
  addressLine1: string;
  addressLine2?: string;
  state: string;
  district: string;
  pincode: string;
}

export interface AdminUserPayload {
  name: string;
  email: string;
  mobile: string;
  autoGeneratePassword?: boolean;
}

export interface CreateInstitutionRequest {
  basicInfo: BasicInfoPayload;
  address: AddressPayload;
  admin: AdminUserPayload;
}

export interface InstitutionAdminDto {
  name: string;
  email: string;
  mobile: string;
  temporaryPassword?: string;
}

export interface CreateInstitutionResponse {
  id: string | number;
  basicInfo?: BasicInfoPayload;
  address?: AddressPayload;
  admin?: InstitutionAdminDto;
  status?: string;
  createdAt?: string;
  name?: string;
  code?: string;
  category?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  logoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  city?: string;
  district?: string;
  pincode?: string;
  usersCount?: number;
  repositoryCompletion?: number;
  documentsUploaded?: number;
  institution?: any;
  adminUser?: any;
  academicEntities?: any;
  iqacUser?: any;
  principalUser?: any;
}

export interface InstitutionSummary {
  id: number | string;
  name: string;
  code: string;
  status: string;
  category: string;
  usersCount?: number;
  repositoryCompletion?: number;
}

export interface InstitutionListApiResponse {
  content: any[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}