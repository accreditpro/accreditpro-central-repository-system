import { Badge } from '@/components/ui/badge';
import { Paperclip, FileText, FileImage } from 'lucide-react';
import {
  EvidenceUploadDialog,
  EvidenceUploadResult,
} from '@/components/shared/EvidenceUploadDialog';
import type { UploadedFile } from '@/components/shared/EvidenceUploadDialog';

// ============================================================
// TYPES
// ============================================================

export type { UploadedFile };

export interface TPOEvidence {
  recordId: string;
  sections: Record<string, UploadedFile[]>;
}

export interface TPOEvidenceSectionConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  acceptedTypes: string[];
}

// ============================================================
// EVIDENCE SUMMARY BADGE
// ============================================================

export function EvidenceBadge({ evidence }: { evidence: TPOEvidence | null }) {
  if (!evidence) {
    return (
      <Badge variant="outline" className="text-[9px] text-muted-foreground gap-1">
        <Paperclip className="h-2.5 w-2.5" />
        No docs
      </Badge>
    );
  }

  const totalFiles = Object.values(evidence.sections).reduce(
    (sum, files) => sum + files.length,
    0
  );

  if (totalFiles === 0) {
    return (
      <Badge variant="outline" className="text-[9px] text-muted-foreground gap-1">
        <Paperclip className="h-2.5 w-2.5" />
        No docs
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] gap-1">
      <FileText className="h-2.5 w-2.5" />
      {totalFiles} doc{totalFiles !== 1 ? 's' : ''}
    </Badge>
  );
}

// ============================================================
// MAIN DIALOG COMPONENT
// ============================================================

interface TPOEvidenceDialogProps {
  recordId: string;
  recordName: string;
  sectionTitle: string;
  open: boolean;
  onClose: () => void;
  onEvidenceChange?: (recordId: string, evidence: TPOEvidence) => void;
  initialEvidence?: TPOEvidence | null;
  sectionConfigs?: TPOEvidenceSectionConfig[];
}

export const DEFAULT_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'offer-letters',
    label: 'Offer Letters',
    description: 'Upload offer letters, appointment orders, and placement documents',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'internship-certificates',
    label: 'Internship Certificates',
    description: 'Upload internship certificates, offer letters, and completion reports',
    icon: <FileText className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'admission-proofs',
    label: 'Admission Proofs',
    description: 'Upload admission letters, scorecards, and higher education proofs',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'registration-docs',
    label: 'Registration Documents',
    description: 'Upload startup registration docs, funding proofs, training certificates',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

// ============================================================
// TAB-SPECIFIC EVIDENCE SECTION CONFIGS
// ============================================================

/** Recruiters: MoU, company profile, communication records */
export const RECRUITER_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'mou-agreements',
    label: 'MoU & Agreements',
    description: 'Upload Memoranda of Understanding, partnership agreements, and signed contracts',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'company-profile',
    label: 'Company Profile',
    description: 'Upload company registration docs, profile brochures, and introduction letters',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'placement-records',
    label: 'Placement Records',
    description: 'Upload previous year placement records, selection lists, and hiring statistics',
    icon: <FileText className="h-4 w-4 text-teal-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'communication',
    label: 'Communication Records',
    description: 'Upload email correspondence, visit schedules, and meeting notes',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Placement Offers: offer letters, appointment orders */
export const PLACEMENT_OFFER_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'offer-letters',
    label: 'Offer Letters',
    description: 'Upload placement offer letters issued to students',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'appointment-orders',
    label: 'Appointment Orders',
    description: 'Upload appointment orders, joining letters, and employment contracts',
    icon: <FileText className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Internships: offer letters, completion certificates */
export const INTERNSHIP_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'internship-offer-letters',
    label: 'Internship Offer Letters',
    description: 'Upload internship offer letters and confirmation documents',
    icon: <FileText className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'completion-certificates',
    label: 'Completion Certificates',
    description: 'Upload internship completion certificates, experience letters, and reports',
    icon: <FileText className="h-4 w-4 text-teal-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Higher Education: admission letters, scorecards */
export const HIGHER_EDUCATION_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'admission-letters',
    label: 'Admission Letters',
    description: 'Upload admission offer letters, acceptance letters, and I-20 documents',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'scorecards',
    label: 'Scorecards & Exam Results',
    description: 'Upload entrance exam scorecards, transcripts, and academic records',
    icon: <FileText className="h-4 w-4 text-violet-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'scholarship-docs',
    label: 'Scholarship Documents',
    description: 'Upload scholarship award letters, fellowship proofs, and financial aid docs',
    icon: <FileText className="h-4 w-4 text-fuchsia-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Training Activities: request letters, geo-tagged photos, materials, certificates */
