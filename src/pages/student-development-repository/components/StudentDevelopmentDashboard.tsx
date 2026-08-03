import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Shield,
  Trophy,
  Music,
  HandHeart,
  Users,
  Layers,
  Award,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const kpiCards = [
  { label: 'NSS Volunteers', value: '430', change: '+12%', icon: Heart, color: 'text-red-500' },
  { label: 'NCC Cadets', value: '260', change: '+8%', icon: Shield, color: 'text-blue-600' },
  { label: 'Sports Medals', value: '47', change: '+15%', icon: Trophy, color: 'text-amber-500' },
  { label: 'Cultural Events', value: '32', change: '+20%', icon: Music, color: 'text-purple-500' },
  {
    label: 'Extension Activities',
    value: '56',
    change: '+10%',
    icon: HandHeart,
    color: 'text-green-500',
  },
  { label: 'Active Clubs', value: '18', change: '+3', icon: Layers, color: 'text-indigo-500' },
  { label: 'Student Awards', value: '85', change: '+22%', icon: Award, color: 'text-orange-500' },
  {
    label: 'Events Organized',
    value: '124',
    change: '+18%',
    icon: Calendar,
    color: 'text-teal-500',
  },
];

const recentActivities = [
  {
    title: 'Blood Donation Camp conducted',
    date: '2 days ago',
    type: 'Community Outreach',
    status: 'completed',
  },
  {
    title: 'IEEE Workshop on IoT',
    date: '3 days ago',
    type: 'Student Chapter',
    status: 'completed',
  },
  {
    title: 'Inter-College Cricket Tournament',
    date: '5 days ago',
    type: 'Sports',
    status: 'completed',
  },
  {
    title: 'NSS Special Camp - Village Adoption',
    date: '1 week ago',
    type: 'NSS',
    status: 'completed',
  },
  {
    title: 'Annual Cultural Fest Planning',
    date: '1 week ago',
    type: 'Cultural',
    status: 'in-progress',
  },
  {
    title: 'NCC Republic Day Camp Selection',
    date: '2 weeks ago',
    type: 'NCC',
    status: 'completed',
  },
  { title: 'Coding Club Hackathon 2024', date: '2 weeks ago', type: 'Clubs', status: 'completed' },
  {
    title: 'National Science Day Celebration',
    date: '3 weeks ago',
    type: 'Events',
    status: 'in-progress',
  },
];

const repositoryHealth = [
  { module: 'NSS Records', completion: 92, records: 48 },
  { module: 'NCC Records', completion: 88, records: 35 },
  { module: 'Sports Activities', completion: 85, records: 67 },
  { module: 'Cultural Activities', completion: 78, records: 42 },
  { module: 'Extension Activities', completion: 90, records: 56 },
  { module: 'Community Outreach', completion: 82, records: 38 },
  { module: 'Clubs & Societies', completion: 95, records: 18 },
  { module: 'Student Chapters', completion: 87, records: 12 },
  { module: 'Student Achievements', completion: 75, records: 85 },
  { module: 'Student Awards', completion: 80, records: 45 },
  { module: 'Events', completion: 70, records: 124 },
];

export function StudentDevelopmentDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Student Development Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of student activities, achievements, and development programs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <Badge variant="secondary" className="text-xs font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {kpi.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Repository Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {repositoryHealth.map(item => (
                <div key={item.module} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{item.module}</span>
                      <span className="text-xs text-muted-foreground">{item.records} records</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.completion >= 90
                            ? 'bg-green-500'
                            : item.completion >= 75
                              ? 'bg-blue-500'
                              : item.completion >= 60
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${item.completion}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold w-10 text-right">{item.completion}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {recentActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {activity.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs py-0 px-1.5">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Annual Summary (2023-24)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <Users className="h-5 w-5 mx-auto text-red-500 mb-1" />
              <div className="text-lg font-bold">5,200</div>
              <p className="text-xs text-muted-foreground">Total Beneficiaries</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Heart className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <div className="text-lg font-bold">280</div>
              <p className="text-xs text-muted-foreground">Blood Units Collected</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <HandHeart className="h-5 w-5 mx-auto text-green-500 mb-1" />
              <div className="text-lg font-bold">2,400</div>
              <p className="text-xs text-muted-foreground">Service Hours</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <Trophy className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <div className="text-lg font-bold">47</div>
              <p className="text-xs text-muted-foreground">Medals Won</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <Award className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <div className="text-lg font-bold">85</div>
              <p className="text-xs text-muted-foreground">Awards Received</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20">
              <Calendar className="h-5 w-5 mx-auto text-teal-500 mb-1" />
              <div className="text-lg font-bold">124</div>
              <p className="text-xs text-muted-foreground">Events Organized</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
