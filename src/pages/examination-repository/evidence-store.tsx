import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// ============================================================
// TYPES
// ============================================================

export interface ExaminationEvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  recordedAt: string;    // When the record was created
  dataUrl?: string;      // For preview
  category: string;      // e.g., 'schedule-document', 'result-gazette', 'notification'
  moduleId: string;      // e.g., 'examination-schedules', 'examination-circulars'
  moduleLabel: string;   // e.g., 'Examination Schedules'
  recordTitle: string;   // e.g., 'End Semester Exam - Even Sem 2024'
}

interface EvidenceStoreContextType {
  /** All evidence files across all modules */
  evidenceFiles: ExaminationEvidenceFile[];
  /** Add files for a specific record */
  addEvidence: (files: ExaminationEvidenceFile[]) => void;
  /** Remove a specific file by id */
  removeEvidence: (fileId: string) => void;
  /** Get all files for a specific record */
  getRecordEvidence: (recordId: string) => ExaminationEvidenceFile[];
  /** Get files filtered by module */
  getModuleEvidence: (moduleId: string) => ExaminationEvidenceFile[];
}

const EvidenceStoreContext = createContext<EvidenceStoreContextType | null>(null);

export function EvidenceProvider({ children }: { children: ReactNode }) {
  const [evidenceFiles, setEvidenceFiles] = useState<ExaminationEvidenceFile[]>([]);

  const addEvidence = useCallback((files: ExaminationEvidenceFile[]) => {
    setEvidenceFiles((prev) => [...prev, ...files]);
  }, []);

  const removeEvidence = useCallback((fileId: string) => {
    setEvidenceFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.dataUrl) {
        URL.revokeObjectURL(fileToRemove.dataUrl);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  const getRecordEvidence = useCallback(
    (recordId: string) => evidenceFiles.filter((f) => f.recordTitle.includes(recordId)),
    [evidenceFiles]
  );

  const getModuleEvidence = useCallback(
    (moduleId: string) => evidenceFiles.filter((f) => f.moduleId === moduleId),
    [evidenceFiles]
  );

  const value = useMemo(
    () => ({ evidenceFiles, addEvidence, removeEvidence, getRecordEvidence, getModuleEvidence }),
    [evidenceFiles, addEvidence, removeEvidence, getRecordEvidence, getModuleEvidence]
  );

  return (
    <EvidenceStoreContext.Provider value={value}>
      {children}
    </EvidenceStoreContext.Provider>
  );
}

export function useEvidenceStore() {
  const ctx = useContext(EvidenceStoreContext);
  if (!ctx) throw new Error('useEvidenceStore must be used within EvidenceProvider');
  return ctx;
}
