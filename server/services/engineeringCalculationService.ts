/**
 * MECHTWIN AI — Engineering Calculation Engine
 * Transparent, step-by-step SI mechanical, hydraulic & thermal solvers
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

export interface CalculationRequest {
  calculationId: string;
  inputs: Record<string, number>;
}

export interface CalculationResult {
  calculationId: string;
  title: string;
  category: string;
  formulaLaTeX: string;
  inputs: Record<string, number>;
  result: number;
  unit: string;
  steps: string[];
  substitution: string;
  interpretation: string;
  isoClass?: string;
  calculatedAt: string;
}

export class EngineeringCalculationService {
  /**
   * Solves any registered engineering calculation with transparent math
   */
  public static solve(req: CalculationRequest): CalculationResult {
    const { calculationId, inputs } = req;

    switch (calculationId) {
      // 1. Shaft Power & Torque (P = T * omega)
      case 'calc-power-torque': {
        const rpm = inputs.rpm ?? 1480;
        const torque = inputs.torque ?? 142.0;
        const omega = (2 * Math.PI * rpm) / 60;
        const powerW = torque * omega;
        const powerKW = powerW / 1000;
        const hp = powerKW * 1.34102;

        return {
          calculationId,
          title: 'Shaft Power & Mechanical Torque Solver',
          category: 'Rotational Mechanics',
          formulaLaTeX: 'P = T \\cdot \\omega = \\frac{2\\pi \\cdot N \\cdot T}{60\\,000}',
          inputs: { rpm, torque },
          result: parseFloat(powerKW.toFixed(2)),
          unit: 'kW',
          steps: [
            `Angular Velocity $\\omega = \\frac{2 \\times \\pi \\times ${rpm}}{60} = ${omega.toFixed(2)}$ rad/s`,
            `Power (Watts) $P = ${torque} \\text{ N·m} \\times ${omega.toFixed(2)} \\text{ rad/s} = ${powerW.toFixed(1)}$ W`,
            `Power (kW) $P = \\frac{${powerW.toFixed(1)}}{1000} = ${powerKW.toFixed(2)}$ kW (${hp.toFixed(2)} HP)`,
          ],
          substitution: `P = (${torque} N·m) × (2π × ${rpm} / 60) / 1000 = ${powerKW.toFixed(2)} kW`,
          interpretation: `At ${rpm} RPM with ${torque} N·m of transmitted torque, the drivetrain delivers ${powerKW.toFixed(2)} kW (${hp.toFixed(2)} HP) of mechanical power.`,
          calculatedAt: new Date().toISOString(),
        };
      }

      // 2. Centrifugal Pump Hydraulic Power & Efficiency
      case 'calc-pump-efficiency': {
        const flowM3H = inputs.flowM3H ?? 68.4;
        const headM = inputs.headM ?? 45.0;
        const density = inputs.density ?? 1000.0;
        const shaftPowerKW = inputs.shaftPowerKW ?? 11.2;
        const g = 9.80665;

        // P_hyd = (rho * g * Q * H) / 3.6e6
        const hydPowerKW = (density * g * flowM3H * headM) / 3.6e6;
        const efficiency = (hydPowerKW / shaftPowerKW) * 100;

        return {
          calculationId,
          title: 'Centrifugal Pump Hydraulic Power & Efficiency',
          category: 'Hydraulics & Turbomachinery',
          formulaLaTeX: 'P_{hyd} = \\frac{\\rho \\cdot g \\cdot Q \\cdot H}{3.6 \\times 10^6}, \\quad \\eta = \\frac{P_{hyd}}{P_{shaft}} \\times 100\\%',
          inputs: { flowM3H, headM, density, shaftPowerKW },
          result: parseFloat(efficiency.toFixed(1)),
          unit: '% Efficiency',
          steps: [
            `Hydraulic Power $P_{hyd} = \\frac{${density} \\times 9.81 \\times ${flowM3H} \\times ${headM}}{3,600,000} = ${hydPowerKW.toFixed(2)}$ kW`,
            `Hydraulic Efficiency $\\eta = \\frac{${hydPowerKW.toFixed(2)} \\text{ kW}}{${shaftPowerKW} \\text{ kW}} \\times 100\\% = ${efficiency.toFixed(1)}\\%$`,
          ],
          substitution: `η = (${hydPowerKW.toFixed(2)} kW / ${shaftPowerKW} kW) × 100% = ${efficiency.toFixed(1)}%`,
          interpretation: `Hydraulic power delivered to the fluid is ${hydPowerKW.toFixed(2)} kW. Overall pumping efficiency is ${efficiency.toFixed(1)}% (${efficiency >= 85 ? 'Excellent BEP operating condition' : efficiency >= 75 ? 'Acceptable industrial range' : 'Low efficiency - check for impeller wear or throttling losses'}).`,
          calculatedAt: new Date().toISOString(),
        };
      }

      // 3. ISO 281 Rolling Bearing L10h Rating Life
      case 'calc-bearing-l10': {
        const dynamicRatingC = inputs.dynamicRatingC ?? 32.5; // kN
        const equivalentLoadP = inputs.equivalentLoadP ?? 6.8; // kN
        const rpm = inputs.rpm ?? 1480;
        const bearingType = inputs.bearingType ?? 1; // 1 = Ball, 2 = Roller

        const p = bearingType === 2 ? 10 / 3 : 3;
        const l10Millions = (dynamicRatingC / equivalentLoadP) ** p;
        const l10Hours = (l10Millions * 1e6) / (60 * rpm);
        const l10Years = l10Hours / 8760;

        return {
          calculationId,
          title: 'ISO 281 Rolling Bearing L10 Basic Rating Life',
          category: 'Bearing Life',
          formulaLaTeX: 'L_{10h} = \\left( \\frac{C}{P} \\right)^p \\times \\frac{10^6}{60 \\cdot N}',
          inputs: { dynamicRatingC, equivalentLoadP, rpm, bearingType },
          result: Math.round(l10Hours),
          unit: 'Operating Hours',
          steps: [
            `Load Life Exponent $p = ${p.toFixed(2)}$ (${bearingType === 2 ? 'Roller Bearing' : 'Ball Bearing'})`,
            `Life in Revolutions $L_{10} = \\left(\\frac{${dynamicRatingC}\\text{ kN}}{${equivalentLoadP}\\text{ kN}}\\right)^{${p.toFixed(2)}} = ${l10Millions.toFixed(1)}$ Million Revs`,
            `Rating Life in Hours $L_{10h} = \\frac{${l10Millions.toFixed(1)} \\times 10^6}{60 \\times ${rpm}} = ${Math.round(l10Hours).toLocaleString()}$ hrs (${l10Years.toFixed(1)} years 24/7)`,
          ],
          substitution: `L_10h = (${dynamicRatingC} / ${equivalentLoadP})^${p.toFixed(2)} × 10^6 / (60 × ${rpm}) = ${Math.round(l10Hours)} hours`,
          interpretation: `Under an equivalent radial load of ${equivalentLoadP} kN at ${rpm} RPM, the bearing has an ISO 281 rating life of ${Math.round(l10Hours).toLocaleString()} hours (${l10Years.toFixed(1)} years continuous duty) with 90% statistical survival probability.`,
          calculatedAt: new Date().toISOString(),
        };
      }

      // 4. Solid Shaft Torsional Shear Stress & Safety Factor
      case 'calc-shaft-stress': {
        const torqueNm = inputs.torqueNm ?? 142.0;
        const shaftDiameterMm = inputs.shaftDiameterMm ?? 45.0;
        const yieldStrengthMPa = inputs.yieldStrengthMPa ?? 650.0;

        const dMeters = shaftDiameterMm / 1000;
        const polarSectionModulusWp = (Math.PI * (dMeters ** 3)) / 16;
        const shearStressPa = torqueNm / polarSectionModulusWp;
        const shearStressMPa = shearStressPa / 1e6;
        const allowableShearYieldMPa = 0.577 * yieldStrengthMPa; // von Mises
        const factorOfSafety = allowableShearYieldMPa / shearStressMPa;

        return {
          calculationId,
          title: 'Solid Circular Shaft Torsional Shear Stress & Safety Factor',
          category: 'Stress & Safety',
          formulaLaTeX: '\\tau = \\frac{16 \\cdot T}{\\pi \\cdot d^3}, \\quad \\text{FoS} = \\frac{0.577 \\cdot S_y}{\\tau}',
          inputs: { torqueNm, shaftDiameterMm, yieldStrengthMPa },
          result: parseFloat(shearStressMPa.toFixed(2)),
          unit: 'MPa',
          steps: [
            `Polar Section Modulus $W_p = \\frac{\\pi \\times (${shaftDiameterMm}\\text{ mm})^3}{16} = ${(polarSectionModulusWp * 1e6).toFixed(1)}$ mm³`,
            `Torsional Shear Stress $\\tau = \\frac{16 \\times ${torqueNm} \\times 10^3}{\\pi \\times (${shaftDiameterMm})^3} = ${shearStressMPa.toFixed(2)}$ MPa`,
            `von Mises Shear Yield $\\tau_{yield} = 0.577 \\times ${yieldStrengthMPa} = ${allowableShearYieldMPa.toFixed(1)}$ MPa`,
            `Factor of Safety $\\text{FoS} = \\frac{${allowableShearYieldMPa.toFixed(1)}}{${shearStressMPa.toFixed(2)}} = ${factorOfSafety.toFixed(2)}$`,
          ],
          substitution: `τ = 16 × ${torqueNm} / (π × 0.045³) = ${shearStressMPa.toFixed(2)} MPa; FoS = ${allowableShearYieldMPa.toFixed(1)} / ${shearStressMPa.toFixed(2)} = ${factorOfSafety.toFixed(2)}`,
          interpretation: `Max torsional shear stress on shaft surface is ${shearStressMPa.toFixed(2)} MPa. Factor of safety is ${factorOfSafety.toFixed(2)} (${factorOfSafety >= 2.5 ? 'Conservative industrial safety margin' : factorOfSafety >= 1.5 ? 'Standard engineering margin' : 'Deficient FoS - risk of torsional fatigue failure'}).`,
          calculatedAt: new Date().toISOString(),
        };
      }

      // 5. ISO 10816-3 Vibration Severity Evaluator
      case 'calc-iso-vibration': {
        const vibVelocity = inputs.vibVelocity ?? 3.4;
        const machineClass = inputs.machineClass ?? 2; // 2 = Medium 15-75kW

        let zone = 'Zone A (Good)';
        let description = 'Newly commissioned machines; fully acceptable for unrestricted long-term continuous operation.';

        if (machineClass === 2) {
          if (vibVelocity <= 1.4) zone = 'Zone A (Good)';
          else if (vibVelocity <= 2.8) {
            zone = 'Zone B (Acceptable)';
            description = 'Unrestricted long-term continuous industrial operation.';
          } else if (vibVelocity <= 4.5) {
            zone = 'Zone C (Unsatisfactory / Warning)';
            description = 'Not suitable for continuous long-term operation; machine may run for limited time until remedial maintenance.';
          } else {
            zone = 'Zone D (Damaging / Critical)';
            description = 'Severe vibration sufficient to cause catastrophic mechanical damage. Immediate shutdown & inspection required.';
          }
        }

        return {
          calculationId,
          title: 'ISO 10816-3 Vibration Severity Evaluator',
          category: 'Vibration & ISO Standards',
          formulaLaTeX: 'v_{RMS} = \\sqrt{\\frac{1}{T} \\int_0^T v(t)^2 \\, dt} \\quad [\\text{mm/s RMS}]',
          inputs: { vibVelocity, machineClass },
          result: vibVelocity,
          unit: 'mm/s RMS',
          isoClass: zone,
          steps: [
            `ISO 10816-3 Machine Classification: Class II (Medium Machinery 15 kW - 75 kW)`,
            `Measured Vibration Velocity: ${vibVelocity.toFixed(2)} mm/s RMS`,
            `Assigned Severity Zone: ${zone}`,
          ],
          substitution: `Zone evaluated for Class II @ ${vibVelocity} mm/s RMS → ${zone}`,
          interpretation: `${zone}: ${description}`,
          calculatedAt: new Date().toISOString(),
        };
      }

      // 6. Electric Energy Consumption & Annual Cost
      case 'calc-energy-cost': {
        const powerKW = inputs.powerKW ?? 17.6;
        const operatingHoursPerYear = inputs.operatingHoursPerYear ?? 6000;
        const costPerKWh = inputs.costPerKWh ?? 0.14;
        const carbonIntensityKgPerKWh = inputs.carbonIntensityKgPerKWh ?? 0.42;

        const annualKWh = powerKW * operatingHoursPerYear;
        const annualCostUSD = annualKWh * costPerKWh;
        const annualCarbonKg = annualKWh * carbonIntensityKgPerKWh;

        return {
          calculationId,
          title: 'Industrial Energy Consumption & Operating Cost Solver',
          category: 'Energy & Electrical',
          formulaLaTeX: 'E = P \\cdot t, \\quad \\text{Cost} = E \\cdot \\text{Rate}, \\quad \\text{Carbon} = E \\cdot I_{carbon}',
          inputs: { powerKW, operatingHoursPerYear, costPerKWh, carbonIntensityKgPerKWh },
          result: Math.round(annualCostUSD),
          unit: 'USD / Year',
          steps: [
            `Annual Energy Consumed $E = ${powerKW} \\text{ kW} \\times ${operatingHoursPerYear} \\text{ hrs} = ${Math.round(annualKWh).toLocaleString()}$ kWh/yr`,
            `Annual Electricity Cost $= ${Math.round(annualKWh).toLocaleString()} \\text{ kWh} \\times \\$${costPerKWh}/\\text{kWh} = \\$${Math.round(annualCostUSD).toLocaleString()}$/yr`,
            `Annual Carbon Footprint $= ${Math.round(annualKWh).toLocaleString()} \\times ${carbonIntensityKgPerKWh} = ${Math.round(annualCarbonKg).toLocaleString()}$ kg CO₂e`,
          ],
          substitution: `Annual Cost = (${powerKW} kW × ${operatingHoursPerYear} h) × $${costPerKWh} = $${Math.round(annualCostUSD)}`,
          interpretation: `Machine consumes ${Math.round(annualKWh).toLocaleString()} kWh annually, generating an operational energy cost of $${Math.round(annualCostUSD).toLocaleString()}/year and ${Math.round(annualCarbonKg / 1000)} metric tons of CO₂.`,
          calculatedAt: new Date().toISOString(),
        };
      }

      default:
        throw new Error(`Unknown calculation ID: ${calculationId}`);
    }
  }
}
