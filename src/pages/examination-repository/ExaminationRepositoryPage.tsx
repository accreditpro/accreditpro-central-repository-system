import { useState, useMemo, cloneElement, isValidElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LayoutDashboard,
  Calendar,
  FileEdit,
  BadgeCheck,
  Repeat,
  AlertTriangle,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ExaminationDashboard } from './components/ExaminationDashboard';
import { DataTableModule } from './components/DataTableModule';
import { BacklogRepository } from './components/BacklogRepository';
import { GlobalSearch } from './components/GlobalSearch';
import { ExaminationDocumentsView } from './components/ExaminationDocumentsView';
import {
  allModuleConfigs,
} from './examination-configs';
import { cn } from '@/lib/utils';

const ACADEMIC_YEARS = [
  '2025-26',
  '2024-25',
  '2023-24',
  '2022-23',
  '2021-22',
  '2020-21',
  '2019-20',
];

type ViewType = 'dashboard' | 'global-search' | 'documents' | string;

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'examination-schedules', label: 'Examination Schedules', icon: <Calendar className="h-4 w-4" /> },
  { id: 'examination-circulars', label: 'Examination Circulars', icon: <FileEdit className="h-4 w-4" /> },
  { id: 'result-publications', label: 'Result Publications', icon: <BadgeCheck className="h-4 w-4" /> },
  { id: 'supplementary-examinations', label: 'Supplementary Examinations', icon: <Repeat className="h-4 w-4" /> },
  { id: 'backlog-repository', label: 'Backlog Repository', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'documents', label: 'Supporting Documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'global-search', label: 'Global Search', icon: <Search className="h-4 w-4" /> },
];

export function ExaminationRepositoryPage() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025-26');

  const activeConfig = useMemo(
    () => allModuleConfigs.find((c) => c.id === activeView),
    [activeView]
  );

  const renderContent = () => {
    if (activeView === 'dashboard') return <ExaminationDashboard academicYear={selectedAcademicYear} />;
    if (activeView === 'global-search') return <GlobalSearch academicYear={selectedAcademicYear} />;
    if (activeView === 'documents') return <ExaminationDocumentsView academicYear={selectedAcademicYear} />;
    if (activeView === 'backlog-repository') return <BacklogRepository academicYear={selectedAcademicYear} />;

    if (activeConfig) {
      return <DataTableModule config={activeConfig} academicYear={selectedAcademicYear} />;
    }

    return null;
  };

  return (
    <div className="flex h-full">
      <aside
        className={cn(
          'border-r bg-card transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-14' : 'w-60'
        )}
      >
        {/* Sidebar Header with Academic Year */}
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold text-primary">Exam Repository</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          {!sidebarCollapsed && (
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="h-8 text-xs w-full border-dashed">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((year) => (
                  <SelectItem key={year} value={year} className="text-xs">
                    {year}
                    {year === '2025-26' && <span className="ml-2 text-[9px] text-blue-600 font-medium">(Current)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {sidebarCollapsed && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 mx-auto block w-fit">
              {selectedAcademicYear.slice(0, 4)}
            </Badge>
          )}
        </div>

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

        {!sidebarCollapsed && (
          <div className="p-3 border-t">
            <p className="text-[10px] text-muted-foreground text-center">AccreditPro v2.0</p>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
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
      </main>
    </div>
  );
}
