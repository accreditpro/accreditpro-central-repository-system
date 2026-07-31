import { useSearchParams } from 'react-router-dom';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { InstitutionOverview } from './components/InstitutionOverview';
import { RepositoryHealth } from './components/RepositoryHealth';
import { DomainAnalytics } from './components/DomainAnalytics';
import {
  ApprovalCenter,
  GapAnalysis,
  FrameworkReadiness,
  AIInsights,
  ExecutiveReports,
  ActivityTimeline,
  PrincipalProfile,
} from './components/ExecutiveModules';

type ViewType =
  | 'dashboard'
  | 'institution'
  | 'departments'
  | 'repository-health'
  | 'academic'
  | 'student-success'
  | 'faculty'
  | 'research'
  | 'placement'
  | 'infrastructure'
  | 'financial'
  | 'examination'
  | 'student-dev'
  | 'compliance'
  | 'evidence'
  | 'approvals'
  | 'gaps'
  | 'framework'
  | 'ai-insights'
  | 'reports'
  | 'activity'
  | 'profile';

const viewTitles: Record<ViewType, { title: string; description: string }> = {
  dashboard: {
    title: 'Executive Dashboard',
    description: 'Monitor institutional health, readiness scores, and department performance',
  },
  institution: {
    title: 'Institution Overview',
    description: 'Comprehensive view of institution profile, statistics, and growth trends',
  },
  departments: {
    title: 'Department Performance',
    description: 'Department-wise performance metrics and comparative analysis',
  },
  'repository-health': {
    title: 'Repository Health',
    description: 'Monitor all repositories and evidence readiness across the institution',
  },
  academic: {
    title: 'Academic Performance',
    description: 'Department-wise academic metrics, pass percentages, and five-year trends',
  },
  'student-success': {
    title: 'Student Success',
    description: 'Admissions, progression, placements, achievements, and retention metrics',
  },
  faculty: {
    title: 'Faculty Excellence',
    description: 'Faculty strength, qualifications, research output, and development',
  },
  research: {
    title: 'Research Performance',
    description: 'Projects, publications, patents, grants, and research revenue',
  },
  placement: {
    title: 'Placement Performance',
    description: 'Placement rates, packages, recruiters, and department-wise analysis',
  },
  infrastructure: {
    title: 'Infrastructure Overview',
    description: 'Buildings, laboratories, library, ICT, and facility readiness',
  },
  financial: {
    title: 'Financial Overview',
    description: 'Budget, expenditure, research funding, and department-wise utilization',
  },
  examination: {
    title: 'Examination Analytics',
    description: 'Results, pass percentages, backlogs, and CO attainment status',
  },
  'student-dev': {
    title: 'Student Development',
    description: 'NSS, NCC, Sports, Cultural, Professional Societies, and achievements',
  },
  compliance: {
    title: 'Compliance Status',
    description: 'AICTE, UGC, Autonomous status, approvals, and certificate tracking',
  },
  evidence: {
    title: 'Evidence Readiness',
    description: 'Mandatory/optional documents, missing evidence, and verification status',
  },
  approvals: {
    title: 'Approval Center',
    description: 'Approve Infrastructure, Financial, and Examination repositories',
  },
  gaps: {
    title: 'Gap Analysis',
    description: 'Automatically identified gaps with impact assessment and recommendations',
  },
  framework: {
    title: 'Framework Readiness',
    description: 'NAAC, NBA, and NIRF criterion-wise readiness dashboards',
  },
  'ai-insights': {
    title: 'AI Insights',
    description: 'AI-powered forecasts, risk analysis, and actionable recommendations',
  },
  reports: {
    title: 'Executive Reports',
    description: 'Generate and download institutional reports',
  },
  activity: {
    title: 'Activity Timeline',
    description: 'Track all institutional activities and milestones',
  },
  profile: { title: 'Profile', description: 'Principal profile and permissions' },
};

export default function PrincipalDashboardPage() {
  const [searchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as ViewType) || 'dashboard';

  const viewInfo = viewTitles[activeView] || viewTitles.dashboard;

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'institution':
        return <InstitutionOverview />;
      case 'departments':
        return <InstitutionOverview />;
      case 'repository-health':
        return <RepositoryHealth />;
      case 'academic':
      case 'student-success':
      case 'faculty':
      case 'research':
      case 'placement':
      case 'infrastructure':
      case 'financial':
      case 'examination':
      case 'student-dev':
      case 'compliance':
        return <DomainAnalytics domain={activeView} />;
      case 'evidence':
        return <RepositoryHealth />;
      case 'approvals':
        return <ApprovalCenter />;
      case 'gaps':
        return <GapAnalysis />;
      case 'framework':
        return <FrameworkReadiness />;
      case 'ai-insights':
        return <AIInsights />;
      case 'reports':
        return <ExecutiveReports />;
      case 'activity':
        return <ActivityTimeline />;
      case 'profile':
        return <PrincipalProfile />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{viewInfo.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{viewInfo.description}</p>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
