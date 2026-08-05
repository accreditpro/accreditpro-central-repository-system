import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  FileText,
  BadgeCheck,
  Repeat,
  AlertTriangle,
  Clock,
  Upload,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

const statsCards = [
  { label: 'Total Examination Schedules', value: '8', change: '+2 this year', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
  { label: 'Published Results', value: '6', change: 'Last: Jun 2024', icon: BadgeCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  { label: 'Supplementary Examinations', value: '3', change: '2 upcoming', icon: Repeat, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800' },
  { label: 'Backlog Records', value: '57', change: '12 subjects', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800' },
  { label: 'Active Circulars', value: '4', change: '3 published', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800' },
];

const recentActivities = [
  { text: 'End Semester schedule published for Even Sem 2024-25', time: '2 hours ago', type: 'schedule' },
  { text: 'Supplementary examination results published', time: '1 day ago', type: 'result' },
  { text: 'Circular: Hall Ticket Distribution Notification issued', time: '3 days ago', type: 'circular' },
  { text: 'Backlog data imported from ERP for 6 subjects', time: '5 days ago', type: 'backlog' },
  { text: 'Result gazette uploaded for Odd Sem 2023-24', time: '1 week ago', type: 'result' },
];

const upcomingActivities = [
  { text: 'End Semester Examination - Even Sem 2024', date: 'Dec 2 - Dec 20, 2024', type: 'schedule' },
  { text: 'Supplementary Examination - Odd Sem 2024', date: 'Jan 15 - Jan 25, 2025', type: 'supplementary' },
  { text: 'Mid-Term 1 Examination - Odd Sem 2024', date: 'Feb 10 - Feb 15, 2025', type: 'schedule' },
];

const quickLinks = [
  { label: 'Create Schedule', icon: Calendar, hint: 'New examination schedule' },
  { label: 'Publish Result', icon: BadgeCheck, hint: 'Upload result gazette' },
  { label: 'Upload Circular', icon: FileText, hint: 'New examination circular' },
  { label: 'Upload Document', icon: Upload, hint: 'Supporting document' },
];

const iconVariants: Record<string, React.ElementType> = {
  schedule: Calendar, result: BadgeCheck, circular: FileText, backlog: AlertTriangle, supplementary: Repeat,
};

export function ExaminationDashboard({ academicYear }: { academicYear: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Examination Dashboard</h2>
        <p className="text-muted-foreground">Academic Year {academicYear} &mdash; Read-only overview of institutional examination activities</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className={`border-l-4 ${stat.border} hover:shadow-md transition-all duration-200`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => {
                const Icon = iconVariants[activity.type] || Clock;
                return (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">{activity.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Upcoming Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingActivities.map((activity, idx) => {
                const Icon = iconVariants[activity.type] || Calendar;
                return (
                  <div key={idx} className="p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Button key={link.label} variant="outline" className="w-full justify-between h-auto py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                      <link.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{link.label}</p>
                      <p className="text-[10px] text-muted-foreground">{link.hint}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Dashboard Purpose</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                This dashboard provides a read-only overview of institutional examination activities.
                No data entry happens from the dashboard. Use the sidebar navigation to create, edit,
                and manage records for each module. All data stored here serves as evidence for
                accreditation frameworks (NBA, NAAC, NIRF).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
