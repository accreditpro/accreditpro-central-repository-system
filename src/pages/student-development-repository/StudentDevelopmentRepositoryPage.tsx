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
  Heart,
  Shield,
  Trophy,
  Music,
  HandHeart,
  Users,
  Layers,
  BookMarked,
  Award,
  Medal,
  Calendar,
  FileText,
  Building2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { studentDevTabConfigs } from './student-development-configs';
import { StudentDevelopmentDashboard } from './components/StudentDevelopmentDashboard';
import { StudentDevelopmentDocumentsView } from './components/StudentDevelopmentDocumentsView';
import { TPOSectionView } from '@/pages/tpo-repository/components/TPOSectionView';
import { TPOEvidenceSectionConfig } from '@/pages/tpo-repository/components/TPOEvidenceDialog';
import {
  NSS_EVIDENCE_SECTIONS,
  NCC_EVIDENCE_SECTIONS,
  SPORTS_EVIDENCE_SECTIONS,
  CULTURAL_EVIDENCE_SECTIONS,
  EVENTS_EVIDENCE_SECTIONS,
  STUDENT_ACHIEVEMENTS_EVIDENCE_SECTIONS,
  EXTENSION_ACTIVITIES_EVIDENCE_SECTIONS,
  COMMUNITY_OUTREACH_EVIDENCE_SECTIONS,
  CLUBS_EVIDENCE_SECTIONS,
  STUDENT_CHAPTERS_EVIDENCE_SECTIONS,
  STUDENT_AWARDS_EVIDENCE_SECTIONS,
} from '@/pages/tpo-repository/components/TPOEvidenceDialog';

type ViewType = 'dashboard' | 'documents' | string;

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'nss', label: 'NSS', icon: <Heart className="h-4 w-4" /> },
  { id: 'ncc', label: 'NCC', icon: <Shield className="h-4 w-4" /> },
  { id: 'sports-activities', label: 'Sports Activities', icon: <Trophy className="h-4 w-4" /> },
  { id: 'cultural-activities', label: 'Cultural Activities', icon: <Music className="h-4 w-4" /> },
  { id: 'extension-activities', label: 'Extension Activities', icon: <HandHeart className="h-4 w-4" /> },
  { id: 'community-outreach', label: 'Community Outreach', icon: <Users className="h-4 w-4" /> },
  { id: 'clubs', label: 'Clubs & Societies', icon: <Layers className="h-4 w-4" /> },
  { id: 'student-chapters', label: 'Student Chapters', icon: <BookMarked className="h-4 w-4" /> },
  { id: 'student-achievements', label: 'Student Achievements', icon: <Award className="h-4 w-4" /> },
  { id: 'student-awards', label: 'Student Awards', icon: <Medal className="h-4 w-4" /> },
  { id: 'events', label: 'Events', icon: <Calendar className="h-4 w-4" /> },
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

/**
 * Maps section IDs to their evidence section configs for use in the
 * consolidated Supporting Documents view.
 */
const evidenceSectionConfigMap: Record<string, TPOEvidenceSectionConfig[]> = {
  nss: NSS_EVIDENCE_SECTIONS,
  ncc: NCC_EVIDENCE_SECTIONS,
  'sports-activities': SPORTS_EVIDENCE_SECTIONS,
  'cultural-activities': CULTURAL_EVIDENCE_SECTIONS,
  events: EVENTS_EVIDENCE_SECTIONS,
  'student-achievements': STUDENT_ACHIEVEMENTS_EVIDENCE_SECTIONS,
  'extension-activities': EXTENSION_ACTIVITIES_EVIDENCE_SECTIONS,
  'community-outreach': COMMUNITY_OUTREACH_EVIDENCE_SECTIONS,
  clubs: CLUBS_EVIDENCE_SECTIONS,
  'student-chapters': STUDENT_CHAPTERS_EVIDENCE_SECTIONS,
  'student-awards': STUDENT_AWARDS_EVIDENCE_SECTIONS,
};

/** Maps section IDs to their human-readable labels. */
const sectionLabelMap: Record<string, string> = Object.fromEntries(
  studentDevTabConfigs.map((t) => [t.id, t.label])
);

export default function StudentDevelopmentRepositoryPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025-26');

  const departmentId = user?.departmentId ?? null;

  const activeTabConfig = useMemo(() => {
    return studentDevTabConfigs.find((t) => t.id === activeView);
  }, [activeView]);

  const renderContent = () => {
    if (departmentId == null) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
          <h3 className="text-lg font-semibold">Department required</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1">
            Your account has no department assigned. Ask your Institution Admin to assign a
            department to your profile before using the Student Development Repository.
          </p>
        </div>
      );
    }

    if (activeView === 'dashboard') {
      return <StudentDevelopmentDashboard departmentId={departmentId} academicYear={selectedAcademicYear} />;
    }

    if (activeView === 'documents') {
      return (
        <StudentDevelopmentDocumentsView
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          sectionEvidenceConfigs={evidenceSectionConfigMap}
          sectionLabels={sectionLabelMap}
        />
      );
    }

    if (!activeTabConfig) return null;

    const sectionId = activeTabConfig.id;
    const evidenceConfigs = evidenceSectionConfigMap[sectionId];

    if (sectionId === 'nss') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.nssUnitNumber || 'NSS Unit')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'ncc') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.nccUnit || 'NCC Unit')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'sports-activities') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.event || row.sport || 'Sports Event')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'cultural-activities') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.eventName || 'Cultural Event')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'events') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.eventName || 'Event')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'student-achievements') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.studentName || row.achievement || 'Achievement')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'extension-activities') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.activity || 'Extension Activity')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'community-outreach') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.programName || 'Outreach Program')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'clubs') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.clubName || 'Club/Society')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'student-chapters') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.chapterName || 'Student Chapter')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

    if (sectionId === 'student-awards') {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          departmentId={departmentId}
          academicYear={selectedAcademicYear}
          getRecordTitle={(row) => String(row.awardName || row.recipientName || 'Award')}
          evidenceSectionConfigs={evidenceConfigs}
        />
      );
    }

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
          {!sidebarCollapsed && <span className="text-sm font-semibold text-primary">Student Development</span>}
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
