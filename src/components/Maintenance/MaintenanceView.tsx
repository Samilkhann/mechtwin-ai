/**
 * MechTwin AI - Predictive Maintenance & Digital Work Order Management
 */

import React, { useState } from 'react';
import { Machine, WorkOrder } from '../../types';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ShieldAlert,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MaintenanceViewProps {
  machine: Machine;
  workOrders: WorkOrder[];
  onAddWorkOrder: (order: WorkOrder) => void;
  onUpdateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  machine,
  workOrders,
  onAddWorkOrder,
  onUpdateWorkOrderStatus,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // New Work Order Form State
  const [componentName, setComponentName] = useState('DE Drive-End Bearing (SKF 6208)');
  const [title, setTitle] = useState('Replace Bearing & Laser Align Shaft');
  const [description, setDescription] = useState('Vibration harmonics (BPFO 105.8 Hz) and elevated temperature indicate fatigue spall on outer raceway.');
  const [priority, setPriority] = useState<WorkOrder['priority']>('HIGH');
  const [technician, setTechnician] = useState('Marcus Vance (Vib Specialist Cat III)');
  const [estimatedHours, setEstimatedHours] = useState(3.5);
  const [requiredParts, setRequiredParts] = useState('SKF 6208 2Z C3 Deep Groove Ball Bearing, Shell Gadus S2 V220 Grease');

  const filteredOrders = filterStatus === 'ALL'
    ? workOrders
    : workOrders.filter(w => w.status === filterStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWO: WorkOrder = {
      id: `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      machineId: machine.id,
      machineName: machine.name,
      componentName,
      title,
      description,
      priority,
      status: 'OPEN',
      assignedTechnician: technician,
      createdDate: new Date().toISOString().split('T')[0],
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      estimatedHours,
      requiredParts: requiredParts.split(',').map(s => s.trim()),
    };

    onAddWorkOrder(newWO);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                PREDICTIVE MAINTENANCE & CMMS DIGITAL WORK ORDERS
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Closed-loop maintenance lifecycle integrated with Weibull remaining useful life (RUL) calculations.
            </p>
          </div>

          {/* Create Work Order CTA */}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/40"
          >
            <Plus className="w-4 h-4" />
            Create Work Order
          </button>
        </div>

        {/* Work Order KPI Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Total Work Orders</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{workOrders.length}</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Open / Pending</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {workOrders.filter(w => w.status === 'OPEN').length}
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">In Progress</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {workOrders.filter(w => w.status === 'IN_PROGRESS').length}
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Completed (This Month)</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {workOrders.filter(w => w.status === 'COMPLETED').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              filterStatus === status ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {status} ({status === 'ALL' ? workOrders.length : workOrders.filter(w => w.status === status).length})
          </button>
        ))}
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-400">{order.id}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  order.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                  order.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  {order.priority} PRIORITY
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                  order.status === 'IN_PROGRESS' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {order.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{order.title}</h3>
              <p className="text-xs text-slate-300">{order.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                <span>Machine: <strong className="text-slate-200">{order.machineName}</strong></span>
                <span>Component: <strong className="text-slate-200">{order.componentName}</strong></span>
                <span>Assigned: <strong className="text-slate-200">{order.assignedTechnician}</strong></span>
                <span>Est: <strong className="text-slate-200">{order.estimatedHours} hrs</strong></span>
              </div>

              {/* Required Parts Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-500">PARTS:</span>
                {order.requiredParts.map((part, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {part}
                  </span>
                ))}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {order.status === 'OPEN' && (
                <button
                  onClick={() => onUpdateWorkOrderStatus(order.id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
                >
                  Start Work
                </button>
              )}
              {order.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => onUpdateWorkOrderStatus(order.id, 'COMPLETED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  Mark Completed
                </button>
              )}
              {order.status === 'COMPLETED' && (
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  Closed & Verified
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Work Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                CREATE PREDICTIVE MAINTENANCE WORK ORDER
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Component</label>
                <select
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                >
                  {machine.components.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Work Order Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Root Cause & Diagnostic Observations</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as WorkOrder['priority'])}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="CRITICAL">Critical (Immediate Shutdown)</option>
                    <option value="HIGH">High (&lt; 48 Hours)</option>
                    <option value="MEDIUM">Medium (Next Scheduled PM)</option>
                    <option value="LOW">Low (Routine Inspection)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Reliability Specialist</label>
                <input
                  type="text"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Required Spare Parts & Lubricants (comma-separated)</label>
                <input
                  type="text"
                  value={requiredParts}
                  onChange={(e) => setRequiredParts(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-900/40"
                >
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
