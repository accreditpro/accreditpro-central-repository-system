import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  FileImage,
  File,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Paperclip,
  Eye,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  dataUrl?: string;
}

export interface TPOEvidence {
  recordId: string;
  sections: Record<string, UploadedFile[]>;
}

export interface TPOEvidenceSectionConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  acceptedTypes: string[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

// ============================================================
// HELPERS
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <FileImage className="h-4 w-4 text-pink-500" />;
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('word') || type.includes('docx')) return <FileText className="h-4 w-4 text-blue-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function getFileExtension(filename: string): string {
  return '.' + filename.split('.').pop()?.toLowerCase() || '';
}

// ============================================================
// DROP ZONE COMPONENT
// ============================================================

interface DropZoneProps {
  sectionId: string;
  acceptedTypes: string[];
  onFilesSelected: (files: File[]) => void;
}

function DropZone({ sectionId, acceptedTypes, onFilesSelected }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const validateAndProcessFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const validFiles = files.filter((f) => {
        const ext = getFileExtension(f.name);
        const mimeOk = ACCEPTED_MIME_TYPES.includes(f.type);
        const extOk = acceptedTypes.includes(ext);
        const sizeOk = f.size <= MAX_FILE_SIZE;
        return (mimeOk || extOk) && sizeOk;
      });
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [acceptedTypes, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndProcessFiles(e.dataTransfer.files);
      }
    },
    [validateAndProcessFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndProcessFiles(e.target.files);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [validateAndProcessFiles]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        'relative rounded-lg border-2 border-dashed p-4 cursor-pointer transition-all duration-200',
        isDragOver
          ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div
          className={cn(
            'rounded-full p-2 transition-colors',
            isDragOver ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          <Upload className={cn('h-5 w-5', isDragOver && 'animate-bounce')} />
        </div>
        <p className="text-xs font-medium">
          {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-[10px] text-muted-foreground">
          or <span className="text-primary font-medium">click to browse</span>
        </p>
        <p className="text-[9px] text-muted-foreground">
          Supported: {acceptedTypes.join(', ')} • Max 10MB each
        </p>
      </div>
    </div>
  );
}

// ============================================================
// FILE CARD COMPONENT
// ============================================================

interface FileCardProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

function FileCard({ file, onRemove }: FileCardProps) {
  const isImage = file.type.startsWith('image/');

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="flex items-center gap-2 rounded-lg border border-border/50 bg-card p-2 pr-1 group hover:border-primary/30 transition-colors"
    >
      {isImage && file.dataUrl ? (
        <div className="h-8 w-8 rounded overflow-hidden shrink-0 bg-muted">
          <img
            src={file.dataUrl}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-8 w-8 rounded flex items-center justify-center bg-muted shrink-0">
          {getFileIcon(file.type)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate">{file.name}</p>
        <p className="text-[9px] text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isImage && file.dataUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => window.open(file.dataUrl, '_blank')}
            title="Preview"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => onRemove(file.id)}
          title="Remove file"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================
// EVIDENCE SUMMARY BADGE
// ============================================================

export function EvidenceBadge({ evidence }: { evidence: TPOEvidence | null }) {
  if (!evidence) {
    return (
      <Badge variant="outline" className="text-[9px] text-muted-foreground gap-1">
        <Paperclip className="h-2.5 w-2.5" />
        No docs
      </Badge>
    );
  }

  const totalFiles = Object.values(evidence.sections).reduce(
    (sum, files) => sum + files.length,
    0
  );

  if (totalFiles === 0) {
    return (
      <Badge variant="outline" className="text-[9px] text-muted-foreground gap-1">
        <Paperclip className="h-2.5 w-2.5" />
        No docs
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] gap-1">
      <FileText className="h-2.5 w-2.5" />
      {totalFiles} doc{totalFiles !== 1 ? 's' : ''}
    </Badge>
  );
}

// ============================================================
// MAIN DIALOG COMPONENT
// ============================================================

interface TPOEvidenceDialogProps {
  recordId: string;
  recordName: string;
  sectionTitle: string;
  open: boolean;
  onClose: () => void;
  onEvidenceChange?: (recordId: string, evidence: TPOEvidence) => void;
  initialEvidence?: TPOEvidence | null;
  sectionConfigs?: TPOEvidenceSectionConfig[];
}

export const DEFAULT_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'offer-letters',
    label: 'Offer Letters',
    description: 'Upload offer letters, appointment orders, and placement documents',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'internship-certificates',
    label: 'Internship Certificates',
    description: 'Upload internship certificates, offer letters, and completion reports',
    icon: <FileText className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'admission-proofs',
    label: 'Admission Proofs',
    description: 'Upload admission letters, scorecards, and higher education proofs',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'registration-docs',
    label: 'Registration Documents',
    description: 'Upload startup registration docs, funding proofs, training certificates',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

// ============================================================
// TAB-SPECIFIC EVIDENCE SECTION CONFIGS
// ============================================================

/** Recruiters: MoU, company profile, communication records */
export const RECRUITER_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'mou-agreements',
    label: 'MoU & Agreements',
    description: 'Upload Memoranda of Understanding, partnership agreements, and signed contracts',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'company-profile',
    label: 'Company Profile',
    description: 'Upload company registration docs, profile brochures, and introduction letters',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'placement-records',
    label: 'Placement Records',
    description: 'Upload previous year placement records, selection lists, and hiring statistics',
    icon: <FileText className="h-4 w-4 text-teal-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'communication',
    label: 'Communication Records',
    description: 'Upload email correspondence, visit schedules, and meeting notes',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Placement Offers: offer letters, appointment orders */
export const PLACEMENT_OFFER_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'offer-letters',
    label: 'Offer Letters',
    description: 'Upload placement offer letters issued to students',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'appointment-orders',
    label: 'Appointment Orders',
    description: 'Upload appointment orders, joining letters, and employment contracts',
    icon: <FileText className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Internships: offer letters, completion certificates */
export const INTERNSHIP_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'internship-offer-letters',
    label: 'Internship Offer Letters',
    description: 'Upload internship offer letters and confirmation documents',
    icon: <FileText className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'completion-certificates',
    label: 'Completion Certificates',
    description: 'Upload internship completion certificates, experience letters, and reports',
    icon: <FileText className="h-4 w-4 text-teal-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Higher Education: admission letters, scorecards */
export const HIGHER_EDUCATION_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'admission-letters',
    label: 'Admission Letters',
    description: 'Upload admission offer letters, acceptance letters, and I-20 documents',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'scorecards',
    label: 'Scorecards & Exam Results',
    description: 'Upload entrance exam scorecards, transcripts, and academic records',
    icon: <FileText className="h-4 w-4 text-violet-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'scholarship-docs',
    label: 'Scholarship Documents',
    description: 'Upload scholarship award letters, fellowship proofs, and financial aid docs',
    icon: <FileText className="h-4 w-4 text-fuchsia-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Training Activities: request letters, geo-tagged photos, materials, certificates */
export const TRAINING_ACTIVITIES_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'request-letters',
    label: 'Request Letters & Proposals',
    description: 'Upload training request letters, proposals, approvals, and authorization documents',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of training sessions, events, and workshops as visual evidence',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'training-materials',
    label: 'Training Materials',
    description: 'Upload presentations, handouts, workbooks, study materials, and other training resources',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.pptx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'certificates',
    label: 'Certificates & Completion Proofs',
    description: 'Upload certificates of completion, participation, and achievement issued to students',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'feedback-forms',
    label: 'Feedback & Evaluation Forms',
    description: 'Upload participant feedback forms, evaluation reports, and training effectiveness surveys',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'attendance-records',
    label: 'Attendance Records',
    description: 'Upload attendance sheets, sign-in registers, and participant rosters',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'budget-expenditure',
    label: 'Budget & Expenditure Proofs',
    description: 'Upload budget approvals, invoices, payment receipts, and expenditure statements',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
];

/** NSS: activity reports, geo-tagged photos, volunteer certificates, camp documents */
export const NSS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'activity-reports',
    label: 'Activity Reports',
    description: 'Upload NSS activity reports, village adoption documentation, and programme officer reports',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of NSS camps, activities, and community service events',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'volunteer-certificates',
    label: 'Volunteer Certificates',
    description: 'Upload volunteer service certificates, participation certificates, and achievement awards',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'camp-documents',
    label: 'Camp Documents',
    description: 'Upload special camp reports, daily diaries, camp schedules, and village survey reports',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'sdg-impact-reports',
    label: 'SDG Impact Reports',
    description: 'Upload SDG alignment reports, impact assessments, and beneficiary feedback summaries',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'attendance-records',
    label: 'Attendance Records',
    description: 'Upload volunteer attendance sheets, activity participation registers, and camp attendance',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'feedback-evaluation',
    label: 'Feedback & Evaluation',
    description: 'Upload feedback forms, evaluation reports, and programme assessment documents',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** NCC: camp certificates, geo-tagged photos, cadet certs, achievements */
export const NCC_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'camp-certificates',
    label: 'Camp Certificates',
    description: 'Upload CATC, ATC, NIC, and other NCC camp certificates and completion proofs',
    icon: <FileText className="h-4 w-4 text-orange-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of camps, parades, drills, and NCC events',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'cadet-certificates',
    label: 'Cadet Certificates',
    description: 'Upload B Certificate and C Certificate documents issued to cadets',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'achievements',
    label: 'Achievements & Awards',
    description: 'Upload RDC selection proofs, best cadet awards, and special achievement documents',
    icon: <FileText className="h-4 w-4 text-yellow-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'attendance-records',
    label: 'Attendance & Parade Records',
    description: 'Upload parade attendance rolls, camp attendance registers, and drill participation records',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'annual-reports',
    label: 'Annual Reports',
    description: 'Upload NCC annual training reports, unit inspection reports, and quarterly summaries',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'enrollment-docs',
    label: 'Enrollment Documents',
    description: 'Upload cadet enrollment forms, medical certificates, and parent consent documents',
    icon: <FileText className="h-4 w-4 text-violet-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Sports Activities: event certificates, geo-tagged photos, result sheets, venue proofs */
export const SPORTS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'event-certificates',
    label: 'Event Certificates',
    description: 'Upload participation certificates, winner certificates, and merit awards from sports events',
    icon: <FileText className="h-4 w-4 text-yellow-600" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of sports events, matches, tournaments, and award ceremonies',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'result-sheets',
    label: 'Scorecards & Result Sheets',
    description: 'Upload match scorecards, result sheets, points tables, and event outcomes',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'venue-proofs',
    label: 'Venue & Infrastructure Proofs',
    description: 'Upload venue booking documents, ground maintenance records, and infrastructure proofs',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-coverage',
    label: 'Media Coverage',
    description: 'Upload news clippings, press releases, social media posts, and media coverage of events',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'selection-reports',
    label: 'Selection & Participation Records',
    description: 'Upload team selection lists, athlete registration forms, and participation rosters',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Cultural Activities: brochures, geo-tagged photos, certificates, event reports */
export const CULTURAL_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'event-brochures',
    label: 'Brochures & Invitations',
    description: 'Upload event brochures, invitation cards, posters, and promotional materials',
    icon: <FileText className="h-4 w-4 text-pink-600" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of cultural events, performances, and competitions',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'certificates',
    label: 'Certificates & Awards',
    description: 'Upload participation certificates, winner trophies, and award citations from events',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'event-reports',
    label: 'Event Reports & Proceedings',
    description: 'Upload event reports, programme schedules, scripts, and event proceedings',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'budget-proofs',
    label: 'Budget & Expenditure Proofs',
    description: 'Upload budget approvals, sponsorship letters, invoices, and expense receipts',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-video',
    label: 'Media & Video Proofs',
    description: 'Upload video recordings, media coverage links, photo albums, and highlight reels',
    icon: <FileText className="h-4 w-4 text-violet-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
];

/** Events: event reports, geo-tagged photos, guest speaker docs, budgets */
export const EVENTS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'event-reports',
    label: 'Event Reports & Proceedings',
    description: 'Upload event reports, programme schedules, proceedings, and outcome summaries',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of events, sessions, ceremonies, and group photos',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'guest-speaker-docs',
    label: 'Guest Speaker Documents',
    description: 'Upload speaker profiles, consent letters, honorarium proofs, and travel documents',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'budget-sponsorship',
    label: 'Budget & Sponsorship Proofs',
    description: 'Upload budget approvals, sponsorship letters, invoices, and expenditure receipts',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'certificates-awards',
    label: 'Certificates & Awards',
    description: 'Upload participation certificates, winner awards, and commendation letters',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-coverage',
    label: 'Media Coverage',
    description: 'Upload news clippings, press releases, social media coverage, and video recordings',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'participant-registrations',
    label: 'Participant Registration Lists',
    description: 'Upload registration forms, participant lists, attendance sheets, and feedback forms',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
];

/** Student Achievements: certificates, competition proofs, award letters */
export const STUDENT_ACHIEVEMENTS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'achievement-certificates',
    label: 'Achievement Certificates',
    description: 'Upload certificates of achievement, merit, and recognition from competitions and events',
    icon: <FileText className="h-4 w-4 text-yellow-600" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'competition-proofs',
    label: 'Competition Proofs',
    description: 'Upload competition brochures, problem statements, participation proofs, and result sheets',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'award-letters',
    label: 'Award Letters & Citations',
    description: 'Upload award letters, citation documents, prize certificates, and commendation orders',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of award ceremonies, competition events, and recognition felicitations',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-coverage',
    label: 'Media & Publication Proofs',
    description: 'Upload news articles, social media highlights, publication proofs, and interview recordings',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
];

/** Extension Activities: activity reports, geo-tagged photos, beneficiary feedback, collaboration docs */
export const EXTENSION_ACTIVITIES_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'activity-reports',
    label: 'Activity Reports',
    description: 'Upload detailed activity reports, project documentation, and program outcome summaries',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of extension activities, community sessions, and field visits',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'beneficiary-feedback',
    label: 'Beneficiary Feedback',
    description: 'Upload beneficiary feedback forms, testimonial letters, impact assessment surveys',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'collaboration-docs',
    label: 'Collaboration Documents',
    description: 'Upload collaboration agreements, MoUs with partner organizations, and consent letters',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'sdg-impact',
    label: 'SDG Impact Reports',
    description: 'Upload SDG alignment assessments, impact metrics, and sustainable development reports',
    icon: <FileText className="h-4 w-4 text-teal-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'attendance-records',
    label: 'Attendance Records',
    description: 'Upload student participation registers, volunteer attendance sheets, and community member lists',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Community Outreach: program reports, geo-tagged photos, certificates, outcome proofs */
export const COMMUNITY_OUTREACH_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'program-reports',
    label: 'Program Reports',
    description: 'Upload program reports, event summaries, and detailed outcome documentation',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of outreach events, drives, camps, and activities',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'certificates-appreciation',
    label: 'Certificates & Appreciation',
    description: 'Upload appreciation letters, certificates of participation, and commendation documents',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'collaboration-sponsorship',
    label: 'Collaboration & Sponsorship Proofs',
    description: 'Upload collaboration MoUs, sponsorship letters, and partner organization documents',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-coverage',
    label: 'Media Coverage',
    description: 'Upload news clippings, press releases, social media coverage, and video recordings',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'beneficiary-feedback',
    label: 'Beneficiary Feedback',
    description: 'Upload beneficiary feedback forms, impact surveys, and testimonial letters',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'outcome-proofs',
    label: 'Outcome Proofs',
    description: 'Upload outcome reports, beneficiary statistics, and measurable impact documentation',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
];