export const TRAINING_ACTIVITIES_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'request-letters',
    label: 'Request Letters & Proposals',
    description: 'Upload training request letters, proposals, approvals, and authorization documents',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of training sessions, events, and workshops as visual evidence',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'training-materials',
    label: 'Training Materials',
    description: 'Upload presentations, handouts, workbooks, study materials, and other training resources',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.pptx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'certificates',
    label: 'Certificates & Completion Proofs',
    description: 'Upload certificates of completion, participation, and achievement issued to students',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'feedback-forms',
    label: 'Feedback & Evaluation Forms',
    description: 'Upload participant feedback forms, evaluation reports, and training effectiveness surveys',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'attendance-records',
    label: 'Attendance Records',
    description: 'Upload attendance sheets, sign-in registers, and participant rosters',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'budget-expenditure',
    label: 'Budget & Expenditure Proofs',
    description: 'Upload budget approvals, invoices, payment receipts, and expenditure statements',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
];

/** NSS: activity reports, geo-tagged photos, volunteer certificates, camp documents */
export const NSS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'activity-reports',
    label: 'Activity Reports',
    description: 'Upload NSS activity reports, village adoption documentation, and programme officer reports',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of NSS camps, activities, and community service events',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'volunteer-certificates',
    label: 'Volunteer Certificates',
    description: 'Upload volunteer service certificates, participation certificates, and achievement awards',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'camp-documents',
    label: 'Camp Documents',
    description: 'Upload special camp reports, daily diaries, camp schedules, and village survey reports',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'sdg-impact-reports',
    label: 'SDG Impact Reports',
    description: 'Upload SDG alignment reports, impact assessments, and beneficiary feedback summaries',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'attendance-records',
    label: 'Attendance Records',
    description: 'Upload volunteer attendance sheets, activity participation registers, and camp attendance',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'feedback-evaluation',
    label: 'Feedback & Evaluation',
    description: 'Upload feedback forms, evaluation reports, and programme assessment documents',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** NCC: camp certificates, geo-tagged photos, cadet certs, achievements */
export const NCC_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'camp-certificates',
    label: 'Camp Certificates',
    description: 'Upload CATC, ATC, NIC, and other NCC camp certificates and completion proofs',
    icon: <FileText className="h-4 w-4 text-orange-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of camps, parades, drills, and NCC events',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'cadet-certificates',
    label: 'Cadet Certificates',
    description: 'Upload B Certificate and C Certificate documents issued to cadets',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'achievements',
    label: 'Achievements & Awards',
    description: 'Upload RDC selection proofs, best cadet awards, and special achievement documents',
    icon: <FileText className="h-4 w-4 text-yellow-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'attendance-records',
    label: 'Attendance & Parade Records',
    description: 'Upload parade attendance rolls, camp attendance registers, and drill participation records',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'annual-reports',
    label: 'Annual Reports',
    description: 'Upload NCC annual training reports, unit inspection reports, and quarterly summaries',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'enrollment-docs',
    label: 'Enrollment Documents',
    description: 'Upload cadet enrollment forms, medical certificates, and parent consent documents',
    icon: <FileText className="h-4 w-4 text-violet-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Sports Activities: event certificates, geo-tagged photos, result sheets, venue proofs */
export const SPORTS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'event-certificates',
    label: 'Event Certificates',
    description: 'Upload participation certificates, winner certificates, and merit awards from sports events',
    icon: <FileText className="h-4 w-4 text-yellow-600" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of sports events, matches, tournaments, and award ceremonies',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'result-sheets',
    label: 'Scorecards & Result Sheets',
    description: 'Upload match scorecards, result sheets, points tables, and event outcomes',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'venue-proofs',
    label: 'Venue & Infrastructure Proofs',
    description: 'Upload venue booking documents, ground maintenance records, and infrastructure proofs',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-coverage',
    label: 'Media Coverage',
    description: 'Upload news clippings, press releases, social media posts, and media coverage of events',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'selection-reports',
    label: 'Selection & Participation Records',
    description: 'Upload team selection lists, athlete registration forms, and participation rosters',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Cultural Activities: brochures, geo-tagged photos, certificates, event reports */
export const CULTURAL_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'event-brochures',
    label: 'Brochures & Invitations',
    description: 'Upload event brochures, invitation cards, posters, and promotional materials',
    icon: <FileText className="h-4 w-4 text-pink-600" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of cultural events, performances, and competitions',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'certificates',
    label: 'Certificates & Awards',
    description: 'Upload participation certificates, winner trophies, and award citations from events',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'event-reports',
    label: 'Event Reports & Proceedings',
    description: 'Upload event reports, programme schedules, scripts, and event proceedings',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'budget-proofs',
    label: 'Budget & Expenditure Proofs',
    description: 'Upload budget approvals, sponsorship letters, invoices, and expense receipts',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-video',
    label: 'Media & Video Proofs',
    description: 'Upload video recordings, media coverage links, photo albums, and highlight reels',
    icon: <FileText className="h-4 w-4 text-violet-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
];

