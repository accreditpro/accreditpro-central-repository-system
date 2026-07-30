import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
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

  const activeConfig = useMemo(
    () => allModuleConfigs.find((c) => c.id === activeView),
    [activeView]
  );

  const renderContent = () => {
    if (activeView === 'dashboard') return <ExaminationDashboard />;
    if (activeView === 'global-search') return <GlobalSearch />;
    if (activeView === 'documents') return <ExaminationDocumentsView />;
    if (activeView === 'backlog-repository') return <BacklogRepository />;

    if (activeConfig) {
      return <DataTableModule config={activeConfig} />;
    }

    return null;
  };

  return (
    <div className="flex h-full">
      <aside
        className={`border-r bg-card transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-14' : 'w-60'
        }`}
      >
        <div className="flex items-center justify-between p-3 border-b">
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold text-primary">Exam Repository</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-2 h-9 ${
                sidebarCollapsed ? 'px-2 justify-center' : ''
              } ${
                activeView === item.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : ''
              }`}
              onClick={() => setActiveView(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!sidebarCollapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>
        {!sidebarCollapsed && (
          <div className="p-3 border-t">
            <p className="text-[10px] text-muted-foreground text-center">
              AccreditPro v2.0
            </p>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
    </div>
  );
}