/** Clubs & Societies: meeting minutes, event reports, photos, membership records */
export const CLUBS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'meeting-minutes',
    label: 'Meeting Minutes & Agendas',
    description: 'Upload club meeting minutes, agenda documents, attendance records, and resolution summaries',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'activity-reports',
    label: 'Activity Reports',
    description: 'Upload activity reports, event summaries, project documentation, and achievement reports',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of club events, workshops, competitions, and activities',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'membership-records',
    label: 'Membership Records',
    description: 'Upload membership registers, enrollment forms, committee lists, and membership certificates',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'award-certificates',
    label: 'Awards & Recognition Certificates',
    description: 'Upload award certificates, merit recognition, appreciation letters, and achievement proofs',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'budget-financial',
    label: 'Budget & Financial Documents',
    description: 'Upload budget proposals, financial statements, expenditure approvals, and funding proofs',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'promotional-materials',
    label: 'Promotional Materials',
    description: 'Upload brochures, posters, social media posts, newsletters, and publicity materials',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'affiliation-docs',
    label: 'Affiliation & Registration Documents',
    description: 'Upload society affiliation proofs, registration certificates, renewal documents, and governing body approvals',
    icon: <FileText className="h-4 w-4 text-violet-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Student Chapters: annual reports, event docs, membership proofs */
