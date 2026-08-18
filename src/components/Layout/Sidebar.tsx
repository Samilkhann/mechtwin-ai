/**
 * MECHTWIN AI - Industrial Engineering Sidebar Navigation
 * Structured across: OVERVIEW, MONITORING, INTELLIGENCE, ENGINEERING, OPERATIONS, SYSTEM
 * Created & Engineered by Samil Khan
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Activity,
  Calculator,
  Sparkles,
  Wrench,
  Cpu,
  FileText,
  Server,
  AlertTriangle,
  Zap,
  Sliders,
  ShieldAlert,
  Settings,
  Globe,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MechTwinLogo } from '../Common/MechTwinLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  machineCount: number;
  activeFaultCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  machineCount,
  activeFaultCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'landing', label: 'Product Showcase', icon: Globe },
      ],
    },
    {
      title: 'MONITORING',
      items: [
        { id: 'live_monitoring', label: 'Live Monitoring', icon: Activity, pulse: true },
        { id: 'digital_twin', label: 'Digital Twin', icon: Layers, badge: '3D CAD' },
        { id: 'fleet', label: 'Machines', icon: Server, count: machineCount },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'predictive', label: 'Predictive Maintenance', icon: ShieldAlert },
        { id: 'ai_copilot', label: 'AI Copilot', icon: Sparkles, highlight: true },
        { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle, count: activeFaultCount },
      ],
    },
    {
      title: 'ENGINEERING',
      items: [
        { id: 'calculations', label: 'Calculations', icon: Calculator, badge: 'ISO' },
        { id: 'what_if', label: 'Simulation', icon: Sliders },
        { id: 'energy', label: 'Energy', icon: Zap },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'alerts', label: 'Alerts', icon: Bell, count: 2 },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'iot_gateway', label: 'IoT Hardware', icon: Cpu },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none transition-all duration-300 z-40`}
    >
      {/* 1. Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div
            onClick={() => setActiveTab('overview')}
            className="cursor-pointer overflow-hidden"
          >
            <MechTwinLogo variant={isCollapsed ? 'icon-only' : 'compact'} size="sm" />
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 2. Structured Navigation Sections */}
        <nav className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navSections.map(section => (
            <div key={section.title} className="space-y-0.5">
              {!isCollapsed && (
                <div className="text-[9px] font-mono text-slate-500 px-3 py-1 uppercase tracking-widest">
                  {section.title}
                </div>
              )}

              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-1.5'
                    } rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? item.highlight
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950 font-bold'
                          : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? item.highlight
                              ? 'text-white'
                              : 'text-cyan-400'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.pulse && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        )}
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.badge}
                          </span>
                        )}
                        {typeof item.count === 'number' && item.count > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {item.count}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* 3. Footer System Status & Creator Credit */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Physics Engine
              </span>
              <span className="text-emerald-400 font-bold">10 Hz Live</span>
            </div>

            <div className="text-[10px] text-cyan-400/90 font-mono italic tracking-tight">
              &ldquo;Engineering Intelligence for Every Machine.&rdquo;
            </div>

            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-slate-400">Created & Engineered by:</span>
              <span className="font-semibold text-slate-200 font-mono">Samil Khan</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1 text-center font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Physics Engine Online" />
            <span className="text-[8px] text-slate-500 font-bold">SK</span>
          </div>
        )}
      </div>
    </aside>
  );
};
