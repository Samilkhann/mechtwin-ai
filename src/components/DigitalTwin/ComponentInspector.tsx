/**
 * MechTwin AI - Mechanical Component Engineering Inspector
 */

import React from 'react';
import { Machine, MachineComponent } from '../../types';
import { ShieldCheck, AlertTriangle, AlertCircle, Wrench, Thermometer, Activity, Clock, Cpu, FileText, ChevronRight } from 'lucide-react';

interface ComponentInspectorProps {
  component: MachineComponent | null;
  machine: Machine;
  onOpenWorkOrderModal?: (component: MachineComponent) => void;
  onSelectComponent: (comp: MachineComponent) => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  component,
  machine,
  onOpenWorkOrderModal,
  onSelectComponent,
}) => {
  if (!component) {
    return (
      <div className="h-full bg-slate-900/70 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 mb-3 border border-slate-700">
          <Cpu className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">CAD Component Inspector</h4>
        <p className="text-xs text-slate-400 max-w-xs mb-4">
          Click any component in the 3D Digital Twin or select from the assembly sub-components below to view mechanical telemetry and kinematics.
        </p>

        {/* Quick Component Selection Pills */}
        <div className="w-full space-y-1.5 text-left">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Sub-Assembly Bill of Materials:</div>
          {machine.components.map(comp => (
            <button
              key={comp.id}
              onClick={() => onSelectComponent(comp)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all text-xs text-slate-300 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${comp.condition === 'NORMAL' ? 'bg-emerald-400' : comp.condition === 'WARNING' ? 'bg-amber-400' : 'bg-red-500'}`} />
                <span className="font-medium truncate">{comp.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const getConditionBadge = (condition: MachineComponent['condition']) => {
    switch (condition) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            NORMAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            WARNING
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            CRITICAL
          </span>
        );
    }
  };

  return (
    <div className="h-full bg-slate-900/80 rounded-xl border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
      {/* Component Title Header */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">COMPONENT TELEMETRY</span>
          {getConditionBadge(component.condition)}
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">{component.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{component.material}</p>
      </div>

      {/* Primary KPI Grid for this component */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">
            {component.temperature.toFixed(1)} <span className="text-xs text-slate-400 font-sans">°C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Thermal status: {component.temperature < 75 ? 'Safe' : 'Elevated'}</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Vibration RMS</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">
            {component.vibration.toFixed(2)} <span className="text-xs text-slate-400 font-sans">mm/s</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">ISO Zone: {component.vibration < 2.3 ? 'Zone A' : component.vibration < 4.5 ? 'Zone B' : 'Zone C'}</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Estimated Life</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">
            {component.estimatedLifeDays} <span className="text-xs text-slate-400 font-sans">days</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Risk: {component.riskLevel}</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Run Hours</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">
            {component.operatingHours.toLocaleString()} <span className="text-xs text-slate-400 font-sans">hrs</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Last inspected: {component.lastInspected}</div>
        </div>
      </div>

      {/* Engineering Specifications Sheet */}
      <div className="bg-slate-950/60 rounded-lg border border-slate-800/80 p-3 space-y-2">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          Technical Specifications
        </div>
        <div className="space-y-1.5 text-xs">
          {Object.entries(component.specifications).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
              <span className="text-slate-400">{key}</span>
              <span className="font-mono text-slate-200 font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <button
          onClick={() => onOpenWorkOrderModal && onOpenWorkOrderModal(component)}
          className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30"
        >
          <Wrench className="w-4 h-4" />
          Generate Work Order for {component.name.split('(')[0].trim()}
        </button>
      </div>
    </div>
  );
};
