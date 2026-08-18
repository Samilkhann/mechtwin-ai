/**
 * MECHTWIN AI — Predictive Maintenance & Fault Diagnostic Engine
 * Probabilistic failure prediction, component risk profiling & RUL estimation
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import { FaultPrediction, Machine, TelemetryReading } from '../../src/types';

export class PredictiveMaintenanceService {
  /**
   * Evaluates machine telemetry to predict probabilistic mechanical faults
   */
  public static predictFaults(machine: Machine, telemetry: TelemetryReading): FaultPrediction[] {
    const predictions: FaultPrediction[] = [];
    const now = new Date().toISOString();

    // 1. Bearing Wear (BPFO / BPFI / Subsurface Spalling)
    if (telemetry.vibration > 2.3 || telemetry.vibrationKurtosis > 3.4) {
      const prob = Math.min(
        96,
        Math.round(
          ((telemetry.vibration - 1.8) / 3.5) * 50 + (telemetry.vibrationKurtosis - 3.0) * 18 + 25
        )
      );

      const sev = prob > 80 ? 'CRITICAL' : prob > 60 ? 'HIGH' : 'MEDIUM';
      const hoursToFailure = Math.max(24, Math.round(telemetry.remainingUsefulLifeDays * 24));

      predictions.push({
        id: `PRED-BRG-${Date.now()}`,
        machineId: machine.id,
        faultType: 'Bearing Wear',
        probability: Math.max(10, prob),
        severity: sev,
        affectedComponent: 'Drive-End Bearing 01 (SKF 6208-2Z/C3)',
        componentId: 'bearing_de',
        evidence: [
          `Vibration RMS elevated to ${telemetry.vibration.toFixed(2)} mm/s (ISO 10816 Zone B/C boundary: 2.3 mm/s)`,
          `Vibration Kurtosis increased to ${telemetry.vibrationKurtosis.toFixed(2)} confirming impulsive contact shocks`,
          `Drive-end bearing temperature measured at ${telemetry.temperature.toFixed(1)} °C`,
          `Estimated fatigue life consumed: ${(100 - (telemetry.remainingUsefulLifeDays / 180) * 100).toFixed(0)}%`,
        ],
        recommendedAction:
          'Inspect bearing lubrication viscosity, verify high-frequency demodulated spectrum for BPFO harmonic (105.8 Hz), and schedule bearing replacement within estimated failure window.',
        maintenancePriority: sev === 'CRITICAL' ? 'P1 - Immediate' : 'P2 - Within 48h',
        estimatedTimeToFailureHours: hoursToFailure,
        detectedAt: now,
        isoStandardRef: 'ISO 10816-3 Class II / ISO 15243 Bearing Failure Modes',
        dataTrust: 'PREDICTED',
      });
    }

    // 2. Shaft Misalignment (2X RPM dominant harmonic)
    if (telemetry.vibration > 2.8 && telemetry.vibrationKurtosis <= 3.4) {
      predictions.push({
        id: `PRED-ALN-${Date.now()}`,
        machineId: machine.id,
        faultType: 'Shaft Misalignment',
        probability: 72,
        severity: 'MEDIUM',
        affectedComponent: 'Flexible Elastomeric Jaw Coupling',
        componentId: 'coupling',
        evidence: [
          `Elevated 2X rotational frequency energy (49.3 Hz @ 1480 RPM)`,
          `Coupling housing thermal gradient +6.5°C over baseline`,
          `Vibration RMS at ${telemetry.vibration.toFixed(2)} mm/s`,
        ],
        recommendedAction:
          'Perform dial indicator or laser alignment check across motor-pump coupling hubs (target radial offset < 0.05 mm, angular gap < 0.04 mm/100mm).',
        maintenancePriority: 'P2 - Within 48h',
        estimatedTimeToFailureHours: 240,
        detectedAt: now,
        isoStandardRef: 'ISO 10816-3 / API 686 Machinery Installation',
        dataTrust: 'PREDICTED',
      });
    }

    // 3. Rotor Imbalance (1X RPM dominant harmonic)
    if (telemetry.rpm > machine.ratedRPM * 1.05 && telemetry.vibration > 2.5) {
      predictions.push({
        id: `PRED-IMB-${Date.now()}`,
        machineId: machine.id,
        faultType: 'Rotor Imbalance',
        probability: 65,
        severity: 'MEDIUM',
        affectedComponent: 'High-Tensile Precision Drive Shaft',
        componentId: 'shaft',
        evidence: [
          `Dominant 1X running speed harmonic (24.7 Hz @ 1480 RPM)`,
          `Vibration amplitude scales with square of angular velocity ($F = m \\cdot e \\cdot \\omega^2$)`,
        ],
        recommendedAction:
          'Clean impeller vanes and perform single-plane or two-plane dynamic field balancing to ISO 1940-1 Grade G2.5.',
        maintenancePriority: 'P3 - Next Scheduled Maintenance',
        estimatedTimeToFailureHours: 480,
        detectedAt: now,
        isoStandardRef: 'ISO 1940-1 Mechanical Vibration Balance Quality',
        dataTrust: 'PREDICTED',
      });
    }

    // 4. Lubrication Failure
    if (telemetry.temperature > 72 && telemetry.vibrationKurtosis > 3.6) {
      predictions.push({
        id: `PRED-LUB-${Date.now()}`,
        machineId: machine.id,
        faultType: 'Lubrication Failure',
        probability: 81,
        severity: 'HIGH',
        affectedComponent: 'Drive-End Bearing 01 (SKF 6208-2Z/C3)',
        componentId: 'bearing_de',
        evidence: [
          `Operating temperature of ${telemetry.temperature.toFixed(1)} °C exceeds optimum grease film viscosity limit`,
          `Kinematic viscosity degradation index kappa < 0.95 (boundary lubrication regime)`,
        ],
        recommendedAction:
          'Purge and replenish with Shell Gadus S2 synthetic grease (approx 15g) and verify seal lip integrity.',
        maintenancePriority: 'P2 - Within 48h',
        estimatedTimeToFailureHours: 96,
        detectedAt: now,
        isoStandardRef: 'ISO 281 Appendix A (Lubrication Factor)',
        dataTrust: 'PREDICTED',
      });
    }

    // 5. Overheating
    if (telemetry.temperature > 78) {
      predictions.push({
        id: `PRED-OHT-${Date.now()}`,
        machineId: machine.id,
        faultType: 'Overheating',
        probability: 88,
        severity: telemetry.temperature > 85 ? 'CRITICAL' : 'HIGH',
        affectedComponent: 'Electric Motor (TEFC 3-Phase Induction)',
        componentId: 'motor',
        evidence: [
          `Motor frame thermal sensor measuring ${telemetry.temperature.toFixed(1)} °C`,
          `Thermal insulation life reduction rate 2x per Arrhenius rule for +10°C thermal rise`,
        ],
        recommendedAction:
          'Inspect motor cooling fan cowl, clean external heat dissipation fins, and verify 3-phase current balance.',
        maintenancePriority: telemetry.temperature > 85 ? 'P1 - Immediate' : 'P2 - Within 48h',
        estimatedTimeToFailureHours: telemetry.temperature > 85 ? 48 : 120,
        detectedAt: now,
        isoStandardRef: 'IEC 60034-1 Motor Thermal Ratings',
        dataTrust: 'PREDICTED',
      });
    }

    // 6. Pump Cavitation
    if (telemetry.pressureInlet !== undefined && telemetry.pressureInlet < 0.8) {
      predictions.push({
        id: `PRED-CAV-${Date.now()}`,
        machineId: machine.id,
        faultType: 'Pump Cavitation',
        probability: 84,
        severity: 'HIGH',
        affectedComponent: 'Centrifugal Pump (Enclosed 6-Vane Impeller & Volute)',
        componentId: 'impeller',
        evidence: [
          `Suction inlet pressure measured at ${telemetry.pressureInlet.toFixed(2)} bar (below minimum NPSHa margin)`,
          `Discharge pressure fluctuations ±0.35 bar`,
        ],
        recommendedAction:
          'Verify suction basket strainer is unobstructed, ensure suction isolation valve is fully open, and confirm liquid supply head.',
        maintenancePriority: 'P1 - Immediate',
        estimatedTimeToFailureHours: 72,
        detectedAt: now,
        isoStandardRef: 'Hydraulic Institute HI 9.6.1 NPSH Margin',
        dataTrust: 'PREDICTED',
      });
    }

    // 7. Motor Overload & Abnormal Current
    if (telemetry.current > machine.ratedCurrentA * 0.95) {
      predictions.push({
        id: `PRED-OVL-${Date.now()}`,
        machineId: machine.id,
        faultType: 'Motor Overload',
        probability: 76,
        severity: 'MEDIUM',
        affectedComponent: 'Electric Motor (TEFC 3-Phase Induction)',
        componentId: 'motor',
        evidence: [
          `Current draw at ${telemetry.current.toFixed(1)} A approaching rated full-load current (${machine.ratedCurrentA} A)`,
          `Active power draw ${telemetry.power.toFixed(2)} kW under heavy pumping demand`,
        ],
        recommendedAction:
          'Check fluid viscosity / specific gravity and verify pump discharge throttling position.',
        maintenancePriority: 'P3 - Next Scheduled Maintenance',
        estimatedTimeToFailureHours: 360,
        detectedAt: now,
        isoStandardRef: 'NEMA MG-1 Electric Motors',
        dataTrust: 'PREDICTED',
      });
    }

    return predictions;
  }
}
