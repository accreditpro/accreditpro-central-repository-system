import {
  AnalyticsCard,
  InstitutionGrowthData,
  InstitutionDistributionData,
  TopInstitutionData,
  RepositoryCompletionData,
  ActivityHeatmapData,
  RecentActivityItem,
} from './types';

export const analyticsCards: AnalyticsCard[] = [
  {
    title: 'Total Institutions',
    value: 248,
    change: 12.5,
    changeLabel: 'vs last month',
    icon: 'Building2',
  },
  {
    title: 'Total Users',
    value: '3,847',
    change: 8.2,
    changeLabel: 'vs last month',
    icon: 'Users',
  },
  {
    title: 'Documents Uploaded',
    value: '45,231',
    change: 23.1,
    changeLabel: 'vs last month',
    icon: 'FileText',
  },
  {
    title: 'Repository Records',
    value: '128,450',
    change: 15.7,
    changeLabel: 'vs last month',
    icon: 'Database',
  },
  {
    title: 'Repository Completion',
    value: '72.4%',
    change: 5.3,
    changeLabel: 'vs last month',
    icon: 'CheckCircle2',
  },
];

export const institutionGrowthData: InstitutionGrowthData[] = [
  { month: 'Jan', institutions: 180, users: 2100 },
  { month: 'Feb', institutions: 192, users: 2350 },
  { month: 'Mar', institutions: 205, users: 2580 },
  { month: 'Apr', institutions: 215, users: 2820 },
  { month: 'May', institutions: 228, users: 3100 },
  { month: 'Jun', institutions: 235, users: 3350 },
  { month: 'Jul', institutions: 240, users: 3520 },
  { month: 'Aug', institutions: 242, users: 3640 },
  { month: 'Sep', institutions: 244, users: 3720 },
  { month: 'Oct', institutions: 245, users: 3780 },
  { month: 'Nov', institutions: 247, users: 3820 },
  { month: 'Dec', institutions: 248, users: 3847 },
];

export const institutionDistributionData: InstitutionDistributionData[] = [
  { name: 'Engineering', value: 78, color: '#6366f1' },
  { name: 'Arts & Science', value: 62, color: '#8b5cf6' },
  { name: 'Medical', value: 35, color: '#ec4899' },
  { name: 'Law', value: 22, color: '#f59e0b' },
  { name: 'Management', value: 28, color: '#10b981' },
  { name: 'Education', value: 23, color: '#06b6d4' },
];

export const topInstitutionsData: TopInstitutionData[] = [
  { name: 'IIT Madras', state: 'Tamil Nadu', users: 156, documents: 2340, completion: 94 },
  { name: 'BITS Pilani', state: 'Rajasthan', users: 134, documents: 1980, completion: 91 },
  { name: 'NIT Trichy', state: 'Tamil Nadu', users: 128, documents: 1850, completion: 88 },
  { name: 'VIT Vellore', state: 'Tamil Nadu', users: 112, documents: 1720, completion: 85 },
  { name: 'SRM Chennai', state: 'Tamil Nadu', users: 98, documents: 1540, completion: 82 },
  { name: 'Manipal University', state: 'Karnataka', users: 95, documents: 1480, completion: 80 },
  { name: 'Amrita University', state: 'Kerala', users: 89, documents: 1350, completion: 78 },
  { name: 'PSG Tech', state: 'Tamil Nadu', users: 82, documents: 1200, completion: 76 },
];

export const repositoryCompletionData: RepositoryCompletionData[] = [
  { institution: 'IIT Madras', academic: 98, faculty: 95, student: 92, research: 90, infrastructure: 88 },
  { institution: 'BITS Pilani', academic: 94, faculty: 90, student: 88, research: 86, infrastructure: 84 },
  { institution: 'NIT Trichy', academic: 92, faculty: 88, student: 85, research: 82, infrastructure: 80 },
  { institution: 'VIT Vellore', academic: 88, faculty: 85, student: 82, research: 80, infrastructure: 78 },
  { institution: 'SRM Chennai', academic: 85, faculty: 82, student: 80, research: 78, infrastructure: 75 },
  { institution: 'Manipal Univ', academic: 82, faculty: 80, student: 78, research: 75, infrastructure: 72 },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const activityHeatmapData: ActivityHeatmapData[] = days.flatMap((day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day,
    hour,
    value: Math.floor(Math.random() * 100),
  }))
);

export const recentActivityData: RecentActivityItem[] = [
  { id: '1', action: 'Uploaded NAAC SSR Document', user: 'Dr. Ramesh Kumar', institution: 'IIT Madras', timestamp: '2 minutes ago', type: 'upload' },
  { id: '2', action: 'Created new department', user: 'Prof. Anita Sharma', institution: 'BITS Pilani', timestamp: '5 minutes ago', type: 'create' },
  { id: '3', action: 'Updated faculty records', user: 'Dr. Suresh Patel', institution: 'NIT Trichy', timestamp: '12 minutes ago', type: 'update' },
  { id: '4', action: 'Uploaded placement data', user: 'Mr. Vikram Singh', institution: 'VIT Vellore', timestamp: '18 minutes ago', type: 'upload' },
  { id: '5', action: 'Logged in to platform', user: 'Dr. Priya Nair', institution: 'Amrita University', timestamp: '25 minutes ago', type: 'login' },
  { id: '6', action: 'Deleted draft document', user: 'Prof. Arun Mehta', institution: 'SRM Chennai', timestamp: '32 minutes ago', type: 'delete' },
  { id: '7', action: 'Updated research publications', user: 'Dr. Kavitha Rajan', institution: 'PSG Tech', timestamp: '45 minutes ago', type: 'update' },
  { id: '8', action: 'Created student batch', user: 'Mr. Deepak Joshi', institution: 'Manipal University', timestamp: '1 hour ago', type: 'create' },
  { id: '9', action: 'Uploaded infrastructure report', user: 'Dr. Lakshmi Iyer', institution: 'IIT Madras', timestamp: '1.5 hours ago', type: 'upload' },
  { id: '10', action: 'Updated compliance records', user: 'Prof. Mohan Das', institution: 'BITS Pilani', timestamp: '2 hours ago', type: 'update' },
];