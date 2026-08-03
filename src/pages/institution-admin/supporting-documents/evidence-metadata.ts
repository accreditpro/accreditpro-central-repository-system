import {
  RepositoryConfig,
  RepositorySection,
  EvidenceFolder,
  EvidenceDocument,
  DocumentVersion,
  InstitutionConfig,
  NotificationItem,
  isFolderVisible,
} from '@/components/evidence-repository/types';

// ============================================================
// INSTITUTION INFORMATION SECTION - Folders & Documents
// ============================================================

function createVersion(
  id: string,
  version: number,
  fileName: string,
  fileSize: number,
  fileType: string,
  uploadedBy: string,
  uploadedAt: string,
  status: 'uploaded' | 'approved' | 'submitted' | 'under_review' | 'rejected',
  opts?: { comments?: string; versionNotes?: string; verifiedBy?: string; verifiedAt?: string }
): DocumentVersion {
  return {
    id,
    version,
    fileName,
    fileSize,
    fileType,
    uploadedBy,
    uploadedAt,
    status,
    ...opts,
  };
}

const institutionInfoFolder: EvidenceFolder = {
  id: 'inst-info',
  name: 'Institution Information',
  description: 'Basic institution details and registration documents',
  order: 1,
  documents: [
    {
      id: 'inst-reg-cert',
      name: 'Institution Registration Certificate',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'NBA', 'NIRF'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'registration_certificate.pdf',
          2048,
          'pdf',
          'Admin',
          '10-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC Coordinator', verifiedAt: '12-Jan-2026' }
        ),
      ],
    },
    {
      id: 'inst-trust-deed',
      name: 'Trust Deed / Society Registration',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'UGC'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'trust_deed.pdf', 3500, 'pdf', 'Admin', '10-Jan-2026', 'approved', {
          verifiedBy: 'IQAC Coordinator',
          verifiedAt: '12-Jan-2026',
        }),
      ],
    },
    {
      id: 'inst-pan-card',
      name: 'PAN Card of Institution',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['AICTE', 'UGC'],
      uploadedOn: '11-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'pan_card.pdf', 512, 'pdf', 'Admin', '11-Jan-2026', 'uploaded'),
      ],
    },
    {
      id: 'inst-12b-cert',
      name: '12B Certificate',
      mandatory: false,
      status: 'not_uploaded',
      frameworks: ['UGC'],
      versions: [],
    },
    {
      id: 'inst-2f-cert',
      name: '2(f) Certificate',
      mandatory: false,
      status: 'not_uploaded',
      frameworks: ['UGC'],
      versions: [],
    },
  ],
};

const visionMissionFolder: EvidenceFolder = {
  id: 'vision-mission',
  name: 'Vision & Mission',
  description: 'Vision, mission, and core values documentation',
  order: 2,
  documents: [
    {
      id: 'vm-vision-doc',
      name: 'Vision Statement Document',
      mandatory: true,
      status: 'approved',
      currentVersion: 2,
      frameworks: ['NAAC', 'NBA'],
      uploadedOn: '08-Jan-2026',
      uploadedBy: 'Principal',
      versions: [
        createVersion(
          'v1',
          1,
          'vision_statement_v1.pdf',
          1024,
          'pdf',
          'Principal',
          '01-Dec-2025',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '03-Dec-2025', versionNotes: 'Initial upload' }
        ),
        createVersion(
          'v2',
          2,
          'vision_statement_v2.pdf',
          1200,
          'pdf',
          'Principal',
          '08-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '10-Jan-2026', versionNotes: 'Updated for 2026' }
        ),
      ],
    },
    {
      id: 'vm-mission-doc',
      name: 'Mission Statement Document',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'NBA'],
      uploadedOn: '08-Jan-2026',
      uploadedBy: 'Principal',
      versions: [
        createVersion(
          'v1',
          1,
          'mission_statement.pdf',
          980,
          'pdf',
          'Principal',
          '08-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '10-Jan-2026' }
        ),
      ],
    },
    {
      id: 'vm-peo-pso',
      name: 'PEO & PSO Mapping Document',
      mandatory: true,
      status: 'under_review',
      currentVersion: 1,
      frameworks: ['NBA'],
      uploadedOn: '15-Jan-2026',
      uploadedBy: 'HOD CSE',
      versions: [
        createVersion(
          'v1',
          1,
          'peo_pso_mapping.pdf',
          2500,
          'pdf',
          'HOD CSE',
          '15-Jan-2026',
          'under_review'
        ),
      ],
    },
    {
      id: 'vm-core-values',
      name: 'Core Values Document',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '08-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'core_values.pdf', 750, 'pdf', 'Admin', '08-Jan-2026', 'uploaded'),
      ],
    },
  ],
};

