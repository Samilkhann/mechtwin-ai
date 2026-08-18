/**
 * MECHTWIN AI - Industrial Anomaly Investigation Center
 * Features: Multi-sensor deviation detection, root cause classification, and AI evidence analysis
 * Created & Engineered by Samil Khan
 */

import React, { useState } from 'react';
import { Machine, TelemetryReading } from '../../types';
import {
  AlertTriangle,
  Activity,
  Thermometer,
  Zap,
  Gauge,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Sliders,
  FileCheck,
  Compass,
  Layers,
} from 'lucide-react';

interface AnomalyCenterProps {
  machine: Machine;
  telemetryHistory: TelemetryReading[];
  onOpenWorkOrderModal?: () => void;
  onOpenAICopilot?: (prompt: string) => void;
}

interface AnomalyItem {
  id: string;
  timestamp: string;
  sensor: string;
  unit: string;
  observedValue: number;
  expectedRange: [number, number];
  deviationPct: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  affectedComponent: string;
  possibleCause: string;
  evidence: string[];
  recommendedAction: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  confidencePct: number;
}

export const AnomalyCenter: React.FC<AnomalyCenterProps> = ({
  machine,
  telemetryHistory,
  onOpenWorkOrderModal,
  onOpenAICopilot,
}) => {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>('ANOM-001');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const telemetry = machine.latestTelemetry;

  // Dynamic real-time anomalies derived from machine telemetry
  const anomalies: AnomalyItem[] = [
    {
      id: 'ANOM-001',
      timestamp: '2026-08-17 09:14:22',
      sensor: 'DE Bearing Vibration (v_RMS)',
      unit: 'mm/s RMS',
      observedValue: telemetry.vibration,
      expectedRange: [1.2, 2.8],
      deviationPct: Number((((telemetry.vibration - 2.8) / 2.8) * 100).toFixed(1)),
      severity: telemetry.vibration > 4.5 ? 'CRITICAL' : telemetry.vibration > 2.8 ? 'WARNING' : 'INFO',
      affectedComponent: 'DE Bearing (SKF 6208)',
      possibleCause: 'Outer Raceway Ball Pass Frequency Defect (BPFO) & Micro-Spalling',
      evidence: [
        `Vibration velocity ${telemetry.vibration.toFixed(2)} mm/s exceeds ISO 10816-3 Zone B limit (2.8 mm/s)`,
        `Ultrasonic peak demodulation detects 105.8 Hz spectral harmonics`,
        `DE Bearing temperature elevated to ${(telemetry.temperature + 4.2).toFixed(1)}°C (+14% vs baseline)`,
      ],
      recommendedAction: 'Perform high-frequency FFT vibration sweep and inject 15g Shell Gadus S2 V220 grease.',
      status: telemetry.vibration > 2.8 ? 'OPEN' : 'RESOLVED',
      confidencePct: 91,
    },
    {
      id: 'ANOM-002',
      timestamp: '2026-08-17 08:42:10',
      sensor: 'Stator Winding Temperature (T_stator)',
      unit: '°C',
      observedValue: telemetry.temperature,
      expectedRange: [45.0, 70.0],
      deviationPct: Number((((telemetry.temperature - 70.0) / 70.0) * 100).toFixed(1)),
      severity: telemetry.temperature > 85 ? 'CRITICAL' : telemetry.temperature > 70 ? 'WARNING' : 'INFO',
      affectedComponent: 'Electric Motor (IE3 Premium)',
      possibleCause: 'Cooling Fin Dust Accumulation or Continuous High Service Factor Load',
      evidence: [
        `Thermal rise reaches ${telemetry.temperature.toFixed(1)}°C (IEC 60034-1 thermal rating Class F margin)`,
        `Ambient temperature is 26.5°C; temperature rise exceeds 42°C delta`,
        `Current draw at ${telemetry.current.toFixed(1)} A (${((telemetry.current / (machine.ratedCurrentA || 10)) * 100).toFixed(0)}% full load)`,
      ],
      recommendedAction: 'Inspect motor cowl air intake and blow out cooling fin channels with dry compressed air.',
      status: 'INVESTIGATING',
      confidencePct: 84,
    },
    {
      id: 'ANOM-003',
      timestamp: '2026-08-16 16:30:00',
      sensor: 'Hydraulic Efficiency (η_pump)',
      unit: '%',
      observedValue: telemetry.efficiency,
      expectedRange: [80.0, 92.0],
      deviationPct: Number((((85.0 - telemetry.efficiency) / 85.0) * 100).toFixed(1)),
      severity: telemetry.efficiency < 75 ? 'WARNING' : 'INFO',
      affectedComponent: 'Pump Volute & Impeller',
      possibleCause: 'Impeller Vane Recirculation or Off-BEP Operating Point',
      evidence: [
        `System operating at ${telemetry.flowRateLPM?.toFixed(0) || 480} L/min vs rated BEP of 520 L/min`,
        `Differential pressure ratio indicates mild throttling at discharge control valve`,
      ],
      recommendedAction: 'Verify system curve and adjust throttle valve to restore Best Efficiency Point (BEP).',
      status: 'OPEN',
      confidencePct: 78,
    },
    {
      id: 'ANOM-004',
      timestamp: '2026-08-16 11:15:05',
      sensor: 'Drive Shaft Radial Runout',
      unit: 'μm',
      observedValue: 42.5,
      expectedRange: [5.0, 25.0],
      deviationPct: 70.0,
      severity: 'INFO',
      affectedComponent: 'Flexible Spider Coupling',
      possibleCause: 'Angular Shaft Misalignment (2X RPM harmonic)',
      evidence: [
        `2X rotational frequency peak at 49.3 Hz observed on NDE sensor`,
        `Coupling elastomer insert shows moderate cyclical shear load`,
      ],
      recommendedAction: 'Schedule laser alignment check during upcoming scheduled maintenance window.',
      status: 'RESOLVED',
      confidencePct: 88,
    },
  ];

  const filteredAnomalies = anomalies.filter(item => {
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
    const matchesSearch =
      item.sensor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.possibleCause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.affectedComponent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const selectedAnomaly = anomalies.find(a => a.id === selectedAnomalyId) || anomalies[0];

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats & Filter Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">ANOMALY INVESTIGATION CENTER</h2>
              <p className="text-xs text-slate-400 font-mono">
                Multivariate Sensor Discrepancies & Physics Root Cause Diagnostics
              </p>
            </div>
          </div>
        </div>

        {/* Quick Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anomalies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  severityFilter === sev
                    ? sev === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 font-bold'
                      : sev === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Investigation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Anomaly Feed Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Detected Discrepancies ({filteredAnomalies.length})
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Confidence Engine: ISO 10816 / IEC 60034
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[600px]">
            {filteredAnomalies.map(item => {
              const isSelected = item.id === selectedAnomaly.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAnomalyId(item.id)}
                  className={`p-4 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                      : 'hover:bg-slate-850/50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          item.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : item.severity === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {item.severity}
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{item.sensor}</span>
                      <span className="text-[10px] font-mono text-slate-500">[{item.id}]</span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans line-clamp-1">{item.possibleCause}</p>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                      <span>Component: <strong className="text-slate-200">{item.affectedComponent}</strong></span>
                      <span>Observed: <strong className="text-cyan-300">{item.observedValue.toFixed(2)} {item.unit}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp.split(' ')[1]}</span>
                    <div className="flex items-center gap-1 text-xs font-mono text-amber-400">
                      {item.deviationPct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>+{Math.abs(item.deviationPct)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Anomaly Deep Dive & Evidence Investigation Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  DEEP INVESTIGATION DOSSIER
                </span>
                <h3 className="text-sm font-bold text-white font-mono mt-0.5">
                  {selectedAnomaly.sensor}
                </h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                selectedAnomaly.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : selectedAnomaly.severity === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                {selectedAnomaly.severity}
              </span>
            </div>

            {/* Quantitative Sensor Comparison Matrix */}
            <div className="grid grid-cols-3 gap-2.5 bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-center font-mono">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Observed</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedAnomaly.observedValue.toFixed(2)}
                </div>
                <div className="text-[9px] text-slate-500">{selectedAnomaly.unit}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Expected</div>
                <div className="text-sm font-bold text-slate-300 mt-0.5">
                  {selectedAnomaly.expectedRange[0]} - {selectedAnomaly.expectedRange[1]}
                </div>
                <div className="text-[9px] text-slate-500">{selectedAnomaly.unit}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Deviation</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  +{Math.abs(selectedAnomaly.deviationPct)}%
                </div>
                <div className="text-[9px] text-slate-500">vs nominal</div>
              </div>
            </div>

            {/* Possible Cause & Diagnostics */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Diagnosed Root Cause
              </span>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200">
                {selectedAnomaly.possibleCause}
              </div>
            </div>

            {/* Supporting Physical Evidence */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Physical Evidence & Signal Trace
              </span>
              <div className="space-y-1.5">
                {selectedAnomaly.evidence.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded border border-slate-800/60 font-mono">
                    <span className="text-cyan-400 font-bold text-[10px]">0{idx + 1}.</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Engineering Action */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Recommended Action
              </span>
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 font-sans leading-relaxed">
                {selectedAnomaly.recommendedAction}
              </div>
            </div>
          </div>

          {/* Action Buttons: Ask AI & Create Maintenance Ticket */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={() => onOpenAICopilot && onOpenAICopilot(`Analyze anomaly on ${selectedAnomaly.sensor}: ${selectedAnomaly.possibleCause}`)}
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analyze with Copilot
            </button>

            {onOpenWorkOrderModal && (
              <button
                onClick={onOpenWorkOrderModal}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 transition-colors"
              >
                Log Work Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
