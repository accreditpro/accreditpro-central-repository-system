import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Lightbulb,
  Library,
  FlaskConical,
  Briefcase,
  FolderKanban,
  Wallet,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { principalService, DeptResearchDto, ResearchTotalsDto } from '@/services/principal.service';
import { academicYearOptions } from '../principal-data';
import { StatCard, FilterBar, FilterSelect, SearchInput, ReadinessBar } from './common';

export function ResearchInnovation() {
  const [year, setYear] = useState('2025-26');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<{
    departments: DeptResearchDto[];
    totals: ResearchTotalsDto;
    publicationsTrend: { years: string[]; values: number[] };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    principalService
      .getResearch(year)
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
        Loading research & innovation...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Unable to load research data. Please try again.
      </div>
    );
  }

  const deptResearch = data.departments ?? [];
  const researchTotals = data.totals;
  const analyticsTrends = data.publicationsTrend;
  const rows = deptResearch.filter(d => d.dept.toLowerCase().includes(search.toLowerCase()));
  const maxPublications = Math.max(...(analyticsTrends?.values ?? [1]));

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

      {/* Institution-wide */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard
          icon={BookOpen}
          label="Publications"
          value={`${researchTotals.publications}`}
          tone="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          icon={Lightbulb}
          label="Patents"
          value={`${researchTotals.patents}`}
          tone="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
        />
        <StatCard
          icon={Library}
          label="Books"
          value={`${researchTotals.books}`}
          tone="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          icon={FlaskConical}
          label="Sponsored Projects"
          value={`${researchTotals.sponsoredProjects}`}
          tone="text-purple-600"
          iconBg="bg-purple-50 dark:bg-purple-950/40"
        />
        <StatCard
          icon={Briefcase}
          label="Consultancy"
          value={`₹${researchTotals.consultancy}L`}
          tone="text-cyan-600"
          iconBg="bg-cyan-50 dark:bg-cyan-950/40"
        />
        <StatCard
          icon={FolderKanban}
          label="Project Dev"
          value={`${researchTotals.projectDevelopment}`}
          tone="text-violet-600"
          iconBg="bg-violet-50 dark:bg-violet-950/40"
        />
        <StatCard
          icon={Wallet}
          label="Research Funding"
          value={`₹${(researchTotals.researchFunding / 100).toFixed(2)} Cr`}
          sub="External grants"
          tone="text-teal-600"
          iconBg="bg-teal-50 dark:bg-teal-950/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Department-wise Research — {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-medium text-muted-foreground">Dept</th>
                    <th className="text-center p-2 font-medium text-emerald-600">Pubs</th>
                    <th className="text-center p-2 font-medium text-amber-600">Patents</th>
                    <th className="text-center p-2 font-medium text-blue-600">Books</th>
                    <th className="text-center p-2 font-medium text-purple-600">Sponsored</th>
                    <th className="text-center p-2 font-medium text-cyan-600">Consultancy</th>
                    <th className="text-center p-2 font-medium text-violet-600">Project Dev</th>
                    <th className="text-center p-2 font-medium text-muted-foreground">
                      Funding (₹L)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(d => (
                    <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="p-2 font-medium">{d.dept}</td>
                      <td className="p-2 text-center">{d.publications}</td>
                      <td className="p-2 text-center">{d.patents}</td>
                      <td className="p-2 text-center">{d.books}</td>
                      <td className="p-2 text-center">{d.sponsoredProjects}</td>
                      <td className="p-2 text-center">₹{d.consultancy}L</td>
                      <td className="p-2 text-center">{d.projectDevelopment}</td>
                      <td className="p-2 text-center font-semibold">₹{d.researchFunding}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Academic Year-wise Publications Trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analyticsTrends?.years ?? []).map((y, i) => (
              <div key={y}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{y}</span>
                  <span className="font-semibold">{analyticsTrends.values[i]}</span>
                </div>
                <ReadinessBar value={(analyticsTrends.values[i] / maxPublications) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
