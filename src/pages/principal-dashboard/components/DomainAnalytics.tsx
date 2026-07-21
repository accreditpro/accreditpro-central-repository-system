import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  Briefcase,
  Landmark,
  Wallet,
  ClipboardList,
  Heart,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Award,
  Trophy,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { academicPerformance, departmentScores, fiveYearTrends, institutionStats } from '../principal-configs';

interface DomainAnalyticsProps {
  domain: string;
}

export function DomainAnalytics({ domain }: DomainAnalyticsProps) {
  switch (domain) {
    case 'academic':
      return <AcademicPerformance />;
    case 'student-success':
      return <StudentSuccess />;
    case 'faculty':
      return <FacultyExcellence />;
    case 'research':
      return <ResearchPerformance />;
    case 'placement':
      return <PlacementPerformance />;
    case 'infrastructure':
      return <InfrastructureOverview />;
    case 'financial':
      return <FinancialOverview />;
    case 'examination':
      return <ExaminationAnalytics />;
    case 'student-dev':
      return <StudentDevelopment />;
    case 'compliance':
      return <ComplianceStatus />;
    default:
      return <AcademicPerformance />;
  }
}

function AcademicPerformance() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={GraduationCap} label="Avg Pass %" value="87%" trend="+2.3%" positive />
        <StatCard icon={Award} label="Avg CGPA" value="7.5" trend="+0.2" positive />
        <StatCard icon={TrendingUp} label="Graduation Rate" value="92%" trend="+1.5%" positive />
        <StatCard icon={Award} label="University Ranks" value="19" trend="+4" positive />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Department-wise Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Dept</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Pass %</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Avg SGPA</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Avg CGPA</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Backlogs</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Grad Rate</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Distinctions</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Gold Medals</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Univ. Ranks</th>
                </tr>
              </thead>
              <tbody>
                {academicPerformance.departments.map((dept) => (
                  <tr key={dept.name} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{dept.name}</td>
                    <td className="text-center py-2 px-2">
                      <span className={dept.passPercentage >= 90 ? 'text-green-600' : dept.passPercentage >= 80 ? 'text-yellow-600' : 'text-red-600'}>
                        {dept.passPercentage}%
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">{dept.avgSGPA}</td>
                    <td className="text-center py-2 px-2">{dept.avgCGPA}</td>
                    <td className="text-center py-2 px-2">
                      <span className={dept.backlogs <= 5 ? 'text-green-600' : dept.backlogs <= 10 ? 'text-yellow-600' : 'text-red-600'}>
                        {dept.backlogs}
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">{dept.graduationRate}%</td>
                    <td className="text-center py-2 px-2">{dept.distinctions}</td>
                    <td className="text-center py-2 px-2">{dept.goldMedals}</td>
                    <td className="text-center py-2 px-2">{dept.universityRanks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Five Year Pass Percentage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fiveYearTrends.years.map((year, idx) => (
              <div key={year} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{year}</span>
                <Progress value={fiveYearTrends.passPercentage[idx]} className="h-3 flex-1" />
                <span className="text-xs font-semibold w-10">{fiveYearTrends.passPercentage[idx]}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentSuccess() {
  const metrics = [
    { label: 'Admissions', value: '1,250', detail: 'AY 2023-24' },
    { label: 'Progression Rate', value: '94%', detail: '+2% YoY' },
    { label: 'Placements', value: '82%', detail: '145 Recruiters' },
    { label: 'Higher Studies', value: '12%', detail: '58 Students' },
    { label: 'Entrepreneurship', value: '3%', detail: '15 Startups' },
    { label: 'Scholarships', value: '₹2.8 Cr', detail: '420 Students' },
    { label: 'Achievements', value: '156', detail: 'Awards & Prizes' },
    { label: 'Dropout Rate', value: '2.1%', detail: '-0.4% YoY' },
    { label: 'Retention Rate', value: '97.9%', detail: 'Above Target' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{m.value}</p>
              <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Student Enrollment Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fiveYearTrends.years.map((year, idx) => (
              <div key={year} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{year}</span>
                <Progress value={(fiveYearTrends.students[idx] / 5000) * 100} className="h-3 flex-1" />
                <span className="text-xs font-semibold w-12">{fiveYearTrends.students[idx].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FacultyExcellence() {
  const metrics = [
    { label: 'Total Faculty', value: '312', icon: Users },
    { label: 'PhD Holders', value: '186 (60%)', icon: GraduationCap },
    { label: 'Publications', value: '456', icon: BookOpen },
    { label: 'Patents', value: '18', icon: Award },
    { label: 'Research Projects', value: '42', icon: FlaskConical },
    { label: 'Consultancy', value: '₹1.8 Cr', icon: Briefcase },
    { label: 'FDPs Attended', value: '245', icon: TrendingUp },
    { label: 'Awards', value: '28', icon: Award },
  ];

  const deptFaculty = [
    { dept: 'CSE', total: 52, phd: 38, publications: 98, ratio: '1:15' },
    { dept: 'ECE', total: 45, phd: 28, publications: 72, ratio: '1:16' },
    { dept: 'EEE', total: 38, phd: 20, publications: 45, ratio: '1:18' },
    { dept: 'MECH', total: 42, phd: 25, publications: 58, ratio: '1:17' },
    { dept: 'CIVIL', total: 35, phd: 18, publications: 38, ratio: '1:19' },
    { dept: 'IT', total: 40, phd: 26, publications: 65, ratio: '1:15' },
    { dept: 'AIML', total: 32, phd: 18, publications: 48, ratio: '1:16' },
    { dept: 'DS', total: 28, phd: 13, publications: 32, ratio: '1:18' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-3">
              <m.icon className="h-4 w-4 text-primary mb-1" />
              <p className="text-lg font-bold">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Department-wise Faculty Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Dept</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Total</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">PhD</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Publications</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Student:Faculty</th>
                </tr>
              </thead>
              <tbody>
                {deptFaculty.map((d) => (
                  <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{d.dept}</td>
                    <td className="text-center py-2 px-2">{d.total}</td>
                    <td className="text-center py-2 px-2">{d.phd} ({Math.round((d.phd / d.total) * 100)}%)</td>
                    <td className="text-center py-2 px-2">{d.publications}</td>
                    <td className="text-center py-2 px-2">{d.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResearchPerformance() {
  const metrics = [
    { label: 'Total Projects', value: '42', trend: '+8' },
    { label: 'Publications', value: '456', trend: '+76' },
    { label: 'Patents Filed', value: '18', trend: '+5' },
    { label: 'IPR Registered', value: '12', trend: '+3' },
    { label: 'Grants Received', value: '₹4.2 Cr', trend: '+₹0.8 Cr' },
    { label: 'Consultancy Revenue', value: '₹1.8 Cr', trend: '+₹0.3 Cr' },
    { label: 'Total Research Revenue', value: '₹6.0 Cr', trend: '+₹1.1 Cr' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-3">
              <p className="text-lg font-bold">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <Badge variant="outline" className="text-[9px] text-green-600 mt-1">{m.trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Department-wise Research Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentScores.map((dept) => {
              const researchScore = Math.round(dept.verification * 0.9);
              return (
                <div key={dept.id} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-12">{dept.code}</span>
                  <Progress value={researchScore} className="h-2.5 flex-1" />
                  <span className="text-xs font-semibold w-10">{researchScore}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Publications Five Year Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fiveYearTrends.years.map((year, idx) => (
              <div key={year} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{year}</span>
                <Progress value={(fiveYearTrends.publications[idx] / 500) * 100} className="h-3 flex-1" />
                <span className="text-xs font-semibold w-8">{fiveYearTrends.publications[idx]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlacementPerformance() {
  const deptPlacements = [
    { dept: 'CSE', rate: 95, highest: '42 LPA', average: '9.2 LPA', recruiters: 45, internships: 120 },
    { dept: 'ECE', rate: 84, highest: '28 LPA', average: '7.1 LPA', recruiters: 32, internships: 85 },
    { dept: 'EEE', rate: 72, highest: '18 LPA', average: '5.8 LPA', recruiters: 22, internships: 60 },
    { dept: 'MECH', rate: 78, highest: '22 LPA', average: '6.2 LPA', recruiters: 28, internships: 70 },
    { dept: 'CIVIL', rate: 54, highest: '12 LPA', average: '4.5 LPA', recruiters: 15, internships: 40 },
    { dept: 'IT', rate: 92, highest: '38 LPA', average: '8.8 LPA', recruiters: 42, internships: 110 },
    { dept: 'AIML', rate: 88, highest: '35 LPA', average: '8.2 LPA', recruiters: 38, internships: 95 },
    { dept: 'DS', rate: 82, highest: '32 LPA', average: '7.5 LPA', recruiters: 30, internships: 80 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Briefcase} label="Overall Placement" value={`${institutionStats.placementRate}%`} trend="+2%" positive />
        <StatCard icon={TrendingUp} label="Highest Package" value={institutionStats.highestPackage} trend="+₹4 LPA" positive />
        <StatCard icon={Award} label="Average Package" value={institutionStats.averagePackage} trend="+₹0.6 LPA" positive />
        <StatCard icon={Users} label="Recruiters" value={`${institutionStats.recruiters}`} trend="+18" positive />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Department-wise Placement Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Dept</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Rate</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Highest</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Average</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Recruiters</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Internships</th>
                </tr>
              </thead>
              <tbody>
                {deptPlacements.map((d) => (
                  <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{d.dept}</td>
                    <td className="text-center py-2 px-2">
                      <span className={d.rate >= 85 ? 'text-green-600' : d.rate >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                        {d.rate}%
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">{d.highest}</td>
                    <td className="text-center py-2 px-2">{d.average}</td>
                    <td className="text-center py-2 px-2">{d.recruiters}</td>
                    <td className="text-center py-2 px-2">{d.internships}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Placement Rate Five Year Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fiveYearTrends.years.map((year, idx) => (
              <div key={year} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{year}</span>
                <Progress value={fiveYearTrends.placements[idx]} className="h-3 flex-1" />
                <span className="text-xs font-semibold w-10">{fiveYearTrends.placements[idx]}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfrastructureOverview() {
  const infraItems = [
    { label: 'Buildings', value: '12', detail: '2.5 Lakh sq.ft' },
    { label: 'Laboratories', value: '68', detail: 'Well-equipped' },
    { label: 'Library', value: '1.2L Books', detail: '5,200 Journals' },
    { label: 'ICT Facilities', value: '98%', detail: 'Wi-Fi Coverage' },
    { label: 'Hostels', value: '6', detail: '2,400 Capacity' },
    { label: 'Sports Facilities', value: '8', detail: 'Indoor & Outdoor' },
    { label: 'Safety & Security', value: '100%', detail: 'CCTV Coverage' },
    { label: 'Green Campus', value: '45%', detail: 'Green Area' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {infraItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Infrastructure Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Buildings & Classrooms', 'Laboratories', 'Library & Resources', 'ICT Infrastructure', 'Utilities & Maintenance', 'Hostels', 'Sports', 'Safety & Security', 'Green Campus'].map((item, idx) => {
              const value = 75 + Math.round(Math.random() * 20);
              return (
                <div key={item} className="flex items-center gap-3">
                  <span className="text-xs w-40 truncate">{item}</span>
                  <Progress value={value} className="h-2 flex-1" />
                  <span className="text-xs font-semibold w-10">{value}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialOverview() {
  const financialData = [
    { label: 'Total Budget', value: '₹125 Cr', period: 'FY 2023-24' },
    { label: 'Expenditure', value: '₹108 Cr', period: '86.4% Utilized' },
    { label: 'Research Funding', value: '₹4.2 Cr', period: '+23% YoY' },
    { label: 'Scholarships', value: '₹2.8 Cr', period: '420 Students' },
    { label: 'Infrastructure', value: '₹18.5 Cr', period: 'Capital Exp.' },
  ];

  const deptBudget = [
    { dept: 'CSE', allocated: 18.5, utilized: 16.2, percentage: 88 },
    { dept: 'ECE', allocated: 15.2, utilized: 13.1, percentage: 86 },
    { dept: 'EEE', allocated: 12.8, utilized: 10.5, percentage: 82 },
    { dept: 'MECH', allocated: 14.5, utilized: 12.8, percentage: 88 },
    { dept: 'CIVIL', allocated: 11.2, utilized: 9.4, percentage: 84 },
    { dept: 'IT', allocated: 16.8, utilized: 15.2, percentage: 90 },
    { dept: 'AIML', allocated: 13.5, utilized: 11.8, percentage: 87 },
    { dept: 'DS', allocated: 10.5, utilized: 8.9, percentage: 85 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {financialData.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Department-wise Budget Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Dept</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Allocated (₹ Cr)</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Utilized (₹ Cr)</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Utilization %</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground w-24">Progress</th>
                </tr>
              </thead>
              <tbody>
                {deptBudget.map((d) => (
                  <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{d.dept}</td>
                    <td className="text-center py-2 px-2">{d.allocated}</td>
                    <td className="text-center py-2 px-2">{d.utilized}</td>
                    <td className="text-center py-2 px-2 font-semibold">{d.percentage}%</td>
                    <td className="py-2 px-2"><Progress value={d.percentage} className="h-2" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Five Year Financial Trend (₹ Cr)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fiveYearTrends.years.map((year, idx) => (
              <div key={year} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{year}</span>
                <Progress value={(fiveYearTrends.revenue[idx] / 140) * 100} className="h-3 flex-1" />
                <span className="text-xs font-semibold w-8">{fiveYearTrends.revenue[idx]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExaminationAnalytics() {
  const examData = [
    { label: 'Overall Pass %', value: '87%', trend: '+2.3%' },
    { label: 'Total Backlogs', value: '80', trend: '-12' },
    { label: 'CO Attainment', value: '72%', trend: '+5%' },
    { label: 'Result Published', value: '100%', trend: 'On Time' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {examData.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs font-medium">{item.label}</p>
              <Badge variant="outline" className="text-[9px] text-green-600 mt-1">{item.trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Department-wise Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {academicPerformance.departments.map((dept) => (
              <div key={dept.name} className="flex items-center gap-3">
                <span className="text-xs font-medium w-12">{dept.name}</span>
                <Progress value={dept.passPercentage} className="h-2.5 flex-1" />
                <span className="text-xs font-semibold w-10">{dept.passPercentage}%</span>
                <Badge variant="outline" className={`text-[9px] ${dept.backlogs <= 5 ? 'text-green-600' : dept.backlogs <= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {dept.backlogs} backlogs
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDevelopment() {
  const activities = [
    { name: 'NSS', participants: 450, events: 24, achievements: 8 },
    { name: 'NCC', participants: 120, events: 18, achievements: 5 },
    { name: 'Sports', participants: 380, events: 32, achievements: 15 },
    { name: 'Cultural', participants: 520, events: 28, achievements: 12 },
    { name: 'Professional Societies', participants: 680, events: 45, achievements: 22 },
    { name: 'Student Chapters', participants: 420, events: 36, achievements: 18 },
    { name: 'Community Outreach', participants: 280, events: 15, achievements: 6 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Heart} label="Total Participants" value="2,850" trend="+320" positive />
        <StatCard icon={Award} label="Events Conducted" value="198" trend="+24" positive />
        <StatCard icon={Trophy} label="Achievements" value="86" trend="+12" positive />
        <StatCard icon={Users} label="Participation Rate" value="59%" trend="+5%" positive />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Activity-wise Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Activity</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Participants</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Events</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Achievements</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.name} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium">{a.name}</td>
                    <td className="text-center py-2 px-3">{a.participants}</td>
                    <td className="text-center py-2 px-3">{a.events}</td>
                    <td className="text-center py-2 px-3">{a.achievements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComplianceStatus() {
  const complianceItems = [
    { name: 'AICTE Approval', status: 'valid', expiry: '2025-06-30', action: 'Renewal in 45 days' },
    { name: 'UGC Recognition', status: 'valid', expiry: '2026-03-31', action: 'No action needed' },
    { name: 'Autonomous Status', status: 'valid', expiry: '2027-08-15', action: 'No action needed' },
    { name: 'NBA Accreditation (CSE)', status: 'valid', expiry: '2025-12-31', action: 'Prepare for renewal' },
    { name: 'NBA Accreditation (ECE)', status: 'pending', expiry: '-', action: 'Application submitted' },
    { name: 'NAAC Accreditation', status: 'valid', expiry: '2026-09-30', action: 'Prepare SSR' },
    { name: 'Fire Safety Certificate', status: 'expiring', expiry: '2024-05-15', action: 'Urgent renewal' },
    { name: 'Building Safety', status: 'valid', expiry: '2025-11-30', action: 'No action needed' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <ShieldCheck className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold">6</p>
            <p className="text-[10px] text-muted-foreground">Valid Approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-bold">1</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <AlertCircle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold">1</p>
            <p className="text-[10px] text-muted-foreground">Expiring Soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold">100%</p>
            <p className="text-[10px] text-muted-foreground">Compliance Rate</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Compliance & Approvals Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Approval/Certificate</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Expiry</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Action Required</th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((item) => (
                  <tr key={item.name} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium">{item.name}</td>
                    <td className="text-center py-2 px-3">
                      <Badge className={`text-[9px] ${item.status === 'valid' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="text-center py-2 px-3">{item.expiry}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable Stat Card
function StatCard({ icon: Icon, label, value, trend, positive }: { icon: React.ElementType; label: string; value: string; trend: string; positive?: boolean }) {
  return (
    <Card>
      <CardContent className="p-3">
        <Icon className="h-4 w-4 text-primary mb-1" />
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1 mt-1">
          {positive ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
          <span className={`text-[10px] font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}