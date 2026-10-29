import React, { useState } from 'react';
import { AlertThresholds } from '../types/JaanShield';
import { evaluateVitals } from '../utils/safetyRules';
import { Stethoscope, CheckCircle2, AlertTriangle, AlertOctagon, Heart, Wind, Thermometer } from 'lucide-react';

interface CheckReadingCardProps {
  currentHeatIndex: number;
  thresholds: AlertThresholds;
  isHindi: boolean;
}

export const CheckReadingCard: React.FC<CheckReadingCardProps> = ({
  currentHeatIndex,
  thresholds,
  isHindi,
}) => {
  const [testHr, setTestHr] = useState(120);
  const [testSpo2, setTestSpo2] = useState(93);
  const [testSkinTemp, setTestSkinTemp] = useState(36.2);

  const evaluation = evaluateVitals(
    testHr,
    testSpo2,
    testSkinTemp,
    currentHeatIndex,
    0,
    thresholds
  );

  const statusConfig = {
    0: {
      color: '#059669',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgChip: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderChip: 'border-emerald-200 dark:border-emerald-800',
      label: isHindi ? 'काम के लिए फिट (सुरक्षित)' : 'Fit to work',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    },
    1: {
      color: '#d97706',
      textColor: 'text-amber-700 dark:text-amber-300',
      bgChip: 'bg-amber-50 dark:bg-amber-950/40',
      borderChip: 'border-amber-200 dark:border-amber-800',
      label: isHindi ? 'चेतावनी (निगरानी रखें)' : 'Caution',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    },
    2: {
      color: '#dc2626',
      textColor: 'text-rose-700 dark:text-rose-300',
      bgChip: 'bg-rose-50 dark:bg-rose-950/40',
      borderChip: 'border-rose-200 dark:border-rose-800',
      label: isHindi ? 'तुरंत आराम दें (जोखिम)' : 'Rest now',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-500 animate-pulse" />,
    },
  }[evaluation.level];

  return (
    <section className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-fraunces font-bold text-base text-[var(--ink)] m-0 leading-tight">
              {isHindi ? 'रीडिंग की तुरंत जाँच करें' : 'Check a reading'}
            </h2>
            <span className="text-[10px] text-[var(--muted)]">Diagnostic Sandbox</span>
          </div>
        </div>

        <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
          {isHindi
            ? 'किसी भी मज़दूर के वाइटल्स दर्ज करके तुरंत जोखिम स्कोर का परीक्षण करें।'
            : 'Test any hypothetical vitals against the live site heat index.'}
        </p>

        {/* Inputs */}
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="flex items-center justify-between text-[var(--ink-secondary)] font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-rose-500" />
                <span>Heart rate (bpm)</span>
              </span>
              <span className="font-mono-num text-[10px] text-[var(--muted)]">40 - 220</span>
            </label>
            <input
              type="number"
              min="40"
              max="220"
              value={testHr}
              onChange={(e) => setTestHr(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] font-mono-num text-sm focus:outline-none focus:border-amber-400 font-semibold"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-[var(--ink-secondary)] font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Wind className="w-3 h-3 text-cyan-500" />
                <span>SpO₂ (%)</span>
              </span>
              <span className="font-mono-num text-[10px] text-[var(--muted)]">70 - 100%</span>
            </label>
            <input
              type="number"
              min="70"
              max="100"
              value={testSpo2}
              onChange={(e) => setTestSpo2(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] font-mono-num text-sm focus:outline-none focus:border-amber-400 font-semibold"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-[var(--ink-secondary)] font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3 h-3 text-amber-500" />
                <span>Skin temperature (°C)</span>
              </span>
              <span className="font-mono-num text-[10px] text-[var(--muted)]">30 - 43°C</span>
            </label>
            <input
              type="number"
              min="30"
              max="43"
              step="0.1"
              value={testSkinTemp}
              onChange={(e) => setTestSkinTemp(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] font-mono-num text-sm focus:outline-none focus:border-amber-400 font-semibold"
            />
          </div>
        </div>

        {/* Result Container */}
        <div className={`mt-3.5 p-3 rounded-xl border ${statusConfig.bgChip} ${statusConfig.borderChip}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">
              {isHindi ? 'वर्गीकरण परिणाम:' : 'Evaluation:'}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-0.5 rounded-full border shadow-2xs ${statusConfig.bgChip} ${statusConfig.borderChip} ${statusConfig.textColor}`}
            >
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </span>
          </div>

          <ul className="m-0 pl-4 text-xs space-y-1">
            {evaluation.reasons.length > 0 ? (
              evaluation.reasons.map((r, i) => (
                <li
                  key={i}
                  className={r.includes('critical') ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-amber-700 dark:text-amber-400 font-medium'}
                >
                  {r}
                </li>
              ))
            ) : (
              <li className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-500" />
                <span>{isHindi ? 'सभी रीडिंग सुरक्षित सीमा में हैं' : 'All readings within safe occupational limits'}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <small className="block text-[11px] text-[var(--muted)] mt-3 pt-2.5 border-t border-[var(--bd)]">
        {isHindi
          ? `वर्तमान कार्यस्थल हीट इंडेक्स ${currentHeatIndex}°C का उपयोग`
          : `Evaluated using live site heat index of ${currentHeatIndex}°C`}
      </small>
    </section>
  );
};
