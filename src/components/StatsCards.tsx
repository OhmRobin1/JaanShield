import React from 'react';
import { ConstructionWorker, AuditLogEntry, RiskLevel } from '../types/jaanband';
import { safetyAudio } from '../utils/audio';
import { CheckCircle2, AlertTriangle, AlertOctagon, ShieldAlert, Heart } from 'lucide-react';

interface StatsCardsProps {
  workers: ConstructionWorker[];
  logs: AuditLogEntry[];
  activeFilter: RiskLevel | 'ALL';
  onSelectFilter: (level: RiskLevel | 'ALL') => void;
  isHindi: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  workers,
  logs,
  activeFilter,
  onSelectFilter,
  isHindi,
}) => {
  const total = workers.length || 1;
  const counts = {
    fit: workers.filter((w) => w.level === 0).length,
    caution: workers.filter((w) => w.level === 1).length,
    rest: workers.filter((w) => w.level === 2).length,
  };

  const openAlerts = logs.filter((l) => !l.acknowledgedBy && l.level > 0).length;
  const avgHr = Math.round(workers.reduce((s, w) => s + w.hr, 0) / total);

  const stats = [
    {
      count: counts.fit,
      pct: Math.round((counts.fit / total) * 100),
      label: isHindi ? 'काम के लिए फिट' : 'Fit to work',
      level: 0 as RiskLevel,
      color: '#059669',
      borderClass: 'border-t-emerald-500',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
    {
      count: counts.caution,
      pct: Math.round((counts.caution / total) * 100),
      label: isHindi ? 'निगरानी / सावधानी' : 'On caution',
      level: 1 as RiskLevel,
      color: '#d97706',
      borderClass: 'border-t-amber-500',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    },
    {
      count: counts.rest,
      pct: Math.round((counts.rest / total) * 100),
      label: isHindi ? 'तुरंत आराम दें' : 'Rest now',
      level: 2 as RiskLevel,
      color: '#dc2626',
      borderClass: 'border-t-rose-500',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      activeRing: 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
      icon: <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />,
    },
    {
      count: openAlerts,
      pct: null,
      label: isHindi ? 'लंबित चेतावनियाँ' : 'Unacknowledged',
      level: null,
      color: openAlerts > 0 ? '#dc2626' : '#059669',
      borderClass: openAlerts > 0 ? 'border-t-rose-500' : 'border-t-emerald-500',
      badgeClass: openAlerts > 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      activeRing: '',
      icon: <ShieldAlert className={`w-4 h-4 ${openAlerts > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />,
    },
    {
      count: avgHr,
      unit: 'bpm',
      pct: null,
      label: isHindi ? 'औसत हृदय गति' : 'Average HR',
      level: null,
      color: '#0f172a',
      borderClass: 'border-t-[#f59e0b]',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      activeRing: '',
      icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />,
    },
  ];

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
      {stats.map((s, idx) => {
        const isClickable = s.level !== null;
        const isSelected = isClickable && activeFilter === s.level;

        return (
          <div
            key={idx}
            onClick={() => {
              if (isClickable) {
                safetyAudio.playClick();
                onSelectFilter(isSelected ? 'ALL' : s.level!);
              }
            }}
            className={`bg-[var(--card)] border border-[var(--bd)] rounded-xl p-3.5 border-t-[3.5px] transition-all duration-150 shadow-sm relative overflow-hidden select-none ${
              s.borderClass
            } ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} ${
              isSelected ? s.activeRing : ''
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
                {s.icon}
                <span className="truncate">{s.label}</span>
              </span>
              {s.pct !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${s.badgeClass}`}>
                  {s.pct}%
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <b className="font-serif-fraunces font-bold text-2xl md:text-3xl text-[var(--ink)] tracking-tight">
                {s.count}
              </b>
              {s.unit && (
                <span className="text-xs text-[var(--muted)] font-mono-num font-semibold">
                  {s.unit}
                </span>
              )}
            </div>

            {isSelected && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[var(--ink-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                <span>Filter Active</span>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};
