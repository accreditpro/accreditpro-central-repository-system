export interface RepositoryStatus {
  id: string;
  name: string;
  owner: string;
  completion: number;
  evidence: number;
  verification: number;
  pendingTasks: number;
  status: 'on-track' | 'at-risk' | 'critical' | 'completed';
}

export interface EvidenceItem {
  id: string;
  repository: string;
  section: string;
  uploadedBy: string;
  documentName: string;
  documentCategory: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes-requested';
  fileType: 'pdf' | 'image' | 'doc' | 'excel';
}

export interface ApprovalItem {
  id: string;
  repository: string;
  section: string;
  submittedBy: string;
  submissionDate: string;
  evidenceCount: number;
  validationStatus: 'valid' | 'partial' | 'invalid';
  priority: 'high' | 'medium' | 'low';
}

export interface GapItem {
  id: string;
  category: string;
  description: string;
  repository: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
}

export interface ActivityItem {
  id: string;
  type: 'submitted' | 'uploaded' | 'approved' | 'rejected' | 'commented' | 'returned' | 'verified';
  description: string;
  user: string;
  timestamp: string;
  repository: string;
}

export interface ReadinessData {
  repository: string;
  weight: number;
  dataCompletion: number;
  evidenceCompletion: number;
  verification: number;
  approval: number;
}

export interface AnalyticsData {
  facultyCount: number;
  students: number;
  research: number;
  placements: number;
  passPercentage: number;
  publications: number;
  patents: number;
  projects: number;
}

export interface YearlyTrend {
  year: string;
  academic: number;
  faculty: number;
  student: number;
  research: number;
  alumni: number;
}

export const repositoryOverviewData: RepositoryStatus[] = [
  { id: '1', name: 'Academic Repository', owner: 'Dr. Priya Sharma', completion: 92, evidence: 88, verification: 85, pendingTasks: 4, status: 'on-track' },
  { id: '2', name: 'Faculty Repository', owner: 'Prof. Rajesh Kumar', completion: 88, evidence: 82, verification: 78, pendingTasks: 7, status: 'on-track' },
  { id: '3', name: 'Student Repository', owner: 'Ms. Kavitha Nair', completion: 95, evidence: 91, verification: 89, pendingTasks: 2, status: 'completed' },
  { id: '4', name: 'Research Repository', owner: 'Dr. Amit Patel', completion: 72, evidence: 65, verification: 60, pendingTasks: 12, status: 'at-risk' },
  { id: '5', name: 'Alumni Repository', owner: 'Mr. Vikram Singh', completion: 61, evidence: 55, verification: 48, pendingTasks: 15, status: 'critical' },
];

export const evidenceData: EvidenceItem[] = [
  { id: '1', repository: 'Academic', section: 'Curriculum', uploadedBy: 'Dr. Priya Sharma', documentName: 'Curriculum_Revision_2024.pdf', documentCategory: 'Curriculum Design', uploadDate: '2024-12-15', status: 'pending', fileType: 'pdf' },
  { id: '2', repository: 'Faculty', section: 'Publications', uploadedBy: 'Prof. Rajesh Kumar', documentName: 'Research_Papers_List.xlsx', documentCategory: 'Research Output', uploadDate: '2024-12-14', status: 'pending', fileType: 'excel' },
  { id: '3', repository: 'Student', section: 'Results', uploadedBy: 'Ms. Kavitha Nair', documentName: 'Semester_Results_2024.pdf', documentCategory: 'Academic Performance', uploadDate: '2024-12-13', status: 'approved', fileType: 'pdf' },
  { id: '4', repository: 'Research', section: 'Patents', uploadedBy: 'Dr. Amit Patel', documentName: 'Patent_Filing_Certificate.pdf', documentCategory: 'Intellectual Property', uploadDate: '2024-12-12', status: 'changes-requested', fileType: 'pdf' },
  { id: '5', repository: 'Faculty', section: 'FDP', uploadedBy: 'Prof. Meena Gupta', documentName: 'FDP_Certificates_2024.pdf', documentCategory: 'Faculty Development', uploadDate: '2024-12-11', status: 'pending', fileType: 'pdf' },
  { id: '6', repository: 'Academic', section: 'MOOCs', uploadedBy: 'Dr. Priya Sharma', documentName: 'MOOC_Completion_Report.pdf', documentCategory: 'Online Learning', uploadDate: '2024-12-10', status: 'rejected', fileType: 'pdf' },
  { id: '7', repository: 'Alumni', section: 'Employment', uploadedBy: 'Mr. Vikram Singh', documentName: 'Alumni_Placement_Data.xlsx', documentCategory: 'Career Tracking', uploadDate: '2024-12-09', status: 'pending', fileType: 'excel' },
  { id: '8', repository: 'Research', section: 'Grants', uploadedBy: 'Dr. Amit Patel', documentName: 'Grant_Sanction_Letter.pdf', documentCategory: 'Funding', uploadDate: '2024-12-08', status: 'pending', fileType: 'pdf' },
];