export const STUDENT_CHAPTERS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'annual-reports',
    label: 'Annual Reports',
    description: 'Upload chapter annual reports, activity summaries, and yearly achievement documentation',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'event-documentation',
    label: 'Event Documentation',
    description: 'Upload event reports, conference proceedings, workshop materials, and seminar documentation',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of chapter events, conferences, workshops, and meetings',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'membership-proofs',
    label: 'Membership Proofs',
    description: 'Upload membership registration lists, society membership certificates, and enrollment proofs',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'award-recognition',
    label: 'Awards & Recognition',
    description: 'Upload chapter awards, best chapter certificates, appreciation letters, and recognition proofs',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'publication-proofs',
    label: 'Publication & Research Proofs',
    description: 'Upload paper publications, conference proceedings, research output, and technical reports',
    icon: <FileText className="h-4 w-4 text-teal-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'society-correspondence',
    label: 'Society Correspondence',
    description: 'Upload communication with parent society, approval letters, compliance documents, and renewal proofs',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Student Awards: certificate proofs, award citations, photos */
export const STUDENT_AWARDS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'award-certificates',
    label: 'Award Certificates',
    description: 'Upload award certificates, medal citations, honor certificates, and commendation documents',
    icon: <FileText className="h-4 w-4 text-yellow-600" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'award-letters',
    label: 'Award Letters & Citations',
    description: 'Upload official award letters, commendation orders, scholarship award letters, and citation documents',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of award ceremonies, felicitation events, and honor presentations',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'selection-criteria',
    label: 'Selection Criteria & Nomination Docs',
    description: 'Upload nomination forms, selection criteria documents, recommendation letters, and merit lists',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-publicity',
    label: 'Media & Publicity Proofs',
    description: 'Upload news clippings, press releases, social media highlights, and institutional announcements',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'prize-monetary',
    label: 'Prize & Monetary Award Proofs',
    description: 'Upload prize distribution proofs, cheque disbursement records, scholarship disbursement proofs',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
];

