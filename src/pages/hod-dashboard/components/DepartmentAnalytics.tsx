import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyticsData, yearlyTrends } from '../hod-configs';
import {
  Users,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  FileText,
  Lightbulb,
  FolderKanban,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

export function DepartmentAnalytics() {
  const statsCards = [
    {
      label: 'Total Faculty',
      value: analyticsData.facultyCount,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      trend: '+3',
      trendUp: true,
    },
    {
      label: 'Total Students',
      value: analyticsData.students,
      icon: GraduationCap,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      trend: '+45',
      trendUp: true,
    },
    {
      label: 'Research Papers',
      value: analyticsData.research,
      icon: BookOpen,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
      trend: '+8',
      trendUp: true,
    },
    {
      label: 'Placement %',
      value: `${analyticsData.placements}%`,
      icon: Briefcase,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Pass %',
      value: `${analyticsData.passPercentage}%`,
      icon: Award,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      trend: '-1.2%',
      trendUp: false,
    },
    {
      label: 'Publications',
      value: analyticsData.publications,
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      trend: '+22',
      trendUp: true,
    },
    {
      label: 'Patents',
      value: analyticsData.patents,
      icon: Lightbulb,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      trend: '+2',
      trendUp: true,
    },
    {
      label: 'Funded Projects',
      value: analyticsData.projects,
      icon: FolderKanban,
      color: 'text-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-950/30',
      trend: '0',
      trendUp: null,
    },
  ];

  const getTrendIcon = (trendUp: boolean | null) => {
    if (trendUp === true) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trendUp === false) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getTrendColor = (trendUp: boolean | null) => {
    if (trendUp === true) return 'text-green-600';
    if (trendUp === false) return 'text-red-600';
    return 'text-gray-500';
  };

  // Faculty qualification data
  const facultyQualification = [
    { qualification: 'Ph.D.', count: 32, percentage: 71 },
    { qualification: 'M.Tech/M.E.', count: 8, percentage: 18 },
    { qualification: 'M.Sc./M.A.', count: 3, percentage: 7 },
    { qualification: 'NET/SET Qualified', count: 2, percentage: 4 },
  ];

  // Student performance data
  const studentPerformance = [
    { category: 'First Class with Distinction', percentage: 35 },
    { category: 'First Class', percentage: 42 },
    { category: 'Second Class', percentage: 15 },
    { category: 'Pass Class', percentage: 5.5 },
    { category: 'Failed/ATKT', percentage: 2.5 },
  ];

  // Research metrics
  const researchMetrics = [
    { metric: 'SCI/Scopus Papers', value: 78, target: 100 },
    { metric: 'UGC Listed Papers', value: 35, target: 50 },
    { metric: 'Conference Papers', value: 14, target: 20 },
    { metric: 'Book Chapters', value: 12, target: 15 },
    { metric: 'Books Published', value: 5, target: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsCards.map(stat => (
          <Card key={stat.label} className="border hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${getTrendColor(stat.trendUp)}`}>
                  {getTrendIcon(stat.trendUp)}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Qualification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Faculty Qualification Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facultyQualification.map(item => (
                <div key={item.qualification} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.qualification}</span>
                    <span className="font-medium">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Total Faculty</span>
                  <span>{analyticsData.facultyCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Student Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentPerformance.map(item => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.category}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        item.percentage >= 30
                          ? 'bg-green-500'
                          : item.percentage >= 15
                            ? 'bg-blue-500'
                            : item.percentage >= 5
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Overall Pass Percentage</span>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {analyticsData.passPercentage}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Research Output vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {researchMetrics.map(item => {
                const percentage = Math.round((item.value / item.target) * 100);
                return (
                  <div key={item.metric} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.metric}</span>
                      <span className="font-medium">
                        {item.value}/{item.target}
                      </span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          percentage >= 80
                            ? 'bg-green-500'
                            : percentage >= 60
                              ? 'bg-blue-500'
                              : percentage >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Five Year Trend Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Five Year Growth Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {yearlyTrends.map((trend, index) => {
                const avg = Math.round(
                  (trend.academic + trend.faculty + trend.student + trend.research + trend.alumni) /
                    5
                );
                const prevAvg =
                  index > 0
                    ? Math.round(
                        (yearlyTrends[index - 1].academic +
                          yearlyTrends[index - 1].faculty +
                          yearlyTrends[index - 1].student +
                          yearlyTrends[index - 1].research +
                          yearlyTrends[index - 1].alumni) /
                          5
                      )
                    : 0;
                const growth = index > 0 ? avg - prevAvg : 0;
                return (
                  <div
                    key={trend.year}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{trend.year}</p>
                      <p className="text-xs text-muted-foreground">Average Score: {avg}%</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-muted/50 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${avg}%` }} />
                      </div>
                      {index > 0 && (
                        <Badge
                          className={
                            growth >= 0
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }
                        >
                          {growth >= 0 ? '+' : ''}
                          {growth}%
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
