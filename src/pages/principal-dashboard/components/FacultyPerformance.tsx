import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  BookOpen,
  Lightbulb,
  FlaskConical,
  Wallet,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  principalService,
  DeptFacultyDto,
  QualificationSummaryDto,
} from '@/services/principal.service';
import { academicYearOptions } from '../principal-data';
import { StatCard, ScoreCell, ReadinessBar, FilterBar, FilterSelect, SearchInput } from './common';

export function FacultyPerformance() {
  const [year, setYear] = useState('2025-26');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<{
    departments: DeptFacultyDto[];
    qualificationSummary: QualificationSummaryDto[];
    researchFundingTotal: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    principalService
      .getFaculty(year)
      .then(response => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading faculty performance...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Unable to load faculty data. Please try again.
      </div>
    );
  }

  const deptFaculty = data.departments ?? [];
  const rows = deptFaculty.filter(d => d.dept.toLowerCase().includes(search.toLowerCase()));

  const totalFaculty = deptFaculty.reduce((a, d) => a + d.strength, 0);
  const avgPhd = Math.round(
    deptFaculty.reduce((a, d) => a + d.phdPercentage, 0) / Math.max(deptFaculty.length, 1)
  );
  const avgFdp = Math.round(
    deptFaculty.reduce((a, d) => a + d.fdpParticipation, 0) / Math.max(deptFaculty.length, 1)
  );
  const totalPubs = deptFaculty.reduce((a, d) => a + d.publications, 0);
  const totalPatents = deptFaculty.reduce((a, d) => a + d.patents, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-3">
          <FilterBar>
            <FilterSelect
              value={year}
              onValueChange={setYear}
              options={academicYearOptions}
              placeholder="Academic Year"
            />
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search department…"
              className="w-52"
            />
          </FilterBar>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard
          icon={Users}
          label="Faculty Strength"
          value={`${totalFaculty}`}
          sub="Institution-wide"
          tone="text-indigo-600"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        />
        <StatCard
          icon={GraduationCap}
          label="Avg PhD %"
          value={`${avgPhd}%`}
          tone="text-purple-600"
          iconBg="bg-purple-50 dark:bg-purple-950/40"
        />
        <StatCard
          icon={GraduationCap}
          label="FDP Participation"
          value={`${avgFdp}%`}
          sub={`Institutional avg ${avgFdp}%`}
          tone="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          icon={BookOpen}
          label="Publications"
          value={`${totalPubs}`}
          tone="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          icon={Lightbulb}
          label="Patents"
          value={`${totalPatents}`}
          tone="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
        />
        <StatCard
          icon={Wallet}
          label="Research Funding"
          value={data.researchFundingTotal}
          sub="External grants"
          tone="text-teal-600"
          iconBg="bg-teal-50 dark:bg-teal-950/40"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Department-wise Faculty Profile — {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Dept</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Strength</th>
                  <th className="text-center p-2.5 font-medium text-purple-600">PhD %</th>
                  <th className="text-center p-2.5 font-medium text-blue-600">FDP %</th>
                  <th className="text-center p-2.5 font-medium text-emerald-600">Publications</th>
                  <th className="text-center p-2.5 font-medium text-amber-600">Patents</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Sponsored</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">
                    Consultancy (₹L)
                  </th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground w-36">
                    Research Funding
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(d => (
                  <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="p-2.5 font-medium">{d.dept}</td>
                    <td className="p-2.5 text-center">{d.strength}</td>
                    <td className="p-2.5 text-center">
                      <ScoreCell value={d.phdPercentage} />
                    </td>
                    <td className="p-2.5 text-center">
                      <ScoreCell value={d.fdpParticipation} />
                    </td>
                    <td className="p-2.5 text-center">{d.publications}</td>
                    <td className="p-2.5 text-center">{d.patents}</td>
                    <td className="p-2.5 text-center">{d.sponsoredProjects}</td>
                    <td className="p-2.5 text-center">{d.consultancy}</td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <ReadinessBar value={d.researchFunding} className="flex-1" />
                        <span className="text-[10px] text-muted-foreground w-9 text-right">
                          ₹{d.researchFunding}L
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Faculty Qualification Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data.qualificationSummary ?? []).map(q => (
              <div key={q.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{q.label}</span>
                  <span className="text-muted-foreground">
                    {q.value} of {q.total}
                  </span>
                </div>
                <ReadinessBar value={q.total > 0 ? (q.value / q.total) * 100 : 0} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
