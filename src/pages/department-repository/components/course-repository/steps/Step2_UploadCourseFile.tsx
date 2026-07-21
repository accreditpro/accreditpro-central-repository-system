import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { CourseFileData, CourseUnit, Book } from '../types';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  Save,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  BookMarked,
  Link,
  Loader2,
  ImageIcon,
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
  const [showEditor, setShowEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate parsing course file
  const simulateParsing = () => {
    setIsUploading(true);
    setTimeout(() => {
      const mockData: CourseFileData = {
        fileName: 'CS501_Machine_Learning_Syllabus.pdf',
        fileSize: 245000,
        uploadedAt: new Date().toISOString(),
        courseObjectives: [
          'Understand fundamental concepts of machine learning',
          'Apply supervised and unsupervised learning algorithms',
          'Evaluate model performance using appropriate metrics',
          'Design and implement machine learning solutions for real-world problems',
          'Analyze and interpret results from ML models',
        ],
        units: [
          { id: 'u1', title: 'Introduction to Machine Learning', topics: ['What is ML?', 'Types of ML', 'Applications', 'History & Trends'], hours: 8 },
          { id: 'u2', title: 'Supervised Learning', topics: ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'SVM'], hours: 12 },
          { id: 'u3', title: 'Unsupervised Learning', topics: ['K-Means', 'Hierarchical Clustering', 'PCA', 'Anomaly Detection'], hours: 10 },
          { id: 'u4', title: 'Neural Networks & Deep Learning', topics: ['Perceptron', 'Multi-layer NN', 'Backpropagation', 'CNN Basics'], hours: 12 },
          { id: 'u5', title: 'Model Evaluation & Deployment', topics: ['Cross-validation', 'Metrics', 'Overfitting/Underfitting', 'MLOps Basics'], hours: 8 },
        ],
        topics: [
          'Supervised Learning', 'Unsupervised Learning', 'Regression', 'Classification', 'Clustering',
          'Neural Networks', 'Deep Learning', 'Model Evaluation', 'Feature Engineering', 'Ensemble Methods',
        ],
        textBooks: [
          { id: 'b1', title: 'Pattern Recognition and Machine Learning', author: 'Christopher Bishop', edition: '1st', publisher: 'Springer' },
          { id: 'b2', title: 'The Elements of Statistical Learning', author: 'Hastie, Tibshirani, Friedman', edition: '2nd', publisher: 'Springer' },
        ],
        referenceBooks: [
          { id: 'r1', title: 'Machine Learning: A Probabilistic Perspective', author: 'Kevin Murphy', publisher: 'MIT Press' },
          { id: 'r2', title: 'Hands-On Machine Learning with Scikit-Learn', author: 'Aurélien Géron', edition: '2nd', publisher: 'O\'Reilly' },
        ],
        preRequisites: ['Programming in Python', 'Basic Probability & Statistics', 'Linear Algebra'],
      };
      onUpdate(mockData);
      setIsUploading(false);
      setShowEditor(true);
    }, 2000);
  };

  const processFiles = (files: File[]) => {
    if (files.length > 0) {
      simulateParsing();
    }
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
    setShowEditor(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Upload Course File
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Upload the course syllabus — AI will extract and populate the data</p>
        </div>
        <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
      </div>
      <Separator />

      {/* Upload Zone / Parsed Data */}
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

          {/* Drag & Drop Zone — Polished */}
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

            {/* Drag Over State — Full Overlay */}
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
                <p className="text-sm font-semibold text-indigo-600">Analyzing Course File...</p>
                <p className="text-xs text-muted-foreground">Extracting objectives, units, topics, and references</p>
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
                <p className="text-xs font-semibold">AI-Powered Syllabus Parsing</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Upload your course syllabus (PDF, DOCX, or image) and our AI engine will automatically extract course
                  objectives, unit structure, topics, textbooks, and prerequisites — ready for OBE workflow.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Uploaded File Info */}
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{data.fileName}</p>
                    <p className="text-[10px] text-muted-foreground">Uploaded successfully • AI extraction complete</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleRemove}>
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Parsed Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Course Objectives */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Course Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {data.courseObjectives.map((obj, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Units */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                    Units ({data.units.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.units.map((unit) => (
                      <div key={unit.id} className="p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">{unit.title}</p>
                          <Badge variant="outline" className="text-[9px]">{unit.hours} hrs</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{unit.topics.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Text Books */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <BookMarked className="h-3.5 w-3.5 text-blue-600" />
                    Text Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.textBooks.map((book) => (
                      <div key={book.id} className="text-xs text-muted-foreground">
                        <span className="font-medium">{book.title}</span> — {book.author}
                        {book.edition && <span> ({book.edition} ed.)</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reference Books */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <Link className="h-3.5 w-3.5 text-purple-600" />
                    Reference Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.referenceBooks.map((book) => (
                      <div key={book.id} className="text-xs text-muted-foreground">
                        <span className="font-medium">{book.title}</span> — {book.author}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </AnimatePresence>
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
