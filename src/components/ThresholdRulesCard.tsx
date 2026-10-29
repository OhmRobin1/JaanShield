import React from 'react';
import { AlertThresholds } from '../types/JaanShield';
import { THRESHOLD_DEFINITIONS } from '../data/initialData';
import { safetyAudio } from '../utils/audio';
import { SlidersHorizontal, RotateCcw, ShieldAlert } from 'lucide-react';
import { DEFAULT_THRESHOLDS } from '../data/initialData';

interface ThresholdRulesCardProps {
  thresholds: AlertThresholds;
  onUpdateThreshold: (key: keyof AlertThresholds, value: number) => void;
  onResetDefaults: () => void;
  isHindi: boolean;
}

export const ThresholdRulesCard: React.FC<ThresholdRulesCardProps> = ({
  thresholds,
  onUpdateThreshold,
  onResetDefaults,
  isHindi,
}) => {
  return (
    <section className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-fraunces font-bold text-base text-[var(--ink)] m-0 leading-tight">
                {isHindi ? 'अलर्ट नियम व सीमाएँ' : 'Alert rules'}
              </h2>
              <span className="text-[10px] text-[var(--muted)]">Transparent Scoring</span>
            </div>
          </div>

          <button
            onClick={() => {
              safetyAudio.playClick();
              onResetDefaults();
            }}
            type="button"
            className="text-[11px] text-[var(--muted)] hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-semibold transition-colors"
            title="Reset to recommended baseline thresholds"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isHindi ? 'रीसेट' : 'Defaults'}</span>
          </button>
        </div>

        <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
          {isHindi
            ? 'पारदर्शी व स्पष्ट नियम-आधारित स्कोरिंग सीमाएँ।'
            : 'Rule-based thresholds calibrated for high-heat outdoor construction labor.'}
        </p>

        {/* Sliders Grid */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {THRESHOLD_DEFINITIONS.map((def) => {
            const val = thresholds[def.key];
            return (
              <div key={def.key} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[var(--ink-secondary)] font-medium">{def.label}</span>
                  <b className="font-mono-num text-[var(--ink)] font-bold bg-[var(--soft)] px-2 py-0.5 rounded border border-[var(--bd)]/50">
                    {val} {def.unit}
                  </b>
                </div>
                <input
                  type="range"
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  value={val}
                  onChange={(e) => onUpdateThreshold(def.key, Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>
            );
          })}
        </div>
      </div>

      <small className="block text-[11px] text-[var(--muted)] mt-3 pt-2.5 border-t border-[var(--bd)] leading-tight">
        {isHindi
          ? 'डेमो सीमाएँ। वास्तविक कार्यस्थल पर उपयोग से पहले व्यावसायिक स्वास्थ्य विशेषज्ञ द्वारा प्रमाणित करें।'
          : 'Demo thresholds shown openly so every alert is explainable. Calibrate with occupational safety guidelines.'}
      </small>
    </section>
  );
};
