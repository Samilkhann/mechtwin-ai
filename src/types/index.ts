/**
 * MECHTWIN AI — Industrial Engineering Intelligence Platform
 * Core TypeScript Type Definitions & Domain Models
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

export type MachineStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export type UserRole = 'ADMIN' | 'ENGINEER' | 'VIEWER';

export type DataTrustLevel =
  | 'LIVE_SENSOR'
  | 'SIMULATED'
  | 'CALCULATED'
  | 'ESTIMATED'
  | 'PREDICTED'
  | 'AI_ANALYSIS';

export type ReadingQuality = 'GOOD' | 'WARNING' | 'INVALID';

export type ReadingSource = 'SIMULATED' | 'LIVE_SENSOR' | 'IMPORTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  department: string;
  avatarInitials: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  siteLocation: string;
  licenseTier: 'Enterprise Industry 4.0' | 'Professional' | 'Pilot Lab';
  activeMachineCount: number;
}

export interface MachineComponent {
  id: string;
  name: string;
  type:
    | 'motor'
    | 'bearing_de'
    | 'bearing_nde'
    | 'coupling'
    | 'shaft'
    | 'impeller'
    | 'casing'
    | 'seal'
    | 'pipe_inlet'
    | 'pipe_outlet'
    | 'gearbox'
    | 'cylinder';
  temperature: number; // °C
  vibration: number; // mm/s RMS
  condition: 'NORMAL' | 'WARNING' | 'CRITICAL';
  estimatedLifeDays: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  operatingHours: number;
  lastInspected: string;
  material: string;
  specifications: Record<string, string | number>;
  highlightColor?: string;
  position3D?: [number, number, number];
  dataTrust?: DataTrustLevel;
}

export interface Sensor {
  id: string;
  machineId: string;
  componentId?: string;
  name: string;
  type:
    | 'temperature'
    | 'vibration'
    | 'rpm'
    | 'current'
    | 'voltage'
    | 'power'
    | 'pressure_inlet'
    | 'pressure_outlet'
    | 'flow'
    | 'torque'
    | 'acoustic';
  unit: string;
  samplingRateHz: number;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE' | 'CALIBRATING';
  calibrationStatus?: 'CALIBRATED' | 'DUE_SOON' | 'EXPIRED';
  minSafe: number;
  maxSafe: number;
  minWarning: number;
  maxWarning: number;
  lastReading?: number;
  lastSyncTimestamp?: number;
  quality?: ReadingQuality;
  source?: ReadingSource;
  dataTrust?: DataTrustLevel;
  location: string;
  currentValue?: number;
}

export interface SensorReading {
  timestamp: number;
  sensorId: string;
  machineId: string;
  value: number;
  unit: string;
  quality: ReadingQuality;
  source: ReadingSource;
  dataTrust: DataTrustLevel;
}

export interface TelemetryReading {
  timestamp: number;
  temperature: number; // °C
  vibration: number; // mm/s RMS
  vibrationPeak: number; // mm/s Peak
  vibrationKurtosis: number; // Dimensionless statistical metric
  rpm: number; // RPM
  current: number; // Amperes (A)
  voltage: number; // Volts (V)
  power: number; // Kilowatts (kW)
  powerFactor: number; // 0.0 - 1.0
  pressureInlet: number; // bar
  pressureOutlet: number; // bar
  flowRate: number; // L/min or m³/h
  torque: number; // N·m
  efficiency: number; // %
  healthScore: number; // 0 - 100
  failureProbability: number; // %
  remainingUsefulLifeDays: number; // days
  dataTrust?: DataTrustLevel;
  quality?: ReadingQuality;
  source?: ReadingSource;
}

export interface MachineHealthFactor {
  name: string;
  score: number; // 0 - 100
  weight: number; // 0.0 - 1.0
  value: string;
  benchmark: string;
  status: 'Optimal' | 'Degraded' | 'Critical';
  impact: number; // points deducted
  description: string;
}

export interface MachineHealthBreakdown {
  overallScore: number; // 0 - 100
  previousScore?: number;
  deltaReason?: string;
  status: MachineStatus;
  factors: MachineHealthFactor[];
  computedAt?: string;
}

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  machineId: string;
  machineName?: string;
  sensorId: string;
  sensorType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  observedValue: number;
  expectedRange: [number, number];
  unit: string;
  deviationPct: number;
  possibleCause: string;
  acknowledged: boolean;
  dataTrust: DataTrustLevel;
}

export type FaultType =
  | 'Bearing Wear'
  | 'Shaft Misalignment'
  | 'Rotor Imbalance'
  | 'Lubrication Failure'
  | 'Overheating'
  | 'Motor Overload'
  | 'Pump Cavitation'
  | 'Abnormal Current'
  | 'Reduced Efficiency'
  | string;

export interface FaultPrediction {
  id: string;
  machineId: string;
  faultType: FaultType;
  probability: number; // %
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedComponent: string;
  componentId: string;
  evidence: string[];
  recommendedAction: string;
  maintenancePriority:
    | 'P1 - Immediate'
    | 'P2 - Within 48h'
    | 'P3 - Next Scheduled Maintenance'
    | 'P4 - Monitor'
    | string;
  estimatedTimeToFailureHours: number;
  detectedAt: string;
  isoStandardRef?: string;
  dataTrust?: DataTrustLevel;
}

export interface MachineOperatingProfile {
  id: string;
  machineId: string;
  shiftName: string;
  nominalLoadPct: number;
  targetRPM: number;
  cycleDurationHours: number;
  ambientConditions: {
    tempC: number;
    humidityPct: number;
  };
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  machineName?: string;
  componentId?: string;
  componentName?: string;
  component?: string;
  workOrderNumber?: string;
  type?: 'PREVENTIVE' | 'PREDICTIVE' | 'CORRECTIVE' | 'INSPECTION' | string;
  issue?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  assignedEngineer?: string;
  createdDate?: string;
  createdAt?: string;
  dueDate?: string;
  completionDate?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'PENDING' | string;
  notes?: string | string[];
  estimatedHours: number;
  actualHours?: number;
  requiredParts?: any[];
  checklist?: { id: string; text: string; completed: boolean }[];
}

export interface WorkOrder extends MaintenanceRecord {
  title?: string;
  description?: string;
  assignedTechnician?: string;
  scheduledDate?: string;
  [key: string]: any;
}

export type MaintenanceTask = WorkOrder;

export interface Alert {
  id: string;
  timestamp: string;
  machineId: string;
  machineName?: string;
  sensorId?: string;
  level?: 'INFO' | 'WARNING' | 'CRITICAL';
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  ruleTrigger?: string;
  sourceSensor?: string;
  readingValue?: string;
  thresholdValue?: string;
  value?: string;
  threshold?: string;
  acknowledged: boolean;
  resolved: boolean;
}

export type SystemAlert = Alert;

export interface EngineeringCalculationItem {
  id: string;
  title: string;
  category:
    | 'Rotational Mechanics'
    | 'Hydraulics & Turbomachinery'
    | 'Vibration & ISO Standards'
    | 'Bearing Life'
    | 'Stress & Safety'
    | 'Thermal Dynamics'
    | 'Energy & Electrical'
    | string;
  formulaLaTeX: string;
  formulaDescription: string;
  inputs: {
    key: string;
    label: string;
    unit: string;
    defaultValue: number;
    min: number;
    max: number;
    step: number;
    description: string;
  }[];
  compute: (inputs: Record<string, number>) => {
    result: number;
    unit: string;
    steps: string[];
    substitution?: string;
    interpretation: string;
    isoClass?: string;
  };
}

export interface EngineeringCalculation extends EngineeringCalculationItem {}

export interface WhatIfScenarioInputs {
  scenarioName?: string;
  rpm?: number;
  loadPercent?: number;
  suctionPressureBar?: number;
  ambientTempC?: number;
  lubricationDegradationPct?: number;
  operatingHoursOffset?: number;
  adjustedRPM?: number;
  adjustedLoadPercent?: number;
  adjustedAmbientTemp?: number;
  adjustedLubricantViscosity?: number;
  [key: string]: any;
}

export interface WhatIfPrediction {
  powerKW?: number;
  temperatureC?: number;
  vibrationRMS?: number;
  efficiencyPct?: number;
  bearingLifeDays?: number;
  failureRiskPct?: number;
  estimatedAnnualCostUSD?: number;
  riskAssessment?: string;
  recommendation?: string;
  dataTrust?: DataTrustLevel;
  baseline?: TelemetryReading;
  predicted?: TelemetryReading | any;
  deltaTemperature?: number;
  deltaPowerKW?: number;
  deltaVibration?: number;
  deltaEfficiency?: number;
  deltaRULDays?: number;
  deltaAnnualEnergyCostUSD?: number;
  [key: string]: any;
}

export type WhatIfResult = WhatIfPrediction;
export type WhatIfScenario = WhatIfScenarioInputs;

export interface SimulationRun {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  scenarioName: string;
  inputs: WhatIfScenarioInputs;
  baseline: TelemetryReading;
  predicted: WhatIfPrediction;
  deltas: {
    powerDeltaKW: number;
    tempDeltaC: number;
    vibDeltaRMS: number;
    effDeltaPct: number;
    lifeDeltaDays: number;
    costDeltaUSD: number;
  };
  createdBy: string;
}

export interface EnergyAnalytics {
  machineId: string;
  instantaneousPowerKW: number;
  dailyEnergyKWh: number;
  weeklyEnergyKWh: number;
  monthlyEnergyKWh: number;
  energyCostRateUSD: number;
  totalDailyCostUSD: number;
  totalMonthlyCostUSD: number;
  efficiencyPct: number;
  baselineDeviationPct: number;
  carbonEmissionsKg: number;
}

export interface AIAnalysisResult {
  observation: string;
  analysis: string;
  evidence: string[];
  possibleCauses: string[];
  recommendedAction: string;
  confidencePct: number;
  dataTrust: DataTrustLevel;
  sourceEngine: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  machineContext?: {
    machineId: string;
    machineName: string;
    healthScore: number;
    vibrationRMS: number;
    temperature: number;
    activeFaults: string[];
  };
  structuredAnalysis?: AIAnalysisResult;
  recommendations?: string[];
  evidence?: string[];
  calculations?: { title: string; result: string }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  ipAddress: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  tag: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  installationDate: string;
  operatingHours: number;
  status: MachineStatus;
  healthScore?: number;
  ratedPowerKW: number;
  ratedRPM: number;
  ratedVoltageV?: number;
  ratedCurrentA?: number;
  ratedPressureBar?: number;
  ratedFlowLPM?: number;
  ratedHeadMeters?: number;
  components: MachineComponent[];
  sensors: Sensor[] | any[];
  latestTelemetry: TelemetryReading;
  healthBreakdown: MachineHealthBreakdown;
  activeFaults: FaultPrediction[];
  mtbfHours: number;
  energyCostPerKWh: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoricalDataPoint {
  day: number;
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  phase:
    | 'Normal Operation'
    | 'Load Variation Cycle'
    | 'Gradual Bearing Degradation'
    | 'Elevated Thermal & Vibration Alert'
    | 'Maintenance Event (Lube & Alignment)'
    | 'Post-Maintenance Recovery';
  temperature: number; // °C
  vibration: number; // mm/s RMS
  vibrationKurtosis: number;
  rpm: number;
  power: number; // kW
  current: number; // A
  efficiency: number; // %
  pressureOutlet: number; // bar
  healthScore: number; // 0-100
  failureProbability: number; // %
  rulDays: number;
  anomalyDetected: boolean;
  notes: string;
}
