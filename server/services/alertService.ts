/**
 * MECHTWIN AI — Alert Engine & Notification Service
 * Rule-driven alerts with threshold evaluation and anti-spam deduplication
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import { Alert, Machine, TelemetryReading } from '../../src/types';
import { db } from '../db/database';

export class AlertService {
  private static recentAlertTimestamps: Record<string, number> = {};
  private static COOLDOWN_MS = 60000; // 1-minute anti-spam cooldown per rule

  /**
   * Evaluates machine telemetry against active rule thresholds
   */
  public static evaluateRules(machine: Machine, telemetry: TelemetryReading): Alert[] {
    const generatedAlerts: Alert[] = [];
    const nowMs = Date.now();

    // Rule 1: High Vibration Threshold (ISO 10816 Zone C/D)
    if (telemetry.vibration > 2.8) {
      const ruleKey = `${machine.id}_vibration_high`;
      if (!this.isSpamming(ruleKey, nowMs)) {
        const alert: Alert = {
          id: `ALT-VIB-${nowMs}`,
          timestamp: 'Just now',
          machineId: machine.id,
          machineName: machine.name,
          sensorId: 'SEN-V01',
          level: telemetry.vibration > 4.5 ? 'CRITICAL' : 'WARNING',
          title: `Elevated Vibration Velocity (${telemetry.vibration.toFixed(2)} mm/s RMS)`,
          message: `Tri-axial vibration sensor measured ${telemetry.vibration.toFixed(2)} mm/s RMS exceeding ISO 10816 Zone A boundary (2.3 mm/s).`,
          ruleTrigger: 'vibration_rms > 2.8 mm/s',
          value: `${telemetry.vibration.toFixed(2)} mm/s`,
          threshold: '> 2.80 mm/s',
          acknowledged: false,
          resolved: false,
        };
        db.alerts.unshift(alert);
        generatedAlerts.push(alert);
        this.recentAlertTimestamps[ruleKey] = nowMs;
      }
    }

    // Rule 2: High Temperature
    if (telemetry.temperature > 75.0) {
      const ruleKey = `${machine.id}_temperature_high`;
      if (!this.isSpamming(ruleKey, nowMs)) {
        const alert: Alert = {
          id: `ALT-TMP-${nowMs}`,
          timestamp: 'Just now',
          machineId: machine.id,
          machineName: machine.name,
          sensorId: 'SEN-T01',
          level: telemetry.temperature > 85.0 ? 'CRITICAL' : 'WARNING',
          title: `High Bearing Thermal Rise (${telemetry.temperature.toFixed(1)} °C)`,
          message: `Stator/bearing housing temperature reached ${telemetry.temperature.toFixed(1)} °C, exceeding continuous operating thermal limit.`,
          ruleTrigger: 'temperature > 75.0 °C',
          value: `${telemetry.temperature.toFixed(1)} °C`,
          threshold: '> 75.0 °C',
          acknowledged: false,
          resolved: false,
        };
        db.alerts.unshift(alert);
        generatedAlerts.push(alert);
        this.recentAlertTimestamps[ruleKey] = nowMs;
      }
    }

    // Keep alert buffer bounded
    if (db.alerts.length > 200) {
      db.alerts = db.alerts.slice(0, 200);
    }

    return generatedAlerts;
  }

  private static isSpamming(key: string, nowMs: number): boolean {
    const last = this.recentAlertTimestamps[key];
    return last !== undefined && nowMs - last < this.COOLDOWN_MS;
  }
}
