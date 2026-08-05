// ---------------------------------------------------------------------------
// IQAC Coordinator — Evidence Verification module data layer.
//
// The IQAC verifies departmental evidence AFTER the HOD has approved it. Every
// document carries two INDEPENDENT lifecycle states:
//   1. HOD Approval  — pending → approved → rejected (owned by the HOD)
//   2. IQAC Verification — not-verified → verified OR observation-raised
// The IQAC can only act on documents where HOD status === 'approved' and can
// never edit the underlying repository data.
// ---------------------------------------------------------------------------

import { drillDownData, IQAC_NAME, ACADEMIC_YEARS } from './iqac-data';
import type { ObservationPriority } from './types';

export type HodApprovalStatus = 'pending' | 'approved' | 'rejected';
export type IqacVerificationStatus = 'not-verified' | 'verified' | 'observation-raised';
export type EvidenceObservationStatus = 'open' | 'in-progress' | 'resolved' | 'verified';
export type VerificationFileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip' | 'image' | 'other';

export interface VerificationDocument {
  id: string;
  name: string;
  department: string; // code, e.g. CSE
  departmentName: string;
  academicYear: string;
  repository: string;
  folder: string;
  category: string;
  faculty?: string;
  student?: string;
  fileType: VerificationFileType;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  version: number;
  frameworks: string[];
  // Lifecycle 1 — HOD approval (owned by HOD, read-only for IQAC)
  hodStatus: HodApprovalStatus;
  hodApprovedAt?: string;
  // Lifecycle 2 — IQAC verification (owned by IQAC)
  iqacStatus: IqacVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  comments?: string;
}

export interface EvidenceObservation {
  id: string;
  documentId: string;
  documentName: string;
  department: string;
  repository: string;
  folder: string;
  category: string;
  faculty?: string;
  student?: string;
  title: string;
  priority: ObservationPriority;
  description: string;
  recommendedCorrection: string;
  dueDate: string;
  status: EvidenceObservationStatus;
  raisedBy: string;
  raisedAt: string;
  response?: string;
  respondedAt?: string;
  verifiedAt?: string;
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random helper (stable across renders / sessions)
// ---------------------------------------------------------------------------

function seeded(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const FACULTY_NAMES = [
  'Dr. Anita Sharma', 'Dr. Rajesh Kumar', 'Dr. Venkat Raman', 'Dr. Priya Iyer',
  'Dr. Karthik Raja', 'Dr. Meena Krishnan', 'Dr. Arun Prakash', 'Dr. Divya Menon',
];

const STUDENT_NAMES = [
  'Rahul Verma', 'Sneha Reddy', 'Amit Patel', 'Pooja Joshi', 'Vivek Menon',
  'Ananya Gupta', 'Suresh Babu', 'Neha Kapoor',
];

const FRAMEWORK_POOL: string[][] = [
  ['NAAC', 'NBA'],
  ['NAAC'],
  ['NAAC', 'NIRF'],
  ['NAAC', 'NBA', 'NIRF'],
];

function fileTypeOf(name: string): VerificationFileType {
  if (/\.pdf$/i.test(name)) return 'pdf';
  if (/\.(docx?|odt)$/i.test(name)) return 'docx';
  if (/\.(xlsx?|csv)$/i.test(name)) return 'xlsx';
  if (/\.(pptx?)$/i.test(name)) return 'pptx';
  if (/\.(zip|rar|7z)$/i.test(name)) return 'zip';
  if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name)) return 'image';
  return 'other';
}

// ---------------------------------------------------------------------------
// Seed builder — flattens the deterministic department → repository → folder →
// evidence drill-down into a flat, filterable document collection.
//
// Documents are generated PER ACADEMIC YEAR (year-scoped ids and dates) with a
// deterministic per-year HOD/IQAC status distribution, so each year's pending /
// verified lists genuinely differ. The current year (2025-26) is canonical.
// ---------------------------------------------------------------------------

export const VERIFICATION_YEARS = [...ACADEMIC_YEARS];