/** Entrepreneurship: registration docs, funding proofs */
export const ENTREPRENEURSHIP_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'registration-docs',
    label: 'Registration Documents',
    description: 'Upload startup registration certificates, incorporation documents, and licenses',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'funding-proofs',
    label: 'Funding Proofs',
    description: 'Upload funding documents, investor agreements, and financial statements',
    icon: <FileText className="h-4 w-4 text-orange-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'incubation-docs',
    label: 'Incubation & Training',
    description: 'Upload incubation center documents, training certificates, and workshop proofs',
    icon: <FileText className="h-4 w-4 text-yellow-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

export function TPOEvidenceDialog({
  recordId,
  recordName,
  sectionTitle,
  open,
  onClose,
  onEvidenceChange,
  initialEvidence,
  sectionConfigs = DEFAULT_EVIDENCE_SECTIONS,
}: TPOEvidenceDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>(() => {
    const initial: Record<string, UploadedFile[]> = {};
    const configs = sectionConfigs;
    configs.forEach((s) => {
      initial[s.id] = initialEvidence?.sections[s.id] || [];
    });
    return initial;
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFilesSelected = useCallback(
    (sectionId: string, files: File[]) => {
      const newUploadedFiles: UploadedFile[] = files.map((f) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
        dataUrl: URL.createObjectURL(f),
      }));

      setUploadedFiles((prev) => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), ...newUploadedFiles],
      }));

      setUploadSuccess(
        `${newUploadedFiles.length} file(s) added to ${
          sectionConfigs.find((s) => s.id === sectionId)?.label
        }`
      );
      setTimeout(() => setUploadSuccess(null), 3000);
    },
    [sectionConfigs]
  );

  const handleRemoveFile = useCallback((sectionId: string, fileId: string) => {
    setUploadedFiles((prev) => {
      const sectionFiles = prev[sectionId] || [];
      const fileToRemove = sectionFiles.find((f) => f.id === fileId);
      if (fileToRemove?.dataUrl) {
        URL.revokeObjectURL(fileToRemove.dataUrl);
      }
      return {
        ...prev,
        [sectionId]: sectionFiles.filter((f) => f.id !== fileId),
      };
    });
  }, []);

  const handleClose = () => {
    const evidence: TPOEvidence = {
      recordId,
      sections: uploadedFiles,
    };
    onEvidenceChange?.(recordId, evidence);
    onClose();
  };

  const allExpanded = expandedSections.size === sectionConfigs.length;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(sectionConfigs.map((s) => s.id)));
    }
  };

  const totalFiles = Object.values(uploadedFiles).reduce((sum, files) => sum + files.length, 0);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Paperclip className="h-5 w-5 text-primary" />
            {sectionTitle} — {recordName}
          </DialogTitle>
          <DialogDescription>
            Upload and manage supporting documents for this record
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 shrink-0"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-medium text-emerald-700">{uploadSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-3 px-1 text-xs text-muted-foreground overflow-x-auto flex-1 min-w-0">
            <span className="font-semibold text-foreground whitespace-nowrap">{totalFiles} total files</span>
            {sectionConfigs.map((s) => {
              const count = uploadedFiles[s.id]?.length || 0;
              return (
                <span key={s.id} className="flex items-center gap-1 whitespace-nowrap">
                  {s.icon}
                  <span>{count}</span>
                </span>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] shrink-0 px-2"
            onClick={toggleAll}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>

        <Separator className="shrink-0" />

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3">
          {sectionConfigs.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const files = uploadedFiles[section.id] || [];

            return (
              <div
                key={section.id}
                className="rounded-lg border border-border/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  {section.icon}
                  <span className="text-xs font-semibold flex-1">{section.label}</span>
                  <Badge
                    variant={files.length > 0 ? 'secondary' : 'outline'}
                    className="text-[9px]"
                  >
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </Badge>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`content-${section.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="p-3 space-y-3">
                        <p className="text-[10px] text-muted-foreground">{section.description}</p>

                        <DropZone
                          sectionId={section.id}
                          acceptedTypes={section.acceptedTypes}
                          onFilesSelected={(files) => handleFilesSelected(section.id, files)}
                        />

                        {files.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-medium text-muted-foreground">
                              Uploaded Documents
                            </p>
                            <AnimatePresence>
                              {files.map((file) => (
                                <FileCard
                                  key={file.id}
                                  file={file}
                                  onRemove={(id) => handleRemoveFile(section.id, id)}
                                />
                              ))}
                            </AnimatePresence>
                            {files.length > 3 && (
                              <p className="text-[9px] text-muted-foreground text-center pt-1">
                                {files.length} file{files.length !== 1 ? 's' : ''} uploaded
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t shrink-0">
          <p className="text-[10px] text-muted-foreground">
            Accepted formats: PDF, DOCX, PNG, JPG (max 10MB each)
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Close
            </Button>
            <Button size="sm" onClick={handleClose}>
              Save & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Legacy alias for backward compatibility
export { TPOEvidenceDialog as RecruiterEvidenceDialog };
