import { apiService } from '@/services/api.service';
import { adminService } from '@/services/admin.service';
import {
  Institution,
  InstitutionAdmin,
  InstitutionCategory,
  InstitutionStatus,
  InstitutionListResponse,
  InstitutionQueryParams,
} from '@/types/institution.types';

// Mock data - 30 institutions
const indianStates = [
  'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Kerala',
  'Andhra Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'West Bengal',
  'Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Bihar',
];

const categories: InstitutionCategory[] = [
  'Engineering', 'Medical', 'Arts & Science', 'Management', 'Law', 'Education', 'Pharmacy',
];

const statuses: InstitutionStatus[] = ['active', 'inactive', 'pending', 'suspended'];

const districts = [
  'Chennai', 'Bengaluru', 'Pune', 'Mumbai', 'Hyderabad', 'Kolkata', 'Delhi',
  'Jaipur', 'Lucknow', 'Ahmedabad', 'Thiruvananthapuram', 'Vijayawada', 'Chandigarh', 'Bhopal', 'Patna',
];

const streetNames = [
  'Anna Salai', 'MG Road', 'FC Road', 'Linking Road', 'Banjara Hills', 'Park Street',
  'Connaught Place', 'MI Road', 'Hazratganj', 'CG Road', 'Benz Circle', 'Sector 17',
  'New Market', 'Fraser Road', 'Marine Drive',
];

const landmarks = [
  'City Mall', 'Central Bus Stand', 'Railway Station', 'District Court', 'Main Market',
  'Public Library', 'City Park', 'Government Hospital', 'Central Post Office', 'Stadium',
];

const adminNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Gupta', 'Karthik Iyer', 'Meera Nair', 'Arjun Mehta', 'Divya Krishnan',
  'Rahul Verma', 'Pooja Joshi', 'Suresh Babu', 'Neha Kapoor', 'Vivek Menon',
];

const institutionNames = [
  'National Institute of Technology, Trichy',
  'All India Institute of Medical Sciences, Delhi',
  'Indian Institute of Management, Bangalore',
  'Jawaharlal Nehru University',
  'National Law School of India University',
  'Indian Institute of Technology, Madras',
  'Birla Institute of Technology and Science',
  'Vellore Institute of Technology',
  'Manipal Academy of Higher Education',
  'Symbiosis International University',
  'Amity University',
  'SRM Institute of Science and Technology',
  'Christ University',
  'Lovely Professional University',
  'Thapar Institute of Engineering and Technology',
  'PSG College of Technology',
  'Anna University',
  'Osmania University',
  'Savitribai Phule Pune University',
  'University of Mumbai',
  'Jadavpur University',
  'Banaras Hindu University',
  'Delhi University',
  'Aligarh Muslim University',
  'University of Hyderabad',
  'Jamia Millia Islamia',
  'Pondicherry University',
  'Central University of Tamil Nadu',
  'Indian Statistical Institute',
  'Tata Institute of Social Sciences',
];

const generateMockInstitutions = (): Institution[] => {
  return Array.from({ length: 30 }, (_, index) => {
    const name = institutionNames[index % institutionNames.length];
    const category = categories[index % categories.length];
    const state = indianStates[index % indianStates.length];
    const city = districts[index % districts.length];
    const status = statuses[index % statuses.length];
    const adminName = adminNames[index % adminNames.length];

    return {
      id: `inst-${String(index + 1).padStart(3, '0')}`,
      name,
      code: `INST-${String(index + 1).padStart(3, '0')}`,
      category,
      state,
      city,
      status,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.slice(0, 2))}&background=3b82f6&color=fff&size=80&bold=true`,
      email: `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
      phone: `+91-${Math.floor(9000000000 + Math.random() * 900000000)}`,
      website: `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
      addressLine1: `${100 + index}, ${streetNames[index % streetNames.length]}`,
      addressLine2: `Near ${landmarks[index % landmarks.length]}`,
      district: city,
      pincode: `${600001 + index}`,
      admin: {
        name: adminName,
        email: `${adminName.toLowerCase().replace(' ', '.')}@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
        mobile: `+91-${Math.floor(9000000000 + Math.random() * 900000000)}`,
      },
      usersCount: Math.floor(Math.random() * 200) + 20,
      repositoryCompletion: Math.floor(Math.random() * 60) + 40,
      documentsUploaded: Math.floor(Math.random() * 3000) + 200,
      establishedYear: 1950 + Math.floor(Math.random() * 60),
      accreditationStatus: ['NAAC A++', 'NAAC A+', 'NAAC A', 'NAAC B++', 'NBA'][index % 5],
      lastActive: `${Math.floor(Math.random() * 24) + 1} hours ago`,
      createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      updatedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    };
  });
};

