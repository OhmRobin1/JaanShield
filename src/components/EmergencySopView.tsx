import React from 'react';
import { safetyAudio } from '../utils/audio';
import { HeartPulse, PhoneCall, AlertOctagon, CheckCircle2, ShieldAlert, Thermometer, UserCheck } from 'lucide-react';

interface EmergencySopViewProps {
  isHindi: boolean;
}

export const EmergencySopView: React.FC<EmergencySopViewProps> = ({ isHindi }) => {
  return (
    <div className="space-y-5">
      {/* Top Warning Banner */}
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl p-4 md:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500 text-white shadow-sm shrink-0">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-fraunces font-bold text-lg md:text-xl text-rose-900 dark:text-rose-100 m-0 leading-tight">
                {isHindi ? 'हीट स्ट्रोक आपातकालीन एसओपी व प्राथमिक उपचार' : 'Heat Stroke Emergency First-Aid SOP'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                CRITICAL LIFE-SAFETY
              </span>
            </div>
            <p className="text-xs text-rose-800/90 dark:text-rose-200/90 m-0 font-medium mt-0.5">
              {isHindi
                ? 'निर्माण स्थल पर किसी मज़दूर के चक्कर आने या बेहोश होने पर तत्काल 5-चरणीय जीवन रक्षक प्रोटोकॉल'
                : 'Rapid 5-step life-saving response protocol to prevent heat stress fatalities on site'}
            </p>
          </div>
        </div>

        {/* Rapid Call 108 */}
        <a
          href="tel:108"
          onClick={() => safetyAudio.playClick()}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>{isHindi ? 'तुरंत 108 एम्बुलेंस डायल करें' : 'Call 108 National Ambulance'}</span>
        </a>
      </div>

      {/* Triage Matrix: Heat Exhaustion vs Heat Stroke */}
      <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-5 shadow-sm space-y-3">
        <b className="text-sm font-bold text-[var(--ink)] block">
          {isHindi ? 'लक्षण पहचान: हीट थकावट बनाम हीट स्ट्रोक' : 'Triage Comparison: Heat Exhaustion vs Heat Stroke'}
        </b>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Heat Exhaustion (Warning) */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800/60">
              <b className="text-amber-800 dark:text-amber-200 text-sm">
                {isHindi ? '1. हीट थकावट (Heat Exhaustion)' : 'Heat Exhaustion (Early Warning)'}
              </b>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                Action: Rest & Hydrate
              </span>
            </div>
            <ul className="m-0 pl-4 space-y-1 text-amber-900/90 dark:text-amber-200/90">
              <li>Heavy sweating, cold and clammy skin</li>
              <li>Fast, weak pulse; normal or slightly elevated skin temp</li>
              <li>Muscle cramps, dizziness, nausea, fatigue</li>
              <li>Worker is conscious and able to swallow fluids</li>
            </ul>
          </div>

          {/* Heat Stroke (Critical Emergency) */}
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-800/60">
              <b className="text-rose-800 dark:text-rose-200 text-sm">
                {isHindi ? '2. हीट स्ट्रोक (Heat Stroke - अति आपातकाल)' : 'Heat Stroke (Medical Emergency)'}
              </b>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
                Life Threatening
              </span>
            </div>
            <ul className="m-0 pl-4 space-y-1 text-rose-900/90 dark:text-rose-200/90">
              <li>High body temperature (&gt;39.5°C / 103°F)</li>
              <li>Hot, red, dry skin OR heavy sweating that suddenly stops</li>
              <li>Rapid, strong pulse; confusion, slurred speech, collapse</li>
              <li>Unconscious, seizures — DO NOT force oral fluids</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5-Step Action Protocol */}
      <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-5 shadow-sm space-y-4">
        <b className="text-sm font-bold text-[var(--ink)] block pb-2 border-b border-[var(--bd)]">
          {isHindi ? '5-चरणीय आपातकालीन प्राथमिक उपचार प्रोटोकॉल' : '5-Step Immediate Life-Saving Action Protocol'}
        </b>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/60 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-mono-num text-xs">
              1
            </div>
            <b className="text-[var(--ink)] block">Move to Shade</b>
            <p className="text-[var(--muted)] m-0 leading-tight">
              Immediately move the worker out of direct sunlight to a cool, shaded canopy or air-conditioned cabin.
            </p>
          </div>

          <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/60 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-mono-num text-xs">
              2
            </div>
            <b className="text-[var(--ink)] block">Loosen Gear</b>
            <p className="text-[var(--muted)] m-0 leading-tight">
              Remove hardhat, heavy safety boots, reflective jacket, and unbutton tight clothing to enable heat dissipation.
            </p>
          </div>

          <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/60 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-mono-num text-xs">
              3
            </div>
            <b className="text-[var(--ink)] block">Active Cooling</b>
            <p className="text-[var(--muted)] m-0 leading-tight">
              Apply cold wet towels or ice packs to neck, armpits, and groin. Fan continuously to accelerate evaporative cooling.
            </p>
          </div>

          <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/60 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-mono-num text-xs">
              4
            </div>
            <b className="text-[var(--ink)] block">Sip Cold Fluids</b>
            <p className="text-[var(--muted)] m-0 leading-tight">
              If conscious, provide small sips of cool water with ORS. If vomiting or disoriented, turn on side in recovery position.
            </p>
          </div>

          <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/60 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-mono-num text-xs">
              5
            </div>
            <b className="text-[var(--ink)] block">Hospital Transport</b>
            <p className="text-[var(--muted)] m-0 leading-tight">
              Alert the on-site ambulance driver and transport to nearest designated ESIC hospital emergency room immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Directory Contacts */}
      <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-5 shadow-sm space-y-3">
        <b className="text-sm font-bold text-[var(--ink)] block pb-2 border-b border-[var(--bd)]">
          {isHindi ? 'कार्यस्थल आपातकालीन संपर्क निर्देशिका' : 'Site Emergency Response Contacts'}
        </b>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[var(--soft)] border border-[var(--bd)]/60">
            <b className="text-[var(--ink)] block">National Ambulance (Free Service)</b>
            <span className="text-sm font-mono-num font-bold text-rose-600 block my-0.5">Dial: 108 / 102</span>
            <span className="text-[11px] text-[var(--muted)]">24x7 Government Emergency Response</span>
          </div>

          <div className="p-3 rounded-lg bg-[var(--soft)] border border-[var(--bd)]/60">
            <b className="text-[var(--ink)] block">Site Safety Officer (Rajesh Verma)</b>
            <span className="text-sm font-mono-num font-bold text-[var(--ink)] block my-0.5">+91 98765 43210</span>
            <span className="text-[11px] text-[var(--muted)]">Tower A Ground Control Room · Ext 104</span>
          </div>

          <div className="p-3 rounded-lg bg-[var(--soft)] border border-[var(--bd)]/60">
            <b className="text-[var(--ink)] block">Nearest ESIC Hospital & Trauma Center</b>
            <span className="text-sm font-mono-num font-bold text-[var(--ink)] block my-0.5">+91 11 2541 9988</span>
            <span className="text-[11px] text-[var(--muted)]">Distance: 3.8 km · Dedicated Heat Ward</span>
          </div>
        </div>
      </div>
    </div>
  );
};
