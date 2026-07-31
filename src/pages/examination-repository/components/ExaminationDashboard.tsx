import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trophy,
} from 'lucide-react';

const kpiCards = [
  {
    label: 'Active Sessions',
    value: '4',
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Courses Examined',
    value: '48',
    icon: FileText,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Students Evaluated',
    value: '2,450',
    icon: Users,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    label: 'Avg Pass %',
    value: '83%',
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    label: 'Pending Results',
    value: '6',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    label: 'Backlog Cases',
    value: '45',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    label: 'Results Published',
    value: '42',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    label: 'University Ranks',
    value: '12',
    icon: Trophy,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

const recentActivities = [
  {
    text: 'End Semester results published for B.Tech CSE Sem 4',
    time: '2 hours ago',
    type: 'success',
  },
  { text: 'Internal assessment marks verified for CS401', time: '4 hours ago', type: 'info' },
  { text: 'Supplementary exam schedule released', time: '1 day ago', type: 'info' },
  { text: 'CO attainment data uploaded for 12 courses', time: '1 day ago', type: 'success' },
  { text: '3 malpractice cases referred to committee', time: '2 days ago', type: 'warning' },
  { text: 'Backlog clearance results - 28 students cleared', time: '3 days ago', type: 'success' },
];

const examSessionSummary = [
  {
    session: 'End Sem - Even 2024',
    programs: 5,
    courses: 30,
    students: 1200,
    status: 'Results Published',
  },
  {
    session: 'Supplementary Jul 2024',
    programs: 5,
    courses: 24,
    students: 180,
    status: 'Results Published',
  },
  { session: 'End Sem - Odd 2024', programs: 5, courses: 35, students: 1250, status: 'Ongoing' },
  {
    session: 'Mid-Term 1 - Odd 2024',
    programs: 5,
    courses: 35,
    students: 1250,
    status: 'Completed',
  },
];

export function ExaminationDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Examination Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of examination activities, results, and analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Session Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Examination Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {examSessionSummary.map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{session.session}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.programs} programs • {session.courses} courses • {session.students}{' '}
                      students
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      session.status === 'Results Published'
                        ? 'bg-green-100 text-green-700'
                        : session.status === 'Ongoing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                    }
                  >
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2">
                  <div
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      activity.type === 'success'
                        ? 'bg-green-500'
                        : activity.type === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            Architect Note: Data Relationship Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-900/80 leading-relaxed">
            Every examination record is linked with:{' '}
            <strong>
              Academic Year → Program Offering → Semester → Course → Faculty → Student
            </strong>
            . This relationship must never change as future modules (OBE, NBA, NAAC, NIRF, AI
            Analytics, Institution Readiness) will consume this data directly. The Examination
            Repository references master records created by the Institution Admin and does not
            duplicate master data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