const addressCampusFolder: EvidenceFolder = {
  id: 'address-campus',
  name: 'Address & Campus',
  description: 'Campus location, land documents, and building plans',
  order: 3,
  documents: [
    {
      id: 'ac-land-doc',
      name: 'Land Ownership Document',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['AICTE', 'NAAC'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'land_ownership.pdf',
          5000,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '07-Jan-2026' }
        ),
      ],
    },
    {
      id: 'ac-building-plan',
      name: 'Building Plan (Approved)',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['AICTE'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Infra Coordinator',
      versions: [
        createVersion(
          'v1',
          1,
          'building_plan.pdf',
          8000,
          'pdf',
          'Infra Coordinator',
          '05-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '07-Jan-2026' }
        ),
      ],
    },
    {
      id: 'ac-campus-map',
      name: 'Campus Layout Map',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '06-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'campus_map.png', 4500, 'png', 'Admin', '06-Jan-2026', 'uploaded'),
      ],
    },
  ],
};

const aicteFolder: EvidenceFolder = {
  id: 'aicte',
  name: 'AICTE',
  description: 'AICTE approval and extension documents',
  order: 4,
  visibility: { field: 'institutionType', value: 'Engineering', operator: 'equals' },
  documents: [
    {
      id: 'aicte-approval',
      name: 'AICTE Approval Letter',
      mandatory: true,
      status: 'approved',
      currentVersion: 2,
      frameworks: ['NAAC', 'NBA', 'NIRF'],
      uploadedOn: '12-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'aicte_approval_2024.pdf',
          1800,
          'pdf',
          'Admin',
          '15-Jun-2025',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '17-Jun-2025', versionNotes: '2024-25 approval' }
        ),
        createVersion(
          'v2',
          2,
          'aicte_approval_2025.pdf',
          1900,
          'pdf',
          'Admin',
          '12-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '14-Jan-2026', versionNotes: '2025-26 approval' }
        ),
      ],
    },
    {
      id: 'aicte-eoa',
      name: 'Extension of Approval (EOA)',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NBA'],
      uploadedOn: '12-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'eoa_2025_26.pdf', 2200, 'pdf', 'Admin', '12-Jan-2026', 'uploaded'),
      ],
    },
    {
      id: 'aicte-intake',
      name: 'Approved Intake Letter',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NBA'],
      uploadedOn: '12-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'intake_letter.pdf',
          1500,
          'pdf',
          'Admin',
          '12-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '14-Jan-2026' }
        ),
      ],
    },
    {
      id: 'aicte-prev',
      name: 'Previous Approval Letter',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['Historical'],
      uploadedOn: '05-Jan-2025',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'prev_approval.pdf',
          1700,
          'pdf',
          'Admin',
          '05-Jan-2025',
          'uploaded'
        ),
      ],
    },
  ],
};

