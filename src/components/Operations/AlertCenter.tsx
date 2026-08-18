/**
 * MECHTWIN AI - Industrial Alert & Alarm Management Center
 * IEC 62682 Alarm Systems Management standards compliance
 * Created & Engineered by Samil Khan
 */

import React, { useState } from 'react';
import { Machine } from '../../types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Bell,
  Search,
  Filter,
  ArrowRight,
  Wrench,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface AlertCenterProps {
  machine: Machine;
  onOpenWorkOrderModal?: () => void;
  onOpenAICopilot?: (prompt: string) => void;
}

interface AlertEntry {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  component: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  issue: string;
  recommendedAction: string;
  acknowledged: boolean;
  standardRef: string;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  machine,
  onOpenWorkOrderModal,
  onOpenAICopilot,
}) => {
  const [activeSeverity, setActiveSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertsList, setAlertsList] = useState<AlertEntry[]>([
    {
      id: 'ALT-1081',
      timestamp: '2026-08-17 09:14:22',
      machineId: 'MT-001',
      machineName: 'Centrifugal Pump & Motor Assembly',
      component: 'DE Bearing (SKF 6208)',
      severity: machine.latestTelemetry.vibration > 4.5 ? 'CRITICAL' : 'WARNING',
      issue: `Elevated overall vibration velocity (${machine.latestTelemetry.vibration.toFixed(2)} mm/s RMS) with BPFO harmonics.`,
      recommendedAction: 'Schedule vibration spectrum analysis and inspect grease lubrication level.',
      acknowledged: false,
      standardRef: 'ISO 10816-3 Zone C',
    },
    {
      id: 'ALT-1082',
      timestamp: '2026-08-17 08:40:15',
      machineId: 'MT-001',
      machineName: 'Centrifugal Pump & Motor Assembly',
      component: 'Stator Core & Windings',
      severity: machine.latestTelemetry.temperature > 85 ? 'CRITICAL' : 'WARNING',
      issue: `Stator thermal rise reached ${machine.latestTelemetry.temperature.toFixed(1)}°C under continuous service load.`,
      recommendedAction: 'Inspect external cooling air cowl and clean heat dissipation fins.',
      acknowledged: false,
      standardRef: 'IEC 60034-1 Class F',
    },
    {
      id: 'ALT-1083',
      timestamp: '2026-08-16 17:10:00',
      machineId: 'MT-002',
      machineName: 'High-Speed Helical Industrial Gearbox',
      component: 'Input Helical Pinion',
      severity: 'WARNING',
      issue: 'Gear mesh frequency harmonic (GMF 2X) peak elevation indicating initial flank micro-pitting.',
      recommendedAction: 'Draw 500ml oil sample for ISO 4406 particle count and kinematic viscosity check.',
      acknowledged: true,
      standardRef: 'AGMA 9005-F16',
    },
    {
      id: 'ALT-1084',
      timestamp: '2026-08-16 11:05:30',
      machineId: 'MT-003',
      machineName: 'Screw Compressor Unit #3',
      component: 'Oil Separator Filter',
      severity: 'INFO',
      issue: 'Differential pressure across coalescing separator reached 0.45 bar (75% service threshold).',
      recommendedAction: 'Order replacement coalescing cartridge for next routine service window.',
      acknowledged: true,
      standardRef: 'ISO 8573-1',
    },
  ]);

  const toggleAcknowledge = (id: string) => {
    setAlertsList(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

  const filteredAlerts = alertsList.filter(a => {
    const matchSev = activeSeverity === 'ALL' || a.severity === activeSeverity;
    const matchSearch =
      a.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.machineName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSev && matchSearch;
  });

  const criticalCount = alertsList.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
  const warningCount = alertsList.filter(a => a.severity === 'WARNING' && !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* 1. Header and Alarm Filter Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono tracking-wide">
              OPERATIONAL ALERTS & ALARMS CENTER
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              IEC 62682 Standardized Plant-wide Alarm Categorization & Prioritization
            </p>
          </div>
        </div>

        {/* Search & Severity Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alarms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
              <button
                key={sev}
                onClick={() => setActiveSeverity(sev)}
                className={`px-2.5 py-1 rounded transition-colors font-bold ${
                  activeSeverity === sev
                    ? sev === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : sev === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Alarm Cards / Table */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Active Alarm Feed ({filteredAlerts.length})
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-rose-400 font-bold">{criticalCount} Critical Unacknowledged</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">{warningCount} Warning</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                alert.acknowledged ? 'bg-slate-950/40 opacity-75' : 'bg-slate-900/40 hover:bg-slate-850/60'
              }`}
            >
              {/* Left Column: Severity & Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{alert.component}</span>
                  <span className="text-[10px] font-mono text-slate-500">[{alert.id}]</span>
                  <span className="text-[10px] font-mono text-slate-400">• {alert.machineName} ({alert.machineId})</span>
                </div>

                <p className="text-xs text-slate-200 font-sans leading-relaxed">{alert.issue}</p>

                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300/90 bg-cyan-950/30 p-2.5 rounded border border-cyan-900/40">
                  <span className="text-slate-400">Action:</span>
                  <span>{alert.recommendedAction}</span>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-1">
                  <span>Timestamp: <strong className="text-slate-400">{alert.timestamp}</strong></span>
                  <span>Standard: <strong className="text-slate-400">{alert.standardRef}</strong></span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                <button
                  onClick={() => onOpenAICopilot && onOpenAICopilot(`Explain alert ${alert.id} on ${alert.component}: ${alert.issue}`)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono transition-colors border border-slate-700"
                  title="Ask Copilot"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleAcknowledge(alert.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
                    alert.acknowledged
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                </button>

                {onOpenWorkOrderModal && (
                  <button
                    onClick={onOpenWorkOrderModal}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-colors flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Work Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
