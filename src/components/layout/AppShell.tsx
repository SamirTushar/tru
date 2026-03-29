'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AgentDrawer } from './AgentDrawer';
import { ExplainDrawer } from './ExplainDrawer';
import { useApp } from '@/context/AppContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { agentOpen, explainDrawerOpen, setAgentOpen, closeExplainDrawer } = useApp();
  const anyDrawerOpen = agentOpen || explainDrawerOpen;

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto px-8 py-7">
            {children}
          </main>
        </div>
      </div>

      {/* Overlay backdrop */}
      {anyDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
          onClick={() => { setAgentOpen(false); closeExplainDrawer(); }}
        />
      )}

      {/* Drawers render as fixed overlays */}
      <AgentDrawer />
      <ExplainDrawer />
    </>
  );
}