const ugcFolder: EvidenceFolder = {
  id: 'ugc',
  name: 'UGC',
  description: 'UGC recognition and compliance documents',
  order: 5,
  documents: [
    {
      id: 'ugc-recognition',
      name: 'UGC Recognition Letter',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'NIRF'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'ugc_recognition.pdf',
          1400,
          'pdf',
          'Admin',
          '10-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '12-Jan-2026' }
        ),
      ],
    },
    {
      id: 'ugc-12b',
      name: 'UGC 12(B) Status Letter',
      mandatory: true,
      status: 'not_uploaded',
      frameworks: ['UGC', 'NAAC'],
      versions: [],
    },
    {
      id: 'ugc-2f',
      name: 'UGC 2(f) Status Letter',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['UGC', 'NAAC'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'ugc_2f.pdf', 1100, 'pdf', 'Admin', '10-Jan-2026', 'uploaded'),
      ],
    },
  ],
};

const universityAffiliationFolder: EvidenceFolder = {
  id: 'university-affiliation',
  name: 'University Affiliation',
  description: 'Affiliation orders and compliance documents',
  order: 6,
  documents: [
    {
      id: 'ua-affiliation-order',
      name: 'Affiliation Order',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'NBA'],
      uploadedOn: '08-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'affiliation_order.pdf',
          2000,
          'pdf',
          'Admin',
          '08-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '10-Jan-2026' }
        ),
      ],
    },
    {
      id: 'ua-continuation',
      name: 'Continuation of Affiliation',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '08-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'continuation_affiliation.pdf',
          1800,
          'pdf',
          'Admin',
          '08-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'ua-mou',
      name: 'MoU with University',
      mandatory: false,
      status: 'not_uploaded',
      frameworks: ['NAAC'],
      versions: [],
    },
  ],
};

const autonomousFolder: EvidenceFolder = {
  id: 'autonomous',
  name: 'Autonomous',
  description: 'Autonomous status and UGC orders',
  order: 7,
  visibility: { field: 'autonomous', value: true, operator: 'equals' },
  documents: [
    {
      id: 'auto-ugc-order',
      name: 'UGC Autonomous Status Order',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'NBA', 'NIRF'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'autonomous_order.pdf',
          2500,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '07-Jan-2026' }
        ),
      ],
    },
    {
      id: 'auto-extension',
      name: 'Extension of Autonomous Status',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['UGC'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'autonomous_extension.pdf',
          1800,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'uploaded'
        ),
      ],
    },
  ],
};

