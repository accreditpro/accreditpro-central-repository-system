import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RepositoryKPICards } from './components/RepositoryKPICards';
import { RepositoryTabContent } from './components/RepositoryTabContent';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { academicRepositoryTabs, repositoryMetrics } from './repository-config';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  Award,
  Globe,
  FolderOpen,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  Award,
  Globe,
  FolderOpen,
};

export const AcademicRepositoryPage = () => {
  const [activeTab, setActiveTab] = useState('programs');

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Academic Repository</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <Badge variant="outline" className="text-xs font-medium">
                Department: CSE
              </Badge>
              <Badge variant="outline" className="text-xs font-medium">
                Academic Year: 2025-26
              </Badge>
            </div>
          </div>
        </div>

        {/* Header Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Repository Completion', value: repositoryMetrics.dataCompleteness, color: 'text-indigo-600 bg-indigo-500/10' },
            { label: 'Evidence Score', value: repositoryMetrics.evidenceCompleteness, color: 'text-violet-600 bg-violet-500/10' },
            { label: 'Verification Score', value: repositoryMetrics.verificationPercent, color: 'text-emerald-600 bg-emerald-500/10' },
            { label: 'Readiness Score', value: repositoryMetrics.readinessScore, color: 'text-amber-600 bg-amber-500/10' },
          ].map((metric) => (
            <div
              key={metric.label}
              className={cn('p-3 rounded-xl border border-border/50 bg-card')}
            >
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xl font-bold', metric.color.split(' ')[0])}>{metric.value}%</span>
                <Progress value={metric.value} className="h-1.5 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <RepositoryKPICards />

      {/* Main Content: Tabs + Analytics Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        {/* Repository Tabs */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
              {academicRepositoryTabs.map((tab) => {
                const Icon = iconMap[tab.icon] || FileText;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {academicRepositoryTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4">
                <RepositoryTabContent tabConfig={tab} />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Analytics Panel (sticky) */}
        <div className="hidden xl:block">
          <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
};