/** Events: event reports, geo-tagged photos, guest speaker docs, budgets */
export const EVENTS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'event-reports',
    label: 'Event Reports & Proceedings',
    description: 'Upload event reports, programme schedules, proceedings, and outcome summaries',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of events, sessions, ceremonies, and group photos',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'guest-speaker-docs',
    label: 'Guest Speaker Documents',
    description: 'Upload speaker profiles, consent letters, honorarium proofs, and travel documents',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'budget-sponsorship',
    label: 'Budget & Sponsorship Proofs',
    description: 'Upload budget approvals, sponsorship letters, invoices, and expenditure receipts',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'certificates-awards',
    label: 'Certificates & Awards',
    description: 'Upload participation certificates, winner awards, and commendation letters',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-coverage',
    label: 'Media Coverage',
    description: 'Upload news clippings, press releases, social media coverage, and video recordings',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'participant-registrations',
    label: 'Participant Registration Lists',
    description: 'Upload registration forms, participant lists, attendance sheets, and feedback forms',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
];

/** Student Achievements: certificates, competition proofs, award letters */
export const STUDENT_ACHIEVEMENTS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'achievement-certificates',
    label: 'Achievement Certificates',
    description: 'Upload certificates of achievement, merit, and recognition from competitions and events',
    icon: <FileText className="h-4 w-4 text-yellow-600" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'competition-proofs',
    label: 'Competition Proofs',
    description: 'Upload competition brochures, problem statements, participation proofs, and result sheets',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'award-letters',
    label: 'Award Letters & Citations',
    description: 'Upload award letters, citation documents, prize certificates, and commendation orders',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of award ceremonies, competition events, and recognition felicitations',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-coverage',
    label: 'Media & Publication Proofs',
    description: 'Upload news articles, social media highlights, publication proofs, and interview recordings',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
];

/** Extension Activities: activity reports, geo-tagged photos, beneficiary feedback, collaboration docs */
export const EXTENSION_ACTIVITIES_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'activity-reports',
    label: 'Activity Reports',
    description: 'Upload detailed activity reports, project documentation, and program outcome summaries',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of extension activities, community sessions, and field visits',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'beneficiary-feedback',
    label: 'Beneficiary Feedback',
    description: 'Upload beneficiary feedback forms, testimonial letters, impact assessment surveys',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'collaboration-docs',
    label: 'Collaboration Documents',
    description: 'Upload collaboration agreements, MoUs with partner organizations, and consent letters',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'sdg-impact',
    label: 'SDG Impact Reports',
    description: 'Upload SDG alignment assessments, impact metrics, and sustainable development reports',
    icon: <FileText className="h-4 w-4 text-teal-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'attendance-records',
    label: 'Attendance Records',
    description: 'Upload student participation registers, volunteer attendance sheets, and community member lists',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Community Outreach: program reports, geo-tagged photos, certificates, outcome proofs */
export const COMMUNITY_OUTREACH_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'program-reports',
    label: 'Program Reports',
    description: 'Upload program reports, event summaries, and detailed outcome documentation',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of outreach events, drives, camps, and activities',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'certificates-appreciation',
    label: 'Certificates & Appreciation',
    description: 'Upload appreciation letters, certificates of participation, and commendation documents',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'collaboration-sponsorship',
    label: 'Collaboration & Sponsorship Proofs',
    description: 'Upload collaboration MoUs, sponsorship letters, and partner organization documents',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-coverage',
    label: 'Media Coverage',
    description: 'Upload news clippings, press releases, social media coverage, and video recordings',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'beneficiary-feedback',
    label: 'Beneficiary Feedback',
    description: 'Upload beneficiary feedback forms, impact surveys, and testimonial letters',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'outcome-proofs',
    label: 'Outcome Proofs',
    description: 'Upload outcome reports, beneficiary statistics, and measurable impact documentation',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
];

/** Clubs & Societies: meeting minutes, event reports, photos, membership records */
export const CLUBS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'meeting-minutes',
    label: 'Meeting Minutes & Agendas',
    description: 'Upload club meeting minutes, agenda documents, attendance records, and resolution summaries',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'activity-reports',
    label: 'Activity Reports',
    description: 'Upload activity reports, event summaries, project documentation, and achievement reports',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of club events, workshops, competitions, and activities',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'membership-records',
    label: 'Membership Records',
    description: 'Upload membership registers, enrollment forms, committee lists, and membership certificates',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'award-certificates',
    label: 'Awards & Recognition Certificates',
    description: 'Upload award certificates, merit recognition, appreciation letters, and achievement proofs',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'budget-financial',
    label: 'Budget & Financial Documents',
    description: 'Upload budget proposals, financial statements, expenditure approvals, and funding proofs',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'promotional-materials',
    label: 'Promotional Materials',
    description: 'Upload brochures, posters, social media posts, newsletters, and publicity materials',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'affiliation-docs',
    label: 'Affiliation & Registration Documents',
    description: 'Upload society affiliation proofs, registration certificates, renewal documents, and governing body approvals',
    icon: <FileText className="h-4 w-4 text-violet-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Student Chapters: annual reports, event docs, membership proofs */