const naacFolder: EvidenceFolder = {
  id: 'naac',
  name: 'NAAC',
  description: 'NAAC accreditation certificates and reports',
  order: 8,
  visibility: { field: 'naacAccredited', value: true, operator: 'equals' },
  documents: [
    {
      id: 'naac-cert',
      name: 'NAAC Accreditation Certificate',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'NIRF'],
      uploadedOn: '03-Jan-2026',
      uploadedBy: 'IQAC Coordinator',
      versions: [
        createVersion(
          'v1',
          1,
          'naac_certificate.pdf',
          3000,
          'pdf',
          'IQAC Coordinator',
          '03-Jan-2026',
          'approved',
          { verifiedBy: 'Principal', verifiedAt: '05-Jan-2026' }
        ),
      ],
    },
    {
      id: 'naac-ssr',
      name: 'Self Study Report (SSR)',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '03-Jan-2026',
      uploadedBy: 'IQAC Coordinator',
      versions: [
        createVersion(
          'v1',
          1,
          'naac_ssr.pdf',
          15000,
          'pdf',
          'IQAC Coordinator',
          '03-Jan-2026',
          'approved',
          { verifiedBy: 'Principal', verifiedAt: '05-Jan-2026' }
        ),
      ],
    },
    {
      id: 'naac-peer-report',
      name: 'Peer Team Report',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '03-Jan-2026',
      uploadedBy: 'IQAC Coordinator',
      versions: [
        createVersion(
          'v1',
          1,
          'peer_team_report.pdf',
          8000,
          'pdf',
          'IQAC Coordinator',
          '03-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'naac-aqar',
      name: 'AQAR (Annual Quality Assurance Report)',
      mandatory: true,
      status: 'submitted',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '15-Jan-2026',
      uploadedBy: 'IQAC Coordinator',
      versions: [
        createVersion(
          'v1',
          1,
          'aqar_2025_26.pdf',
          12000,
          'pdf',
          'IQAC Coordinator',
          '15-Jan-2026',
          'submitted'
        ),
      ],
    },
    {
      id: 'naac-iiqa',
      name: 'IIQA (Institutional Information for Quality Assessment)',
      mandatory: true,
      status: 'not_uploaded',
      frameworks: ['NAAC'],
      versions: [],
    },
    {
      id: 'naac-dvv',
      name: 'DVV Clarification Report',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'IQAC Coordinator',
      versions: [
        createVersion(
          'v1',
          1,
          'dvv_clarification.pdf',
          5000,
          'pdf',
          'IQAC Coordinator',
          '10-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'naac-prev-cert',
      name: 'Previous NAAC Certificate',
      mandatory: false,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'Historical'],
      uploadedOn: '03-Jan-2026',
      uploadedBy: 'IQAC Coordinator',
      versions: [
        createVersion(
          'v1',
          1,
          'naac_prev_cert.pdf',
          2800,
          'pdf',
          'IQAC Coordinator',
          '03-Jan-2026',
          'approved',
          { verifiedBy: 'Principal', verifiedAt: '05-Jan-2026' }
        ),
      ],
    },
    {
      id: 'naac-action-plan',
      name: 'Quality Improvement Action Plan',
      mandatory: false,
      status: 'under_review',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '18-Jan-2026',
      uploadedBy: 'IQAC Coordinator',
      versions: [
        createVersion(
          'v1',
          1,
          'action_plan.pdf',
          3500,
          'pdf',
          'IQAC Coordinator',
          '18-Jan-2026',
          'under_review'
        ),
      ],
    },
  ],
};

const nbaFolder: EvidenceFolder = {
  id: 'nba',
  name: 'NBA',
  description: 'NBA accreditation documents and SAR',
  order: 9,
  visibility: { field: 'nbaAccredited', value: true, operator: 'equals' },
  documents: [
    {
      id: 'nba-cert',
      name: 'NBA Accreditation Certificate',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NBA', 'NIRF'],
      uploadedOn: '04-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'nba_certificate.pdf',
          2500,
          'pdf',
          'Admin',
          '04-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '06-Jan-2026' }
        ),
      ],
    },
    {
      id: 'nba-sar',
      name: 'Self Assessment Report (SAR)',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NBA'],
      uploadedOn: '04-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'nba_sar.pdf', 20000, 'pdf', 'Admin', '04-Jan-2026', 'uploaded'),
      ],
    },
    {
      id: 'nba-visit-report',
      name: 'NBA Visit Report',
      mandatory: true,
      status: 'not_uploaded',
      frameworks: ['NBA'],
      versions: [],
    },
    {
      id: 'nba-compliance',
      name: 'NBA Compliance Report',
      mandatory: false,
      status: 'not_uploaded',
      frameworks: ['NBA'],
      versions: [],
    },
  ],
};

const nirfFolder: EvidenceFolder = {
  id: 'nirf',
  name: 'NIRF',
  description: 'NIRF ranking submission and data',
  order: 10,
  visibility: { field: 'nirfParticipant', value: true, operator: 'equals' },
  documents: [
    {
      id: 'nirf-submission',
      name: 'NIRF Data Submission',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NIRF'],
      uploadedOn: '20-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'nirf_submission.pdf',
          5000,
          'pdf',
          'Admin',
          '20-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '22-Jan-2026' }
        ),
      ],
    },
    {
      id: 'nirf-ranking-cert',
      name: 'NIRF Ranking Certificate',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NIRF'],
      uploadedOn: '20-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'nirf_ranking.pdf', 1200, 'pdf', 'Admin', '20-Jan-2026', 'uploaded'),
      ],
    },
    {
      id: 'nirf-prev-data',
      name: 'Previous Year NIRF Data',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NIRF', 'Historical'],
      uploadedOn: '20-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'nirf_prev_data.xlsx',
          3500,
          'xlsx',
          'Admin',
          '20-Jan-2026',
          'uploaded'
        ),
      ],
    },
  ],
};

