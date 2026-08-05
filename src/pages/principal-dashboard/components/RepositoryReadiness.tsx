import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, FolderOpen, FileText, ChevronRight, Lock } from 'lucide-react';
import { departmentRepositories, departmentOptions, academicYearOptions, REPO_LIST } from '../principal-data';
import { StatusBadge, ReadinessBar, scoreTone, statusOf, FilterBar, FilterSelect, StatCard } from './common';
import { cn } from '@/lib/utils';

// Sample folder/document structure per repository (read-only drill-down).
const DOC_STRUCTURE: Record<string, { folder: string; docs: string[] }[]> = {
  Academic: [
    { folder: 'Academic Calendar', docs: ['Academic_Calendar_2025-26.pdf', 'Calendar Report.pdf', 'NBA Evidence.pdf', 'NAAC Evidence.pdf'] },
    { folder: 'Curriculum', docs: ['Course_File_2025-26.pdf', 'BoS Minutes.pdf'] },
  ],
  Faculty: [
    { folder: 'Faculty Profile', docs: ['Appointment Orders.pdf', 'PAN Cards.zip', 'Aadhaar.zip'] },
    { folder: 'Qualification', docs: ['Degree Certificates.pdf', 'PhD Certificates.pdf'] },
  ],
  Student: [
    { folder: 'Student Profile', docs: ['Admission Register.xlsx', 'Student Records.xlsx', 'SSC Certificates.zip'] },
    { folder: 'Diversity', docs: ['Diversity Register.xlsx', 'Self Declarations.pdf'] },
  ],
  Research: [
    { folder: 'Publications', docs: ['Journal Papers 2025.pdf', 'DOI Proofs.pdf', 'Indexing Proofs.pdf'] },
    { folder: 'Patents', docs: ['Patent Applications.pdf', 'Filing Receipts.pdf'] },
  ],
  Infrastructure: [
    { folder: 'Laboratories', docs: ['Lab Layouts.pdf', 'Equipment Invoices.pdf'] },
    { folder: 'Licenses', docs: ['Software Licenses.xlsx', 'License Renewal Quotes.pdf'] },
  ],
  Examination: [
    { folder: 'Results', docs: ['Even Sem Results.xlsx', 'Pass % Summary.pdf'] },
    { folder: 'Supplementary', docs: ['Supplementary Register.xlsx'] },
  ],
  Alumni: [
    { folder: 'Alumni Details', docs: ['Graduation Register.xlsx', 'Alumni Registration.xlsx'] },
    { folder: 'Engagement', docs: ['Event Reports.pdf', 'Feedback.xlsx'] },
  ],
  Placement: [
    { folder: 'Placements', docs: ['Selection Lists.xlsx', 'Offer Letters.pdf', 'Recruiter Feedback.pdf'] },
    { folder: 'Internships', docs: ['Internship Register.xlsx', 'Completion Certificates.zip'] },
  ],
};

export function RepositoryReadiness() {
  const [year, setYear] = useState('2025-26');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedRepo, setSelectedRepo] = useState('Academic');

  const departments = useMemo(
    () => (deptFilter === 'all' ? departmentRepositories : departmentRepositories.filter((d) => d.code === deptFilter)),
    [deptFilter]
  );

  const deptData = departmentRepositories.find((d) => d.code === selectedDept) ?? departmentRepositories[0];
  const instAvg = Math.round(departmentRepositories.reduce((a, d) => a + d.readiness, 0) / departmentRepositories.length);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <FilterBar>
            <FilterSelect value={year} onValueChange={setYear} options={academicYearOptions} placeholder="Academic Year" />
            <FilterSelect value={deptFilter} onValueChange={setDeptFilter} options={departmentOptions} placeholder="Department" />
            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Read-only monitoring — no data entry
            </span>
          </FilterBar>
        </CardContent>
      </Card>

      {/* Institution summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Database} label="Institution Completion" value={`${instAvg}%`} sub={`${departmentRepositories.length} departments`} tone="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
        <StatCard icon={Database} label="Departments Visible" value={`${departments.length}`} sub="Selected filter" tone="text-indigo-600" iconBg="bg-indigo-50 dark:bg-indigo-950/40" />
        <StatCard icon={Database} label="Repositories Tracked" value={`${REPO_LIST.length}`} sub="Per department" tone="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950/40" />
        <StatCard icon={Database} label="Evidence Folders" value="16" sub="Across repositories" tone="text-teal-600" iconBg="bg-teal-50 dark:bg-teal-950/40" />
      </div>

      {/* Drill-down: Department → Repository → Folder/Documents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Departments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">1 · Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {departments.map((d) => (
              <button
                key={d.code}
                onClick={() => setSelectedDept(d.code)}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all',
                  selectedDept === d.code ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50'
                )}
              >
                <div>
                  <p className="text-xs font-semibold">{d.code}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{d.name}</p>
                </div>
                <span className={scoreTone(d.readiness)}>{d.readiness}%</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Repositories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">2 · Repository — {selectedDept}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {deptData.repositories.map((r) => (
              <button
                key={r.repo}
                onClick={() => setSelectedRepo(r.repo)}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-left transition-all',
                  selectedRepo === r.repo ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{r.repo} Repository</span>
                  <span className={scoreTone(r.completion)}>{r.completion}%</span>
                </div>
                <ReadinessBar value={r.completion} className="mt-1.5" />
                <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground">
                  <span className="text-emerald-600">Approved {r.approved}%</span>
                  <span className="text-amber-600">Pending {r.pending}%</span>
                  <span className="text-red-600">Missing {r.missing}%</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Folders & Documents */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">3 · Folder / Document — {selectedRepo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(DOC_STRUCTURE[selectedRepo] ?? []).map((folder) => (
              <div key={folder.folder} className="rounded-lg border">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-t-lg">
                  <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-medium flex-1">{folder.folder}</span>
                  <Badge variant="outline" className="text-[9px]">{folder.docs.length} docs</Badge>
                </div>
                <div className="divide-y">
                  {folder.docs.map((doc, di) => (
                    <div key={doc} className="flex items-center gap-2 px-3 py-1.5">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] flex-1 truncate">{doc}</span>
                      {/* Stable per-document status derived from structure, not Math.random. */}
                      <StatusBadge status={statusOf(78 + ((di * 7) % 20))} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-1 pt-1 text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Read-only — current status <ChevronRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
