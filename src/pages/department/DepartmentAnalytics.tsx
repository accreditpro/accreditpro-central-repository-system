import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { completionByCategory, missingRecords, missingDocuments } from './mock-data';
import {
  AlertTriangle,
  Clock,
  FileX,
  TrendingUp,
  Target,
  CheckCircle2,
} from 'lucide-react';

export const DepartmentAnalytics = () => {
  const overallCompletion = Math.round(
    completionByCategory.reduce((sum, c) => sum + c.completion, 0) / completionByCategory.length
  );

  return (
    <div className="space-y-6">
      {/* Overall Completion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Department Completion</h2>
                  <p className="text-sm text-muted-foreground">Overall repository data filling status</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{overallCompletion}%</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium">+5.3% this month</span>
                </div>
              </div>
            </div>
            <Progress value={overallCompletion} className="h-3 mt-4 rounded-full" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-muted-foreground">Target: 100% by Jan 31, 2025</span>
              <span className="text-[11px] font-medium text-amber-600">21.5% remaining</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category-wise Completion Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Category-wise Completion</CardTitle>
            <CardDescription>Repository completion percentage by data category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis dataKey="category" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, _name: string, props: { payload: { filled: number; total: number } }) => [
                      `${value}% (${props.payload.filled}/${props.payload.total} items)`,
                      'Completion',
                    ]}
                  />
                  <Bar dataKey="completion" radius={[0, 4, 4, 0]}>
                    {completionByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.completion >= 85 ? '#10b981' : entry.completion >= 65 ? '#6366f1' : entry.completion >= 50 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3">
              {[
                { color: 'bg-emerald-500', label: '≥85%' },
                { color: 'bg-indigo-500', label: '65-84%' },
                { color: 'bg-amber-500', label: '50-64%' },
                { color: 'bg-red-500', label: '<50%' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={cn('h-2.5 w-2.5 rounded-sm', item.color)} />
                  <span className="text-[11px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Missing Records & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Missing Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Missing Records</CardTitle>
                  <CardDescription>Data entries that need to be filled</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-red-500/10 text-red-600 text-xs">
                  {missingRecords.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {missingRecords.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <AlertTriangle className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      record.priority === 'high' ? 'text-red-500' : record.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{record.item}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{record.category}</Badge>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-1.5 py-0',
                            record.priority === 'high' && 'bg-red-500/10 text-red-600',
                            record.priority === 'medium' && 'bg-amber-500/10 text-amber-600',
                            record.priority === 'low' && 'bg-blue-500/10 text-blue-600',
                          )}
                        >
                          {record.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {record.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Missing Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Missing Documents</CardTitle>
                  <CardDescription>Required documents yet to be uploaded</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 text-xs">
                  {missingDocuments.length} docs
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {missingDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <FileX className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{doc.category}</Badge>
                        {doc.required && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-600">
                            Required
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {doc.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Completion Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Detailed Category Breakdown</CardTitle>
            <CardDescription>Items filled vs total required for each category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {completionByCategory.map((cat) => (
                <div key={cat.category} className="p-3 rounded-lg border border-border/50 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium truncate">{cat.category}</span>
                    <span className={cn(
                      'text-xs font-bold',
                      cat.completion >= 85 ? 'text-emerald-600' : cat.completion >= 65 ? 'text-indigo-600' : 'text-amber-600'
                    )}>
                      {cat.completion}%
                    </span>
                  </div>
                  <Progress value={cat.completion} className="h-2 mb-1.5" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{cat.filled}/{cat.total} items</span>
                    {cat.completion === 100 && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};