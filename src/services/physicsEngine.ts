/**
 * MechTwin AI - Mechanical Physics & Telemetry Simulation Engine
 * Generates realistic inter-dependent physics sensor streams for rotating machinery.
 */

import { Machine, TelemetryReading, WhatIfResult, WhatIfScenario } from '../types';

export type OperatingMode = 'NORMAL' | 'WARNING_BEARING' | 'CAVITATION' | 'MISALIGNMENT' | 'CRITICAL_OVERLOAD';

export interface PhysicsSimulationState {
  operatingMode: OperatingMode;
  speedMultiplier: number; // 1x, 2x, 5x
  loadPercent: number; // 20% - 150%
  ambientTempC: number; // 20°C - 45°C
  internalThermalAccumulator: number;
  timeStep: number;
}

export function createInitialSimulationState(): PhysicsSimulationState {
  return {
    operatingMode: 'NORMAL',
    speedMultiplier: 1.0,
    loadPercent: 78.0,
    ambientTempC: 24.5,
    internalThermalAccumulator: 68.2,
    timeStep: 0,
  };
}

/**
 * Computes next realistic telemetry state based on mechanical physics laws:
 * - P = 2*pi*N*T / 60
 * - Current I = P / (sqrt(3) * V * cos(phi) * eta)
 * - Heat dissipation dQ/dt = P_loss - h*A*(T - T_amb)
 * - Vibration velocity = baseline + f(load, unbalance, bearing wear) + noise
 * - Pump flow Q & Head H follow quadratic characteristic curve
 */
