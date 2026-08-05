import { toast } from 'sonner';
import type { VerificationDocument } from '../../verification-data';

/** Downloads a mock evidence document as a placeholder file. */
export function downloadDocument(doc: VerificationDocument) {
  const blob = new Blob(
    [`AccreditPro evidence document — ${doc.name}\n\n${JSON.stringify(doc, null, 2)}`],
    { type: 'text/plain' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.name;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloading ${doc.name}`);
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
