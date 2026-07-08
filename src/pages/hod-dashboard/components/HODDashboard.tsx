import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Users,
  GraduationCap,
  FlaskConical,
  UserCheck,
  FileCheck,
  ShieldCheck,
  Clock,
  CheckSquare,
  Target,
  Activity,
  Brain,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { repositoryOverviewData, readinessData, aiInsights, activityTimelineData } from '../hod-configs';

export function HODDashboard() {
  const kpiCards = [
    { label: 'Academic Repository', value: '92%', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Faculty Repository', value: '88%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Student Repository', value: '95%', icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Research Repository', value: '72%', icon: FlaskConical, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
    { label: 'Alumni Repository', value: '61%', icon: UserCheck, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30' },
    { label: 'Evidence Completion', value: '78%', icon: FileCheck, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
    { label: 'Verification', value: '74%', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Pending Reviews', value: '8', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Pending Approvals', value: '6', icon: CheckSquare, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
    { label: 'Repository Readiness', value: '84%', icon: Target, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
    { label: 'Department Health', value: '87%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'at-risk': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightBorder = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-amber-500';
      case 'critical': return 'border-l-red-500';
      case 'success': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  // Calculate weighted readiness score
  const weightedScore = readinessData.reduce((acc, item) => {
    const avgScore = (item.dataCompletion + item.evidenceCompletion + item.verification + item.approval) / 4;
    return acc + (avgScore * item.weight / 100);
  }, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                  <p className="text-lg font-bold">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repository Completion */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Repository Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {repositoryOverviewData.map((repo) => (
              <div key={repo.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{repo.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{repo.completion}%</span>
                    <Badge className={`text-xs ${getStatusColor(repo.status)}`}>
                      {repo.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                <Progress value={repo.completion} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Readiness Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Department Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" strokeDasharray={`${weightedScore * 3.14} 314`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{Math.round(weightedScore)}%</span>
                  <span className="text-xs text-muted-foreground">Overall</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {readinessData.slice(0, 5).map((item) => {
                const avg = Math.round((item.dataCompletion + item.evidenceCompletion + item.verification + item.approval) / 4);
                return (
                  <div key={item.repository} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.repository}</span>
                    <span className="font-medium">{avg}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className={`p-3 rounded-lg border-l-4 bg-muted/30 ${getInsightBorder(insight.type)}`}>
                <div className="flex items-start gap-2">
                  {getInsightIcon(insight.type)}
                  <div>
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityTimelineData.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.type === 'approved' || activity.type === 'verified' ? 'bg-green-500' :
                    activity.type === 'rejected' ? 'bg-red-500' :
                    activity.type === 'returned' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{activity.repository}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}