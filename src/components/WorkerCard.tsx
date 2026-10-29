import React from 'react';
import { ConstructionWorker } from '../types/JaanShield';
import { safetyAudio } from '../utils/audio';
import { Heart, Activity, Thermometer, Wind, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface WorkerCardProps {
  worker: ConstructionWorker;
  isSelected: boolean;
  onSelect: (worker: ConstructionWorker) => void;
  isHindi: boolean;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  isSelected,
  onSelect,
  isHindi,
}) => {
  // Color configuration by level
  const statusConfig = {
    0: {
      color: '#059669', // Emerald
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgChip: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderChip: 'border-emerald-200 dark:border-emerald-800',
      borderLeft: 'border-l-emerald-500',
      strokeGradStart: '#10b981',
      strokeGradEnd: '#059669',
      fillColor: 'rgba(16, 185, 129, 0.12)',
      label: isHindi ? 'काम के लिए फिट' : 'Fit to work',
      dotColor: 'bg-emerald-500',
      dotAnim: '',
    },
    1: {
      color: '#d97706', // Amber
      textColor: 'text-amber-700 dark:text-amber-300',
      bgChip: 'bg-amber-50 dark:bg-amber-950/40',
      borderChip: 'border-amber-200 dark:border-amber-800',
      borderLeft: 'border-l-amber-500',
      strokeGradStart: '#fbbf24',
      strokeGradEnd: '#d97706',
      fillColor: 'rgba(245, 158, 11, 0.14)',
      label: isHindi ? 'चेतावनी' : 'Caution',
      dotColor: 'bg-amber-500',
      dotAnim: '',
    },
    2: {
      color: '#dc2626', // Red
      textColor: 'text-rose-700 dark:text-rose-300',
      bgChip: 'bg-rose-50 dark:bg-rose-950/40',
      borderChip: 'border-rose-200 dark:border-rose-800',
      borderLeft: 'border-l-rose-500',
      strokeGradStart: '#f87171',
      strokeGradEnd: '#dc2626',
      fillColor: 'rgba(220, 38, 38, 0.16)',
      label: isHindi ? 'तुरंत आराम दें' : 'Rest now',
      dotColor: 'bg-rose-500',
      dotAnim: 'animate-pulse-dot',
    },
  }[worker.level];

  // SVG Sparkline path for last 30 heart rate readings
  const getSparklinePoints = (history: number[]) => {
    if (history.length < 2) return { line: '', area: '' };
    const minHR = 50;
    const maxHR = 170;
    const points = history.map((val, idx) => {
      const x = ((idx * 100) / Math.max(history.length - 1, 1)).toFixed(1);
      const clamped = Math.min(Math.max(val, minHR), maxHR);
      const y = (26 - ((clamped - minHR) / (maxHR - minHR)) * 22).toFixed(1);
      return `${x},${y}`;
    });

    const linePoints = points.join(' ');
    const areaPoints = `0,26 ${linePoints} 100,26`;
    return { line: linePoints, area: areaPoints };
  };

  const { line, area } = getSparklinePoints(worker.hrHistory);

  // Reason text
  const reasonText =
    worker.restRemaining > 0
      ? isHindi ? 'आराम पर (ब्रेक जारी)' : 'On break · Cooling down'
      : worker.reasons.length > 0
      ? `${worker.reasons[0]}${worker.reasons.length > 1 ? ` +${worker.reasons.length - 1} more` : ''}`
      : isHindi ? 'सभी रीडिंग सामान्य' : 'All readings within limits';

  // Worker initials
  const initials = worker.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div
      onClick={() => {
        safetyAudio.playClick();
        onSelect(worker);
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(worker);
        }
      }}
      className={`bg-[var(--card)] border border-[var(--bd)] border-l-[4px] rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none shadow-xs hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden ${
        statusConfig.borderLeft
      } ${
        isSelected
          ? 'ring-2 ring-[#0f172a] dark:ring-amber-400 bg-slate-50/50 dark:bg-slate-800/30'
          : ''
      }`}
    >
      {/* Top Header: Avatar + Name + Chip */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            {initials}
          </div>
          <div>
            <b className="block text-sm font-bold text-[var(--ink)] truncate max-w-[125px] leading-tight">
              {worker.name}
            </b>
            <div className="text-[11px] text-[var(--muted)] font-medium mt-0.5">
              {worker.role} · <span className="font-mono-num font-semibold">{worker.id}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 font-bold text-[10px] px-2 py-0.5 rounded-full border shadow-2xs whitespace-nowrap ${statusConfig.bgChip} ${statusConfig.borderChip} ${statusConfig.textColor}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} ${statusConfig.dotAnim}`} />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Vitals Grid with Visual Icons */}
      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 my-2 bg-[var(--soft)] rounded-lg border border-[var(--bd)]/60 text-center">
        {/* Heart Rate */}
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
            <span>HR</span>
          </div>
          <div className="font-mono-num font-bold text-sm md:text-base text-[var(--ink)] mt-0.5">
            {Math.round(worker.hr)}
            <span className="text-[9px] text-[var(--muted)] font-normal ml-0.5">bpm</span>
          </div>
        </div>

        {/* SpO2 */}
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">
            <Wind className="w-3 h-3 text-cyan-500" />
            <span>SpO₂</span>
          </div>
          <div className="font-mono-num font-bold text-sm md:text-base text-[var(--ink)] mt-0.5">
            {Math.round(worker.spO2)}
            <span className="text-[9px] text-[var(--muted)] font-normal ml-0.5">%</span>
          </div>
        </div>

        {/* Skin Temp */}
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">
            <Thermometer className="w-3 h-3 text-amber-500" />
            <span>Skin</span>
          </div>
          <div className="font-mono-num font-bold text-sm md:text-base text-[var(--ink)] mt-0.5">
            {worker.skinTemp.toFixed(1)}
            <span className="text-[9px] text-[var(--muted)] font-normal ml-0.5">°C</span>
          </div>
        </div>
      </div>

      {/* Smooth Sparkline with Gradient Area Fill */}
      <div className="my-2 h-[28px] relative overflow-hidden rounded bg-[var(--card)]/60">
        {line ? (
          <svg viewBox="0 0 100 28" height="28" className="w-full block" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${worker.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={statusConfig.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={statusConfig.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#grad-${worker.id})`} />
            <polyline
              points={line}
              fill="none"
              stroke={statusConfig.color}
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div className="h-full bg-slate-100 dark:bg-slate-800/40 rounded" />
        )}
      </div>

      {/* Explainable rule reason */}
      <div
        className={`text-[11px] font-semibold px-2 py-1 rounded-md border truncate flex items-center gap-1.5 ${statusConfig.bgChip} ${statusConfig.borderChip} ${statusConfig.textColor}`}
        title={reasonText}
      >
        {worker.level === 0 ? (
          <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
        ) : worker.level === 1 ? (
          <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
        ) : (
          <AlertOctagon className="w-3 h-3 shrink-0 text-rose-600 animate-pulse" />
        )}
        <span className="truncate">{reasonText}</span>
      </div>
    </div>
  );
};
