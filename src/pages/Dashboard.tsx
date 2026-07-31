import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserRole } from '@/types/auth.types';
import { cn } from '@/lib/utils';
import {
  Building2,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  UserPlus,
  FolderOpen,
  Calendar,
  Database,
  ClipboardCheck,
  Eye,
  MoreHorizontal,
} from 'lucide-react';

// Mock data for Institution Admin Dashboard
const departmentCompletionData = [
  { name: 'Computer Science', completion: 92 },
  { name: 'Electronics', completion: 85 },
  { name: 'Mechanical', completion: 78 },
  { name: 'Civil', completion: 72 },
  { name: 'Mathematics', completion: 68 },
  { name: 'Physics', completion: 65 },
  { name: 'Chemistry', completion: 60 },
  { name: 'English', completion: 55 },
];

const departmentContributionData = [
  { name: 'Computer Science', value: 28, color: '#6366f1' },
  { name: 'Electronics', value: 22, color: '#8b5cf6' },
  { name: 'Mechanical', value: 18, color: '#ec4899' },
  { name: 'Civil', value: 14, color: '#f59e0b' },
  { name: 'Mathematics', value: 10, color: '#10b981' },
  { name: 'Others', value: 8, color: '#06b6d4' },
];

const recentUploads = [
  {
    id: '1',
    name: 'Faculty Research Publications 2024.xlsx',
    department: 'Computer Science',
    user: 'Dr. Anita Sharma',
    time: '10 minutes ago',
    size: '2.4 MB',
    status: 'approved',
  },
  {
    id: '2',
    name: 'Student Placement Report Q4.pdf',
    department: 'Electronics',
    user: 'Prof. Rajesh Kumar',
    time: '25 minutes ago',
    size: '1.8 MB',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Infrastructure Audit Report.docx',
    department: 'Civil',
    user: 'Dr. Priya Nair',
    time: '1 hour ago',
    size: '3.2 MB',
    status: 'approved',
  },
  {
    id: '4',
    name: 'Academic Calendar 2024-25.pdf',
    department: 'Administration',
    user: 'Mr. Deepak Joshi',
    time: '2 hours ago',
    size: '890 KB',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Lab Equipment Inventory.xlsx',
    department: 'Mechanical',
    user: 'Dr. Suresh Patel',
    time: '3 hours ago',
    size: '1.5 MB',
    status: 'approved',
  },
];

const recentActivities = [
  {
    id: '1',
    icon: CheckCircle2,
    text: 'NAAC SSR Criterion 1 completed by Computer Science',
    time: '15 minutes ago',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: '2',
    icon: Upload,
    text: 'Dr. Rajesh Kumar uploaded placement data',
    time: '30 minutes ago',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    id: '3',
    icon: AlertCircle,
    text: 'Pending review: Annual Quality Report from Physics',
    time: '1 hour ago',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    id: '4',
    icon: UserPlus,
    text: 'New coordinator added for Mathematics department',
    time: '2 hours ago',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    id: '5',
    icon: TrendingUp,
    text: 'Repository completion increased to 72.4%',
    time: '3 hours ago',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    id: '6',
    icon: Clock,
    text: 'Accreditation submission deadline: 30 days remaining',
    time: '4 hours ago',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    id: '7',
    icon: FileText,
    text: 'New template assigned: Student Feedback Form',
    time: '5 hours ago',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
];

const statCards = [
  {
    title: 'Departments',
    value: '24',
    change: 2,
    changeLabel: 'new this year',
    icon: Building2,
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'Users',
    value: '156',
    change: 8.2,
    changeLabel: 'vs last month',
    icon: Users,
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    title: 'Repository Completion',
    value: '72.4%',
    change: 5.3,
    changeLabel: 'vs last month',
    icon: Database,
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Documents Uploaded',
    value: '2,847',
    change: 12.5,
    changeLabel: 'vs last month',
    icon: FileText,
    gradient: 'from-pink-500 to-pink-600',
  },
  {
    title: 'Pending Reviews',
    value: '18',
    change: -3,
    changeLabel: 'vs last week',
    icon: Eye,
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    title: 'Pending Approvals',
    value: '7',
    change: -2,
    changeLabel: 'vs last week',
    icon: ClipboardCheck,
    gradient: 'from-cyan-500 to-cyan-600',
  },
];

const quickActions = [
  {
    label: 'Create Department Coordinator',
    icon: UserPlus,
    color: 'from-indigo-500 to-indigo-600',
    href: '/app/users',
  },
  {
    label: 'Manage Departments',
    icon: Building2,
    color: 'from-violet-500 to-violet-600',
    href: '/app/departments',
  },
  {
    label: 'Manage Academic Years',
    icon: Calendar,
    color: 'from-emerald-500 to-emerald-600',
    href: '/app/settings',
  },
  {
    label: 'View Repository',
    icon: FolderOpen,
    color: 'from-pink-500 to-pink-600',
    href: '/app/documents',
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTimeRange] = useState('This Month');

  const getRoleGreeting = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
        return 'Platform Overview';
      case UserRole.INSTITUTION_ADMIN:
        return 'Institution Overview';
      case UserRole.IQAC_COORDINATOR:
        return 'Quality Assurance Dashboard';
      case UserRole.PRINCIPAL:
        return 'Academic Overview';
      case UserRole.DEPARTMENT_COORDINATOR:
        return 'Department Overview';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getRoleGreeting()} • {selectedTimeRange}
          </p>
        </div>
        <Badge variant="outline" className="w-fit text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: 2 minutes ago
        </Badge>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {card.title}
                      </p>
                      <p className="text-xl font-bold tracking-tight">{card.value}</p>
                      <div className="flex items-center gap-1">
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={cn(
                            'text-[10px] font-medium',
                            isPositive ? 'text-emerald-500' : 'text-red-500'
                          )}
                        >
                          {isPositive ? '+' : ''}
                          {card.change}
                          {typeof card.change === 'number' && card.change % 1 !== 0 ? '%' : ''}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {card.changeLabel}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                        card.gradient
                      )}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r',
                    card.gradient,
                    'opacity-60'
                  )}
                />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-md transition-all duration-200 hover:border-primary/30"
                    onClick={() => navigate(action.href)}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm',
                        action.color
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {action.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Department Repository Completion */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Department Repository Completion
              </CardTitle>
              <CardDescription>
                Percentage of repository data filled by each department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentCompletionData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border/50"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Completion']}
                    />
                    <Bar dataKey="completion" radius={[0, 4, 4, 0]} fill="#6366f1">
                      {departmentCompletionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.completion >= 80
                              ? '#10b981'
                              : entry.completion >= 60
                                ? '#6366f1'
                                : '#f59e0b'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Contribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Department Contribution</CardTitle>
              <CardDescription>Document uploads by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentContributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {departmentContributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Contribution']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={value => (
                        <span className="text-[11px] text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Uploads & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Uploads</CardTitle>
                  <CardDescription>Latest documents uploaded to the repository</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {recentUploads.map(upload => (
                  <div
                    key={upload.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                      <FileText className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{upload.user}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{upload.department}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-muted-foreground">{upload.size}</span>
                        <span className="text-[11px] text-muted-foreground">•</span>
                        <span className="text-[11px] text-muted-foreground">{upload.time}</span>
                      </div>
                    </div>
                    <Badge
                      variant={upload.status === 'approved' ? 'default' : 'secondary'}
                      className={cn(
                        'text-[10px] shrink-0',
                        upload.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                      )}
                    >
                      {upload.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
                  <CardDescription>Latest activities across all departments</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          activity.bg
                        )}
                      >
                        <Icon className={cn('h-4 w-4', activity.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
