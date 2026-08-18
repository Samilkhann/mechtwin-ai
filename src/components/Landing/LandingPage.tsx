/**
 * MECHTWIN AI - Enterprise Product Landing Page & Interactive Showcase
 * "Turn Machines Into Intelligent Digital Twins."
 * Created & Engineered by Samil Khan
 */

import React from 'react';
import {
  Layers,
  Activity,
  Sparkles,
  ShieldCheck,
  Cpu,
  Calculator,
  ArrowRight,
  Zap,
  Gauge,
  Compass,
  Sliders,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { MechTwinLogo } from '../Common/MechTwinLogo';

interface LandingPageProps {
  onLaunchPlatform: (initialTab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchPlatform }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Top Global Navigation Header */}
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <MechTwinLogo size="md" />

        <div className="hidden md:flex items-center gap-8 text-xs font-mono text-slate-300">
          <a href="#digital-twin" className="hover:text-cyan-400 transition-colors">
            DIGITAL TWIN
          </a>
          <a href="#predictive" className="hover:text-cyan-400 transition-colors">
            PREDICTIVE AI
          </a>
          <a href="#engineering" className="hover:text-cyan-400 transition-colors">
            ENGINEERING SOLVER
          </a>
          <a href="#iot" className="hover:text-cyan-400 transition-colors">
            INDUSTRIAL IoT
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onLaunchPlatform('overview')}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
          >
            Launch Platform
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section with Connected Pipeline Visualization */}
      <section className="relative px-6 sm:px-12 pt-16 pb-24 overflow-hidden border-b border-slate-800/80">
        {/* Subtle Engineering Technical Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Brand Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>&ldquo;Engineering Intelligence for Every Machine.&rdquo;</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-sans tracking-tight text-white leading-tight">
            Turn Machines Into{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Intelligent Digital Twins
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-sans leading-relaxed">
            AI-powered predictive maintenance and engineering intelligence for modern mechanical systems.
            Simulate real-time kinematics, predict bearing fatigue (ISO 281), and eliminate unplanned downtime.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onLaunchPlatform('overview')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-900/40 transition-all cursor-pointer"
            >
              Launch Live Workspace
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onLaunchPlatform('digital_twin')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              Explore 3D Digital Twin
            </button>
          </div>

          {/* Connected Data Flow Diagram */}
          <div className="pt-14">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
              END-TO-END INDUSTRIAL INTELLIGENCE PIPELINE
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-900/90 border border-slate-800 p-3 rounded-xl max-w-4xl mx-auto font-mono text-xs shadow-2xl">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center">
                <span className="text-slate-500 text-[10px]">01</span>
                <span className="text-slate-200 font-bold mt-1">Physical Machine</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center">
                <span className="text-slate-500 text-[10px]">02</span>
                <span className="text-cyan-400 font-bold mt-1">Sensors</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center">
                <span className="text-slate-500 text-[10px]">03</span>
                <span className="text-sky-400 font-bold mt-1">Telemetry</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-cyan-500/40 bg-cyan-950/20 flex flex-col items-center justify-center">
                <span className="text-cyan-400 text-[10px]">04</span>
                <span className="text-white font-bold mt-1">Digital Twin</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center">
                <span className="text-slate-500 text-[10px]">05</span>
                <span className="text-amber-400 font-bold mt-1">AI Analysis</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/40 bg-emerald-950/20 flex flex-col items-center justify-center">
                <span className="text-emerald-400 text-[10px]">06</span>
                <span className="text-emerald-300 font-bold mt-1">Predictive Action</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Deep Dives */}
      <section id="digital-twin" className="px-6 sm:px-12 py-20 max-w-6xl mx-auto space-y-16">
        {/* Section 1: Digital Twin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              3D CAD ASSEMBLY & KINEMATICS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Visualize the machine as an intelligent engineering system.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every mechanical component—motor windings, drive bearings, flexible coupling, and hydraulic volute—is
              faithfully rendered in 3D WebGL. Switch dynamically between CAD rendering, ISO vibration heatmaps,
              operating thermal gradients, and particle fluid streamlines.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onLaunchPlatform('digital_twin')}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-xs font-bold flex items-center gap-2"
              >
                Inspect MT-001 Digital Twin <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4 font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400">REFERENCE: MT-001 Centrifugal Pump</span>
              <span className="text-xs text-emerald-400 font-bold">HEALTH 94 / 100</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px]">DE BEARING (SKF 6208)</span>
                <div className="text-sm font-bold text-white mt-1">68.2 °C | 3.4 mm/s</div>
                <div className="text-[10px] text-amber-400">RUL: 31 Days (Estimated)</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px]">ELECTRIC MOTOR</span>
                <div className="text-sm font-bold text-white mt-1">1480 RPM | 4.8 kW</div>
                <div className="text-[10px] text-emerald-400">Status: NORMAL (Class F)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Predictive Intelligence & Anomaly Center */}
        <div id="predictive" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pt-10">
          <div className="order-2 lg:order-1 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-3 font-mono shadow-2xl">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              ANOMALY INVESTIGATION: BPFO DEFECT
            </div>
            <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div>• Harmonic Frequency: <strong>105.8 Hz (Outer Ring)</strong></div>
              <div>• ISO 10816-3 Limit: <strong>2.8 mm/s → Current: 3.4 mm/s</strong></div>
              <div>• Confidence Index: <strong>91% Quantitative Evidence</strong></div>
            </div>
            <div className="text-[11px] text-cyan-300 bg-cyan-950/40 p-2.5 rounded border border-cyan-800/40">
              Recommended: Lubricate with 15g Shell Gadus S2 V220; schedule laser alignment.
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              PREDICTIVE RELIABILITY & ANOMALIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Identify abnormal behavior before catastrophic failure.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Detect subtle micro-spalling, dynamic rotor imbalance, and cavitation onset weeks before vibration
              crosses tripwire levels. Powered by transparent engineering equations (ISO 281 L10h fatigue life).
            </p>
            <div className="pt-2">
              <button
                onClick={() => onLaunchPlatform('anomalies')}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-xs font-bold flex items-center gap-2"
              >
                Open Anomaly Center <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: AI Engineering Copilot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pt-10">
          <div className="space-y-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              RELIABILITY COPILOT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Understand machine behavior through contextual AI.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlike generic chatbots, the MECHTWIN Copilot understands real-time sensor streams, IEC 60034 thermal
              ratings, and ISO vibration zones. Responses follow strict 6-part engineering rigor: Observation,
              Analysis, Evidence, Possible Causes, Recommended Action, and Confidence %.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onLaunchPlatform('ai_copilot')}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-xs font-bold flex items-center gap-2"
              >
                Consult AI Copilot <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-3 font-mono shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4" />
              <span>MECHTWIN AI COPILOT • MT-001 CONTEXT ACTIVE</span>
            </div>
            <div className="space-y-2 text-slate-300">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px]">QUERY:</span> Why is vibration increasing on Bearing 01?
              </div>
              <div className="bg-cyan-950/30 p-2.5 rounded border border-cyan-900/40 text-cyan-200">
                <span className="text-cyan-400 font-bold">ANALYSIS:</span> 14% elevation in 1X/2X harmonics correlates with mechanical load increase to 95%. Lubricant film degradation index at 65%.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Creator Credit & Technology Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6 sm:px-12 text-slate-400 font-mono text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <MechTwinLogo size="md" />

          <div className="text-center sm:text-right space-y-1">
            <div className="text-slate-300 font-semibold">
              MECHTWIN AI — Intelligent Digital Twin Platform
            </div>
            <div className="text-cyan-400 font-medium">
              Created & Engineered by <strong className="text-white">Samil Khan</strong>
            </div>
            <div className="text-[10px] text-slate-500">
              ISO 10816-3 • IEC 60034-1 • ISO 281 L10h • IEC 62682 Compliance
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
