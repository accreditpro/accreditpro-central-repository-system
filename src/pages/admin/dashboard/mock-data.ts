// Realistic mock data for Super Admin Dashboard

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  change: number;
  changeLabel: string;
  chartData: { value: number }[];
}

export interface Institution {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  documentsUploaded: number;
  repositoryCompletion: number;
  lastActive: string;
}

export interface Activity {
  id: string;
  type: 'document_upload' | 'user_registration' | 'approval' | 'compliance' | 'repository';
  title: string;
  description: string;
  institution: string;
  timestamp: string;
  user: string;
}

// Mini sparkline data for stat cards
const generateSparkline = (
  base: number,
  variance: number,
  points: number = 7
): { value: number }[] => {
  return Array.from({ length: points }, (_, i) => ({
    value: base + Math.round((Math.random() - 0.3) * variance * (1 + i * 0.1)),
  }));
};

export const statCards: StatCard[] = [
  {
    id: 'total-institutions',
    title: 'Total Institutions',
    value: 248,
    icon: 'Building2',
    change: 12.5,
    changeLabel: 'vs last month',
    chartData: generateSparkline(220, 30),
  },
  {
    id: 'active-institutions',
    title: 'Active Institutions',
    value: 213,
    icon: 'CheckCircle2',
    change: 8.2,
    changeLabel: 'vs last month',
    chartData: generateSparkline(190, 25),
  },
  {
    id: 'total-users',
    title: 'Total Users',
    value: '3,847',
    icon: 'Users',
    change: 15.3,
    changeLabel: 'vs last month',
    chartData: generateSparkline(3200, 400),
  },
  {
    id: 'documents-uploaded',
    title: 'Documents Uploaded',
    value: '45,892',
    icon: 'FileText',
    change: 23.1,
    changeLabel: 'vs last month',
    chartData: generateSparkline(38000, 5000),
  },
  {
    id: 'repository-records',
    title: 'Repository Records',
    value: '128,456',
    icon: 'Database',
    change: 18.7,
    changeLabel: 'vs last month',
    chartData: generateSparkline(110000, 12000),
  },
  {
    id: 'pending-approvals',
    title: 'Pending Approvals',
    value: 34,
    icon: 'Clock',
    change: -5.2,
    changeLabel: 'vs last week',
    chartData: generateSparkline(40, 10),
  },
  {
    id: 'expiring-compliance',
    title: 'Expiring Compliance',
    value: 12,
    icon: 'AlertTriangle',
    change: -8.3,
    changeLabel: 'vs last month',
    chartData: generateSparkline(18, 6),
  },
  {
    id: 'repository-completion',
    title: 'Repository Completion',
    value: '78.4%',
    icon: 'PieChart',
    change: 4.6,
    changeLabel: 'vs last month',
    chartData: generateSparkline(72, 8),
  },
];

// Institution Growth (monthly data for last 12 months)
export const institutionGrowthData = [
  { month: 'Jan', total: 180, active: 156, new: 12 },
  { month: 'Feb', total: 188, active: 162, new: 8 },
  { month: 'Mar', total: 195, active: 170, new: 7 },
  { month: 'Apr', total: 204, active: 178, new: 9 },
  { month: 'May', total: 212, active: 185, new: 8 },
  { month: 'Jun', total: 218, active: 190, new: 6 },
  { month: 'Jul', total: 224, active: 195, new: 6 },
  { month: 'Aug', total: 230, active: 200, new: 6 },
  { month: 'Sep', total: 235, active: 204, new: 5 },
  { month: 'Oct', total: 240, active: 207, new: 5 },
  { month: 'Nov', total: 244, active: 210, new: 4 },
  { month: 'Dec', total: 248, active: 213, new: 4 },
];

