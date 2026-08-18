/**
 * MechTwin AI - Industrial Machine Catalog & Baseline Telemetry Dataset
 */

import { EngineeringCalculation, Machine, MaintenanceTask, SystemAlert } from '../types';
import { calculateMachineHealth } from '../services/healthScorer';

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'MT-001',
    name: 'Heavy-Duty Centrifugal Slurry Pump',
    tag: 'PUMP-SLURRY-01A',
    type: 'Centrifugal Pump & Electric Motor Assembly',
    manufacturer: 'Flowserve / Grundfos Industrial',
    model: 'ISO-2858 Heavy-Process 100-65-200',
    serialNumber: 'FS-2024-8849-B',
    location: 'Process Bay 03 - Water Treatment Facility',
    installationDate: '2023-04-15',
    operatingHours: 14820,
    status: 'NORMAL',
    ratedPowerKW: 22.0,
    ratedRPM: 1480,
    ratedVoltageV: 400,
    ratedCurrentA: 41.5,
    ratedFlowLPM: 1200,
    ratedHeadMeters: 45.0,
    mtbfHours: 25000,
    energyCostPerKWh: 0.14,
    components: [
      {
        id: 'motor',
        name: 'Electric Motor (TEFC 3-Phase Induction)',
        type: 'motor',
        temperature: 68.2,
        vibration: 2.1,
        condition: 'NORMAL',
        estimatedLifeDays: 450,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-06-10',
        material: 'Cast Iron Frame (IEC 180M), Copper Windings Class F',
        specifications: { 'Rated Power': '22 kW', 'Synchronous Speed': '1500 RPM', 'Poles': 4, 'Efficiency': 'IE3 Premium (93.0%)' },
        highlightColor: '#0284c7',
        position3D: [-2.2, 0, 0]
      },
      {
        id: 'bearing_de',
        name: 'Drive-End Bearing (DE Deep Groove)',
        type: 'bearing_de',
        temperature: 71.4,
        vibration: 3.4,
        condition: 'WARNING',
        estimatedLifeDays: 31,
        riskLevel: 'Medium',
        operatingHours: 14820,
        lastInspected: '2024-05-22',
        material: 'High-Carbon Chromium Steel (SKF 6208-2Z/C3)',
        specifications: { 'Dynamic Load (C)': '32.5 kN', 'Limiting Speed': '11000 RPM', 'Defect Frequency (BPFO)': '105.8 Hz' },
        highlightColor: '#f59e0b',
        position3D: [-1.2, 0, 0]
      },
      {
        id: 'bearing_nde',
        name: 'Non-Drive End Bearing (NDE)',
        type: 'bearing_nde',
        temperature: 64.0,
        vibration: 1.8,
        condition: 'NORMAL',
        estimatedLifeDays: 380,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-05-22',
        material: 'Deep Groove Ball Bearing (SKF 6206)',
        specifications: { 'Dynamic Load (C)': '20.3 kN', 'Limiting Speed': '14000 RPM' },
        highlightColor: '#10b981',
        position3D: [-3.1, 0, 0]
      },
      {
        id: 'coupling',
        name: 'Flexible Elastomeric Jaw Coupling',
        type: 'coupling',
        temperature: 58.5,
        vibration: 2.8,
        condition: 'NORMAL',
        estimatedLifeDays: 290,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-04-18',
        material: 'Forged Steel Hubs with Polyurethane Spider Insert (Shore 98A)',
        specifications: { 'Nominal Torque': '250 N·m', 'Max Angular Misalignment': '1.0°', 'Max Radial Offset': '0.3 mm' },
        highlightColor: '#06b6d4',
        position3D: [-0.4, 0, 0]
      },
      {
        id: 'shaft',
        name: 'High-Tensile Precision Drive Shaft',
        type: 'shaft',
        temperature: 59.2,
        vibration: 2.3,
        condition: 'NORMAL',
        estimatedLifeDays: 720,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-03-12',
        material: 'AISI 4140 Quenched & Tempered Alloy Steel',
        specifications: { 'Shaft Diameter': '45.0 mm', 'Runout Tolerance': '< 0.02 mm', 'Torsional Yield': '650 MPa' },
        highlightColor: '#3b82f6',
        position3D: [0.3, 0, 0]
      },
      {
        id: 'casing',
        name: 'Volute Pump Casing & Frame',
        type: 'casing',
        temperature: 52.0,
        vibration: 1.9,
        condition: 'NORMAL',
        estimatedLifeDays: 950,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-02-10',
        material: 'Ductile Iron (EN-GJS-400-15)',
        specifications: { 'Design Pressure': '16 bar', 'Hydrostatic Test': '24 bar', 'Flange Standard': 'EN 1092-2 PN16' },
        highlightColor: '#6366f1',
        position3D: [1.4, 0, 0]
      },
      {
        id: 'impeller',
        name: 'Enclosed 6-Vane Radial Impeller',
        type: 'impeller',
        temperature: 54.0,
        vibration: 2.2,
        condition: 'NORMAL',
        estimatedLifeDays: 310,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-02-10',
        material: 'Stainless Steel (ASTM A743 Grade CF8M / SS316)',
        specifications: { 'Impeller Diameter': '205 mm', 'Specific Speed': '28 rpm·m³/s', 'Balance Quality': 'ISO G2.5' },
        highlightColor: '#8b5cf6',
        position3D: [1.4, 0, 0]
      },
      {
        id: 'seal',
        name: 'Cartridge Mechanical Face Seal (Plan 11)',
        type: 'seal',
        temperature: 63.8,
        vibration: 2.4,
        condition: 'NORMAL',
        estimatedLifeDays: 160,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-04-02',
        material: 'Silicon Carbide (SiC) vs Carbon Faces, FKM Elastomers',
        specifications: { 'Barrier Pressure': '8 bar', 'Max Temperature': '160 °C', 'Leakage Limit': '< 5 ml/hr' },
        highlightColor: '#ec4899',
        position3D: [0.8, 0, 0]
      },
      {
        id: 'pipe_inlet',
        name: 'Suction Inlet Flange & Strainer (DN100)',
        type: 'pipe_inlet',
        temperature: 28.0,
        vibration: 1.2,
        condition: 'NORMAL',
        estimatedLifeDays: 1200,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-01-20',
        material: 'Carbon Steel ASTM A106 Grade B',
        specifications: { 'Nominal Diameter': 'DN 100 (4")', 'Suction Velocity': '1.8 m/s' },
        highlightColor: '#14b8a6',
        position3D: [2.5, 0, 0]
      },
      {
        id: 'pipe_outlet',
        name: 'Discharge Outlet Nozzle (DN80)',
        type: 'pipe_outlet',
        temperature: 32.0,
        vibration: 1.6,
        condition: 'NORMAL',
        estimatedLifeDays: 1200,
        riskLevel: 'Low',
        operatingHours: 14820,
        lastInspected: '2024-01-20',
        material: 'Carbon Steel ASTM A106 Grade B',
        specifications: { 'Nominal Diameter': 'DN 80 (3")', 'Discharge Velocity': '3.2 m/s' },
        highlightColor: '#0ea5e9',
        position3D: [1.4, 1.6, 0]
      }
    ],
    sensors: [
      { id: 'SEN-T01', machineId: 'MT-001', name: 'DE Bearing Temperature PT100', type: 'temperature', unit: '°C', samplingRateHz: 10, status: 'ONLINE', minSafe: 20, maxSafe: 75, minWarning: 75, maxWarning: 90, currentValue: 68.2, location: 'Drive-End Bearing Housing' },
      { id: 'SEN-V01', machineId: 'MT-001', name: 'Tri-Axial Accelerometer (DE)', type: 'vibration', unit: 'mm/s RMS', samplingRateHz: 2560, status: 'ONLINE', minSafe: 0.1, maxSafe: 2.3, minWarning: 2.3, maxWarning: 4.5, currentValue: 3.4, location: 'Motor-Pump Flange DE' },
      { id: 'SEN-R01', machineId: 'MT-001', name: 'Optical Shaft Tachometer', type: 'rpm', unit: 'RPM', samplingRateHz: 50, status: 'ONLINE', minSafe: 1350, maxSafe: 1520, minWarning: 1300, maxWarning: 1550, currentValue: 1480, location: 'Coupling Guard' },
      { id: 'SEN-I01', machineId: 'MT-001', name: 'Current CT Transducer (Phase A/B/C)', type: 'current', unit: 'A', samplingRateHz: 100, status: 'ONLINE', minSafe: 15, maxSafe: 38, minWarning: 38, maxWarning: 44, currentValue: 34.8, location: 'Motor Junction Box' },
      { id: 'SEN-P01', machineId: 'MT-001', name: 'Active Power Meter (Modbus)', type: 'power', unit: 'kW', samplingRateHz: 10, status: 'ONLINE', minSafe: 5, maxSafe: 20, minWarning: 20, maxWarning: 23, currentValue: 17.6, location: 'VFD Feeder Panel' },
      { id: 'SEN-PI01', machineId: 'MT-001', name: 'Piezoelectric Suction Pressure Transducer', type: 'pressure_inlet', unit: 'bar', samplingRateHz: 20, status: 'ONLINE', minSafe: 0.8, maxSafe: 3.0, minWarning: 0.5, maxWarning: 0.8, currentValue: 1.25, location: 'Suction Spool Piece' },
      { id: 'SEN-PO01', machineId: 'MT-001', name: 'Discharge Pressure Transmitter', type: 'pressure_outlet', unit: 'bar', samplingRateHz: 20, status: 'ONLINE', minSafe: 3.5, maxSafe: 5.5, minWarning: 3.0, maxWarning: 6.0, currentValue: 4.65, location: 'Discharge Check Valve' },
      { id: 'SEN-F01', machineId: 'MT-001', name: 'Electromagnetic Flow Meter', type: 'flow', unit: 'L/min', samplingRateHz: 5, status: 'ONLINE', minSafe: 800, maxSafe: 1400, minWarning: 600, maxWarning: 1500, currentValue: 1140, location: 'Discharge Header' }
    ],
    latestTelemetry: {
      timestamp: Date.now(),
      temperature: 68.2,
      vibration: 3.4,
      vibrationPeak: 5.12,
      vibrationKurtosis: 3.85,
      rpm: 1480,
      current: 34.8,
      voltage: 400.2,
      power: 17.6,
      powerFactor: 0.88,
      pressureInlet: 1.25,
      pressureOutlet: 4.65,
      flowRate: 1140,
      torque: 113.5,
      efficiency: 87.4,
      healthScore: 84,
      failureProbability: 16,
      remainingUsefulLifeDays: 31
    },
    healthBreakdown: {
      overallScore: 84,
      status: 'WARNING',
      factors: []
    },
    activeFaults: [
      {
        id: 'fault-001',
        machineId: 'MT-001',
        faultType: 'Rolling Element Bearing Outer Race Degradation (BPFO)',
        probability: 78,
        severity: 'HIGH',
        affectedComponent: 'Drive-End Bearing (SKF 6208-2Z/C3)',
        componentId: 'bearing_de',
        evidence: [
          'Vibration RMS elevated to 3.40 mm/s (ISO 10816 Zone B boundary: 2.3 mm/s)',
          'Vibration Kurtosis increased to 3.85 indicating repetitive transient impacts',
          'Temperature increased by 9.4°C over steady-state baseline in past 72h',
          'Spectral peak detected at BPFO harmonic (105.8 Hz @ 1480 RPM)'
        ],
        recommendedAction: 'Perform high-frequency demodulation analysis, replenish lithium-complex synthetic grease, and prepare replacement SKF 6208 bearing kit within 72 operating hours.',
        maintenancePriority: 'P2 - Within 48h',
        estimatedTimeToFailureHours: 144,
        detectedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        isoStandardRef: 'ISO 10816-3 Class II / ISO 15243'
      }
    ]
  },
  {
    id: 'MT-002',
    name: 'High-Voltage Induction Motor',
    tag: 'MTR-FEED-02B',
    type: 'Three-Phase Squirrel Cage Induction Motor',
    manufacturer: 'Siemens Simotics',
    model: '1LE1503-2DB23-4AA4 (Frame 280M)',
    serialNumber: 'SIE-2023-99411',
    location: 'Boiler Feed Pumphouse Bay',
    installationDate: '2022-11-04',
    operatingHours: 19430,
    status: 'NORMAL',
    ratedPowerKW: 75.0,
    ratedRPM: 2980,
    ratedVoltageV: 400,
    ratedCurrentA: 132.0,
    mtbfHours: 35000,
    energyCostPerKWh: 0.14,
    components: [
      { id: 'motor_stator', name: 'Stator Core & VPI Windings', type: 'motor', temperature: 74.5, vibration: 1.4, condition: 'NORMAL', estimatedLifeDays: 520, riskLevel: 'Low', operatingHours: 19430, lastInspected: '2024-05-10', material: 'Silicon Steel Laminations & Form-Wound Copper', specifications: { 'Insulation Class': 'Class H (180°C)', 'Thermal Rise': 'Class B (80K)' } },
      { id: 'motor_rotor', name: 'Die-Cast Aluminum Rotor Cage', type: 'shaft', temperature: 78.0, vibration: 1.6, condition: 'NORMAL', estimatedLifeDays: 600, riskLevel: 'Low', operatingHours: 19430, lastInspected: '2024-05-10', material: 'Cast Copper/Aluminum with Keyed Shaft', specifications: { 'Critical Speed': '3600 RPM', 'Balance Grade': 'ISO G1.0' } }
    ],
    sensors: [
      { id: 'SEN-M2-T01', machineId: 'MT-002', name: 'Stator RTD Pt100 (U/V/W)', type: 'temperature', unit: '°C', samplingRateHz: 1, status: 'ONLINE', minSafe: 20, maxSafe: 110, minWarning: 110, maxWarning: 130, currentValue: 74.5, location: 'Stator Core Slot' },
      { id: 'SEN-M2-V01', machineId: 'MT-002', name: 'NDE Vibration Velocity Sensor', type: 'vibration', unit: 'mm/s RMS', samplingRateHz: 1000, status: 'ONLINE', minSafe: 0.1, maxSafe: 2.8, minWarning: 2.8, maxWarning: 4.5, currentValue: 1.45, location: 'NDE Bearing Cover' },
      { id: 'SEN-M2-I01', machineId: 'MT-002', name: 'Current CT Phase A/B/C', type: 'current', unit: 'A', samplingRateHz: 50, status: 'ONLINE', minSafe: 30, maxSafe: 125, minWarning: 125, maxWarning: 140, currentValue: 98.4, location: 'Switchgear Panel' },
      { id: 'SEN-M2-P01', machineId: 'MT-002', name: 'Power Quality Analyzer', type: 'power', unit: 'kW', samplingRateHz: 10, status: 'ONLINE', minSafe: 20, maxSafe: 70, minWarning: 70, maxWarning: 80, currentValue: 54.2, location: 'MCC Feeder 4' }
    ],
    latestTelemetry: {
      timestamp: Date.now(),
      temperature: 74.5,
      vibration: 1.45,
      vibrationPeak: 2.2,
      vibrationKurtosis: 2.98,
      rpm: 2980,
      current: 98.4,
      voltage: 400.0,
      power: 54.2,
      powerFactor: 0.91,
      pressureInlet: 0,
      pressureOutlet: 0,
      flowRate: 0,
      torque: 173.6,
      efficiency: 94.6,
      healthScore: 96,
      failureProbability: 4,
      remainingUsefulLifeDays: 340
    },
    healthBreakdown: { overallScore: 96, status: 'NORMAL', factors: [] },
    activeFaults: []
  },
  {
    id: 'MT-003',
    name: 'Helical Industrial Speed Reducer',
    tag: 'GBX-CONV-03',
    type: 'Two-Stage Helical Speed Reducer',
    manufacturer: 'SEW-Eurodrive',
    model: 'X2FS160 Helical Gear Unit (Ratio 5.12:1)',
    serialNumber: 'SEW-2022-7719',
    location: 'Overland Conveyor Drive Terminal',
    installationDate: '2022-08-19',
    operatingHours: 21850,
    status: 'WARNING',
    ratedPowerKW: 45.0,
    ratedRPM: 1750,
    ratedVoltageV: 400,
    ratedCurrentA: 78.0,
    mtbfHours: 30000,
    energyCostPerKWh: 0.14,
    components: [
      { id: 'pinion_gear', name: 'Input Helical Pinion Shaft (18 Teeth)', type: 'shaft', temperature: 76.2, vibration: 4.1, condition: 'WARNING', estimatedLifeDays: 45, riskLevel: 'Medium', operatingHours: 21850, lastInspected: '2024-03-14', material: 'Case-Hardened 18CrNiMo7-6 Steel', specifications: { 'Gear Quality': 'DIN 3962 Grade 5', 'Tooth Surface Hardness': '58-62 HRC' } },
      { id: 'gear_wheel', name: 'Intermediate Wheel (92 Teeth)', type: 'shaft', temperature: 69.5, vibration: 3.2, condition: 'NORMAL', estimatedLifeDays: 220, riskLevel: 'Low', operatingHours: 21850, lastInspected: '2024-03-14', material: 'Carburized Forged Steel', specifications: { 'Module': '4.5 mm', 'Helix Angle': '15.0°' } }
    ],
    sensors: [
      { id: 'SEN-G3-T01', machineId: 'MT-003', name: 'Sump Oil Temperature', type: 'temperature', unit: '°C', samplingRateHz: 1, status: 'ONLINE', minSafe: 30, maxSafe: 75, minWarning: 75, maxWarning: 88, currentValue: 76.2, location: 'Gearbox Sump Drain' },
      { id: 'SEN-G3-V01', machineId: 'MT-003', name: 'High-Frequency Gearmesh Accelerometer', type: 'vibration', unit: 'mm/s RMS', samplingRateHz: 5120, status: 'ONLINE', minSafe: 0.2, maxSafe: 3.0, minWarning: 3.0, maxWarning: 5.5, currentValue: 4.12, location: 'Pinion Input Bearing Housing' }
    ],
    latestTelemetry: {
      timestamp: Date.now(),
      temperature: 76.2,
      vibration: 4.12,
      vibrationPeak: 6.4,
      vibrationKurtosis: 4.1,
      rpm: 1750,
      current: 68.2,
      voltage: 400.0,
      power: 36.8,
      powerFactor: 0.86,
      pressureInlet: 0,
      pressureOutlet: 0,
      flowRate: 0,
      torque: 200.8,
      efficiency: 91.2,
      healthScore: 76,
      failureProbability: 24,
      remainingUsefulLifeDays: 45
    },
    healthBreakdown: { overallScore: 76, status: 'WARNING', factors: [] },
    activeFaults: [
      {
        id: 'fault-003',
        machineId: 'MT-003',
        faultType: 'Gearmesh Tooth Pitch Line Pitting & Lubricant Shear',
        probability: 72,
        severity: 'MEDIUM',
        affectedComponent: 'Input Helical Pinion Shaft (18 Teeth)',
        componentId: 'pinion_gear',
        evidence: [
          'Elevated Gearmesh Frequency (GMF = 525 Hz) sideband modulation',
          'Sump oil temperature reached 76.2°C with ISO VG 220 viscosity loss',
          'Iron particle count in oil laboratory test exceeded 120 ppm'
        ],
        recommendedAction: 'Perform offline filtration, top up with ISO VG 320 synthetic gear oil, and perform borescope gear tooth inspection.',
        maintenancePriority: 'P2 - Within 48h',
        estimatedTimeToFailureHours: 240,
        detectedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        isoStandardRef: 'AGMA 9005 / ISO 6336'
      }
    ]
  },
  {
    id: 'MT-004',
    name: 'Rotary Screw Air Compressor',
    tag: 'CMP-PLANT-04',
    type: 'Oil-Injected Rotary Twin-Screw Compressor',
    manufacturer: 'Atlas Copco',
    model: 'GA 37+ VSD Industrial Compressor',
    serialNumber: 'AC-2023-44120',
    location: 'Central Utility Building Utilities Hall',
    installationDate: '2023-01-12',
    operatingHours: 11200,
    status: 'NORMAL',
    ratedPowerKW: 37.0,
    ratedRPM: 3000,
    ratedVoltageV: 400,
    ratedCurrentA: 68.0,
    mtbfHours: 28000,
    energyCostPerKWh: 0.14,
    components: [
      { id: 'screw_male', name: 'Male Helical Screw Rotor (4 Lobes)', type: 'shaft', temperature: 84.0, vibration: 1.8, condition: 'NORMAL', estimatedLifeDays: 680, riskLevel: 'Low', operatingHours: 11200, lastInspected: '2024-04-10', material: 'Forged Carbon Steel with MoS2 Coating', specifications: { 'Rotor Length': '320 mm', 'Clearance': '0.04 mm' } },
      { id: 'screw_female', name: 'Female Helical Screw Rotor (6 Flutes)', type: 'shaft', temperature: 82.5, vibration: 1.6, condition: 'NORMAL', estimatedLifeDays: 680, riskLevel: 'Low', operatingHours: 11200, lastInspected: '2024-04-10', material: 'Forged Carbon Steel', specifications: { 'Lobe Ratio': '4:6', 'Max Tip Speed': '35 m/s' } }
    ],
    sensors: [
      { id: 'SEN-C4-T01', machineId: 'MT-004', name: 'Airend Discharge Temperature', type: 'temperature', unit: '°C', samplingRateHz: 1, status: 'ONLINE', minSafe: 65, maxSafe: 95, minWarning: 95, maxWarning: 105, currentValue: 84.0, location: 'Airend Outlet Manifold' },
      { id: 'SEN-C4-P01', machineId: 'MT-004', name: 'Discharge Air Pressure Transmitter', type: 'pressure_outlet', unit: 'bar', samplingRateHz: 10, status: 'ONLINE', minSafe: 6.5, maxSafe: 8.5, minWarning: 6.0, maxWarning: 9.0, currentValue: 7.8, location: 'Air Receiver Header' }
    ],
    latestTelemetry: {
      timestamp: Date.now(),
      temperature: 84.0,
      vibration: 1.85,
      vibrationPeak: 2.6,
      vibrationKurtosis: 3.02,
      rpm: 2850,
      current: 54.0,
      voltage: 400.0,
      power: 29.4,
      powerFactor: 0.89,
      pressureInlet: 1.0,
      pressureOutlet: 7.8,
      flowRate: 5800,
      torque: 98.5,
      efficiency: 92.4,
      healthScore: 94,
      failureProbability: 6,
      remainingUsefulLifeDays: 280
    },
    healthBreakdown: { overallScore: 94, status: 'NORMAL', factors: [] },
    activeFaults: []
  }
];

