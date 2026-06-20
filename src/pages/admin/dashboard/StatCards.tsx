import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatCard } from './mock-data';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  Building2,
  CheckCircle2,
  Users,
  FileText,
  Database,
  Clock,
  AlertTriangle,
  PieChart,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  CheckCircle2,
  Users,
  FileText,
  Database,
  Clock,
  AlertTriangle,
  PieChart,
};

const colorMap: Record<string, { bg: string; text: string; chart: string }> = {
  Building2: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', chart: '#3b82f6' },
  CheckCircle2: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', chart: '#10b981' },
  Users: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', chart: '#8b5cf6' },
  FileText: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', chart: '#f59e0b' },
  Database: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', chart: '#06b6d4' },
  Clock: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', chart: '#f97316' },
  AlertTriangle: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', chart: '#ef4444' },
  PieChart: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', chart: '#6366f1' },
};

interface StatCardsProps {
  data: StatCard[];
}

export const StatCards = ({ data }: StatCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((card) => {
        const Icon = iconMap[card.icon] || Building2;
        const colors = colorMap[card.icon] || colorMap.Building2;
        const isPositive = card.change >= 0;

        return (
          <Card
            key={card.id}
            className="relative overflow-hidden group hover:shadow-md transition-all duration-200 border-border/50"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                </div>
                <div className={cn('rounded-lg p-2.5', colors.bg)}>
                  <Icon className={cn('h-4 w-4', colors.text)} />
                </div>
              </div>

              {/* Growth Indicator */}
              <div className="flex items-center gap-1.5 mb-3">
                <div
                  className={cn(
                    'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(card.change)}%
                </div>
                <span className="text-[10px] text-muted-foreground">{card.changeLabel}</span>
              </div>

              {/* Mini Chart */}
              <div className="h-10 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={card.chartData}>
                    <defs>
                      <linearGradient id={`gradient-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.chart} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={colors.chart} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={colors.chart}
                      strokeWidth={1.5}
                      fill={`url(#gradient-${card.id})`}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};