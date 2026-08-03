import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileCheck,
  GraduationCap,
  Heart,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
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
    title: 'Total Budget',
    value: '₹18.5 Cr',
    change: '+8.2% from last year',
    changeType: 'positive',
    icon: <PieChart className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Total Revenue',
    value: '₹63.3 Cr',
    change: '+12.5% YoY',
    changeType: 'positive',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: 'Total Expenditure',
    value: '₹10.5 Cr',
    change: '56.8% utilized',
    changeType: 'neutral',
    icon: <TrendingDown className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    title: 'Research Funding',
    value: '₹9.0 Cr',
    change: '4 active projects',
    changeType: 'positive',
    icon: <IndianRupee className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: 'Scholarships Disbursed',
    value: '₹82.5 L',
    change: '205 beneficiaries',
    changeType: 'positive',
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'bg-cyan-500/10 text-cyan-600',
  },
  {
    title: 'Endowments Value',
    value: '₹19.9 Cr',
    change: '4 active endowments',
    changeType: 'positive',
    icon: <Heart className="h-5 w-5" />,
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    title: 'Audit Compliance',
    value: '92%',
    change: 'Last audit: Clean',
    changeType: 'positive',
    icon: <FileCheck className="h-5 w-5" />,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Financial Assets',
    value: '₹55.0 Cr',
    change: '₹4.08 Cr annual income',
    changeType: 'positive',
    icon: <Landmark className="h-5 w-5" />,
    color: 'bg-amber-500/10 text-amber-600',
  },
];

interface RecentActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'income' | 'expense' | 'audit' | 'scholarship' | 'investment';
}

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    action: 'Budget Revised',
    details: 'Library budget increased by ₹1L for e-journal subscriptions',
    timestamp: '2 hours ago',
    type: 'expense',
  },
  {
    id: '2',
    action: 'Scholarship Disbursed',
    details: 'Merit Excellence Award disbursed to 50 students - ₹12.5L',
    timestamp: '5 hours ago',
    type: 'scholarship',
  },
  {
    id: '3',
    action: 'Audit Completed',
    details: 'Internal audit Q2 completed with 88% compliance score',
    timestamp: '1 day ago',
    type: 'audit',
  },
  {
    id: '4',
    action: 'Grant Received',
    details: 'DST grant installment received - ₹8L for AI research project',
    timestamp: '2 days ago',
    type: 'income',
  },
  {
    id: '5',
    action: 'FD Renewed',
    details: 'Corpus Fund FD renewed at 7.5% for 3 years',
    timestamp: '3 days ago',
    type: 'investment',
  },
  {
    id: '6',
    action: 'Donation Received',
    details: 'Alumni batch 1995 donated ₹5L for sports infrastructure',
    timestamp: '4 days ago',
    type: 'income',
  },
  {
    id: '7',
    action: 'Expenditure Approved',
    details: 'Server equipment purchase approved - ₹4.5L',
    timestamp: '5 days ago',
    type: 'expense',
  },
  {
    id: '8',
    action: 'UC Submitted',
    details: 'Utilization certificate submitted for CSIR project',
    timestamp: '1 week ago',
    type: 'audit',
  },
];

const getActivityColor = (type: string) => {
  switch (type) {
    case 'income':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'expense':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'audit':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'scholarship':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'investment':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export function FinanceDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.changeType === 'positive' && (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                    {kpi.changeType === 'negative' && (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
                    )}
                    <span
                      className={`text-xs ${
                        kpi.changeType === 'positive'
                          ? 'text-emerald-600'
                          : kpi.changeType === 'negative'
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Health Summary & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Health Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Budget Utilization', value: 70, color: 'bg-blue-500' },
              { label: 'Revenue Collection', value: 85, color: 'bg-emerald-500' },
              { label: 'Expenditure Control', value: 78, color: 'bg-orange-500' },
              { label: 'Audit Compliance', value: 92, color: 'bg-green-500' },
              { label: 'Asset Growth', value: 88, color: 'bg-purple-500' },
              { label: 'Scholarship Coverage', value: 65, color: 'bg-cyan-500' },
            ].map(item => (
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
              {recentActivities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0.5 shrink-0 ${getActivityColor(activity.type)}`}
                  >
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