export function generateNextTelemetry(
  machine: Machine,
  prevTelemetry: TelemetryReading,
  simState: PhysicsSimulationState
): { telemetry: TelemetryReading; nextSimState: PhysicsSimulationState } {
  const t = simState.timeStep + 0.1 * simState.speedMultiplier;
  const loadFrac = Math.max(0.2, Math.min(1.6, simState.loadPercent / 100));

  // Mode-specific parameter modifiers
  let modeVibBase = 2.1;
  let modeVibKurtosis = 3.05;
  let modeTempTarget = simState.ambientTempC + 42 * loadFrac;
  let modeInletPressure = 1.25; // bar
  let modeEfficiency = 88.5 - (loadFrac > 1.0 ? (loadFrac - 1.0) * 15 : (1.0 - loadFrac) * 8);

  if (simState.operatingMode === 'WARNING_BEARING') {
    modeVibBase = 4.35;
    modeVibKurtosis = 4.15;
    modeTempTarget += 12.0;
    modeEfficiency -= 4.0;
  } else if (simState.operatingMode === 'CAVITATION') {
    modeVibBase = 5.2;
    modeVibKurtosis = 4.6;
    modeInletPressure = 0.42; // Low suction pressure causes vaporization
    modeTempTarget += 8.0;
    modeEfficiency -= 16.5;
  } else if (simState.operatingMode === 'MISALIGNMENT') {
    modeVibBase = 4.8;
    modeVibKurtosis = 3.3;
    modeTempTarget += 14.5;
    modeEfficiency -= 6.0;
  } else if (simState.operatingMode === 'CRITICAL_OVERLOAD') {
    modeVibBase = 7.8;
    modeVibKurtosis = 5.4;
    modeTempTarget += 34.0;
    modeEfficiency -= 22.0;
  }

  // Small realistic physical oscillations (turbulent flow, slight grid frequency ripple)
  const naturalNoise = Math.sin(t * 1.8) * 0.08 + Math.sin(t * 5.4) * 0.04;
  const rpmRipple = Math.sin(t * 0.9) * 2.5;

  // 1. RPM calculation: Motor slip increases with load: N = N_syn * (1 - slip * loadFrac)
  const slip = 0.025 * loadFrac;
  const baseRPM = machine.ratedRPM * (1 - slip) + rpmRipple;

  // 2. Power calculation (kW): Base shaft power scales with load
  const power = Math.max(0.5, machine.ratedPowerKW * loadFrac * (1 + naturalNoise * 0.05));

  // 3. Torque calculation (N·m): T = (Power * 9549) / RPM
  const torque = (power * 9549) / Math.max(100, baseRPM);

  // 4. Voltage & Current: 3-phase AC relationship
  const voltage = machine.ratedVoltageV + Math.sin(t * 0.3) * 1.5;
  const powerFactor = Math.max(0.72, Math.min(0.92, 0.88 - (loadFrac < 0.5 ? (0.5 - loadFrac) * 0.2 : 0)));
  const current = (power * 1000) / (Math.sqrt(3) * voltage * powerFactor * (modeEfficiency / 100));

  // 5. Thermal response (1st order thermal lag response)
  const thermalLagConstant = 0.08 * simState.speedMultiplier;
  const currentTemp = prevTelemetry.temperature + (modeTempTarget - prevTelemetry.temperature) * thermalLagConstant + naturalNoise * 0.2;

  // 6. Vibration RMS & Peak
  const vibration = Math.max(0.8, modeVibBase + naturalNoise * 0.4 + (loadFrac > 1.1 ? (loadFrac - 1.1) * 2.0 : 0));
  const vibrationPeak = vibration * (1.414 + (modeVibKurtosis - 3.0) * 0.35 + Math.random() * 0.15);
  const vibrationKurtosis = Math.max(2.8, modeVibKurtosis + (Math.random() - 0.5) * 0.2);

  // 7. Pressure & Flow (Centrifugal pump H-Q relationship)
  const pressureInlet = Math.max(0.1, modeInletPressure + Math.sin(t * 2.1) * 0.02);
  const flowRate = (machine.ratedFlowLPM || 650) * Math.sqrt(Math.max(0.1, loadFrac)) * (modeEfficiency / 90) + naturalNoise * 15;
  const pressureOutlet = Math.max(pressureInlet + 0.5, 4.8 * (baseRPM / machine.ratedRPM) ** 2 - (flowRate / 1000) ** 2 + naturalNoise * 0.1);

  // 8. Failure Probability & Remaining Useful Life estimation
  // Weibull-inspired risk calculation
  let failureProb = 8;
  let rulDays = 180;
  if (vibration > 7.1 || currentTemp > 95) {
    failureProb = Math.min(98, Math.round(75 + (vibration - 7.1) * 8 + (currentTemp - 95) * 1.2));
    rulDays = Math.max(2, Math.round(14 - (failureProb - 75) * 0.3));
  } else if (vibration > 4.5 || currentTemp > 80) {
    failureProb = Math.min(65, Math.round(35 + (vibration - 4.5) * 12 + (currentTemp - 80) * 1.5));
    rulDays = Math.max(14, Math.round(60 - (failureProb - 35) * 1.2));
  } else if (vibration > 2.8 || currentTemp > 72) {
    failureProb = Math.round(15 + (vibration - 2.8) * 10);
    rulDays = Math.max(60, Math.round(180 - failureProb * 2));
  } else {
    failureProb = Math.max(4, Math.round(6 + (loadFrac > 1 ? (loadFrac - 1) * 15 : 0)));
    rulDays = 240;
  }

  const updatedTelemetry: TelemetryReading = {
    timestamp: Date.now(),
    temperature: parseFloat(currentTemp.toFixed(2)),
    vibration: parseFloat(vibration.toFixed(2)),
    vibrationPeak: parseFloat(vibrationPeak.toFixed(2)),
    vibrationKurtosis: parseFloat(vibrationKurtosis.toFixed(2)),
    rpm: Math.round(baseRPM),
    current: parseFloat(current.toFixed(2)),
    voltage: parseFloat(voltage.toFixed(1)),
    power: parseFloat(power.toFixed(2)),
    powerFactor: parseFloat(powerFactor.toFixed(2)),
    pressureInlet: parseFloat(pressureInlet.toFixed(2)),
    pressureOutlet: parseFloat(pressureOutlet.toFixed(2)),
    flowRate: Math.round(flowRate),
    torque: parseFloat(torque.toFixed(1)),
    efficiency: parseFloat(modeEfficiency.toFixed(1)),
    healthScore: Math.max(10, Math.min(100, Math.round(100 - failureProb * 0.95))),
    failureProbability: failureProb,
    remainingUsefulLifeDays: rulDays,
  };

  const nextSimState: PhysicsSimulationState = {
    ...simState,
    internalThermalAccumulator: currentTemp,
    timeStep: t,
  };

  return { telemetry: updatedTelemetry, nextSimState };
}

/**
 * Calculates predictive What-If engineering scenario:
 * Predicts impact of altering RPM, load %, inlet pressure, ambient temp, and lubricant viscosity.
 */