const regulatoryBodiesFolder: EvidenceFolder = {
  id: 'regulatory-bodies',
  name: 'Regulatory Bodies',
  description: 'Approvals from PCI, COA, and other regulatory bodies',
  order: 11,
  documents: [
    {
      id: 'rb-state-approval',
      name: 'State Government Approval',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['AICTE', 'NAAC'],
      uploadedOn: '06-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'state_approval.pdf',
          2200,
          'pdf',
          'Admin',
          '06-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '08-Jan-2026' }
        ),
      ],
    },
    {
      id: 'rb-dte-approval',
      name: 'DTE Approval Letter',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['AICTE'],
      uploadedOn: '06-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'dte_approval.pdf', 1800, 'pdf', 'Admin', '06-Jan-2026', 'uploaded'),
      ],
    },
  ],
};

const governanceFolder: EvidenceFolder = {
  id: 'governance',
  name: 'Governance',
  description: 'Governance structure, committees, and meeting minutes',
  order: 12,
  documents: [
    {
      id: 'gov-structure',
      name: 'Governance Structure Document',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '07-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'governance_structure.pdf',
          3000,
          'pdf',
          'Admin',
          '07-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '09-Jan-2026' }
        ),
      ],
    },
    {
      id: 'gov-gb-minutes',
      name: 'Governing Body Meeting Minutes',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC', 'AICTE'],
      uploadedOn: '07-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'gb_minutes.pdf', 4500, 'pdf', 'Admin', '07-Jan-2026', 'uploaded'),
      ],
    },
    {
      id: 'gov-academic-council',
      name: 'Academic Council Minutes',
      mandatory: true,
      status: 'not_uploaded',
      frameworks: ['NAAC'],
      versions: [],
    },
    {
      id: 'gov-bos-minutes',
      name: 'Board of Studies Minutes',
      mandatory: false,
      status: 'not_uploaded',
      frameworks: ['NAAC', 'NBA'],
      versions: [],
    },
  ],
};

const policiesFolder: EvidenceFolder = {
  id: 'policies',
  name: 'Institution Policies',
  description: 'All institutional policies and procedures',
  order: 13,
  documents: [
    {
      id: 'pol-anti-ragging',
      name: 'Anti-Ragging Policy',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['AICTE', 'UGC', 'NAAC'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'anti_ragging_policy.pdf',
          1500,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '07-Jan-2026' }
        ),
      ],
    },
    {
      id: 'pol-grievance',
      name: 'Grievance Redressal Policy',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC', 'UGC'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'grievance_policy.pdf',
          1200,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '07-Jan-2026' }
        ),
      ],
    },
    {
      id: 'pol-gender',
      name: 'Gender Sensitization Policy',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC', 'UGC'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'gender_policy.pdf',
          1100,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'pol-code-conduct',
      name: 'Code of Conduct',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'code_of_conduct.pdf',
          900,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'pol-ethics',
      name: 'Ethics Policy',
      mandatory: false,
      status: 'not_uploaded',
      frameworks: ['NAAC'],
      versions: [],
    },
  ],
};

const isoQualityFolder: EvidenceFolder = {
  id: 'iso-quality',
  name: 'ISO & Quality',
  description: 'ISO certifications and quality management documents',
  order: 14,
  visibility: { field: 'isoAccredited', value: true, operator: 'equals' },
  documents: [
    {
      id: 'iso-cert',
      name: 'ISO 9001:2015 Certificate',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'iso_certificate.pdf',
          2000,
          'pdf',
          'Admin',
          '10-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '12-Jan-2026' }
        ),
      ],
    },
    {
      id: 'iso-audit-report',
      name: 'ISO Audit Report',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'iso_audit.pdf', 4000, 'pdf', 'Admin', '10-Jan-2026', 'uploaded'),
      ],
    },
  ],
};