// Initialize health breakdown for all baseline machines
INITIAL_MACHINES.forEach(m => {
  m.healthBreakdown = calculateMachineHealth(m.latestTelemetry, m.ratedPowerKW, m.ratedRPM, m.operatingHours, m.mtbfHours);
});

export const INITIAL_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'wo-101',
    workOrderNumber: 'WO-2026-0842',
    machineId: 'MT-001',
    machineName: 'Heavy-Duty Centrifugal Slurry Pump',
    component: 'Drive-End Deep Groove Ball Bearing',
    title: 'Replace Drive-End Ball Bearing & Re-grease Assembly',
    description: 'Vibration monitoring detected BPFO fault pattern and elevated thermal rise. Remove coupling guard, extract SKF 6208 bearing, inspect shaft journal, fit new bearing with induction heater (110°C), and pack with synthetic grease.',
    priority: 'HIGH',
    assignedEngineer: 'Sarah Jenkins (Vibration Cat II Analyst)',
    dueDate: '2026-08-20',
    createdAt: '2026-08-16',
    status: 'IN_PROGRESS',
    estimatedHours: 4.5,
    actualHours: 1.5,
    requiredParts: [
      { partNumber: 'SKF-6208-2Z-C3', name: 'Deep Groove Ball Bearing 40x80x18mm', quantity: 1, inStock: true },
      { partNumber: 'KLUBER-SYN-GH6-100', name: 'Klübersynth GH 6-100 Synthetic Grease (400g)', quantity: 1, inStock: true },
      { partNumber: 'V-RING-VA40', name: 'NBR V-Ring Rotary Shaft Seal', quantity: 1, inStock: true }
    ],
    checklist: [
      { id: 'c1', text: 'Lockout/Tagout (LOTO) electrical breaker and verify zero voltage', completed: true },
      { id: 'c2', text: 'Drain pump volute casing and isolate suction/discharge valves', completed: true },
      { id: 'c3', text: 'Perform baseline dial indicator shaft runout measurement', completed: false },
      { id: 'c4', text: 'Disassemble motor-pump coupling and extract old bearing', completed: false },
      { id: 'c5', text: 'Induction heat new SKF 6208 bearing to 110°C and mount on shaft', completed: false },
      { id: 'c6', text: 'Laser align shafts to < 0.05 mm radial & < 0.04 mm angular tolerance', completed: false },
      { id: 'c7', text: 'Post-overhaul vibration signature bump test', completed: false }
    ],
    notes: [
      'LOTO confirmed on Feeder MCC-03 at 08:30.',
      'Suction isolation valves tagged and locked.',
      'Spare bearing SKF 6208 verified in warehouse bin A4-12.'
    ]
  },
  {
    id: 'wo-102',
    workOrderNumber: 'WO-2026-0799',
    machineId: 'MT-003',
    machineName: 'Helical Industrial Speed Reducer',
    component: 'Helical Pinion Gear & Sump Oil',
    title: 'Oil Sampling Analysis & Kidney-Loop Offline Filtration',
    description: 'Elevated gearmesh frequency vibration. Connect portable 3-micron offline filtration unit to gearbox sump for 12 hours. Extract 250ml sample for ferrography and viscosity testing.',
    priority: 'MEDIUM',
    assignedEngineer: 'David Chen (Reliability Specialist)',
    dueDate: '2026-08-22',
    createdAt: '2026-08-15',
    status: 'PENDING',
    estimatedHours: 3.0,
    requiredParts: [
      { partNumber: 'MOBIL-SHC-632', name: 'Mobil SHC 632 Synthetic Gear Oil (20L)', quantity: 1, inStock: true },
      { partNumber: 'DES-CASE-DC-2', name: 'Desiccant Breather Standard Unit', quantity: 1, inStock: true }
    ],
    checklist: [
      { id: 'c21', text: 'Connect suction and discharge quick-disconnects to sump', completed: false },
      { id: 'c22', text: 'Run 3-micron filter cart for 12 hours continuous circulation', completed: false },
      { id: 'c23', text: 'Draw bottle sample per ISO 4021 sampling standard', completed: false },
      { id: 'c24', text: 'Replace spent desiccant breather cartridge', completed: false }
    ],
    notes: []
  },
  {
    id: 'wo-103',
    workOrderNumber: 'WO-2026-0710',
    machineId: 'MT-002',
    machineName: 'High-Voltage Induction Motor',
    component: 'Stator Windings & Insulation',
    title: 'Quarterly Offline Megger & Polarization Index (PI) Test',
    description: 'Perform IEEE 43 insulation resistance testing at 1000V DC on phases U-V-W. Check Polarization Index (PI = R10min / R1min > 2.0).',
    priority: 'LOW',
    assignedEngineer: 'Marcus Vance (High Voltage Electrical Tech)',
    dueDate: '2026-08-14',
    createdAt: '2026-08-10',
    status: 'COMPLETED',
    estimatedHours: 2.0,
    actualHours: 1.8,
    requiredParts: [],
    checklist: [
      { id: 'c31', text: 'LOTO verified and motor disconnected from VFD', completed: true },
      { id: 'c32', text: '1000V DC Megger test: Phase-to-Ground > 2500 MOhm', completed: true },
      { id: 'c33', text: '10-minute Polarization Index calculated = 3.4 (Pass)', completed: true }
    ],
    notes: ['Insulation in pristine condition. Motor cleared for normal production.']
  }
];

