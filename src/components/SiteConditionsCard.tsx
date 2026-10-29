import React from 'react';
import { SiteConditions } from '../types/JaanShield';
import { safetyAudio } from '../utils/audio';
import { Sun, Droplets, Flame, AlertCircle, Radio, Gauge } from 'lucide-react';

interface SiteConditionsCardProps {
  conditions: SiteConditions;
  onToggleHeatwave: (active: boolean) => void;
  speed: number;
  onChangeSpeed: (spd: number) => void;
  isHindi: boolean;
}

export const SiteConditionsCard: React.FC<SiteConditionsCardProps> = ({
  conditions,
  onToggleHeatwave,
  speed,
  onChangeSpeed,
  isHindi,
}) => {
  // Determine site risk level based on heat index thresholds
  // <32°C normal, 32-40°C caution, >=41°C dangerous heat stress
  const level = conditions.heatIndex >= 41 ? 2 : conditions.heatIndex >= 32 ? 1 : 0;

  const adviceList = isHindi
    ? [
        'सामान्य काम। पर्याप्त पीने का पानी व ओआरएस उपलब्ध रखें।',
        'अतिरिक्त सावधानी: हर 20 मिनट में छाया और पानी का ब्रेक अनिवार्य।',
        'अति जोखिम: भारी धूप का काम रोकें और मज़दूरों को तुरंत छाया में भेजें।',
      ]
    : [
        'Normal work. Maintain active hydration stations and shaded rest.',
        'Caution: Mandatory shade breaks and ORS/water every 20 minutes.',
        'High Hazard: Halt heavy outdoor tasks and move workers to shaded cool zones.',
      ];

  const advice = adviceList[level];

  const levelStyles = {
    0: {
      color: '#059669',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      label: isHindi ? 'सुरक्षित क्षेत्र' : 'Safe Zone',
    },
    1: {
      color: '#d97706',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      label: isHindi ? 'चेतावनी स्तर' : 'Caution Zone',
    },
    2: {
      color: '#dc2626',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300',
      label: isHindi ? 'गंभीर खतरा' : 'Hazard Zone',
    },
  }[level];

  // Position of needle on gradient bar (scale from 25°C to 55°C)
  const needlePercent = Math.min(97, Math.max(3, ((conditions.heatIndex - 25) / 30) * 100));

  return (
    <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-fraunces font-bold text-base text-[var(--ink)] m-0 leading-tight">
              {isHindi ? 'कार्यस्थल का मौसम व हीट इंडेक्स' : 'Site conditions'}
            </h2>
            <div className="text-[10px] text-[var(--muted)] flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
              <span>Telemetry Node #01 · Live</span>
            </div>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelStyles.bg} ${levelStyles.border} ${levelStyles.text}`}>
          {levelStyles.label}
        </span>
      </div>

      {/* Environmental Metrics Strip */}
      <div className="grid grid-cols-3 gap-2.5 py-1 mb-3">
        {/* Air Temp */}
        <div className="p-2.5 bg-[var(--soft)] rounded-lg text-center border border-[var(--bd)]/50">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--muted)] font-semibold mb-0.5">
            <Sun className="w-3 h-3 text-amber-500" />
            <span>Air Temp</span>
          </div>
          <b className="font-mono-num font-bold text-lg md:text-xl text-[var(--ink)]">
            {conditions.temp.toFixed(1)}°
          </b>
          <span className="text-[10px] text-[var(--muted)] ml-0.5 font-sans-ui">C</span>
        </div>

        {/* Humidity */}
        <div className="p-2.5 bg-[var(--soft)] rounded-lg text-center border border-[var(--bd)]/50">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--muted)] font-semibold mb-0.5">
            <Droplets className="w-3 h-3 text-cyan-500" />
            <span>Humidity</span>
          </div>
          <b className="font-mono-num font-bold text-lg md:text-xl text-[var(--ink)]">
            {conditions.rh}%
          </b>
        </div>

        {/* Calculated Heat Index */}
        <div className={`p-2.5 rounded-lg text-center border ${levelStyles.bg} ${levelStyles.border}`}>
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase mb-0.5" style={{ color: levelStyles.color }}>
            <Flame className="w-3 h-3" />
            <span>Heat Index</span>
          </div>
          <b className="font-mono-num font-bold text-lg md:text-xl" style={{ color: levelStyles.color }}>
            {conditions.heatIndex.toFixed(1)}°
          </b>
          <span className="text-[10px] ml-0.5 font-bold" style={{ color: levelStyles.color }}>C</span>
        </div>
      </div>

      {/* Heat Index Color Bar */}
      <div className="my-3">
        <div className="flex justify-between text-[10px] font-mono-num text-[var(--muted)] mb-1">
          <span>25°C Safe</span>
          <span>32°C Caution</span>
          <span>41°C Danger</span>
          <span>55°C</span>
        </div>
        <div className="heat-gradient-bar">
          <i
            className="absolute -top-1 w-2 h-[18px] bg-[var(--ink)] border border-white dark:border-slate-800 rounded-sm transition-all duration-500 shadow-md"
            style={{ left: `${needlePercent}%` }}
            title={`Rothfusz Heat Index: ${conditions.heatIndex}°C`}
          />
        </div>
      </div>

      {/* Advice Chip */}
      <div className="mb-3.5">
        <div className={`flex items-start gap-2 text-xs font-medium p-2.5 rounded-lg border leading-snug ${levelStyles.bg} ${levelStyles.border} ${levelStyles.text}`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{advice}</span>
        </div>
      </div>

      {/* Simulation Controls: Heatwave & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[var(--bd)] text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-[var(--ink)] hover:text-[#f59e0b] transition-colors">
          <input
            type="checkbox"
            checked={conditions.heatwaveActive}
            onChange={(e) => {
              safetyAudio.playClick();
              onToggleHeatwave(e.target.checked);
            }}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
          />
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHindi ? 'लू (हीटवेव) का परीक्षण' : 'Simulate heatwave'}</span>
          </span>
        </label>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--muted)] font-medium">Speed:</span>
          <select
            value={speed}
            onChange={(e) => {
              safetyAudio.playClick();
              onChangeSpeed(Number(e.target.value));
            }}
            className="px-2 py-1 text-xs border border-[var(--bd)] rounded-md bg-[var(--soft)] text-[var(--ink)] cursor-pointer font-medium focus:outline-none focus:border-amber-400"
          >
            <option value={1}>1× speed</option>
            <option value={2}>2× speed</option>
            <option value={4}>4× speed</option>
          </select>
        </div>
      </div>
    </div>
  );
};
