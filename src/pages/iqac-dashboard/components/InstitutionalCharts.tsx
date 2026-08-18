import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart as LineChartIcon, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import type {
  DashboardTrendsDto,
  DepartmentReadinessRowDto,
  QualityObservationDto,
} from '@/services/iqac.service';

const TREND_COLORS = {
  repositoryCompletion: '#3b82f6',
  accreditationReadiness: '#8b5cf6',
  evidenceCompletion: '#d946ef',
};

const OBS_COLORS: Record<string, string> = {
  open: '#ef4444',
  'in-progress': '#f59e0b',
  resolved: '#3b82f6',
  closed: '#10b981',
};

const DEPT_BAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export function InstitutionalCharts({
  trends,
  departmentReadiness,
  observations,
}: {
  trends: DashboardTrendsDto;
  departmentReadiness: DepartmentReadinessRowDto[];
  observations: QualityObservationDto[];
}) {
  const trendData = (trends.years ?? []).map((year, i) => ({
    year,
    'Repository Completion': trends.repositoryCompletion?.[i] ?? 0,
    'Accreditation Readiness': trends.accreditationReadiness?.[i] ?? 0,
    'Evidence Completion': trends.evidenceCompletion?.[i] ?? 0,
  }));

  const statusData = (['open', 'in-progress', 'resolved', 'closed'] as const).map((s) => ({
    name: s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1),
    value: observations.filter((o) => o.status === s).length,
  }));

  const deptData = departmentReadiness.map((d) => ({
    dept: d.code,
    readiness: d.repositoryCompletion,
    nba: d.nba,
    naac: d.naac,
    nirf: d.nirf,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Repository completion trends */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-primary" />
            Repository Completion Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(value: number | string) => [`${value}%`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="Repository Completion" stroke={TREND_COLORS.repositoryCompletion} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Accreditation Readiness" stroke={TREND_COLORS.accreditationReadiness} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Evidence Completion" stroke={TREND_COLORS.evidenceCompletion} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Observation status distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            Observation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                strokeWidth={2}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={OBS_COLORS[entry.name.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department comparison */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Department Comparison — Readiness & Accreditation
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" />
              <XAxis dataKey="dept" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="readiness" name="Repository" fill={DEPT_BAR_COLORS[0]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="nba" name="NBA" fill={DEPT_BAR_COLORS[1]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="naac" name="NAAC" fill={DEPT_BAR_COLORS[2]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="nirf" name="NIRF" fill={DEPT_BAR_COLORS[3]} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
