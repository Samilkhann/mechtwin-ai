/**
 * MECHTWIN AI - Industrial Energy & Thermodynamic Analytics
 * Power demand monitoring, specific energy consumption (SEC), and carbon footprint metrics
 * Created & Engineered by Samil Khan
 */

import React, { useState } from 'react';
import { Machine, TelemetryReading } from '../../types';
import {
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  Calendar,
  Layers,
  Leaf,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface EnergyAnalyticsViewProps {
  machine: Machine;
  telemetryHistory: TelemetryReading[];
}

export const EnergyAnalyticsView: React.FC<EnergyAnalyticsViewProps> = ({
  machine,
  telemetryHistory,
}) => {
  const [timeFilter, setTimeFilter] = useState<'1D' | '7D' | '30D'>('7D');
  const [costPerKWh, setCostPerKWh] = useState<number>(0.115); // $ / kWh default

  const telemetry = machine.latestTelemetry;
  const power = telemetry.power || 4.8;
  const efficiency = telemetry.efficiency || 87.4;

  // Energy calculations
  const dailyKWh = Number((power * 22.4).toFixed(1)); // ~22.4 operating hours/day
  const weeklyKWh = Number((dailyKWh * 7).toFixed(1));
  const monthlyKWh = Number((dailyKWh * 30).toFixed(1));

  const dailyCost = Number((dailyKWh * costPerKWh).toFixed(2));
  const weeklyCost = Number((weeklyKWh * costPerKWh).toFixed(2));
  const monthlyCost = Number((monthlyKWh * costPerKWh).toFixed(2));

  // Specific Energy Consumption (kWh per cubic meter pumped)
  const flowM3H = ((telemetry.flowRateLPM || 480) * 60) / 1000;
  const secKWhM3 = flowM3H > 0 ? (power / flowM3H).toFixed(3) : '0.165';

  // CO2 equivalent (0.42 kg CO2 per kWh global grid average)
  const monthlyCO2Kg = Math.round(monthlyKWh * 0.42);

  // Synthetic Historical Energy Trend Points
  const energyHistoryPoints = [
    { day: 'Mon', power: 4.6, efficiency: 88.2, cost: 11.8 },
    { day: 'Tue', power: 4.8, efficiency: 87.9, cost: 12.4 },
    { day: 'Wed', power: 5.1, efficiency: 86.5, cost: 13.1 },
    { day: 'Thu', power: 4.9, efficiency: 87.1, cost: 12.6 },
    { day: 'Fri', power: 5.3, efficiency: 85.8, cost: 13.7 },
    { day: 'Sat', power: 4.7, efficiency: 87.5, cost: 12.1 },
    { day: 'Sun', power: power, efficiency: efficiency, cost: dailyCost },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with Time Range Selector & Tariff Config */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono tracking-wide">
              ENERGY & THERMODYNAMIC PERFORMANCE ANALYTICS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Real-time Active Power Demand, Carbon Intensity, and Specific Energy Consumption
            </p>
          </div>
        </div>

        {/* Time Filter & Tariff Input */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[11px]">Tariff ($/kWh):</span>
            <input
              type="number"
              step="0.005"
              value={costPerKWh}
              onChange={e => setCostPerKWh(Number(e.target.value))}
              className="w-14 bg-slate-900 text-slate-100 px-1 py-0.5 rounded text-center border border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['1D', '7D', '30D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  timeFilter === tf
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top Energy KPI Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Instantaneous Power */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 font-mono shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> INSTANT POWER</span>
            <span className="text-emerald-400 text-[11px]">LIVE</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{power.toFixed(2)}</span>
            <span className="text-xs text-slate-400">kW</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between">
            <span>Rated: {machine.ratedPowerKW} kW</span>
            <span className="text-cyan-300 font-bold">{((power / machine.ratedPowerKW) * 100).toFixed(0)}% Load</span>
          </div>
        </div>

        {/* Card 2: Cumulative Period Energy */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 font-mono shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-sky-400" /> PERIOD USAGE</span>
            <span className="text-slate-500 text-[11px]">{timeFilter}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {timeFilter === '1D' ? dailyKWh : timeFilter === '7D' ? weeklyKWh : monthlyKWh}
            </span>
            <span className="text-xs text-slate-400">kWh</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between">
            <span>Daily Average:</span>
            <span className="text-slate-200">{dailyKWh} kWh/d</span>
          </div>
        </div>

        {/* Card 3: Energy Cost */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 font-mono shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> ENERGY COST</span>
            <span className="text-slate-500 text-[11px]">USD</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              ${timeFilter === '1D' ? dailyCost : timeFilter === '7D' ? weeklyCost : monthlyCost}
            </span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between">
            <span>Est. Annual:</span>
            <span className="text-emerald-300 font-bold">${Math.round(dailyCost * 365)} / yr</span>
          </div>
        </div>

        {/* Card 4: Specific Energy Consumption & CO2 */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 font-mono shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-400" /> CARBON INTENSITY</span>
            <span className="text-slate-500 text-[11px]">ISO 50001</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{secKWhM3}</span>
            <span className="text-xs text-slate-400">kWh / m³</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between">
            <span>Monthly CO2:</span>
            <span className="text-emerald-400 font-bold">{monthlyCO2Kg} kg CO2e</span>
          </div>
        </div>
      </div>

      {/* 3. Energy Trends & Efficiency Decomposition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Power & Cost Profile Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                DAILY POWER DEMAND & COST PROFILE
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">7-Day Operational Window</span>
          </div>

          <div className="space-y-3 pt-2">
            {energyHistoryPoints.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span className="w-10 font-bold text-slate-400">{item.day}</span>
                  <span className="text-cyan-400">{item.power.toFixed(1)} kW</span>
                  <span className="text-emerald-400 font-bold">${item.cost.toFixed(2)}</span>
                  <span className="text-slate-400">{item.efficiency.toFixed(1)}% η</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                    style={{ width: `${(item.power / 6.0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Machine Efficiency Breakdown & Sankey Loss Analysis (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                ENERGY BALANCE & THERMAL LOSSES
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{efficiency.toFixed(1)}% η</span>
          </div>

          {/* Loss Breakdown Bars */}
          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Useful Hydraulic Work (P_hyd)</span>
                <span className="text-emerald-400 font-bold">{(power * (efficiency / 100)).toFixed(2)} kW ({efficiency.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500" style={{ width: `${efficiency}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Motor Copper & Core Loss (I²R)</span>
                <span className="text-amber-400">{(power * 0.055).toFixed(2)} kW (5.5%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-amber-500" style={{ width: '5.5%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Bearing & Seal Friction Loss</span>
                <span className="text-sky-400">{(power * 0.038).toFixed(2)} kW (3.8%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-sky-500" style={{ width: '3.8%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Hydraulic Recirculation & Disk Friction</span>
                <span className="text-rose-400">{(power * 0.033).toFixed(2)} kW (3.3%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-rose-500" style={{ width: '3.3%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Operating at Best Efficiency Point (BEP):</span>
            <span className="text-emerald-400 font-bold">96.8% of Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
