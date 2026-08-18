/**
 * MECHTWIN AI — Physics Simulation & Deterministic Twin Service
 * Coupled mathematical models for rotating machinery and turbomachinery
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import { Machine, TelemetryReading, WhatIfScenarioInputs, WhatIfPrediction } from '../../src/types';

export interface CoupledPhysicsParameters {
  loadPercent: number; // 0 - 150%
  rpm: number; // RPM
  bearingWearFactor: number; // 0 (pristine) - 1 (failure)
  flowRestrictionFactor: number; // 0 (open) - 1 (throttled/blocked)
  ambientTempC: number; // °C
}

export class PhysicsSimulationService {
  /**
   * Evaluates deterministic telemetry given operating parameters
   */
  public static simulateTelemetry(
    machine: Machine,
    params: CoupledPhysicsParameters,
    timeStepSeconds = 0
  ): TelemetryReading {
    const { loadPercent, rpm, bearingWearFactor, flowRestrictionFactor, ambientTempC } = params;

    // 1. Angular Velocity (rad/s)
    const omega = (2 * Math.PI * rpm) / 60;

    // 2. Base Load Ratio
    const loadRatio = Math.max(0.1, Math.min(1.5, loadPercent / 100));

    // 3. Efficiency calculation (Peaks at ~85% BEP load, penalized by wear and restriction)
    const bepDelta = Math.abs(loadRatio - 0.85);
    const baseEff = 0.91 - bepDelta * 0.12;
    const wearEffPenalty = bearingWearFactor * 0.08;
    const restrictionEffPenalty = flowRestrictionFactor * 0.15;
    const efficiency = Math.max(
      0.65,
      Math.min(0.94, (baseEff - wearEffPenalty - restrictionEffPenalty))
    ) * 100;

    // 4. Power & Torque (P = T * omega)
    const ratedPowerW = machine.ratedPowerKW * 1000;
    const mechanicalPowerW = ratedPowerW * loadRatio * (rpm / machine.ratedRPM);
    const electricalPowerW = mechanicalPowerW / (efficiency / 100);
    const powerKW = electricalPowerW / 1000;
    const torqueNm = omega > 0 ? mechanicalPowerW / omega : 0;

    // 5. Voltage and Current (3-phase: P = sqrt(3) * V * I * pf)
    const voltageV = machine.ratedVoltageV;
    const powerFactor = Math.min(0.92, 0.75 + loadRatio * 0.16);
    const currentA = electricalPowerW / (Math.sqrt(3) * voltageV * powerFactor);

    // 6. Thermal Dissipation Model (Losses = Pin - Pout, T_rise = Losses * R_th)
    const powerLossKW = (electricalPowerW - mechanicalPowerW) / 1000;
    const thermalResistanceKPerKW = 4.2; // Equivalent thermal resistance
    const frictionHeatKW = bearingWearFactor * 1.8;
    const steadyStateTempRise = (powerLossKW + frictionHeatKW) * thermalResistanceKPerKW;
    const temperatureC = ambientTempC + steadyStateTempRise;

    // 7. Vibration Velocity Model (ISO 10816-3 mm/s RMS)
    // Dynamic unbalance force is proportional to omega^2
    const speedRatio = rpm / machine.ratedRPM;
    const unbalanceVib = 0.85 * (speedRatio ** 2);
    const loadVib = loadRatio * 0.45;
    const bearingSpallVib = bearingWearFactor * 4.2; // Impulsive bearing impact energy
    const restrictionVib = flowRestrictionFactor * 1.8; // Hydraulic turbulence / vortex shedding
    const vibrationRMS = unbalanceVib + loadVib + bearingSpallVib + restrictionVib;
    const vibrationPeak = vibrationRMS * (1.414 + bearingWearFactor * 0.8);
    const vibrationKurtosis = 3.0 + bearingWearFactor * 3.5; // Gaussian is 3.0, damaged bearing > 4.5

    // 8. Hydraulic Flow & Pressure (Centrifugal pump affinity laws)
    const nominalFlowLPM = machine.ratedFlowLPM || 1200;
    const flowRate = nominalFlowLPM * speedRatio * (1 - flowRestrictionFactor * 0.75);
    const suctionPressure = 1.25 - flowRestrictionFactor * 0.6; // Suction drops if restricted
    const shutoffHeadRatio = 1.2;
    const headRatio = (speedRatio ** 2) * (shutoffHeadRatio - 0.2 * (flowRate / nominalFlowLPM) ** 2);
    const pressureOutlet = Math.max(0, suctionPressure + (machine.ratedHeadMeters || 45) * 0.0981 * headRatio);

    // 9. Failure Probability and RUL
    const failureProbability = Math.min(
      98,
      Math.max(2, Math.round(bearingWearFactor * 85 + (temperatureC > 75 ? 10 : 0) + (vibrationRMS > 4.5 ? 15 : 0)))
    );

    // ISO 281 Rating life approximation
    const dynamicCapacityRatio = Math.max(0.1, 1.0 - bearingWearFactor);
    const remainingUsefulLifeDays = Math.max(
      3,
      Math.round(180 * (dynamicCapacityRatio ** 3) * (machine.ratedRPM / Math.max(100, rpm)))
    );

    // 10. Composite Health Score (0 - 100)
    let healthScore = 100;
    if (vibrationRMS > 1.4) healthScore -= (vibrationRMS - 1.4) * 12;
    if (temperatureC > 60) healthScore -= (temperatureC - 60) * 1.2;
    if (efficiency < 88) healthScore -= (88 - efficiency) * 1.8;
    healthScore = Math.max(10, Math.min(99, Math.round(healthScore)));

    return {
      timestamp: Date.now(),
      temperature: parseFloat(temperatureC.toFixed(1)),
      vibration: parseFloat(vibrationRMS.toFixed(2)),
      vibrationPeak: parseFloat(vibrationPeak.toFixed(2)),
      vibrationKurtosis: parseFloat(vibrationKurtosis.toFixed(2)),
      rpm: Math.round(rpm),
      current: parseFloat(currentA.toFixed(1)),
      voltage: parseFloat(voltageV.toFixed(1)),
      power: parseFloat(powerKW.toFixed(2)),
      powerFactor: parseFloat(powerFactor.toFixed(2)),
      pressureInlet: parseFloat(suctionPressure.toFixed(2)),
      pressureOutlet: parseFloat(pressureOutlet.toFixed(2)),
      flowRate: parseFloat(flowRate.toFixed(1)),
      torque: parseFloat(torqueNm.toFixed(1)),
      efficiency: parseFloat(efficiency.toFixed(1)),
      healthScore,
      failureProbability,
      remainingUsefulLifeDays,
      dataTrust: 'SIMULATED',
      quality: 'GOOD',
      source: 'SIMULATED',
    };
  }

  /**
   * Solves What-If Scenarios comparing Baseline vs. Scenario
   */
  public static solveWhatIfScenario(
    machine: Machine,
    inputs: WhatIfScenarioInputs
  ): WhatIfPrediction {
    const wearFactor = Math.min(1.0, inputs.lubricationDegradationPct / 100);
    const telemetry = this.simulateTelemetry(
      machine,
      {
        loadPercent: inputs.loadPercent,
        rpm: inputs.rpm,
        bearingWearFactor: wearFactor,
        flowRestrictionFactor: 0.05,
        ambientTempC: inputs.ambientTempC,
      }
    );

    // Energy cost calculation (assuming 6000 operating hours/year)
    const annualKWh = telemetry.power * 6000;
    const estimatedAnnualCostUSD = Math.round(annualKWh * machine.energyCostPerKWh);

    let riskAssessment = 'LOW RISK: Machine operates inside normal continuous ISO tolerances.';
    let recommendation = 'Maintain standard predictive monitoring schedule.';

    if (telemetry.vibration > 4.5 || telemetry.temperature > 82) {
      riskAssessment = 'CRITICAL RISK: Severe vibration (ISO Zone D) and thermal boundary degradation.';
      recommendation = 'Reduce RPM immediately; schedule emergency bearing replacement.';
    } else if (telemetry.vibration > 2.8 || telemetry.temperature > 72) {
      riskAssessment = 'MODERATE/ELEVATED RISK: Operating in ISO Zone C warning region.';
      recommendation = 'Plan inspection within 48 hours; audit grease viscosity.';
    }

    return {
      powerKW: telemetry.power,
      temperatureC: telemetry.temperature,
      vibrationRMS: telemetry.vibration,
      efficiencyPct: telemetry.efficiency,
      bearingLifeDays: telemetry.remainingUsefulLifeDays,
      failureRiskPct: telemetry.failureProbability,
      estimatedAnnualCostUSD,
      riskAssessment,
      recommendation,
      dataTrust: 'PREDICTED',
    };
  }
}
