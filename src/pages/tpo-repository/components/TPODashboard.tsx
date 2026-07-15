import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Briefcase,
  UserCheck,
  BookOpen,
  Rocket,
  Presentation,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface KPICard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const kpiCards: KPICard[] = [
  {
    title: 'Active Recruiters',
    value: '85+',
    change: '+12 new this year',
    changeType: 'positive',
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Placement Offers',
    value: '320',
    change: '90% acceptance rate',
    changeType: 'positive',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: 'Internships',
    value: '245',
    change: '68 converted to FTE',
    changeType: 'positive',
    icon: <UserCheck className="h-5 w-5" />,
    color: 'bg-cyan-500/10 text-cyan-600',
  },
  {
    title: 'Higher Education',
    value: '36',
    change: '12 international admits',
    changeType: 'positive',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: 'Startups Incubated',
    value: '14',
    change: '₹1.2 Cr funding raised',
    changeType: 'positive',
    icon: <Rocket className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    title: 'Training Programs',
    value: '28',
    change: '1,050+ students trained',
    changeType: 'positive',
    icon: <Presentation className="h-5 w-5" />,
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    title: 'Placement Rate',
    value: '82%',
    change: '+5% from last year',
    changeType: 'positive',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Avg. Package',
    value: '₹7.2 LPA',
    change: '+15% YoY growth',
    changeType: 'positive',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'bg-amber-500/10 text-amber-600',
  },
];

interface RecentActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'placement' | 'internship' | 'training' | 'recruiter' | 'startup';
}

const recentActivities: RecentActivity[] = [
  { id: '1', action: 'New Placement Offer', details: 'Google offered ₹32 LPA to Divya Sharma (CS) - SDE-1 role', timestamp: '1 hour ago', type: 'placement' },
  { id: '2', action: 'Recruiter Registered', details: 'Flipkart added as new campus recruiter for 2025 batch', timestamp: '3 hours ago', type: 'recruiter' },
  { id: '3', action: 'Training Completed', details: 'AWS Cloud Practitioner certification - 120 students certified', timestamp: '1 day ago', type: 'training' },
  { id: '4', action: 'Internship Conversion', details: 'Karthik Rajan received PPO from Microsoft - ₹42 LPA', timestamp: '2 days ago', type: 'internship' },
  { id: '5', action: 'Startup Funded', details: 'EduLearn AI raised ₹25L seed funding from angel investors', timestamp: '3 days ago', type: 'startup' },
  { id: '6', action: 'Placement Drive', details: 'TCS campus drive completed - 45 students selected', timestamp: '4 days ago', type: 'placement' },
  { id: '7', action: 'Mock Interview', details: 'Industry mock interviews conducted for 200 students', timestamp: '5 days ago', type: 'training' },
  { id: '8', action: 'Higher Education', details: 'Rohan Desai admitted to Stanford MS (AI/ML) with full scholarship', timestamp: '1 week ago', type: 'placement' },
];

const getActivityColor = (type: string) => {
  switch (type) {
    case 'placement': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'internship': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
    case 'training': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'recruiter': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'startup': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export function TPODashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.changeType === 'positive' && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />}
                    <span className={`text-xs ${
                      kpi.changeType === 'positive' ? 'text-emerald-600' :
                      kpi.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placement Health & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Health Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Placement Health Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Overall Placement Rate', value: 82, color: 'bg-emerald-500' },
              { label: 'Recruiter Engagement', value: 90, color: 'bg-blue-500' },
              { label: 'Internship Conversion', value: 68, color: 'bg-cyan-500' },
              { label: 'Training Completion', value: 95, color: 'bg-purple-500' },
              { label: 'Higher Education Admits', value: 45, color: 'bg-orange-500' },
              { label: 'Startup Success Rate', value: 72, color: 'bg-pink-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0.5 shrink-0 ${getActivityColor(activity.type)}`}>
                    {activity.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}