import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  InstitutionGrowthData,
  InstitutionDistributionData,
  RepositoryCompletionData,
  ActivityHeatmapData,
} from './types';
import { cn } from '@/lib/utils';

interface InstitutionGrowthChartProps {
  data: InstitutionGrowthData[];
}

export function InstitutionGrowthChart({ data }: InstitutionGrowthChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Institution Growth</CardTitle>
          <CardDescription>Monthly growth of institutions and users over the year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInstitutions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="institutions"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInstitutions)"
                  name="Institutions"
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface InstitutionDistributionChartProps {
  data: InstitutionDistributionData[];
}

export function InstitutionDistributionChart({ data }: InstitutionDistributionChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Institution Distribution</CardTitle>
          <CardDescription>Breakdown by institution category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface RepositoryCompletionChartProps {
  data: RepositoryCompletionData[];
}

export function RepositoryCompletionChart({ data }: RepositoryCompletionChartProps) {
  const radarData = [
    { subject: 'Academic', ...Object.fromEntries(data.map((d) => [d.institution, d.academic])) },
    { subject: 'Faculty', ...Object.fromEntries(data.map((d) => [d.institution, d.faculty])) },
    { subject: 'Student', ...Object.fromEntries(data.map((d) => [d.institution, d.student])) },
    { subject: 'Research', ...Object.fromEntries(data.map((d) => [d.institution, d.research])) },
    { subject: 'Infrastructure', ...Object.fromEntries(data.map((d) => [d.institution, d.infrastructure])) },
  ];

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Repository Completion by Institution</CardTitle>
          <CardDescription>Category-wise completion percentage across top institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-border/50" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                {data.slice(0, 4).map((inst, i) => (
                  <Radar
                    key={inst.institution}
                    name={inst.institution}
                    dataKey={inst.institution}
                    stroke={colors[i]}
                    fill={colors[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ActivityHeatmapProps {
  data: ActivityHeatmapData[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (value: number) => {
    if (value < 15) return 'bg-primary/5';
    if (value < 30) return 'bg-primary/15';
    if (value < 50) return 'bg-primary/30';
    if (value < 70) return 'bg-primary/50';
    if (value < 85) return 'bg-primary/70';
    return 'bg-primary/90';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Activity Heatmap</CardTitle>
          <CardDescription>Platform activity distribution by day and hour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex items-center mb-1 pl-10">
                {hours.filter((h) => h % 3 === 0).map((hour) => (
                  <span
                    key={hour}
                    className="text-[10px] text-muted-foreground"
                    style={{ width: `${100 / 8}%` }}
                  >
                    {hour}:00
                  </span>
                ))}
              </div>
              {/* Heatmap grid */}
              {days.map((day) => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-muted-foreground w-8 shrink-0">{day}</span>
                  <div className="flex gap-[2px] flex-1">
                    {hours.map((hour) => {
                      const item = data.find((d) => d.day === day && d.hour === hour);
                      const value = item?.value || 0;
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={cn(
                            'flex-1 h-5 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-primary/50',
                            getColor(value)
                          )}
                          title={`${day} ${hour}:00 - ${value} activities`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center justify-end gap-1 mt-3">
                <span className="text-[10px] text-muted-foreground mr-1">Less</span>
                <div className="h-3 w-3 rounded-sm bg-primary/5" />
                <div className="h-3 w-3 rounded-sm bg-primary/15" />
                <div className="h-3 w-3 rounded-sm bg-primary/30" />
                <div className="h-3 w-3 rounded-sm bg-primary/50" />
                <div className="h-3 w-3 rounded-sm bg-primary/70" />
                <div className="h-3 w-3 rounded-sm bg-primary/90" />
                <span className="text-[10px] text-muted-foreground ml-1">More</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface TopInstitutionsChartProps {
  data: { name: string; users: number; documents: number; completion: number }[];
}

export function TopInstitutionsChart({ data }: TopInstitutionsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Card className="border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Top Institutions</CardTitle>
          <CardDescription>By document uploads and user count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(0, 6)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="documents" fill="#6366f1" radius={[4, 4, 0, 0]} name="Documents" />
                <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}