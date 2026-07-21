import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { EvidenceRepositoryEngine } from '@/components/evidence-repository';
import { calculateSectionMetrics } from '@/components/evidence-repository/types';
import {
  supportingDocumentsConfig,
} from './evidence-metadata';

type ActiveSection = 'institution-information' | 'academic-structure';

export default function SupportingDocumentsPage() {
  const location = useLocation();
  const initialSection: ActiveSection = location.pathname.includes('/academic')
    ? 'academic-structure'
    : 'institution-information';
  const [activeSection, setActiveSection] = useState<ActiveSection>(initialSection);

  useEffect(() => {
    if (location.pathname.includes('/academic')) {
      setActiveSection('academic-structure');
    } else {
      setActiveSection('institution-information');
    }
  }, [location.pathname]);

  const config = supportingDocumentsConfig;
  const institutionConfig = config.institutionConfig;

  const currentSection = config.sections.find(s => s.id === activeSection)!;

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto">
      <div className="p-6">
        <EvidenceRepositoryEngine
          section={currentSection}
          institutionConfig={institutionConfig}
          notifications={[]}
          activeSection={activeSection}
          onSectionChange={(section) => setActiveSection(section as ActiveSection)}
          sections={config.sections}
        />
      </div>
    </div>
  );
}