import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RepositoryModuleConfig } from '../types';
import { repositoryHealth, departmentInfo, evidenceDocuments } from '../repository-configs';
import { RepositoryTabContent } from './RepositoryTabContent';
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Target,
  GraduationCap,
  Zap,
  Award,
  BookMarked,
  Layers,
  Calendar,
  Trophy,
  Globe,
  Presentation,
  Building2,
  Heart,
  Shield,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  Eye,
  DownloadCloud,
  Upload,
} from 'lucide-react';

interface StudentDevOutcomesModuleProps {
  config: RepositoryModuleConfig;
  academicYear?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
};

const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'dashboard': LayoutDashboard,
  'academic-projects': FolderKanban,
  'internships': Briefcase,
  'placements': Target,
  'higher-studies': GraduationCap,
  'entrepreneurship': Zap,
  'professional-memberships': Award,
  'student-chapters': BookMarked,
  'student-clubs': Layers,
  'professional-events': Calendar,
  'competitions-hackathons': Trophy,
  'moocs-swayam-nptel': Globe,
  'workshops-guest-lectures': Presentation,
  'industrial-visits': Building2,
  'nss-activities': Heart,
  'ncc-activities': Shield,
  'supporting-documents': FileText,
};

export const StudentDevOutcomesModule = ({ config, academicYear }: StudentDevOutcomesModuleProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  void academicYear;
  const metrics = repositoryHealth[config.id] || { dataCompleteness: 72, evidenceCompleteness: 65, verificationPercent: 68, readinessScore: 68 };

  // Score card data
  const moduleScores = [
    { label: 'Data Completeness', value: metrics.dataCompleteness, color: 'text-indigo-600 bg-indigo-500/10' },
    { label: 'Evidence Score', value: metrics.evidenceCompleteness, color: 'text-violet-600 bg-violet-500/10' },
    { label: 'Verification Score', value: metrics.verificationPercent, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Readiness Score', value: metrics.readinessScore, color: 'text-rose-600 bg-rose-500/10' },
  ];

  // KPI data for dashboard
  const kpiCards = [
    { label: 'Academic Projects', value: '45', icon: FolderKanban, color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Internships', value: '28', icon: Briefcase, color: 'text-violet-600 bg-violet-500/10' },
    { label: 'Placements', value: '56', icon: Target, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Higher Studies', value: '18', icon: GraduationCap, color: 'text-amber-600 bg-amber-500/10' },
    { label: 'Startups', value: '8', icon: Zap, color: 'text-orange-600 bg-orange-500/10' },
    { label: 'Memberships', value: '35', icon: Award, color: 'text-purple-600 bg-purple-500/10' },
    { label: 'Competitions', value: '25', icon: Trophy, color: 'text-pink-600 bg-pink-500/10' },
    { label: 'MOOCs', value: '40', icon: Globe, color: 'text-cyan-600 bg-cyan-500/10' },
  ];

  const recentActivities = [
    { title: '3 students placed at Microsoft', date: '2 days ago', type: 'Placement', status: 'completed' },
    { title: 'CLD internship certificates uploaded', date: '3 days ago', type: 'Internship', status: 'completed' },
    { title: 'IEEE Student Chapter event report submitted', date: '1 week ago', type: 'Chapter', status: 'completed' },
    { title: 'NSS Blood Donation Camp conducted', date: '1 week ago', type: 'NSS', status: 'completed' },
    { title: 'Smart India Hackathon team registration', date: '2 weeks ago', type: 'Competition', status: 'in-progress' },
    { title: 'NPTEL Deep Learning course completed', date: '2 weeks ago', type: 'MOOC', status: 'completed' },
    { title: 'Industrial Visit to DRDO planned', date: '3 weeks ago', type: 'Visit', status: 'in-progress' },
    { title: 'Coding Club Hackathon 2024', date: '3 weeks ago', type: 'Club', status: 'completed' },
  ];

  const healthData = config.tabs.filter(t => t.id !== 'dashboard' && t.id !== 'supporting-documents').map(t => ({
    module: t.label,
    completion: Math.floor(Math.random() * 30) + 65,
    records: Math.floor(Math.random() * 50) + 5,
  }));

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-5 w-5 ${kpi.color.split(' ')[0]}`} />
                <Badge variant="secondary" className="text-xs font-medium">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Module Health</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[380px] pr-2">
              <div className="space-y-3">
                {healthData.map((item) => (
                  <div key={item.module} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{item.module}</span>
                        <span className="text-xs text-muted-foreground">{item.records} records</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.completion >= 90 ? 'bg-green-500' : item.completion >= 75 ? 'bg-blue-500' : item.completion >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.completion}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold w-10 text-right">{item.completion}%</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[380px] pr-2">
              <div className="space-y-3">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="mt-0.5">
                      {activity.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs py-0 px-1.5">{activity.type}</Badge>
                        <span className="text-xs text-muted-foreground">{activity.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Annual Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Annual Summary (2024-25)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Projects Completed', value: '42', icon: FolderKanban, color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' },
              { label: 'Interns Done', value: '28', icon: Briefcase, color: 'bg-violet-50 dark:bg-violet-950/20 text-violet-600' },
              { label: 'Students Placed', value: '56', icon: Target, color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' },
              { label: 'Higher Studies', value: '18', icon: GraduationCap, color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' },
              { label: 'Startups Launched', value: '3', icon: Zap, color: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600' },
              { label: 'Competitions Won', value: '15', icon: Trophy, color: 'bg-pink-50 dark:bg-pink-950/20 text-pink-600' },
              { label: 'MOOCs Completed', value: '36', icon: Globe, color: 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600' },
              { label: 'Total Certifications', value: '126', icon: Award, color: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-lg border border-border/50">
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.color.split(' ').slice(2).join(' ')} ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]} mb-1`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="text-lg font-bold">{stat.value}</div>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Supporting Documents
  const renderSupportingDocs = () => {
    const totalDocs = evidenceDocuments.length;
    const categories = [
      { name: 'Project Documents', count: 8, icon: FolderKanban },
      { name: 'Internship Records', count: 12, icon: Briefcase },
      { name: 'Placement Offers', count: 15, icon: Target },
      { name: 'Higher Study Admissions', count: 6, icon: GraduationCap },
      { name: 'Startup Registrations', count: 3, icon: Zap },
      { name: 'Membership Certificates', count: 20, icon: Award },
      { name: 'Competition Certificates', count: 18, icon: Trophy },
      { name: 'MOOC Certificates', count: 25, icon: Globe },
      { name: 'Event Reports', count: 30, icon: Calendar },
      { name: 'Workshop Materials', count: 22, icon: Presentation },
      { name: 'Visit Reports', count: 10, icon: Building2 },
      { name: 'NSS/NCC Records', count: 15, icon: Shield },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Supporting Documents Repository</h3>
            <p className="text-sm text-muted-foreground">Central repository for all student development evidence documents</p>
          </div>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <FileText className="h-4 w-4 mr-1.5" />
            {categories.length} Categories
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Eye className="h-4 w-4 mr-1.5" />
            {totalDocs} Total Documents
          </Badge>
        </div>

        <div className="relative max-w-sm">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search document categories..." className="pl-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.name} className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    {cat.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <DownloadCloud className="h-3.5 w-3.5" />
                  <span>{cat.count} documents available</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Evidence table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Document Uploads</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{evidenceDocuments.length} documents</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Document</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Version</th>
                    <th className="text-left p-3 font-medium">Uploaded By</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceDocuments.slice(0, 5).map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[180px]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-3"><Badge variant="outline" className="text-[9px]">{doc.category}</Badge></td>
                      <td className="p-3 text-muted-foreground">{doc.version}</td>
                      <td className="p-3 text-muted-foreground">{doc.uploadedBy}</td>
                      <td className="p-3 text-muted-foreground">{doc.uploadedDate}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className={cn('text-[9px]',
                          doc.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                          doc.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                          doc.status === 'rejected' && 'bg-red-500/10 text-red-600',
                          doc.status === 'uploaded' && 'bg-blue-500/10 text-blue-600',
                        )}>{doc.status}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6"><Eye className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><DownloadCloud className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.label}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
          </div>
        </div>
        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {moduleScores.map((metric) => (
            <div key={metric.label} className="p-3 rounded-xl border border-border/50 bg-card">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xl font-bold', metric.color.split(' ')[0])}>{metric.value}%</span>
                <Progress value={metric.value} className="h-1.5 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); }} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          {config.tabs.map((tab) => {
            const Icon = tabIcons[tab.id] || FileText;
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

        {config.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            {tab.id === 'dashboard' ? (
              renderDashboard()
            ) : tab.id === 'supporting-documents' ? (
              renderSupportingDocs()
            ) : (
              <RepositoryTabContent tabConfig={tab} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