const rankingsAwardsFolder: EvidenceFolder = {
  id: 'rankings-awards',
  name: 'Institution Rankings & Awards',
  description: 'Rankings, awards, and recognitions received',
  order: 15,
  documents: [
    {
      id: 'ra-rankings',
      name: 'Institution Rankings Summary',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC', 'NIRF'],
      uploadedOn: '15-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'rankings_summary.pdf',
          1500,
          'pdf',
          'Admin',
          '15-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'ra-awards',
      name: 'Awards & Recognitions',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '15-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'awards.pdf', 2500, 'pdf', 'Admin', '15-Jan-2026', 'uploaded'),
      ],
    },
  ],
};

// ============================================================
// ACADEMIC STRUCTURE SECTION - Folders & Documents
// ============================================================

const academicYearsFolder: EvidenceFolder = {
  id: 'academic-years',
  name: 'Academic Years',
  description: 'Academic calendar and year-wise documentation',
  order: 1,
  documents: [
    {
      id: 'ay-calendar',
      name: 'Academic Calendar',
      mandatory: true,
      status: 'approved',
      currentVersion: 2,
      frameworks: ['NAAC', 'NBA'],
      uploadedOn: '01-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'academic_calendar_2024.pdf',
          1500,
          'pdf',
          'Admin',
          '01-Jul-2025',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '03-Jul-2025' }
        ),
        createVersion(
          'v2',
          2,
          'academic_calendar_2025.pdf',
          1600,
          'pdf',
          'Admin',
          '01-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '03-Jan-2026', versionNotes: 'Updated for 2025-26' }
        ),
      ],
    },
    {
      id: 'ay-schedule',
      name: 'Teaching Schedule',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '02-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'teaching_schedule.pdf',
          2000,
          'pdf',
          'Admin',
          '02-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'ay-holidays',
      name: 'Holiday List',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '02-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'holiday_list.pdf', 500, 'pdf', 'Admin', '02-Jan-2026', 'uploaded'),
      ],
    },
  ],
};

const programsFolder: EvidenceFolder = {
  id: 'programs',
  name: 'Programs',
  description: 'Program approvals and curriculum documents',
  order: 2,
  documents: [
    {
      id: 'prog-approval',
      name: 'Program Approval Documents',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['AICTE', 'NBA'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'program_approvals.pdf',
          5000,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '07-Jan-2026' }
        ),
      ],
    },
    {
      id: 'prog-curriculum',
      name: 'Curriculum Framework',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC', 'NBA'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'curriculum_framework.pdf',
          8000,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'prog-syllabus',
      name: 'Syllabus Documents',
      mandatory: true,
      status: 'under_review',
      currentVersion: 1,
      frameworks: ['NBA'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'HOD',
      versions: [
        createVersion(
          'v1',
          1,
          'syllabus_all.pdf',
          25000,
          'pdf',
          'HOD',
          '10-Jan-2026',
          'under_review'
        ),
      ],
    },
  ],
};

const departmentsFolder: EvidenceFolder = {
  id: 'departments',
  name: 'Departments',
  description: 'Department establishment and faculty documents',
  order: 3,
  documents: [
    {
      id: 'dept-establishment',
      name: 'Department Establishment Orders',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['AICTE', 'NAAC'],
      uploadedOn: '04-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'dept_establishment.pdf',
          3000,
          'pdf',
          'Admin',
          '04-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '06-Jan-2026' }
        ),
      ],
    },
    {
      id: 'dept-faculty-list',
      name: 'Department-wise Faculty List',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC', 'NBA'],
      uploadedOn: '04-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'faculty_list.xlsx',
          1500,
          'xlsx',
          'Admin',
          '04-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'dept-org-chart',
      name: 'Organization Chart',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '04-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion('v1', 1, 'org_chart.pdf', 800, 'pdf', 'Admin', '04-Jan-2026', 'uploaded'),
      ],
    },
  ],
};

