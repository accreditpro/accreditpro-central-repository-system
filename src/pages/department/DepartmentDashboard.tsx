import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { departmentStats, uploadHistory, missingRecords } from './mock-data';
import {
  Users,
  BookOpen,
  FlaskConical,
  FileText,
  Eye,
  Database,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowRight,
} from 'lucide-react';

interface DepartmentDashboardProps {
  onNavigate: (tab: string) => void;
}

const statCards = [
  { key: 'facultyRecords', title: 'Faculty Records', icon: Users, gradient: 'from-indigo-500 to-indigo-600', change: 3, changeLabel: 'new this semester' },
  { key: 'studentRecords', title: 'Student Records', icon: BookOpen, gradient: 'from-violet-500 to-violet-600', change: 12.4, changeLabel: 'vs last year' },
  { key: 'researchRecords', title: 'Research Records', icon: FlaskConical, gradient: 'from-emerald-500 to-emerald-600', change: 18, changeLabel: 'new publications' },
  { key: 'documentsUploaded', title: 'Documents Uploaded', icon: FileText, gradient: 'from-pink-500 to-pink-600', change: 24, changeLabel: 'this month' },
  { key: 'pendingReviews', title: 'Pending Reviews', icon: Eye, gradient: 'from-amber-500 to-amber-600', change: -2, changeLabel: 'vs last week' },
  { key: 'repositoryCompletion', title: 'Repository Completion', icon: Database, gradient: 'from-cyan-500 to-cyan-600', change: 5.3, changeLabel: 'improvement' },
];

export const DepartmentDashboard = ({ onNavigate }: DepartmentDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const value = departmentStats[card.key as keyof typeof departmentStats];
          const isPositive = card.change >= 0;
          const displayValue = card.key === 'repositoryCompletion' ? `${value}%` : String(value);

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {card.title}
                      </p>
                      <p className="text-xl font-bold tracking-tight">{displayValue}</p>
                      <div className="flex items-center gap-1">
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={cn('text-[10px] font-medium', isPositive ? 'text-emerald-500' : 'text-red-500')}>
                          {isPositive ? '+' : ''}{card.change}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{card.changeLabel}</span>
                      </div>
                    </div>
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform', card.gradient)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
                <div className={cn('absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60', card.gradient)} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Repository Completion Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold">Overall Repository Completion</h3>
                <p className="text-xs text-muted-foreground">Data repository filling status for NAAC accreditation</p>
              </div>
              <span className="text-2xl font-bold text-primary">{departmentStats.repositoryCompletion}%</span>
            </div>
            <Progress value={departmentStats.repositoryCompletion} className="h-3 rounded-full" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-muted-foreground">Target: 100% by Jan 31, 2025</span>
              <span className="text-[11px] text-emerald-500 font-medium">On Track</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Upload Faculty Data', icon: Upload, tab: 'upload', color: 'text-indigo-500 bg-indigo-500/10' },
                { label: 'View Academic Records', icon: BookOpen, tab: 'academic', color: 'text-violet-500 bg-violet-500/10' },
                { label: 'Add Research Publication', icon: FlaskConical, tab: 'research', color: 'text-emerald-500 bg-emerald-500/10' },
                { label: 'Check Analytics', icon: TrendingUp, tab: 'analytics', color: 'text-pink-500 bg-pink-500/10' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-between h-11 px-3 hover:bg-muted/50"
                    onClick={() => onNavigate(action.tab)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', action.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Missing Records Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Attention Required</CardTitle>
                  <CardDescription>Missing records and upcoming deadlines</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                  {missingRecords.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {missingRecords.slice(0, 5).map((record, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <AlertTriangle className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      record.priority === 'high' ? 'text-red-500' : record.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{record.item}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {record.category}
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
      </div>

      {/* Recent Upload History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Uploads</CardTitle>
                <CardDescription>Latest CSV uploads and their approval status</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => onNavigate('upload')}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadHistory.slice(0, 4).map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                    <FileText className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{upload.recordsCount} records</span>
                      <span className="text-[11px] text-muted-foreground">•</span>
                      <span className="text-[11px] text-muted-foreground">{upload.uploadedAt}</span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px] shrink-0',
                      upload.status === 'approved' && 'bg-emerald-500/10 text-emerald-600',
                      upload.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                      upload.status === 'rejected' && 'bg-red-500/10 text-red-600',
                    )}
                  >
                    {upload.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {upload.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {upload.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};