export const approvalQueueData: ApprovalItem[] = [
  { id: '1', repository: 'Academic', section: 'Value Added Courses', submittedBy: 'Dr. Priya Sharma', submissionDate: '2024-12-15', evidenceCount: 5, validationStatus: 'valid', priority: 'high' },
  { id: '2', repository: 'Faculty', section: 'Research Publications', submittedBy: 'Prof. Rajesh Kumar', submissionDate: '2024-12-14', evidenceCount: 8, validationStatus: 'valid', priority: 'high' },
  { id: '3', repository: 'Research', section: 'Sponsored Projects', submittedBy: 'Dr. Amit Patel', submissionDate: '2024-12-13', evidenceCount: 3, validationStatus: 'partial', priority: 'medium' },
  { id: '4', repository: 'Student', section: 'Achievements', submittedBy: 'Ms. Kavitha Nair', submissionDate: '2024-12-12', evidenceCount: 6, validationStatus: 'valid', priority: 'medium' },
  { id: '5', repository: 'Alumni', section: 'Alumni Engagement', submittedBy: 'Mr. Vikram Singh', submissionDate: '2024-12-11', evidenceCount: 2, validationStatus: 'invalid', priority: 'low' },
  { id: '6', repository: 'Faculty', section: 'Faculty Awards', submittedBy: 'Prof. Meena Gupta', submissionDate: '2024-12-10', evidenceCount: 4, validationStatus: 'valid', priority: 'high' },
];

export const gapAnalysisData: GapItem[] = [
  { id: '1', category: 'Faculty Publications', description: '15 faculty members have no publications in last 2 years', repository: 'Research', severity: 'critical', impact: 'Affects NAAC Criterion 3.4', recommendation: 'Encourage faculty to publish in indexed journals' },
  { id: '2', category: 'Research Evidence', description: 'Grant sanction letters missing for 3 funded projects', repository: 'Research', severity: 'high', impact: 'Incomplete evidence for research funding', recommendation: 'Request PIs to upload sanction letters' },
  { id: '3', category: 'Student Results', description: 'Semester 6 results for 2023-24 batch not uploaded', repository: 'Student', severity: 'high', impact: 'Affects pass percentage calculation', recommendation: 'Coordinate with Exam section for results' },
  { id: '4', category: 'Placement Data', description: 'Placement records incomplete for 2022-23 batch', repository: 'Alumni', severity: 'medium', impact: 'Affects placement statistics', recommendation: 'Verify with TPO office for complete data' },
  { id: '5', category: 'Curriculum Revision', description: 'BoS minutes for 2024 curriculum revision not uploaded', repository: 'Academic', severity: 'medium', impact: 'Missing approval evidence', recommendation: 'Upload BoS meeting minutes and approval letters' },
  { id: '6', category: 'Alumni Data', description: 'Alumni tracking data missing for 2019-20 batch', repository: 'Alumni', severity: 'low', impact: 'Incomplete alumni database', recommendation: 'Conduct alumni survey for missing batch' },
  { id: '7', category: 'Supporting Documents', description: '8 documents have expired validity', repository: 'Academic', severity: 'medium', impact: 'Invalid evidence in repository', recommendation: 'Renew expired documents and re-upload' },
  { id: '8', category: 'Incomplete Repository', description: 'MOOCs section has only 40% data completion', repository: 'Academic', severity: 'high', impact: 'Affects online learning metrics', recommendation: 'Collect MOOC certificates from faculty and students' },
];

export const readinessData: ReadinessData[] = [
  { repository: 'Academic', weight: 20, dataCompletion: 92, evidenceCompletion: 88, verification: 85, approval: 80 },
  { repository: 'Faculty', weight: 20, dataCompletion: 88, evidenceCompletion: 82, verification: 78, approval: 75 },
  { repository: 'Student', weight: 20, dataCompletion: 95, evidenceCompletion: 91, verification: 89, approval: 87 },
  { repository: 'Research', weight: 15, dataCompletion: 72, evidenceCompletion: 65, verification: 60, approval: 55 },
  { repository: 'Alumni', weight: 5, dataCompletion: 61, evidenceCompletion: 55, verification: 48, approval: 42 },
  { repository: 'Evidence', weight: 10, dataCompletion: 82, evidenceCompletion: 78, verification: 74, approval: 70 },
  { repository: 'Verification', weight: 10, dataCompletion: 78, evidenceCompletion: 74, verification: 70, approval: 66 },
];