export function calculateWhatIfScenario(baseline: TelemetryReading, scenario: WhatIfScenario, machine: Machine): WhatIfResult {
  const rpmRatio = scenario.adjustedRPM / (machine.ratedRPM || 1480);
  const loadRatio = scenario.adjustedLoadPercent / 100;

  // Power follows cubic relation with speed in fluid machines and linear with mechanical load: P ~ N^3 / load
  const predictedPowerKW = baseline.power * (rpmRatio ** 2.2) * (loadRatio / 0.78);

  // Temperature rise follows power losses and ambient temperature
  const powerLossRatio = (predictedPowerKW * 0.12) / (baseline.power * 0.12);
  const predictedTemp = scenario.adjustedAmbientTemp + (baseline.temperature - 25) * powerLossRatio * (scenario.adjustedLubricantViscosity < 32 ? 1.25 : 0.95);

  // Vibration scales quadratically with rotational unbalance speed: V ~ (N/N0)^2
  const viscosityPenalty = scenario.adjustedLubricantViscosity < 25 ? 1.35 : scenario.adjustedLubricantViscosity > 150 ? 1.15 : 1.0;
  const predictedVibration = baseline.vibration * (rpmRatio ** 1.8) * Math.sqrt(loadRatio) * viscosityPenalty;

  // Hydraulic & Mechanical Efficiency
  const predictedEfficiency = Math.max(45, Math.min(94, baseline.efficiency - Math.abs(rpmRatio - 1.0) * 12 - (loadRatio > 1.1 ? (loadRatio - 1.1) * 20 : 0)));

  // Delta computations
  const deltaTemperature = predictedTemp - baseline.temperature;
  const deltaPowerKW = predictedPowerKW - baseline.power;
  const deltaVibration = predictedVibration - baseline.vibration;
  const deltaEfficiency = predictedEfficiency - baseline.efficiency;

  // RUL impact based on ISO 281 L10 bearing fatigue life: L10 ~ (C/P)^3 / N
  const loadIncreaseFactor = (predictedPowerKW / baseline.power) ** 3 * rpmRatio;
  const predictedRULDays = Math.max(5, Math.round(baseline.remainingUsefulLifeDays / Math.max(0.2, loadIncreaseFactor)));
  const deltaRULDays = predictedRULDays - baseline.remainingUsefulLifeDays;

  // Energy cost change (assuming 6000 operating hours/year and $0.14/kWh)
  const annualHours = 6000;
  const electricityRate = machine.energyCostPerKWh || 0.14;
  const deltaAnnualEnergyCostUSD = Math.round(deltaPowerKW * annualHours * electricityRate);

  const predictedTelemetry: TelemetryReading = {
    ...baseline,
    temperature: parseFloat(predictedTemp.toFixed(1)),
    vibration: parseFloat(predictedVibration.toFixed(2)),
    rpm: scenario.adjustedRPM,
    power: parseFloat(predictedPowerKW.toFixed(2)),
    efficiency: parseFloat(predictedEfficiency.toFixed(1)),
    remainingUsefulLifeDays: predictedRULDays,
    failureProbability: Math.min(99, Math.max(3, Math.round(baseline.failureProbability + (deltaVibration > 0 ? deltaVibration * 12 : deltaVibration * 5)))),
    healthScore: Math.max(10, Math.min(99, Math.round(baseline.healthScore - (deltaVibration * 8 + deltaTemperature * 0.4)))),
  };

  let riskAssessment = 'Low Risk: Machine operates within acceptable thermal and mechanical dynamic margins.';
  if (predictedVibration > 7.1 || predictedTemp > 90) {
    riskAssessment = 'CRITICAL DANGER: Simulation indicates severe vibration Zone D breach and thermal runaway risk.';
  } else if (predictedVibration > 4.5 || predictedTemp > 80) {
    riskAssessment = 'ELEVATED WARNING: Vibration transitions into ISO Zone C. Accelerated bearing wear and seal degradation predicted.';
  }

  let recommendation = 'Operating at this setpoint is sustainable for continuous 24/7 industrial duty.';
  if (deltaPowerKW > 3.0) {
    recommendation = `Consider installing a Variable Frequency Drive (VFD) to avoid $${deltaAnnualEnergyCostUSD.toLocaleString()} in annual energy surcharge.`;
  }
  if (predictedRULDays < 30) {
    recommendation += ' Warning: Expected time to bearing failure is less than 30 days under these simulated dynamics.';
  }

  return {
    baseline,
    predicted: predictedTelemetry,
    deltaTemperature: parseFloat(deltaTemperature.toFixed(1)),
    deltaPowerKW: parseFloat(deltaPowerKW.toFixed(2)),
    deltaVibration: parseFloat(deltaVibration.toFixed(2)),
    deltaEfficiency: parseFloat(deltaEfficiency.toFixed(1)),
    deltaRULDays,
    deltaAnnualEnergyCostUSD,
    riskAssessment,
    recommendation,
  };
}
