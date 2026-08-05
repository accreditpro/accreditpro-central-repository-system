// Principal Module Configuration & Mock Data

export interface DepartmentScore {
  id: string;
  name: string;
  code: string;
  repository: number;
  evidence: number;
  verification: number;
  readiness: number;
  health: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface RepositoryStatus {
  id: string;
  name: string;
  completion: number;
  evidence: number;
  pendingReviews: number;
  pendingVerification: number;
  qualityScore: number;
  lastUpdated: string;
}

export interface ApprovalItem {
  id: string;
  repository: string;
  submittedBy: string;
  submittedDate: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-review';
  description: string;
}

export interface GapItem {
  id: string;
  category: string;
  description: string;
  currentStatus: string;
  target: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  priority: number;
  recommendedOwner: string;
  timeline: string;
  department?: string;
}

export interface FrameworkCriterion {
  id: string;
  name: string;
  weightage: number;
  completion: number;
  evidence: number;
  status: 'ready' | 'in-progress' | 'not-started';
}

export interface AIInsight {
  id: string;
  type: 'forecast' | 'risk' | 'recommendation' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface ActivityEvent {
  id: string;
  type: 'submitted' | 'approved' | 'uploaded' | 'verified' | 'gap-closed' | 'framework-updated' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  department?: string;
}

// KPI Data
export const kpiData = {
  institutionReadiness: 78,
  naacReadiness: 82,
  nbaReadiness: 75,
  nirfReadiness: 71,
  repositoryCompletion: 84,
  evidenceCompletion: 76,
  verificationStatus: 69,
  pendingApprovals: 14,
  departmentsAtRisk: 2,
  overallHealthScore: 81,
  performanceIndex: 77,
  dataQualityScore: 88,
};

// Department Performance Data
export const departmentScores: DepartmentScore[] = [
  { id: '1', name: 'Computer Science & Engineering', code: 'CSE', repository: 95, evidence: 91, verification: 90, readiness: 92, health: 'excellent' },
  { id: '2', name: 'Electronics & Communication', code: 'ECE', repository: 84, evidence: 79, verification: 76, readiness: 80, health: 'good' },
  { id: '3', name: 'Electrical & Electronics', code: 'EEE', repository: 69, evidence: 58, verification: 61, readiness: 63, health: 'critical' },
  { id: '4', name: 'Mechanical Engineering', code: 'MECH', repository: 88, evidence: 85, verification: 82, readiness: 85, health: 'good' },
  { id: '5', name: 'Civil Engineering', code: 'CIVIL', repository: 72, evidence: 65, verification: 68, readiness: 68, health: 'warning' },
  { id: '6', name: 'Information Technology', code: 'IT', repository: 91, evidence: 88, verification: 86, readiness: 88, health: 'excellent' },
  { id: '7', name: 'Artificial Intelligence & ML', code: 'AIML', repository: 79, evidence: 74, verification: 71, readiness: 75, health: 'good' },
  { id: '8', name: 'Data Science', code: 'DS', repository: 76, evidence: 70, verification: 67, readiness: 71, health: 'warning' },
];

// Repository Health Data
export const repositoryStatuses: RepositoryStatus[] = [
  { id: '1', name: 'Academic Repository', completion: 87, evidence: 82, pendingReviews: 3, pendingVerification: 5, qualityScore: 91, lastUpdated: '2 hours ago' },
  { id: '2', name: 'Faculty Repository', completion: 83, evidence: 78, pendingReviews: 4, pendingVerification: 6, qualityScore: 85, lastUpdated: '4 hours ago' },
  { id: '3', name: 'Student Repository', completion: 91, evidence: 88, pendingReviews: 1, pendingVerification: 2, qualityScore: 93, lastUpdated: '1 hour ago' },
  { id: '4', name: 'Research Repository', completion: 76, evidence: 71, pendingReviews: 5, pendingVerification: 8, qualityScore: 79, lastUpdated: '6 hours ago' },
  { id: '5', name: 'Alumni Repository', completion: 68, evidence: 62, pendingReviews: 3, pendingVerification: 4, qualityScore: 72, lastUpdated: '1 day ago' },
  { id: '6', name: 'Infrastructure Repository', completion: 89, evidence: 85, pendingReviews: 2, pendingVerification: 3, qualityScore: 90, lastUpdated: '3 hours ago' },
  { id: '7', name: 'Examination Repository', completion: 94, evidence: 91, pendingReviews: 1, pendingVerification: 1, qualityScore: 95, lastUpdated: '30 min ago' },
  { id: '8', name: 'Financial Repository', completion: 85, evidence: 80, pendingReviews: 2, pendingVerification: 4, qualityScore: 87, lastUpdated: '5 hours ago' },
  { id: '9', name: 'Placement Repository', completion: 80, evidence: 75, pendingReviews: 3, pendingVerification: 5, qualityScore: 82, lastUpdated: '8 hours ago' },
  { id: '10', name: 'Compliance Repository', completion: 92, evidence: 89, pendingReviews: 1, pendingVerification: 2, qualityScore: 94, lastUpdated: '2 hours ago' },
  { id: '11', name: 'Student Development Repository', completion: 74, evidence: 69, pendingReviews: 4, pendingVerification: 6, qualityScore: 76, lastUpdated: '12 hours ago' },
];

// Approval Queue
export const approvalItems: ApprovalItem[] = [
  { id: '1', repository: 'Infrastructure Repository', submittedBy: 'Rajesh Kumar', submittedDate: '2024-03-15', type: 'Annual Submission', priority: 'high', status: 'pending', description: 'Complete infrastructure data for AY 2023-24' },
  { id: '2', repository: 'Financial Repository', submittedBy: 'Priya Sharma', submittedDate: '2024-03-14', type: 'Quarterly Update', priority: 'high', status: 'pending', description: 'Q3 financial statements and budget utilization' },
  { id: '3', repository: 'Examination Repository', submittedBy: 'Dr. Ramesh Iyer', submittedDate: '2024-03-13', type: 'Semester Results', priority: 'medium', status: 'in-review', description: 'Even semester 2023-24 examination results' },
  { id: '4', repository: 'Infrastructure Repository', submittedBy: 'Rajesh Kumar', submittedDate: '2024-03-12', type: 'Evidence Upload', priority: 'medium', status: 'pending', description: 'Laboratory equipment purchase documents' },
  { id: '5', repository: 'Financial Repository', submittedBy: 'Priya Sharma', submittedDate: '2024-03-11', type: 'Audit Report', priority: 'low', status: 'pending', description: 'Internal audit report for FY 2023-24' },
];

// Gap Analysis
export const gapItems: GapItem[] = [
  { id: '1', category: 'Low Readiness', description: 'EEE Department repository completion below 70%', currentStatus: '63%', target: '85%', impact: 'critical', priority: 1, recommendedOwner: 'HOD - EEE', timeline: '30 days', department: 'EEE' },
  { id: '2', category: 'Missing Evidence', description: '24 mandatory documents missing across repositories', currentStatus: '76% uploaded', target: '100%', impact: 'high', priority: 2, recommendedOwner: 'All Coordinators', timeline: '45 days' },
  { id: '3', category: 'Weak Research', description: 'Research publications below NAAC benchmark', currentStatus: '2.1 per faculty', target: '3.5 per faculty', impact: 'high', priority: 3, recommendedOwner: 'Research Committee', timeline: '6 months', department: 'Institution-wide' },
  { id: '4', category: 'Low Placement', description: 'Civil Engineering placement rate below 60%', currentStatus: '54%', target: '75%', impact: 'high', priority: 4, recommendedOwner: 'TPO + HOD Civil', timeline: '3 months', department: 'CIVIL' },
  { id: '5', category: 'Pending Approvals', description: '14 submissions awaiting Principal approval', currentStatus: '14 pending', target: '0 pending', impact: 'medium', priority: 5, recommendedOwner: 'Principal', timeline: '7 days' },
  { id: '6', category: 'Faculty Development', description: 'Only 45% faculty attended FDPs this year', currentStatus: '45%', target: '80%', impact: 'medium', priority: 6, recommendedOwner: 'IQAC', timeline: '4 months' },
  { id: '7', category: 'High Backlogs', description: 'Data Science department has 18% backlog rate', currentStatus: '18%', target: '<5%', impact: 'medium', priority: 7, recommendedOwner: 'HOD - DS', timeline: '2 months', department: 'DS' },
  { id: '8', category: 'Compliance Risk', description: 'AICTE approval renewal due in 45 days', currentStatus: 'Pending', target: 'Renewed', impact: 'critical', priority: 8, recommendedOwner: 'Institution Admin', timeline: '45 days' },
  { id: '9', category: 'Student Participation', description: 'Low participation in extension activities', currentStatus: '32%', target: '60%', impact: 'low', priority: 9, recommendedOwner: 'Student Dev. Coordinator', timeline: '3 months' },
  { id: '10', category: 'Document Expiry', description: '8 compliance certificates expiring within 60 days', currentStatus: '8 expiring', target: '0 expiring', impact: 'high', priority: 10, recommendedOwner: 'Institution Admin', timeline: '60 days' },
  { id: '11', category: 'Data Quality', description: 'Inconsistent data entries in Faculty Repository', currentStatus: '12 issues', target: '0 issues', impact: 'medium', priority: 11, recommendedOwner: 'Dept. Coordinators', timeline: '14 days' },
  { id: '12', category: 'Low Readiness', description: 'Data Science department readiness below target', currentStatus: '71%', target: '85%', impact: 'medium', priority: 12, recommendedOwner: 'HOD - DS', timeline: '45 days', department: 'DS' },
];

// Framework Readiness - NAAC
export const naacCriteria: FrameworkCriterion[] = [
  { id: '1', name: 'Curricular Aspects', weightage: 150, completion: 88, evidence: 85, status: 'in-progress' },
  { id: '2', name: 'Teaching-Learning & Evaluation', weightage: 200, completion: 82, evidence: 78, status: 'in-progress' },
  { id: '3', name: 'Research, Innovations & Extension', weightage: 250, completion: 71, evidence: 65, status: 'in-progress' },
  { id: '4', name: 'Infrastructure & Learning Resources', weightage: 100, completion: 91, evidence: 88, status: 'ready' },
  { id: '5', name: 'Student Support & Progression', weightage: 100, completion: 85, evidence: 80, status: 'in-progress' },
  { id: '6', name: 'Governance, Leadership & Management', weightage: 100, completion: 79, evidence: 74, status: 'in-progress' },
  { id: '7', name: 'Institutional Values & Best Practices', weightage: 100, completion: 76, evidence: 71, status: 'in-progress' },
];

// Framework Readiness - NBA
export const nbaCriteria: FrameworkCriterion[] = [
  { id: '1', name: 'Vision, Mission & PEOs', weightage: 60, completion: 92, evidence: 90, status: 'ready' },
  { id: '2', name: 'Program Curriculum', weightage: 80, completion: 85, evidence: 80, status: 'in-progress' },
  { id: '3', name: 'Course Outcomes & POs', weightage: 120, completion: 78, evidence: 72, status: 'in-progress' },
  { id: '4', name: 'Students Performance', weightage: 120, completion: 81, evidence: 76, status: 'in-progress' },
  { id: '5', name: 'Faculty Contributions', weightage: 100, completion: 74, evidence: 69, status: 'in-progress' },
  { id: '6', name: 'Facilities & Technical Support', weightage: 80, completion: 88, evidence: 85, status: 'in-progress' },
  { id: '7', name: 'Academic Support & Governance', weightage: 40, completion: 70, evidence: 65, status: 'in-progress' },
];

// Framework Readiness - NIRF
export const nirfParameters = [
  { id: '1', name: 'Teaching, Learning and Resources (TLR)', weightage: 30, score: 74, status: 'in-progress' as const },
  { id: '2', name: 'Research and Professional Practice (RP)', weightage: 30, score: 68, status: 'in-progress' as const },
  { id: '3', name: 'Graduation Outcomes (GO)', weightage: 20, score: 76, status: 'in-progress' as const },
  { id: '4', name: 'Outreach and Inclusivity (OI)', weightage: 10, score: 71, status: 'in-progress' as const },
  { id: '5', name: 'Perception (PR)', weightage: 10, score: 65, status: 'in-progress' as const },
];

// AI Insights
export const aiInsights: AIInsight[] = [
  { id: '1', type: 'forecast', title: 'Institution Readiness Forecast', description: 'Based on current trajectory, institution readiness will reach 85% by end of semester. Accelerating EEE and Civil departments can push this to 89%.', confidence: 87, impact: 'high', actionable: true },
  { id: '2', type: 'risk', title: 'AICTE Compliance Risk', description: 'AICTE approval renewal deadline approaching in 45 days. 3 mandatory documents still pending upload.', confidence: 95, impact: 'high', actionable: true },
  { id: '3', type: 'recommendation', title: 'Research Output Improvement', description: 'Incentivizing faculty publications in Q1-indexed journals could improve NAAC Criterion 3 score by 12 points.', confidence: 78, impact: 'high', actionable: true },
  { id: '4', type: 'risk', title: 'Top 10 Institutional Risks', description: '1. EEE readiness gap 2. AICTE renewal 3. Research output 4. Civil placements 5. Faculty FDPs 6. DS backlogs 7. Evidence gaps 8. Document expiry 9. Student participation 10. Data quality', confidence: 91, impact: 'high', actionable: true },
  { id: '5', type: 'recommendation', title: 'Department Ranking', description: 'CSE leads with 92% readiness, followed by IT (88%), MECH (85%). Focus resources on EEE (63%) and CIVIL (68%) for maximum institutional impact.', confidence: 94, impact: 'medium', actionable: true },
  { id: '6', type: 'opportunity', title: 'Placement Improvement', description: 'Partnering with 5 additional tier-1 companies could improve overall placement rate by 8%. Focus on Civil and DS departments.', confidence: 72, impact: 'medium', actionable: true },
  { id: '7', type: 'forecast', title: 'Accreditation Readiness Prediction', description: 'At current pace, NAAC Grade A readiness achievable by March 2025. NBA accreditation for CSE and ECE programs on track.', confidence: 83, impact: 'high', actionable: false },
  { id: '8', type: 'recommendation', title: 'Faculty Development Suggestions', description: 'Schedule 3 FDP programs in emerging technologies. Target: 80% faculty participation. Current gap: 35% faculty yet to attend.', confidence: 88, impact: 'medium', actionable: true },
  { id: '9', type: 'opportunity', title: 'Research Growth Opportunities', description: 'Collaboration with 3 industry partners for sponsored research could generate ₹2.5 Cr additional research funding.', confidence: 69, impact: 'high', actionable: true },
  { id: '10', type: 'forecast', title: 'Student Performance Predictions', description: 'Based on internal assessment trends, overall pass percentage expected to improve by 3.2% this semester.', confidence: 76, impact: 'medium', actionable: false },
  { id: '11', type: 'recommendation', title: 'Executive Summary Generator', description: 'Auto-generated summary: Institution is performing well overall (81% health). 2 departments need immediate attention. 14 approvals pending. NAAC readiness at 82%.', confidence: 96, impact: 'low', actionable: false },
];

// Activity Timeline
export const activityEvents: ActivityEvent[] = [
  { id: '1', type: 'submitted', title: 'Infrastructure Repository Submitted', description: 'Complete infrastructure data for AY 2023-24 submitted for approval', timestamp: '2024-03-15T10:30:00Z', actor: 'Rajesh Kumar', department: 'Infrastructure' },
  { id: '2', type: 'approved', title: 'CSE Department Repository Approved', description: 'All 5 repositories approved and forwarded to IQAC', timestamp: '2024-03-15T09:15:00Z', actor: 'Dr. Suresh Patil', department: 'CSE' },
  { id: '3', type: 'uploaded', title: 'Financial Evidence Uploaded', description: 'Q3 audit reports and budget statements uploaded', timestamp: '2024-03-14T16:45:00Z', actor: 'Priya Sharma', department: 'Finance' },
  { id: '4', type: 'verified', title: 'Examination Results Verified', description: 'Even semester results verified by Controller of Examinations', timestamp: '2024-03-14T14:20:00Z', actor: 'Dr. Ramesh Iyer', department: 'Examinations' },
  { id: '5', type: 'gap-closed', title: 'Faculty FDP Gap Addressed', description: 'IT Department completed mandatory FDP requirement', timestamp: '2024-03-14T11:00:00Z', actor: 'System', department: 'IT' },
  { id: '6', type: 'framework-updated', title: 'NAAC Criterion 4 Updated', description: 'Infrastructure data mapped to NAAC Criterion 4 metrics', timestamp: '2024-03-13T15:30:00Z', actor: 'IQAC System' },
  { id: '7', type: 'milestone', title: 'Institution Milestone: 80% Readiness', description: 'Overall institution readiness crossed 80% threshold', timestamp: '2024-03-13T10:00:00Z', actor: 'System' },
  { id: '8', type: 'submitted', title: 'MECH Department Submission', description: 'Faculty and Research repositories submitted for HOD review', timestamp: '2024-03-12T17:00:00Z', actor: 'Dept. Coordinator', department: 'MECH' },
  { id: '9', type: 'approved', title: 'Financial Repository Approved', description: 'Q2 financial data approved and forwarded to IQAC', timestamp: '2024-03-12T14:30:00Z', actor: 'Dr. James Wilson', department: 'Finance' },
  { id: '10', type: 'uploaded', title: 'Placement Data Updated', description: 'Latest placement statistics for 2023-24 batch uploaded', timestamp: '2024-03-11T16:00:00Z', actor: 'Vikram Mehta', department: 'Placements' },
];

// Institution Overview Stats
export const institutionStats = {
  programs: 24,
  departments: 8,
  students: 4850,
  faculty: 312,
  researchPublications: 456,
  patents: 18,
  placementRate: 82,
  averagePackage: '6.8 LPA',
  highestPackage: '42 LPA',
  recruiters: 145,
  infrastructure: { buildings: 12, labs: 68, library: '1.2L books', ict: '98% coverage' },
  budget: '₹125 Cr',
  expenditure: '₹108 Cr',
};

// Five Year Trends
export const fiveYearTrends = {
  years: ['2019-20', '2020-21', '2021-22', '2022-23', '2023-24'],
  students: [3200, 3600, 4100, 4500, 4850],
  faculty: [245, 260, 278, 295, 312],
  publications: [180, 220, 310, 380, 456],
  placements: [72, 74, 78, 80, 82],
  passPercentage: [82, 84, 85, 87, 89],
  revenue: [85, 92, 98, 112, 125],
};

// Academic Performance
export const academicPerformance = {
  departments: [
    { name: 'CSE', passPercentage: 94, avgSGPA: 8.2, avgCGPA: 8.0, backlogs: 3, graduationRate: 97, distinctions: 45, goldMedals: 3, universityRanks: 5 },
    { name: 'ECE', passPercentage: 89, avgSGPA: 7.8, avgCGPA: 7.6, backlogs: 8, graduationRate: 94, distinctions: 28, goldMedals: 2, universityRanks: 3 },
    { name: 'EEE', passPercentage: 82, avgSGPA: 7.2, avgCGPA: 7.0, backlogs: 15, graduationRate: 88, distinctions: 18, goldMedals: 1, universityRanks: 1 },
    { name: 'MECH', passPercentage: 87, avgSGPA: 7.5, avgCGPA: 7.3, backlogs: 10, graduationRate: 92, distinctions: 22, goldMedals: 1, universityRanks: 2 },
    { name: 'CIVIL', passPercentage: 84, avgSGPA: 7.3, avgCGPA: 7.1, backlogs: 12, graduationRate: 90, distinctions: 15, goldMedals: 1, universityRanks: 1 },
    { name: 'IT', passPercentage: 92, avgSGPA: 8.0, avgCGPA: 7.8, backlogs: 5, graduationRate: 96, distinctions: 38, goldMedals: 2, universityRanks: 4 },
    { name: 'AIML', passPercentage: 88, avgSGPA: 7.7, avgCGPA: 7.5, backlogs: 9, graduationRate: 93, distinctions: 25, goldMedals: 1, universityRanks: 2 },
    { name: 'DS', passPercentage: 81, avgSGPA: 7.1, avgCGPA: 6.9, backlogs: 18, graduationRate: 87, distinctions: 12, goldMedals: 0, universityRanks: 1 },
  ],
};

// Report Types
export const reportTypes = [
  { id: '1', name: 'Institution Health Report', description: 'Comprehensive overview of institutional health metrics', icon: 'building' },
  { id: '2', name: 'Department Performance Report', description: 'Detailed department-wise performance analysis', icon: 'bar-chart' },
  { id: '3', name: 'Repository Summary', description: 'Status of all repositories across departments', icon: 'database' },
  { id: '4', name: 'Framework Readiness Report', description: 'NAAC/NBA/NIRF readiness assessment', icon: 'target' },
  { id: '5', name: 'Gap Analysis Report', description: 'Identified gaps with recommendations', icon: 'alert-triangle' },
  { id: '6', name: 'Five Year Institutional Report', description: 'Historical trends and growth analysis', icon: 'trending-up' },
  { id: '7', name: 'Monthly Executive Report', description: 'Monthly progress and key highlights', icon: 'calendar' },
  { id: '8', name: 'Annual Quality Report', description: 'AQAR-ready annual quality assessment', icon: 'award' },
];