export const STUDENT_CHAPTERS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'annual-reports',
    label: 'Annual Reports',
    description: 'Upload chapter annual reports, activity summaries, and yearly achievement documentation',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'event-documentation',
    label: 'Event Documentation',
    description: 'Upload event reports, conference proceedings, workshop materials, and seminar documentation',
    icon: <FileText className="h-4 w-4 text-indigo-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of chapter events, conferences, workshops, and meetings',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'membership-proofs',
    label: 'Membership Proofs',
    description: 'Upload membership registration lists, society membership certificates, and enrollment proofs',
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'award-recognition',
    label: 'Awards & Recognition',
    description: 'Upload chapter awards, best chapter certificates, appreciation letters, and recognition proofs',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'publication-proofs',
    label: 'Publication & Research Proofs',
    description: 'Upload paper publications, conference proceedings, research output, and technical reports',
    icon: <FileText className="h-4 w-4 text-teal-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'society-correspondence',
    label: 'Society Correspondence',
    description: 'Upload communication with parent society, approval letters, compliance documents, and renewal proofs',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

/** Student Awards: certificate proofs, award citations, photos */
export const STUDENT_AWARDS_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'award-certificates',
    label: 'Award Certificates',
    description: 'Upload award certificates, medal citations, honor certificates, and commendation documents',
    icon: <FileText className="h-4 w-4 text-yellow-600" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'award-letters',
    label: 'Award Letters & Citations',
    description: 'Upload official award letters, commendation orders, scholarship award letters, and citation documents',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'geo-tagged-photos',
    label: 'Geo-Tagged Photos',
    description: 'Upload geo-tagged photographs of award ceremonies, felicitation events, and honor presentations',
    icon: <FileImage className="h-4 w-4 text-emerald-500" />,
    acceptedTypes: ['.png', '.jpg', '.jpeg'],
  },
  {
    id: 'selection-criteria',
    label: 'Selection Criteria & Nomination Docs',
    description: 'Upload nomination forms, selection criteria documents, recommendation letters, and merit lists',
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'media-publicity',
    label: 'Media & Publicity Proofs',
    description: 'Upload news clippings, press releases, social media highlights, and institutional announcements',
    icon: <FileText className="h-4 w-4 text-cyan-500" />,
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'prize-monetary',
    label: 'Prize & Monetary Award Proofs',
    description: 'Upload prize distribution proofs, cheque disbursement records, scholarship disbursement proofs',
    icon: <FileText className="h-4 w-4 text-rose-500" />,
    acceptedTypes: ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
];

/** Entrepreneurship: registration docs, funding proofs */
export const ENTREPRENEURSHIP_EVIDENCE_SECTIONS: TPOEvidenceSectionConfig[] = [
  {
    id: 'registration-docs',
    label: 'Registration Documents',
    description: 'Upload startup registration certificates, incorporation documents, and licenses',
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'funding-proofs',
    label: 'Funding Proofs',
    description: 'Upload funding documents, investor agreements, and financial statements',
    icon: <FileText className="h-4 w-4 text-orange-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
  {
    id: 'incubation-docs',
    label: 'Incubation & Training',
    description: 'Upload incubation center documents, training certificates, and workshop proofs',
    icon: <FileText className="h-4 w-4 text-yellow-500" />,
    acceptedTypes: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  },
];

export function TPOEvidenceDialog({
  recordId,
  recordName,
  sectionTitle,
  open,
  onClose,
  onEvidenceChange,
  initialEvidence,
  sectionConfigs = DEFAULT_EVIDENCE_SECTIONS,
}: TPOEvidenceDialogProps) {
  const handleSave = (result: EvidenceUploadResult) => {
    onEvidenceChange?.(recordId, { recordId, sections: result.files });
  };

  return (
    <EvidenceUploadDialog
      open={open}
      onClose={onClose}
      title={`${sectionTitle} — ${recordName}`}
      subtitle="Upload and manage supporting documents for this record"
      categories={sectionConfigs}
      initialFiles={initialEvidence?.sections}
      onSave={handleSave}
      onCancel={() => {
        // Dismiss without persisting — changes are only committed via Save & Close
      }}
    />
  );
}

// Legacy alias for backward compatibility
export { TPOEvidenceDialog as RecruiterEvidenceDialog };
