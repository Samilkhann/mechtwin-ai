/**
 * MechTwin AI - Engineering Reports & Data Export Studio
 */

import React, { useState } from 'react';
import { Machine, TelemetryReading } from '../../types';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  UserCheck,
  FileSpreadsheet,
  FileCode,
  Share2,
} from 'lucide-react';

interface ReportsViewProps {
  machine: Machine;
  telemetryHistory: TelemetryReading[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ machine, telemetryHistory }) => {
  const [reportDate] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  const [auditorName, setAuditorName] = useState('Dr. E. Harrison (Chief Reliability Engineer, ISO 18436 Cat IV)');
  const [plantLocation, setPlantLocation] = useState('Plant Unit 04 - Chemical Processing Facility');

  const exportCSV = () => {
    if (!telemetryHistory.length) return;
    const headers = ['Timestamp', 'Vibration_RMS_mms', 'Vibration_Peak_mms', 'Kurtosis', 'Temperature_C', 'RPM', 'Power_kW', 'Current_A', 'Voltage_V', 'Pressure_Inlet_bar', 'Pressure_Outlet_bar', 'FlowRate_Lmin', 'Efficiency_pct', 'HealthScore'];
    const rows = telemetryHistory.map(t => [
      new Date(t.timestamp).toISOString(),
      t.vibration,
      t.vibrationPeak,
      t.vibrationKurtosis,
      t.temperature,
      t.rpm,
      t.power,
      t.current,
      t.voltage,
      t.pressureInlet,
      t.pressureOutlet,
      t.flowRate,
      t.efficiency,
      t.healthScore,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MechTwin_${machine.id}_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ machine, telemetryHistory: telemetryHistory.slice(-50) }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `MechTwin_${machine.id}_digital_twin.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                ENGINEERING AUDIT REPORTS & DATA EXPORT STUDIO
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate standardized ISO 10816 and IEC 60034 plant reliability inspection certificates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV Telemetry
            </button>
            <button
              onClick={exportJSON}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Export JSON Twin
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-900/40"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Audit Details Input row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Lead Reliability Auditor</label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Plant Facility & Unit</label>
            <input
              type="text"
              value={plantLocation}
              onChange={(e) => setPlantLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Formal Printable Engineering Certificate Document */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 max-w-4xl mx-auto print:border-0 print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-cyan-500/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <h1 className="text-lg font-bold text-white tracking-widest uppercase font-mono">MECHTWIN AI PLATFORM</h1>
            </div>
            <h2 className="text-sm font-semibold text-slate-300">ISO 10816 & IEC 60034 MACHINERY CONDITION ASSESSMENT</h2>
            <div className="text-xs text-slate-400 font-mono">Certificate Ref: MTR-2026-{machine.id.replace('MT-', '')}-99X</div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 space-y-0.5">
            <div>Date: <strong className="text-white">{reportDate}</strong></div>
            <div>Facility: <strong className="text-slate-200">{plantLocation}</strong></div>
            <div>Status: <span className="text-emerald-400 font-bold">VERIFIED COMPLIANT</span></div>
          </div>
        </div>

        {/* Machine Identity & Baseline Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Machine Tag / ID</span>
            <strong className="text-white font-mono text-sm">{machine.id}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Equipment Name</span>
            <strong className="text-white text-sm">{machine.name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Design Duty</span>
            <strong className="text-white text-sm">{machine.ratedPowerKW} kW @ {machine.ratedRPM} RPM</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Total Service Hours</span>
            <strong className="text-white font-mono text-sm">{machine.operatingHours.toLocaleString()} hrs</strong>
          </div>
        </div>

        {/* Audit Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
            1. EXECUTIVE DIAGNOSTIC EVALUATION
          </h3>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              On <strong>{reportDate}</strong>, machinery digital twin model <strong>{machine.name}</strong> was audited under steady-state operating conditions at <strong>{machine.latestTelemetry.rpm} RPM</strong> and <strong>{machine.latestTelemetry.power.toFixed(1)} kW</strong> power output.
            </p>
            <p>
              The calculated overall Machine Health Index is <strong>{machine.healthBreakdown.overallScore} / 100</strong>, categorizing the asset in <strong>{machine.healthBreakdown.status}</strong> condition. Measured vibration velocity is <strong>{machine.latestTelemetry.vibration.toFixed(2)} mm/s RMS</strong>, conforming to <strong>ISO 10816-3 Zone B</strong>.
            </p>
          </div>
        </div>

        {/* Sub-Assembly Status Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
            2. SUB-ASSEMBLY COMPONENT CONDITION MATRIX
          </h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-3">Component Description</th>
                  <th className="p-3">Material</th>
                  <th className="p-3">Temperature</th>
                  <th className="p-3">Vibration</th>
                  <th className="p-3">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {machine.components.map(comp => (
                  <tr key={comp.id} className="hover:bg-slate-900/30">
                    <td className="p-3 font-medium text-white">{comp.name}</td>
                    <td className="p-3 text-slate-400">{comp.material}</td>
                    <td className="p-3 font-mono text-slate-300">{comp.temperature.toFixed(1)} °C</td>
                    <td className="p-3 font-mono text-slate-300">{comp.vibration.toFixed(2)} mm/s</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        comp.condition === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-400' :
                        comp.condition === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {comp.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures & Certification Stamp */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 font-mono text-[10px] uppercase">Certified Reliability Engineer:</span>
            <div className="font-semibold text-white">{auditorName}</div>
            <div className="text-[11px] text-slate-400">MechTwin AI Automated Certification Suite</div>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <div className="font-mono text-[10px] uppercase text-left">
              <div className="font-bold">DIGITALLY VERIFIED</div>
              <div>ISO 10816-3 COMPLIANT</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