function buildDocumentsForYear(year: string, yearIdx: number): VerificationDocument[] {
  const docs: VerificationDocument[] = [];
  let counter = 0;
  const yearSeed = yearIdx * 997;
  const yearPrefix = year.slice(0, 4);

  for (const dept of drillDownData) {
    for (const repo of dept.repositories) {
      for (const folder of repo.folders) {
        folder.evidence.forEach((ev, ei) => {
          const id = `vdoc-${year}-${dept.code}-${repo.repository}-${folder.folder}-${ei}`;
          const roll = seeded((counter + yearSeed) * 131 + ei * 7);
          // HOD approval distribution — ~45% approved, ~40% pending, ~15% rejected
          const hodStatus: HodApprovalStatus =
            roll < 0.45 ? 'approved' : roll < 0.85 ? 'pending' : 'rejected';

          // IQAC can only act on approved documents.
          let iqacStatus: IqacVerificationStatus = 'not-verified';
          let verifiedBy: string | undefined;
          let verifiedAt: string | undefined;
          if (hodStatus === 'approved') {
            const iqacRoll = seeded((counter + yearSeed) * 197 + ei * 13);
            if (iqacRoll < 0.18) {
              iqacStatus = 'verified';
              verifiedBy = IQAC_NAME;
              verifiedAt = `${yearPrefix}-${String(9 + (ei % 4)).padStart(2, '0')}-${String(5 + ((counter * 3) % 20)).padStart(2, '0')}`;
            } else if (iqacRoll < 0.28) {
              iqacStatus = 'observation-raised';
            }
          }

          const isFaculty = repo.repository === 'Faculty';
          const isStudent = repo.repository === 'Student' || repo.repository === 'Placement';

          docs.push({
            id,
            name: ev.name,
            department: dept.code,
            departmentName: dept.name,
            academicYear: year,
            repository: repo.repository,
            folder: folder.folder,
            category: folder.folder,
            faculty: isFaculty ? FACULTY_NAMES[(counter + ei) % FACULTY_NAMES.length] : undefined,
            student: isStudent ? STUDENT_NAMES[(counter + ei) % STUDENT_NAMES.length] : undefined,
            fileType: fileTypeOf(ev.name),
            size: ev.size,
            uploadedBy: ev.uploadedBy,
            uploadedAt: `${yearPrefix}-${String(2 + (ei % 8)).padStart(2, '0')}-${String(3 + ((counter * 5) % 24)).padStart(2, '0')}`,
            lastModified: `${yearPrefix}-${String(4 + (ei % 7)).padStart(2, '0')}-${String(2 + ((counter * 7) % 25)).padStart(2, '0')}`,
            version: 1 + (counter % 3),
            frameworks: FRAMEWORK_POOL[(counter + ei) % FRAMEWORK_POOL.length],
            hodStatus,
            hodApprovedAt: hodStatus === 'approved' ? `${yearPrefix}-${String(3 + (ei % 6)).padStart(2, '0')}-${String(2 + ((counter * 3) % 26)).padStart(2, '0')}` : undefined,
            iqacStatus,
            verifiedBy,
            verifiedAt,
          });
          counter++;
        });
      }
    }
  }
  return docs;
}

const yearCache = new Map<string, VerificationDocument[]>();

/** Documents for a specific academic year (memoized — 2025-26 is canonical). */
export function verificationDocumentsForYear(year: string): VerificationDocument[] {
  const cached = yearCache.get(year);
  if (cached) return cached;
  const idx = Math.max(0, ACADEMIC_YEARS.indexOf(year));
  const docs = buildDocumentsForYear(year, idx);
  yearCache.set(year, docs);
  return docs;
}

export const verificationDocuments: VerificationDocument[] = verificationDocumentsForYear('2025-26');

// ---------------------------------------------------------------------------
// Seed IQAC verification overrides + document-level observations
// (live copies live in the iqacVerificationSlice Redux store)
// ---------------------------------------------------------------------------

export function buildSeedVerificationMap(): Record<
  string,
  { status: IqacVerificationStatus; verifiedBy?: string; verifiedAt?: string; comments?: string }
> {
  const map: Record<string, { status: IqacVerificationStatus; verifiedBy?: string; verifiedAt?: string; comments?: string }> = {};
  for (const doc of verificationDocuments) {
    if (doc.iqacStatus === 'verified') {
      map[doc.id] = { status: 'verified', verifiedBy: doc.verifiedBy, verifiedAt: doc.verifiedAt, comments: 'Evidence consistent with repository claims.' };
    } else if (doc.iqacStatus === 'observation-raised') {
      map[doc.id] = { status: 'observation-raised' };
    }
  }
  return map;
}

