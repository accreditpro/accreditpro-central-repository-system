import { Badge } from '@/components/ui/badge';
import { Paperclip, FileText } from 'lucide-react';
import { ExaminationEvidenceFile, useEvidenceStore } from '../evidence-store';
import {
  EvidenceUploadDialog,
  EvidenceUploadResult,
} from '@/components/shared/EvidenceUploadDialog';
import type { EvidenceCategory, UploadedFile } from '@/components/shared/EvidenceUploadDialog';

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
        <Paperclip className="h-2.5 w-2.5" />
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
// MAIN EVIDENCE DIALOG
// ============================================================

interface ExaminationEvidenceDialogProps {
  recordId: string;
  recordTitle: string;
  moduleId: string;
  moduleLabel: string;
  open: boolean;
  onClose: () => void;
  existingFiles?: ExaminationEvidenceFile[];
}

export function ExaminationEvidenceDialog({
  recordId,
  recordTitle,
  moduleId,
  moduleLabel,
  open,
  onClose,
  existingFiles = [],
}: ExaminationEvidenceDialogProps) {
  const { addEvidence, removeEvidence } = useEvidenceStore();

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
      .filter((f) => f.category === s.id)
      .map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.recordedAt,
        dataUrl: f.dataUrl,
      }));
  });

  const handleSave = (result: EvidenceUploadResult) => {
    const now = new Date().toISOString();
    const existingIds = new Set(existingFiles.map((f) => f.id));
    const finalIds = new Set(Object.values(result.files).flat().map((f) => f.id));

    // Remove files that were deleted in this session
    existingFiles.forEach((f) => {
      if (!finalIds.has(f.id)) removeEvidence(f.id);
    });

    // Add newly uploaded files
    const filesToAdd: ExaminationEvidenceFile[] = [];
    Object.entries(result.files).forEach(([sectionId, files]) => {
      files.forEach((f) => {
        if (existingIds.has(f.id)) return;
        filesToAdd.push({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          recordedAt: now,
          dataUrl: f.dataUrl,
          category: sectionId,
          moduleId,
          moduleLabel,
          recordTitle,
        });
      });
    });

    if (filesToAdd.length > 0) {
      addEvidence(filesToAdd);
    }
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
