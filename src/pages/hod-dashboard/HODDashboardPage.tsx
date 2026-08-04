import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSelectedAcademicYear } from '@/store/slices/uiSlice';
import { HODDashboard } from './components/HODDashboard';
import { EvidenceReview } from './components/EvidenceReview';
import { ApprovalQueue } from './components/ApprovalQueue';
import { GapAnalysis } from './components/GapAnalysis';
import { RepositoryReadiness } from './components/RepositoryReadiness';
import { DepartmentAnalytics } from './components/DepartmentAnalytics';
import { ReportsModule } from './components/ReportsModule';
import { ActivityTimeline } from './components/ActivityTimeline';
import { ACADEMIC_YEARS } from './hod-configs';

type ViewType = 'dashboard' | 'evidence' | 'approvals' | 'gaps' | 'readiness' | 'analytics' | 'reports' | 'activity';

export default function HODDashboardPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const selectedAcademicYear = useAppSelector((state) => state.ui.selectedAcademicYear);
  const activeView = (searchParams.get('view') as ViewType) || 'dashboard';

  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Department Overview';
      case 'evidence': return 'Evidence Review';
      case 'approvals': return 'Approval Queue';
      case 'gaps': return 'Gap Analysis';
      case 'readiness': return 'Repository Readiness';
      case 'analytics': return 'Department Analytics';
      case 'reports': return 'Reports';
      case 'activity': return 'Activity Timeline';
      default: return 'HOD Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (activeView) {
      case 'dashboard': return 'Monitor repository completion, readiness scores, and department health';
      case 'evidence': return 'Review and approve evidence documents submitted by coordinators';
      case 'approvals': return 'Review and approve pending evidence per section and category';
      case 'gaps': return 'Identify and track gaps in repository data with recommendations';
      case 'readiness': return 'Track weighted readiness scores across all repositories';
      case 'analytics': return 'Department performance metrics and five-year trends';
      case 'reports': return 'Generate and download department reports';
      case 'activity': return 'Track all activities across department repositories';
      default: return '';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <HODDashboard academicYear={selectedAcademicYear} />;
      case 'evidence': return <EvidenceReview academicYear={selectedAcademicYear} />;
      case 'approvals': return <ApprovalQueue academicYear={selectedAcademicYear} />;
      case 'gaps': return <GapAnalysis academicYear={selectedAcademicYear} />;
      case 'readiness': return <RepositoryReadiness academicYear={selectedAcademicYear} />;
      case 'analytics': return <DepartmentAnalytics academicYear={selectedAcademicYear} />;
      case 'reports': return <ReportsModule academicYear={selectedAcademicYear} />;
      case 'activity': return <ActivityTimeline academicYear={selectedAcademicYear} />;
      default: return <HODDashboard academicYear={selectedAcademicYear} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
          <p className="text-sm text-muted-foreground mt-1">{getPageDescription()}</p>
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

export { HODDashboardPage };
export type { ViewType };
