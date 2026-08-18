/**
 * MECHTWIN AI — Express Modular API Routers
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { AuthService, AuthenticatedRequest } from '../services/authService';
import { PhysicsSimulationService } from '../services/physicsSimulationService';
import { EngineeringCalculationService } from '../services/engineeringCalculationService';
import { MachineHealthService } from '../services/machineHealthService';
import { EnergyAnalyticsService } from '../services/energyAnalyticsService';
import { AIEngineeringCopilotService } from '../services/aiEngineeringCopilotService';
import { IoTService } from '../services/iotService';
import { MaintenanceRecord, SimulationRun } from '../../src/types';

// ==========================================
// 1. Authentication & RBAC Router
// ==========================================
export const authRouter = Router();

authRouter.get('/users', (req: Request, res: Response) => {
  res.json({ users: db.users });
});

authRouter.get('/me', (req: Request, res: Response) => {
  const user = AuthService.getCurrentUser(req);
  res.json({ user });
});

authRouter.post('/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const found = db.users.find(u => u.id === userId);
  if (!found) {
    return res.status(404).json({ error: 'User not found' });
  }
  db.logAction(
    found.id,
    'USER_SESSION_SWITCH',
    'User',
    found.id,
    `Active operator session switched to ${found.name} (${found.role})`,
    'SUCCESS',
    req.ip || '127.0.0.1'
  );
  res.json({ success: true, user: found });
});

// ==========================================
// 2. Machines & Digital Twins Router
// ==========================================
export const machinesRouter = Router();

machinesRouter.get('/', (req: Request, res: Response) => {
  res.json({ machines: db.machines });
});

machinesRouter.get('/:id', (req: Request, res: Response) => {
  const machine = db.getMachine(req.params.id);
  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  res.json({ machine });
});

machinesRouter.get('/:id/telemetry', (req: Request, res: Response) => {
  const machine = db.getMachine(req.params.id);
  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  res.json({ telemetry: machine.latestTelemetry });
});

machinesRouter.get('/:id/health', (req: Request, res: Response) => {
  const machine = db.getMachine(req.params.id);
  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  const health = MachineHealthService.calculateHealth(
    machine.latestTelemetry,
    machine.ratedPowerKW,
    machine.healthScore
  );
  res.json({ health });
});

machinesRouter.get('/:id/history', (req: Request, res: Response) => {
  res.json({ history: db.history30Days });
});

// ==========================================
// 3. Simulations & What-If Scenarios Router
// ==========================================
export const simulationsRouter = Router();

simulationsRouter.get('/history', (req: Request, res: Response) => {
  res.json({ runs: db.simulationRuns });
});

simulationsRouter.post('/run', AuthService.requireRole(['ADMIN', 'ENGINEER']), (req: AuthenticatedRequest, res: Response) => {
  const { machineId, inputs } = req.body;
  const machine = db.getMachine(machineId || 'MT-001') || db.machines[0];
  const user = req.user || db.users[0];

  const predicted = PhysicsSimulationService.solveWhatIfScenario(machine, inputs);
  const baseline = machine.latestTelemetry;

  const deltas = {
    powerDeltaKW: parseFloat((predicted.powerKW - baseline.power).toFixed(2)),
    tempDeltaC: parseFloat((predicted.temperatureC - baseline.temperature).toFixed(1)),
    vibDeltaRMS: parseFloat((predicted.vibrationRMS - baseline.vibration).toFixed(2)),
    effDeltaPct: parseFloat((predicted.efficiencyPct - baseline.efficiency).toFixed(1)),
    lifeDeltaDays: predicted.bearingLifeDays - baseline.remainingUsefulLifeDays,
    costDeltaUSD: predicted.estimatedAnnualCostUSD - Math.round(baseline.power * 6000 * machine.energyCostPerKWh),
  };

  const run: SimulationRun = {
    id: `SIM-RUN-${Date.now()}`,
    timestamp: new Date().toISOString(),
    machineId: machine.id,
    machineName: machine.name,
    scenarioName: inputs.scenarioName || 'Custom Operational Scenario',
    inputs,
    baseline,
    predicted,
    deltas,
    createdBy: user.name,
  };

  db.simulationRuns.unshift(run);
  if (db.simulationRuns.length > 50) db.simulationRuns.pop();

  db.logAction(
    user.id,
    'SIMULATION_EXECUTED',
    'SimulationRun',
    run.id,
    `Executed physics simulation scenario: '${run.scenarioName}' on ${machine.tag}`,
    'SUCCESS',
    req.ip || '127.0.0.1'
  );

  res.json({ run });
});

// ==========================================
// 4. Engineering Calculations Router
// ==========================================
export const calculationsRouter = Router();

calculationsRouter.post('/solve', (req: Request, res: Response) => {
  try {
    const result = EngineeringCalculationService.solve(req.body);
    res.json({ result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 5. Energy Analytics Router
// ==========================================
export const energyRouter = Router();

energyRouter.get('/:machineId', (req: Request, res: Response) => {
  const machine = db.getMachine(req.params.machineId) || db.machines[0];
  const analytics = EnergyAnalyticsService.getEnergyAnalytics(machine);
  res.json({ analytics });
});

// ==========================================
// 6. Maintenance Management Router
// ==========================================
export const maintenanceRouter = Router();

maintenanceRouter.get('/', (req: Request, res: Response) => {
  res.json({ records: db.maintenanceRecords });
});

maintenanceRouter.post('/', AuthService.requireRole(['ADMIN', 'ENGINEER']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user || db.users[0];
  const newRecord: MaintenanceRecord = {
    id: `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    machineId: req.body.machineId || 'MT-001',
    machineName: req.body.machineName || 'Heavy-Duty Centrifugal Slurry Pump System',
    componentId: req.body.componentId || 'bearing_de',
    componentName: req.body.componentName || 'Drive-End Bearing 01',
    type: req.body.type || 'PREDICTIVE',
    issue: req.body.issue || 'Preventive maintenance check',
    priority: req.body.priority || 'MEDIUM',
    assignedEngineer: req.body.assignedEngineer || user.name,
    createdDate: new Date().toISOString(),
    dueDate: req.body.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'OPEN',
    estimatedHours: req.body.estimatedHours || 2.0,
    requiredParts: req.body.requiredParts || [],
    notes: req.body.notes || '',
  };

  db.maintenanceRecords.unshift(newRecord);
  db.logAction(
    user.id,
    'WORK_ORDER_CREATED',
    'MaintenanceRecord',
    newRecord.id,
    `Created ${newRecord.type} work order '${newRecord.issue}' (Priority: ${newRecord.priority})`,
    'SUCCESS',
    req.ip || '127.0.0.1'
  );

  res.json({ record: newRecord });
});

maintenanceRouter.patch('/:id', AuthService.requireRole(['ADMIN', 'ENGINEER']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user || db.users[0];
  const record = db.maintenanceRecords.find(r => r.id === req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Work order not found' });
  }

  if (req.body.status) record.status = req.body.status;
  if (req.body.actualHours) record.actualHours = req.body.actualHours;
  if (req.body.status === 'COMPLETED' && !record.completionDate) {
    record.completionDate = new Date().toISOString();
  }
  if (req.body.notes) record.notes = req.body.notes;

  db.logAction(
    user.id,
    'WORK_ORDER_UPDATED',
    'MaintenanceRecord',
    record.id,
    `Updated work order status to ${record.status}`,
    'SUCCESS',
    req.ip || '127.0.0.1'
  );

  res.json({ record });
});

// ==========================================
// 7. Alerts Router
// ==========================================
export const alertsRouter = Router();

alertsRouter.get('/', (req: Request, res: Response) => {
  res.json({ alerts: db.alerts });
});

alertsRouter.post('/:id/acknowledge', (req: Request, res: Response) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  alert.acknowledged = true;
  res.json({ alert });
});

// ==========================================
// 8. AI Engineering Copilot Router
// ==========================================
export const aiRouter = Router();

aiRouter.post('/copilot', async (req: Request, res: Response) => {
  try {
    const analysis = await AIEngineeringCopilotService.analyze(req.body);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. IoT Hardware Router
// ==========================================
export const iotRouter = Router();

iotRouter.post('/telemetry', (req: Request, res: Response) => {
  try {
    const result = IoTService.ingest(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

iotRouter.get('/code-snippet/:machineId', (req: Request, res: Response) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const arduino = IoTService.getArduinoCode(req.params.machineId, host);
  const python = IoTService.getPythonCode(req.params.machineId, host);
  res.json({ arduino, python });
});

// ==========================================
// 10. Audit Logs Router
// ==========================================
export const auditLogsRouter = Router();

auditLogsRouter.get('/', AuthService.requireRole(['ADMIN', 'ENGINEER']), (req: AuthenticatedRequest, res: Response) => {
  res.json({ logs: db.auditLogs });
});

// ==========================================
// 11. Compliance Reports Router
// ==========================================
export const reportsRouter = Router();

reportsRouter.get('/compliance/:machineId', (req: Request, res: Response) => {
  const machine = db.getMachine(req.params.machineId) || db.machines[0];
  const report = {
    id: `REP-ISO-${Date.now()}`,
    machineId: machine.id,
    machineName: machine.name,
    tag: machine.tag,
    generatedAt: new Date().toISOString(),
    standards: [
      { standard: 'ISO 10816-3', topic: 'Mechanical Vibration Evaluation', status: 'ZONE B (Warning)' },
      { standard: 'ISO 281', topic: 'Rolling Bearing Dynamic Rating Life', status: 'COMPLIANT (31d L10h)' },
      { standard: 'IEC 60034-1', topic: 'Electric Motor Thermal Limits', status: 'COMPLIANT (Class F)' },
      { standard: 'ISO 1940-1', topic: 'Rotor Balance Quality', status: 'GRADE G2.5' },
    ],
    overallHealth: machine.healthScore,
    engineerInCharge: 'Samil Khan (Principal Reliability Engineer)',
  };
  res.json({ report });
});
