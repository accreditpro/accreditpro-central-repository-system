import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckSquare,
  AlertTriangle,
  Trophy,
  Bot,
  FileBarChart,
  Activity,
  Check,
  X,
  RotateCcw,
  MessageSquare,
  Forward,
  Search,
  Download,
  Mail,
  Calendar,
  Target,
  Lightbulb,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react';
import {
  approvalItems,
  gapItems,
  naacCriteria,
  nbaCriteria,
  nirfParameters,
  aiInsights,
  activityEvents,
  reportTypes,
} from '../principal-configs';

// ============ APPROVAL CENTER ============
export function ApprovalCenter() {
  const [search, setSearch] = useState('');
  const filtered = approvalItems.filter(
    (item) =>
      item.repository.toLowerCase().includes(search.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{approvalItems.filter((i) => i.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{approvalItems.filter((i) => i.status === 'in-review').length}</p>
            <p className="text-xs text-muted-foreground">In Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">8</p>
            <p className="text-xs text-muted-foreground">Approved This Month</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search approvals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{item.repository}</h4>
                    <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                      {item.priority}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Submitted by {item.submittedBy} • {item.submittedDate} • {item.type}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Forward className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ GAP ANALYSIS ============
export function GapAnalysis() {
  const [filter, setFilter] = useState<string>('all');

  const impactColors = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  };

  const filteredGaps = filter === 'all' ? gapItems : gapItems.filter((g) => g.impact === filter);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('critical')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{gapItems.filter((g) => g.impact === 'critical').length}</p>
            <p className="text-[10px] text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('high')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{gapItems.filter((g) => g.impact === 'high').length}</p>
            <p className="text-[10px] text-muted-foreground">High</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('medium')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{gapItems.filter((g) => g.impact === 'medium').length}</p>
            <p className="text-[10px] text-muted-foreground">Medium</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('all')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{gapItems.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Gaps</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {filteredGaps.map((gap) => (
          <Card key={gap.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${impactColors[gap.impact]}`}>{gap.impact}</Badge>
                  <Badge variant="outline" className="text-[10px]">{gap.category}</Badge>
                  {gap.department && <Badge variant="secondary" className="text-[10px]">{gap.department}</Badge>}
                </div>
                <span className="text-[10px] text-muted-foreground">Priority #{gap.priority}</span>
              </div>
              <p className="text-sm font-medium mb-2">{gap.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
                <div>
                  <span className="text-muted-foreground">Current:</span>
                  <p className="font-medium">{gap.currentStatus}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <p className="font-medium">{gap.target}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Owner:</span>
                  <p className="font-medium">{gap.recommendedOwner}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Timeline:</span>
                  <p className="font-medium">{gap.timeline}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Impact:</span>
                  <p className="font-medium capitalize">{gap.impact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ FRAMEWORK READINESS ============
export function FrameworkReadiness() {
  const [activeFramework, setActiveFramework] = useState('naac');

  return (
    <div className="space-y-4">
      <Tabs value={activeFramework} onValueChange={setActiveFramework}>
        <TabsList>
          <TabsTrigger value="naac">NAAC</TabsTrigger>
          <TabsTrigger value="nba">NBA</TabsTrigger>
          <TabsTrigger value="nirf">NIRF</TabsTrigger>
        </TabsList>

        <TabsContent value="naac" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">82%</p>
                <p className="text-[10px] text-muted-foreground">Overall Readiness</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">1/7</p>
                <p className="text-[10px] text-muted-foreground">Criteria Ready</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">Grade A</p>
                <p className="text-[10px] text-muted-foreground">Projected Grade</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">NAAC Criterion-wise Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {naacCriteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">C{criterion.id}. {criterion.name}</span>
                        <Badge variant="outline" className={`text-[9px] ${criterion.status === 'ready' ? 'text-green-600 border-green-500' : 'text-yellow-600 border-yellow-500'}`}>
                          {criterion.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">Wt: {criterion.weightage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Completion</span>
                          <span>{criterion.completion}%</span>
                        </div>
                        <Progress value={criterion.completion} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Evidence</span>
                          <span>{criterion.evidence}%</span>
                        </div>
                        <Progress value={criterion.evidence} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nba" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">75%</p>
                <p className="text-[10px] text-muted-foreground">Overall Readiness</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">1/7</p>
                <p className="text-[10px] text-muted-foreground">Criteria Ready</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-[10px] text-muted-foreground">Programs Eligible</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">NBA Criterion-wise Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nbaCriteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">C{criterion.id}. {criterion.name}</span>
                        <Badge variant="outline" className={`text-[9px] ${criterion.status === 'ready' ? 'text-green-600 border-green-500' : 'text-yellow-600 border-yellow-500'}`}>
                          {criterion.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">Wt: {criterion.weightage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Completion</span>
                          <span>{criterion.completion}%</span>
                        </div>
                        <Progress value={criterion.completion} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Evidence</span>
                          <span>{criterion.evidence}%</span>
                        </div>
                        <Progress value={criterion.evidence} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nirf" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">71%</p>
                <p className="text-[10px] text-muted-foreground">Overall Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">101-150</p>
                <p className="text-[10px] text-muted-foreground">Projected Band</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">5</p>
                <p className="text-[10px] text-muted-foreground">Parameters</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">NIRF Parameter-wise Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nirfParameters.map((param) => (
                  <div key={param.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{param.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Wt: {param.weightage}%</span>
                        <span className="text-xs font-semibold">{param.score}/100</span>
                      </div>
                    </div>
                    <Progress value={param.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ AI INSIGHTS ============
export function AIInsights() {
  const typeIcons = {
    forecast: TrendingUp,
    risk: AlertTriangle,
    recommendation: Lightbulb,
    opportunity: Target,
  };

  const typeColors = {
    forecast: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    risk: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
    recommendation: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    opportunity: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI-Powered Institutional Intelligence</h3>
              <p className="text-xs text-muted-foreground">Analyzing {11} repositories across {8} departments • Last updated 5 min ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold">{aiInsights.filter((i) => i.type === 'forecast').length}</p>
            <p className="text-[10px] text-muted-foreground">Forecasts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold">{aiInsights.filter((i) => i.type === 'risk').length}</p>
            <p className="text-[10px] text-muted-foreground">Risks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Lightbulb className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold">{aiInsights.filter((i) => i.type === 'recommendation').length}</p>
            <p className="text-[10px] text-muted-foreground">Recommendations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold">{aiInsights.filter((i) => i.type === 'opportunity').length}</p>
            <p className="text-[10px] text-muted-foreground">Opportunities</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {aiInsights.map((insight) => {
          const Icon = typeIcons[insight.type];
          return (
            <Card key={insight.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[insight.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold">{insight.title}</h4>
                      <Badge variant="outline" className="text-[9px]">{insight.confidence}% confidence</Badge>
                      {insight.actionable && <Badge className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Actionable</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============ EXECUTIVE REPORTS ============
export function ExecutiveReports() {
  const [generating, setGenerating] = useState<string | null>(null);

  const iconMap: Record<string, React.ElementType> = {
    'building': Shield,
    'bar-chart': FileBarChart,
    'database': CheckSquare,
    'target': Target,
    'alert-triangle': AlertTriangle,
    'trending-up': TrendingUp,
    'calendar': Calendar,
    'award': Trophy,
  };

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  const recentReports = [
    { name: 'Monthly Executive Report - Feb 2024', date: '2024-03-01', format: 'PDF' },
    { name: 'Department Performance Report - Q4', date: '2024-02-28', format: 'PDF' },
    { name: 'NAAC Readiness Assessment', date: '2024-02-25', format: 'XLSX' },
    { name: 'Gap Analysis Report', date: '2024-02-20', format: 'PDF' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Generate Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportTypes.map((report) => {
              const Icon = iconMap[report.icon] || FileBarChart;
              return (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{report.name}</p>
                      <p className="text-[10px] text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleGenerate(report.id)}
                    disabled={generating === report.id}
                  >
                    {generating === report.id ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recently Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentReports.map((report) => (
              <div key={report.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="text-xs font-medium">{report.name}</p>
                  <p className="text-[10px] text-muted-foreground">{report.date} • {report.format}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <Mail className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ ACTIVITY TIMELINE ============
export function ActivityTimeline() {
  const [filter, setFilter] = useState('all');

  const typeIcons: Record<string, React.ElementType> = {
    submitted: Forward,
    approved: Check,
    uploaded: FileBarChart,
    verified: Shield,
    'gap-closed': Target,
    'framework-updated': Trophy,
    milestone: Award,
  };

  const typeColors: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    uploaded: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    verified: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    'gap-closed': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    'framework-updated': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    milestone: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  };

  const filteredEvents = filter === 'all' ? activityEvents : activityEvents.filter((e) => e.type === filter);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'submitted', 'approved', 'uploaded', 'verified', 'gap-closed', 'milestone'].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            className="h-7 text-xs capitalize"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.replace('-', ' ')}
          </Button>
        ))}
      </div>

      <div className="space-y-0">
        {filteredEvents.map((event, idx) => {
          const Icon = typeIcons[event.type] || Activity;
          return (
            <div key={event.id} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[event.type] || 'bg-gray-100'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {idx < filteredEvents.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold">{event.title}</h4>
                  {event.department && <Badge variant="secondary" className="text-[9px]">{event.department}</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{event.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{formatTime(event.timestamp)}</span>
                  <span className="text-[10px] text-muted-foreground">• {event.actor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ PROFILE ============
export function PrincipalProfile() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Principal Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">Dr. James Wilson</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">principal@accreditpro.com</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium">Principal</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Institution</p>
                <p className="text-sm font-medium">National University</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              'View All Repositories',
              'View All Departments',
              'Approve Infrastructure Repository',
              'Approve Financial Repository',
              'Approve Examination Repository',
              'View Framework Readiness',
              'Generate Reports',
              'Monitor Institutional Performance',
              'View AI Recommendations',
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs">{perm}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Restricted Actions:</p>
              {[
                'Modify Repository Data',
                'Edit Institution Masters',
                'Upload Repository CSVs',
                'Change Repository Configuration',
                'Delete Repository Records',
              ].map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <X className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-xs text-muted-foreground">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}