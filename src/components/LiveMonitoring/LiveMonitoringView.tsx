/**
 * MechTwin AI - Live Sensor Monitoring & Physics Simulation Studio
 */

import React, { useState } from 'react';
import { Machine, TelemetryReading } from '../../types';
import { OperatingMode, PhysicsSimulationState } from '../../services/physicsEngine';
import {
  Activity,
  Thermometer,
  Zap,
  Gauge,
  Play,
  Pause,
  Sliders,
  Radio,
  RefreshCw,
  AlertTriangle,
  Flame,
  Waves,
  Cpu,
  BarChart2,
} from 'lucide-react';

interface LiveMonitoringViewProps {
  machine: Machine;
  telemetryHistory: TelemetryReading[];
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  simState: PhysicsSimulationState;
  setSimState: React.Dispatch<React.SetStateAction<PhysicsSimulationState>>;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  machine,
  telemetryHistory,
  isSimulating,
  setIsSimulating,
  simState,
  setSimState,
}) => {
  const [activeScopeTab, setActiveScopeTab] = useState<'fft' | 'waveform'>('fft');

  const telemetry = machine.latestTelemetry;

  const handleOperatingModeChange = (mode: OperatingMode) => {
    setSimState(prev => ({ ...prev, operatingMode: mode }));
  };

  // Generate synthetic FFT frequency spectrum based on current operating state
  const generateFFTSpectrum = () => {
    const runningFreq1X = (telemetry.rpm / 60) || 24.67; // Hz (~24.67 Hz for 1480 RPM)
    const runningFreq2X = runningFreq1X * 2;
    const runningFreq3X = runningFreq1X * 3;
    const bpfoFreq = 105.8; // Bearing defect frequency

    const bins = 64;
    const maxFreq = 400; // Hz
    const spectrum: { freq: number; amplitude: number; label?: string }[] = [];

    for (let i = 0; i < bins; i++) {
      const freq = (i / bins) * maxFreq;
      let amp = 0.15 + Math.random() * 0.08; // noise floor

      // 1X peak (Unbalance)
      if (Math.abs(freq - runningFreq1X) < 5) {
        amp += telemetry.vibration * 0.45;
      }
      // 2X peak (Misalignment)
      if (Math.abs(freq - runningFreq2X) < 5) {
        const misalignBoost = simState.operatingMode === 'MISALIGNMENT' ? 2.8 : 0.4;
        amp += misalignBoost * (telemetry.vibration / 3.0);
      }
      // 3X peak
      if (Math.abs(freq - runningFreq3X) < 5) {
        amp += 0.3;
      }
      // BPFO Bearing defect harmonic peak
      if (Math.abs(freq - bpfoFreq) < 5) {
        const bpfoBoost = simState.operatingMode === 'WARNING_BEARING' || simState.operatingMode === 'CRITICAL_OVERLOAD' ? 3.4 : 0.2;
        amp += bpfoBoost * (telemetry.vibration / 2.5);
      }
      // Cavitation broadband high-frequency acoustic hiss
      if (simState.operatingMode === 'CAVITATION' && freq > 180) {
        amp += 1.4 + Math.random() * 0.9;
      }

      spectrum.push({ freq: Math.round(freq), amplitude: Math.min(6.5, parseFloat(amp.toFixed(2))) });
    }

    return { spectrum, runningFreq1X, runningFreq2X, bpfoFreq };
  };

  const { spectrum, runningFreq1X, runningFreq2X, bpfoFreq } = generateFFTSpectrum();

  return (
    <div className="space-y-6">
      {/* 1. Simulation Control & Operating State Injection Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <h2 className="text-base font-bold text-white tracking-wide">
                REAL-TIME TELEMETRY ENGINE & FAULT INJECTION CONTROLLER
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates coupled electro-mechanical Navier-Stokes and rotordynamic laws with realistic physical noise.
            </p>
          </div>

          {/* Start/Stop & Speed Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all shadow-lg ${
                isSimulating ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isSimulating ? 'Pause Telemetry Stream' : 'Resume Telemetry Stream'}
            </button>

            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[1, 2, 5].map(speed => (
                <button
                  key={speed}
                  onClick={() => setSimState(prev => ({ ...prev, speedMultiplier: speed }))}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                    simState.speedMultiplier === speed ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Operating Fault Mode Injector */}
        <div className="mt-4 pt-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            OPERATING STATE INJECTION:
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleOperatingModeChange('NORMAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                simState.operatingMode === 'NORMAL'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              1. NORMAL OPERATING STATE
            </button>

            <button
              onClick={() => handleOperatingModeChange('WARNING_BEARING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                simState.operatingMode === 'WARNING_BEARING'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40 border border-amber-400/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              2. BEARING WEAR (BPFO)
            </button>

            <button
              onClick={() => handleOperatingModeChange('CAVITATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                simState.operatingMode === 'CAVITATION'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40 border border-teal-400/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              3. HYDRAULIC CAVITATION
            </button>

            <button
              onClick={() => handleOperatingModeChange('MISALIGNMENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                simState.operatingMode === 'MISALIGNMENT'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              4. SHAFT MISALIGNMENT
            </button>

            <button
              onClick={() => handleOperatingModeChange('CRITICAL_OVERLOAD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                simState.operatingMode === 'CRITICAL_OVERLOAD'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-400/40 animate-pulse'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              5. CRITICAL OVERLOAD
            </button>
          </div>
        </div>

        {/* Dynamic Physics Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Mechanical Load Demand
              </span>
              <p className="text-[10px] text-slate-500">Increases motor slip, power draw, and temperature rise.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="20"
                max="150"
                value={simState.loadPercent}
                onChange={(e) => setSimState(prev => ({ ...prev, loadPercent: parseFloat(e.target.value) }))}
                className="w-28 h-1.5 bg-slate-700 rounded appearance-none accent-cyan-500"
              />
              <span className="text-xs font-mono font-bold text-cyan-400 w-12 text-right">{simState.loadPercent}%</span>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Ambient Temperature
              </span>
              <p className="text-[10px] text-slate-500">Affects base cooling rate and stator heat dissipation.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="15"
                max="45"
                value={simState.ambientTempC}
                onChange={(e) => setSimState(prev => ({ ...prev, ambientTempC: parseFloat(e.target.value) }))}
                className="w-28 h-1.5 bg-slate-700 rounded appearance-none accent-amber-500"
              />
              <span className="text-xs font-mono font-bold text-amber-400 w-12 text-right">{simState.ambientTempC}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full Live Sensor KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Sensor 1: Temperature */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.temperature.toFixed(1)} <span className="text-xs font-sans text-slate-400">°C</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">SEN-T01 | 10 Hz</div>
        </div>

        {/* Sensor 2: Vibration */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Vibration RMS</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.vibration.toFixed(2)} <span className="text-xs font-sans text-slate-400">mm/s</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">SEN-V01 | 2.56 kHz</div>
        </div>

        {/* Sensor 3: RPM */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Shaft Speed</span>
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.rpm} <span className="text-xs font-sans text-slate-400">RPM</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">SEN-R01 | Optical</div>
        </div>

        {/* Sensor 4: Current */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Phase Current</span>
            <Zap className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.current.toFixed(1)} <span className="text-xs font-sans text-slate-400">A</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">SEN-I01 | CT Hall</div>
        </div>

        {/* Sensor 5: Voltage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Line Voltage</span>
            <Zap className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.voltage.toFixed(1)} <span className="text-xs font-sans text-slate-400">V</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">3-Phase 50Hz</div>
        </div>

        {/* Sensor 6: Power */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Active Power</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.power.toFixed(2)} <span className="text-xs font-sans text-slate-400">kW</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">PF: {telemetry.powerFactor}</div>
        </div>

        {/* Sensor 7: Pressure Inlet */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Suction Pressure</span>
            <Gauge className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.pressureInlet.toFixed(2)} <span className="text-xs font-sans text-slate-400">bar</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">{telemetry.pressureInlet < 0.6 ? 'CAVITATION RISK' : 'Normal Head'}</div>
        </div>

        {/* Sensor 8: Pressure Outlet */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Discharge Head</span>
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.pressureOutlet.toFixed(2)} <span className="text-xs font-sans text-slate-400">bar</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">SEN-PO01</div>
        </div>

        {/* Sensor 9: Flow Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Discharge Flow</span>
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.flowRate} <span className="text-xs font-sans text-slate-400">L/min</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">{(telemetry.flowRate * 0.06).toFixed(1)} m³/h</div>
        </div>

        {/* Sensor 10: Torque */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Shaft Torque</span>
            <Activity className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.torque.toFixed(1)} <span className="text-xs font-sans text-slate-400">N·m</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">T = P×9549/N</div>
        </div>

        {/* Sensor 11: Efficiency */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Efficiency</span>
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.efficiency.toFixed(1)} <span className="text-xs font-sans text-slate-400">%</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Hydraulic/Input</div>
        </div>

        {/* Sensor 12: Kurtosis */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
            <span>Vib Kurtosis</span>
            <Activity className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-white">{telemetry.vibrationKurtosis.toFixed(2)} <span className="text-xs font-sans text-slate-400">kurt</span></div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Normal: 3.00</div>
        </div>
      </div>

      {/* 3. Fast Fourier Transform (FFT) Frequency Spectrum & Waveform Oscilloscope */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              DIGITAL SIGNAL PROCESSING (DSP): FFT FREQUENCY SPECTRUM & HARMONIC DETECTION
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies 1X rotational unbalance, 2X coupling misalignment, and BPFO bearing defect frequencies.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveScopeTab('fft')}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                activeScopeTab === 'fft' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FFT Spectral Density (0 - 400 Hz)
            </button>
            <button
              onClick={() => setActiveScopeTab('waveform')}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                activeScopeTab === 'waveform' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Time-Domain Waveform Oscilloscope
            </button>
          </div>
        </div>

        {/* FFT Bar Chart Representation */}
        {activeScopeTab === 'fft' ? (
          <div className="space-y-2">
            <div className="h-56 bg-slate-950/90 rounded-lg border border-slate-800/80 p-3 flex items-end justify-between gap-1 relative overflow-hidden">
              {/* Reference Grid lines */}
              <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/60" />
              <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/60" />
              <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/60" />

              {/* Spectral Bars */}
              {spectrum.map((bin, i) => {
                const heightPercent = Math.min(100, (bin.amplitude / 6.0) * 100);
                const is1X = Math.abs(bin.freq - runningFreq1X) < 4;
                const is2X = Math.abs(bin.freq - runningFreq2X) < 4;
                const isBPFO = Math.abs(bin.freq - bpfoFreq) < 4;

                let barColor = 'bg-cyan-500/50';
                if (is1X) barColor = 'bg-blue-400';
                if (is2X) barColor = 'bg-indigo-400';
                if (isBPFO) barColor = 'bg-amber-400';

                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-150 ${barColor}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 text-[10px] font-mono px-2 py-1 rounded shadow-xl pointer-events-none z-10">
                      <span className="text-white font-bold">{bin.amplitude} mm/s</span>
                      <span className="text-cyan-400">{bin.freq} Hz</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Frequency Axis Labels & Harmonic Markers */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
              <span>0 Hz</span>
              <span className="text-blue-400">1X ({runningFreq1X.toFixed(1)} Hz)</span>
              <span className="text-indigo-400">2X ({runningFreq2X.toFixed(1)} Hz)</span>
              <span className="text-amber-400">BPFO ({bpfoFreq.toFixed(1)} Hz)</span>
              <span>200 Hz</span>
              <span>300 Hz</span>
              <span>400 Hz</span>
            </div>
          </div>
        ) : (
          /* Time-Domain Waveform Oscilloscope */
          <div className="h-56 bg-slate-950/90 rounded-lg border border-slate-800/80 p-3 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 600 160" className="w-full h-full">
              {/* Oscilloscope Center Line */}
              <line x1="0" y1="80" x2="600" y2="80" stroke="#1e293b" strokeDasharray="2,2" />
              {/* Sine waveform with harmonics */}
              <path
                d={Array.from({ length: 120 })
                  .map((_, idx) => {
                    const x = (idx / 120) * 600;
                    const phase = (Date.now() / 150) + idx * 0.2;
                    const y = 80 + Math.sin(phase) * (telemetry.vibration * 12) + Math.sin(phase * 2) * (telemetry.vibration * 5) + (Math.random() - 0.5) * 4;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute top-3 right-4 text-xs font-mono text-cyan-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
              Peak: {telemetry.vibrationPeak.toFixed(2)} mm/s | Kurtosis: {telemetry.vibrationKurtosis.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
