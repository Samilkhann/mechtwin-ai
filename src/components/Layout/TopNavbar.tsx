/**
 * MECHTWIN AI - Industrial Top Navigation & Asset Sync Header
 * Created & Engineered by Samil Khan
 */

import React, { useState, useEffect } from 'react';
import { Machine, User } from '../../types';
import {
  ChevronDown,
  Activity,
  Thermometer,
  Zap,
  Gauge,
  Play,
  Pause,
  Bell,
  CheckCircle2,
  UserCheck,
  Sparkles,
  Layers,
  Radio,
  Sliders,
} from 'lucide-react';

interface TopNavbarProps {
  machines: Machine[];
  selectedMachine: Machine;
  onSelectMachine: (machineId: string) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  onOpenAICopilot: () => void;
  onOpenAlerts?: () => void;
  currentUser?: User;
  onSwitchUser?: (user: User) => void;
}

const AVAILABLE_USERS: User[] = [
  {
    id: 'USR-ADMIN-01',
    name: 'Samil Khan',
    email: 'samil.khan@mechtwin.ai',
    role: 'ADMIN',
    organizationId: 'ORG-001',
    organizationName: 'Advanced Industrial Manufacturing Corp',
    department: 'Principal Reliability Engineering & AI Architecture',
    avatarInitials: 'SK',
  },
  {
    id: 'USR-ENG-02',
    name: 'Marcus Vance',
    email: 'marcus.vance@industry.corp',
    role: 'ENGINEER',
    organizationId: 'ORG-001',
    organizationName: 'Advanced Industrial Manufacturing Corp',
    department: 'Plant Vibration & Rotating Equipment',
    avatarInitials: 'MV',
  },
  {
    id: 'USR-VIEW-03',
    name: 'Elena Rostova',
    email: 'elena.rostova@operations.corp',
    role: 'VIEWER',
    organizationId: 'ORG-001',
    organizationName: 'Advanced Industrial Manufacturing Corp',
    department: 'Operations & Maintenance Monitoring',
    avatarInitials: 'ER',
  },
];

export const TopNavbar: React.FC<TopNavbarProps> = ({
  machines,
  selectedMachine,
  onSelectMachine,
  isSimulating,
  setIsSimulating,
  onOpenAICopilot,
  onOpenAlerts,
  currentUser = AVAILABLE_USERS[0],
  onSwitchUser,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [syncSecondsAgo, setSyncSecondsAgo] = useState(1);

  const telemetry = selectedMachine.latestTelemetry;
  const health = selectedMachine.healthBreakdown;

  // Live timer for "Last synchronized: X sec ago"
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncSecondsAgo(prev => (prev >= 5 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* 1. Left: Asset Selector & Status Badges */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden md:inline">
            ASSET:
          </span>
          <div className="relative">
            <select
              value={selectedMachine.id}
              onChange={e => onSelectMachine(e.target.value)}
              className="appearance-none bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-600 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-white font-mono cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Live Sync Connection Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">CONNECTED</span>
          </div>

          <span className="text-[10px] font-mono text-slate-500 hidden xl:inline">
            Last synchronized: <strong className="text-slate-300">{syncSecondsAgo}s ago</strong>
          </span>
        </div>

        {/* Mode Toggle: LIVE / SIMULATION */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
          <span className="text-slate-400 px-1 text-[10px] uppercase">Mode:</span>
          <button
            onClick={() => setIsSimulating(false)}
            className={`px-2 py-0.5 rounded transition-colors ${
              !isSimulating
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            STATIC
          </button>
          <button
            onClick={() => setIsSimulating(true)}
            className={`px-2 py-0.5 rounded transition-colors ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            LIVE STREAM
          </button>
        </div>
      </div>

      {/* 2. Right: Real-time Telemetry Strip, Quick Copilot, Alerts & User Profile */}
      <div className="flex items-center gap-3">
        {/* Monospaced Telemetry Value Strip */}
        <div className="hidden xl:flex items-center gap-4 font-mono text-xs border-r border-slate-800 pr-4">
          <div className="flex items-center gap-1 text-slate-300" title="Rotational Speed">
            <span className="text-slate-500 text-[10px]">RPM:</span>
            <strong className="text-white">{telemetry.rpm.toFixed(0)}</strong>
          </div>
          <div className="flex items-center gap-1 text-slate-300" title="Bearing Vibration">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <strong className="text-white">{telemetry.vibration.toFixed(2)}</strong>
            <span className="text-slate-500 text-[10px]">mm/s</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300" title="Stator Temperature">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-white">{telemetry.temperature.toFixed(1)}</strong>
            <span className="text-slate-500 text-[10px]">°C</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300" title="Active Power">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-white">{telemetry.power.toFixed(1)}</strong>
            <span className="text-slate-500 text-[10px]">kW</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300" title="Pump Efficiency">
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <strong className="text-white">{telemetry.efficiency.toFixed(1)}</strong>
            <span className="text-slate-500 text-[10px]">%</span>
          </div>
        </div>

        {/* AI Copilot Quick Trigger */}
        <button
          onClick={onOpenAICopilot}
          className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          title="Open AI Reliability Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Copilot</span>
        </button>

        {/* Alerts Center Quick Bell */}
        {onOpenAlerts && (
          <button
            onClick={onOpenAlerts}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 relative transition-colors"
            title="Open Alerts Center"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-pulse" />
          </button>
        )}

        {/* User Profile / RBAC Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm shadow-cyan-950">
              {currentUser.avatarInitials || 'SK'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-200 font-mono leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono leading-none mt-0.5">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* User Persona Switcher Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl p-2 z-50 font-mono text-xs">
              <div className="p-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                Switch Operational Persona (RBAC)
              </div>
              <div className="space-y-1 mt-1">
                {AVAILABLE_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchUser && onSwitchUser(user);
                      setShowUserMenu(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                      currentUser.id === user.id ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.department}</div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
