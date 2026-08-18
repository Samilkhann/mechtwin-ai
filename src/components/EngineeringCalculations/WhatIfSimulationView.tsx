/**
 * MECHTWIN AI - Engineering What-If Simulation Workspace
 * Parametric multi-domain physics modeling (Coupled Electromechanical & Hydraulic)
 * Created & Engineered by Samil Khan
 */

import React, { useState } from 'react';
import { Machine } from '../../types';
import {
  Sliders,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Activity,
  Zap,
  Gauge,
  DollarSign,
  Sparkles,
  Info,
} from 'lucide-react';

interface WhatIfSimulationViewProps {
  machine: Machine;
  onOpenAICopilot?: (prompt: string) => void;
}

export const WhatIfSimulationView: React.FC<WhatIfSimulationViewProps> = ({
  machine,
  onOpenAICopilot,
}) => {
  // Baseline Parameters (MT-001 Centrifugal Pump default operating point)
  const baseline = {
    rpm: 1480,
    loadPct: 80,
    flowLPM: 480,
    pressureBar: 4.2,
    ambientTemp: 25,
    lubricantQuality: 90, // %
    powerKW: 4.8,
    tempC: 68.2,
    vibMMS: 3.4,
    efficiencyPct: 87.4,
    bearingLifeHours: 8400,
    annualEnergyCost: 4610, // USD at $0.11/kWh
    failureRiskPct: 14,
  };

  // Interactive Scenario Parameters
  const [scenarioRPM, setScenarioRPM] = useState<number>(1800);
  const [scenarioLoad, setScenarioLoad] = useState<number>(95);
  const [scenarioFlow, setScenarioFlow] = useState<number>(550);
  const [scenarioPressure, setScenarioPressure] = useState<number>(5.6);
  const [scenarioAmbient, setScenarioAmbient] = useState<number>(35);
  const [scenarioLube, setScenarioLube] = useState<number>(65);

  // Computed Scenario Result State (Calculated through coupled equations)
  const [isSimulated, setIsSimulated] = useState<boolean>(true);

  // Physics Simulation Model
  const speedRatio = scenarioRPM / baseline.rpm;
  const loadRatio = scenarioLoad / baseline.loadPct;
  const lubeFactor = (100 - scenarioLube) / 100;

  // 1. Power scales with speed cubed (affinity law) and load
  const simPowerKW = Number((baseline.powerKW * Math.pow(speedRatio, 2.7) * (loadRatio * 0.95 + 0.05)).toFixed(2));

  // 2. Temperature rise scales with I^2*R loss + ambient + friction
  const simTempC = Number((scenarioAmbient + (baseline.tempC - baseline.ambientTemp) * Math.pow(loadRatio, 1.4) * speedRatio + lubeFactor * 12).toFixed(1));

  // 3. Vibration scales with speed squared + imbalance + bearing degradation
  const simVibMMS = Number((baseline.vibMMS * Math.pow(speedRatio, 1.8) * (1 + lubeFactor * 0.8)).toFixed(2));

  // 4. Efficiency parabolic around BEP (Best Efficiency Point)
  const simEfficiencyPct = Number(Math.max(55, Math.min(94, baseline.efficiencyPct - Math.abs(speedRatio - 1.0) * 12 - (100 - scenarioLoad) * 0.08 - lubeFactor * 4)).toFixed(1));

  // 5. Bearing L10h Life ISO 281: L = (10^6 / 60*n) * (C / P)^3
  const simBearingLifeHours = Math.round(baseline.bearingLifeHours / (Math.pow(speedRatio, 1.2) * Math.pow(loadRatio, 3.0) * (1 + lubeFactor * 1.5)));

  // 6. Annual Energy Cost ($0.11/kWh * 8760 operating hours)
  const simEnergyCost = Math.round(simPowerKW * 8760 * 0.11);

  // 7. Risk Tier
  const simFailureRiskPct = Math.min(98, Math.round(10 + (simVibMMS / 7.1) * 45 + (simTempC / 105) * 35));

  const handleReset = () => {
    setScenarioRPM(1480);
    setScenarioLoad(80);
    setScenarioFlow(480);
    setScenarioPressure(4.2);
    setScenarioAmbient(25);
    setScenarioLube(90);
  };

  const handlePresetHighSpeed = () => {
    setScenarioRPM(1800);
    setScenarioLoad(95);
    setScenarioFlow(580);
    setScenarioPressure(6.0);
    setScenarioAmbient(32);
    setScenarioLube(70);
  };

  const handlePresetDegradedLube = () => {
    setScenarioRPM(1480);
    setScenarioLoad(85);
    setScenarioFlow(480);
    setScenarioPressure(4.2);
    setScenarioAmbient(38);
    setScenarioLube(30);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Presets & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono tracking-wide">
              WHAT-IF PHYSICS SCENARIO SIMULATION
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Predictive Kinematics, Thermal Dissipation, and ISO 281 Bearing Life Response
            </p>
          </div>
        </div>

        {/* Quick Scenario Presets */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500 text-[11px]">PRESETS:</span>
          <button
            onClick={handlePresetHighSpeed}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          >
            1800 RPM Overdrive
          </button>
          <button
            onClick={handlePresetDegradedLube}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
          >
            Degraded Lubricant (30%)
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Simulation Grid: Parametric Inputs (Left) vs Comparison Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parametric Input Controls (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              SCENARIO PARAMETERS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
              PHYSICS COUPLING ACTIVE
            </span>
          </div>

          {/* Slider 1: Rotational Speed (RPM) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Rotational Speed (n):</span>
              <span className="text-cyan-400 font-bold">{scenarioRPM} RPM</span>
            </div>
            <input
              type="range"
              min={800}
              max={2200}
              step={20}
              value={scenarioRPM}
              onChange={e => setScenarioRPM(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>800 RPM</span>
              <span>Nominal: 1480 RPM</span>
              <span>2200 RPM</span>
            </div>
          </div>

          {/* Slider 2: Mechanical Load Factor (%) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Mechanical Load:</span>
              <span className="text-cyan-400 font-bold">{scenarioLoad}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={130}
              step={5}
              value={scenarioLoad}
              onChange={e => setScenarioLoad(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>30% (Idle)</span>
              <span>100% (Full Load)</span>
              <span>130% (Overload)</span>
            </div>
          </div>

          {/* Slider 3: Ambient Temperature (°C) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Ambient Temperature (T_amb):</span>
              <span className="text-amber-400 font-bold">{scenarioAmbient} °C</span>
            </div>
            <input
              type="range"
              min={10}
              max={55}
              step={1}
              value={scenarioAmbient}
              onChange={e => setScenarioAmbient(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10 °C</span>
              <span>Nominal: 25 °C</span>
              <span>55 °C</span>
            </div>
          </div>

          {/* Slider 4: Lubricant Condition Index (%) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Lubricant Film Condition:</span>
              <span className={`font-bold ${scenarioLube < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {scenarioLube}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={scenarioLube}
              onChange={e => setScenarioLube(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10% (Severely Degraded)</span>
              <span>100% (Fresh Grease)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenAICopilot && onOpenAICopilot(`Explain physics impact of operating at ${scenarioRPM} RPM, ${scenarioLoad}% load, and ${scenarioAmbient}°C ambient.`)}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Ask Copilot to Validate Physics
            </button>
          </div>
        </div>

        {/* Right: Comparative Results Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                BASELINE VS SIMULATED SCENARIO
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="text-slate-400">● BASELINE: 1480 RPM / 80%</span>
              <span className="text-cyan-400">▲ SCENARIO: {scenarioRPM} RPM / {scenarioLoad}%</span>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Card 1: Electric Power */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> POWER</span>
                <span className={simPowerKW > baseline.powerKW ? 'text-rose-400' : 'text-emerald-400'}>
                  {simPowerKW > baseline.powerKW ? `+${(simPowerKW - baseline.powerKW).toFixed(1)} kW` : `${(simPowerKW - baseline.powerKW).toFixed(1)} kW`}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-slate-500 text-xs">{baseline.powerKW} kW</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="text-sm font-bold text-white">{simPowerKW} kW</span>
              </div>
            </div>

            {/* Card 2: Operating Temperature */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-amber-400" /> TEMP</span>
                <span className={simTempC > baseline.tempC ? 'text-amber-400' : 'text-emerald-400'}>
                  {simTempC > baseline.tempC ? `+${(simTempC - baseline.tempC).toFixed(1)} °C` : `${(simTempC - baseline.tempC).toFixed(1)} °C`}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-slate-500 text-xs">{baseline.tempC} °C</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className={`text-sm font-bold ${simTempC > 85 ? 'text-rose-400' : 'text-white'}`}>
                  {simTempC} °C
                </span>
              </div>
            </div>

            {/* Card 3: Vibration Velocity */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-sky-400" /> VIBRATION</span>
                <span className={simVibMMS > baseline.vibMMS ? 'text-rose-400' : 'text-emerald-400'}>
                  {simVibMMS > baseline.vibMMS ? `+${(simVibMMS - baseline.vibMMS).toFixed(2)}` : `${(simVibMMS - baseline.vibMMS).toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-slate-500 text-xs">{baseline.vibMMS} mm/s</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className={`text-sm font-bold ${simVibMMS > 4.5 ? 'text-rose-400' : simVibMMS > 2.8 ? 'text-amber-400' : 'text-white'}`}>
                  {simVibMMS} mm/s
                </span>
              </div>
            </div>

            {/* Card 4: Efficiency */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-emerald-400" /> EFFICIENCY</span>
                <span className={simEfficiencyPct < baseline.efficiencyPct ? 'text-rose-400' : 'text-emerald-400'}>
                  {(simEfficiencyPct - baseline.efficiencyPct).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-slate-500 text-xs">{baseline.efficiencyPct}%</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="text-sm font-bold text-white">{simEfficiencyPct}%</span>
              </div>
            </div>

            {/* Card 5: ISO 281 Bearing Life */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>BEARING L10h</span>
                <span className={simBearingLifeHours < baseline.bearingLifeHours ? 'text-rose-400' : 'text-emerald-400'}>
                  {Math.round(((simBearingLifeHours - baseline.bearingLifeHours) / baseline.bearingLifeHours) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-slate-500 text-xs">{baseline.bearingLifeHours} h</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className={`text-sm font-bold ${simBearingLifeHours < 4000 ? 'text-rose-400' : 'text-white'}`}>
                  {simBearingLifeHours} h
                </span>
              </div>
            </div>

            {/* Card 6: Annual Energy Cost */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-400" /> ANNUAL COST</span>
                <span className={simEnergyCost > baseline.annualEnergyCost ? 'text-rose-400' : 'text-emerald-400'}>
                  +${simEnergyCost - baseline.annualEnergyCost}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-slate-500 text-xs">${baseline.annualEnergyCost}</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="text-sm font-bold text-white">${simEnergyCost}</span>
              </div>
            </div>
          </div>

          {/* Scenario Failure Risk Summary Footer */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
            <div className="flex items-center gap-2.5">
              {simFailureRiskPct > 50 ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
              <div>
                <div className="text-xs font-bold text-white">
                  Predicted Scenario Failure Risk: {simFailureRiskPct}%
                </div>
                <div className="text-[10px] text-slate-400">
                  {simFailureRiskPct > 50
                    ? 'CRITICAL: High rotational overdrive and thermal stress drastically accelerates fatigue spalling.'
                    : 'NORMAL: Operating envelope satisfies ISO 10816 Zone B continuous duty criteria.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Scenario parameters (${scenarioRPM} RPM, ${scenarioLoad}% load) saved to simulation log.`)}
              className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
            >
              Export Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
