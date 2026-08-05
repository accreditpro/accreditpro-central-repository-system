import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Building2 } from 'lucide-react';
import { useReadOnly } from '@/hooks/useReadOnly';
import { useVerificationDocuments } from './useVerificationDocuments';
import { VerificationDocumentTable } from './VerificationDocumentTable';
import { VerificationScopeBar } from './VerificationScopeBar';
import { VerifyDocumentDialog } from './VerifyDocumentDialog';
import { RaiseObservationDialog } from './RaiseObservationDialog';
import { DocumentPreviewPanel } from './DocumentPreviewPanel';
import { VersionHistoryDialog } from './VersionHistoryDialog';
import { downloadDocument } from './verification-utils';
import type { VerificationDocument } from '../../verification-data';

export function PendingVerificationView() {
  const isReadOnly = useReadOnly();
  const [year, setYear] = useState('2025-26');
  const [department, setDepartment] = useState('all');
  const [verifyDoc, setVerifyDoc] = useState<VerificationDocument | null>(null);
  const [obsDoc, setObsDoc] = useState<VerificationDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);
  const [historyDoc, setHistoryDoc] = useState<VerificationDocument | null>(null);

  const { documents } = useVerificationDocuments(year);

  // Only documents the IQAC is allowed to act on: HOD-approved, not yet verified.
  const pending = useMemo(
    () =>
      documents.filter(
        (d) =>
          d.hodStatus === 'approved' &&
          d.iqacStatus === 'not-verified' &&
          (department === 'all' || d.department === department)
      ),
    [documents, department]
  );

  const departments = useMemo(
    () => Array.from(new Set(documents.map((d) => d.department))).sort(),
    [documents]
  );

  // When browsing all departments, group the queue by department.
  const groups = useMemo(() => {
    if (department !== 'all') return [{ department, documents: pending }];
    return departments
      .map((code) => ({
        department: code,
        documents: pending.filter((d) => d.department === code),
      }))
      .filter((g) => g.documents.length > 0);
  }, [pending, departments, department]);

  return (
    <div className="space-y-4">
      {/* Scope: department + academic year */}
      <VerificationScopeBar
        year={year}
        onYearChange={setYear}
        department={department}
        onDepartmentChange={setDepartment}
        departments={departments}
        count={pending.length}
      />

      <div className="flex items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/5 p-3.5">
        <Clock className="h-4 w-4 text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">{pending.length} document{pending.length !== 1 ? 's' : ''}</span> approved by the
          HOD for <span className="font-semibold">{year}</span>
          {department !== 'all' && <> in <span className="font-semibold">{department}</span></>} and waiting for IQAC
          verification. Documents without HOD approval cannot be verified.
        </p>
      </div>

      {/* Grouped by department when browsing all */}
      {groups.map((group) => (
        <div key={group.department} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Building2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-sm font-semibold">{group.department}</p>
            <Badge variant="outline" className="text-[10px]">
              {group.documents.length} pending
            </Badge>
          </div>
          <VerificationDocumentTable
            documents={group.documents}
            mode="pending"
            readOnly={isReadOnly}
            onPreview={setPreviewDoc}
            onVerify={setVerifyDoc}
            onRaiseObservation={setObsDoc}
            onDownload={downloadDocument}
            onHistory={setHistoryDoc}
          />
        </div>
      ))}

      {groups.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No documents awaiting verification for {department === 'all' ? 'any department' : department} · {year}.
        </div>
      )}

      {previewDoc && <DocumentPreviewPanel document={previewDoc} onClose={() => setPreviewDoc(null)} onDownload={downloadDocument} />}

      <VerifyDocumentDialog document={verifyDoc} open={!!verifyDoc} onOpenChange={(o) => !o && setVerifyDoc(null)} />
      <RaiseObservationDialog document={obsDoc} open={!!obsDoc} onOpenChange={(o) => !o && setObsDoc(null)} />
      <VersionHistoryDialog document={historyDoc} open={!!historyDoc} onOpenChange={(o) => !o && setHistoryDoc(null)} />
    </div>
  );
}
