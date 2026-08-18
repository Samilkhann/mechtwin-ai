/**
 * MECHTWIN AI - Intelligent Digital Twin Platform
 * "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_MACHINES } from './data/mockMachines';
import { Machine, MachineComponent, TelemetryReading, WorkOrder, User } from './types';
import { generateNextTelemetry, PhysicsSimulationState, createInitialSimulationState } from './services/physicsEngine';
import { calculateMachineHealth } from './services/healthScorer';
import { detectMachineFaults } from './services/faultDetector';

import { Sidebar } from './components/Layout/Sidebar';
import { TopNavbar } from './components/Layout/TopNavbar';
import { LandingPage } from './components/Landing/LandingPage';
import { ExecutiveDashboard } from './components/Overview/ExecutiveDashboard';
import { ThreeMachineViewer } from './components/DigitalTwin/ThreeMachineViewer';
import { ComponentInspector } from './components/DigitalTwin/ComponentInspector';
import { LiveMonitoringView } from './components/LiveMonitoring/LiveMonitoringView';
import { PredictiveMaintenanceView } from './components/Intelligence/PredictiveMaintenanceView';
import { AnomalyCenter } from './components/Intelligence/AnomalyCenter';
import { EngineeringCalculationsView } from './components/EngineeringCalculations/EngineeringCalculationsView';
import { WhatIfSimulationView } from './components/EngineeringCalculations/WhatIfSimulationView';
import { EnergyAnalyticsView } from './components/EngineeringCalculations/EnergyAnalyticsView';
import { AICopilotView } from './components/AICopilot/AICopilotView';
import { MaintenanceView } from './components/Maintenance/MaintenanceView';
import { AlertCenter } from './components/Operations/AlertCenter';
import { IoTIntegrationView } from './components/IoTIntegration/IoTIntegrationView';
import { FleetManager } from './components/Fleet/FleetManager';
import { ReportsView } from './components/Reports/ReportsView';
import { SettingsView } from './components/System/SettingsView';

export default function App() {
  // 0. Active User (RBAC Persona)
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'USR-ADMIN-01',
    name: 'Samil Khan',
    email: 'samil.khan@mechtwin.ai',
    role: 'ADMIN',
    organizationId: 'ORG-001',
    organizationName: 'Advanced Industrial Manufacturing Corp',
    department: 'Principal Reliability Engineering & AI Architecture',
    avatarInitials: 'SK',
  });

  // 1. Core Navigation & Machine State
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(INITIAL_MACHINES[0].id);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // 2. 3D Digital Twin Viewer State
  const [selectedComponent, setSelectedComponent] = useState<MachineComponent | null>(null);
  const [viewMode, setViewMode] = useState<'cad' | 'thermal' | 'vibration' | 'flow' | 'xray'>('cad');
  const [explodedProgress, setExplodedProgress] = useState<number>(0.0);

  // 3. Physics Simulation Engine State
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simState, setSimState] = useState<PhysicsSimulationState>(createInitialSimulationState());

  // 4. Telemetry History Buffers (Indexed by Machine ID)
  const [telemetryHistories, setTelemetryHistories] = useState<Record<string, TelemetryReading[]>>(() => {
    const initial: Record<string, TelemetryReading[]> = {};
    INITIAL_MACHINES.forEach(m => {
      initial[m.id] = [m.latestTelemetry];
    });
    return initial;
  });

  // 5. Work Orders CMMS State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'WO-2026-088',
      machineId: 'MT-001',
      machineName: 'Centrifugal Pump & Motor Assembly (MT-001)',
      componentName: 'DE Drive-End Bearing (SKF 6208)',
      title: 'Ultrasonic Demodulation & Bearing Lubrication Replenishment',
      description: 'ISO 10816 vibration elevated to 3.4 mm/s RMS. BPFO harmonics detected at 105.8 Hz.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTechnician: 'Sarah Jenkins (Vib Analyst ISO Cat III)',
      createdDate: '2026-08-15',
      scheduledDate: '2026-08-18',
      estimatedHours: 2.5,
      requiredParts: ['Shell Gadus S2 V220 Synthetic Grease', 'SKF Vibracon Chock Mounts'],
    },
    {
      id: 'WO-2026-089',
      machineId: 'MT-002',
      machineName: 'High-Speed Helical Industrial Gearbox (MT-002)',
      componentName: 'Input Helical Pinion',
      title: 'Oil Spectrometry & Gear Tooth Mesh Frequency Inspection',
      description: 'GMF harmonic peak indicates micro-pitting on drive gear flank.',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTechnician: 'Carlos Mendez (Tribology Tech)',
      createdDate: '2026-08-16',
      scheduledDate: '2026-08-20',
      estimatedHours: 4.0,
      requiredParts: ['ISO VG 320 Synthetic Gear Oil', 'Replacement Gasket Kit'],
    },
  ]);

  // Derived current machine
  const currentMachine = machines.find(m => m.id === selectedMachineId) || machines[0];
  const currentHistory = telemetryHistories[currentMachine.id] || [currentMachine.latestTelemetry];

  // 6. Physics Simulation Loop (Continuous 1.5 Hz dynamic telemetry update)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setMachines(prevMachines => {
        return prevMachines.map(machine => {
          if (machine.id === selectedMachineId) {
            const { telemetry: nextTel } = generateNextTelemetry(machine, machine.latestTelemetry, simState);
            const healthBreakdown = calculateMachineHealth(
              nextTel,
              machine.ratedPowerKW,
              machine.ratedRPM,
              machine.operatingHours,
              machine.mtbfHours
            );
            const activeFaults = detectMachineFaults(machine, nextTel);

            // Dynamically update components
            const updatedComponents = machine.components.map(comp => {
              if (comp.type === 'bearing_de' || comp.id === 'bearing_de') {
                return {
                  ...comp,
                  temperature: nextTel.temperature + 3.8,
                  vibration: nextTel.vibration * 1.12,
                  condition: nextTel.vibration > 4.5 ? 'CRITICAL' : nextTel.vibration > 2.8 ? 'WARNING' : 'NORMAL',
                  estimatedLifeDays: nextTel.remainingUsefulLifeDays,
                };
              }
              if (comp.type === 'motor' || comp.id === 'motor') {
                return {
                  ...comp,
                  temperature: nextTel.temperature,
                  vibration: nextTel.vibration * 0.85,
                  condition: nextTel.temperature > 85 ? 'WARNING' : 'NORMAL',
                };
              }
              if (comp.type === 'casing' || comp.id === 'casing') {
                return {
                  ...comp,
                  temperature: nextTel.temperature - 12.0,
                  vibration: nextTel.vibration * 0.9,
                  condition: simState.operatingMode === 'CAVITATION' ? 'WARNING' : 'NORMAL',
                };
              }
              return comp;
            });

            // Update historical buffer
            setTelemetryHistories(prevHist => {
              const hist = prevHist[machine.id] || [];
              const updated = [...hist, nextTel].slice(-60);
              return { ...prevHist, [machine.id]: updated };
            });

            return {
              ...machine,
              latestTelemetry: nextTel,
              healthBreakdown,
              activeFaults,
              status: healthBreakdown.status,
              components: updatedComponents as any,
            };
          }
          return machine;
        });
      });

      setSimState(prev => ({ ...prev, timeStep: prev.timeStep + 1 }));
    }, 1000 / (simState.speedMultiplier || 1));

    return () => clearInterval(interval);
  }, [isSimulating, selectedMachineId, simState]);

  // Handlers
  const handleAddWorkOrder = (order: WorkOrder) => {
    setWorkOrders(prev => [order, ...prev]);
  };

  const handleUpdateWorkOrderStatus = (id: string, status: WorkOrder['status']) => {
    setWorkOrders(prev => prev.map(w => (w.id === id ? { ...w, status } : w)));
  };

  const handleAddMachine = (newMachine: Machine) => {
    setMachines(prev => [...prev, newMachine]);
    setTelemetryHistories(prev => ({
      ...prev,
      [newMachine.id]: [newMachine.latestTelemetry],
    }));
  };

  const handleInjectExternalTelemetry = (packet: any) => {
    setMachines(prevMachines => {
      return prevMachines.map(m => {
        if (m.id === packet.machineId) {
          const updatedTelemetry: TelemetryReading = {
            ...m.latestTelemetry,
            timestamp: Date.now(),
            temperature: packet.temperature !== undefined ? packet.temperature : m.latestTelemetry.temperature,
            vibration: packet.vibration !== undefined ? packet.vibration : m.latestTelemetry.vibration,
            rpm: packet.rpm !== undefined ? packet.rpm : m.latestTelemetry.rpm,
            current: packet.current !== undefined ? packet.current : m.latestTelemetry.current,
          };
          const health = calculateMachineHealth(
            updatedTelemetry,
            m.ratedPowerKW,
            m.ratedRPM,
            m.operatingHours,
            m.mtbfHours
          );
          const faults = detectMachineFaults(m, updatedTelemetry);
          return {
            ...m,
            latestTelemetry: updatedTelemetry,
            healthBreakdown: health,
            activeFaults: faults,
            status: health.status,
          };
        }
        return m;
      });
    });
  };

  const totalActiveFaults = machines.reduce((acc, m) => acc + m.activeFaults.length, 0);

  // If viewing the Landing Showcase Page
  if (activeTab === 'landing') {
    return <LandingPage onLaunchPlatform={tab => setActiveTab(tab || 'overview')} />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        machineCount={machines.length}
        activeFaultCount={totalActiveFaults}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          machines={machines}
          selectedMachine={currentMachine}
          onSelectMachine={setSelectedMachineId}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          onOpenAICopilot={() => setActiveTab('ai_copilot')}
          onOpenAlerts={() => setActiveTab('alerts')}
          currentUser={currentUser}
          onSwitchUser={setCurrentUser}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-950 via-[#060b17] to-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* VIEW: Executive Overview Dashboard */}
            {activeTab === 'overview' && (
              <ExecutiveDashboard
                machine={currentMachine}
                telemetryHistory={currentHistory}
                onNavigateTab={setActiveTab}
                onSelectComponent={setSelectedComponent}
                onOpenWorkOrderModal={() => setActiveTab('maintenance')}
              />
            )}

            {/* VIEW: 3D Digital Twin CAD Studio */}
            {activeTab === 'digital_twin' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
                <div className="lg:col-span-8 h-full">
                  <ThreeMachineViewer
                    machine={currentMachine}
                    selectedComponent={selectedComponent}
                    onSelectComponent={setSelectedComponent}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    explodedProgress={explodedProgress}
                    setExplodedProgress={setExplodedProgress}
                    isSimulating={isSimulating}
                  />
                </div>
                <div className="lg:col-span-4 h-full">
                  <ComponentInspector
                    component={selectedComponent}
                    machine={currentMachine}
                    onSelectComponent={setSelectedComponent}
                    onOpenWorkOrderModal={() => setActiveTab('maintenance')}
                  />
                </div>
              </div>
            )}

            {/* VIEW: Live Telemetry & DSP Studio */}
            {activeTab === 'live_monitoring' && (
              <LiveMonitoringView
                machine={currentMachine}
                telemetryHistory={currentHistory}
                isSimulating={isSimulating}
                setIsSimulating={setIsSimulating}
                simState={simState}
                setSimState={setSimState}
              />
            )}

            {/* VIEW: Fleet Manager */}
            {activeTab === 'fleet' && (
              <FleetManager
                machines={machines}
                selectedMachineId={selectedMachineId}
                onSelectMachine={setSelectedMachineId}
                onAddMachine={handleAddMachine}
              />
            )}

            {/* VIEW: Predictive Maintenance & ISO 281 RUL Workspace */}
            {activeTab === 'predictive' && (
              <PredictiveMaintenanceView
                machine={currentMachine}
                telemetryHistory={currentHistory}
                onOpenWorkOrderModal={() => setActiveTab('maintenance')}
                onOpenAICopilot={() => setActiveTab('ai_copilot')}
              />
            )}

            {/* VIEW: AI Engineering Copilot */}
            {activeTab === 'ai_copilot' && (
              <AICopilotView machine={currentMachine} />
            )}

            {/* VIEW: Anomaly Center & Diagnostic Investigation */}
            {activeTab === 'anomalies' && (
              <AnomalyCenter
                machine={currentMachine}
                onOpenWorkOrderModal={() => setActiveTab('maintenance')}
                onOpenAICopilot={() => setActiveTab('ai_copilot')}
              />
            )}

            {/* VIEW: Mechanical Engineering Calculations */}
            {activeTab === 'calculations' && (
              <EngineeringCalculationsView machine={currentMachine} />
            )}

            {/* VIEW: What-If Parametric Simulation */}
            {activeTab === 'what_if' && (
              <WhatIfSimulationView machine={currentMachine} />
            )}

            {/* VIEW: Energy & Thermodynamic Analytics */}
            {activeTab === 'energy' && (
              <EnergyAnalyticsView
                machine={currentMachine}
                telemetryHistory={currentHistory}
              />
            )}

            {/* VIEW: Maintenance & Work Orders */}
            {activeTab === 'maintenance' && (
              <MaintenanceView
                machine={currentMachine}
                workOrders={workOrders}
                onAddWorkOrder={handleAddWorkOrder}
                onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
              />
            )}

            {/* VIEW: Operational Alerts & Alarm Feed */}
            {activeTab === 'alerts' && (
              <AlertCenter
                machine={currentMachine}
                onOpenWorkOrderModal={() => setActiveTab('maintenance')}
                onOpenAICopilot={() => setActiveTab('ai_copilot')}
              />
            )}

            {/* VIEW: Engineering Reports & Data Export */}
            {activeTab === 'reports' && (
              <ReportsView
                machine={currentMachine}
                telemetryHistory={currentHistory}
              />
            )}

            {/* VIEW: IoT Hardware Gateway & Ingestion */}
            {activeTab === 'iot_gateway' && (
              <IoTIntegrationView
                machine={currentMachine}
                onInjectExternalTelemetry={handleInjectExternalTelemetry}
              />
            )}

            {/* VIEW: System Settings & ISO Standards Configuration */}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
}
