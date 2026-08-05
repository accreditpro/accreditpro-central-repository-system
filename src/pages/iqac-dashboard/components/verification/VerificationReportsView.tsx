import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileBarChart2, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useVerificationDocuments } from './useVerificationDocuments';
import {
  VERIFICATION_REPORT_TYPES,
  buildVerificationReportData,
  exportVerificationReportToExcel,
  exportVerificationReportToPDF,
  type VerificationReportId,
} from './verification-report-export';

export function VerificationReportsView() {
  const { documents, observations } = useVerificationDocuments();
  const [previewReport, setPreviewReport] = useState<VerificationReportId | null>(null);

  const preview = previewReport ? buildVerificationReportData(previewReport, documents, observations) : null;

  const handleExport = (id: VerificationReportId, format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') exportVerificationReportToPDF(id, documents, observations);
      else exportVerificationReportToExcel(id, documents, observations);
      toast.success(`${VERIFICATION_REPORT_TYPES.find((r) => r.id === id)?.name} exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {VERIFICATION_REPORT_TYPES.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <FileBarChart2 className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-sm font-semibold">{report.name}</CardTitle>
              </div>
              <CardDescription className="text-xs pt-1">{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 flex-1"
                onClick={() => handleExport(report.id, 'pdf')}
              >
                <FileText className="h-3.5 w-3.5" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 flex-1"
                onClick={() => handleExport(report.id, 'excel')}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Excel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Preview report"
                onClick={() => setPreviewReport(report.id)}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inline report preview */}
      {preview && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileBarChart2 className="h-4 w-4 text-primary" />
                {preview.title}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setPreviewReport(null)}>
                Close preview
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {preview.columns.map((c) => (
                    <th key={c} className="text-left p-2.5 font-medium whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                    {row.map((cell, j) => (
                      <td key={j} className="p-2.5 whitespace-nowrap">{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rows.length > 50 && (
              <p className="p-3 text-[11px] text-muted-foreground">
                Showing first 50 of {preview.rows.length} rows — export for the full report.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
