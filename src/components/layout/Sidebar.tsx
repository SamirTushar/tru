'use client';

import { useApp } from '@/context/AppContext';
import { SCREENS, SCREEN_GROUPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  BarChart3, Map, GitMerge, AlertCircle, Scale, Award,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import type { ScreenId } from '@/types';

const SCREEN_ICONS: Record<string, React.ElementType> = {
  BarChart3, Map, GitMerge, AlertCircle, Scale, Award,
};

export function Sidebar() {
  const { activeScreen, setActiveScreen, sidebarCollapsed, toggleSidebar } = useApp();

  const renderItem = (
    icon: React.ElementType,
    label: string,
    isActive: boolean,
    onClick: () => void,
    collapsed: boolean,
  ) => {
    const Icon = icon;
    return (
      <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={cn(
          'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-l-[3px] border-orange-500 pl-[9px]'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-[3px] border-transparent pl-[9px]',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon size={18} className={isActive ? 'text-orange-500' : ''} />
        {!collapsed && <span className="truncate">{label}</span>}
        {collapsed && <span className="sr-only">{label}</span>}
      </button>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transition-all duration-200 shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-slate-700', sidebarCollapsed && 'justify-center px-2')}>
        <img src="/3sc-logo.svg" alt="3SC" className="w-9 h-9 shrink-0" />
        {!sidebarCollapsed && (
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-gray-100">TRU</span>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 -mt-1">Trusted Record Unification</p>
          </div>
        )}
      </div>

      {/* Screen Navigation */}
      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2">
        {SCREEN_GROUPS.map(group => (
          <div key={group} className="mb-3">
            {!sidebarCollapsed && (
              <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group}
              </p>
            )}
            <div className="space-y-0.5">
              {SCREENS.filter(s => s.group === group).map(s => {
                const Icon = SCREEN_ICONS[s.icon];
                return (
                  <div key={s.id}>
                    {renderItem(Icon, s.label, activeScreen === s.id, () => setActiveScreen(s.id as ScreenId), sidebarCollapsed)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'flex items-center gap-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-t border-gray-200 dark:border-slate-700 transition-colors',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        {!sidebarCollapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