export const INITIAL_SYSTEM_ALERTS: SystemAlert[] = [
  {
    id: 'alt-001',
    timestamp: '10 minutes ago',
    machineId: 'MT-001',
    machineName: 'Centrifugal Slurry Pump',
    severity: 'WARNING',
    title: 'Elevated DE Bearing Vibration (Zone B Alert)',
    message: 'Tri-axial accelerometer measured 3.40 mm/s RMS, exceeding ISO 10816-3 Zone A boundary (2.3 mm/s).',
    sourceSensor: 'SEN-V01 (DE Accelerometer)',
    readingValue: '3.40 mm/s',
    thresholdValue: '> 2.30 mm/s',
    acknowledged: false,
    resolved: false
  },
  {
    id: 'alt-002',
    timestamp: '45 minutes ago',
    machineId: 'MT-001',
    machineName: 'Centrifugal Slurry Pump',
    severity: 'INFO',
    title: 'Vibration Spectral Kurtosis Shift',
    message: 'Statistical Kurtosis rose from 3.05 to 3.85, confirming non-Gaussian impulsive shock pulses from bearing race.',
    sourceSensor: 'SEN-V01 (DSP Algorithm)',
    readingValue: '3.85 kurt',
    thresholdValue: '> 3.50 kurt',
    acknowledged: true,
    resolved: false
  },
  {
    id: 'alt-003',
    timestamp: '2 hours ago',
    machineId: 'MT-003',
    machineName: 'Helical Industrial Gearbox',
    severity: 'WARNING',
    title: 'Sump Oil Thermal Elevation',
    message: 'Lubricant sump temperature reached 76.2°C under 82% mechanical conveyor duty.',
    sourceSensor: 'SEN-G3-T01 (Oil RTD)',
    readingValue: '76.2 °C',
    thresholdValue: '> 75.0 °C',
    acknowledged: true,
    resolved: false
  }
];

