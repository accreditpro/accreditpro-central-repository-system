import { LoginCredentials, LoginResponse, User, UserRole, AuthTokens } from '@/types/auth.types';

// Mock users for development
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'superadmin@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'superadmin@accreditpro.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      institution: 'AccreditPro Platform',
      createdAt: '2024-01-01T00:00:00Z',
    },
  },
  'institution@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '2',
      email: 'institution@accreditpro.com',
      firstName: 'Institution',
      lastName: 'Admin',
      role: UserRole.INSTITUTION_ADMIN,
      institution: 'National University',
      createdAt: '2024-01-15T00:00:00Z',
    },
  },
  'iqac@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '3',
      email: 'iqac@accreditpro.com',
      firstName: 'IQAC',
      lastName: 'Coordinator',
      role: UserRole.IQAC_COORDINATOR,
      institution: 'National University',
      createdAt: '2024-02-01T00:00:00Z',
    },
  },
  'principal@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '4',
      email: 'principal@accreditpro.com',
      firstName: 'Dr. James',
      lastName: 'Wilson',
      role: UserRole.PRINCIPAL,
      institution: 'National University',
      createdAt: '2024-02-15T00:00:00Z',
    },
  },
  'department@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '5',
      email: 'department@accreditpro.com',
      firstName: 'Department',
      lastName: 'Coordinator',
      role: UserRole.DEPARTMENT_COORDINATOR,
      institution: 'National University',
      department: 'Computer Science',
      createdAt: '2024-03-01T00:00:00Z',
    },
  },
  'infrastructure@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '6',
      email: 'infrastructure@accreditpro.com',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: UserRole.INFRASTRUCTURE_COORDINATOR,
      institution: 'National University',
      createdAt: '2024-03-15T00:00:00Z',
    },
  },
  'finance@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '7',
      email: 'finance@accreditpro.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: UserRole.FINANCE_COORDINATOR,
      institution: 'National University',
      createdAt: '2024-04-01T00:00:00Z',
    },
  },
  'tpo@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '8',
      email: 'tpo@accreditpro.com',
      firstName: 'Vikram',
      lastName: 'Mehta',
      role: UserRole.TPO_COORDINATOR,
      institution: 'National University',
      createdAt: '2024-04-15T00:00:00Z',
    },
  },
  'studentdev@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '9',
      email: 'studentdev@accreditpro.com',
      firstName: 'Anita',
      lastName: 'Desai',
      role: UserRole.STUDENT_DEVELOPMENT_COORDINATOR,
      institution: 'National University',
      createdAt: '2024-05-01T00:00:00Z',
    },
  },
  'examination@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '10',
      email: 'examination@accreditpro.com',
      firstName: 'Dr. Ramesh',
      lastName: 'Iyer',
      role: UserRole.EXAMINATION_OFFICER,
      institution: 'National University',
      createdAt: '2024-06-01T00:00:00Z',
    },
  },
  'hod@accreditpro.com': {
    password: 'admin123',
    user: {
      id: '11',
      email: 'hod@accreditpro.com',
      firstName: 'Dr. Suresh',
      lastName: 'Patil',
      role: UserRole.HEAD_OF_DEPARTMENT,
      institution: 'National University',
      department: 'Computer Science & Engineering',
      createdAt: '2024-01-15T00:00:00Z',
    },
  },
};

class AuthService {
  private readonly TOKEN_KEY = 'accreditpro-tokens';
  private readonly USER_KEY = 'accreditpro-user';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS[credentials.email];
    if (!mockUser || mockUser.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    const tokens: AuthTokens = {
      accessToken: `mock-jwt-access-${Date.now()}`,
      refreshToken: `mock-jwt-refresh-${Date.now()}`,
    };

    // Persist session
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
    localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser.user));

    return { user: mockUser.user, tokens };
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getStoredSession(): LoginResponse | null {
    const tokensStr = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (tokensStr && userStr) {
      return {
        tokens: JSON.parse(tokensStr),
        user: JSON.parse(userStr),
      };
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}

export const authService = new AuthService();