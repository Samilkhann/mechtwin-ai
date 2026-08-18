/**
 * MECHTWIN AI — Machine Health Engine
 * Transparent 0-100 score computation with factor weights and delta explanations
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import { MachineHealthBreakdown, MachineHealthFactor, MachineStatus, TelemetryReading } from '../../src/types';

export class MachineHealthService {
  /**
   * Computes transparent machine health score with delta explanation
   */
  public static calculateHealth(
    telemetry: TelemetryReading,
    ratedPowerKW: number,
    previousScore?: number
  ): MachineHealthBreakdown {
    const factors: MachineHealthFactor[] = [];
    let totalScore = 0;

    // Factor 1: Vibration Velocity (ISO 10816-3) - Weight 35%
    // Zone A: <= 2.3 mm/s (Score 95-100)
    // Zone B: 2.3 - 4.5 mm/s (Score 70-94)
    // Zone C: 4.5 - 7.1 mm/s (Score 40-69)
    // Zone D: > 7.1 mm/s (Score 0-39)
    const vib = telemetry.vibration;
    let vibScore = 100;
    let vibStatus: 'Optimal' | 'Degraded' | 'Critical' = 'Optimal';
    let vibDesc = 'Zone A - newly commissioned tolerance.';

    if (vib <= 2.3) {
      vibScore = Math.max(90, 100 - (vib / 2.3) * 10);
      vibStatus = 'Optimal';
    } else if (vib <= 4.5) {
      vibScore = Math.max(70, 90 - ((vib - 2.3) / 2.2) * 20);
      vibStatus = 'Degraded';
      vibDesc = 'Zone B/C - elevated harmonic energy observed.';
    } else if (vib <= 7.1) {
      vibScore = Math.max(40, 70 - ((vib - 4.5) / 2.6) * 30);
      vibStatus = 'Critical';
      vibDesc = 'Zone C - unsatisfactory vibration level requiring maintenance.';
    } else {
      vibScore = Math.max(10, 40 - (vib - 7.1) * 8);
      vibStatus = 'Critical';
      vibDesc = 'Zone D - dangerous vibration levels causing rapid fatigue failure.';
    }

    const vibWeight = 0.35;
    const vibImpact = parseFloat(((100 - vibScore) * vibWeight).toFixed(1));
    totalScore += vibScore * vibWeight;

    factors.push({
      name: 'Vibration Velocity (ISO 10816-3)',
      weight: vibWeight,
      score: Math.round(vibScore),
      value: `${vib.toFixed(2)} mm/s RMS`,
      benchmark: '< 2.30 mm/s (Zone A)',
      status: vibStatus,
      impact: vibImpact,
      description: vibDesc,
    });

    // Factor 2: Thermal Rise (IEC 60034-1) - Weight 25%
    const temp = telemetry.temperature;
    let tempScore = 100;
    let tempStatus: 'Optimal' | 'Degraded' | 'Critical' = 'Optimal';
    let tempDesc = 'Class F insulation operating well within safe thermal limits.';

    if (temp <= 65) {
      tempScore = 98;
      tempStatus = 'Optimal';
    } else if (temp <= 75) {
      tempScore = Math.max(80, 98 - ((temp - 65) / 10) * 18);
      tempStatus = 'Optimal';
      tempDesc = 'Moderate thermal rise under sustained production load.';
    } else if (temp <= 85) {
      tempScore = Math.max(55, 80 - ((temp - 75) / 10) * 25);
      tempStatus = 'Degraded';
      tempDesc = 'Elevated temperature accelerating lubricant oxidation.';
    } else {
      tempScore = Math.max(15, 55 - ((temp - 85) / 15) * 40);
      tempStatus = 'Critical';
      tempDesc = 'Dangerous overheating exceeding thermal class safety margins.';
    }

    const tempWeight = 0.25;
    const tempImpact = parseFloat(((100 - tempScore) * tempWeight).toFixed(1));
    totalScore += tempScore * tempWeight;

    factors.push({
      name: 'Thermal Rise (IEC 60034-1)',
      weight: tempWeight,
      score: Math.round(tempScore),
      value: `${temp.toFixed(1)} °C`,
      benchmark: '< 75.0 °C',
      status: tempStatus,
      impact: tempImpact,
      description: tempDesc,
    });

    // Factor 3: Bearing Life & Dynamic Fatigue (ISO 281) - Weight 20%
    const rulDays = telemetry.remainingUsefulLifeDays;
    let rulScore = 100;
    let rulStatus: 'Optimal' | 'Degraded' | 'Critical' = 'Optimal';
    let rulDesc = 'Minimal dynamic fatigue wear on raceways.';

    if (rulDays >= 90) {
      rulScore = 95;
      rulStatus = 'Optimal';
    } else if (rulDays >= 45) {
      rulScore = Math.max(75, 95 - ((90 - rulDays) / 45) * 20);
      rulStatus = 'Degraded';
      rulDesc = 'Progressive sub-surface spalling on drive-end bearing.';
    } else if (rulDays >= 14) {
      rulScore = Math.max(45, 75 - ((45 - rulDays) / 31) * 30);
      rulStatus = 'Degraded';
      rulDesc = 'Accelerated raceway damage approaching failure window.';
    } else {
      rulScore = Math.max(10, 45 - ((14 - rulDays) / 14) * 35);
      rulStatus = 'Critical';
      rulDesc = 'Imminent mechanical fatigue failure.';
    }

    const rulWeight = 0.20;
    const rulImpact = parseFloat(((100 - rulScore) * rulWeight).toFixed(1));
    totalScore += rulScore * rulWeight;

    factors.push({
      name: 'Bearing Kinematic Life (ISO 281)',
      weight: rulWeight,
      score: Math.round(rulScore),
      value: `${rulDays} days RUL (Est)`,
      benchmark: '> 90 days',
      status: rulStatus,
      impact: rulImpact,
      description: rulDesc,
    });

    // Factor 4: Operating Efficiency (BEP) - Weight 20%
    const eff = telemetry.efficiency;
    let effScore = 100;
    let effStatus: 'Optimal' | 'Degraded' | 'Critical' = 'Optimal';
    let effDesc = 'Operating within 3% of Best Efficiency Point (BEP).';

    if (eff >= 88) {
      effScore = 96;
      effStatus = 'Optimal';
    } else if (eff >= 84) {
      effScore = Math.max(80, 96 - ((88 - eff) / 4) * 16);
      effStatus = 'Degraded';
      effDesc = 'Minor hydrodynamic friction & hydraulic recirculation losses.';
    } else {
      effScore = Math.max(30, 80 - ((84 - eff) / 10) * 50);
      effStatus = 'Critical';
      effDesc = 'Severe throttling or mechanical drag reducing energy efficiency.';
    }

    const effWeight = 0.20;
    const effImpact = parseFloat(((100 - effScore) * effWeight).toFixed(1));
    totalScore += effScore * effWeight;

    factors.push({
      name: 'Operating Efficiency (BEP)',
      weight: effWeight,
      score: Math.round(effScore),
      value: `${eff.toFixed(1)}%`,
      benchmark: '> 88.0%',
      status: effStatus,
      impact: effImpact,
      description: effDesc,
    });

    const overallScore = Math.max(5, Math.min(99, Math.round(totalScore)));

    let status: MachineStatus = 'NORMAL';
    if (overallScore < 50) {
      status = 'CRITICAL';
    } else if (overallScore < 75) {
      status = 'WARNING';
    }

    // Delta explanation
    let deltaReason = 'Operating health is nominal and stable.';
    if (previousScore !== undefined && previousScore !== overallScore) {
      const diff = overallScore - previousScore;
      if (diff < 0) {
        const topDeductions = [...factors].sort((a, b) => b.impact - a.impact);
        deltaReason = `Health decreased from ${previousScore} → ${overallScore} primarily due to elevated ${topDeductions[0].name} (${topDeductions[0].value}).`;
      } else {
        deltaReason = `Health improved from ${previousScore} → ${overallScore} following operational normalization.`;
      }
    }

    return {
      overallScore,
      previousScore: previousScore ?? overallScore,
      deltaReason,
      status,
      factors,
      computedAt: new Date().toISOString(),
    };
  }
}
