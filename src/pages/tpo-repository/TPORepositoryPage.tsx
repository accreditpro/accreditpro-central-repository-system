import { useState, useMemo, cloneElement, isValidElement } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  UserCheck,
  BookOpen,
  Rocket,
  Presentation,
  BarChart3,
  FileText,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { tpoTabConfigs } from './tpo-configs';
import { TPODashboard } from './components/TPODashboard';
import { TPODocumentsView } from './components/TPODocumentsView';
import { RecruitersView } from './components/RecruitersView';
import { TPOSectionView } from './components/TPOSectionView';
import {
  PLACEMENT_OFFER_EVIDENCE_SECTIONS,
  INTERNSHIP_EVIDENCE_SECTIONS,
  HIGHER_EDUCATION_EVIDENCE_SECTIONS,
  ENTREPRENEURSHIP_EVIDENCE_SECTIONS,
  TRAINING_ACTIVITIES_EVIDENCE_SECTIONS,
} from './components/TPOEvidenceDialog';

type ViewType = 'dashboard' | 'documents' | string;

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'recruiters', label: 'Recruiters', icon: <Building2 className="h-4 w-4" /> },
  { id: 'placement-offers', label: 'Placement Offers', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'internships', label: 'Internships', icon: <UserCheck className="h-4 w-4" /> },
  { id: 'higher-education', label: 'Higher Education', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'entrepreneurship-startups', label: 'Entrepreneurship & Startups', icon: <Rocket className="h-4 w-4" /> },
  { id: 'training-activities', label: 'Training Activities', icon: <Presentation className="h-4 w-4" /> },
  { id: 'placement-statistics', label: 'Placement Statistics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'documents', label: 'Supporting Documents', icon: <FileText className="h-4 w-4" /> },
];

// Academic years (kept in sync with the rest of the app's year selector pattern)
const ACADEMIC_YEARS = [
  '2025-26',
  '2024-25',
  '2023-24',
  '2022-23',
  '2021-22',
  '2020-21',
  '2019-20',
];

export default function TPORepositoryPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025-26');

  const departmentId = user?.departmentId ?? null;

  const activeTabConfig = useMemo(() => {
    return tpoTabConfigs.find((t) => t.id === activeView);
  }, [activeView]);

  const renderContent = () => {
    if (departmentId == null) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
          <h3 className="text-lg font-semibold">Department required</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1">
            Your account has no department assigned. Ask your Institution Admin to assign a
            department to your profile before using the TPO Repository.
          </p>
        </div>
      );
    }

    if (activeView === 'dashboard') {
      return <TPODashboard departmentId={departmentId} academicYear={selectedAcademicYear} />;
    }

    if (activeView === 'documents') {
      return <TPODocumentsView departmentId={departmentId} academicYear={selectedAcademicYear} />;
    }

    if (activeView === 'recruiters') {
      return <RecruitersView departmentId={departmentId} academicYear={selectedAcademicYear} />;
    }

    if (activeView === 'training-activities' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.programName || 'Training')}
          evidenceSectionConfigs={TRAINING_ACTIVITIES_EVIDENCE_SECTIONS}
        />
      );
    }

    if (activeView === 'placement-offers' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => `${row.studentName || 'Unknown'} - ${row.company || ''}`}
          evidenceSectionConfigs={PLACEMENT_OFFER_EVIDENCE_SECTIONS}
        />
      );
    }

    if (activeView === 'internships' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => `${row.studentName || 'Unknown'} - ${row.company || ''}`}
          evidenceSectionConfigs={INTERNSHIP_EVIDENCE_SECTIONS}
        />
      );
    }

    if (activeView === 'higher-education' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => `${row.studentName || 'Unknown'} - ${row.university || ''}`}
          evidenceSectionConfigs={HIGHER_EDUCATION_EVIDENCE_SECTIONS}
        />
      );
    }

    if (activeView === 'entrepreneurship-startups' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => `${row.startupName || 'Unknown'} - ${row.founderName || ''}`}
          evidenceSectionConfigs={ENTREPRENEURSHIP_EVIDENCE_SECTIONS}
        />
      );
    }

    if (activeView === 'placement-statistics' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => `${row.department || 'Department'} - ${row.academicYear || ''}`}
        />
      );
    }

    if (!activeTabConfig) return null;

    return (
      <TPOSectionView
        tabConfig={activeTabConfig}
        departmentId={departmentId}
        academicYear={selectedAcademicYear}
        getRecordTitle={(row) => String(row.id || 'Record')}
      />
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className={`border-r bg-card transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-14' : 'w-60'}`}>
        <div className="flex items-center justify-between p-3 border-b">
          {!sidebarCollapsed && <span className="text-sm font-semibold text-primary">TPO Repository</span>}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Department + Academic Year */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2 border-b space-y-2">
            {departmentId != null && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-semibold bg-blue-500/10 text-blue-700 border-blue-500/30">
                <Building2 className="h-3 w-3 mr-1" />
                Dept #{departmentId}
              </Badge>
            )}
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="h-8 text-xs w-full border-dashed">
                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((year) => (
                  <SelectItem key={year} value={year} className="text-xs">
                    {year}
                    {year === '2025-26' && (
                      <span className="ml-2 text-[9px] text-blue-600 font-medium">(Current)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2 h-9 rounded-lg transition-all',
                  sidebarCollapsed && 'px-2 justify-center',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
                onClick={() => setActiveView(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && isValidElement(item.icon)
                  ? cloneElement(item.icon, { className: 'h-4 w-4 text-primary' })
                  : item.icon}
                {!sidebarCollapsed && <span className="text-sm truncate">{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
}
