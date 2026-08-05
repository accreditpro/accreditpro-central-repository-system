import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Building2,
  Database,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  MessageSquareWarning,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useReadOnly } from '@/hooks/useReadOnly';
import {
  verificationDocuments,
  summarizeVerification,
  type VerificationDocument,
} from '../../verification-data';
import { ACADEMIC_YEARS } from '../../iqac-data';
import { useVerificationDocuments } from './useVerificationDocuments';
import { VerificationDocumentTable } from './VerificationDocumentTable';
import { VerifyDocumentDialog } from './VerifyDocumentDialog';
import { RaiseObservationDialog } from './RaiseObservationDialog';
import { DocumentPreviewPanel } from './DocumentPreviewPanel';
import { VersionHistoryDialog } from './VersionHistoryDialog';
import { downloadDocument } from './verification-utils';
import { FilterSelect, FilterBar } from '../common';

// ---------------------------------------------------------------------------
// Left panel — Institution → Department → Repository → Folder hierarchy
// ---------------------------------------------------------------------------

interface HierarchyNode {
  code: string;
  name: string;
  repositories: { repository: string; folders: string[] }[];
}

function buildHierarchy(): HierarchyNode[] {
  const map = new Map<string, HierarchyNode>();
  for (const doc of verificationDocuments) {
    let node = map.get(doc.department);
    if (!node) {
      node = { code: doc.department, name: doc.departmentName, repositories: [] };
      map.set(doc.department, node);
    }
    let repo = node.repositories.find((r) => r.repository === doc.repository);
    if (!repo) {
      repo = { repository: doc.repository, folders: [] };
      node.repositories.push(repo);
    }
    if (!repo.folders.includes(doc.folder)) repo.folders.push(doc.folder);
  }
  return Array.from(map.values());
}

