export interface AnalyticsCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
}

export interface InstitutionGrowthData {
  month: string;
  institutions: number;
  users: number;
}

export interface InstitutionDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface TopInstitutionData {
  name: string;
  state: string;
  users: number;
  documents: number;
  completion: number;
}

export interface RepositoryCompletionData {
  institution: string;
  academic: number;
  faculty: number;
  student: number;
  research: number;
  infrastructure: number;
}

export interface ActivityHeatmapData {
  day: string;
  hour: number;
  value: number;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  user: string;
  institution: string;
  timestamp: string;
  type: 'upload' | 'create' | 'update' | 'delete' | 'login';
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';