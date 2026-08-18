import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { selectVerificationMap, selectVerificationObservations } from '@/store/slices/iqacVerificationSlice';
import { iqacService } from '@/services/iqac.service';
import type { EvidenceObservationDto, VerificationDocumentDto } from '@/services/iqac.service';
import type {
  EvidenceObservation,
  EvidenceObservationStatus,
  HodApprovalStatus,
  IqacVerificationStatus,
  VerificationDocument,
  VerificationFileType,
} from '../../verification-data';

const FILE_TYPES: VerificationFileType[] = ['pdf', 'docx', 'xlsx', 'pptx', 'zip', 'image', 'other'];

function toFileType(value?: string): VerificationFileType {
  if (value && (FILE_TYPES as string[]).includes(value)) return value as VerificationFileType;
  return 'other';
}

function toDocument(dto: VerificationDocumentDto): VerificationDocument {
  return {
    id: dto.id,
    name: dto.name,
    department: dto.department,
    departmentName: dto.departmentName,
    academicYear: dto.academicYear,
    repository: dto.repository,
    folder: dto.folder,
    category: dto.category,
    faculty: dto.faculty,
    student: dto.student,
    fileType: toFileType(dto.fileType),
    size: dto.size ?? '—',
    uploadedBy: dto.uploadedBy,
    uploadedAt: dto.uploadedAt ?? '',
    lastModified: dto.lastModified ?? dto.uploadedAt ?? '',
    version: dto.version ?? 1,
    frameworks: dto.frameworks ?? [],
    hodStatus: (dto.hodStatus as HodApprovalStatus) ?? 'pending',
    hodApprovedAt: dto.hodApprovedAt,
    iqacStatus: (dto.iqacStatus as IqacVerificationStatus) ?? 'not-verified',
    verifiedBy: dto.verifiedBy,
    verifiedAt: dto.verifiedAt,
    comments: dto.comments,
  };
}

function toObservation(dto: EvidenceObservationDto): EvidenceObservation {
  return {
    id: dto.id,
    documentId: dto.documentId,
    documentName: dto.documentName,
    department: dto.department,
    repository: dto.repository,
    folder: dto.folder,
    category: dto.category,
    faculty: dto.faculty,
    student: dto.student,
    title: dto.title,
    priority: dto.priority,
    description: dto.description,
    recommendedCorrection: dto.recommendedCorrection,
    dueDate: dto.dueDate,
    status: (dto.status as EvidenceObservationStatus) ?? 'open',
    raisedBy: dto.raisedBy,
    raisedAt: dto.raisedAt ?? '',
    response: dto.response,
    respondedAt: dto.respondedAt,
    verifiedAt: dto.verifiedAt,
  };
}

/**
 * Returns the verification documents and document-level observations for an
 * academic year, fetched from the IQAC backend. Live IQAC decisions made in
 * this session (verify / raise observation) are overlaid on top of the API
 * data via the Redux verification slice so the UI reflects them immediately;
 * the backend remains the source of truth across reloads.
 *
 * Pass 'all' to merge every academic year (used by the Repository Verification
 * browser's "All Years" filter). Defaults to the current year, 2025-26.
 */
export function useVerificationDocuments(year: string | 'all' = '2025-26') {
  const verifications = useAppSelector(selectVerificationMap);
  const storeObservations = useAppSelector(selectVerificationObservations);

  const [baseDocuments, setBaseDocuments] = useState<VerificationDocument[]>([]);
  const [apiObservations, setApiObservations] = useState<EvidenceObservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      iqacService.getVerificationDocuments({
        academicYear: year === 'all' ? undefined : year,
        page: 0,
        size: 500,
      }),
      iqacService.getVerificationObservations(),
    ])
      .then(([page, observations]) => {
        if (cancelled) return;
        setBaseDocuments((page.content ?? []).map(toDocument));
        setApiObservations((observations ?? []).map(toObservation));
      })
      .catch(() => {
        if (cancelled) return;
        setBaseDocuments([]);
        setApiObservations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year]);

  const documents = baseDocuments.map((doc) => {
    const entry = verifications[doc.id];
    if (!entry) return doc;
    return {
      ...doc,
      iqacStatus: entry.status,
      verifiedBy: entry.verifiedBy ?? doc.verifiedBy,
      verifiedAt: entry.verifiedAt ?? doc.verifiedAt,
      comments: entry.comments ?? doc.comments,
    };
  });

  const observations = [...apiObservations, ...storeObservations];

  return { documents, observations, loading };
}
