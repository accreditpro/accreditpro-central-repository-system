import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IQAC_NAME } from '@/pages/iqac-dashboard/iqac-data';
import {
  buildSeedObservations,
  buildSeedVerificationMap,
  EvidenceObservation,
  EvidenceObservationStatus,
  IqacVerificationStatus,
  VerificationDocument,
} from '@/pages/iqac-dashboard/verification-data';
import type { ObservationPriority } from '@/pages/iqac-dashboard/types';

// ---------------------------------------------------------------------------
// IQAC Coordinator — Evidence Verification state.
// The IQAC verifies HOD-approved departmental evidence and raises document-level
// observations. It never edits the repository data itself. Persisted so verify /
// observation decisions survive reloads and role switches.
// ---------------------------------------------------------------------------

export interface VerificationEntry {
  status: IqacVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  comments?: string;
}

export interface VerificationState {
  verifications: Record<string, VerificationEntry>;
  observations: EvidenceObservation[];
}

const STORAGE_KEY = 'accreditpro-iqac-verification';

function loadPersisted<T>(fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function persistVerification(state: VerificationState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private mode / quota) — ignore.
  }
}

const seeded = loadPersisted<VerificationState>({
  verifications: buildSeedVerificationMap(),
  observations: buildSeedObservations(),
});

const initialState: VerificationState = {
  verifications: seeded.verifications ?? buildSeedVerificationMap(),
  observations: seeded.observations ?? buildSeedObservations(),
};

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++counter}`;

const today = () => new Date().toISOString().slice(0, 10);

const verificationSlice = createSlice({
  name: 'iqacVerification',
  initialState,
  reducers: {
    /**
     * Mark a document verified. Rule 1 — only HOD-approved documents may be
     * verified; the caller passes hodApproved as a defense-in-depth guard.
     */
    verifyDocument: (
      state,
      action: PayloadAction<{ id: string; comments?: string; hodApproved: boolean }>
    ) => {
      if (!action.payload.hodApproved) return;
      state.verifications[action.payload.id] = {
        status: 'verified',
        verifiedBy: IQAC_NAME,
        verifiedAt: today(),
        comments: action.payload.comments?.trim() || undefined,
      };
    },
    /** Raise a document-level observation instead of rejecting the document. */
    raiseObservation: (
      state,
      action: PayloadAction<{
        document: VerificationDocument;
        input: {
          title: string;
          priority: ObservationPriority;
          description: string;
          recommendedCorrection: string;
          dueDate: string;
        };
      }>
    ) => {
      const { document, input } = action.payload;
      state.verifications[document.id] = { status: 'observation-raised' };
      const observation: EvidenceObservation = {
        id: nextId('vobs'),
        documentId: document.id,
        documentName: document.name,
        department: document.department,
        repository: document.repository,
        folder: document.folder,
        category: document.category,
        faculty: document.faculty,
        student: document.student,
        title: input.title.trim(),
        priority: input.priority,
        description: input.description.trim(),
        recommendedCorrection: input.recommendedCorrection.trim(),
        dueDate: input.dueDate,
        status: 'open',
        raisedBy: IQAC_NAME,
        raisedAt: today(),
      };
      state.observations.unshift(observation);
    },
    /** Department coordinator responds — moves an observation forward. */
    updateObservationStatus: (
      state,
      action: PayloadAction<{ id: string; status: EvidenceObservationStatus; response?: string }>
    ) => {
      const obs = state.observations.find((o) => o.id === action.payload.id);
      if (!obs) return;
      obs.status = action.payload.status;
      if (action.payload.response !== undefined) obs.response = action.payload.response;
      if (action.payload.status === 'resolved') obs.respondedAt = today();
    },
    /** IQAC confirms an observation is satisfied — document becomes verified. */
    markObservationVerified: (state, action: PayloadAction<{ id: string }>) => {
      const obs = state.observations.find((o) => o.id === action.payload.id);
      if (!obs) return;
      obs.status = 'verified';
      obs.verifiedAt = today();
      state.verifications[obs.documentId] = {
        status: 'verified',
        verifiedBy: IQAC_NAME,
        verifiedAt: today(),
        comments: 'Verified after the raised observation was resolved.',
      };
    },
  },
});

export const { verifyDocument, raiseObservation, updateObservationStatus, markObservationVerified } =
  verificationSlice.actions;

export const selectVerificationMap = (state: { iqacVerification: VerificationState }): Record<string, VerificationEntry> =>
  state.iqacVerification.verifications;
export const selectVerificationObservations = (state: { iqacVerification: VerificationState }): EvidenceObservation[] =>
  state.iqacVerification.observations;

export default verificationSlice.reducer;
