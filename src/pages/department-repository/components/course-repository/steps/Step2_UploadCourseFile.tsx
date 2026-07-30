import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { CourseFileData } from '../types';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  X,
  Save,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ImageIcon,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface Step2Props {
  data: CourseFileData | null;
  onUpdate: (data: CourseFileData) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

const ACCEPTED_TYPES = [
  { ext: 'PDF', color: 'bg-red-500/10 text-red-600', icon: FileText },
  { ext: 'DOCX', color: 'bg-indigo-500/10 text-indigo-600', icon: FileText },
  { ext: 'PNG', color: 'bg-blue-500/10 text-blue-600', icon: ImageIcon },
  { ext: 'JPG', color: 'bg-cyan-500/10 text-cyan-600', icon: ImageIcon },
];

const ACCEPT_EXTENSIONS = '.pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.webp';

export default function Step2_UploadCourseFile({ data, onUpdate, onSave, onNext, onPrev, completionPercentage }: Step2Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      onUpdate({
        fileName: file.name,
        fileSize: file.size,
        file, // Store the actual file object for API upload in Step 3
        uploadedAt: new Date().toISOString(),
        courseObjectives: [],
        units: [],
        topics: [],
        textBooks: [],
        referenceBooks: [],
        preRequisites: [],
      });
      setIsUploading(false);
    }, 1000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const fileArray = Array.from(e.dataTransfer.files);
    if (fileArray.length > 0) {
      processFiles(fileArray);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => {
    onUpdate({
      fileName: '',
      fileSize: 0,
      uploadedAt: '',
      courseObjectives: [],
      units: [],
      topics: [],
      textBooks: [],
      referenceBooks: [],
      preRequisites: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Upload Course File
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Upload the course syllabus file (extraction happens in the next step)</p>
        </div>
        <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
      </div>
      <Separator />

      {/* Upload Zone / Uploaded File */}
      {!data?.fileName ? (
        <>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_EXTENSIONS}
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              'relative overflow-hidden p-10 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center group',
              isDragging
                ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10 scale-[1.01]'
                : 'border-border/40 hover:border-indigo-400/40 hover:bg-indigo-500/[0.02] hover:shadow-md',
              isUploading && 'pointer-events-none opacity-60',
            )}
          >
            {/* Animated background glow on drag */}
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"
              />
            )}

            {/* Drag Over State */}
            {isDragging && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-indigo-500/5 backdrop-blur-[2px] z-10"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                    <Upload className="h-8 w-8 text-indigo-600 relative animate-bounce" />
                  </div>
                  <p className="text-sm font-bold text-indigo-600">Drop files here</p>
                  <p className="text-[10px] text-indigo-500/70">Release to upload</p>
                </div>
              </motion.div>
            )}

            {/* Uploading State */}
            {isUploading ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                  <Loader2 className="h-10 w-10 text-indigo-600 animate-spin relative" />
                </div>
                <p className="text-sm font-semibold text-indigo-600">Uploading File...</p>
                <p className="text-xs text-muted-foreground">Transferring and verifying the course file</p>
              </div>
            ) : (
              /* Default State */
              <div className={cn('transition-all', isDragging && 'opacity-20')}>
                {/* Upload icon with decorative circles */}
                <div className="relative mx-auto mb-4 w-16 h-16">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors" />
                  <div className="absolute inset-2 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                  <Upload className="absolute inset-0 m-auto h-7 w-7 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                </div>

                <p className="text-sm font-semibold text-foreground/80">
                  <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline decoration-indigo-300/50 underline-offset-2">
                    Click to upload
                  </span>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 mb-4">
                  Supported files up to 25MB each
                </p>

                {/* Format badges */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {ACCEPTED_TYPES.map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <span
                        key={fmt.ext}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold border',
                          fmt.color,
                          'border-current/20',
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {fmt.ext}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Info Card */}
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-semibold">Course File Upload</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Upload your course syllabus (PDF, DOCX, or image). The AI-powered course analysis and data extraction
                  will be performed in the next step.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Uploaded File Info - Simple Success State */}
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-green-500/10">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    File uploaded successfully!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The file is ready. Proceed to <strong>AI Course Analysis</strong> in the next step to extract course data.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">{data.fileName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({(data.fileSize / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="gap-2 mt-1 text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Re-upload File
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: Course Details
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2" disabled={!data?.fileName}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={onNext}
            disabled={!data?.fileName}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            Next: AI Course Analysis
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
