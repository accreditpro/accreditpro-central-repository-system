import { toast } from 'sonner';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  BookMarked,
  UsersRound,
  Building2,
  Users2,
} from 'lucide-react';
import type { EvidencePreviewData } from '@/components/shared/EvidencePreviewDialog';
import { evidenceReviewKey } from '@/store/slices/evidenceReviewSlice';
import { hodService } from '@/services/hod.service';
import { EvidenceItem } from '../hod-configs';

// ---------------------------------------------------------------------------
// Shared presentation helpers for the HOD Evidence Review & Approval Queue
// ---------------------------------------------------------------------------

export const STATUS_META: Record<EvidenceItem['status'], { label: string; badge: string; dot: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  approved: { label: 'Approved', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  'changes-requested': { label: 'Changes Requested', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', dot: 'bg-purple-500' },
};

export const REPO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Academic: GraduationCap,
  Course: BookMarked,
  Faculty: Users,
  Student: BookOpen,
  Research: FlaskConical,
  'Student Dev': UsersRound,
  Infrastructure: Building2,
  Alumni: Users2,
};

export const REPO_ACCENT: Record<string, string> = {
  Academic: 'text-violet-600 bg-violet-500/10 border-violet-500/30',
  Course: 'text-sky-600 bg-sky-500/10 border-sky-500/30',
  Faculty: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
  Student: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  Research: 'text-pink-600 bg-pink-500/10 border-pink-500/30',
  'Student Dev': 'text-rose-600 bg-rose-500/10 border-rose-500/30',
  Infrastructure: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  Alumni: 'text-teal-600 bg-teal-500/10 border-teal-500/30',
};

export function getFileIcon(item: EvidenceItem) {
  switch (item.fileType) {
    case 'pdf': return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
    case 'image': return <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />;
    case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-500 shrink-0" />;
    default: return <FileText className="h-4 w-4 text-indigo-500 shrink-0" />;
  }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Preview / Download — backed by the real evidence API (authenticated stream)
// ---------------------------------------------------------------------------

const blobUrlCache = new Map<string, string>();

/**
 * Downloads the evidence file through the authenticated download endpoint
 * (short-lived, streamed by the backend — never a public URL).
 */
export async function downloadItem(item: EvidenceItem): Promise<void> {
  try {
    await hodService.downloadEvidence(item.id, item.documentName);
    toast.success(`Downloading ${item.documentName}`);
  } catch {
    toast.error(`Failed to download ${item.documentName}`);
  }
}

/**
 * Builds preview data for the shared EvidencePreviewDialog by fetching the
 * evidence blob from the backend and creating a local object URL.
 */
export async function buildPreviewData(item: EvidenceItem): Promise<EvidencePreviewData> {
  let dataUrl = blobUrlCache.get(item.id);
  if (!dataUrl) {
    try {
      const blob = await hodService.getEvidenceBlob(item.id);
      dataUrl = URL.createObjectURL(blob);
      blobUrlCache.set(item.id, dataUrl);
    } catch {
      dataUrl = '';
    }
  }
  return {
    id: item.id,
    fileName: item.documentName,
    fileType: item.fileType === 'image' ? 'png' : item.fileType === 'excel' ? 'xlsx' : item.fileType === 'doc' ? 'doc' : 'pdf',
    fileSize: item.fileSize ?? '',
    dataUrl,
    uploadedAt: formatDate(item.uploadDate),
    uploadedBy: item.uploadedBy,
    status: item.status === 'pending' ? 'under-review' : item.status,
    category: `${item.repository} • ${item.section}`,
  };
}

// ---------------------------------------------------------------------------
// Shared-store sync
// ---------------------------------------------------------------------------

export interface EvidenceGroup {
  section: string;
  items: EvidenceItem[];
}

export interface RepoGroup {
  repository: string;
  sections: EvidenceGroup[];
  total: number;
}

/** Group evidence items by repository → section (category), in a stable order. */
export function buildRepoGroups(filteredItems: EvidenceItem[]): RepoGroup[] {
  const map = new Map<string, RepoGroup>();
  for (const item of filteredItems) {
    let group = map.get(item.repository);
    if (!group) {
      group = { repository: item.repository, sections: [], total: 0 };
      map.set(item.repository, group);
    }
    let section = group.sections.find((s) => s.section === item.section);
    if (!section) {
      section = { section: item.section, items: [] };
      group.sections.push(section);
    }
    section.items.push(item);
    group.total += 1;
  }
  const order = ['Academic', 'Course', 'Faculty', 'Student', 'Research', 'Student Dev', 'Infrastructure', 'Alumni'];
  return [...map.values()].sort((a, b) => {
    const ai = order.indexOf(a.repository);
    const bi = order.indexOf(b.repository);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/** Overlay shared-store review decisions onto the base evidence items. */
export function applyReviewOverrides(
  base: EvidenceItem[],
  year: string,
  reviews: Record<string, { status: EvidenceItem['status']; note?: string; reviewedBy?: string; reviewDate?: string }>
): EvidenceItem[] {
  return base.map((item) => {
    const review = reviews[evidenceReviewKey(year, item.repository, item.section, item.documentCategory)];
    if (!review) return item;
    return {
      ...item,
      status: review.status,
      reviewNote: review.note ?? item.reviewNote,
      reviewedBy: review.reviewedBy ?? item.reviewedBy,
      reviewDate: review.reviewDate ?? item.reviewDate,
    };
  });
}
