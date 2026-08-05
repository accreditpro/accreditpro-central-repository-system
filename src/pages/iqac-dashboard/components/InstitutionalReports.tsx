import { useState } from 'react';
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
  Database,
  AlertTriangle,
  MessageSquareWarning,
  TrendingUp,
  Trophy,
  Award,
  Gauge,
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { selectInitiatives, selectObservations } from '@/store/slices/iqacSlice';
import { IQAC_REPORT_TYPES, exportIQACReportToPDF, exportIQACReportToExcel } from './report-export';
import { SearchInput } from './common';

const TYPE_ICONS: Record<string, React.ElementType> = {
  institution: Gauge,
  department: Building2,
  repository: Database,
  gaps: AlertTriangle,
  observations: MessageSquareWarning,
  improvement: TrendingUp,
  nba: Trophy,
  naac: Award,
  nirf: Trophy,
};

export function InstitutionalReports() {
  const observations = useAppSelector(selectObservations);
  const initiatives = useAppSelector(selectInitiatives);
  const [search, setSearch] = useState('');

  const filtered = IQAC_REPORT_TYPES.filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (id: string, format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') {
        exportIQACReportToPDF(id, observations, initiatives);
      } else {
        exportIQACReportToExcel(id, observations, initiatives);
      }
      toast.success(`Report exported as ${format.toUpperCase()}.`);
    } catch {
      toast.error('Export failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileBarChart className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Institutional Reports</h3>
              <p className="text-xs text-muted-foreground">
                Generate and export IQAC reports in PDF or Excel — always derived from the latest repository & observation data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] gap-1"><FileText className="h-3 w-3" /> PDF</Badge>
              <Badge variant="outline" className="text-[10px] gap-1"><FileSpreadsheet className="h-3 w-3" /> Excel</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search reports…" className="w-64" />
        <span className="text-[11px] text-muted-foreground">{filtered.length} report types</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((report) => {
          const Icon = TYPE_ICONS[report.id] ?? FileBarChart;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-primary/5">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <CardTitle className="text-sm font-semibold leading-tight">{report.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-xs text-muted-foreground flex-1">{report.description}</p>
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleExport(report.id, 'pdf')}>
                    <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleExport(report.id, 'excel')}>
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF" onClick={() => handleExport(report.id, 'pdf')}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
