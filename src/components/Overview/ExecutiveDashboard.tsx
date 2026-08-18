/**
 * MECHTWIN AI - Executive Engineering Overview Dashboard
 * Industry 4.0 Telemetry, ISO 10816-3 Health Index, and Contributing Factor Decomposition
 * Created & Engineered by Samil Khan
 */

import React, { useState } from 'react';
import { Machine, TelemetryReading } from '../../types';
import {
  Activity,
  Thermometer,
  Zap,
  Gauge,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Cpu,
  Sliders,
  Wrench,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  machine: Machine;
  telemetryHistory: TelemetryReading[];
  onNavigateTab: (tabId: string) => void;
  onSelectComponent: (comp: any) => void;
  onOpenWorkOrderModal?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  machine,
  telemetryHistory,
  onNavigateTab,
  onSelectComponent,
  onOpenWorkOrderModal,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '6H' | '24H' | '7D' | '30D'>('24H');
  const [activeMetricTab, setActiveMetricTab] = useState<
    'vibration' | 'temperature' | 'power' | 'rpm' | 'efficiency' | 'healthScore'
  >('vibration');

  const telemetry = machine.latestTelemetry;
  const health = machine.healthBreakdown;

  // Contributing Factors to the Health Score (0-100)
  const contributingFactors = [
    {
      name: 'Vibration Severity',
      weight: '35%',
      score: Math.max(30, Math.round(100 - (telemetry.vibration / 4.5) * 35)),
      value: `${telemetry.vibration.toFixed(2)} mm/s`,
      status: telemetry.vibration > 4.5 ? 'CRITICAL' : telemetry.vibration > 2.8 ? 'WARNING' : 'NORMAL',
      standard: 'ISO 10816-3 Zone B',
    },
    {
      name: 'Thermal Rise Margin',
      weight: '25%',
      score: Math.max(40, Math.round(100 - (telemetry.temperature / 90) * 25)),
      value: `${telemetry.temperature.toFixed(1)} °C`,
      status: telemetry.temperature > 85 ? 'CRITICAL' : telemetry.temperature > 72 ? 'WARNING' : 'NORMAL',
      standard: 'IEC 60034-1 Class F',
    },
    {
      name: 'Hydraulic Efficiency',
      weight: '20%',
      score: Math.round(telemetry.efficiency),
      value: `${telemetry.efficiency.toFixed(1)}%`,
      status: telemetry.efficiency < 75 ? 'WARNING' : 'NORMAL',
      standard: 'HI 9.6.1 BEP',
    },
    {
      name: 'Active Power Factor',
      weight: '10%',
      score: 92,
      value: `${telemetry.power.toFixed(1)} kW`,
      status: 'NORMAL',
      standard: '0.88 cos φ',
    },
    {
      name: 'Operating Stability',
      weight: '10%',
      score: 98,
      value: '0.98 Index',
      status: 'NORMAL',
      standard: 'ANSI/EASA AR100',
    },
  ];

  // Dynamic Delta Reason (Explains score changes: e.g. 96 → 91, Reason: Vibration +14%, Temperature +6%)
  const prevScore = Math.min(99, health.overallScore + (telemetry.vibration > 2.8 ? 5 : 0));
  const scoreDelta = health.overallScore - prevScore;
  const deltaReason =
    telemetry.vibration > 2.8
      ? `Vibration elevated +${(((telemetry.vibration - 2.8) / 2.8) * 100).toFixed(0)}%, Temperature +${(((telemetry.temperature - 60) / 60) * 100).toFixed(0)}%`
      : 'All operational parameters within ISO nominal bands';

  // SVG Chart Renderer for Time Series
  const renderSVGChart = (metric: keyof TelemetryReading, color: string, unit: string, yMin?: number, yMax?: number) => {
    if (!telemetryHistory || telemetryHistory.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-slate-500 font-mono">
          Accumulating real-time telemetry stream...
        </div>
      );
    }

    const data = telemetryHistory.slice(-40);
    const values = data.map(d => Number(d[metric]) || 0);
    const minVal = yMin !== undefined ? yMin : Math.min(...values) * 0.95;
    const maxVal = yMax !== undefined ? yMax : Math.max(...values) * 1.05 || 1;
    const range = maxVal - minVal || 1;

    const width = 680;
    const height = 180;
    const padding = 25;

    const points = values.map((val, idx) => {
      const x = padding + (idx / (values.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `M ${points[0]} L ${points.join(' L ')} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

    const latestVal = values[values.length - 1];
    const prevVal = values[Math.max(0, values.length - 5)];
    const delta = latestVal - prevVal;

    return (
      <div className="relative w-full">
        {/* Metric Header & Live Value */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {metric} vs Time ({selectedTimeframe})
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Live: <strong className="text-white">{latestVal.toFixed(2)}</strong> {unit}
            </span>
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-mono ${
              delta >= 0
                ? metric === 'efficiency' || metric === 'healthScore'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
                : metric === 'efficiency' || metric === 'healthScore'
                ? 'text-rose-400'
                : 'text-emerald-400'
            }`}
          >
            {delta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>
              {Math.abs(delta).toFixed(2)} {unit} in last window
            </span>
          </div>
        </div>

        {/* SVG Plot */}
        <div className="w-full h-44 bg-slate-950/80 rounded-lg border border-slate-800 p-2 overflow-hidden relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${metric}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3,3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="3,3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e293b" />

            {/* Threshold ISO Line if Vibration */}
            {metric === 'vibration' && (
              <line
                x1={padding}
                y1={height - padding - ((2.8 - minVal) / range) * (height - 2 * padding)}
                x2={width - padding}
                y2={height - padding - ((2.8 - minVal) / range) * (height - 2 * padding)}
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />
            )}

            {/* Area and Line */}
            <path d={areaD} fill={`url(#grad-${metric})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Latest point highlight */}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].split(',')[0]}
                cy={points[points.length - 1].split(',')[1]}
                r="4.5"
                fill={color}
                stroke="#090d16"
                strokeWidth="2"
              />
            )}
          </svg>

          {/* Min / Max Labels */}
          <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-500">
            Max: {maxVal.toFixed(1)} {unit}
          </div>
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500">
            Min: {minVal.toFixed(1)} {unit}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SECTION: 5-Second Comprehension Health Gauge & Delta Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Machine Health Score 0-100 Gauge (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                MACHINE HEALTH INDEX
              </h3>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                health.status === 'NORMAL'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : health.status === 'WARNING'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
              }`}
            >
              {health.overallScore >= 90
                ? 'EXCELLENT'
                : health.overallScore >= 75
                ? 'GOOD'
                : health.overallScore >= 50
                ? 'WARNING'
                : 'CRITICAL'}
            </span>
          </div>

          {/* Radial 0-100 Gauge */}
          <div className="my-3 flex items-center justify-center relative">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke={
                    health.overallScore >= 80
                      ? '#10b981'
                      : health.overallScore >= 60
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - health.overallScore / 100)}`}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
                <span className="text-3xl font-black text-white tracking-tight">
                  {health.overallScore}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">/ 100 INDEX</span>
              </div>
            </div>
          </div>

          {/* Delta Explanation Box */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span>Score Trajectory:</span>
              <span className={scoreDelta < 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {prevScore} → {health.overallScore} ({scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta})
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              <strong className="text-cyan-400">Reason:</strong> {deltaReason}
            </div>
          </div>
        </div>

        {/* Contributing Factors Decomposition (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              CONTRIBUTING HEALTH FACTORS & WEIGHTS
            </span>
            <span className="text-[10px] font-mono text-slate-500">ISO 10816 / IEC 60034 ALIGNED</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {contributingFactors.map(factor => (
              <div key={factor.name} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{factor.name}</span>
                    <span className="text-[10px] text-slate-500">({factor.weight})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{factor.value}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        factor.status === 'NORMAL'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : factor.status === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {factor.score}/100
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      factor.score < 60 ? 'bg-rose-500' : factor.score < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CORE TELEMETRY 6-METRIC STRIP (Clean Hierarchy, Monospaced) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Temperature */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 font-mono shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            {telemetry.temperature.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Threshold: &lt; 75.0 °C</div>
        </div>

        {/* Metric 2: Vibration RMS */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 font-mono shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Vibration</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            {telemetry.vibration.toFixed(2)} <span className="text-xs font-normal text-slate-400">mm/s</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">ISO Zone B (&lt; 2.8)</div>
        </div>

        {/* Metric 3: Rotational Speed */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 font-mono shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Speed (RPM)</span>
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            {telemetry.rpm.toFixed(0)} <span className="text-xs font-normal text-slate-400">RPM</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Rated: {machine.ratedRPM} RPM</div>
        </div>

        {/* Metric 4: Active Power */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 font-mono shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Power Draw</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            {telemetry.power.toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Rated: {machine.ratedPowerKW} kW</div>
        </div>

        {/* Metric 5: Hydraulic Efficiency */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 font-mono shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Efficiency</span>
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            {telemetry.efficiency.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">BEP: 88.0%</div>
        </div>

        {/* Metric 6: Remaining Useful Life (RUL) */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 font-mono shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Est. RUL</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-amber-300">
            {telemetry.remainingUsefulLifeDays || 31} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">ISO 281 L10h</div>
        </div>
      </div>

      {/* 3. TIME-SERIES ENGINEERING CHARTS */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto">
            {[
              { id: 'vibration', label: 'Vibration', unit: 'mm/s', color: '#00e5ff' },
              { id: 'temperature', label: 'Temperature', unit: '°C', color: '#f59e0b' },
              { id: 'power', label: 'Power', unit: 'kW', color: '#10b981' },
              { id: 'rpm', label: 'RPM', unit: 'RPM', color: '#818cf8' },
              { id: 'efficiency', label: 'Efficiency', unit: '%', color: '#38bdf8' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMetricTab(m.id as any)}
                className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                  activeMetricTab === m.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
            {(['1H', '6H', '24H', '7D', '30D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Chart Display */}
        <div>
          {activeMetricTab === 'vibration' && renderSVGChart('vibration', '#00e5ff', 'mm/s', 0, 6.0)}
          {activeMetricTab === 'temperature' && renderSVGChart('temperature', '#f59e0b', '°C', 30, 95)}
          {activeMetricTab === 'power' && renderSVGChart('power', '#10b981', 'kW', 0, 8.0)}
          {activeMetricTab === 'rpm' && renderSVGChart('rpm', '#818cf8', 'RPM', 1000, 2000)}
          {activeMetricTab === 'efficiency' && renderSVGChart('efficiency', '#38bdf8', '%', 60, 100)}
        </div>
      </div>

      {/* 4. COMPONENT HEALTH MATRIX & DIRECT ACTION STRIP */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              ASSEMBLY COMPONENT HEALTH MATRIX (MT-001)
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('digital_twin')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            Open 3D CAD Twin →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {machine.components.map(comp => (
            <div
              key={comp.id}
              onClick={() => {
                onSelectComponent(comp);
                onNavigateTab('digital_twin');
              }}
              className="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {comp.name}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    comp.condition === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : comp.condition === 'WARNING'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {comp.condition}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Temp: <strong className="text-slate-200">{comp.temperature?.toFixed(1) || '--'} °C</strong></span>
                <span>Vib: <strong className="text-slate-200">{comp.vibration?.toFixed(2) || '--'} mm/s</strong></span>
              </div>

              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    comp.condition === 'CRITICAL' ? 'bg-rose-500' : comp.condition === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${comp.healthScore || (comp.condition === 'CRITICAL' ? 45 : comp.condition === 'WARNING' ? 78 : 95)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
