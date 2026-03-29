'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { SCREENS, SUBTITLES, MASTER_FILTERS } from '@/lib/constants';
import { Sun, Moon, MessageSquare, ChevronDown, LayoutGrid, Users, Package, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MasterFilter } from '@/types';

const MASTER_ICONS: Record<string, React.ElementType> = {
  LayoutGrid, Users, Package, Building2,
};

const MASTER_LABELS: Record<string, string> = {
  all: 'All Masters',
  customer: 'Customer',
  product: 'Product',
  organisation: 'Organisation',
};

export function TopBar() {
  const { activeScreen, activeMaster, setActiveMaster, theme, toggleTheme, toggleAgent, agentOpen } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [agentEverOpened, setAgentEverOpened] = useState(false);

  const screen = SCREENS.find(s => s.id === activeScreen);
  const subtitle = SUBTITLES[activeScreen]?.[activeMaster] ?? '';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const currentFilter = MASTER_FILTERS.find(f => f.id === activeMaster);
  const CurrentIcon = currentFilter ? MASTER_ICONS[currentFilter.icon] : LayoutGrid;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {screen?.label}
      </h1>
      <div className="flex items-center gap-2">
        {/* Master Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="gap-2"
          >
            <CurrentIcon size={14} />
            <span>{MASTER_LABELS[activeMaster]}</span>
            <ChevronDown size={14} className={cn('transition-transform duration-200', dropdownOpen && 'rotate-180')} />
          </Button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-150">
              {MASTER_FILTERS.map(f => {
                const Icon = MASTER_ICONS[f.icon];
                const isActive = activeMaster === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveMaster(f.id as MasterFilter);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <Icon size={15} className={isActive ? 'text-orange-500' : 'text-gray-400'} />
                    <span className="font-medium">{f.label}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Agent Button */}
        <Button
          size="sm"
          onClick={() => { toggleAgent(); setAgentEverOpened(true); }}
          className={cn(
            agentOpen
              ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm',
            !agentOpen && !agentEverOpened && 'animate-agent-pulse'
          )}
        >
          <MessageSquare size={16} className="mr-1.5" />
          Agent
        </Button>

        {/* Theme Toggle */}
        <Button variant="outline" size="icon" onClick={toggleTheme} className="h-8 w-8">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
      </div>
    </header>
  );
}
