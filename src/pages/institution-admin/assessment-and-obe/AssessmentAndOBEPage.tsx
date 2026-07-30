import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Target,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { defaultOBEConfig } from './mock-data';
import { OBESidebarView, OBEConfiguration } from './types';
import { GapAnalysisStrategyPage } from './pages/GapAnalysisStrategyPage';
import { COAttainmentCalculationPage } from './pages/COAttainmentCalculationPage';
import { COPOAttainmentCalculationPage } from './pages/COPOAttainmentCalculationPage';
import { COQuestionMappingStrategyPage } from './pages/COQuestionMappingStrategyPage';

// ─── Sidebar Navigation Items ─────────────────────────────
const sidebarItems: {
  id: OBESidebarView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'gap-analysis',
    label: 'Gap Analysis Strategy',
    icon: Activity,
    description: 'Configure when gap analysis is performed',
  },
  {
    id: 'co-attainment',
    label: 'CO Attainment Calculation',
    icon: BarChart3,
    description: 'Configure CO attainment method',
  },
  {
    id: 'co-po-attainment',
    label: 'CO–PO Attainment Calculation',
    icon: Target,
    description: 'Configure PO/PSO attainment method',
  },
  {
    id: 'co-question-mapping',
    label: 'CO–Question Mapping Strategy',
    icon: GitBranch,
    description: 'Configure CO-question mapping strategy',
  },
];

const pageTitles: Record<OBESidebarView, string> = {
  'gap-analysis': 'Gap Analysis Strategy',
  'co-attainment': 'CO Attainment Calculation',
  'co-po-attainment': 'CO–PO / CO–PSO Attainment Calculation',
  'co-question-mapping': 'CO–Question Mapping Strategy',
};

const pageDescriptions: Record<OBESidebarView, string> = {
  'gap-analysis': 'Configure when the system should perform Gap Analysis across the institution',
  'co-attainment': 'Configure the methodology for calculating Course Outcome attainment',
  'co-po-attainment': 'Configure how PO and PSO attainment is calculated from CO values',
  'co-question-mapping': 'Configure how questions map to Course Outcomes in blueprints',
};

export const AssessmentAndOBEPage = () => {
  // ─── OBE Configuration State (shared across all pages) ───
  const [config, setConfig] = useState<OBEConfiguration>(defaultOBEConfig);

  // ─── UI State ───
  const [activeView, setActiveView] = useState<OBESidebarView>('gap-analysis');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // ─── Render Content ──────────────────────────────────────
  const renderContent = () => {
    const props = { config, onUpdate: handleConfigUpdate };

    switch (activeView) {
      case 'gap-analysis':
        return <GapAnalysisStrategyPage {...props} />;
      case 'co-attainment':
        return <COAttainmentCalculationPage {...props} />;
      case 'co-po-attainment':
        return <COPOAttainmentCalculationPage {...props} />;
      case 'co-question-mapping':
        return <COQuestionMappingStrategyPage {...props} />;
      default:
        return <GapAnalysisStrategyPage {...props} />;
    }
  };

  // ─── Config Update Handler ───────────────────────────────
  const handleConfigUpdate = (newConfig: OBEConfiguration) => {
    setConfig(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ─── Validate Configuration ──────────────────────────────
  const validationErrors: string[] = [];
  const enabledGapAnalysis = Object.values(config.gapAnalysis).filter(Boolean).length;
  if (enabledGapAnalysis === 0) validationErrors.push('Gap Analysis strategy');

  const hasAcademicYears = config.academicYears.length > 0;
  if (!hasAcademicYears) validationErrors.push('Academic Year config');

  const hasErrors = validationErrors.length > 0;

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-border/50 bg-card transition-all duration-300 ease-in-out',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className={cn('p-4 border-b border-border/50', sidebarCollapsed && 'p-2')}>
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-foreground">Assessment & OBE</h2>
                <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                  Institution-wide Configuration
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Menu className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          <div
            className={cn(
              'flex items-center gap-1',
              sidebarCollapsed ? 'justify-center mt-1' : 'justify-end mt-1'
            )}
          >
            {sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Menu className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-lg transition-all duration-200 relative group',
                  sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn('h-4 w-4 shrink-0', isActive && 'text-primary-foreground')}
                />
                {!sidebarCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-xs font-medium truncate block">
                        {item.label}
                      </span>
                      <span className="text-[8px] text-muted-foreground/60 truncate block">
                        {item.description}
                      </span>
                    </div>
                  </>
                )}
                {isActive && (
                  <motion.div
                    layoutId="obe-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Summary */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-border/50 space-y-2">
            <div
              className={cn(
                'rounded-lg p-2.5',
                hasErrors
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-gradient-to-r from-primary/5 to-primary/[0.02]'
              )}
            >
              <div className="flex items-center gap-2">
                {hasErrors ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-[9px] font-medium',
                      hasErrors ? 'text-red-600' : 'text-green-600'
                    )}
                  >
                    {hasErrors ? 'Configuration has errors' : 'Configuration valid'}
                  </p>
                  {validationErrors.length > 0 && (
                    <p className="text-[8px] text-red-500 truncate">
                      {validationErrors.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[8px] text-muted-foreground text-center leading-tight">
              These settings are consumed across all departments
            </p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 lg:hidden shrink-0"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* View Title & Description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">
                {pageTitles[activeView]}
              </h1>
              <p className="text-[10px] text-muted-foreground truncate">
                {pageDescriptions[activeView]}
              </p>
            </div>

            {/* Quick Status */}
            <div className="hidden sm:flex items-center gap-2">
              {hasErrors ? (
                <Badge
                  variant="outline"
                  className="text-[9px] px-2 py-0 h-5 gap-1 border-red-500/30 text-red-600"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {validationErrors.length} issue{validationErrors.length > 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[9px] px-2 py-0 h-5 gap-1 border-green-500/30 text-green-600"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  All configured
                </Badge>
              )}
              {saved && (
                <Badge className="text-[9px] px-2 py-0 h-5 gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