// Institution Category Distribution
export const categoryDistributionData = [
  { name: 'Engineering', value: 68, fill: 'hsl(var(--chart-1))' },
  { name: 'Medical', value: 42, fill: 'hsl(var(--chart-2))' },
  { name: 'Arts & Science', value: 56, fill: 'hsl(var(--chart-3))' },
  { name: 'Management', value: 38, fill: 'hsl(var(--chart-4))' },
  { name: 'Law', value: 24, fill: 'hsl(var(--chart-5))' },
  { name: 'Others', value: 20, fill: 'hsl(var(--chart-1))' },
];

// Repository Completion Trend (weekly for last 8 weeks)
export const repositoryCompletionData = [
  { week: 'W1', completion: 62, target: 80 },
  { week: 'W2', completion: 65, target: 80 },
  { week: 'W3', completion: 68, target: 80 },
  { week: 'W4', completion: 70, target: 80 },
  { week: 'W5', completion: 72, target: 80 },
  { week: 'W6', completion: 74, target: 80 },
  { week: 'W7', completion: 76, target: 80 },
  { week: 'W8', completion: 78, target: 80 },
];

// Top Active Institutions
export const topInstitutions: Institution[] = [
  {
    id: '1',
    name: 'National Institute of Technology, Trichy',
    category: 'Engineering',
    status: 'active',
    documentsUploaded: 2847,
    repositoryCompletion: 94,
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'All India Institute of Medical Sciences',
    category: 'Medical',
    status: 'active',
    documentsUploaded: 2156,
    repositoryCompletion: 91,
    lastActive: '4 hours ago',
  },
  {
    id: '3',
    name: 'Indian Institute of Management, Bangalore',
    category: 'Management',
    status: 'active',
    documentsUploaded: 1934,
    repositoryCompletion: 88,
    lastActive: '6 hours ago',
  },
  {
    id: '4',
    name: 'Jawaharlal Nehru University',
    category: 'Arts & Science',
    status: 'active',
    documentsUploaded: 1678,
    repositoryCompletion: 85,
    lastActive: '8 hours ago',
  },
  {
    id: '5',
    name: 'National Law School of India University',
    category: 'Law',
    status: 'active',
    documentsUploaded: 1423,
    repositoryCompletion: 82,
    lastActive: '12 hours ago',
  },
];

// Recent Activities
export const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'document_upload',
    title: 'Bulk Document Upload',
    description: '156 documents uploaded for NAAC Criterion 3',
    institution: 'NIT Trichy',
    timestamp: '10 minutes ago',
    user: 'Dr. Rajesh Kumar',
  },
  {
    id: '2',
    type: 'user_registration',
    title: 'New User Registration',
    description: 'Department Coordinator registered for Computer Science',
    institution: 'AIIMS Delhi',
    timestamp: '25 minutes ago',
    user: 'Prof. Anita Sharma',
  },
  {
    id: '3',
    type: 'approval',
    title: 'Document Approved',
    description: 'Annual Quality Assurance Report approved by IQAC',
    institution: 'IIM Bangalore',
    timestamp: '1 hour ago',
    user: 'Dr. Suresh Patel',
  },
  {
    id: '4',
    type: 'compliance',
    title: 'Compliance Alert',
    description: 'NBA accreditation documents expiring in 30 days',
    institution: 'JNU Delhi',
    timestamp: '2 hours ago',
    user: 'System',
  },
  {
    id: '5',
    type: 'repository',
    title: 'Repository Update',
    description: 'Research publications repository updated with 45 new entries',
    institution: 'NLSIU Bangalore',
    timestamp: '3 hours ago',
    user: 'Dr. Meera Iyer',
  },
  {
    id: '6',
    type: 'approval',
    title: 'Pending Review',
    description: 'Self-Study Report submitted for review',
    institution: 'NIT Trichy',
    timestamp: '4 hours ago',
    user: 'Dr. Vikram Singh',
  },
  {
    id: '7',
    type: 'document_upload',
    title: 'Document Upload',
    description: 'Faculty achievement records uploaded for Criterion 2',
    institution: 'AIIMS Delhi',
    timestamp: '5 hours ago',
    user: 'Prof. Kavita Nair',
  },
];
