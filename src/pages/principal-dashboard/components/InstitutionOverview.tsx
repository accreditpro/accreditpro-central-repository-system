import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Briefcase,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { institutionStats, fiveYearTrends, departmentScores } from '../principal-configs';

export function InstitutionOverview() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="trends">Five Year Trends</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Academic Years</p>
                    <p className="text-lg font-bold">5</p>
                    <p className="text-[10px] text-muted-foreground">2019-20 to 2023-24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Programs</p>
                    <p className="text-lg font-bold">{institutionStats.programs}</p>
                    <p className="text-[10px] text-muted-foreground">UG & PG</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Departments</p>
                    <p className="text-lg font-bold">{institutionStats.departments}</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Students</p>
                    <p className="text-lg font-bold">
                      {institutionStats.students.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Enrolled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Faculty</p>
                    <p className="text-lg font-bold">{institutionStats.faculty}</p>
                    <p className="text-[10px] text-muted-foreground">Teaching Staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Publications</p>
                    <p className="text-lg font-bold">{institutionStats.researchPublications}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {institutionStats.patents} Patents
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pink-50 dark:bg-pink-950 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Placement Rate</p>
                    <p className="text-lg font-bold">{institutionStats.placementRate}%</p>
                    <p className="text-[10px] text-muted-foreground">
                      {institutionStats.recruiters} Recruiters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-lg font-bold">{institutionStats.budget}</p>
                    <p className="text-[10px] text-muted-foreground">FY 2023-24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Infrastructure & Finance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Infrastructure Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{institutionStats.infrastructure.buildings}</p>
                    <p className="text-[10px] text-muted-foreground">Buildings</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{institutionStats.infrastructure.labs}</p>
                    <p className="text-[10px] text-muted-foreground">Laboratories</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{institutionStats.infrastructure.library}</p>
                    <p className="text-[10px] text-muted-foreground">Library</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{institutionStats.infrastructure.ict}</p>
                    <p className="text-[10px] text-muted-foreground">ICT Coverage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Budget</span>
                    <span className="text-sm font-semibold">{institutionStats.budget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Expenditure</span>
                    <span className="text-sm font-semibold">{institutionStats.expenditure}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Utilization</span>
                    <span className="text-sm font-semibold">86.4%</span>
                  </div>
                  <Progress value={86.4} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Avg Package</span>
                    <span className="text-sm font-semibold">{institutionStats.averagePackage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Highest Package</span>
                    <span className="text-sm font-semibold">{institutionStats.highestPackage}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Department-wise Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                        Department
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                        Repository
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                        Evidence
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                        Faculty
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                        Students
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                        Research
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                        Placements
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                        Health
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentScores.map(dept => (
                      <tr key={dept.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 px-2 font-medium">{dept.code}</td>
                        <td className="text-center py-2 px-2">{dept.repository}%</td>
                        <td className="text-center py-2 px-2">{dept.evidence}%</td>
                        <td className="text-center py-2 px-2">
                          {Math.round(dept.repository * 0.95)}%
                        </td>
                        <td className="text-center py-2 px-2">
                          {Math.round(dept.evidence * 1.02)}%
                        </td>
                        <td className="text-center py-2 px-2">
                          {Math.round(dept.verification * 0.9)}%
                        </td>
                        <td className="text-center py-2 px-2">
                          {Math.round(dept.readiness * 0.92)}%
                        </td>
                        <td className="text-center py-2 px-2">
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${dept.health === 'excellent' ? 'border-green-500 text-green-600' : dept.health === 'good' ? 'border-blue-500 text-blue-600' : dept.health === 'warning' ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}
                          >
                            {dept.health}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Students Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Student Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fiveYearTrends.years.map((year, idx) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground w-16">{year}</span>
                      <Progress
                        value={(fiveYearTrends.students[idx] / 5000) * 100}
                        className="h-2 flex-1 mx-2"
                      />
                      <span className="text-xs font-medium w-12 text-right">
                        {fiveYearTrends.students[idx].toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Faculty Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Faculty Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fiveYearTrends.years.map((year, idx) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground w-16">{year}</span>
                      <Progress
                        value={(fiveYearTrends.faculty[idx] / 350) * 100}
                        className="h-2 flex-1 mx-2"
                      />
                      <span className="text-xs font-medium w-8 text-right">
                        {fiveYearTrends.faculty[idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Publications Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Research Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fiveYearTrends.years.map((year, idx) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground w-16">{year}</span>
                      <Progress
                        value={(fiveYearTrends.publications[idx] / 500) * 100}
                        className="h-2 flex-1 mx-2"
                      />
                      <span className="text-xs font-medium w-8 text-right">
                        {fiveYearTrends.publications[idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Placement Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Placement Rate (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fiveYearTrends.years.map((year, idx) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground w-16">{year}</span>
                      <Progress
                        value={fiveYearTrends.placements[idx]}
                        className="h-2 flex-1 mx-2"
                      />
                      <span className="text-xs font-medium w-8 text-right">
                        {fiveYearTrends.placements[idx]}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pass Percentage Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pass Percentage (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fiveYearTrends.years.map((year, idx) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground w-16">{year}</span>
                      <Progress
                        value={fiveYearTrends.passPercentage[idx]}
                        className="h-2 flex-1 mx-2"
                      />
                      <span className="text-xs font-medium w-8 text-right">
                        {fiveYearTrends.passPercentage[idx]}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenue (₹ Cr)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fiveYearTrends.years.map((year, idx) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground w-16">{year}</span>
                      <Progress
                        value={(fiveYearTrends.revenue[idx] / 140) * 100}
                        className="h-2 flex-1 mx-2"
                      />
                      <span className="text-xs font-medium w-8 text-right">
                        {fiveYearTrends.revenue[idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Repository Growth & Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentScores.map(dept => (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{dept.name}</span>
                      <span className="text-xs font-semibold">{dept.readiness}%</span>
                    </div>
                    <div className="flex gap-1">
                      <Progress value={dept.repository} className="h-2 flex-1" />
                      <Progress value={dept.evidence} className="h-2 flex-1" />
                      <Progress value={dept.verification} className="h-2 flex-1" />
                    </div>
                    <div className="flex gap-1 text-[9px] text-muted-foreground">
                      <span className="flex-1">Repo: {dept.repository}%</span>
                      <span className="flex-1">Evidence: {dept.evidence}%</span>
                      <span className="flex-1">Verification: {dept.verification}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
