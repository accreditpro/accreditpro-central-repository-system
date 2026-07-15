import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from 'lucide-react';
import { reportTypes } from '../hod-configs';

export function ReportsModule() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2024-25');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');

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

  const recentReports = [
    { name: 'Department Repository Report', generatedOn: '2024-12-14', format: 'PDF', size: '2.4 MB' },
    { name: 'Evidence Report', generatedOn: '2024-12-12', format: 'Excel', size: '1.8 MB' },
    { name: 'Gap Analysis Report', generatedOn: '2024-12-10', format: 'PDF', size: '1.2 MB' },
    { name: 'Five Year Summary', generatedOn: '2024-12-08', format: 'PDF', size: '3.6 MB' },
    { name: 'Pending Tasks Report', generatedOn: '2024-12-05', format: 'PDF', size: '0.8 MB' },
  ];

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
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2023-24">2023-24</SelectItem>
                <SelectItem value="2022-23">2022-23</SelectItem>
                <SelectItem value="2021-22">2021-22</SelectItem>
                <SelectItem value="2020-21">2020-21</SelectItem>
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
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Generate & Download
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-2">
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
                {recentReports.map((report, index) => (
                  <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{report.name}</td>
                    <td className="p-3 text-muted-foreground">{new Date(report.generatedOn).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Badge variant="outline">{report.format}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{report.size}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 gap-1">
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </Button>
                      </div>
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