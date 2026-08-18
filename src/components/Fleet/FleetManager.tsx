/**
 * MechTwin AI - Industrial Machine Fleet Manager & Asset Switcher
 */

import React, { useState } from 'react';
import { Machine } from '../../types';
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Plus,
  Activity,
  Thermometer,
  Gauge,
  Zap,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface FleetManagerProps {
  machines: Machine[];
  selectedMachineId: string;
  onSelectMachine: (machineId: string) => void;
  onAddMachine: (newMachine: Machine) => void;
}

export const FleetManager: React.FC<FleetManagerProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
  onAddMachine,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Centrifugal Pump');
  const [location, setLocation] = useState('Bay 4 - Process Line');
  const [ratedPowerKW, setRatedPowerKW] = useState(22);
  const [ratedRPM, setRatedRPM] = useState(1480);

  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `MT-00${machines.length + 1}`;
    const newMachine: Machine = {
      id: newId,
      name: name || `Turbomachine Unit ${newId}`,
      type,
      location,
      status: 'NORMAL',
      ratedPowerKW,
      ratedRPM,
      operatingHours: 120,
      installationDate: new Date().toISOString().split('T')[0],
      mtbfHours: 24000,
      latestTelemetry: {
        timestamp: Date.now(),
        temperature: 58.0,
        vibration: 1.8,
        vibrationPeak: 2.6,
        vibrationKurtosis: 3.05,
        rpm: ratedRPM,
        current: 28.0,
        voltage: 400.0,
        power: ratedPowerKW * 0.8,
        powerFactor: 0.88,
        pressureInlet: 1.2,
        pressureOutlet: 4.2,
        flowRate: 480,
        efficiency: 88.5,
        torque: 140,
        healthScore: 94,
        failureProbability: 6,
        remainingUsefulLifeDays: 140,
      },
      tag: `TAG-${newId}`,
      manufacturer: 'MechTwin Virtual Systems',
      model: 'Industry 4.0 Standard Twin',
      serialNumber: `SN-${Date.now()}`,
      ratedVoltageV: 400,
      ratedCurrentA: 42,
      energyCostPerKWh: 0.14,
      sensors: [],
      healthBreakdown: {
        overallScore: 94,
        status: 'NORMAL',
        factors: [
          { name: 'Vibration Velocity (ISO 10816-3)', weight: 0.35, value: '1.80 mm/s RMS', benchmark: '< 2.3 mm/s', score: 95, status: 'Optimal', impact: 2, description: 'Zone A - newly commissioned tolerance.' },
          { name: 'Thermal Rise (IEC 60034-1)', weight: 0.25, value: '58.0 °C', benchmark: '< 75 °C', score: 96, status: 'Optimal', impact: 1, description: 'Class F insulation operating well within safe thermal limits.' },
          { name: 'Bearing Kinematic Life (ISO 281)', weight: 0.20, value: '140 days RUL', benchmark: '> 60 days', score: 92, status: 'Optimal', impact: 2, description: 'Minimal dynamic fatigue wear on inner and outer raceways.' },
          { name: 'Operating Efficiency (BEP)', weight: 0.20, value: '88.5%', benchmark: '> 85.0%', score: 93, status: 'Optimal', impact: 1, description: 'Operating within 3% of Best Efficiency Point.' },
        ],
      },
      activeFaults: [],
      components: [
        {
          id: 'motor',
          name: 'Electric Drive Motor',
          type: 'motor',
          condition: 'NORMAL',
          temperature: 58.0,
          vibration: 1.6,
          estimatedLifeDays: 450,
          operatingHours: 120,
          lastInspected: '2026-08-01',
          riskLevel: 'Low',
          material: 'Cast Iron Frame / Copper Stator Windings',
          specifications: { Power: `${ratedPowerKW} kW`, 'Voltage Rating': '400V 3-Phase', Speed: `${ratedRPM} RPM` },
        },
      ],
    };

    onAddMachine(newMachine);
    setShowAddModal(false);
    onSelectMachine(newId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                PLANT FLEET MANAGEMENT & ASSET REPOSITORY
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor, simulate, and switch between connected plant machines and digital twins.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/40"
          >
            <Plus className="w-4 h-4" />
            Add New Machine Twin
          </button>
        </div>

        {/* Machine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {machines.map(m => {
            const isSelected = m.id === selectedMachineId;
            return (
              <div
                key={m.id}
                onClick={() => onSelectMachine(m.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 shadow-xl relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-cyan-950/40 ring-1 ring-cyan-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-cyan-400">{m.id}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{m.name}</h3>
                      <p className="text-xs text-slate-400">{m.location}</p>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      m.healthBreakdown.status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      m.healthBreakdown.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {m.healthBreakdown.status} ({m.healthBreakdown.overallScore}/100)
                    </span>
                  </div>

                  {/* Machine Specs & Live Snapshot */}
                  <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Vibration</span>
                      <strong className="text-slate-200 font-mono">{m.latestTelemetry.vibration.toFixed(2)} mm/s</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Temperature</span>
                      <strong className="text-slate-200 font-mono">{m.latestTelemetry.temperature.toFixed(1)} °C</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Rated Power</span>
                      <strong className="text-slate-200 font-mono">{m.ratedPowerKW} kW</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {m.activeFaults.length ? `${m.activeFaults.length} Fault Advisories` : '0 Faults Active'}
                  </span>
                  <div className={`flex items-center gap-1 font-semibold ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
                    <span>{isSelected ? 'Active Machine' : 'Switch to Asset'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                PROVISION NEW MACHINE DIGITAL TWIN
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMachine} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Machine Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Boiler Feed Pump BFP-02"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Machinery Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="Centrifugal Pump">Centrifugal Pump</option>
                    <option value="Helical Gearbox">Helical Gearbox</option>
                    <option value="Induction Motor">Induction Motor</option>
                    <option value="Rotary Compressor">Rotary Compressor</option>
                    <option value="Cooling Fan / Blower">Cooling Fan / Blower</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Plant Location / Unit</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rated Power (kW)</label>
                  <input
                    type="number"
                    value={ratedPowerKW}
                    onChange={(e) => setRatedPowerKW(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rated Speed (RPM)</label>
                  <input
                    type="number"
                    value={ratedRPM}
                    onChange={(e) => setRatedRPM(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-900/40"
                >
                  Provision Digital Twin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
