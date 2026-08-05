import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Briefcase, FolderKanban, Trophy, BadgeCheck } from 'lucide-react';
import { deptStudent, academicYearOptions } from '../principal-data';
import { StatCard, ScoreCell, FilterBar, FilterSelect, SearchInput } from './common';

export function StudentPerformance() {
  const [year, setYear] = useState('2025-26');
  const [search, setSearch] = useState('');
  const rows = deptStudent.filter((d) => d.dept.toLowerCase().includes(search.toLowerCase()));

  const total = deptStudent.reduce((a, d) => a + d.strength, 0);
  const avg = (fn: (d: (typeof deptStudent)[number]) => number) =>
    Math.round(deptStudent.reduce((a, d) => a + fn(d), 0) / deptStudent.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-3">
          <FilterBar>
            <FilterSelect value={year} onValueChange={setYear} options={academicYearOptions} placeholder="Academic Year" />
            <SearchInput value={search} onChange={setSearch} placeholder="Search department…" className="w-52" />
          </FilterBar>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard icon={Users} label="Student Strength" value={`${total.toLocaleString()}`} tone="text-indigo-600" iconBg="bg-indigo-50 dark:bg-indigo-950/40" />
        <StatCard icon={GraduationCap} label="Pass %" value={`${avg((d) => d.passPercentage)}%`} tone="text-teal-600" iconBg="bg-teal-50 dark:bg-teal-950/40" />
        <StatCard icon={Briefcase} label="Placements" value={`${avg((d) => d.placements)}%`} tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
        <StatCard icon={GraduationCap} label="Higher Studies" value={`${avg((d) => d.higherStudies)}%`} tone="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
        <StatCard icon={Briefcase} label="Internships" value={`${deptStudent.reduce((a, d) => a + d.internships, 0)}`} tone="text-cyan-600" iconBg="bg-cyan-50 dark:bg-cyan-950/40" />
        <StatCard icon={FolderKanban} label="Projects" value={`${deptStudent.reduce((a, d) => a + d.projects, 0)}`} tone="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950/40" />
        <StatCard icon={Trophy} label="Awards" value={`${deptStudent.reduce((a, d) => a + d.awards, 0)}`} tone="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950/40" />
        <StatCard icon={BadgeCheck} label="Certifications" value={`${deptStudent.reduce((a, d) => a + d.certifications, 0)}`} tone="text-fuchsia-600" iconBg="bg-fuchsia-50 dark:bg-fuchsia-950/40" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Department-wise Student Performance — {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Dept</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Strength</th>
                  <th className="text-center p-2.5 font-medium text-teal-600">Pass %</th>
                  <th className="text-center p-2.5 font-medium text-emerald-600">Placements</th>
                  <th className="text-center p-2.5 font-medium text-blue-600">Higher Studies</th>
                  <th className="text-center p-2.5 font-medium text-cyan-600">Internships</th>
                  <th className="text-center p-2.5 font-medium text-violet-600">Projects</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Publications</th>
                  <th className="text-center p-2.5 font-medium text-amber-600">Awards</th>
                  <th className="text-center p-2.5 font-medium text-fuchsia-600">Certifications</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="p-2.5 font-medium">{d.dept}</td>
                    <td className="p-2.5 text-center">{d.strength}</td>
                    <td className="p-2.5 text-center"><ScoreCell value={d.passPercentage} /></td>
                    <td className="p-2.5 text-center"><ScoreCell value={d.placements} /></td>
                    <td className="p-2.5 text-center">{d.higherStudies}%</td>
                    <td className="p-2.5 text-center">{d.internships}</td>
                    <td className="p-2.5 text-center">{d.projects}</td>
                    <td className="p-2.5 text-center">{d.publications}</td>
                    <td className="p-2.5 text-center">{d.awards}</td>
                    <td className="p-2.5 text-center">{d.certifications}</td>
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
