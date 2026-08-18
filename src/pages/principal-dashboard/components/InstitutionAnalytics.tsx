import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { principalService, AnalyticsSeriesDto } from '@/services/principal.service';
import { academicYearOptions, departmentOptions } from '../principal-data';
import { FilterBar, FilterSelect } from './common';
import { Loader2, AlertTriangle } from 'lucide-react';

function ChartCard({
  title,
  subtitle,
  children,
  height = 260,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactElement;
  height?: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function InstitutionAnalytics() {
  const [year, setYear] = useState('2025-26');
  const [dept, setDept] = useState('all');
  const [analyticsSeries, setAnalyticsSeries] = useState<AnalyticsSeriesDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    principalService
      .getAnalytics()
      .then(data => {
        if (!cancelled) setAnalyticsSeries(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setAnalyticsSeries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading institution analytics...
      </div>
    );
  }

  if (analyticsSeries.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Unable to load analytics data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-3">
          <FilterBar>
            <FilterSelect
              value={year}
              onValueChange={setYear}
              options={academicYearOptions}
              placeholder="Academic Year"
            />
            <FilterSelect
              value={dept}
              onValueChange={setDept}
              options={departmentOptions}
              placeholder="Department"
            />
          </FilterBar>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Repository Completion Trend"
          subtitle="Institution-wide % by academic year"
        >
          <AreaChart data={analyticsSeries} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="repositoryCompletion"
              name="Repository Completion"
              stroke="#6366f1"
              fill="url(#repGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartCard>

        <ChartCard
          title="Accreditation Readiness Trend"
          subtitle="NAAC/NBA/NIRF weighted readiness"
        >
          <LineChart data={analyticsSeries} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="accreditationReadiness"
              name="Accreditation"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="evidenceCompletion"
              name="Evidence"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Faculty & Student Growth" subtitle="Headcount by academic year">
          <LineChart data={analyticsSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="students"
              name="Students"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="faculty"
              name="Faculty"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Publications Trend" subtitle="Research output per year">
          <BarChart data={analyticsSeries} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              cursor={{ fill: 'currentColor', opacity: 0.06 }}
            />
            <Bar dataKey="publications" name="Publications" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Placement Trend" subtitle="Placement % per year">
          <AreaChart data={analyticsSeries} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="plcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="placements"
              name="Placement %"
              stroke="#f43f5e"
              fill="url(#plcGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Infrastructure Readiness Growth" subtitle="Facility readiness % per year">
          <BarChart data={analyticsSeries} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              cursor={{ fill: 'currentColor', opacity: 0.06 }}
            />
            <Bar
              dataKey="infrastructure"
              name="Infrastructure"
              fill="#0ea5e9"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
