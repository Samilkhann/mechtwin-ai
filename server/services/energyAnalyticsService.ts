/**
 * MECHTWIN AI — Energy Analytics & Sustainability Service
 * Real-time power, energy integration, utility costs, and carbon metrics
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import { EnergyAnalytics, Machine } from '../../src/types';

export class EnergyAnalyticsService {
  /**
   * Computes energy metrics for a given machine based on current and historical telemetry
   */
  public static getEnergyAnalytics(machine: Machine): EnergyAnalytics {
    const powerKW = machine.latestTelemetry.power;
    const rateUSD = machine.energyCostPerKWh || 0.14;

    // Daily energy (assuming 18 hours effective duty cycle / day)
    const dailyKWh = parseFloat((powerKW * 18.2).toFixed(1));
    const weeklyKWh = parseFloat((dailyKWh * 6.5).toFixed(1));
    const monthlyKWh = parseFloat((dailyKWh * 28.5).toFixed(1));

    const totalDailyCostUSD = parseFloat((dailyKWh * rateUSD).toFixed(2));
    const totalMonthlyCostUSD = parseFloat((monthlyKWh * rateUSD).toFixed(2));

    // Carbon intensity: 0.42 kg CO2e per kWh (US industrial average grid mix)
    const carbonEmissionsKg = parseFloat((dailyKWh * 0.42).toFixed(1));

    // Baseline comparison
    const baselinePowerKW = machine.ratedPowerKW * 0.75;
    const baselineDeviationPct = parseFloat(
      (((powerKW - baselinePowerKW) / baselinePowerKW) * 100).toFixed(1)
    );

    return {
      machineId: machine.id,
      instantaneousPowerKW: powerKW,
      dailyEnergyKWh: dailyKWh,
      weeklyEnergyKWh: weeklyKWh,
      monthlyEnergyKWh: monthlyKWh,
      energyCostRateUSD: rateUSD,
      totalDailyCostUSD,
      totalMonthlyCostUSD,
      efficiencyPct: machine.latestTelemetry.efficiency,
      baselineDeviationPct,
      carbonEmissionsKg,
    };
  }
}
