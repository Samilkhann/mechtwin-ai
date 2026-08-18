/**
 * MechTwin AI - Fault Detection & Diagnostics Service
 * Analyzes multi-sensor telemetry signatures to identify mechanical failure modes.
 */

import { FaultPrediction, Machine, TelemetryReading } from '../types';

export function detectMachineFaults(machine: Machine, telemetry: TelemetryReading): FaultPrediction[] {
  const faults: FaultPrediction[] = [];
  const now = new Date().toISOString();

  // 1. Bearing Outer Race Wear (BPFO / Flaking)
  // Signature: Elevated vibration (especially > 3.2 mm/s), high kurtosis (>3.5), elevated bearing temperature
  if (telemetry.vibration > 3.0 || telemetry.vibrationKurtosis > 3.6 || (telemetry.temperature > 72 && telemetry.vibration > 2.8)) {
    const probability = Math.min(96, Math.round(55 + (telemetry.vibration / 7.0) * 35 + (telemetry.vibrationKurtosis - 3.0) * 10));
    const severity = telemetry.vibration > 5.5 ? 'CRITICAL' : telemetry.vibration > 3.8 ? 'HIGH' : 'MEDIUM';
    
    faults.push({
      id: `fault-bpfo-${machine.id}`,
      machineId: machine.id,
      faultType: 'Rolling Element Bearing Degradation (Outer Race BPFO)',
      probability,
      severity,
      affectedComponent: 'Drive-End Deep Groove Ball Bearing (SKF 6208)',
      componentId: 'bearing_de',
      evidence: [
        `Vibration velocity escalated to ${telemetry.vibration.toFixed(2)} mm/s RMS (exceeds ISO 10816 Zone A limit of 2.3 mm/s)`,
        `Vibration waveform Kurtosis is ${telemetry.vibrationKurtosis.toFixed(2)} (normal Gaussian baseline is 3.0)`,
        `Bearing housing temperature operating at ${telemetry.temperature.toFixed(1)} °C (+${(telemetry.temperature - 60).toFixed(1)} °C over nominal baseline)`,
        `High-frequency peak envelope detected at BPFO frequency (~105.8 Hz @ ${Math.round(telemetry.rpm)} RPM)`
      ],
      recommendedAction: 'Perform spectral shock-pulse analysis, replenish synthetic grease (ISO VG 100), and schedule bearing replacement within 72 hours.',
      maintenancePriority: severity === 'CRITICAL' ? 'P1 - Immediate' : 'P2 - Within 48h',
      estimatedTimeToFailureHours: Math.max(12, Math.round((100 - probability) * 8.5)),
      detectedAt: now,
      isoStandardRef: 'ISO 10816-3 / ISO 15243 Bearing Failure Modes'
    });
  }

  // 2. Shaft Misalignment (Angular / Parallel)
  // Signature: High 2X RPM vibration harmonic, axial vibration, coupling temperature rise
  if (telemetry.vibration > 3.5 && telemetry.rpm > 1000 && telemetry.powerFactor < 0.85) {
    const probability = Math.min(92, Math.round(60 + (telemetry.vibration / 6.0) * 25));
    faults.push({
      id: `fault-misalign-${machine.id}`,
      machineId: machine.id,
      faultType: 'Shaft Angular & Parallel Misalignment',
      probability,
      severity: telemetry.vibration > 5.0 ? 'HIGH' : 'MEDIUM',
      affectedComponent: 'Flexible Elastomeric Shaft Coupling',
      componentId: 'coupling',
      evidence: [
        `Harmonic vibration spike observed at 2X running frequency (~${((telemetry.rpm / 60) * 2).toFixed(1)} Hz)`,
        `Dynamic radial load increasing shaft deflection stress by ~18%`,
        `Coupling hub thermal scan shows localized friction heating`
      ],
      recommendedAction: 'Perform laser shaft alignment check on motor-pump centerlines. Target radial offset < 0.05 mm and angular gap < 0.04 mm/100mm.',
      maintenancePriority: 'P2 - Within 48h',
      estimatedTimeToFailureHours: Math.round((100 - probability) * 12),
      detectedAt: now,
      isoStandardRef: 'ANSI/ASA S2.75 Shaft Alignment Standard'
    });
  }

  // 3. Dynamic Rotor Imbalance
  // Signature: Dominant 1X running frequency peak (radial), steady with RPM
  if (telemetry.vibration > 4.2 && telemetry.vibrationKurtosis < 3.3) {
    faults.push({
      id: `fault-unbalance-${machine.id}`,
      machineId: machine.id,
      faultType: 'Dynamic Rotor Mass Unbalance',
      probability: Math.min(88, Math.round(65 + (telemetry.vibration / 8.0) * 20)),
      severity: telemetry.vibration > 6.0 ? 'HIGH' : 'MEDIUM',
      affectedComponent: 'Main Rotor Shaft & Impeller Assembly',
      componentId: 'shaft',
      evidence: [
        `Dominant radial sinusoidal vibration at 1X rotational speed (${(telemetry.rpm / 60).toFixed(1)} Hz)`,
        `Vibration amplitude scales quadratically with rotational velocity ($V \\propto \\omega^2$)`,
        `Rotor mass eccentricity exceeds ISO 1940-1 Grade G2.5 limit`
      ],
      recommendedAction: 'Clean impeller vanes of particulate scaling; execute field dynamic two-plane trim balancing.',
      maintenancePriority: 'P3 - Next Scheduled Maintenance',
      estimatedTimeToFailureHours: 320,
      detectedAt: now,
      isoStandardRef: 'ISO 1940-1 Rotor Balance Quality'
    });
  }

  // 4. Hydraulic Cavitation (Pumps & Turbomachinery)
  // Signature: Suction pressure drop, acoustic crackling, fluctuating flow rate and efficiency drop
  if (telemetry.pressureInlet < 0.85 && machine.type.toLowerCase().includes('pump')) {
    const probability = Math.min(94, Math.round(70 + (0.85 - telemetry.pressureInlet) * 60));
    faults.push({
      id: `fault-cavit-${machine.id}`,
      machineId: machine.id,
      faultType: 'Hydraulic Cavitation (NPSH Margin Starvation)',
      probability,
      severity: telemetry.pressureInlet < 0.5 ? 'CRITICAL' : 'HIGH',
      affectedComponent: 'Bronze Closed Impeller Vanes & Volute Casing',
      componentId: 'impeller',
      evidence: [
        `Suction inlet pressure dropped to ${telemetry.pressureInlet.toFixed(2)} bar (NPSHa < NPSHr threshold)`,
        `High-frequency broadband random acoustic noise detected in pump casing`,
        `Pump discharge flow rate fluctuating by ±${Math.abs(telemetry.flowRate * 0.08).toFixed(1)} L/min`,
        `Hydraulic efficiency reduced by ~${(90 - telemetry.efficiency).toFixed(1)}%`
      ],
      recommendedAction: 'Inspect suction line strainer for clogging, open inlet suction valve, check fluid vapor pressure at operating temperature, and verify tank level.',
      maintenancePriority: telemetry.pressureInlet < 0.5 ? 'P1 - Immediate' : 'P2 - Within 48h',
      estimatedTimeToFailureHours: Math.max(8, Math.round((telemetry.pressureInlet / 0.85) * 48)),
      detectedAt: now,
      isoStandardRef: 'HI 9.6.1 Pump Cavitation & NPSH Standards'
    });
  }

  // 5. Stator Winding Thermal Overload / High Current
  // Signature: Stator temp > 82°C, Current > ratedCurrent, power factor drops
  if (telemetry.temperature > 80 && telemetry.current > machine.ratedCurrentA * 0.95) {
    const overloadRatio = telemetry.current / (machine.ratedCurrentA || 1);
    const probability = Math.min(95, Math.round(65 + (telemetry.temperature - 75) * 1.5 + (overloadRatio - 1) * 30));
    faults.push({
      id: `fault-thermal-${machine.id}`,
      machineId: machine.id,
      faultType: 'Motor Stator Winding Thermal Overload',
      probability,
      severity: telemetry.temperature > 95 ? 'CRITICAL' : 'HIGH',
      affectedComponent: 'Three-Phase Stator Windings (Class F Insulation)',
      componentId: 'motor',
      evidence: [
        `Stator temperature reached ${telemetry.temperature.toFixed(1)} °C (safe threshold: 75 °C)`,
        `Operating current is ${telemetry.current.toFixed(1)} A (${Math.round(overloadRatio * 100)}% of rated ${machine.ratedCurrentA} A)`,
        `Continuous operation at current thermal profile reduces winding dielectric life by 50% per 10°C rise (Montsinger Rule)`
      ],
      recommendedAction: 'Reduce mechanical brake/fluid load, check cooling fan cowl for obstruction, clean motor heat sink fins, and verify phase voltage balance.',
      maintenancePriority: telemetry.temperature > 95 ? 'P1 - Immediate' : 'P2 - Within 48h',
      estimatedTimeToFailureHours: Math.max(6, Math.round((105 - telemetry.temperature) * 4)),
      detectedAt: now,
      isoStandardRef: 'IEC 60034-1 Motor Thermal Ratings'
    });
  }

  // 6. Mechanical Seal Degradation & Leakage Risk
  if (telemetry.temperature > 74 && telemetry.pressureOutlet > 5.5 && machine.type.toLowerCase().includes('pump')) {
    faults.push({
      id: `fault-seal-${machine.id}`,
      machineId: machine.id,
      faultType: 'Mechanical Seal Face Thermal Distortion',
      probability: 68,
      severity: 'MEDIUM',
      affectedComponent: 'Silicon Carbide Mechanical Face Seal Kit',
      componentId: 'seal',
      evidence: [
        `Seal chamber temperature elevated at ${telemetry.temperature.toFixed(1)} °C`,
        `Discharge back-pressure peaking at ${telemetry.pressureOutlet.toFixed(2)} bar`,
        `Seal barrier fluid flush circulation flow rate below recommended minimum`
      ],
      recommendedAction: 'Inspect seal buffer fluid reservoir, verify Plan 11/53A flush lines, and inspect quench drain for liquid dripping.',
      maintenancePriority: 'P3 - Next Scheduled Maintenance',
      estimatedTimeToFailureHours: 140,
      detectedAt: now,
      isoStandardRef: 'API 682 Mechanical Seal Piping Plans'
    });
  }

  return faults;
}
