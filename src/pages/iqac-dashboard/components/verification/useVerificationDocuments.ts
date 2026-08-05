import { useAppSelector } from '@/store';
import { selectVerificationMap, selectVerificationObservations } from '@/store/slices/iqacVerificationSlice';
import {
  verificationDocuments,
  verificationDocumentsForYear,
  VERIFICATION_YEARS,
} from '../../verification-data';

/**
 * Returns the effective verification documents for an academic year — the seed
 * collection for that year overlaid with live IQAC verify / observation
 * decisions from the Redux store (year-scoped ids keep each year independent).
 *
 * Pass 'all' to merge every academic year (used by the Repository Verification
 * browser's "All Years" filter). Defaults to the current year, 2025-26.
 */
export function useVerificationDocuments(year: string | 'all' = '2025-26') {
  const verifications = useAppSelector(selectVerificationMap);
  const observations = useAppSelector(selectVerificationObservations);

  const base =
    year === 'all'
      ? VERIFICATION_YEARS.flatMap((y) => verificationDocumentsForYear(y))
      : year === '2025-26'
        ? verificationDocuments
        : verificationDocumentsForYear(year);

  const documents = base.map((doc) => {
    const entry = verifications[doc.id];
    if (!entry) return doc;
    return {
      ...doc,
      iqacStatus: entry.status,
      verifiedBy: entry.verifiedBy ?? doc.verifiedBy,
      verifiedAt: entry.verifiedAt ?? doc.verifiedAt,
      comments: entry.comments ?? doc.comments,
    };
  });

  return { documents, observations };
}
