'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EntityDetailLoading } from '@/components/entity-detail/entity-detail-view';

/**
 * Legacy /workstreams/:id → program/project (WS is internal tag only).
 * Aligns with apps/api/src/data/ws-program-mapping.ts
 */
const WS_REDIRECT: Record<string, string> = {
  'WS-BLD': '/programs/PRG-CON',
  'WS-CLN': '/projects/AN-08',
  'WS-HVAC': '/projects/AN-09',
  'WS-UTL': '/projects/AN-24',
  'WS-PRD': '/projects/AN-13',
  'WS-PKG': '/programs/PRG-EQP',
  'WS-QC': '/projects/AN-20',
  'WS-AUT': '/projects/AN-16',
};

export default function WorkstreamDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    router.replace(WS_REDIRECT[id] ?? '/programs');
  }, [id, router]);

  return <EntityDetailLoading />;
}
