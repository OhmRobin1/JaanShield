import React, { useState } from 'react';
import { Cpu, Send, CheckCircle2, Copy, Radio, Sparkles } from 'lucide-react';
import { safetyAudio } from '../utils/audio';

interface WearableConnectCardProps {
  onSimulateIncomingPacket: (packet: { worker_id: string; hr: number; spo2: number; skin_c: number }) => void;
  isHindi: boolean;
}

export const WearableConnectCard: React.FC<WearableConnectCardProps> = ({
  onSimulateIncomingPacket,
  isHindi,
}) => {
  const [copied, setCopied] = useState(false);
  const [packetDispatched, setPacketDispatched] = useState(false);

  const samplePayload = {
    worker_id: 'W03',
    hr: 112,
    spo2: 96,
    skin_c: 35.2,
    ts: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(samplePayload, null, 2);

  const copyToClipboard = () => {
    safetyAudio.playClick();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = () => {
    safetyAudio.playWearableBuzzer();
    setPacketDispatched(true);
    onSimulateIncomingPacket({
      worker_id: 'W03',
      hr: 112,
      spo2: 96,
      skin_c: 35.2,
    });
    setTimeout(() => setPacketDispatched(false), 2000);
  };

  return (
    <section className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-fraunces font-bold text-base text-[var(--ink)] m-0 leading-tight">
                {isHindi ? 'वास्तविक ESP32 वियरेबल से कनेक्ट करें' : 'Connect real wearable'}
              </h2>
              <span className="text-[10px] text-[var(--muted)]">Hardware Ingestion Gateway</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>MQTT / REST</span>
          </span>
        </div>

        <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
          {isHindi
            ? 'आपका ESP32 (MAX30102 PPG + MLX90614 IR सेंसर) हर 3-5 सेकंड में यह JSON पेलोड बैकएंड को भेजता है:'
            : 'Wrist wearable (ESP32 + MAX30102 PPG + MLX90614 IR sensors) transmits this payload via MQTT or HTTP POST:'}
        </p>

        {/* JSON Preview block with sleek dark theme */}
        <div className="relative group">
          <pre className="bg-slate-900 text-slate-100 border border-slate-700/80 rounded-xl p-3 font-mono-num text-[11px] overflow-x-auto m-0 leading-relaxed shadow-inner">
            <span className="text-slate-400">&#123;</span>{'\n'}
            {'  '}<span className="text-amber-400">"worker_id"</span>: <span className="text-emerald-400">"{samplePayload.worker_id}"</span>,{'\n'}
            {'  '}<span className="text-amber-400">"hr"</span>: <span className="text-cyan-400">{samplePayload.hr}</span>,{'\n'}
            {'  '}<span className="text-amber-400">"spo2"</span>: <span className="text-cyan-400">{samplePayload.spo2}</span>,{'\n'}
            {'  '}<span className="text-amber-400">"skin_c"</span>: <span className="text-cyan-400">{samplePayload.skin_c}</span>,{'\n'}
            {'  '}<span className="text-amber-400">"ts"</span>: <span className="text-emerald-400">"{samplePayload.ts}"</span>{'\n'}
            <span className="text-slate-400">&#125;</span>
          </pre>

          <button
            onClick={copyToClipboard}
            type="button"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-600 shadow-sm"
            title="Copy JSON Payload"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Interactive IoT Dispatch Button */}
      <div className="mt-3.5 pt-2.5 border-t border-[var(--bd)]">
        <button
          onClick={handleDispatch}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 border border-slate-700 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-98"
        >
          <Send className={`w-3.5 h-3.5 ${packetDispatched ? 'text-emerald-400 animate-bounce' : 'text-amber-400'}`} />
          <span>
            {packetDispatched
              ? isHindi ? 'पेलोड सफलता से प्राप्त हुआ!' : 'ESP32 Ingest Acknowledged!'
              : isHindi ? 'टेस्ट ESP32 पैकेट भेजें' : 'Simulate Incoming ESP32 Packet'}
          </span>
        </button>
      </div>
    </section>
  );
};
