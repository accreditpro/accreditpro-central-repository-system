import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { RepositoryTabConfig } from '../types';
import {
  repositorySummaries,
  evidenceDocuments,
  workflowSteps,
  mockValidationResult,
  uploadHistoryData,
} from '../repository-config';
import { CSVUploadDialog } from './CSVUploadDialog';
import {
  Download,
  Upload,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  Replace,
  DownloadCloud,
  Shield,
} from 'lucide-react';

interface RepositoryTabContentProps {
  tabConfig: RepositoryTabConfig;
}

export const RepositoryTabContent = ({ tabConfig }: RepositoryTabContentProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const summary = repositorySummaries[tabConfig.id];
  const tabEvidence = evidenceDocuments.filter(d =>
    d.category.toLowerCase().includes(tabConfig.label.toLowerCase().split(' ')[0])
  );
  const tabUploads = uploadHistoryData.filter(u =>
    u.tab.toLowerCase().includes(tabConfig.label.toLowerCase().split(' ')[0])
  );

  const handleDownloadTemplate = () => {
    if (tabConfig.templateFile) {
      const link = document.createElement('a');
      link.href = tabConfig.templateFile;
      link.download = tabConfig.templateFile.split('/').pop() || 'template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Section 1: Repository Summary */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Repository Summary</CardTitle>
          <CardDescription className="text-xs">
            Current status of {tabConfig.label} data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              {
                label: 'Uploaded',
                value: summary.recordsUploaded,
                icon: Upload,
                color: 'text-indigo-600 bg-indigo-500/10',
              },
              {
                label: 'Pending Validation',
                value: summary.pendingValidation,
                icon: Clock,
                color: 'text-amber-600 bg-amber-500/10',
              },
              {
                label: 'Pending Verification',
                value: summary.pendingVerification,
                icon: Shield,
                color: 'text-orange-600 bg-orange-500/10',
              },
              {
                label: 'Verified',
                value: summary.verified,
                icon: CheckCircle2,
                color: 'text-emerald-600 bg-emerald-500/10',
              },
              {
                label: 'Approved',
                value: summary.approved,
                icon: CheckCircle2,
                color: 'text-green-600 bg-green-500/10',
              },
              {
                label: 'Rejected',
                value: summary.rejected,
                icon: XCircle,
                color: 'text-red-600 bg-red-500/10',
              },
              {
                label: 'Last Updated',
                value: summary.lastUpdated.split(' ')[0],
                icon: History,
                color: 'text-gray-600 bg-gray-500/10',
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-2.5 rounded-lg border border-border/50 text-center"
                >
                  <Icon className={cn('h-4 w-4 mx-auto mb-1', item.color.split(' ')[0])} />
                  <p className="text-sm font-bold">{item.value}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tabConfig.templateFile && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
              </Button>
            )}
            <Button size="sm" className="text-xs h-8" onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CSV
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <History className="h-3.5 w-3.5 mr-1.5" /> View Upload History
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> View Validation Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Validation Results */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Validation Results</CardTitle>
              <CardDescription className="text-xs">Latest validation report</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              <Download className="h-3 w-3 mr-1" /> Error Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            <div className="p-2 rounded-lg bg-muted/50 text-center">
              <p className="text-sm font-bold">{mockValidationResult.totalRows}</p>
              <p className="text-[9px] text-muted-foreground">Total Rows</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/5 text-center">
              <p className="text-sm font-bold text-emerald-600">{mockValidationResult.validRows}</p>
              <p className="text-[9px] text-muted-foreground">Valid</p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/5 text-center">
              <p className="text-sm font-bold text-red-600">{mockValidationResult.invalidRows}</p>
              <p className="text-[9px] text-muted-foreground">Invalid</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/5 text-center">
              <p className="text-sm font-bold text-amber-600">{mockValidationResult.warnings}</p>
              <p className="text-[9px] text-muted-foreground">Warnings</p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/5 text-center">
              <p className="text-sm font-bold text-red-600">
                {mockValidationResult.errors.filter(e => e.severity === 'error').length}
              </p>
              <p className="text-[9px] text-muted-foreground">Errors</p>
            </div>
          </div>

          {mockValidationResult.errors.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px]">Row</TableHead>
                    <TableHead className="text-[10px]">Column</TableHead>
                    <TableHead className="text-[10px]">Value</TableHead>
                    <TableHead className="text-[10px]">Message</TableHead>
                    <TableHead className="text-[10px]">Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockValidationResult.errors.map((err, i) => (
                    <TableRow key={i} className="hover:bg-muted/20">
                      <TableCell className="text-xs font-mono">{err.row}</TableCell>
                      <TableCell className="text-xs font-medium">{err.column}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {err.value || '(empty)'}
                      </TableCell>
                      <TableCell className="text-xs">{err.message}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[9px]',
                            err.severity === 'error'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-amber-500/10 text-amber-600'
                          )}
                        >
                          {err.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Evidence Repository */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Evidence Repository</CardTitle>
              <CardDescription className="text-xs">
                Supporting documents for {tabConfig.label}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {tabEvidence.length} documents
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {tabConfig.requiredEvidence.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] text-muted-foreground mr-1">Required:</span>
              {tabConfig.requiredEvidence.map(ev => (
                <Badge key={ev} variant="outline" className="text-[9px] px-1.5 py-0">
                  {ev}
                </Badge>
              ))}
            </div>
          )}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px]">Document</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Version</TableHead>
                  <TableHead className="text-[10px]">Uploaded By</TableHead>
                  <TableHead className="text-[10px]">Date</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tabEvidence.slice(0, 4).map(doc => (
                  <TableRow key={doc.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium truncate max-w-[180px]">
                          {doc.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px]">
                        {doc.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.version}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.uploadedBy}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.uploadedDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[9px]',
                          doc.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                          doc.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                          doc.status === 'rejected' && 'bg-red-500/10 text-red-600'
                        )}
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <DownloadCloud className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Replace className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {tabConfig.frameworkMapping.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-[10px] text-muted-foreground">Framework Mapping:</span>
              {tabConfig.frameworkMapping.map(fw => (
                <Badge
                  key={fw}
                  variant="secondary"
                  className="text-[9px] bg-indigo-500/10 text-indigo-600"
                >
                  {fw}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Workflow Status */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Workflow Status</CardTitle>
          <CardDescription className="text-xs">Approval workflow timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {workflowSteps
              .filter(s => s.id !== 'rejected')
              .map((step, index, arr) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                        step.status === 'completed' &&
                          'bg-emerald-500 border-emerald-500 text-white',
                        step.status === 'current' &&
                          'border-indigo-500 bg-indigo-500/10 text-indigo-600',
                        step.status === 'pending' &&
                          'border-muted-foreground/30 text-muted-foreground/40'
                      )}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : step.status === 'current' ? (
                        <Clock className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-[10px] font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[9px] mt-1 font-medium text-center',
                        step.status === 'current'
                          ? 'text-indigo-600'
                          : step.status === 'completed'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                    {step.timestamp && (
                      <span className="text-[8px] text-muted-foreground">
                        {step.timestamp.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  {index < arr.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 w-6 sm:w-10 rounded-full',
                        step.status === 'completed' ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                      )}
                    />
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload History for this tab */}
      {tabUploads.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Upload History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px]">File</TableHead>
                    <TableHead className="text-[10px]">Uploaded</TableHead>
                    <TableHead className="text-[10px]">Records</TableHead>
                    <TableHead className="text-[10px]">Valid/Invalid</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabUploads.map(record => (
                    <TableRow key={record.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs font-medium">{record.fileName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {record.uploadedAt}
                      </TableCell>
                      <TableCell className="text-xs">{record.recordsCount}</TableCell>
                      <TableCell className="text-xs">
                        <span className="text-emerald-600">{record.validRecords}</span>/{' '}
                        <span className="text-red-600">{record.invalidRecords}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[9px]',
                            record.status === 'approved' && 'bg-emerald-500/10 text-emerald-600',
                            record.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                            record.status === 'rejected' && 'bg-red-500/10 text-red-600'
                          )}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Upload Dialog */}
      <CSVUploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        tabConfig={tabConfig}
      />
    </motion.div>
  );
};
