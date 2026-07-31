import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { mockColumnMappings } from '../repository-config';
import {
  Upload,
  CheckCircle2,
  FileText,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Columns,
  Eye,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface CSVUploadDialogProps {
  open: boolean;
  onClose: () => void;
  tabConfig: RepositoryTabConfig;
}

type UploadStep = 'upload' | 'mapping' | 'validate' | 'preview' | 'submit';

const steps: { id: UploadStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'mapping', label: 'Map Columns' },
  { id: 'validate', label: 'Validate' },
  { id: 'preview', label: 'Preview' },
  { id: 'submit', label: 'Submit' },
];

export const CSVUploadDialog = ({ open, onClose, tabConfig }: CSVUploadDialogProps) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleFileUpload = useCallback(() => {
    setUploadedFile(`${tabConfig.id}_data_2025.csv`);
    setTimeout(() => setCurrentStep('mapping'), 500);
  }, [tabConfig.id]);

  const handleMapping = () => {
    setCurrentStep('validate');
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setCurrentStep('preview');
    }, 1500);
  };

  const handleSubmit = () => {
    setCurrentStep('submit');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setIsValidating(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Unified navigation
  const showFooter = currentStep !== 'submit' && currentStep !== 'validate';

  const canGoBack = currentStep === 'mapping' || currentStep === 'preview';

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 'upload':
        return !!uploadedFile;
      case 'mapping':
        return true;
      case 'preview':
        return true;
      default:
        return false;
    }
  }, [currentStep, uploadedFile]);

  const handleNext = () => {
    switch (currentStep) {
      case 'upload':
        setCurrentStep('mapping');
        break;
      case 'mapping':
        handleMapping();
        break;
      case 'preview':
        handleSubmit();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'mapping':
        setCurrentStep('upload');
        break;
      case 'preview':
        setCurrentStep('mapping');
        break;
    }
  };

  const getNextLabel = () => {
    switch (currentStep) {
      case 'upload':
        return 'Next';
      case 'mapping':
        return 'Validate Data';
      case 'preview':
        return 'Submit for Approval';
      default:
        return 'Next';
    }
  };

  const getBackLabel = () => {
    switch (currentStep) {
      case 'mapping':
        return 'Back';
      case 'preview':
        return 'Re-map';
      default:
        return 'Back';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden !flex !flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base">Upload CSV — {tabConfig.label}</DialogTitle>
          <DialogDescription className="text-xs">
            Upload, map, validate, and submit your data
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg shrink-0">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium transition-all',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isActive && 'border-primary text-primary',
                    !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground/50'
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                  </div>
                  <span className={cn('text-[9px] mt-1 font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-1.5 rounded-full', isCompleted ? 'bg-primary' : 'bg-muted-foreground/20')} />
                )}
              </div>
            );
          })}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 px-0.5 py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
            >
              {/* Upload Step */}
              {currentStep === 'upload' && (
                <div className="space-y-4">
                  {tabConfig.templateFile && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                      <Download className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs text-muted-foreground flex-1">
                        Need the template? <a href={tabConfig.templateFile} download className="text-indigo-600 font-medium hover:underline">Download CSV Template</a>
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                      isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileUpload(); }}
                    onClick={handleFileUpload}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Drop CSV file here or click to browse</p>
                    <p className="text-[11px] text-muted-foreground mt-1">CSV format • Max 10MB</p>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <FileText className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium flex-1">{uploadedFile}</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                  )}
                </div>
              )}

              {/* Column Mapping Step */}
              {currentStep === 'mapping' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Columns className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Auto-detected Column Mapping</span>
                  </div>
                  <div className="rounded-lg border overflow-x-auto max-h-[280px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-[10px]">CSV Column</TableHead>
                          <TableHead className="text-[10px]">Mapped To</TableHead>
                          <TableHead className="text-[10px]">Confidence</TableHead>
                          <TableHead className="text-[10px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockColumnMappings.map((mapping, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-mono">{mapping.csvColumn}</TableCell>
                            <TableCell className="text-xs font-medium">{mapping.mappedField}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={cn('h-full rounded-full', mapping.confidence >= 90 ? 'bg-emerald-500' : mapping.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                                    style={{ width: `${mapping.confidence}%` }}
                                  />
                                </div>
                                <span className="text-[10px]">{mapping.confidence}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn('text-[9px]', mapping.status === 'auto' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}>
                                {mapping.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Validate Step */}
              {currentStep === 'validate' && (
                <div className="flex flex-col items-center justify-center py-8">
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-10 w-10 text-primary animate-spin mb-3" />
                      <p className="text-sm font-medium">Validating data...</p>
                      <p className="text-xs text-muted-foreground mt-1">Checking required fields, data types, and integrity</p>
                      <Progress value={60} className="max-w-[200px] h-1.5 mt-3" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
                      <p className="text-sm font-medium">Validation Complete</p>
                    </>
                  )}
                </div>
              )}

              {/* Preview Step */}
              {currentStep === 'preview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
                      <p className="text-base font-bold text-emerald-600">38</p>
                      <p className="text-[9px] text-muted-foreground">Valid</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
                      <p className="text-base font-bold text-red-600">2</p>
                      <p className="text-[9px] text-muted-foreground">Errors</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
                      <p className="text-base font-bold text-amber-600">1</p>
                      <p className="text-[9px] text-muted-foreground">Warnings</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 max-h-[120px] overflow-y-auto space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" /> 2 errors found
                    </div>
                    <p className="text-[11px] text-muted-foreground">Row 15: Credits - Expected numeric value</p>
                    <p className="text-[11px] text-muted-foreground">Row 28: Course Code - Required field is empty</p>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">38 valid records ready for submission</span>
                  </div>
                </div>
              )}

              {/* Submit Step */}
              {currentStep === 'submit' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-3" />
                  </motion.div>
                  <p className="text-base font-semibold">Submitted Successfully!</p>
                  <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
                    38 records submitted for verification. You&apos;ll be notified once approved.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={handleClose}>Close</Button>
                    <Button size="sm" onClick={handleReset}>Upload Another</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fixed Footer */}
        {showFooter && (
          <div className="flex items-center justify-between pt-3 border-t shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={!canGoBack}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              {getBackLabel()}
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              {getNextLabel()}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};