const specializationsFolder: EvidenceFolder = {
  id: 'specializations',
  name: 'Specializations',
  description: 'Specialization approvals and details',
  order: 4,
  documents: [
    {
      id: 'spec-approval',
      name: 'Specialization Approval Letters',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['AICTE', 'NBA'],
      uploadedOn: '06-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'spec_approvals.pdf',
          2000,
          'pdf',
          'Admin',
          '06-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'spec-details',
      name: 'Specialization Details & Intake',
      mandatory: true,
      status: 'not_uploaded',
      frameworks: ['NBA'],
      versions: [],
    },
  ],
};

const regulationsFolder: EvidenceFolder = {
  id: 'regulations',
  name: 'Academic Regulations',
  description: 'Academic regulations and examination rules',
  order: 5,
  documents: [
    {
      id: 'reg-academic',
      name: 'Academic Regulations Document',
      mandatory: true,
      status: 'approved',
      currentVersion: 2,
      frameworks: ['NAAC', 'NBA'],
      uploadedOn: '08-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'regulations_r20.pdf',
          5000,
          'pdf',
          'Admin',
          '01-Jul-2024',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '03-Jul-2024' }
        ),
        createVersion(
          'v2',
          2,
          'regulations_r23.pdf',
          5500,
          'pdf',
          'Admin',
          '08-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '10-Jan-2026', versionNotes: 'R23 regulations' }
        ),
      ],
    },
    {
      id: 'reg-exam-rules',
      name: 'Examination Rules & Procedures',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '08-Jan-2026',
      uploadedBy: 'Exam Officer',
      versions: [
        createVersion(
          'v1',
          1,
          'exam_rules.pdf',
          3000,
          'pdf',
          'Exam Officer',
          '08-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'reg-credit-system',
      name: 'Credit System Document',
      mandatory: false,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['NBA'],
      uploadedOn: '08-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'credit_system.pdf',
          1500,
          'pdf',
          'Admin',
          '08-Jan-2026',
          'uploaded'
        ),
      ],
    },
  ],
};

const programOfferingsFolder: EvidenceFolder = {
  id: 'program-offerings',
  name: 'Program Offerings',
  description: 'Program-wise offering details and approvals',
  order: 6,
  documents: [
    {
      id: 'po-master-list',
      name: 'Program Offerings Master List',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['AICTE', 'NAAC', 'NBA'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'program_offerings.xlsx',
          2000,
          'xlsx',
          'Admin',
          '05-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '07-Jan-2026' }
        ),
      ],
    },
    {
      id: 'po-intake-approval',
      name: 'Intake Approval Letters',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['AICTE'],
      uploadedOn: '05-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'intake_approvals.pdf',
          3500,
          'pdf',
          'Admin',
          '05-Jan-2026',
          'uploaded'
        ),
      ],
    },
  ],
};

const programIntakeFolder: EvidenceFolder = {
  id: 'program-intake',
  name: 'Program Intake',
  description: 'Year-wise intake data and admission documents',
  order: 7,
  documents: [
    {
      id: 'pi-intake-data',
      name: 'Year-wise Intake Data',
      mandatory: true,
      status: 'uploaded',
      currentVersion: 1,
      frameworks: ['AICTE', 'NAAC', 'NIRF'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'intake_data.xlsx',
          1800,
          'xlsx',
          'Admin',
          '10-Jan-2026',
          'uploaded'
        ),
      ],
    },
    {
      id: 'pi-admission-process',
      name: 'Admission Process Document',
      mandatory: true,
      status: 'approved',
      currentVersion: 1,
      frameworks: ['NAAC'],
      uploadedOn: '10-Jan-2026',
      uploadedBy: 'Admin',
      versions: [
        createVersion(
          'v1',
          1,
          'admission_process.pdf',
          2500,
          'pdf',
          'Admin',
          '10-Jan-2026',
          'approved',
          { verifiedBy: 'IQAC', verifiedAt: '12-Jan-2026' }
        ),
      ],
    },
    {
      id: 'pi-lateral-entry',
      name: 'Lateral Entry Details',
      mandatory: false,
      status: 'not_uploaded',
      frameworks: ['AICTE'],
      versions: [],
    },
  ],
};

