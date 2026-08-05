import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IQAC_NAME,
  seedDocuments,
  seedInitiatives,
  seedObservations,
} from '@/pages/iqac-dashboard/iqac-data';
import type {
  IQACDocument,
  IQACDocumentInput,
  ImprovementInitiative,
  InitiativeInput,
  InitiativeStatus,
  ObservationInput,
  ObservationPriority,
  ObservationStatus,
  QualityObservation,
} from '@/pages/iqac-dashboard/types';

// ---------------------------------------------------------------------------
// IQAC-owned state.
// The IQAC Coordinator never edits departmental data — it raises quality
// observations, tracks quality improvement initiatives and maintains the
// IQAC supporting documents. All three collections live here so they survive
// navigation and role switches (persisted to localStorage).
// ---------------------------------------------------------------------------

export interface IQACState {
  observations: QualityObservation[];
  initiatives: ImprovementInitiative[];
  documents: IQACDocument[];
}

const STORAGE_KEY = 'accreditpro-iqac';

function loadPersisted<T>(fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function persistIQAC(state: IQACState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private mode / quota) — ignore.
  }
}

const seeded = loadPersisted<{ observations: QualityObservation[]; initiatives: ImprovementInitiative[]; documents: IQACDocument[] }>({
  observations: seedObservations,
  initiatives: seedInitiatives,
  documents: seedDocuments,
});

const initialState: IQACState = {
  observations: seeded.observations ?? seedObservations,
  initiatives: seeded.initiatives ?? seedInitiatives,
  documents: seeded.documents ?? seedDocuments,
};

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++counter}`;

const iqacSlice = createSlice({
  name: 'iqac',
  initialState,
  reducers: {
    addObservation: (state, action: PayloadAction<ObservationInput>) => {
      const input = action.payload;
      const observation: QualityObservation = {
        ...input,
        id: nextId('obs'),
        status: 'open',
        createdBy: IQAC_NAME,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      state.observations.unshift(observation);
    },
    setObservationStatus: (
      state,
      action: PayloadAction<{ id: string; status: ObservationStatus; resolution?: string }>
    ) => {
      const obs = state.observations.find((o) => o.id === action.payload.id);
      if (!obs) return;
      obs.status = action.payload.status;
      if (action.payload.status === 'resolved' || action.payload.status === 'closed') {
        obs.resolution = action.payload.resolution ?? obs.resolution ?? '';
        obs.resolvedAt = new Date().toISOString().slice(0, 10);
      }
    },
    setObservationPriority: (
      state,
      action: PayloadAction<{ id: string; priority: ObservationPriority }>
    ) => {
      const obs = state.observations.find((o) => o.id === action.payload.id);
      if (obs) obs.priority = action.payload.priority;
    },
    deleteObservation: (state, action: PayloadAction<string>) => {
      state.observations = state.observations.filter((o) => o.id !== action.payload);
    },
    addInitiative: (state, action: PayloadAction<InitiativeInput>) => {
      state.initiatives.unshift({ ...action.payload, id: nextId('init') });
    },
    updateInitiativeStatus: (
      state,
      action: PayloadAction<{ id: string; status: InitiativeStatus; outcome?: string }>
    ) => {
      const init = state.initiatives.find((i) => i.id === action.payload.id);
      if (!init) return;
      init.status = action.payload.status;
      if (action.payload.outcome !== undefined) init.outcome = action.payload.outcome;
    },
    addDocument: (state, action: PayloadAction<IQACDocumentInput>) => {
      const input = action.payload;
      const doc: IQACDocument = {
        ...input,
        id: nextId('iqac-doc'),
        uploadedDate: new Date().toISOString().slice(0, 10),
        versions: [
          {
            version: 'v1',
            uploadedBy: IQAC_NAME,
            uploadedDate: new Date().toISOString().slice(0, 10),
            fileSize: input.size,
          },
        ],
      };
      state.documents.unshift(doc);
    },
    addDocumentVersion: (state, action: PayloadAction<{ id: string; note?: string }>) => {
      const doc = state.documents.find((d) => d.id === action.payload.id);
      if (!doc) return;
      const current = doc.versions[0];
      // Normalize versions: 'v1' → 'v2', 'v1.1' → 'v1.2' (never 'v2.0').
      const match = /^v(\d+)(?:\.(\d+))?$/.exec(current?.version ?? 'v1');
      let nextVersion: string;
      if (match && match[2] !== undefined) {
        nextVersion = `v${match[1]}.${Number(match[2]) + 1}`;
      } else if (match) {
        nextVersion = `v${Number(match[1]) + 1}`;
      } else {
        nextVersion = `v${Number(current?.version.replace('v', '') ?? 1) + 1}`;
      }
      doc.versions.unshift({
        version: nextVersion,
        uploadedBy: IQAC_NAME,
        uploadedDate: new Date().toISOString().slice(0, 10),
        note: action.payload.note,
        fileSize: doc.size,
      });
    },
    updateInitiative: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Pick<ImprovementInitiative, 'title' | 'description' | 'outcome' | 'owner'>>;
      }>
    ) => {
      const init = state.initiatives.find((i) => i.id === action.payload.id);
      if (!init) return;
      Object.assign(init, action.payload.changes);
    },
  },
});

export const {
  addObservation,
  setObservationStatus,
  setObservationPriority,
  deleteObservation,
  addInitiative,
  updateInitiativeStatus,
  updateInitiative,
  addDocument,
  addDocumentVersion,
} = iqacSlice.actions;

export const selectObservations = (state: { iqac: IQACState }): QualityObservation[] =>
  state.iqac.observations;
export const selectInitiatives = (state: { iqac: IQACState }): ImprovementInitiative[] =>
  state.iqac.initiatives;
export const selectDocuments = (state: { iqac: IQACState }): IQACDocument[] => state.iqac.documents;

export default iqacSlice.reducer;
