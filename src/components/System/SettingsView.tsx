/**
 * MECHTWIN AI - System Configuration & ISO Standards Workbench
 * Industrial parameters, sensor alarm thresholds, and ISO 10816-3 / IEC 60034 boundary configuration
 * Created & Engineered by Samil Khan
 */

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Layers,
  Save,
} from 'lucide-react';
import { MechTwinLogo } from '../Common/MechTwinLogo';

export const SettingsView: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<'SI' | 'IMPERIAL'>('SI');
  const [isoMachineClass, setIsoMachineClass] = useState<'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IV'>('CLASS_II');
  const [vibWarningLimit, setVibWarningLimit] = useState<number>(2.8);
  const [vibCriticalLimit, setVibCriticalLimit] = useState<number>(4.5);
  const [tempWarningLimit, setTempWarningLimit] = useState<number>(75.0);
  const [tempCriticalLimit, setTempCriticalLimit] = useState<number>(90.0);
  const [samplingRateHz, setSamplingRateHz] = useState<number>(10);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono tracking-wide">
              SYSTEM CONFIGURATION & ISO COMPLIANCE
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Diagnostic Thresholds, ISO 10816 Boundary Envelopes, and Platform Parameters
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all self-start lg:self-auto"
        >
          <Save className="w-4 h-4" />
          {savedSuccess ? 'Settings Saved ✓' : 'Save Parameters'}
        </button>
      </div>

      {/* 2. Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: ISO 10816-3 Vibration Envelopes */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              ISO 10816-3 VIBRATION CLASSIFICATION
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Standard Norms</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300">Machine Group / Foundation Rigidity:</label>
              <select
                value={isoMachineClass}
                onChange={e => setIsoMachineClass(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="CLASS_I">Class I: Small electric motors (&lt; 15 kW)</option>
                <option value="CLASS_II">Class II: Medium machines (15 kW – 300 kW, Rigid Foundation)</option>
                <option value="CLASS_III">Class III: Large prime movers on rigid heavy foundation</option>
                <option value="CLASS_IV">Class IV: Large rotating turbomachinery on flexible foundation</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Zone B/C Warning Limit (mm/s RMS):</label>
                <input
                  type="number"
                  step="0.1"
                  value={vibWarningLimit}
                  onChange={e => setVibWarningLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Zone C/D Critical Limit (mm/s RMS):</label>
                <input
                  type="number"
                  step="0.1"
                  value={vibCriticalLimit}
                  onChange={e => setVibCriticalLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-bold">Current ISO Boundary Enforcement:</div>
              <div>• Zone A (0.0 - 1.4 mm/s): New machine commissioning baseline</div>
              <div>• Zone B (1.4 - 2.8 mm/s): Unrestricted continuous long-term operation</div>
              <div>• Zone C (2.8 - 4.5 mm/s): Restricted operation until maintenance window</div>
              <div>• Zone D (&gt; 4.5 mm/s): Immediate trip / severe damage risk</div>
            </div>
          </div>
        </div>

        {/* Card 2: Thermal & Sampling Settings */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              THERMAL & SAMPLING FREQUENCY
            </span>
            <span className="text-[10px] font-mono text-cyan-400">IEC 60034-1</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Thermal Warning (°C):</label>
                <input
                  type="number"
                  value={tempWarningLimit}
                  onChange={e => setTempWarningLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Thermal Trip Tripwire (°C):</label>
                <input
                  type="number"
                  value={tempCriticalLimit}
                  onChange={e => setTempCriticalLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300">Physics Simulation Timestep Rate (Hz):</label>
              <div className="flex items-center gap-2">
                {[1, 5, 10, 20].map(hz => (
                  <button
                    key={hz}
                    onClick={() => setSamplingRateHz(hz)}
                    className={`flex-1 py-1.5 rounded border transition-colors ${
                      samplingRateHz === hz
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {hz} Hz
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300">Unit Display Standard:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUnitSystem('SI')}
                  className={`flex-1 py-1.5 rounded border transition-colors ${
                    unitSystem === 'SI'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  SI Metric (°C, mm/s, kW, bar, L/min)
                </button>
                <button
                  onClick={() => setUnitSystem('IMPERIAL')}
                  className={`flex-1 py-1.5 rounded border transition-colors ${
                    unitSystem === 'IMPERIAL'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  US Customary (°F, in/s, HP, PSI, GPM)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Platform Brand & Creator Credit Card */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <MechTwinLogo size="lg" />
          <div className="space-y-0.5">
            <div className="text-xs font-mono text-cyan-400 font-bold">
              MECHTWIN AI ENTERPRISE SUITE v2.8.4-PRO
            </div>
            <div className="text-xs text-slate-400">
              Coupled Multi-Physics Digital Twin & Predictive Reliability Infrastructure
            </div>
            <div className="text-[11px] text-slate-300 font-mono pt-1">
              Created & Engineered by <strong className="text-white">Samil Khan</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Pipeline: Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};
