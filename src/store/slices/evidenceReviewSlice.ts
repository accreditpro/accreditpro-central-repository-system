import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getHODYearData, ACADEMIC_YEARS, EvidenceItem } from '@/pages/hod-dashboard/hod-configs';

// ---------------------------------------------------------------------------
// Shared HOD review decisions
// Both the HOD (Evidence Review) and the Department Coordinator (Documents
// view) read/write this store, so approve / reject / request-changes decisions
// made by the HOD are immediately visible to the coordinator (and vice versa
// within the same session). Decisions are persisted to localStorage so they
// survive reloads and role switches.
// ---------------------------------------------------------------------------

export type EvidenceReviewStatus = EvidenceItem['status'];

export interface EvidenceReviewEntry {
  status: EvidenceReviewStatus;
  note?: string;
  reviewedBy?: string;
  reviewDate?: string;
}

export interface EvidenceReviewState {
  reviews: Record<string, EvidenceReviewEntry>;
}

const STORAGE_KEY = 'accreditpro-evidence-reviews';

/** Stable key shared by both roles: year :: repository :: section :: category */
export const evidenceReviewKey = (year: string, repository: string, section: string, category: string): string =>
  `${year}::${repository}::${section}::${category}`;

function buildSeed(): Record<string, EvidenceReviewEntry> {
  const seed: Record<string, EvidenceReviewEntry> = {};
  try {
    for (const year of ACADEMIC_YEARS) {
      for (const item of getHODYearData(year).evidence) {
        seed[evidenceReviewKey(year, item.repository, item.section, item.documentCategory)] = {
          status: item.status,
          note: item.reviewNote,
          reviewedBy: item.reviewedBy,
          reviewDate: item.reviewDate,
        };
      }
    }
  } catch {
    // Never block app startup on seed data issues.
  }
  return seed;
}

function loadPersisted(): Record<string, EvidenceReviewEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, EvidenceReviewEntry>) : {};
  } catch {
    return {};
  }
}

export function persistReviews(reviews: Record<string, EvidenceReviewEntry>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // localStorage may be unavailable (private mode / quota) — ignore.
  }
}

const initialState: EvidenceReviewState = {
  // Persisted decisions (made by the HOD in previous sessions) win over the seed.
  reviews: { ...buildSeed(), ...loadPersisted() },
};

const evidenceReviewSlice = createSlice({
  name: 'evidenceReview',
  initialState,
  reducers: {
    setReview: (state, action: PayloadAction<{ key: string; entry: EvidenceReviewEntry }>) => {
      state.reviews[action.payload.key] = action.payload.entry;
    },
  },
});

export const { setReview } = evidenceReviewSlice.actions;

export const selectReviews = (state: { evidenceReview: EvidenceReviewState }): Record<string, EvidenceReviewEntry> =>
  state.evidenceReview.reviews;

export default evidenceReviewSlice.reducer;
