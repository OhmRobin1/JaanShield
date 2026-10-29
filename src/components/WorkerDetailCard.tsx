import React from 'react';
import { ConstructionWorker, AlertThresholds } from '../types/JaanShield';
import { formatDuration } from '../utils/safetyRules';
import { safetyAudio } from '../utils/audio';
import { Coffee, Activity, CheckCircle2, AlertTriangle, AlertOctagon, User, Clock, BellRing } from 'lucide-react';

interface WorkerDetailCardProps {
  worker: ConstructionWorker;
  thresholds: AlertThresholds;
  onSendBreak: (workerId: string) => void;
  onToggleStress: (workerId: string) => void;
  isHindi: boolean;
}

export const WorkerDetailCard: React.FC<WorkerDetailCardProps> = ({
  worker,
  thresholds,
  onSendBreak,
  onToggleStress,
  isHindi,
}) => {
  const statusConfig = {
    0: {
      color: '#059669',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgChip: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderChip: 'border-emerald-200 dark:border-emerald-800',
      dotColor: 'bg-emerald-500',
      label: isHindi ? 'काम के लिए फिट' : 'Fit to work',
    },
    1: {
      color: '#d97706',
      textColor: 'text-amber-700 dark:text-amber-300',
      bgChip: 'bg-amber-50 dark:bg-amber-950/40',
      borderChip: 'border-amber-200 dark:border-amber-800',
      dotColor: 'bg-amber-500',
      label: isHindi ? 'चेतावनी' : 'Caution',
    },
    2: {
      color: '#dc2626',
      textColor: 'text-rose-700 dark:text-rose-300',
      bgChip: 'bg-rose-50 dark:bg-rose-950/40',
      borderChip: 'border-rose-200 dark:border-rose-800',
      dotColor: 'bg-rose-500',
      label: isHindi ? 'तुरंत आराम दें' : 'Rest now',
    },
  }[worker.level];

  // SVG coordinate transformation
  const py = (v: number) => {
    const clamped = Math.min(Math.max(v, 50), 180);
    return (118 - ((clamped - 50) / 130) * 108).toFixed(1);
  };

  const pts = worker.hrHistory
    .map((v, i) => {
      const x = ((i * 310) / Math.max(worker.hrHistory.length - 1, 1) + 5).toFixed(1);
      const y = py(v);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 shadow-sm">
      {/* Header with Name, Role & Status */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-fraunces font-bold text-lg md:text-xl text-[var(--ink)] m-0 leading-tight">
              {worker.name}
            </h2>
            <span className="font-mono-num text-[11px] font-bold text-[var(--muted)] bg-[var(--soft)] px-1.5 py-0.5 rounded">
              {worker.id}
            </span>
          </div>
          <div className="text-xs text-[var(--muted)] font-medium mt-0.5 flex items-center gap-1.5">
            <span>{worker.role}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>
                {isHindi ? 'अंतिम ब्रेक:' : 'Since break:'}{' '}
                <b className="text-[var(--ink)] font-mono-num">{formatDuration(worker.minutesSinceBreak)}</b>
              </span>
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap ${statusConfig.bgChip} ${statusConfig.borderChip} ${statusConfig.textColor}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* 30-Reading HR Timeline SVG Graph */}
      <div className="bg-[var(--soft)] p-2.5 rounded-xl border border-[var(--bd)]/60 my-2.5">
        <div className="flex justify-between items-center text-[10px] text-[var(--muted)] mb-1 font-sans-ui">
          <span className="font-semibold text-[var(--ink)]">
            {isHindi ? 'लाइव हृदय गति टाइमलाइन' : 'Live Heart Rate Stream'}
          </span>
          <div className="flex items-center gap-3 font-mono-num text-[10px]">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              -- {thresholds.hrY} Caution
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              -- {thresholds.hrR} Critical
            </span>
          </div>
        </div>

        <svg viewBox="0 0 320 126" className="w-full block overflow-visible">
          <defs>
            <linearGradient id="detailWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={statusConfig.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={statusConfig.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background horizontal guide lines */}
          <line x1="0" x2="320" y1="10" y2="10" stroke="var(--bd)" strokeWidth="0.8" opacity="0.4" />
          <line x1="0" x2="320" y1="64" y2="64" stroke="var(--bd)" strokeWidth="0.8" opacity="0.4" />
          <line x1="0" x2="320" y1="118" y2="118" stroke="var(--bd)" strokeWidth="0.8" opacity="0.4" />

          {/* Caution threshold line (dashed amber) */}
          <line
            x1="0"
            x2="320"
            y1={py(thresholds.hrY)}
            y2={py(thresholds.hrY)}
            stroke="#d97706"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Critical threshold line (dashed red) */}
          <line
            x1="0"
            x2="320"
            y1={py(thresholds.hrR)}
            y2={py(thresholds.hrR)}
            stroke="#dc2626"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Gradient area under curve */}
          {worker.hrHistory.length > 1 && (
            <polygon
              points={`5,120 ${pts} 315,120`}
              fill="url(#detailWaveGrad)"
            />
          )}

          {/* HR timeline polyline */}
          <polyline
            points={pts}
            fill="none"
            stroke={statusConfig.color}
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Latest reading cursor dot */}
          {worker.hrHistory.length > 0 && (
            <g>
              <circle
                cx="315"
                cy={py(worker.hr)}
                r="4.5"
                fill={statusConfig.color}
                stroke="var(--card)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        <div className="flex justify-between items-center text-[10px] text-[var(--muted)] mt-1 font-mono-num">
          <span>T - 60s</span>
          <span className="font-bold text-[var(--ink)]">CURRENT: {Math.round(worker.hr)} BPM</span>
          <span>NOW</span>
        </div>
      </div>

      {/* Triggered Rule Explanations */}
      <div className="my-2.5">
        <div className="text-xs font-bold text-[var(--ink)] mb-1 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-500" />
          <span>{isHindi ? 'स्वास्थ्य स्थिति व नियम समीक्षा' : 'Rule-based evaluation:'}</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {worker.restRemaining > 0 ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>
                {isHindi
                  ? `विश्राम जारी (शेष समय: ~${worker.restRemaining * 2} सेकंड)`
                  : `Hydration break in progress (~${worker.restRemaining * 2}s recovery period remaining)`}
              </span>
            </div>
          ) : worker.reasons.length > 0 ? (
            worker.reasons.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2 rounded-lg border leading-tight ${
                  r.includes('critical')
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                {r.includes('critical') ? (
                  <AlertOctagon className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                )}
                <span>{r}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{isHindi ? 'सभी स्वास्थ्य पैरामीटर सुरक्षित सीमा में हैं' : 'All parameters within occupational safety thresholds'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Send break & Simulate stress */}
      <div className="flex flex-wrap gap-2.5 mt-3 pt-3 border-t border-[var(--bd)]">
        <button
          onClick={() => {
            safetyAudio.playBreakGranted();
            safetyAudio.playWearableBuzzer();
            onSendBreak(worker.id);
          }}
          type="button"
          className="flex-1 flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-[#0f172a] py-2.5 px-3 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Coffee className="w-4 h-4 text-amber-400 dark:text-[#0f172a]" />
          <span>{isHindi ? 'ब्रेक भेजें (वाइब्रेट)' : 'Send Rest Break (Vibrate)'}</span>
        </button>

        <button
          onClick={() => {
            safetyAudio.playClick();
            onToggleStress(worker.id);
          }}
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold border transition-all shadow-sm ${
            worker.stressActive
              ? 'bg-rose-500/15 border-rose-500/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
              : 'bg-[var(--soft)] border-[var(--bd)] text-[var(--ink)] hover:bg-[var(--bd)]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>
            {worker.stressActive
              ? isHindi ? 'तनाव हटाएँ' : 'Clear Physical Stress'
              : isHindi ? 'शारीरिक तनाव सिमुलेट करें' : 'Simulate Heavy Exertion'}
          </span>
        </button>
      </div>
    </div>
  );
};
