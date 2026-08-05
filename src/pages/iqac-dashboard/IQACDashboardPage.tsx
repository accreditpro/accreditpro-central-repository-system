import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSelectedAcademicYear } from '@/store/slices/uiSlice';
import { Dashboard } from './components/Dashboard';
import { InstitutionReadiness } from './components/InstitutionReadiness';
import { DepartmentReadiness } from './components/DepartmentReadiness';
import { RepositoryMonitoring } from './components/RepositoryMonitoring';
import { AccreditationReadiness } from './components/AccreditationReadiness';
import { GapAnalysis } from './components/GapAnalysis';
import { QualityObservations } from './components/QualityObservations';
import { ContinuousImprovement } from './components/ContinuousImprovement';
import { InstitutionalReports } from './components/InstitutionalReports';
import { AIInsights } from './components/AIInsights';
import { SupportingDocuments } from './components/SupportingDocuments';
import { ACADEMIC_YEARS } from './iqac-data';

export type ViewType =
  | 'dashboard'
  | 'institution'
  | 'departments'
  | 'repository-monitoring'
  | 'accreditation'
  | 'gaps'
  | 'observations'
  | 'improvement'
  | 'reports'
  | 'ai-insights'
  | 'documents';

const viewTitles: Record<ViewType, { title: string; description: string }> = {
  dashboard: { title: 'IQAC Dashboard', description: 'Institutional quality, readiness and accreditation monitoring at a glance' },
  institution: { title: 'Institution Readiness', description: 'Repository-wise institutional readiness with record and evidence metrics' },
  departments: { title: 'Department Readiness', description: 'Department-wise readiness with read-only drill-down to evidence' },
  'repository-monitoring': { title: 'Repository Monitoring', description: 'Repository completion, pending uploads and missing evidence (monitoring only)' },
  accreditation: { title: 'Accreditation Readiness', description: 'NBA, NAAC and NIRF criterion-wise, department-wise and overall readiness' },
  gaps: { title: 'Gap Analysis', description: 'Auto-generated readiness gaps across repositories, evidence, criteria, departments and years' },
  observations: { title: 'Quality Observations', description: 'Raise, assign, track and close quality observations across departments' },
  improvement: { title: 'Continuous Improvement', description: 'Institutional quality initiatives — curriculum, faculty, labs, research, industry and infrastructure' },
  reports: { title: 'Institutional Reports', description: 'Generate and export institutional reports (PDF / Excel)' },
  'ai-insights': { title: 'AI Insights', description: 'Automatically generated institutional recommendations from live data' },
  documents: { title: 'Supporting Documents', description: 'IQAC annual reports, AQAR, SSR documents, policies and meeting minutes' },
};

export default function IQACDashboardPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const selectedAcademicYear = useAppSelector((state) => state.ui.selectedAcademicYear);
  const activeView = (searchParams.get('view') as ViewType) || 'dashboard';

  const viewInfo = viewTitles[activeView] || viewTitles.dashboard;

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'institution': return <InstitutionReadiness />;
      case 'departments': return <DepartmentReadiness />;
      case 'repository-monitoring': return <RepositoryMonitoring />;
      case 'accreditation': return <AccreditationReadiness />;
      case 'gaps': return <GapAnalysis />;
      case 'observations': return <QualityObservations />;
      case 'improvement': return <ContinuousImprovement />;
      case 'reports': return <InstitutionalReports />;
      case 'ai-insights': return <AIInsights />;
      case 'documents': return <SupportingDocuments />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{viewInfo.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{viewInfo.description}</p>
        </div>

        {/* Academic Year Selector */}
        <Select value={selectedAcademicYear} onValueChange={(year) => dispatch(setSelectedAcademicYear(year))}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select Academic Year" />
          </SelectTrigger>
          <SelectContent>
            {ACADEMIC_YEARS.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
                {year === '2025-26' && (
                  <span className="ml-2 text-[10px] text-blue-600 font-medium">(Current)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeView}-${selectedAcademicYear}`}
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

export { IQACDashboardPage };
