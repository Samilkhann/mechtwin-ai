/**
 * MechTwin AI - Interactive Mechanical Engineering Calculators & Standards Studio
 */

import React, { useState } from 'react';
import { Machine } from '../../types';
import {
  Calculator,
  RotateCw,
  Zap,
  Gauge,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface EngineeringCalculationsViewProps {
  machine: Machine;
}

export const EngineeringCalculationsView: React.FC<EngineeringCalculationsViewProps> = ({ machine }) => {
  const [activeCalcTab, setActiveCalcTab] = useState<'bearing' | 'shaft' | 'affinity' | 'iso10816' | 'thermal'>('bearing');

  // --- Calculator 1: ISO 281 Bearing Life State ---
  const [cRatingKN, setCRatingKN] = useState<number>(41.5); // Dynamic load rating C (kN)
  const [pLoadKN, setPLoadKN] = useState<number>(6.2); // Equivalent dynamic load P (kN)
  const [bearingRPM, setBearingRPM] = useState<number>(machine.ratedRPM || 1480);
  const [bearingType, setBearingType] = useState<'ball' | 'roller'>('ball');

  const pExponent = bearingType === 'ball' ? 3 : 10 / 3;
  const l10RevolutionsMillions = Math.pow(cRatingKN / pLoadKN, pExponent);
  const l10hHours = (l10RevolutionsMillions * 1000000) / (60 * bearingRPM);

  // --- Calculator 2: Shaft Torque & Shear Stress ---
  const [shaftPowerKW, setShaftPowerKW] = useState<number>(machine.ratedPowerKW || 18.5);
  const [shaftRPM, setShaftRPM] = useState<number>(machine.ratedRPM || 1480);
  const [shaftDiaMM, setShaftDiaMM] = useState<number>(38.0);
  const [yieldStrengthMPA, setYieldStrengthMPA] = useState<number>(415); // AISI 1045 / 4140

  const shaftTorqueNm = (shaftPowerKW * 9549) / (shaftRPM || 1);
  const polarModulusZp = (Math.PI * Math.pow(shaftDiaMM, 3)) / 16; // mm^3
  const shearStressMPa = (shaftTorqueNm * 1000) / (polarModulusZp || 1);
  const allowableShear = yieldStrengthMPA * 0.577; // Tresca/von Mises shear yield
  const safetyFactor = allowableShear / (shearStressMPa || 1);

  // --- Calculator 3: Pump Affinity Laws ---
  const [n1RPM, setN1RPM] = useState<number>(1480);
  const [n2RPM, setN2RPM] = useState<number>(1750);
  const [q1Flow, setQ1Flow] = useState<number>(120); // m^3/h
  const [h1Head, setH1Head] = useState<number>(35); // meters
  const [p1Power, setP1Power] = useState<number>(15.0); // kW

  const speedRatio = n2RPM / (n1RPM || 1);
  const q2Flow = q1Flow * speedRatio;
  const h2Head = h1Head * Math.pow(speedRatio, 2);
  const p2Power = p1Power * Math.pow(speedRatio, 3);

  // --- Calculator 4: ISO 10816-3 Vibration Severity ---
  const [vibVelocityRMS, setVibVelocityRMS] = useState<number>(machine.latestTelemetry.vibration || 3.4);
  const [foundationType, setFoundationType] = useState<'rigid' | 'flexible'>('rigid');
  const [motorClass, setMotorClass] = useState<'medium' | 'large'>('medium'); // Medium: 15-75kW, Large: >75kW

  const getISOZone = () => {
    if (foundationType === 'rigid') {
      if (vibVelocityRMS <= 1.4) return { zone: 'Zone A', desc: 'Good / Newly Commissioned', color: 'emerald' };
      if (vibVelocityRMS <= 2.8) return { zone: 'Zone B', desc: 'Acceptable for Unrestricted Long-Term Operation', color: 'teal' };
      if (vibVelocityRMS <= 4.5) return { zone: 'Zone C', desc: 'Restricted Operation - Schedule Maintenance', color: 'amber' };
      return { zone: 'Zone D', desc: 'Danger / Vibration Severity Exceeds Limit', color: 'rose' };
    } else {
      if (vibVelocityRMS <= 2.3) return { zone: 'Zone A', desc: 'Good / Newly Commissioned', color: 'emerald' };
      if (vibVelocityRMS <= 4.5) return { zone: 'Zone B', desc: 'Acceptable for Unrestricted Long-Term Operation', color: 'teal' };
      if (vibVelocityRMS <= 7.1) return { zone: 'Zone C', desc: 'Restricted Operation - Schedule Maintenance', color: 'amber' };
      return { zone: 'Zone D', desc: 'Danger / Vibration Severity Exceeds Limit', color: 'rose' };
    }
  };

  const isoResult = getISOZone();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                MECHANICAL ENGINEERING CALCULATORS & RIGID STANDARDS
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified analytical formulas derived from ISO 281, ISO 10816-3, IEC 60034-1, and Shigley's Mechanical Engineering Design.
            </p>
          </div>

          {/* Calculator Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveCalcTab('bearing')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                activeCalcTab === 'bearing' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ISO 281 Bearing Life (L10h)
            </button>
            <button
              onClick={() => setActiveCalcTab('shaft')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                activeCalcTab === 'shaft' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Shaft Torque & Shear Stress
            </button>
            <button
              onClick={() => setActiveCalcTab('affinity')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                activeCalcTab === 'affinity' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pump Affinity Laws
            </button>
            <button
              onClick={() => setActiveCalcTab('iso10816')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                activeCalcTab === 'iso10816' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ISO 10816-3 Vibration Severity
            </button>
          </div>
        </div>

        {/* Dynamic Calculator Content */}
        <div className="mt-5">
          {/* TAB 1: ISO 281 Bearing Life */}
          {activeCalcTab === 'bearing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCw className="w-4 h-4" />
                  ISO 281 Input Parameters
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Dynamic Load Rating (C)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={cRatingKN}
                        onChange={(e) => setCRatingKN(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      />
                      <span className="text-xs font-mono text-slate-400">kN</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Equivalent Dynamic Radial Load (P)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={pLoadKN}
                        onChange={(e) => setPLoadKN(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      />
                      <span className="text-xs font-mono text-slate-400">kN</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Shaft Rotational Speed (N)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={bearingRPM}
                        onChange={(e) => setBearingRPM(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      />
                      <span className="text-xs font-mono text-slate-400">RPM</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Bearing Geometry Type</label>
                    <select
                      value={bearingType}
                      onChange={(e) => setBearingType(e.target.value as 'ball' | 'roller')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                    >
                      <option value="ball">Deep Groove Ball Bearing (p = 3)</option>
                      <option value="roller">Cylindrical / Spherical Roller (p = 10/3)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  Formula: L10 = (C / P)^p &nbsp;|&nbsp; L10h = (10^6 / 60·N) · L10
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="lg:col-span-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    Calculated ISO 281 Rating Life
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Rating Life (L10)</div>
                      <div className="text-2xl font-bold font-mono text-white mt-1">
                        {l10RevolutionsMillions.toFixed(1)} <span className="text-xs text-slate-400 font-sans">10⁶ revs</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Operating Life (L10h)</div>
                      <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                        {Math.round(l10hHours).toLocaleString()} <span className="text-xs text-slate-400 font-sans">hours</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Equivalent Days (24/7 Run)</div>
                      <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                        {(l10hHours / 24).toFixed(1)} <span className="text-xs text-slate-400 font-sans">days</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">ISO Reliability Index</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        90% <span className="text-xs text-slate-400 font-sans">survival</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200">
                  <strong>Engineering Note:</strong> Calculated at 90% survival probability under pure ISO VG 68 clean lubricant conditions without contamination derating.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Shaft Torque & Shear Stress */}
          {activeCalcTab === 'shaft' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Drive Shaft Mechanics
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Transmitted Power (P)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={shaftPowerKW}
                        onChange={(e) => setShaftPowerKW(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      />
                      <span className="text-xs font-mono text-slate-400">kW</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Shaft Speed (N)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={shaftRPM}
                        onChange={(e) => setShaftRPM(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      />
                      <span className="text-xs font-mono text-slate-400">RPM</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Shaft Diameter (d)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={shaftDiaMM}
                        onChange={(e) => setShaftDiaMM(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      />
                      <span className="text-xs font-mono text-slate-400">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Steel Yield Strength (Sy)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={yieldStrengthMPA}
                        onChange={(e) => setYieldStrengthMPA(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      />
                      <span className="text-xs font-mono text-slate-400">MPa</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  Formula: T = 9549·P/N &nbsp;|&nbsp; τ_max = 16·T / (π·d³) &nbsp;|&nbsp; SF = 0.577·Sy / τ_max
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    Kinematic Torsional Results
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Shaft Torque (T)</div>
                      <div className="text-2xl font-bold font-mono text-white mt-1">
                        {shaftTorqueNm.toFixed(1)} <span className="text-xs text-slate-400 font-sans">N·m</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Max Shear Stress (τ_max)</div>
                      <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                        {shearStressMPa.toFixed(2)} <span className="text-xs text-slate-400 font-sans">MPa</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Allowable Shear (τ_all)</div>
                      <div className="text-xl font-bold font-mono text-slate-300 mt-1">
                        {allowableShear.toFixed(1)} <span className="text-xs text-slate-400 font-sans">MPa</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Torsional Safety Factor (SF)</div>
                      <div className={`text-2xl font-bold font-mono mt-1 ${safetyFactor > 2.0 ? 'text-emerald-400' : safetyFactor > 1.2 ? 'text-amber-400' : 'text-red-400'}`}>
                        {safetyFactor.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border text-xs ${safetyFactor > 1.5 ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200' : 'bg-rose-950/40 border-rose-800/40 text-rose-200'}`}>
                  {safetyFactor > 1.5 ? (
                    <span><strong>Design Compliant:</strong> Shaft diameter satisfies ASME B106.1M allowable torsional shear criteria with SF &gt; 1.5.</span>
                  ) : (
                    <span><strong>Warning:</strong> Shaft safety factor is below recommended industrial design margin (1.50). Consider increasing diameter.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Centrifugal Pump Affinity Laws */}
          {activeCalcTab === 'affinity' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" />
                  Initial Operating Point (Speed N1)
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Base Speed (N1)</label>
                    <input
                      type="number"
                      value={n1RPM}
                      onChange={(e) => setN1RPM(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Target Speed (N2 - VFD)</label>
                    <input
                      type="number"
                      value={n2RPM}
                      onChange={(e) => setN2RPM(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Initial Flow Rate (Q1)</label>
                    <input
                      type="number"
                      value={q1Flow}
                      onChange={(e) => setQ1Flow(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Initial Total Head (H1)</label>
                    <input
                      type="number"
                      value={h1Head}
                      onChange={(e) => setH1Head(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  Affinity Laws: Q2/Q1 = (N2/N1) &nbsp;|&nbsp; H2/H1 = (N2/N1)² &nbsp;|&nbsp; P2/P1 = (N2/N1)³
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    Projected Affinity Law Results (N2)
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Target Flow (Q2)</div>
                      <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                        {q2Flow.toFixed(1)} <span className="text-xs text-slate-400 font-sans">m³/h</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Change: {((speedRatio - 1) * 100).toFixed(1)}%</div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Target Head (H2)</div>
                      <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                        {h2Head.toFixed(1)} <span className="text-xs text-slate-400 font-sans">meters</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Change: {((Math.pow(speedRatio, 2) - 1) * 100).toFixed(1)}%</div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 col-span-2">
                      <div className="text-xs text-slate-400">Shaft Brake Power Required (P2)</div>
                      <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
                        {p2Power.toFixed(2)} <span className="text-xs text-slate-400 font-sans">kW</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Cubic power rise: {((Math.pow(speedRatio, 3) - 1) * 100).toFixed(1)}% power change</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <strong>VFD Application Tip:</strong> Reducing rotational speed by 20% drops power demand by ~48.8%, providing immense energy savings on centrifugal impellers.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ISO 10816-3 Vibration Severity Assessment */}
          {activeCalcTab === 'iso10816' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  ISO 10816-3 Machine Class & Foundation
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Measured Vibration Velocity (RMS 10–1000 Hz)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={vibVelocityRMS}
                        onChange={(e) => setVibVelocityRMS(parseFloat(e.target.value) || 0.1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      />
                      <span className="text-xs font-mono text-slate-400">mm/s</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Foundation Support Stiffness</label>
                    <select
                      value={foundationType}
                      onChange={(e) => setFoundationType(e.target.value as 'rigid' | 'flexible')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                    >
                      <option value="rigid">Rigid Foundation (Concrete pedestal / grouted baseplate)</option>
                      <option value="flexible">Flexible Foundation (Spring / elastomer isolated skid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Machine Power Rating Group</label>
                    <select
                      value={motorClass}
                      onChange={(e) => setMotorClass(e.target.value as 'medium' | 'large')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                    >
                      <option value="medium">Group 2: Medium Machines (15 kW – 75 kW)</option>
                      <option value="large">Group 1: Large Turbomachinery (&gt; 75 kW)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <BookOpen className="w-4 h-4" />
                    ISO 10816-3 Diagnostic Zone Evaluation
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold font-mono ${
                      isoResult.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      isoResult.color === 'teal' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' :
                      isoResult.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-rose-500/20 text-red-400 border border-rose-500/40 animate-pulse'
                    }`}>
                      {isoResult.zone}
                    </div>

                    <div className="text-base font-bold text-white mt-2">{isoResult.desc}</div>
                    <div className="text-xs text-slate-400 font-mono">Current Reading: {vibVelocityRMS} mm/s RMS</div>
                  </div>
                </div>

                {/* ISO Color Reference Bar */}
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                  <div className="p-2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Zone A (&lt;1.4)<br />Good
                  </div>
                  <div className="p-2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Zone B (1.4–2.8)<br />Acceptable
                  </div>
                  <div className="p-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Zone C (2.8–4.5)<br />Alert
                  </div>
                  <div className="p-2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Zone D (&gt;4.5)<br />Danger
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
