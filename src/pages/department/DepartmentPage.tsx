import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DepartmentDashboard } from './DepartmentDashboard';
import { DataModuleView } from './DataModuleView';
import { CSVUploadEngine } from './CSVUploadEngine';
import { DepartmentAnalytics } from './DepartmentAnalytics';
import { DataModule } from './types';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  Upload,
  BarChart3,
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'academic', label: 'Academic Data', icon: GraduationCap },
  { id: 'faculty', label: 'Faculty Data', icon: Users },
  { id: 'student', label: 'Student Data', icon: BookOpen },
  { id: 'research', label: 'Research Data', icon: FlaskConical },
  { id: 'upload', label: 'CSV Upload', icon: Upload },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const DepartmentPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Department of Computer Science</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Department Coordinator Portal • Academic Year 2024-25
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <TabsContent value="dashboard" className="m-0">
              <DepartmentDashboard onNavigate={setActiveTab} />
            </TabsContent>
            <TabsContent value="academic" className="m-0">
              <DataModuleView module="academic" />
            </TabsContent>
            <TabsContent value="faculty" className="m-0">
              <DataModuleView module="faculty" />
            </TabsContent>
            <TabsContent value="student" className="m-0">
              <DataModuleView module="student" />
            </TabsContent>
            <TabsContent value="research" className="m-0">
              <DataModuleView module="research" />
            </TabsContent>
            <TabsContent value="upload" className="m-0">
              <CSVUploadEngine />
            </TabsContent>
            <TabsContent value="analytics" className="m-0">
              <DepartmentAnalytics />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};
