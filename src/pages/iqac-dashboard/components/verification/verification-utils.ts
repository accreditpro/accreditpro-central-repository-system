import { toast } from 'sonner';
import type { VerificationDocument } from '../../verification-data';

/**
 * Downloads the verification document metadata as a portable text record.
 * Verification documents are metadata-only records (the physical evidence is
 * owned by the source repository), so a metadata export is the downloadable
 * artifact here.
 */
export function downloadDocument(doc: VerificationDocument) {
  const header = `AccreditPro verification document — ${doc.name}`;
  const meta = [
    ['Department', doc.department],
    ['Repository', doc.repository],
    ['Folder', doc.folder],
    ['Category', doc.category],
    ['Academic Year', doc.academicYear],
    ['Faculty / Student', doc.faculty ?? doc.student ?? '—'],
    ['Version', `v${doc.version}`],
    ['Size', doc.size],
    ['Uploaded By', doc.uploadedBy],
    ['Uploaded At', doc.uploadedAt],
    ['Last Modified', doc.lastModified],
    ['HOD Status', doc.hodStatus],
    ['IQAC Status', doc.iqacStatus],
    ['Frameworks', doc.frameworks.join(', ')],
  ]
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const blob = new Blob([`${header}\n\n${meta}\n`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.name.replace(/\.\w+$/, '')}-metadata.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloading ${doc.name} metadata`);
}

/** Maps a department name (auth / configs) to the verification module's department code. */
export function resolveDepartmentCode(departmentName: string, fallback = 'CSE'): string {
  const name = (departmentName ?? '').toLowerCase();
  if (name.includes('cse') || name.includes('computer science')) return 'CSE';
  if (name.includes('ece') || name.includes('electronics')) return 'ECE';
  if (name.includes('eee') || name.includes('electrical')) return 'EEE';
  if (name.includes('mech')) return 'MECH';
  if (name.includes('civil')) return 'CIVIL';
  if (name.includes('it') || name.includes('information technology')) return 'IT';
  if (name.includes('aiml') || name.includes('ai & ml')) return 'AIML';
  if (name.includes('ds') || name.includes('data science')) return 'DS';
  return fallback;
}
