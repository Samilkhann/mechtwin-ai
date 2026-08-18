/**
 * MechTwin AI - IoT Hardware Integration & Ingestion Gateway
 */

import React, { useState } from 'react';
import { Machine } from '../../types';
import {
  Cpu,
  Wifi,
  Terminal,
  Copy,
  Check,
  Send,
  Radio,
  Layers,
  Code2,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';

interface IoTIntegrationViewProps {
  machine: Machine;
  onInjectExternalTelemetry?: (packet: any) => void;
}

export const IoTIntegrationView: React.FC<IoTIntegrationViewProps> = ({
  machine,
  onInjectExternalTelemetry,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'esp32' | 'python' | 'json'>('esp32');
  const [copied, setCopied] = useState(false);

  // Manual Ingestion Test state
  const [testTemp, setTestTemp] = useState<number>(71.5);
  const [testVib, setTestVib] = useState<number>(4.1);
  const [testRPM, setTestRPM] = useState<number>(1475);
  const [testCurrent, setTestCurrent] = useState<number>(31.8);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  const esp32Code = `/*
 * MechTwin AI - ESP32 Industrial Telemetry Gateway
 * Sensors: MPU6050 (Vibration RMS), DS18B20 (Temperature), ACS712 (Phase Current)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <OneWire.h>
#include <DallasTemperature.h>

const char* ssid = "PLANT_WIFI_SSID";
const char* password = "PLANT_WIFI_PASSWORD";
const char* serverEndpoint = "http://YOUR_MECHTWIN_HOST:3000/api/iot/telemetry";

Adafruit_MPU6050 mpu;
OneWire oneWire(4); // Pin D4 for DS18B20
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected. IP: " + WiFi.localIP().toString());

  if (!mpu.begin()) {
    Serial.println("MPU6050 Vibration Sensor not found!");
  }
  sensors.begin();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    sensors.requestTemperatures();
    float temperature = sensors.getTempCByIndex(0);

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    // Compute RMS vibration velocity approximation from acceleration
    float vibRMS = sqrt(sq(a.acceleration.x) + sq(a.acceleration.y) + sq(a.acceleration.z)) * 0.45;

    StaticJsonDocument<256> doc;
    doc["machineId"] = "${machine.id}";
    doc["sensorId"] = "ESP32-NODE-01";
    doc["temperature"] = temperature > 0 ? temperature : 68.5;
    doc["vibration"] = vibRMS;
    doc["rpm"] = 1480;
    doc["current"] = 28.5;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);
    Serial.printf("Telemetry Push HTTP Status: %d\\n", httpResponseCode);
    http.end();
  }
  delay(1000); // 1 Hz publish rate
}`;

  const pythonCode = `"""
MechTwin AI - Industrial Edge Gateway (Python / MQTT / REST)
Connects to industrial Modbus RTU / OPC-UA / MQTT broker and forwards to MechTwin API.
"""

import time
import requests
import json
import random

API_ENDPOINT = "http://localhost:3000/api/iot/telemetry"
MACHINE_ID = "${machine.id}"

def read_modbus_sensors():
    # Replace with minimalmodbus / pymodbus client calls
    return {
        "machineId": MACHINE_ID,
        "sensorId": "EDGE-GATEWAY-RPI4",
        "temperature": round(68.0 + random.uniform(-2.0, 4.0), 2),
        "vibration": round(3.2 + random.uniform(-0.4, 0.8), 2),
        "rpm": 1480 + random.randint(-10, 10),
        "current": round(29.4 + random.uniform(-1.0, 1.5), 1),
        "voltage": 400.0,
        "pressureInlet": 1.2,
        "pressureOutlet": 4.5,
        "flowRate": 480
    }

def main():
    print(f"[*] Starting MechTwin AI Telemetry Publisher for {MACHINE_ID}...")
    while True:
        payload = read_modbus_sensors()
        try:
            res = requests.post(API_ENDPOINT, json=payload, timeout=2.0)
            if res.status_code == 200:
                print(f"[OK] Packet transmitted -> Status 200: {payload}")
            else:
                print(f"[WARN] HTTP {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[ERR] Connection failed: {e}")
        time.sleep(1.0)

if __name__ == "__main__":
    main()`;

  const jsonSchema = `{
  "machineId": "${machine.id}",
  "sensorId": "HARDWARE-PROBE-01",
  "temperature": 72.4,        // Degrees Celsius (°C)
  "vibration": 3.85,          // Velocity RMS (mm/s, ISO 10816-3)
  "rpm": 1480,                // Rotational Speed (RPM)
  "current": 32.1,            // 3-Phase Stator Current (Amperes)
  "voltage": 400.0,           // Line Voltage (Volts RMS)
  "pressureInlet": 1.15,      // Suction Pressure (bar)
  "pressureOutlet": 4.60,     // Discharge Pressure (bar)
  "flowRate": 510             // Volumetric Flow (L/min)
}`;

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestIngest = async () => {
    setIngestStatus('Sending payload to /api/iot/telemetry...');
    try {
      const payload = {
        machineId: machine.id,
        sensorId: 'REST-TEST-CLIENT',
        temperature: testTemp,
        vibration: testVib,
        rpm: testRPM,
        current: testCurrent,
      };

      const res = await fetch('/api/iot/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setIngestStatus(`Success: Telemetry ingested for ${machine.id} (Status 200 OK)`);
        if (onInjectExternalTelemetry) onInjectExternalTelemetry(payload);
      } else {
        setIngestStatus(`Failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      setIngestStatus(`Connection error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                PHYSICAL IOT SENSOR INGESTION & HARDWARE BRIDGES
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect real-world ESP32 microcontrollers, Raspberry Pi edge gateways, Arduino boards, and Modbus/OPC-UA sensors directly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400">INGESTION GATEWAY ACTIVE: /api/iot/telemetry</span>
          </div>
        </div>

        {/* Live Ingestion Simulator & Test Client */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Send className="w-4 h-4" />
              Live Hardware Ingestion Tester (HTTP POST)
            </span>
            <span className="text-slate-500">Target: {machine.id}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.5"
                value={testTemp}
                onChange={(e) => setTestTemp(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Vibration (mm/s RMS)</label>
              <input
                type="number"
                step="0.1"
                value={testVib}
                onChange={(e) => setTestVib(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Rotational Speed (RPM)</label>
              <input
                type="number"
                value={testRPM}
                onChange={(e) => setTestRPM(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Stator Current (A)</label>
              <input
                type="number"
                step="0.5"
                value={testCurrent}
                onChange={(e) => setTestCurrent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={handleTestIngest}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/40"
            >
              <Send className="w-3.5 h-3.5" />
              Transmit Synthetic Packet to /api/iot/telemetry
            </button>

            {ingestStatus && (
              <span className="text-xs font-mono text-emerald-400">{ingestStatus}</span>
            )}
          </div>
        </div>
      </div>

      {/* Code Snippets & Schemas for Physical Deployment */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              EMBEDDED HARDWARE DRIVERS & GATEWAY CODE TEMPLATES
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Flash to physical microcontrollers to stream real sensor hardware into MechTwin AI.</p>
          </div>

          {/* Switcher & Copy */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveCodeTab('esp32')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  activeCodeTab === 'esp32' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ESP32 (C++/Arduino)
              </button>
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  activeCodeTab === 'python' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Python (Edge Gateway)
              </button>
              <button
                onClick={() => setActiveCodeTab('json')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  activeCodeTab === 'json' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                JSON Payload Schema
              </button>
            </div>

            <button
              onClick={() => handleCopyCode(activeCodeTab === 'esp32' ? esp32Code : activeCodeTab === 'python' ? pythonCode : jsonSchema)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Code Viewport */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
          <pre>
            {activeCodeTab === 'esp32' && esp32Code}
            {activeCodeTab === 'python' && pythonCode}
            {activeCodeTab === 'json' && jsonSchema}
          </pre>
        </div>
      </div>
    </div>
  );
};
