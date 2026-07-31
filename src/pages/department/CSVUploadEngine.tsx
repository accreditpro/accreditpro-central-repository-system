import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { UploadStep, CSVUploadRecord } from './types';
import { uploadHistory } from './mock-data';
import {
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Eye,
  Send,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

const steps: { id: UploadStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'download', label: 'Download Template', icon: Download },
  { id: 'upload', label: 'Upload CSV', icon: Upload },
  { id: 'validate', label: 'Validate', icon: CheckCircle2 },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'submit', label: 'Submit', icon: Send },
];

const templateOptions = [
  { value: 'faculty', label: 'Faculty Data Template' },
  { value: 'student', label: 'Student Data Template' },
  { value: 'research', label: 'Research Data Template' },
  { value: 'academic', label: 'Academic Data Template' },
];

// Mock preview data
const mockPreviewHeaders = ['Name', 'Designation', 'Qualification', 'Experience', 'Specialization', 'Publications'];
const mockPreviewRows = [
  ['Dr. New Faculty', 'Professor', 'Ph.D. AI', '15', 'Deep Learning', '30'],
  ['Prof. Test User', 'Asst. Professor', 'M.Tech', '5', 'Web Dev', '8'],
  ['Dr. Sample', 'Assoc. Professor', 'Ph.D. ML', '10', 'Computer Vision', '22'],
];

const mockValidationErrors = [
  { row: 4, column: 'Experience', value: 'abc', message: 'Expected numeric value' },
  { row: 7, column: 'Email', value: '', message: 'Required field is empty' },
];

export const CSVUploadEngine = () => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('download');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleDownloadTemplate = () => {
    // Mock download
    setTimeout(() => {
      setCurrentStep('upload');
    }, 500);
  };

  const handleFileUpload = useCallback(() => {
    setUploadedFile('faculty_data_2024_update.csv');
    setTimeout(() => {
      setCurrentStep('validate');
    }, 300);
  }, []);

  const handleValidate = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setValidationComplete(true);
      setCurrentStep('preview');
    }, 2000);
  };

  const handleSubmit = () => {
    setCurrentStep('submit');
  };

  const handleReset = () => {
    setCurrentStep('download');
    setSelectedTemplate('');
    setUploadedFile(null);
    setValidationComplete(false);
    setIsValidating(false);
  };

  const getStatusBadge = (status: CSVUploadRecord['status']) => {
    const config = {
      approved: { icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-600' },
      pending: { icon: Clock, className: 'bg-amber-500/10 text-amber-600' },
      rejected: { icon: XCircle, className: 'bg-red-500/10 text-red-600' },
      processing: { icon: RefreshCw, className: 'bg-blue-500/10 text-blue-600' },
    };
    const { icon: StatusIcon, className } = config[status];
    return (
      <Badge variant="secondary" className={cn('text-[10px]', className)}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload Engine Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">CSV Upload Engine</CardTitle>
              <CardDescription>Upload and validate data files for your department repository</CardDescription>
            </div>
            {currentStep !== 'download' && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={handleReset}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Start Over
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 px-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isActive && 'border-primary bg-primary/10 text-primary',
                      !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground/50'
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <span className={cn(
                      'text-[10px] mt-1.5 font-medium text-center',
                      isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2 mt-[-16px] rounded-full transition-colors',
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Download Template */}
              {currentStep === 'download' && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-primary/60 mb-3" />
                    <h3 className="text-sm font-semibold mb-1">Select & Download Template</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Choose the data category and download the CSV template. Fill in your data following the template format.
                    </p>
                  </div>
                  <div className="max-w-sm mx-auto space-y-3">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select template category" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="w-full"
                      disabled={!selectedTemplate}
                      onClick={handleDownloadTemplate}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download Template
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Upload CSV */}
              {currentStep === 'upload' && (
                <div className="space-y-4">
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
                      isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileUpload(); }}
                    onClick={handleFileUpload}
                  >
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-sm font-semibold mb-1">Drop your CSV file here</h3>
                    <p className="text-xs text-muted-foreground">or click to browse • Max 10MB • CSV format only</p>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <FileText className="h-5 w-5 text-emerald-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{uploadedFile}</p>
                        <p className="text-xs text-muted-foreground">2.1 MB • Ready for validation</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Validate */}
              {currentStep === 'validate' && (
                <div className="space-y-4 text-center py-4">
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-10 w-10 mx-auto text-primary animate-spin" />
                      <h3 className="text-sm font-semibold">Validating your data...</h3>
                      <p className="text-xs text-muted-foreground">Checking format, required fields, and data integrity</p>
                      <Progress value={65} className="max-w-xs mx-auto h-2" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-10 w-10 mx-auto text-primary" />
                      <h3 className="text-sm font-semibold">Ready to validate</h3>
                      <p className="text-xs text-muted-foreground">Click below to start validation of your uploaded file</p>
                      <Button onClick={handleValidate}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Start Validation
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Preview */}
              {currentStep === 'preview' && (
                <div className="space-y-4">
                  {/* Validation Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
                      <p className="text-lg font-bold text-emerald-600">45</p>
                      <p className="text-[11px] text-muted-foreground">Valid Records</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
                      <p className="text-lg font-bold text-red-600">2</p>
                      <p className="text-[11px] text-muted-foreground">Errors Found</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
                      <p className="text-lg font-bold text-amber-600">3</p>
                      <p className="text-[11px] text-muted-foreground">Warnings</p>
                    </div>
                  </div>

                  {/* Errors */}
                  {mockValidationErrors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Validation Errors
                      </h4>
                      {mockValidationErrors.map((err, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded bg-red-500/5 border border-red-500/10 text-xs">
                          <span className="font-mono text-red-600">Row {err.row}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium">{err.column}</span>
                          <span className="text-muted-foreground">: {err.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Data Preview */}
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {mockPreviewHeaders.map(h => (
                            <TableHead key={h} className="text-xs">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockPreviewRows.map((row, i) => (
                          <TableRow key={i}>
                            {row.map((cell, j) => (
                              <TableCell key={j} className="text-xs">{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">Showing first 3 of 45 valid records</p>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Re-upload
                    </Button>
                    <Button onClick={handleSubmit}>
                      Submit for Approval <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Submit */}
              {currentStep === 'submit' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-1">Upload Submitted Successfully!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your file has been submitted for review. You&apos;ll be notified once it&apos;s approved.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      Upload Another File
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Upload History</CardTitle>
          <CardDescription>Track all your previous uploads and their approval status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Valid / Invalid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadHistory.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate max-w-[200px]">{record.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{record.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{record.uploadedAt}</TableCell>
                    <TableCell className="text-sm">{record.recordsCount}</TableCell>
                    <TableCell className="text-xs">
                      <span className="text-emerald-600">{record.validRecords}</span>
                      {' / '}
                      <span className="text-red-600">{record.invalidRecords}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};