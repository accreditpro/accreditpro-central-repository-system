import { motion } from 'framer-motion';
import { Building2, Users, FileText, Database, CheckCircle2, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnalyticsCard } from './types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Users,
  FileText,
  Database,
  CheckCircle2,
  PieChart,
};

const colorMap: Record<string, string> = {
  Building2: 'from-indigo-500 to-indigo-600',
  Users: 'from-violet-500 to-violet-600',
  FileText: 'from-pink-500 to-pink-600',
  Database: 'from-amber-500 to-amber-600',
  CheckCircle2: 'from-emerald-500 to-emerald-600',
  PieChart: 'from-cyan-500 to-cyan-600',
};

interface StatCardsProps {
  cards: AnalyticsCard[];
}

export function StatCards({ cards }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = iconMap[card.icon] || Building2;
        const gradient = colorMap[card.icon] || 'from-gray-500 to-gray-600';
        const isPositive = card.change >= 0;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isPositive ? 'text-emerald-500' : 'text-red-500'
                        )}
                      >
                        {isPositive ? '+' : ''}{card.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">{card.changeLabel}</span>
                    </div>
                  </div>
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', gradient)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
              <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r', gradient, 'opacity-60')} />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}