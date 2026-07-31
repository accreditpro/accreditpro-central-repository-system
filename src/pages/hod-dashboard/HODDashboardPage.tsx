import { useSearchParams } from 'react-router-dom';
import { HODDashboard } from './components/HODDashboard';
import { EvidenceReview } from './components/EvidenceReview';
import { ApprovalQueue } from './components/ApprovalQueue';
import { GapAnalysis } from './components/GapAnalysis';
import { RepositoryReadiness } from './components/RepositoryReadiness';
import { DepartmentAnalytics } from './components/DepartmentAnalytics';
import { ReportsModule } from './components/ReportsModule';
import { ActivityTimeline } from './components/ActivityTimeline';

type ViewType =
  | 'dashboard'
  | 'evidence'
  | 'approvals'
  | 'gaps'
  | 'readiness'
  | 'analytics'
  | 'reports'
  | 'activity';

export default function HODDashboardPage() {
  const [searchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as ViewType) || 'dashboard';

  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Department Overview';
      case 'evidence':
        return 'Evidence Review';
      case 'approvals':
        return 'Approval Queue';
      case 'gaps':
        return 'Gap Analysis';
      case 'readiness':
        return 'Repository Readiness';
      case 'analytics':
        return 'Department Analytics';
      case 'reports':
        return 'Reports';
      case 'activity':
        return 'Activity Timeline';
      default:
        return 'HOD Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Monitor repository completion, readiness scores, and department health';
      case 'evidence':
        return 'Review and approve evidence documents submitted by coordinators';
      case 'approvals':
        return 'Manage pending submissions and forward approved data to IQAC';
      case 'gaps':
        return 'Identify and track gaps in repository data with recommendations';
      case 'readiness':
        return 'Track weighted readiness scores across all repositories';
      case 'analytics':
        return 'Department performance metrics and five-year trends';
      case 'reports':
        return 'Generate and download department reports';
      case 'activity':
        return 'Track all activities across department repositories';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <HODDashboard />;
      case 'evidence':
        return <EvidenceReview />;
      case 'approvals':
        return <ApprovalQueue />;
      case 'gaps':
        return <GapAnalysis />;
      case 'readiness':
        return <RepositoryReadiness />;
      case 'analytics':
        return <DepartmentAnalytics />;
      case 'reports':
        return <ReportsModule />;
      case 'activity':
        return <ActivityTimeline />;
      default:
        return <HODDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
        <p className="text-sm text-muted-foreground mt-1">{getPageDescription()}</p>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

export { HODDashboardPage };
export type { ViewType };
