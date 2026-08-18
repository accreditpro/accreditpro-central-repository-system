import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  FileBarChart,
  FileText,
  FileSpreadsheet,
  Download,
  Building2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  buildReportData,
  exportReportToPDF,
  exportReportToExcel,
  type ReportContext,
} from './report-export';
import { principalService, ReportTypeDto, RecentReportDto } from '@/services/principal.service';
import { SearchInput } from './common';

export function ExecutiveReports() {
  const [search, setSearch] = useState('');
  const [reportTypes, setReportTypes] = useState<ReportTypeDto[]>([]);
  const [recent, setRecent] = useState<
    { id: string; name: string; format: string; date: string }[]
  >([]);
  const [ctx, setCtx] = useState<ReportContext>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      principalService.getReports(),
      principalService.getDashboard(),
      principalService.getDepartments(),
      principalService.getAccreditation(),
      principalService.getGaps({ page: 0, size: 100 }),
      principalService.getFaculty(),
      principalService.getStudents(),
      principalService.getResearch(),
      principalService.getInfrastructure(),
      principalService.getAnalytics(),
    ])
      .then(
        ([
          reports,
          dashboard,
          departments,
          accreditation,
          gaps,
          faculty,
          students,
          research,
          infrastructure,
          analytics,
        ]) => {
          if (cancelled) return;
          setReportTypes(reports.reportTypes ?? []);
          setRecent(
            (reports.recentReports ?? []).map(r => ({
              id: r.id,
              name: r.name,
              format: r.format,
              date: r.date,
            }))
          );
          setCtx({
            dashboard,
            departments,
            accreditation,
            gaps: gaps.content ?? [],
            faculty: faculty.departments ?? [],
            students: students.departments ?? [],
            research: research.departments ?? [],
            infrastructure: infrastructure.departments ?? [],
            analytics,
          });
        }
      )
      .catch(() => {
        if (!cancelled) toast.error('Failed to load reports. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = reportTypes.filter(
    r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (id: string, format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') exportReportToPDF(id, ctx);
      else exportReportToExcel(id, ctx);
      const report = reportTypes.find(r => r.id === id);
      setRecent(prev => [
        {
          id,
          name: report?.name ?? 'Report',
          format: format === 'pdf' ? 'PDF' : 'XLSX',
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
      toast.success(`${report?.name ?? 'Report'} exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed — please try again');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search reports…"
              className="w-56"
            />
            <span className="ml-auto text-[11px] text-muted-foreground">
              Export as PDF or Excel (XLSX)
            </span>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <AlertTriangle className="h-5 w-5 mr-2" />
          No reports available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(report => {
            const preview = buildReportData(report.id, ctx);
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileBarChart className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{report.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge variant="outline" className="text-[9px] text-muted-foreground">
                          {preview.columns.length} columns
                        </Badge>
                        <Badge variant="outline" className="text-[9px] text-muted-foreground">
                          {preview.rows.length} rows
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1"
                        onClick={() => handleExport(report.id, 'pdf')}
                      >
                        <FileText className="h-3 w-3 text-red-500" /> PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1"
                        onClick={() => handleExport(report.id, 'excel')}
                      >
                        <FileSpreadsheet className="h-3 w-3 text-emerald-600" /> Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recently generated */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Recently Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">No reports generated yet.</p>
          )}
          {recent.map(r => (
            <div
              key={`${r.id}-${r.date}`}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className="text-xs font-medium">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {r.date} • {r.format}
                  </p>
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