function HierarchyPanel({
  selected,
  onSelect,
}: {
  selected: { department?: string; repository?: string; folder?: string };
  onSelect: (sel: { department?: string; repository?: string; folder?: string }) => void;
}) {
  const hierarchy = useMemo(buildHierarchy, []);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);

  const toggleDept = (code: string) => {
    setExpandedDept(expandedDept === code ? null : code);
    setExpandedRepo(null);
  };

  return (
    <div className="rounded-xl border bg-card flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b px-3 py-2.5 bg-muted/30">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold">Institution Hierarchy</p>
      </div>
      <ScrollArea className="flex-1 max-h-[560px]">
        <div className="p-2 space-y-0.5">
          <button
            className={cn(
              'w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors',
              !selected.department ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60'
            )}
            onClick={() => onSelect({})}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Institution — All Departments
          </button>

          {hierarchy.map((dept) => (
            <div key={dept.code}>
              <button
                className={cn(
                  'w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors',
                  selected.department === dept.code && !selected.repository
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted/60'
                )}
                onClick={() => {
                  toggleDept(dept.code);
                  if (selected.department === dept.code && !expandedDept) {
                    onSelect({ department: dept.code });
                  } else if (selected.department !== dept.code) {
                    onSelect({ department: dept.code });
                  }
                }}
              >
                {expandedDept === dept.code ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {dept.code}
                <span className="text-[9px] text-muted-foreground font-normal ml-auto truncate">{dept.name}</span>
              </button>

              {expandedDept === dept.code && (
                <div className="ml-3 pl-2 border-l space-y-0.5">
                  {dept.repositories.map((repo) => (
                    <div key={repo.repository}>
                      <button
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 rounded-md text-[11px] flex items-center gap-2 transition-colors',
                          selected.repository === repo.repository && !selected.folder
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted/60'
                        )}
                        onClick={() => {
                          setExpandedRepo(expandedRepo === repo.repository ? null : repo.repository);
                          if (selected.repository !== repo.repository) {
                            onSelect({ department: dept.code, repository: repo.repository });
                          } else if (expandedRepo === repo.repository) {
                            onSelect({ department: dept.code });
                          }
                        }}
                      >
                        {expandedRepo === repo.repository ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        <Database className="h-3 w-3 opacity-60" />
                        {repo.repository}
                      </button>
                      {expandedRepo === repo.repository && (
                        <div className="ml-4 pl-2 border-l space-y-0.5">
                          {repo.folders.map((folder) => (
                            <button
                              key={folder}
                              className={cn(
                                'w-full text-left px-2.5 py-1.5 rounded-md text-[11px] flex items-center gap-2 transition-colors',
                                selected.folder === folder
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'hover:bg-muted/60'
                              )}
                              onClick={() => onSelect({ department: dept.code, repository: repo.repository, folder })}
                            >
                              <FolderOpen className="h-3 w-3 opacity-60" />
                              <span className="truncate">{folder}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Repository Verification — main view
// ---------------------------------------------------------------------------

export function VerificationView() {
  const isReadOnly = useReadOnly();
  const { documents, observations } = useVerificationDocuments();
  const [selection, setSelection] = useState<{ department?: string; repository?: string; folder?: string }>({});
  const [filters, setFilters] = useState({
    year: '2025-26',
    department: 'all',
    repository: 'all',
    folder: 'all',
    faculty: 'all',
    student: 'all',
    framework: 'All',
    verification: 'all',
    hodStatus: 'all',
  });
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);
  const [verifyDoc, setVerifyDoc] = useState<VerificationDocument | null>(null);
  const [obsDoc, setObsDoc] = useState<VerificationDocument | null>(null);
  const [historyDoc, setHistoryDoc] = useState<VerificationDocument | null>(null);

  const facultyOptions = useMemo(
    () => Array.from(new Set(documents.map((d) => d.faculty).filter(Boolean))) as string[],
    [documents]
  );
  const studentOptions = useMemo(
    () => Array.from(new Set(documents.map((d) => d.student).filter(Boolean))) as string[],
    [documents]
  );

  const folderOptions = useMemo(() => {
    const list = selection.repository
      ? documents.filter((d) => d.repository === selection.repository)
      : selection.department
        ? documents.filter((d) => d.department === selection.department)
        : documents;
    return Array.from(new Set(list.map((d) => d.folder))).sort();
  }, [documents, selection]);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (selection.department && doc.department !== selection.department) return false;
      if (selection.repository && doc.repository !== selection.repository) return false;
      if (selection.folder && doc.folder !== selection.folder) return false;
      if (filters.year !== 'all' && doc.academicYear !== filters.year) return false;
      if (filters.department !== 'all' && doc.department !== filters.department) return false;
      if (filters.repository !== 'all' && doc.repository !== filters.repository) return false;
      if (filters.folder !== 'all' && doc.folder !== filters.folder) return false;
      if (filters.faculty !== 'all' && doc.faculty !== filters.faculty) return false;
      if (filters.student !== 'all' && doc.student !== filters.student) return false;
      if (filters.framework !== 'All' && !doc.frameworks.includes(filters.framework)) return false;
      if (filters.verification !== 'all' && doc.iqacStatus !== filters.verification) return false;
      if (filters.hodStatus !== 'all' && doc.hodStatus !== filters.hodStatus) return false;
      return true;
    });
  }, [documents, selection, filters]);

  const summary = useMemo(() => summarizeVerification(filtered, observations), [filtered, observations]);

  const summaryCards = [
    { label: 'Pending HOD Approval', value: summary.pendingHodApproval, icon: AlertTriangle, cls: 'text-amber-600 bg-amber-500/10' },
    { label: 'Ready to Verify', value: summary.approvedNotVerified, icon: ShieldCheck, cls: 'text-blue-600 bg-blue-500/10' },
    { label: 'Verified', value: summary.verified, icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Observation Raised', value: summary.observationRaised, icon: MessageSquareWarning, cls: 'text-orange-600 bg-orange-500/10' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-3.5 flex items-center gap-3">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', c.cls)}>
              <c.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">{c.value}</p>
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <FilterBar>
        <FilterSelect
          value={filters.year}
          onValueChange={(v) => setFilters((f) => ({ ...f, year: v }))}
          options={[{ value: 'all', label: 'All Years' }, ...ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))]}
          placeholder="Academic Year"
        />
        <FilterSelect
          value={filters.department}
          onValueChange={(v) => setFilters((f) => ({ ...f, department: v }))}
          options={[
            { value: 'all', label: 'All Departments' },
            ...Array.from(new Set(documents.map((d) => d.department))).sort().map((d) => ({ value: d, label: d })),
          ]}
          placeholder="Department"
        />
        <FilterSelect
          value={filters.repository}
          onValueChange={(v) => setFilters((f) => ({ ...f, repository: v }))}
          options={[
            { value: 'all', label: 'All Repositories' },
            ...Array.from(new Set(documents.map((d) => d.repository))).sort().map((r) => ({ value: r, label: r })),
          ]}
          placeholder="Repository"
        />
        <FilterSelect
          value={filters.folder}
          onValueChange={(v) => setFilters((f) => ({ ...f, folder: v }))}
          options={[{ value: 'all', label: 'All Folders' }, ...folderOptions.map((f) => ({ value: f, label: f }))]}
          placeholder="Folder"
        />
        <FilterSelect
          value={filters.faculty}
          onValueChange={(v) => setFilters((f) => ({ ...f, faculty: v }))}
          options={[{ value: 'all', label: 'All Faculty' }, ...facultyOptions.map((f) => ({ value: f, label: f }))]}
          placeholder="Faculty"
        />
        <FilterSelect
          value={filters.student}
          onValueChange={(v) => setFilters((f) => ({ ...f, student: v }))}
          options={[{ value: 'all', label: 'All Students' }, ...studentOptions.map((s) => ({ value: s, label: s }))]}
          placeholder="Student"
        />
        <FilterSelect
          value={filters.framework}
          onValueChange={(v) => setFilters((f) => ({ ...f, framework: v }))}
          options={[
            { value: 'All', label: 'All Frameworks' },
            { value: 'NBA', label: 'NBA' },
            { value: 'NAAC', label: 'NAAC' },
            { value: 'NIRF', label: 'NIRF' },
          ]}
          placeholder="Framework"
        />
        <FilterSelect
          value={filters.verification}
          onValueChange={(v) => setFilters((f) => ({ ...f, verification: v }))}
          options={[
            { value: 'all', label: 'All Verification Status' },
            { value: 'not-verified', label: '⚪ Not Verified' },
            { value: 'verified', label: '🔵 IQAC Verified' },
            { value: 'observation-raised', label: '🟠 Observation Raised' },
          ]}
          placeholder="Verification Status"
        />
        <FilterSelect
          value={filters.hodStatus}
          onValueChange={(v) => setFilters((f) => ({ ...f, hodStatus: v }))}
          options={[
            { value: 'all', label: 'All HOD Status' },
            { value: 'approved', label: '🟢 HOD Approved' },
            { value: 'pending', label: '🟡 Pending HOD Approval' },
            { value: 'rejected', label: '🔴 Rejected by HOD' },
          ]}
          placeholder="HOD Approval Status"
        />
      </FilterBar>

      <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-4 items-start">
        {/* Left — hierarchy */}
        <HierarchyPanel selected={selection} onSelect={setSelection} />

        {/* Right — document grid + inline preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {selection.folder
                ? `${selection.department} / ${selection.repository} / ${selection.folder}`
                : selection.repository
                  ? `${selection.department} / ${selection.repository}`
                  : selection.department
                    ? `${selection.department} — all repositories`
                    : 'All departments — all repositories'}
              {' · '}{filtered.length} documents
            </p>
            {selection.department && (
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setSelection({})}>
                Clear selection
              </Button>
            )}
          </div>

          <VerificationDocumentTable
            documents={filtered}
            mode="full"
            readOnly={isReadOnly}
            onPreview={setPreviewDoc}
            onVerify={setVerifyDoc}
            onRaiseObservation={setObsDoc}
            onDownload={downloadDocument}
            onHistory={setHistoryDoc}
          />

          {previewDoc && (
            <DocumentPreviewPanel document={previewDoc} onClose={() => setPreviewDoc(null)} onDownload={downloadDocument} />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <VerifyDocumentDialog document={verifyDoc} open={!!verifyDoc} onOpenChange={(o) => !o && setVerifyDoc(null)} />
      <RaiseObservationDialog document={obsDoc} open={!!obsDoc} onOpenChange={(o) => !o && setObsDoc(null)} />
      <VersionHistoryDialog document={historyDoc} open={!!historyDoc} onOpenChange={(o) => !o && setHistoryDoc(null)} />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t pt-3">
        <span className="font-medium">Status legend:</span>
        <span>🟢 HOD Approved</span>
        <span>🟡 Pending HOD Approval</span>
        <span>🔵 IQAC Verified</span>
        <span>🟠 Observation Raised</span>
        <span className="ml-auto flex items-center gap-1">
          <FileCheck className="h-3 w-3" />
          Everything is read-only — IQAC can only verify or raise observations on HOD-approved documents.
        </span>
      </div>
    </div>
  );
}
