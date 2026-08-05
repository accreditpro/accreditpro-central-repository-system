import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DepartmentPerformance } from './components/DepartmentPerformance';
import { RepositoryReadiness } from './components/RepositoryReadiness';
import { AccreditationReadiness } from './components/AccreditationReadiness';
import { GapAnalysis } from './components/GapAnalysis';
import { AcademicPerformance } from './components/AcademicPerformance';
import { FacultyPerformance } from './components/FacultyPerformance';
import { StudentPerformance } from './components/StudentPerformance';
import { ResearchInnovation } from './components/ResearchInnovation';
import { InfrastructureReadiness } from './components/InfrastructureReadiness';
import { ExaminationOverview } from './components/ExaminationOverview';
import { InstitutionAnalytics } from './components/InstitutionAnalytics';
import { AIRecommendations } from './components/AIRecommendations';
import { ExecutiveReports } from './components/ExecutiveReports';

export type ViewType =
  | 'dashboard'
  | 'departments'
  | 'repository-health'
  | 'accreditation'
  | 'gaps'
  | 'academic'
  | 'faculty'
  | 'student'
  | 'research'
  | 'infrastructure'
  | 'examination'
  | 'analytics'
  | 'ai-recommendations'
  | 'reports';

const viewTitles: Record<ViewType, { title: string; description: string }> = {
  dashboard: { title: 'Executive Dashboard', description: 'Monitor institutional health, readiness scores, and department performance' },
  departments: { title: 'Department Performance', description: 'Department-wise repository readiness and comparative analysis' },
  'repository-health': { title: 'Repository Readiness', description: 'Institution → Department → Repository → Evidence drill-down (read-only)' },
  accreditation: { title: 'Accreditation Readiness', description: 'NBA, NAAC and NIRF criterion-wise readiness across departments' },
  gaps: { title: 'Gap Analysis', description: 'Current vs target readiness with remediation actions' },
  academic: { title: 'Academic Performance', description: 'Pass percentages, backlogs, semester results and completion' },
  faculty: { title: 'Faculty Performance', description: 'Faculty strength, qualifications, FDPs and research output' },
  student: { title: 'Student Performance', description: 'Student strength, outcomes, placements and certifications' },
  research: { title: 'Research & Innovation', description: 'Publications, patents, projects and research funding' },
  infrastructure: { title: 'Infrastructure Readiness', description: 'Facilities readiness and compliance alerts' },
  examination: { title: 'Examination Overview', description: 'Schedules, published results and backlog statistics (read-only)' },
  analytics: { title: 'Institution Analytics', description: 'Trend graphs for repository, accreditation, growth and performance' },
  'ai-recommendations': { title: 'AI Recommendations', description: 'Automatically generated executive insights across all domains' },
  reports: { title: 'Reports', description: 'Generate and export institutional reports (PDF / Excel)' },
};

export default function PrincipalDashboardPage() {
  const [searchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as ViewType) || 'dashboard';

  const viewInfo = viewTitles[activeView] || viewTitles.dashboard;

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <ExecutiveDashboard />;
      case 'departments': return <DepartmentPerformance />;
      case 'repository-health': return <RepositoryReadiness />;
      case 'accreditation': return <AccreditationReadiness />;
      case 'gaps': return <GapAnalysis />;
      case 'academic': return <AcademicPerformance />;
      case 'faculty': return <FacultyPerformance />;
      case 'student': return <StudentPerformance />;
      case 'research': return <ResearchInnovation />;
      case 'infrastructure': return <InfrastructureReadiness />;
      case 'examination': return <ExaminationOverview />;
      case 'analytics': return <InstitutionAnalytics />;
      case 'ai-recommendations': return <AIRecommendations />;
      case 'reports': return <ExecutiveReports />;
      default: return <ExecutiveDashboard />;
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
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { PrincipalDashboardPage };
