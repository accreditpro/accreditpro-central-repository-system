import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { readinessData, yearlyTrends } from '../hod-configs';
import { TrendingUp, Target, ShieldCheck, FileCheck } from 'lucide-react';

export function RepositoryReadiness() {
  // Calculate weighted readiness score
  const weightedScore = readinessData.reduce((acc, item) => {
    const avgScore =
      (item.dataCompletion + item.evidenceCompletion + item.verification + item.approval) / 4;
    return acc + (avgScore * item.weight) / 100;
  }, 0);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusLabel = (score: number) => {
    if (score >= 90)
      return {
        label: 'Excellent',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      };
    if (score >= 75)
      return {
        label: 'Good',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      };
    if (score >= 60)
      return {
        label: 'Needs Attention',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      };
    return {
      label: 'Critical',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
  };

  return (
    <div className="space-y-6">
      {/* Overall Readiness Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-muted/20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-primary"
                  strokeDasharray={`${weightedScore * 3.14} 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{Math.round(weightedScore)}%</span>
                <span className="text-xs text-muted-foreground">Readiness</span>
              </div>
            </div>
            <Badge className={`mt-3 ${getStatusLabel(weightedScore).color}`}>
              {getStatusLabel(weightedScore).label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Readiness Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readinessData.map(item => {
                const avg = Math.round(
                  (item.dataCompletion +
                    item.evidenceCompletion +
                    item.verification +
                    item.approval) /
                    4
                );
                const status = getStatusLabel(avg);
                return (
                  <div key={item.repository} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.repository}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getScoreColor(avg)}`}>{avg}%</span>
                        <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
                      </div>
                    </div>
                    <Progress value={avg} className="h-2 mb-2" />
                    <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground">
                      <div className="text-center">
                        <p className="font-medium text-foreground">{item.dataCompletion}%</p>
                        <p>Data</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">{item.evidenceCompletion}%</p>
                        <p>Evidence</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">{item.verification}%</p>
                        <p>Verified</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">{item.approval}%</p>
                        <p>Approved</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data Completion</p>
              <p className="text-xl font-bold">
                {Math.round(
                  readinessData.reduce((a, b) => a + b.dataCompletion, 0) / readinessData.length
                )}
                %
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <FileCheck className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Evidence Completion</p>
              <p className="text-xl font-bold">
                {Math.round(
                  readinessData.reduce((a, b) => a + b.evidenceCompletion, 0) / readinessData.length
                )}
                %
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
              <ShieldCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Verification</p>
              <p className="text-xl font-bold">
                {Math.round(
                  readinessData.reduce((a, b) => a + b.verification, 0) / readinessData.length
                )}
                %
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/30">
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">YoY Improvement</p>
              <p className="text-xl font-bold">+12%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Five Year Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Five Year Repository Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Year</th>
                  <th className="text-left p-3 font-medium">Academic</th>
                  <th className="text-left p-3 font-medium">Faculty</th>
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Research</th>
                  <th className="text-left p-3 font-medium">Alumni</th>
                  <th className="text-left p-3 font-medium">Average</th>
                </tr>
              </thead>
              <tbody>
                {yearlyTrends.map(trend => {
                  const avg = Math.round(
                    (trend.academic +
                      trend.faculty +
                      trend.student +
                      trend.research +
                      trend.alumni) /
                      5
                  );
                  return (
                    <tr key={trend.year} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{trend.year}</td>
                      <td className="p-3">
                        <span className={getScoreColor(trend.academic)}>{trend.academic}%</span>
                      </td>
                      <td className="p-3">
                        <span className={getScoreColor(trend.faculty)}>{trend.faculty}%</span>
                      </td>
                      <td className="p-3">
                        <span className={getScoreColor(trend.student)}>{trend.student}%</span>
                      </td>
                      <td className="p-3">
                        <span className={getScoreColor(trend.research)}>{trend.research}%</span>
                      </td>
                      <td className="p-3">
                        <span className={getScoreColor(trend.alumni)}>{trend.alumni}%</span>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusLabel(avg).color}>{avg}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
