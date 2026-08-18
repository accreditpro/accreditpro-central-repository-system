import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  FileText,
  FileCheck,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  Download,
  Printer,
  Mail,
  Calendar,
  Loader2,
} from 'lucide-react';
import { hodService, ReportTypeDto, RecentReportDto } from '@/services/hod.service';
import { ACADEMIC_YEARS } from '../hod-configs';

export function ReportsModule({ academicYear }: { academicYear: string }) {
  const [reportTypes, setReportTypes] = useState<ReportTypeDto[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(academicYear);
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    hodService
      .getReports()
      .then((data) => {
        if (cancelled) return;
        setReportTypes(data.reportTypes);
        setRecentReports(data.recentReports);
      })
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

  const getReportIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="h-5 w-5" />;
      case 'FileCheck': return <FileCheck className="h-5 w-5" />;
      case 'Clock': return <Clock className="h-5 w-5" />;
      case 'AlertTriangle': return <AlertTriangle className="h-5 w-5" />;
      case 'Activity': return <Activity className="h-5 w-5" />;
      case 'TrendingUp': return <TrendingUp className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const generateAndDownload = async () => {
    if (!selectedReport) {
      toast.error('Please select a report type');
      return;
    }
    setGenerating(true);
    try {
      const report = await hodService.generateReport({
        reportType: selectedReport,
        format: selectedFormat,
        academicYear: selectedYear,
      });
      setRecentReports((prev) => [report, ...prev]);
      await hodService.downloadReport(report.id, report.name);
      toast.success('Report generated and downloaded');
    } catch {
      toast.error('Failed to generate the report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const emailReport = async (report: RecentReportDto) => {
    try {
      await hodService.emailReport(report.id);
      toast.success(`Report emailed successfully`);
    } catch {
      toast.error('Failed to email the report. Please try again.');
    }
  };

  const downloadReport = async (report: RecentReportDto) => {
    try {
      await hodService.downloadReport(report.id, report.name);
      toast.success(`Downloading ${report.name}`);
    } catch {
      toast.error('Failed to download the report. Please try again.');
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
      {/* Report Generation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((report) => (
                  <SelectItem key={report.id} value={report.id}>{report.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="word">Word</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2" onClick={generateAndDownload} disabled={generating}>
              <Download className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate & Download'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              disabled={recentReports.length === 0}
              onClick={() => recentReports[0] && emailReport(recentReports[0])}
            >
              <Mail className="h-4 w-4" />
              Email Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.id} className="border hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReport(report.id)}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {getReportIcon(report.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{report.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recently Generated Reports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recently Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Report Name</th>
                  <th className="text-left p-3 font-medium">Generated On</th>
                  <th className="text-left p-3 font-medium">Format</th>
                  <th className="text-left p-3 font-medium">Size</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{report.name}</td>
                    <td className="p-3 text-muted-foreground">{new Date(report.generatedOn).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Badge variant="outline">{report.format}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{report.size ?? '—'}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => downloadReport(report)}>
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => emailReport(report)}>
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {recentReports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                      No reports generated yet. Use the form above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
