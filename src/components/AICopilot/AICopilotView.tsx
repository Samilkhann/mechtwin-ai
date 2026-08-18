import { GoogleGenAI } from '@google/genai';
/**
 * MechTwin AI - AI Mechanical Engineering Copilot View
 */ 

import React, { useState, useRef, useEffect } from 'react';
import { Machine } from '../../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Activity,
  Thermometer,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';

interface AICopilotViewProps {
  machine: Machine;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  engine?: string;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({ machine }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### MechTwin AI Engineering Copilot Ready

I have loaded telemetry and kinematic models for **${machine.name}** (Tag: \`${machine.id}\`).

**Current Real-Time State:**
- **Health Score:** ${machine.healthBreakdown.overallScore} / 100 (${machine.healthBreakdown.status})
- **Vibration Velocity:** ${machine.latestTelemetry.vibration.toFixed(2)} mm/s RMS (Kurtosis: ${machine.latestTelemetry.vibrationKurtosis.toFixed(2)})
- **Temperature:** ${machine.latestTelemetry.temperature.toFixed(1)} °C
- **Speed & Power:** ${machine.latestTelemetry.rpm} RPM | ${machine.latestTelemetry.power.toFixed(1)} kW
- **Active Faults:** ${machine.activeFaults.length ? machine.activeFaults.map(f => f.faultType).join(', ') : 'None detected'}

How can I assist you with failure mode root cause analysis, ISO standards, or maintenance scheduling?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'gemini-2.5-flash',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'Diagnose current vibration & bearing kinematic state according to ISO 10816-3.',
    'Explain the physics and root causes of hydraulic cavitation in centrifugal pumps.',
    'Calculate remaining useful life (RUL) and lubrication intervals for DE bearing.',
    'Evaluate electric motor thermal rise and insulation aging under IEC 60034-1.',
    'Provide step-by-step laser shaft alignment tolerances and corrective steps.',
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ 
        apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || ''
      });

      const promptContext = `System Context: You are MechTwin AI, an expert mechanical engineering copilot.
Machine Context: ${machine.name} (ID: ${machine.id})
Health Score: ${machine.healthBreakdown.overallScore}/100 (${machine.healthBreakdown.status})
Telemetry: Temp: ${machine.latestTelemetry.temperature}°C, Vibration: ${machine.latestTelemetry.vibration}mm/s RMS, RPM: ${machine.latestTelemetry.rpm}, Power: ${machine.latestTelemetry.power}kW.
Active Faults: ${machine.activeFaults.map(f => f.faultType).join(', ') || 'None'}

User Query: ${textToSend}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContext,
      });

      const dataText = response.text || 'No response generated from engineering copilot.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: dataText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: 'gemini-2.5-flash',
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error invoking AI copilot:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Encountered error while connecting to engineering intelligence server. Please check your Gemini API key.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
      {/* 1. Active Telemetry Context Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              MECHTWIN AI COPILOT
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                GEMINI 2.5 FLASH / PHYSICS HYBRID
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Contextualized with live telemetry of {machine.name}</div>
          </div>
        </div>

        {/* Live Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{machine.latestTelemetry.vibration.toFixed(2)} mm/s</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>{machine.latestTelemetry.temperature.toFixed(1)} °C</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{machine.healthBreakdown.overallScore}/100</span>
          </div>
        </div>
      </div>

      {/* 2. Chat Log Messages Area */}
      <div className="flex-1 bg-slate-900/60 rounded-xl border border-slate-800 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 max-w-4xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.sender === 'user' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-cyan-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-xl text-xs leading-relaxed space-y-2 relative group ${
                msg.sender === 'user'
                  ? 'bg-cyan-600/90 text-white rounded-tr-none'
                  : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800/60">
                <span>{msg.sender === 'user' ? 'You (Reliability Lead)' : `MechTwin AI Engine [${msg.engine || 'Gemini'}]`}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Body */}
              <div className="prose prose-invert prose-xs max-w-none text-slate-200 space-y-2 whitespace-pre-line font-sans">
                {msg.text}
              </div>

              {/* Copy Button */}
              {msg.sender === 'ai' && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="absolute bottom-2 right-2 p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy response"
                >
                  {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-xl max-w-md">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-slate-300 font-mono">MechTwin AI is computing kinematic equations and analyzing ISO standards...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Engineering Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Suggested:
        </div>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-colors"
          >
            {prompt.length > 48 ? prompt.slice(0, 48) + '...' : prompt}
          </button>
        ))}
      </div>

      {/* 4. Input Bar */}
      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl shadow-xl">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask engineering copilot about bearing life, vibration frequencies, cavitation, ISO 10816..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputMessage.trim()}
          className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/40"
        >
          <Send className="w-3.5 h-3.5" />
          Analyze
        </button>
      </div>
    </div>
  );
};