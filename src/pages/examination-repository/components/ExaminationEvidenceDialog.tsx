import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  EvidenceUploadDialog,
  EvidenceUploadResult,
  UploadedFile,
} from '@/components/shared/EvidenceUploadDialog';
import type { EvidenceCategory } from '@/components/shared/EvidenceUploadDialog';
import {
  examinationRepositoryService,
  ExaminationEvidenceFile,
} from '@/services/examination-repository.service';

// ============================================================
// TYPES
// ============================================================

export interface EvidenceSectionConfig {
  id: string;
  label: string;
  description: string;
  acceptedTypes: string[];
  folderId?: string;
}

// ============================================================
// EVIDENCE BADGE (for table display)
// ============================================================

interface EvidenceBadgeProps {
  totalFiles: number;
  sections: { id: string; count: number }[];
}

export function FileCountBadge({ totalFiles, sections }: EvidenceBadgeProps) {
  if (totalFiles === 0) {
    return (
      <Badge variant="outline" className="text-[9px] text-muted-foreground gap-1">
        No docs
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] gap-1">
      <FileText className="h-2.5 w-2.5" />
      {totalFiles} file{totalFiles !== 1 ? 's' : ''}
    </Badge>
  );
}

// ============================================================
// EVIDENCE SECTION CONFIGS
// ============================================================

/** Examination Schedules evidence sections */
export const SCHEDULE_EVIDENCE_SECTIONS: EvidenceSectionConfig[] = [
  {
    id: 'schedule-document',
    label: 'Schedule Document',
    description: 'Upload the official examination schedule PDF or document',
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
    folderId: 'examination-schedules',
  },
];

/** Examination Circulars evidence sections */
export const CIRCULAR_EVIDENCE_SECTIONS: EvidenceSectionConfig[] = [
  {
    id: 'circular-pdf',
    label: 'Circular PDF',
    description: 'Upload the official circular PDF document',
    acceptedTypes: ['.pdf'],
    folderId: 'examination-circulars',
  },
];

/** Result Publications evidence sections */
export const RESULT_EVIDENCE_SECTIONS: EvidenceSectionConfig[] = [
  {
    id: 'result-gazette',
    label: 'Result Gazette',
    description: 'Upload the official result gazette PDF',
    acceptedTypes: ['.pdf'],
    folderId: 'result-publications',
  },
  {
    id: 'result-summary',
    label: 'Result Summary',
    description: 'Upload result summary statistics or data',
    acceptedTypes: ['.pdf', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg'],
    folderId: 'result-publications',
  },
];

/** Supplementary Examinations evidence sections */
export const SUPPLEMENTARY_EVIDENCE_SECTIONS: EvidenceSectionConfig[] = [
  {
    id: 'notification',
    label: 'Notification',
    description: 'Upload the supplementary examination notification',
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
    folderId: 'supplementary-examinations',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    description: 'Upload the supplementary examination schedule',
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.xls'],
    folderId: 'supplementary-examinations',
  },
];

/** Map module config IDs to their evidence section configs */
export const MODULE_EVIDENCE_SECTIONS: Record<string, EvidenceSectionConfig[]> = {
  'examination-schedules': SCHEDULE_EVIDENCE_SECTIONS,
  'examination-circulars': CIRCULAR_EVIDENCE_SECTIONS,
  'result-publications': RESULT_EVIDENCE_SECTIONS,
  'supplementary-examinations': SUPPLEMENTARY_EVIDENCE_SECTIONS,
};

// ============================================================
// MAIN EVIDENCE DIALOG (server-backed)
// ============================================================

interface ExaminationEvidenceDialogProps {
  /** Backend UUID of the parent record */
  recordId: string;
  recordTitle: string;
  moduleId: string;
  moduleLabel: string;
  academicYear: string;
  open: boolean;
  onClose: () => void;
  /** Persisted evidence for this record (from the backend) */
  existingFiles?: ExaminationEvidenceFile[];
  /** Invoked after any change so the caller can refresh its evidence list */
  onChanged?: () => void;
}

export function ExaminationEvidenceDialog({
  recordId,
  recordTitle,
  moduleId,
  moduleLabel,
  academicYear,
  open,
  onClose,
  existingFiles = [],
  onChanged,
}: ExaminationEvidenceDialogProps) {
  const sectionConfigs = MODULE_EVIDENCE_SECTIONS[moduleId] || SCHEDULE_EVIDENCE_SECTIONS;

  const categories: EvidenceCategory[] = sectionConfigs.map((s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
    icon: <FileText className="h-4 w-4 text-primary" />,
    acceptedTypes: s.acceptedTypes,
  }));

  // Group persisted files by section id so they pre-populate the dialog
  const initialFiles: Record<string, UploadedFile[]> = {};
  sectionConfigs.forEach((s) => {
    initialFiles[s.id] = existingFiles
      .filter((f) => f.sectionId === s.id)
      .map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt,
      }));
  });

  /**
   * Save & Close: deletes removed files and uploads newly added files via the
   * backend. Throws when any operation fails so the dialog stays open and the
   * caller can surface the error.
   */
  const handleSave = async (result: EvidenceUploadResult): Promise<void> => {
    const existingIds = new Set(existingFiles.map((f) => f.id));
    const finalIds = new Set(Object.values(result.files).flat().map((f) => f.id));
    const errors: string[] = [];

    // Files removed in this session → delete on the server
    const toDelete = existingFiles.filter((f) => !finalIds.has(f.id));
    for (const f of toDelete) {
      try {
        await examinationRepositoryService.deleteEvidence(f.id);
      } catch {
        errors.push(`Could not delete ${f.name}`);
      }
    }

    // Newly added files → upload
    for (const [sectionId, files] of Object.entries(result.files)) {
      for (const f of files) {
        if (existingIds.has(f.id)) continue;
        if (!f.file) {
          errors.push(`Missing file data for ${f.name}`);
          continue;
        }
        try {
          await examinationRepositoryService.uploadEvidence({
            file: f.file,
            academicYear,
            moduleId,
            recordId,
            sectionId,
            recordTitle,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'unknown error';
          errors.push(`Could not upload ${f.name}: ${msg}`);
        }
      }
    }

    if (errors.length > 0) {
      toast.error(
        `${errors.length} operation${errors.length > 1 ? 's' : ''} failed. ${errors[0]}`
      );
      throw new Error('Some document operations failed');
    }

    toast.success('Documents saved successfully');
    onChanged?.();
  };

  return (
    <EvidenceUploadDialog
      open={open}
      onClose={onClose}
      title={recordTitle}
      subtitle={`Upload and manage supporting documents for this ${moduleLabel.toLowerCase()}`}
      categories={categories}
      initialFiles={initialFiles}
      onSave={handleSave}
      onCancel={() => {
        // Dismiss without persisting — changes are only committed via Save & Close
      }}
    />
  );
}