export function buildSeedObservations(): EvidenceObservation[] {
  const obs: EvidenceObservation[] = [];
  let counter = 0;
  for (const doc of verificationDocuments) {
    if (doc.iqacStatus !== 'observation-raised') continue;
    // Keep the seeded list focused — only a deterministic subset gets a live observation record.
    if (counter % 3 !== 0) {
      counter++;
      continue;
    }
    const priority: ObservationPriority = (['high', 'medium', 'critical'] as ObservationPriority[])[counter % 3];
    obs.push({
      id: `vobs-${doc.id}`,
      documentId: doc.id,
      documentName: doc.name,
      department: doc.department,
      repository: doc.repository,
      folder: doc.folder,
      category: doc.category,
      faculty: doc.faculty,
      student: doc.student,
      title: `${doc.department} — ${doc.folder} evidence needs correction`,
      priority,
      description:
        `The document "${doc.name}" requires attention before it can be considered institutionally verified. Please review the details and re-upload a corrected version.`,
      recommendedCorrection: 'Review completeness and re-upload the corrected document, then notify the HOD for re-approval.',
      dueDate: `2026-0${1 + (counter % 3)}-${String(10 + ((counter * 4) % 15)).padStart(2, '0')}`,
      status: counter % 4 === 0 ? 'in-progress' : 'open',
      raisedBy: IQAC_NAME,
      raisedAt: doc.verifiedAt ?? `2025-11-${String(5 + (counter % 20)).padStart(2, '0')}`,
      ...(counter % 4 === 0 ? { response: 'Department is compiling the corrected evidence.', respondedAt: `2025-12-${String(2 + (counter % 20)).padStart(2, '0')}` } : {}),
    });
    counter++;
  }
  return obs;
}

// ---------------------------------------------------------------------------
// Derived summary helpers (shared by the dashboard + verification views)
// ---------------------------------------------------------------------------

export interface VerificationSummary {
  totalDocuments: number;
  pendingHodApproval: number;
  approvedNotVerified: number;
  verified: number;
  observationRaised: number;
  rejected: number;
  criticalObservations: number;
  openObservations: number;
  departmentWise: { department: string; total: number; verified: number; pending: number }[];
  repositoryWise: { repository: string; total: number; verified: number; pending: number }[];
}

export function summarizeVerification(
  documents: VerificationDocument[],
  observations: EvidenceObservation[]
): VerificationSummary {
  const departmentMap = new Map<string, { total: number; verified: number; pending: number }>();
  const repositoryMap = new Map<string, { total: number; verified: number; pending: number }>();

  for (const doc of documents) {
    const dept = departmentMap.get(doc.department) ?? { total: 0, verified: 0, pending: 0 };
    dept.total++;
    if (doc.iqacStatus === 'verified') dept.verified++;
    if (doc.iqacStatus === 'not-verified' && doc.hodStatus === 'approved') dept.pending++;
    departmentMap.set(doc.department, dept);

    const repo = repositoryMap.get(doc.repository) ?? { total: 0, verified: 0, pending: 0 };
    repo.total++;
    if (doc.iqacStatus === 'verified') repo.verified++;
    if (doc.iqacStatus === 'not-verified' && doc.hodStatus === 'approved') repo.pending++;
    repositoryMap.set(doc.repository, repo);
  }

  const active = observations.filter((o) => o.status === 'open' || o.status === 'in-progress');

  return {
    totalDocuments: documents.length,
    pendingHodApproval: documents.filter((d) => d.hodStatus === 'pending').length,
    approvedNotVerified: documents.filter((d) => d.hodStatus === 'approved' && d.iqacStatus === 'not-verified').length,
    verified: documents.filter((d) => d.iqacStatus === 'verified').length,
    observationRaised: documents.filter((d) => d.iqacStatus === 'observation-raised').length,
    rejected: documents.filter((d) => d.hodStatus === 'rejected').length,
    criticalObservations: active.filter((o) => o.priority === 'critical').length,
    openObservations: active.length,
    departmentWise: Array.from(departmentMap.entries()).map(([department, v]) => ({ department, ...v })),
    repositoryWise: Array.from(repositoryMap.entries()).map(([repository, v]) => ({ repository, ...v })),
  };
}