export const analyticsData: AnalyticsData = {
  facultyCount: 45,
  students: 720,
  research: 38,
  placements: 85,
  passPercentage: 92.5,
  publications: 127,
  patents: 8,
  projects: 15,
};

export const yearlyTrends: YearlyTrend[] = [
  { year: '2020-21', academic: 65, faculty: 60, student: 70, research: 45, alumni: 30 },
  { year: '2021-22', academic: 72, faculty: 68, student: 78, research: 52, alumni: 38 },
  { year: '2022-23', academic: 80, faculty: 75, student: 85, research: 60, alumni: 45 },
  { year: '2023-24', academic: 87, faculty: 83, student: 90, research: 68, alumni: 55 },
  { year: '2024-25', academic: 92, faculty: 88, student: 95, research: 72, alumni: 61 },
];

export const activityTimelineData: ActivityItem[] = [
  { id: '1', type: 'submitted', description: 'Value Added Courses data submitted for review', user: 'Dr. Priya Sharma', timestamp: '2024-12-15T10:30:00Z', repository: 'Academic' },
  { id: '2', type: 'approved', description: 'Student Results 2024 approved and forwarded to IQAC', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-15T09:15:00Z', repository: 'Student' },
  { id: '3', type: 'uploaded', description: 'Research grant sanction letter uploaded', user: 'Dr. Amit Patel', timestamp: '2024-12-14T16:45:00Z', repository: 'Research' },
  { id: '4', type: 'rejected', description: 'MOOC completion report rejected - incomplete data', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-14T14:20:00Z', repository: 'Academic' },
  { id: '5', type: 'commented', description: 'Review comment added on faculty FDP certificates', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-14T11:00:00Z', repository: 'Faculty' },
  { id: '6', type: 'returned', description: 'Alumni engagement data returned by IQAC for corrections', user: 'IQAC Office', timestamp: '2024-12-13T15:30:00Z', repository: 'Alumni' },
  { id: '7', type: 'verified', description: 'Faculty publications data verified', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-13T10:00:00Z', repository: 'Faculty' },
  { id: '8', type: 'submitted', description: 'Patent filing certificates submitted', user: 'Dr. Amit Patel', timestamp: '2024-12-12T14:00:00Z', repository: 'Research' },
  { id: '9', type: 'approved', description: 'Curriculum revision documents approved', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-12T09:30:00Z', repository: 'Academic' },
  { id: '10', type: 'uploaded', description: 'Placement data for 2024 batch uploaded', user: 'Mr. Vikram Singh', timestamp: '2024-12-11T16:00:00Z', repository: 'Alumni' },
];

export const aiInsights = [
  { id: '1', title: 'Missing Evidence Alert', description: 'Research Repository has 12 records without supporting evidence. This may affect NAAC Criterion 3 score.', type: 'warning' as const },
  { id: '2', title: 'Completion Prediction', description: 'At current pace, full repository completion expected by March 2025. Accelerate Research & Alumni sections.', type: 'info' as const },
  { id: '3', title: 'Faculty Publication Gap', description: '33% of faculty have zero publications in indexed journals. Target: minimum 1 publication per faculty per year.', type: 'critical' as const },
  { id: '4', title: 'Department Benchmark', description: 'Your department ranks 3rd out of 8 departments in overall repository readiness. Top department: Electronics at 94%.', type: 'success' as const },
  { id: '5', title: 'Readiness Forecast', description: 'Based on current trends, department readiness will reach 90% by February 2025 if current submission rate continues.', type: 'info' as const },
];

export const reportTypes = [
  { id: '1', name: 'Department Repository Report', description: 'Complete overview of all repository data with completion metrics', icon: 'FileText' },
  { id: '2', name: 'Evidence Report', description: 'Status of all uploaded evidence documents with approval status', icon: 'FileCheck' },
  { id: '3', name: 'Pending Tasks Report', description: 'All pending reviews, approvals, and corrections needed', icon: 'Clock' },
  { id: '4', name: 'Gap Analysis Report', description: 'Identified gaps in repository data with recommendations', icon: 'AlertTriangle' },
  { id: '5', name: 'Repository Health Report', description: 'Overall health metrics including data quality and completeness', icon: 'Activity' },
  { id: '6', name: 'Five Year Summary', description: 'Comprehensive five-year trend analysis for all repositories', icon: 'TrendingUp' },
];