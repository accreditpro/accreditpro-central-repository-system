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
  FileText,
  Shield,
  BookOpen,
  BookMarked,
  FolderKanban,
  Briefcase,
  FlaskConical,
  Users,
  GraduationCap,
  Award,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Clock,
  Eye,
  DownloadCloud,
  Upload,
  DollarSign,
  Building2,
  Zap,
  Book,
  FileSpreadsheet,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface ResearchModuleProps {
  config: RepositoryModuleConfig;
  academicYear?: string;
}

const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'dashboard': LayoutDashboard,
  'faculty-journal-publications': FileText,
  'faculty-conference-publications': FileSpreadsheet,
  'faculty-patents': Shield,
  'faculty-books': Book,
  'faculty-book-chapters': BookMarked,
  'faculty-sponsored-projects': DollarSign,
  'faculty-consultancy-projects': Briefcase,
  'faculty-research-projects': FlaskConical,
  'student-journal-publications': FileText,
  'student-conference-publications': FileSpreadsheet,
  'student-patents': Shield,
  'student-books': Book,
  'student-book-chapters': BookMarked,
  'student-research-projects': FlaskConical,
  'department-project-development': Building2,
  'supporting-documents': FileText,
};

export const ResearchModule = ({ config, academicYear }: ResearchModuleProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  void academicYear;
  const metrics = repositoryHealth[config.id] || { dataCompleteness: 74, evidenceCompleteness: 60, verificationPercent: 65, readinessScore: 66 };

  // Score card data
  const moduleScores = [
    { label: 'Data Completeness', value: metrics.dataCompleteness, color: 'text-indigo-600 bg-indigo-500/10' },
    { label: 'Evidence Score', value: metrics.evidenceCompleteness, color: 'text-violet-600 bg-violet-500/10' },
    { label: 'Verification Score', value: metrics.verificationPercent, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Readiness Score', value: metrics.readinessScore, color: 'text-pink-600 bg-pink-500/10' },
  ];

  // KPI data for dashboard
  const kpiCards = [
    { label: 'Faculty Journal Pubs', value: '45', icon: FileText, color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Faculty Conference Pubs', value: '32', icon: FileSpreadsheet, color: 'text-violet-600 bg-violet-500/10' },
    { label: 'Faculty Patents', value: '8', icon: Shield, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Faculty Books/Chapters', value: '12', icon: BookOpen, color: 'text-amber-600 bg-amber-500/10' },
    { label: 'Sponsored Projects', value: '6', icon: DollarSign, color: 'text-orange-600 bg-orange-500/10' },
    { label: 'Consultancy Projects', value: '4', icon: Briefcase, color: 'text-purple-600 bg-purple-500/10' },
    { label: 'Student Publications', value: '28', icon: Users, color: 'text-cyan-600 bg-cyan-500/10' },
    { label: 'Student Patents', value: '3', icon: Award, color: 'text-rose-600 bg-rose-500/10' },
  ];

  const totalResearchFunding = 25000000; // ₹2.5 Cr
  const consultancyRevenue = 4500000; // ₹45 Lakhs

  const recentActivities = [
    { title: 'Dr. Rajesh Kumar published in IEEE Transactions', date: '2 days ago', type: 'Journal Publication', status: 'completed' },
    { title: 'Patent filed for AI-based diagnostic system', date: '3 days ago', type: 'Patent', status: 'completed' },
    { title: 'Sponsored project from DST-SERB sanctioned ₹45L', date: '1 week ago', type: 'Sponsored Project', status: 'completed' },
    { title: 'Consultancy project with ABC Industries completed', date: '1 week ago', type: 'Consultancy', status: 'completed' },
    { title: 'Student research paper accepted at ICML 2025', date: '2 weeks ago', type: 'Student Research', status: 'in-progress' },
    { title: 'Book chapter published by Springer', date: '2 weeks ago', type: 'Book Chapter', status: 'completed' },
    { title: 'Industry-sponsored research project kickoff', date: '3 weeks ago', type: 'Research Project', status: 'in-progress' },
    { title: 'Patent grant received for IoT device', date: '3 weeks ago', type: 'Patent', status: 'completed' },
  ];

  const healthData = config.tabs.filter(t => t.id !== 'dashboard' && t.id !== 'supporting-documents').map(t => ({
    module: t.label,
    completion: Math.floor(Math.random() * 30) + 65,
    records: Math.floor(Math.random() * 40) + 3,
  }));

  // Render Dashboard
  const renderDashboard = () => {
    const categoryColors = [
      'bg-blue-50 dark:bg-blue-950/20 text-blue-600',
      'bg-violet-50 dark:bg-violet-950/20 text-violet-600',
      'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600',
      'bg-amber-50 dark:bg-amber-950/20 text-amber-600',
      'bg-orange-50 dark:bg-orange-950/20 text-orange-600',
      'bg-purple-50 dark:bg-purple-950/20 text-purple-600',
      'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600',
      'bg-rose-50 dark:bg-rose-950/20 text-rose-600',
      'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600',
      'bg-teal-50 dark:bg-teal-950/20 text-teal-600',
      'bg-pink-50 dark:bg-pink-950/20 text-pink-600',
      'bg-green-50 dark:bg-green-950/20 text-green-600',
      'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600',
      'bg-sky-50 dark:bg-sky-950/20 text-sky-600',
      'bg-lime-50 dark:bg-lime-950/20 text-lime-600',
    ];

    return (
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

        {/* Research Funding & Consultancy Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-900/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Total Research Funding</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₹{(totalResearchFunding / 10000000).toFixed(2)} Cr
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+18%</span>
                <span>vs last academic year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-900/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Consultancy Revenue</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ₹{(consultancyRevenue / 100000).toFixed(2)} L
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-amber-600 font-medium">+12%</span>
                <span>vs last academic year</span>
              </div>
            </CardContent>
          </Card>
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
                  {healthData.map((item, idx) => (
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
            <CardTitle className="text-base">Annual Summary (2025-26)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: 'Journal Pubs', value: '45', icon: FileText },
                { label: 'Conference Pubs', value: '32', icon: FileSpreadsheet },
                { label: 'Patents Filed', value: '8', icon: Shield },
                { label: 'Books Published', value: '5', icon: Book },
                { label: 'Book Chapters', value: '7', icon: BookMarked },
                { label: 'Sponsored Projects', value: '6', icon: DollarSign },
                { label: 'Consultancy Projects', value: '4', icon: Briefcase },
                { label: 'Research Projects', value: '10', icon: FlaskConical },
              ].map((stat, idx) => (
                <div key={stat.label} className="text-center p-3 rounded-lg border border-border/50">
                  <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${categoryColors[idx]} mb-1`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/20 dark:to-pink-900/10 border border-pink-200 dark:border-pink-900/30">
                <p className="text-xs text-muted-foreground mb-1">Student Journal Pubs</p>
                <p className="text-xl font-bold text-pink-600">18</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/20 dark:to-cyan-900/10 border border-cyan-200 dark:border-cyan-900/30">
                <p className="text-xs text-muted-foreground mb-1">Student Conference Pubs</p>
                <p className="text-xl font-bold text-cyan-600">10</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/20 dark:to-violet-900/10 border border-violet-200 dark:border-violet-900/30">
                <p className="text-xs text-muted-foreground mb-1">Student Patents</p>
                <p className="text-xl font-bold text-violet-600">3</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-900/30">
                <p className="text-xs text-muted-foreground mb-1">Dept Project Developments</p>
                <p className="text-xl font-bold text-orange-600">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Completion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Evidence Completion Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Faculty Journal Pubs', value: 82 },
                { label: 'Faculty Conference Pubs', value: 75 },
                { label: 'Faculty Patents', value: 68 },
                { label: 'Faculty Books', value: 90 },
                { label: 'Faculty Book Chapters', value: 85 },
                { label: 'Faculty Sponsored Projects', value: 70 },
                { label: 'Faculty Consultancy', value: 65 },
                { label: 'Faculty Research Projects', value: 72 },
                { label: 'Student Journal Pubs', value: 78 },
                { label: 'Student Conference Pubs', value: 72 },
                { label: 'Student Patents', value: 60 },
                { label: 'Student Books', value: 88 },
                { label: 'Student Book Chapters', value: 82 },
                { label: 'Student Research Projects', value: 70 },
                { label: 'Dept Project Dev', value: 75 },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium truncate">{item.label}</span>
                    <span className="text-xs font-bold">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render Supporting Documents
  const renderSupportingDocs = () => {
    const totalDocs = evidenceDocuments.length;
    const categories = [
      { name: 'Journal Publication Proofs', count: 45, icon: FileText },
      { name: 'Conference Paper Proofs', count: 32, icon: FileSpreadsheet },
      { name: 'Patent Documents', count: 8, icon: Shield },
      { name: 'Book Publication Documents', count: 5, icon: Book },
      { name: 'Book Chapter Documents', count: 7, icon: BookMarked },
      { name: 'Sponsored Project Documents', count: 6, icon: DollarSign },
      { name: 'Consultancy Project Documents', count: 4, icon: Briefcase },
      { name: 'Research Project Documents', count: 10, icon: FlaskConical },
      { name: 'Student Publication Proofs', count: 28, icon: Users },
      { name: 'Student Patent Documents', count: 3, icon: Award },
      { name: 'Student Research Docs', count: 15, icon: GraduationCap },
      { name: 'Project Development Docs', count: 5, icon: Building2 },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Supporting Documents Repository</h3>
            <p className="text-sm text-muted-foreground">Central repository for all research evidence documents</p>
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
