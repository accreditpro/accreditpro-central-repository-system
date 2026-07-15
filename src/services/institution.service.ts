import {
  Institution,
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
  return institutionNames.map((name, index) => {
    const category = categories[index % categories.length];
    const state = indianStates[index % indianStates.length];
    const status = index < 20 ? 'active' : statuses[index % statuses.length];
    const code = name
      .split(/[\s,]+/)
      .filter((w) => w.length > 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 6);

    return {
      id: `inst-${String(index + 1).padStart(3, '0')}`,
      name,
      code: `${code}-${String(index + 1).padStart(3, '0')}`,
      category,
      state,
      city: state,
      status,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.slice(0, 2))}&background=${['3b82f6', '10b981', '8b5cf6', 'f59e0b', 'ef4444', '06b6d4', 'ec4899'][index % 7]}&color=fff&size=40&bold=true`,
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
  async getInstitutions(params: InstitutionQueryParams): Promise<InstitutionListResponse> {
    await delay(600);

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

  async getInstitutionById(id: string): Promise<Institution | null> {
    await delay(300);
    return mockInstitutions.find((inst) => inst.id === id) || null;
  }

  async updateInstitutionStatus(id: string, status: InstitutionStatus): Promise<Institution | null> {
    await delay(400);
    const inst = mockInstitutions.find((i) => i.id === id);
    if (inst) {
      inst.status = status;
      inst.updatedAt = new Date().toISOString();
      return { ...inst };
    }
    return null;
  }

  async deleteInstitution(id: string): Promise<boolean> {
    await delay(400);
    const index = mockInstitutions.findIndex((i) => i.id === id);
    if (index !== -1) {
      mockInstitutions.splice(index, 1);
      return true;
    }
    return false;
  }

  getStates(): string[] {
    return indianStates;
  }

  getCategories(): InstitutionCategory[] {
    return categories;
  }
}

export const institutionService = new InstitutionService();