const mockInstitutions = generateMockInstitutions();

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class InstitutionService {
  private getMockInstitutions(params: InstitutionQueryParams): InstitutionListResponse {
    let filtered = [...mockInstitutions];

    // Search
    if (params.search) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (inst) =>
          inst.name.toLowerCase().includes(query) ||
          inst.code.toLowerCase().includes(query) ||
          inst.city.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((inst) => inst.status === params.status);
    }

    // Filter by category
    if (params.category && params.category !== 'all') {
      filtered = filtered.filter((inst) => inst.category === params.category);
    }

    // Filter by state
    if (params.state && params.state !== 'all') {
      filtered = filtered.filter((inst) => inst.state === params.state);
    }

    // Filter by repository completion
    if (params.repositoryCompletion && params.repositoryCompletion !== 'all') {
      switch (params.repositoryCompletion) {
        case 'below-50':
          filtered = filtered.filter((inst) => inst.repositoryCompletion < 50);
          break;
        case '50-75':
          filtered = filtered.filter(
            (inst) => inst.repositoryCompletion >= 50 && inst.repositoryCompletion <= 75
          );
          break;
        case 'above-75':
          filtered = filtered.filter((inst) => inst.repositoryCompletion > 75);
          break;
      }
    }

    // Sorting
    if (params.sortBy) {
      const key = params.sortBy as keyof Institution;
      const dir = params.sortDirection === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * dir;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * dir;
        }
        return 0;
      });
    }

    // Pagination
    const total = filtered.length;
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const data = filtered.slice(start, end);

    return {
      data,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
      },
    };
  }

  async getInstitutions(params: InstitutionQueryParams): Promise<InstitutionListResponse> {
    try {
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

      const raw = await apiService.get<any>('/admin/institutions', { params: queryParams });

      let items: any[] = [];
      let total = 0;

      if (Array.isArray(raw)) {
        items = raw;
        total = raw.length;
      } else if (raw && Array.isArray(raw.data)) {
        items = raw.data;
        total = raw.pagination?.total ?? raw.total ?? items.length;
      } else if (raw && Array.isArray(raw.content)) {
        items = raw.content;
        total = raw.totalElements ?? items.length;
      }

      const formatted: Institution[] = items.map((rawItem: any, idx: number) => {
        const item = rawItem.institution || rawItem;
        const adminObj = rawItem.adminUser || rawItem.admin || item.admin;
        const instName = item.name || item.basicInfo?.name || '';

        return {
          id: String(item.id || `inst-${idx}`),
          name: instName,
          code: item.code || item.basicInfo?.code || '',
          category: (item.category || item.basicInfo?.category || 'Engineering') as InstitutionCategory,
          state: item.state || item.address?.state || '',
          city: item.city || item.address?.city || item.address?.district || '',
          status: (item.status ? String(item.status).toLowerCase() : 'active') as InstitutionStatus,
          logo: item.logoUrl || item.logo || item.basicInfo?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent((instName || 'IN').slice(0, 2))}&background=3b82f6&color=fff&size=80&bold=true`,
          email: item.email || item.basicInfo?.email || '',
          phone: item.phone || item.basicInfo?.phone || '',
          website: item.website || item.basicInfo?.website || '',
          addressLine1: item.addressLine1 || item.address?.addressLine1 || '',
          addressLine2: item.addressLine2 || item.address?.addressLine2 || '',
          district: item.district || item.address?.district || item.city || '',
          pincode: item.pincode || item.address?.pincode || '',
          admin: adminObj
            ? {
                name: adminObj.name || '',
                email: adminObj.email || '',
                mobile: adminObj.mobile || '',
              }
            : undefined,
          usersCount: rawItem.usersCreated ?? item.usersCount ?? item.userCount ?? 0,
          repositoryCompletion: item.repositoryCompletion ?? item.completionPercentage ?? 0,
          documentsUploaded: item.documentsUploaded ?? item.documentCount ?? 0,
          establishedYear: item.establishedYear || (item.createdAt ? new Date(item.createdAt).getFullYear() : new Date().getFullYear()),
          accreditationStatus: item.accreditationStatus || 'Active',
          lastActive: item.lastActive || 'Recently',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        };
      });

      return {
        data: formatted,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          total,
        },
      };
    } catch (error) {
      console.warn('API error fetching institutions from backend, using fallback:', error);
      return this.getMockInstitutions(params);
    }
  }

  async getInstitutionById(id: string): Promise<Institution | null> {
    try {
      const raw = await apiService.get<any>(`/admin/institutions/${id}`);
      if (!raw) return null;

      // Extract institution object and adminUser object from nested API response
      const target = raw?.data?.institution || raw?.institution || raw?.data || raw;
      const adminObj = raw?.data?.adminUser || raw?.adminUser || raw?.admin || target?.admin;

      const instName = target.name || target.basicInfo?.name || '';
      return {
        id: String(target.id || id),
        name: instName,
        code: target.code || target.basicInfo?.code || '',
        category: (target.category || target.basicInfo?.category || 'Engineering') as InstitutionCategory,
        state: target.state || target.address?.state || '',
        city: target.city || target.address?.city || target.address?.district || '',
        status: (target.status ? String(target.status).toLowerCase() : 'active') as InstitutionStatus,
        logo: target.logoUrl || target.logo || target.basicInfo?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent((instName || 'IN').slice(0, 2))}&background=3b82f6&color=fff&size=80&bold=true`,
        email: target.email || target.basicInfo?.email || '',
        phone: target.phone || target.basicInfo?.phone || '',
        website: target.website || target.basicInfo?.website || '',
        addressLine1: target.addressLine1 || target.address?.addressLine1 || '',
        addressLine2: target.addressLine2 || target.address?.addressLine2 || '',
        district: target.district || target.address?.district || target.city || '',
        pincode: target.pincode || target.address?.pincode || '',
        admin: adminObj
          ? {
              name: adminObj.name || '',
              email: adminObj.email || '',
              mobile: adminObj.mobile || '',
            }
          : undefined,
        usersCount: raw?.data?.usersCreated ?? target.usersCount ?? target.userCount ?? 0,
        repositoryCompletion: target.repositoryCompletion ?? target.completionPercentage ?? 0,
        documentsUploaded: target.documentsUploaded ?? target.documentCount ?? 0,
        establishedYear: target.establishedYear || (target.createdAt ? new Date(target.createdAt).getFullYear() : new Date().getFullYear()),
        accreditationStatus: target.accreditationStatus || 'Active',
        lastActive: target.lastActive || 'Recently',
        createdAt: target.createdAt || new Date().toISOString(),
        updatedAt: target.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.warn(`API error fetching institution by ID (${id}), using fallback:`, error);
      return mockInstitutions.find((inst) => inst.id === id) || null;
    }
  }

  async createInstitution(data: {
    name: string;
    code: string;
    category: InstitutionCategory;
    email: string;
    phone: string;
    website?: string;
    state: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    district: string;
    pincode: string;
    admin: InstitutionAdmin;
    logo?: string;
  }): Promise<Institution> {
    try {
      const payload: any = {
        basicInfo: {
          name: data.name,
          code: data.code,
          category: data.category,
          email: data.email,
          phone: data.phone,
          website: data.website || '',
          logo: data.logo || '',
        },
        address: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || '',
          state: data.state,
          district: data.district || data.city,
          city: data.city,
          pincode: data.pincode,
        },
        admin: {
          name: data.admin.name,
          email: data.admin.email,
          mobile: data.admin.mobile,
          autoGeneratePassword: true,
        },
        academicConfig: {
          programTypes: ['UG', 'PG'],
          shiftOptions: ['Day'],
          accreditationBody: 'NAAC',
          naacGrade: 'A+',
          nbaAccredited: true,
        },
        academicYears: {
          currentAcademicYear: '2025-26',
          historicalYears: ['2024-25', '2023-24'],
        },
        iqacCoordinator: {
          name: data.admin.name,
          email: data.admin.email,
          mobile: data.admin.mobile,
        },
        principal: {
          name: data.admin.name,
          email: data.admin.email,
          mobile: data.admin.mobile,
        },
      };

      const response = await adminService.createInstitution(payload);
      return {
        id: String(response?.id || `inst-${Date.now()}`),
        name: data.name,
        code: data.code,
        category: data.category,
        state: data.state,
        city: data.city,
        status: 'active',
        logo: data.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name.slice(0, 2))}&background=3b82f6&color=fff&size=80&bold=true`,
        email: data.email,
        phone: data.phone,
        website: data.website,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        district: data.district,
        pincode: data.pincode,
        admin: data.admin,
        usersCount: 0,
        repositoryCompletion: 0,
        documentsUploaded: 0,
        establishedYear: new Date().getFullYear(),
        accreditationStatus: 'Active',
        lastActive: 'Just now',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('API error creating institution, using fallback:', error);
      const inst: Institution = {
        id: `inst-${String(mockInstitutions.length + 1).padStart(3, '0')}`,
        name: data.name,
        code: data.code,
        category: data.category,
        state: data.state,
        city: data.city,
        status: 'active',
        logo: data.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name.slice(0, 2))}&background=3b82f6&color=fff&size=80&bold=true`,
        email: data.email,
        phone: data.phone,
        website: data.website || undefined,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || '',
        district: data.district,
        pincode: data.pincode,
        admin: data.admin,
        usersCount: 0,
        repositoryCompletion: 0,
        documentsUploaded: 0,
        establishedYear: new Date().getFullYear(),
        accreditationStatus: 'Pending',
        lastActive: 'Just now',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockInstitutions.unshift(inst);
      return { ...inst };
    }
  }

  async updateInstitutionStatus(id: string, status: InstitutionStatus): Promise<Institution | null> {
    try {
      const numericId = parseInt(id.replace(/\D/g, '')) || 1;
      const apiStatus = status.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      await adminService.updateInstitutionStatus(numericId, apiStatus);
      return await this.getInstitutionById(id);
    } catch (error) {
      console.warn(`API error updating status for institution (${id}), using fallback:`, error);
      const inst = mockInstitutions.find((i) => i.id === id);
      if (inst) {
        inst.status = status;
        inst.updatedAt = new Date().toISOString();
        return { ...inst };
      }
      return null;
    }
  }

  async updateInstitution(id: string, updates: Partial<Institution>): Promise<Institution | null> {
    try {
      const numericId = parseInt(id.replace(/\D/g, '')) || 1;
      const payload: any = {
        basicInfo: {
          name: updates.name || '',
          code: updates.code || '',
          category: updates.category || 'Engineering',
          email: updates.email || '',
          phone: updates.phone || '',
          website: updates.website || '',
          logo: updates.logo || '',
        },
        address: {
          addressLine1: updates.addressLine1 || '',
          addressLine2: updates.addressLine2 || '',
          state: updates.state || '',
          district: updates.district || updates.city || '',
          city: updates.city || '',
          pincode: updates.pincode || '',
        },
        admin: {
          name: updates.admin?.name || '',
          email: updates.admin?.email || '',
          mobile: updates.admin?.mobile || '',
        },
        academicConfig: {
          programTypes: ['UG', 'PG'],
          shiftOptions: ['Day'],
          accreditationBody: 'NAAC',
          naacGrade: 'A+',
          nbaAccredited: true,
        },
        academicYears: {
          currentAcademicYear: '2025-26',
          historicalYears: ['2024-25', '2023-24'],
        },
        iqacCoordinator: {
          name: updates.admin?.name || '',
          email: updates.admin?.email || '',
          mobile: updates.admin?.mobile || '',
        },
        principal: {
          name: updates.admin?.name || '',
          email: updates.admin?.email || '',
          mobile: updates.admin?.mobile || '',
        },
      };

      await adminService.updateInstitution(numericId, payload);
      return await this.getInstitutionById(id);
    } catch (error) {
      console.warn(`API error updating institution (${id}), using fallback:`, error);
      const inst = mockInstitutions.find((i) => i.id === id);
      if (inst) {
        Object.assign(inst, updates, { updatedAt: new Date().toISOString() });
        return { ...inst };
      }
      return null;
    }
  }

  async deleteInstitution(id: string): Promise<boolean> {
    try {
      const numericId = parseInt(id.replace(/\D/g, '')) || 1;
      await adminService.deleteInstitution(numericId);
      return true;
    } catch (error) {
      console.warn(`API error deleting institution (${id}), using fallback:`, error);
      const index = mockInstitutions.findIndex((i) => i.id === id);
      if (index !== -1) {
        mockInstitutions.splice(index, 1);
        return true;
      }
      return false;
    }
  }

  getStates(): string[] {
    return indianStates;
  }

  getCategories(): InstitutionCategory[] {
    return categories;
  }
}

export const institutionService = new InstitutionService();