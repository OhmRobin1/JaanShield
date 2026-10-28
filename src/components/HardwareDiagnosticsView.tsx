import React, { useState } from 'react';
import { ConstructionWorker } from '../types/jaanband';
import { safetyAudio } from '../utils/audio';
import { Cpu, BatteryCharging, Radio, Vibrate, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

interface HardwareDiagnosticsViewProps {
  workers: ConstructionWorker[];
  isHindi: boolean;
}

export const HardwareDiagnosticsView: React.FC<HardwareDiagnosticsViewProps> = ({
  workers,
  isHindi,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);

  // Simulated hardware diagnostics
  const getDeviceStats = (workerId: string) => {
    const batteryMap: { [key: string]: number } = {
      W01: 94,
      W02: 88,
      W03: 98,
      W04: 76,
      W05: 91,
      W06: 84,
      W07: 89,
      W08: 82,
    };
    const rssiMap: { [key: string]: number } = {
      W01: -58,
      W02: -64,
      W03: -52,
      W04: -69,
      W05: -61,
      W06: -55,
      W07: -63,
      W08: -66,
    };

    return {
      battery: batteryMap[workerId] || 85,
      rssi: rssiMap[workerId] || -60,
      firmware: 'v2.4.1-bocw',
      sensorPPG: 'MAX30102 (OK)',
      sensorIR: 'MLX90614 (Calibrated)',
      vibrator: 'Haptic ERM 3V',
    };
  };

  const handleTestBuzzer = (workerId: string) => {
    safetyAudio.playWearableBuzzer();
    setTestingId(workerId);
    setTimeout(() => setTestingId(null), 1800);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Cpu className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-fraunces font-bold text-lg md:text-xl text-[var(--ink)] m-0 leading-tight">
                {isHindi ? 'ESP32 वियरेबल्स व हार्डवेयर स्थिति' : 'Wearable Hardware & IoT Node Fleet'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                8 Nodes Online
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] m-0 font-medium mt-0.5">
              {isHindi
                ? 'कलाई पर बंधे ESP32 बैंड्स, MAX30102 ऑप्टिकल पल्स व MLX90614 स्किन तापमान सेंसर की लाइव निगरानी'
                : 'Live diagnostic telemetry from wristbands: battery levels, sensor contacts, and buzzer actuators'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-num text-[var(--muted)] bg-[var(--soft)] px-3 py-1.5 rounded-lg border border-[var(--bd)]">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>GATEWAY: ESP-MESH / MQTT 2.4 GHz</span>
        </div>
      </div>

      {/* Hardware Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workers.map((w) => {
          const stats = getDeviceStats(w.id);
          const isTesting = testingId === w.id;

          return (
            <div
              key={w.id}
              className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 shadow-sm space-y-3 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-1 pb-2 border-b border-[var(--bd)]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <b className="text-sm font-bold text-[var(--ink)]">{w.name}</b>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] font-mono-num font-semibold">
                    BAND ID: {w.id} ({w.role})
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Sync OK</span>
                </span>
              </div>

              {/* Hardware Metrics */}
              <div className="space-y-2 text-xs font-mono-num">
                {/* Battery */}
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)] font-sans-ui flex items-center gap-1.5 text-[11px]">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Battery</span>
                  </span>
                  <span className="font-bold text-[var(--ink)]">{stats.battery}%</span>
                </div>

                {/* Signal RSSI */}
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)] font-sans-ui flex items-center gap-1.5 text-[11px]">
                    <Radio className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Signal RSSI</span>
                  </span>
                  <span className="font-bold text-[var(--ink)]">{stats.rssi} dBm</span>
                </div>

                {/* PPG & Temp Sensor */}
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[var(--muted)] font-sans-ui">Optical PPG:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.sensorPPG}</span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[var(--muted)] font-sans-ui">IR Skin Sensor:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.sensorIR}</span>
                </div>
              </div>

              {/* Ping Buzzer Test Trigger */}
              <div className="pt-2 border-t border-[var(--bd)]">
                <button
                  onClick={() => handleTestBuzzer(w.id)}
                  type="button"
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                    isTesting
                      ? 'bg-amber-500 text-slate-900 animate-pulse'
                      : 'bg-[var(--soft)] hover:bg-[var(--bd)] text-[var(--ink)] border border-[var(--bd)]'
                  }`}
                >
                  <Vibrate className={`w-3.5 h-3.5 ${isTesting ? 'animate-bounce' : 'text-amber-500'}`} />
                  <span>{isTesting ? (isHindi ? 'कंपन जारी...' : 'Vibrating Wristband...') : (isHindi ? 'वाइब्रेशन टेस्ट करें' : 'Test Wearable Buzzer')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
