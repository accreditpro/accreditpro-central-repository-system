import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { summarizeVerification, type EvidenceObservation, type VerificationDocument } from '../../verification-data';

export interface ReportData {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export const VERIFICATION_REPORT_TYPES = [
  { id: 'department', name: 'Department Verification Report', description: 'Verified / pending evidence per department' },
  { id: 'repository', name: 'Repository Verification Report', description: 'Verified / pending evidence per repository' },
  { id: 'observations', name: 'Observation Report', description: 'All IQAC verification observations with priority & status' },
  { id: 'completion', name: 'Verification Completion Report', description: 'Document-level verification completion across the institution' },
  { id: 'summary', name: 'Evidence Verification Summary', description: 'Institutional verification KPIs and coverage' },
] as const;

export type VerificationReportId = (typeof VERIFICATION_REPORT_TYPES)[number]['id'];

export function buildVerificationReportData(
  id: VerificationReportId,
  documents: VerificationDocument[],
  observations: EvidenceObservation[]
): ReportData {
  const summary = summarizeVerification(documents, observations);
  switch (id) {
    case 'department':
      return {
        title: 'Department Verification Report',
        columns: ['Department', 'Total Documents', 'HOD Approved', 'Verified', 'Pending Verification', 'Observation Raised', 'Rejected'],
        rows: summary.departmentWise.map((d) => [
          d.department,
          d.total,
          documents.filter((x) => x.department === d.department && x.hodStatus === 'approved').length,
          d.verified,
          d.pending,
          documents.filter((x) => x.department === d.department && x.iqacStatus === 'observation-raised').length,
          documents.filter((x) => x.department === d.department && x.hodStatus === 'rejected').length,
        ]),
      };
    case 'repository':
      return {
        title: 'Repository Verification Report',
        columns: ['Repository', 'Total Documents', 'HOD Approved', 'Verified', 'Pending Verification', 'Observation Raised'],
        rows: summary.repositoryWise.map((r) => [
          r.repository,
          r.total,
          documents.filter((x) => x.repository === r.repository && x.hodStatus === 'approved').length,
          r.verified,
          r.pending,
          documents.filter((x) => x.repository === r.repository && x.iqacStatus === 'observation-raised').length,
        ]),
      };
    case 'observations':
      return {
        title: 'Observation Report',
        columns: ['Title', 'Department', 'Repository', 'Priority', 'Status', 'Due Date', 'Raised By', 'Recommended Correction'],
        rows: observations.map((o) => [
          o.title,
          o.department,
          o.repository,
          o.priority,
          o.status,
          o.dueDate,
          o.raisedBy,
          o.recommendedCorrection,
        ]),
      };
    case 'completion':
      return {
        title: 'Verification Completion Report',
        columns: ['Document', 'Department', 'Repository', 'Folder', 'HOD Status', 'IQAC Status', 'Verified By', 'Verified On'],
        rows: documents.map((d) => [
          d.name,
          d.department,
          d.repository,
          d.folder,
          d.hodStatus,
          d.iqacStatus,
          d.verifiedBy ?? '-',
          d.verifiedAt ?? '-',
        ]),
      };
    case 'summary':
      return {
        title: 'Evidence Verification Summary',
        columns: ['Metric', 'Value'],
        rows: [
          ['Total Evidence Documents', summary.totalDocuments],
          ['Pending HOD Approval', summary.pendingHodApproval],
          ['HOD Approved — Ready for Verification', summary.approvedNotVerified],
          ['IQAC Verified', summary.verified],
          ['Observation Raised', summary.observationRaised],
          ['Rejected by HOD', summary.rejected],
          ['Open / In-Progress Observations', summary.openObservations],
          ['Critical Observations', summary.criticalObservations],
          ['Verification Completion', `${Math.round((summary.verified / Math.max(1, summary.totalDocuments)) * 100)}%`],
        ],
      };
    default:
      return { title: 'Report', columns: ['Item'], rows: [['—']] };
  }
}

export function exportVerificationReportToExcel(
  id: VerificationReportId,
  documents: VerificationDocument[],
  observations: EvidenceObservation[]
) {
  const data = buildVerificationReportData(id, documents, observations);
  const sheet = XLSX.utils.json_to_sheet(
    data.rows.map((row) => Object.fromEntries(data.columns.map((c, i) => [c, row[i]])))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, data.title.slice(0, 31));
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `iqac-verification-${id}-${new Date().toISOString().split('T')[0]}.xlsx`
  );
}

export function exportVerificationReportToPDF(
  id: VerificationReportId,
  documents: VerificationDocument[],
  observations: EvidenceObservation[]
) {
  const data = buildVerificationReportData(id, documents, observations);
  const doc = new jsPDF({ orientation: data.columns.length > 6 ? 'landscape' : 'portrait' });
  doc.setFontSize(16);
  doc.setTextColor(29, 78, 216);
  doc.text(`AccreditPro — ${data.title}`, 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated on ${new Date().toLocaleDateString()} • IQAC Evidence Verification`, 14, 25);
  autoTable(doc, {
    startY: 31,
    head: [data.columns],
    body: data.rows.map((row) => row.map(String)),
    theme: 'striped',
    headStyles: { fillColor: [29, 78, 216] },
    styles: { fontSize: 7 },
  });
  doc.save(`iqac-verification-${id}-${new Date().toISOString().split('T')[0]}.pdf`);
}
