import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileBarChart, FileText, FileSpreadsheet, Download, Building2, CheckCircle2 } from 'lucide-react';
import { REPORT_TYPES, buildReportData, exportReportToPDF, exportReportToExcel } from './report-export';
import { SearchInput } from './common';

export function ExecutiveReports() {
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState<{ id: string; name: string; format: string; date: string }[]>([
    { id: 'gaps', name: 'Gap Analysis Report', format: 'PDF', date: '2025-07-28' },
    { id: 'accreditation', name: 'Accreditation Readiness Report', format: 'XLSX', date: '2025-07-22' },
    { id: 'department', name: 'Department Summary', format: 'PDF', date: '2025-07-15' },
  ]);

  const filtered = REPORT_TYPES.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (id: string, format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') exportReportToPDF(id);
      else exportReportToExcel(id);
      const report = REPORT_TYPES.find((r) => r.id === id);
      setRecent((prev) => [
        { id, name: report?.name ?? 'Report', format: format === 'pdf' ? 'PDF' : 'XLSX', date: new Date().toISOString().split('T')[0] },
        ...prev,
      ]);
      toast.success(`${report?.name ?? 'Report'} exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed — please try again');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search reports…" className="w-56" />
            <span className="ml-auto text-[11px] text-muted-foreground">Export as PDF or Excel (XLSX)</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((report) => {
          const preview = buildReportData(report.id);
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileBarChart className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{report.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{report.description}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">{preview.columns.length} columns</Badge>
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">{preview.rows.length} rows</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => handleExport(report.id, 'pdf')}>
                      <FileText className="h-3 w-3 text-red-500" /> PDF
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => handleExport(report.id, 'excel')}>
                      <FileSpreadsheet className="h-3 w-3 text-emerald-600" /> Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recently generated */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Recently Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.map((r) => (
            <div key={`${r.id}-${r.date}`} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className="text-xs font-medium">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">{r.date} • {r.format}</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
