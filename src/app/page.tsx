'use client';

import { AppProvider, useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { ExecutiveImpact } from '@/components/screens/ExecutiveImpact';
import { DataLandscape } from '@/components/screens/DataLandscape';
import { MatchingEngine } from '@/components/screens/MatchingEngine';
import { DataQuality } from '@/components/screens/DataQuality';
import { SurvivorshipRules } from '@/components/screens/SurvivorshipRules';
import { GoldenRecord } from '@/components/screens/GoldenRecord';

function ScreenRouter() {
  const { activeScreen } = useApp();

  const screens: Record<string, React.ReactNode> = {
    executiveImpact: <ExecutiveImpact />,
    dataLandscape: <DataLandscape />,
    matchingEngine: <MatchingEngine />,
    dataQuality: <DataQuality />,
    survivorshipRules: <SurvivorshipRules />,
    goldenRecord: <GoldenRecord />,
  };

  return <>{screens[activeScreen]}</>;
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell>
        <ScreenRouter />
      </AppShell>
    </AppProvider>
  );
}
