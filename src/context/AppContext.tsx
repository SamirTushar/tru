'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AppState, MasterFilter, ScreenId, Theme, ExplainPayload } from '@/types';

interface AppContextValue extends AppState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setActiveMaster: (master: MasterFilter) => void;
  setActiveScreen: (screen: ScreenId) => void;
  toggleAgent: () => void;
  setAgentOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  explainData: ExplainPayload | null;
  openExplainDrawer: (data: ExplainPayload) => void;
  closeExplainDrawer: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [activeMaster, setActiveMaster] = useState<MasterFilter>('all');
  const [activeScreen, setActiveScreen] = useState<ScreenId>('executiveImpact');
  const [agentOpen, setAgentOpenState] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [explainDrawerOpen, setExplainDrawerOpen] = useState(false);
  const [explainData, setExplainData] = useState<ExplainPayload | null>(null);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const setAgentOpen = useCallback((open: boolean) => {
    setAgentOpenState(open);
    if (open) {
      setExplainDrawerOpen(false);
      setExplainData(null);
    }
  }, []);

  const toggleAgent = useCallback(() => {
    setAgentOpenState(prev => {
      if (!prev) {
        setExplainDrawerOpen(false);
        setExplainData(null);
      }
      return !prev;
    });
  }, []);

  const openExplainDrawer = useCallback((data: ExplainPayload) => {
    setExplainData(data);
    setExplainDrawerOpen(true);
    setAgentOpenState(false);
  }, []);

  const closeExplainDrawer = useCallback(() => {
    setExplainDrawerOpen(false);
    setExplainData(null);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), []);

  return (
    <AppContext.Provider
      value={{
        theme,
        activeMaster,
        activeScreen,
        agentOpen,
        sidebarCollapsed,
        explainDrawerOpen,
        explainData,
        setTheme,
        toggleTheme,
        setActiveMaster,
        setActiveScreen,
        toggleAgent,
        setAgentOpen,
        toggleSidebar,
        openExplainDrawer,
        closeExplainDrawer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