export const ENGINEERING_CALCULATIONS: EngineeringCalculation[] = [
  {
    id: 'calc-power-torque',
    title: 'Shaft Power & Mechanical Torque Solver',
    category: 'Rotational Mechanics',
    formulaLaTeX: 'P = \\frac{2\\pi \\cdot N \\cdot T}{60\\,000} = \\frac{N \\cdot T}{9549.3}',
    formulaDescription: 'Relates rotational speed (N in RPM), shaft torque (T in N·m), and mechanical shaft power (P in kW). Essential for motor sizing, shaft stress analysis, and drivetrain transmission design.',
    inputs: [
      { key: 'rpm', label: 'Rotational Speed (N)', unit: 'RPM', defaultValue: 1480, min: 100, max: 10000, step: 10, description: 'Shaft angular velocity' },
      { key: 'torque', label: 'Shaft Torque (T)', unit: 'N·m', defaultValue: 142.0, min: 1, max: 5000, step: 1, description: 'Rotational twisting moment' }
    ],
    compute: (inputs) => {
      const { rpm, torque } = inputs;
      const powerKW = (rpm * torque) / 9549.3;
      const powerHP = powerKW * 1.34102;
      const angularVelocityRadS = (2 * Math.PI * rpm) / 60;
      return {
        result: parseFloat(powerKW.toFixed(2)),
        unit: 'kW',
        steps: [
          `Angular Velocity $\\omega = \\frac{2 \\times \\pi \\times ${rpm}}{60} = ${angularVelocityRadS.toFixed(2)}$ rad/s`,
          `Power (Watts) $P = T \\times \\omega = ${torque} \\times ${angularVelocityRadS.toFixed(2)} = ${(torque * angularVelocityRadS).toFixed(1)}$ W`,
          `Power (kW) $P = \\frac{${(torque * angularVelocityRadS).toFixed(1)}}{1000} = ${powerKW.toFixed(2)}$ kW (${powerHP.toFixed(2)} HP)`
        ],
        interpretation: `At ${rpm} RPM with ${torque} N·m torque, the mechanical drivetrain transmits ${powerKW.toFixed(2)} kW (${powerHP.toFixed(2)} HP) of shaft power.`
      };
    }
  },
  {
    id: 'calc-pump-efficiency',
    title: 'Centrifugal Pump Hydraulic Power & Efficiency',
    category: 'Hydraulics & Turbomachinery',
    formulaLaTeX: 'P_{hyd} = \\frac{\\rho \\cdot g \\cdot Q \\cdot H}{3.6 \\times 10^6} \\quad \\text{and} \\quad \\eta_{pump} = \\frac{P_{hyd}}{P_{shaft}} \\times 100\\%',
    formulaDescription: 'Calculates the useful fluid power delivered to liquid based on density (rho), differential total dynamic head (H), volumetric flow rate (Q), and computes hydraulic efficiency.',
    inputs: [
      { key: 'flowM3H', label: 'Flow Rate (Q)', unit: 'm³/h', defaultValue: 68.4, min: 1, max: 2000, step: 0.5, description: 'Volumetric discharge flow' },
      { key: 'headM', label: 'Total Dynamic Head (H)', unit: 'meters', defaultValue: 45.0, min: 1, max: 300, step: 1, description: 'Differential fluid head across pump' },
      { key: 'density', label: 'Fluid Density (ρ)', unit: 'kg/m³', defaultValue: 1000, min: 700, max: 1800, step: 10, description: 'Liquid density (Water = 1000)' },
      { key: 'shaftPowerKW', label: 'Shaft Input Power (P_shaft)', unit: 'kW', defaultValue: 11.2, min: 0.5, max: 500, step: 0.1, description: 'Mechanical brake power measured at pump shaft' }
    ],
    compute: (inputs) => {
      const { flowM3H, headM, density, shaftPowerKW } = inputs;
      const g = 9.80665;
      const hydPowerKW = (density * g * flowM3H * headM) / 3.6e6;
      const efficiency = (hydPowerKW / shaftPowerKW) * 100;
      return {
        result: parseFloat(efficiency.toFixed(1)),
        unit: '% Efficiency',
        steps: [
          `Hydraulic Fluid Power $P_{hyd} = \\frac{${density} \\times 9.81 \\times ${flowM3H} \\times ${headM}}{3,600,000} = ${hydPowerKW.toFixed(2)}$ kW`,
          `Pump Efficiency $\\eta = \\frac{${hydPowerKW.toFixed(2)} \\text{ kW}}{${shaftPowerKW} \\text{ kW}} \\times 100\\% = ${efficiency.toFixed(1)}\\%$`
        ],
        interpretation: `The hydraulic system delivers ${hydPowerKW.toFixed(2)} kW of useful hydraulic energy. Pump efficiency is ${efficiency.toFixed(1)}% (${efficiency >= 80 ? 'Optimal BEP performance' : efficiency >= 70 ? 'Acceptable industrial duty' : 'Low efficiency - check impeller wear or throttling'}).`
      };
    }
  },
  {
    id: 'calc-bearing-l10',
    title: 'ISO 281 Rolling Bearing L10 Basic Rating Life',
    category: 'Bearing Life',
    formulaLaTeX: 'L_{10h} = \\left( \\frac{C}{P} \\right)^p \\times \\frac{10^6}{60 \\cdot N} \\quad [\\text{hours}]',
    formulaDescription: 'Calculates the 90% statistical reliability fatigue life for ball bearings (p=3) or cylindrical/spherical roller bearings (p=10/3) under dynamic equivalent radial load P.',
    inputs: [
      { key: 'dynamicRatingC', label: 'Basic Dynamic Load Rating (C)', unit: 'kN', defaultValue: 32.5, min: 1, max: 500, step: 0.5, description: 'Catalog dynamic rating from SKF/NSK' },
      { key: 'equivalentLoadP', label: 'Equivalent Dynamic Load (P)', unit: 'kN', defaultValue: 6.8, min: 0.1, max: 200, step: 0.1, description: 'Radial & axial combined load P = X*Fr + Y*Fa' },
      { key: 'rpm', label: 'Rotational Speed (N)', unit: 'RPM', defaultValue: 1480, min: 50, max: 20000, step: 10, description: 'Shaft rotational speed' },
      { key: 'bearingType', label: 'Bearing Type (1=Ball, 2=Roller)', unit: 'Code', defaultValue: 1, min: 1, max: 2, step: 1, description: '1 for Ball (p=3), 2 for Roller (p=3.333)' }
    ],
    compute: (inputs) => {
      const { dynamicRatingC, equivalentLoadP, rpm, bearingType } = inputs;
      const p = bearingType === 2 ? 10 / 3 : 3;
      const l10RevolutionsMillions = (dynamicRatingC / equivalentLoadP) ** p;
      const l10Hours = (l10RevolutionsMillions * 1e6) / (60 * rpm);
      const l10Years24_7 = l10Hours / 8760;
      return {
        result: Math.round(l10Hours),
        unit: 'Operating Hours',
        steps: [
          `Load Exponent $p = ${p.toFixed(2)}$ (${bearingType === 2 ? 'Roller Bearing' : 'Ball Bearing'})`,
          `Life in Million Revolutions $L_{10} = \\left(\\frac{${dynamicRatingC}}{${equivalentLoadP}}\\right)^{${p.toFixed(2)}} = ${l10RevolutionsMillions.toFixed(1)}$ Million Revs`,
          `Life in Operating Hours $L_{10h} = \\frac{${l10RevolutionsMillions.toFixed(1)} \\times 10^6}{60 \\times ${rpm}} = ${Math.round(l10Hours).toLocaleString()}$ hours (${l10Years24_7.toFixed(1)} years continuous)`
        ],
        interpretation: `At ${rpm} RPM under ${equivalentLoadP} kN load, the bearing has an ISO 281 rating life of ${Math.round(l10Hours).toLocaleString()} hours (${l10Years24_7.toFixed(1)} continuous years at 90% reliability).`
      };
    }
  },
  {
    id: 'calc-shaft-stress',
    title: 'Solid Circular Shaft Torsional Shear Stress & Safety Factor',
    category: 'Stress & Safety',
    formulaLaTeX: '\\tau = \\frac{16 \\cdot T}{\\pi \\cdot d^3} \\quad \\text{and} \\quad \\text{FoS} = \\frac{\\tau_{yield}}{\\tau}',
    formulaDescription: 'Computes the maximum torsional shear stress on the outer fiber of a solid circular transmission shaft subjected to twisting torque T, and checks against yield shear strength (von Mises: tau_yield = 0.577 * Sy).',
    inputs: [
      { key: 'torqueNm', label: 'Transmitted Torque (T)', unit: 'N·m', defaultValue: 142.0, min: 1, max: 20000, step: 1, description: 'Shaft torque' },
      { key: 'shaftDiameterMm', label: 'Shaft Diameter (d)', unit: 'mm', defaultValue: 45.0, min: 5, max: 300, step: 0.5, description: 'Outer shaft diameter' },
      { key: 'yieldStrengthMPa', label: 'Material Yield Strength (Sy)', unit: 'MPa', defaultValue: 650.0, min: 100, max: 1500, step: 10, description: 'e.g. AISI 4140 Q&T = 650 MPa, Mild Steel = 250 MPa' }
    ],
    compute: (inputs) => {
      const { torqueNm, shaftDiameterMm, yieldStrengthMPa } = inputs;
      const dMeters = shaftDiameterMm / 1000;
      const polarModulusWp = (Math.PI * (dMeters ** 3)) / 16;
      const shearStressPa = torqueNm / polarModulusWp;
      const shearStressMPa = shearStressPa / 1e6;
      const allowableShearYieldMPa = 0.577 * yieldStrengthMPa; // von Mises yield criterion
      const factorOfSafety = allowableShearYieldMPa / shearStressMPa;
      return {
        result: parseFloat(shearStressMPa.toFixed(2)),
        unit: 'MPa',
        steps: [
          `Polar Section Modulus $W_p = \\frac{\\pi \\times (${shaftDiameterMm}\\text{mm})^3}{16} = ${(polarModulusWp * 1e6).toFixed(1)}$ mm³`,
          `Torsional Shear Stress $\\tau = \\frac{16 \\times ${torqueNm} \\times 10^3}{\\pi \\times (${shaftDiameterMm})^3} = ${shearStressMPa.toFixed(2)}$ MPa`,
          `von Mises Allowable Shear $\\tau_{yield} = 0.577 \\times ${yieldStrengthMPa} = ${allowableShearYieldMPa.toFixed(1)}$ MPa`,
          `Factor of Safety $\\text{FoS} = \\frac{${allowableShearYieldMPa.toFixed(1)}}{${shearStressMPa.toFixed(2)}} = ${factorOfSafety.toFixed(2)}$`
        ],
        interpretation: `Outer fiber torsional stress is ${shearStressMPa.toFixed(2)} MPa. Factor of Safety is ${factorOfSafety.toFixed(2)} (${factorOfSafety >= 2.5 ? 'Conservative industrial safety margin' : factorOfSafety >= 1.5 ? 'Standard mechanical design margin' : 'Dangerously low FoS - increase shaft diameter'}).`
      };
    }
  },
  {
    id: 'calc-iso-vibration',
    title: 'ISO 10816-3 Vibration Severity Severity Evaluator',
    category: 'Vibration & ISO Standards',
    formulaLaTeX: 'v_{RMS} = \\sqrt{\\frac{1}{T} \\int_0^T v(t)^2 \\, dt} \\quad [\\text{mm/s RMS}]',
    formulaDescription: 'Evaluates wideband vibration velocity (10 Hz - 1000 Hz) against international standard ISO 10816-3 for industrial machines (Class I: Small, Class II: Medium 15-75kW, Class III: Large Rigid, Class IV: Large Flexible).',
    inputs: [
      { key: 'vibVelocity', label: 'Vibration Velocity RMS', unit: 'mm/s', defaultValue: 3.4, min: 0.1, max: 25.0, step: 0.1, description: 'Measured wideband vibration velocity' },
      { key: 'machineClass', label: 'Machine Group (1=Small, 2=Med 15-75kW, 3=Large Rigid)', unit: 'Class', defaultValue: 2, min: 1, max: 3, step: 1, description: 'ISO 10816-3 Machine Classification' }
    ],
    compute: (inputs) => {
      const { vibVelocity, machineClass } = inputs;
      let zone = 'Zone A (Good)';
      let description = 'Newly commissioned machines; fully acceptable for unrestricted long-term operation.';
      let color = '#10b981';

      if (machineClass === 2) {
        // Medium machines 15 kW - 75 kW
        if (vibVelocity <= 1.4) {
          zone = 'Zone A (Good)';
        } else if (vibVelocity <= 2.8) {
          zone = 'Zone B (Acceptable)';
          description = 'Unrestricted long-term continuous industrial operation.';
          color = '#06b6d4';
        } else if (vibVelocity <= 4.5) {
          zone = 'Zone C (Unsatisfactory / Warning)';
          description = 'Not suitable for continuous long-term operation; machine may run for limited time until remedial maintenance.';
          color = '#f59e0b';
        } else {
          zone = 'Zone D (Damaging / Critical)';
          description = 'Severe vibration sufficient to cause catastrophic mechanical damage. Immediate shutdown & inspection required.';
          color = '#ef4444';
        }
      } else if (machineClass === 1) {
        if (vibVelocity <= 0.71) zone = 'Zone A';
        else if (vibVelocity <= 1.8) zone = 'Zone B';
        else if (vibVelocity <= 2.8) zone = 'Zone C';
        else zone = 'Zone D';
      } else {
        if (vibVelocity <= 2.3) zone = 'Zone A';
        else if (vibVelocity <= 4.5) zone = 'Zone B';
        else if (vibVelocity <= 7.1) zone = 'Zone C';
        else zone = 'Zone D';
      }

      return {
        result: vibVelocity,
        unit: 'mm/s RMS',
        isoClass: zone,
        steps: [
          `ISO 10816-3 Machine Classification: Class ${machineClass === 1 ? 'I (Motors < 15 kW)' : machineClass === 2 ? 'II (Medium 15-75 kW)' : 'III (Large Rigid Base)'}`,
          `Measured Vibration Velocity: ${vibVelocity.toFixed(2)} mm/s RMS`,
          `Assigned Evaluation Zone: ${zone}`
        ],
        interpretation: `${zone}: ${description}`
      };
    }
  }
];
