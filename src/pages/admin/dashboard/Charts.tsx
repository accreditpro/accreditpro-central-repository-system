import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type {
  InstitutionGrowthData,
  CategoryDistributionData,
  RepositoryCompletionData,
  TopInstitutionData,
} from './types';
import { Badge } from '@/components/ui/badge';

export const InstitutionGrowthChart = ({ data }: { data: InstitutionGrowthData[] }) => {
  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Institution Growth</CardTitle>
            <CardDescription className="text-xs">
              Monthly institution registration and activity trends
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Institution Growth</CardTitle>
            <CardDescription className="text-xs">
              Monthly institution registration and activity trends
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium">
            Last 12 months
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#totalGradient)"
              />
              <Area
                type="monotone"
                dataKey="active"
                name="Active"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#activeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const CategoryDistributionChart = ({ data }: { data: CategoryDistributionData[] }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
            <CardDescription className="text-xs">Institutions by academic category</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
            <CardDescription className="text-xs">Institutions by academic category</CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium">
            {total} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || `hsl(${210 + index * 30}, 70%, 50%)`}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number, name: string) => [`${value} institutions`, name]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const RepositoryCompletionChart = ({ data }: { data: RepositoryCompletionData[] }) => {
  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Repository Completion Trend</CardTitle>
            <CardDescription className="text-xs">Weekly completion rate vs target</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Repository Completion Trend</CardTitle>
            <CardDescription className="text-xs">Weekly completion rate vs target</CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium">
            Last 8 weeks
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[50, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`${value}%`]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="completion"
                name="Completion"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'hsl(var(--chart-1))' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const TopInstitutionsChart = ({ institutions }: { institutions: TopInstitutionData[] }) => {
  const data = institutions.slice(0, 5).map(inst => ({
    name: inst.name.length > 15 ? inst.name.slice(0, 15) + '…' : inst.name,
    score: inst.repositoryCompletion,
  }));

  if (institutions.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Top Active Institutions</CardTitle>
            <CardDescription className="text-xs">By repository completion score</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Top Active Institutions</CardTitle>
            <CardDescription className="text-xs">By repository completion score</CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium">
            Top 5
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`${value}%`, 'Completion']}
              />
              <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
