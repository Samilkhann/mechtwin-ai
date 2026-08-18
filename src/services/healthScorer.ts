/**
 * MechTwin AI - Machine Health Scoring Service
 * Implements deterministic ISO 10816-3, IEC 60034-1, and multi-factor physics health scoring.
 */

import { MachineHealthBreakdown, MachineStatus, TelemetryReading } from '../types';

export interface HealthWeights {
  vibrationWeight: number; // default: 0.30
  temperatureWeight: number; // default: 0.25
  efficiencyWeight: number; // default: 0.20
  powerWeight: number; // default: 0.15
  operatingHoursWeight: number; // default: 0.10
}

export const DEFAULT_WEIGHTS: HealthWeights = {
  vibrationWeight: 0.30,
  temperatureWeight: 0.25,
  efficiencyWeight: 0.20,
  powerWeight: 0.15,
  operatingHoursWeight: 0.10,
};

export function calculateMachineHealth(
  telemetry: TelemetryReading,
  ratedPowerKW: number,
  ratedRPM: number,
  operatingHours: number,
  mtbfHours: number = 25000,
  weights: HealthWeights = DEFAULT_WEIGHTS
): MachineHealthBreakdown {
  // 1. Vibration Score based on ISO 10816-3 (Class II Medium Industrial Machines)
  // Zone A (<2.3 mm/s) -> 95-100 pts
  // Zone B (2.3 - 4.5 mm/s) -> 80-94 pts
  // Zone C (4.5 - 7.1 mm/s) -> 45-79 pts
  // Zone D (>7.1 mm/s) -> 0-44 pts
  let vibScore = 100;
  const vib = telemetry.vibration;
  if (vib <= 2.3) {
    vibScore = 100 - (vib / 2.3) * 5;
  } else if (vib <= 4.5) {
    vibScore = 95 - ((vib - 2.3) / (4.5 - 2.3)) * 15;
  } else if (vib <= 7.1) {
    vibScore = 80 - ((vib - 4.5) / (7.1 - 4.5)) * 35;
  } else {
    vibScore = Math.max(10, 45 - ((vib - 7.1) / 5.0) * 35);
  }

  // 2. Temperature Score based on IEC 60034-1 Class F Motor Insulation
  // Normal (<70°C) -> 95-100 pts
  // Elevated (70-85°C) -> 80-94 pts
  // Warning (85-100°C) -> 50-79 pts
  // Critical (>100°C) -> <50 pts
  let tempScore = 100;
  const temp = telemetry.temperature;
  if (temp <= 65) {
    tempScore = 100;
  } else if (temp <= 75) {
    tempScore = 100 - ((temp - 65) / 10) * 10;
  } else if (temp <= 90) {
    tempScore = 90 - ((temp - 75) / 15) * 30;
  } else {
    tempScore = Math.max(10, 60 - ((temp - 90) / 25) * 50);
  }

  // 3. Efficiency Score (Rated BEP comparison)
  // Rated expected ~85-92%
  let effScore = 100;
  const eff = telemetry.efficiency;
  if (eff >= 85) {
    effScore = 90 + Math.min(10, (eff - 85) * 1.5);
  } else if (eff >= 75) {
    effScore = 75 + ((eff - 75) / 10) * 15;
  } else if (eff >= 60) {
    effScore = 45 + ((eff - 60) / 15) * 30;
  } else {
    effScore = Math.max(10, (eff / 60) * 45);
  }

  // 4. Power / Load Stability Score
  // Compares actual power draw to rated power KW
  let powerScore = 100;
  const loadRatio = telemetry.power / (ratedPowerKW || 1);
  if (loadRatio <= 0.90) {
    powerScore = 98;
  } else if (loadRatio <= 1.05) {
    powerScore = 90 - ((loadRatio - 0.90) / 0.15) * 15;
  } else if (loadRatio <= 1.25) {
    powerScore = 75 - ((loadRatio - 1.05) / 0.20) * 40;
  } else {
    powerScore = Math.max(15, 35 - ((loadRatio - 1.25) / 0.3) * 20);
  }

  // 5. Operating Hours & Degradation Life Cycle Score
  const serviceLifeRatio = Math.min(1.2, operatingHours / mtbfHours);
  const hoursScore = Math.max(20, 100 - serviceLifeRatio * 40);

  // Overall Weighted Score
  const overallScore = Math.round(
    vibScore * weights.vibrationWeight +
    tempScore * weights.temperatureWeight +
    effScore * weights.efficiencyWeight +
    powerScore * weights.powerWeight +
    hoursScore * weights.operatingHoursWeight
  );

  let status: MachineStatus = 'NORMAL';
  if (overallScore < 50 || vib > 7.1 || temp > 95) {
    status = 'CRITICAL';
  } else if (overallScore < 80 || vib > 4.5 || temp > 80) {
    status = 'WARNING';
  }

  return {
    overallScore,
    status,
    factors: [
      {
        name: 'Vibration Severity (ISO 10816-3)',
        score: Math.round(vibScore),
        weight: weights.vibrationWeight,
        value: `${vib.toFixed(2)} mm/s RMS`,
        benchmark: '< 2.3 mm/s (Zone A)',
        status: vib <= 2.3 ? 'Optimal' : vib <= 4.5 ? 'Degraded' : 'Critical',
        impact: Math.round((100 - vibScore) * weights.vibrationWeight),
        description: 'Measures structural dynamic oscillations, bearing roughness, and unbalance severity.'
      },
      {
        name: 'Thermal Dynamics (IEC 60034-1)',
        score: Math.round(tempScore),
        weight: weights.temperatureWeight,
        value: `${temp.toFixed(1)} °C`,
        benchmark: '< 70.0 °C nominal',
        status: temp <= 75 ? 'Optimal' : temp <= 88 ? 'Degraded' : 'Critical',
        impact: Math.round((100 - tempScore) * weights.temperatureWeight),
        description: 'Stator winding and bearing housing temperature rise above ambient.'
      },
      {
        name: 'Operating Efficiency (BEP Index)',
        score: Math.round(effScore),
        weight: weights.efficiencyWeight,
        value: `${eff.toFixed(1)} %`,
        benchmark: '> 85.0 % BEP',
        status: eff >= 80 ? 'Optimal' : eff >= 70 ? 'Degraded' : 'Critical',
        impact: Math.round((100 - effScore) * weights.efficiencyWeight),
        description: 'Ratio of hydraulic/mechanical output power to gross electrical input.'
      },
      {
        name: 'Electrical Load Ratio',
        score: Math.round(powerScore),
        weight: weights.powerWeight,
        value: `${telemetry.power.toFixed(1)} kW (${Math.round((telemetry.power / (ratedPowerKW || 1)) * 100)}% load)`,
        benchmark: '< 100% rated capacity',
        status: loadRatio <= 1.0 ? 'Optimal' : loadRatio <= 1.15 ? 'Degraded' : 'Critical',
        impact: Math.round((100 - powerScore) * weights.powerWeight),
        description: 'Current draw and active power demand relative to nameplate rated rating.'
      },
      {
        name: 'Service Life & MTBF Interval',
        score: Math.round(hoursScore),
        weight: weights.operatingHoursWeight,
        value: `${operatingHours.toLocaleString()} hrs`,
        benchmark: `MTBF: ${mtbfHours.toLocaleString()} hrs`,
        status: serviceLifeRatio < 0.6 ? 'Optimal' : serviceLifeRatio < 0.9 ? 'Degraded' : 'Critical',
        impact: Math.round((100 - hoursScore) * weights.operatingHoursWeight),
        description: 'Cumulative run-time accumulation against scheduled overhaul interval.'
      }
    ]
  };
}
