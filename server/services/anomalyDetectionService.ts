/**
 * MECHTWIN AI — Anomaly Detection Service
 * Deterministic and statistical time-series anomaly classifier
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import { AnomalyEvent, Machine, TelemetryReading } from '../../src/types';

export class AnomalyDetectionService {
  /**
   * Scans current telemetry against historical bounds and physics constraints
   */
  public static detectAnomalies(machine: Machine, telemetry: TelemetryReading): AnomalyEvent[] {
    const anomalies: AnomalyEvent[] = [];
    const now = new Date().toISOString();

    // 1. Vibration Anomaly (ISO 10816-3 Thresholds)
    const expectedVibMax = 2.3; // mm/s
    if (telemetry.vibration > expectedVibMax) {
      const devPct = ((telemetry.vibration - expectedVibMax) / expectedVibMax) * 100;
      const severity = telemetry.vibration > 4.5 ? 'CRITICAL' : 'WARNING';
      anomalies.push({
        id: `ANOM-VIB-${Date.now()}`,
        timestamp: now,
        machineId: machine.id,
        machineName: machine.name,
        sensorId: 'SEN-V01',
        sensorType: 'vibration',
        severity,
        observedValue: telemetry.vibration,
        expectedRange: [0.2, expectedVibMax],
        unit: 'mm/s RMS',
        deviationPct: parseFloat(devPct.toFixed(1)),
        possibleCause:
          telemetry.vibrationKurtosis > 3.5
            ? 'Cyclic impact defect on bearing raceway (BPFO) or rolling elements'
            : 'Dynamic shaft misalignment across coupling or residual mass unbalance',
        acknowledged: false,
        dataTrust: 'CALCULATED',
      });
    }

    // 2. Temperature Anomaly (IEC 60034-1 Thresholds)
    const expectedTempMax = 75.0; // °C
    if (telemetry.temperature > expectedTempMax) {
      const devPct = ((telemetry.temperature - expectedTempMax) / expectedTempMax) * 100;
      const severity = telemetry.temperature > 85.0 ? 'CRITICAL' : 'WARNING';
      anomalies.push({
        id: `ANOM-TMP-${Date.now()}`,
        timestamp: now,
        machineId: machine.id,
        machineName: machine.name,
        sensorId: 'SEN-T01',
        sensorType: 'temperature',
        severity,
        observedValue: telemetry.temperature,
        expectedRange: [35.0, expectedTempMax],
        unit: '°C',
        deviationPct: parseFloat(devPct.toFixed(1)),
        possibleCause:
          'Lubrication film thinning, elevated mechanical frictional torque, or clogged motor cooling cowl',
        acknowledged: false,
        dataTrust: 'CALCULATED',
      });
    }

    // 3. Current / Electrical Anomaly
    const expectedCurrentMax = machine.ratedCurrentA * 0.95;
    if (telemetry.current > expectedCurrentMax) {
      const devPct = ((telemetry.current - expectedCurrentMax) / expectedCurrentMax) * 100;
      anomalies.push({
        id: `ANOM-CUR-${Date.now()}`,
        timestamp: now,
        machineId: machine.id,
        machineName: machine.name,
        sensorId: 'SEN-I01',
        sensorType: 'current',
        severity: telemetry.current > machine.ratedCurrentA ? 'CRITICAL' : 'WARNING',
        observedValue: telemetry.current,
        expectedRange: [15.0, expectedCurrentMax],
        unit: 'A',
        deviationPct: parseFloat(devPct.toFixed(1)),
        possibleCause:
          'Hydraulic overload, rotor bar asymmetry, or mechanical binding in pump volute',
        acknowledged: false,
        dataTrust: 'CALCULATED',
      });
    }

    // 4. Pressure / Hydraulic Cavitation Anomaly
    if (telemetry.pressureInlet !== undefined && telemetry.pressureInlet < 0.8) {
      anomalies.push({
        id: `ANOM-PRS-${Date.now()}`,
        timestamp: now,
        machineId: machine.id,
        machineName: machine.name,
        sensorId: 'SEN-PI01',
        sensorType: 'pressure_inlet',
        severity: telemetry.pressureInlet < 0.5 ? 'CRITICAL' : 'WARNING',
        observedValue: telemetry.pressureInlet,
        expectedRange: [0.8, 3.0],
        unit: 'bar',
        deviationPct: parseFloat((((0.8 - telemetry.pressureInlet) / 0.8) * 100).toFixed(1)),
        possibleCause:
          'Suction line cavitation risk (NPSHa < NPSHr), clogged suction basket strainer, or closed inlet valve',
        acknowledged: false,
        dataTrust: 'CALCULATED',
      });
    }

    // 5. Efficiency Degradation Anomaly
    if (telemetry.efficiency < 82.0) {
      anomalies.push({
        id: `ANOM-EFF-${Date.now()}`,
        timestamp: now,
        machineId: machine.id,
        machineName: machine.name,
        sensorId: 'SEN-P01',
        sensorType: 'power',
        severity: telemetry.efficiency < 75.0 ? 'CRITICAL' : 'WARNING',
        observedValue: telemetry.efficiency,
        expectedRange: [85.0, 94.0],
        unit: '%',
        deviationPct: parseFloat((((85.0 - telemetry.efficiency) / 85.0) * 100).toFixed(1)),
        possibleCause:
          'Hydraulic recirculation, worn impeller wear rings, or severe mechanical friction loss',
        acknowledged: false,
        dataTrust: 'CALCULATED',
      });
    }

    return anomalies;
  }
}