// ============================================================
// ASSEMBLE REPOSITORY CONFIG
// ============================================================

export const institutionInformationSection: RepositorySection = {
  id: 'institution-information',
  name: 'Institution Information',
  description: 'Institution-level supporting documents and evidence',
  folders: [
    institutionInfoFolder,
    visionMissionFolder,
    addressCampusFolder,
    aicteFolder,
    ugcFolder,
    universityAffiliationFolder,
    autonomousFolder,
    naacFolder,
    nbaFolder,
    nirfFolder,
    regulatoryBodiesFolder,
    governanceFolder,
    policiesFolder,
    isoQualityFolder,
    rankingsAwardsFolder,
  ],
};

export const academicStructureSection: RepositorySection = {
  id: 'academic-structure',
  name: 'Academic Structure',
  description: 'Academic structure supporting documents',
  folders: [
    academicYearsFolder,
    programsFolder,
    departmentsFolder,
    specializationsFolder,
    regulationsFolder,
    programOfferingsFolder,
    programIntakeFolder,
  ],
};

export const defaultInstitutionConfig: InstitutionConfig = {
  naacAccredited: true,
  nbaAccredited: true,
  autonomous: true,
  institutionType: 'Engineering',
  nirfParticipant: true,
  isoAccredited: true,
};

export const supportingDocumentsConfig: RepositoryConfig = {
  id: 'institution-admin-supporting-docs',
  name: 'Supporting Documents',
  description: 'Institution-level evidence repository',
  sections: [institutionInformationSection, academicStructureSection],
  institutionConfig: defaultInstitutionConfig,
};

// ============================================================
// NOTIFICATIONS
// ============================================================

export function generateNotifications(
  sections: RepositorySection[],
  config?: InstitutionConfig
): NotificationItem[] {
  const notifications: NotificationItem[] = [];

  sections.forEach(section => {
    section.folders.forEach(folder => {
      if (!isFolderVisible(folder, config)) return;

      folder.documents.forEach(doc => {
        if (doc.mandatory && doc.status === 'not_uploaded') {
          notifications.push({
            id: `missing-${doc.id}`,
            type: 'missing',
            title: `Missing: ${doc.name}`,
            description: `Required document in "${folder.name}" has not been uploaded`,
            severity: 'critical',
            timestamp: 'Now',
            documentId: doc.id,
            folderId: folder.id,
          });
        }
        if (doc.status === 'rejected') {
          notifications.push({
            id: `rejected-${doc.id}`,
            type: 'rejected',
            title: `Rejected: ${doc.name}`,
            description: `Document in "${folder.name}" was rejected and needs re-upload`,
            severity: 'critical',
            timestamp: 'Recently',
            documentId: doc.id,
            folderId: folder.id,
          });
        }
        if (doc.status === 'under_review') {
          notifications.push({
            id: `review-${doc.id}`,
            type: 'pending_review',
            title: `Pending Review: ${doc.name}`,
            description: `Document in "${folder.name}" is awaiting verification`,
            severity: 'warning',
            timestamp: doc.uploadedOn || 'Recently',
            documentId: doc.id,
            folderId: folder.id,
          });
        }
        if (doc.expiryDate) {
          notifications.push({
            id: `expiring-${doc.id}`,
            type: 'expiring',
            title: `Expiring: ${doc.name}`,
            description: `Document expires on ${doc.expiryDate}`,
            severity: 'warning',
            timestamp: doc.expiryDate,
            documentId: doc.id,
            folderId: folder.id,
          });
        }
      });
    });
  });

  return notifications.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
