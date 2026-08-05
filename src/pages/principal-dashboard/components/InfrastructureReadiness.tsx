import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Landmark, Cpu, FileCheck2, MonitorSmartphone, AlertTriangle, Wrench } from 'lucide-react';
import { deptInfra, infraAlerts, academicYearOptions } from '../principal-data';
import { StatCard, ScoreCell, ReadinessBar, FilterBar, FilterSelect, SearchInput } from './common';

export function InfrastructureReadiness() {
  const [year, setYear] = useState('2025-26');
  const [search, setSearch] = useState('');
  const rows = deptInfra.filter((d) => d.dept.toLowerCase().includes(search.toLowerCase()));

  const avg = (fn: (d: (typeof deptInfra)[number]) => number) =>
    Math.round(deptInfra.reduce((a, d) => a + fn(d), 0) / deptInfra.length);

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Landmark} label="Laboratories" value={`${avg((d) => d.laboratories)}%`} tone="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
        <StatCard icon={Wrench} label="Equipment" value={`${avg((d) => d.equipment)}%`} tone="text-indigo-600" iconBg="bg-indigo-50 dark:bg-indigo-950/40" />
        <StatCard icon={Cpu} label="Software Licenses" value={`${avg((d) => d.softwareLicenses)}%`} tone="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950/40" />
        <StatCard icon={MonitorSmartphone} label="ICT Facilities" value={`${avg((d) => d.ictFacilities)}%`} tone="text-cyan-600" iconBg="bg-cyan-50 dark:bg-cyan-950/40" />
        <StatCard icon={Landmark} label="Smart Classrooms" value={`${avg((d) => d.smartClassrooms)}%`} tone="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950/40" />
        <StatCard icon={FileCheck2} label="Evidence Completion" value={`${avg((d) => d.evidenceCompletion)}%`} tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
      </div>

      {/* Compliance alerts */}
      {infraAlerts.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Compliance Highlights — {infraAlerts.length} alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {infraAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs">{a.alert}</p>
                  <Badge variant="outline" className="text-[9px] mt-1">{a.dept}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Department-wise Infrastructure Readiness — {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Dept</th>
                  <th className="text-center p-2.5 font-medium text-blue-600">Labs</th>
                  <th className="text-center p-2.5 font-medium text-indigo-600">Equipment</th>
                  <th className="text-center p-2.5 font-medium text-amber-600">Licenses</th>
                  <th className="text-center p-2.5 font-medium text-cyan-600">ICT</th>
                  <th className="text-center p-2.5 font-medium text-violet-600">Smart Classrooms</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground w-40">Evidence Completion</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.dept} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="p-2.5 font-medium">{d.dept}</td>
                    <td className="p-2.5 text-center"><ScoreCell value={d.laboratories} /></td>
                    <td className="p-2.5 text-center"><ScoreCell value={d.equipment} /></td>
                    <td className="p-2.5 text-center"><ScoreCell value={d.softwareLicenses} /></td>
                    <td className="p-2.5 text-center"><ScoreCell value={d.ictFacilities} /></td>
                    <td className="p-2.5 text-center"><ScoreCell value={d.smartClassrooms} /></td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <ReadinessBar value={d.evidenceCompletion} className="flex-1" />
                        <span className="text-[10px] w-8 text-right">{d.evidenceCompletion}%</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center">
                      {d.alerts.length > 0 ? (
                        <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-500/30">
                          {d.alerts.length}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-500/30">Clear</Badge>
                      )}
                    </td>
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
