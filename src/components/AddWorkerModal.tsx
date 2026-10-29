import React, { useState } from 'react';
import { ConstructionWorker } from '../types/JaanShield';
import { safetyAudio } from '../utils/audio';
import { X, UserPlus, HardHat } from 'lucide-react';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorker: (worker: ConstructionWorker) => void;
  nextId: string;
  isHindi: boolean;
}

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({
  isOpen,
  onClose,
  onAddWorker,
  nextId,
  isHindi,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Mason');
  const [baselineHr, setBaselineHr] = useState(76);
  const [loadFactor, setLoadFactor] = useState(0.6);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    safetyAudio.playClick();
    const newWorker: ConstructionWorker = {
      id: nextId,
      name: name.trim(),
      role,
      baselineHr,
      loadFactor,
      hr: baselineHr + 8,
      spO2: 98,
      skinTemp: 34.2,
      hrHistory: [baselineHr, baselineHr + 4, baselineHr + 8],
      minutesSinceBreak: 15,
      level: 0,
      reasons: [],
      restRemaining: 0,
      stressActive: false,
      lastAlertTick: -99,
    };

    onAddWorker(newWorker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--bd)] rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={() => {
            safetyAudio.playClick();
            onClose();
          }}
          type="button"
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--soft)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold shadow-sm">
            <HardHat className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif-fraunces font-bold text-lg text-[var(--ink)] m-0 leading-tight">
              {isHindi ? 'कार्यस्थल पर नया मज़दूर जोड़ें' : 'Register Worker on Site'}
            </h3>
            <p className="text-xs text-[var(--muted)] m-0 font-medium mt-0.5">
              Assigned ID: <span className="font-mono-num font-bold text-amber-600 dark:text-amber-400">{nextId}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[var(--ink-secondary)] font-semibold mb-1">
              {isHindi ? 'मज़दूर का पूरा नाम' : 'Worker Full Name'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Singh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] focus:outline-none focus:border-amber-400 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[var(--ink-secondary)] font-semibold mb-1">
              {isHindi ? 'कार्य / ट्रेड' : 'Trade / Occupational Role'}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] cursor-pointer text-sm font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="Mason">Mason (राजमिस्त्री)</option>
              <option value="Welder">Welder (वेल्डर)</option>
              <option value="Rebar fixer">Rebar fixer (सरिया बांधने वाला)</option>
              <option value="Carpenter">Carpenter (बढ़ई / शटरिंग)</option>
              <option value="Crane operator">Crane operator (क्रेन ऑपरेटर)</option>
              <option value="Electrician">Electrician (इलेक्ट्रीशियन)</option>
              <option value="Painter">Painter (पेंटर)</option>
              <option value="Helper">Helper (मज़दूर / हेल्पर)</option>
              <option value="Scaffolder">Scaffolder (मचान लगाने वाला)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--ink-secondary)] font-semibold mb-1">
                {isHindi ? 'बेसलाइन हृदय गति (bpm)' : 'Baseline HR (bpm)'}
              </label>
              <input
                type="number"
                min="55"
                max="105"
                value={baselineHr}
                onChange={(e) => setBaselineHr(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] font-mono-num font-semibold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[var(--ink-secondary)] font-semibold mb-1">
                {isHindi ? 'शारीरिक श्रम भार' : 'Physical Load (0.1 - 1.0)'}
              </label>
              <input
                type="number"
                min="0.1"
                max="1.0"
                step="0.1"
                value={loadFactor}
                onChange={(e) => setLoadFactor(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] font-mono-num font-semibold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-[var(--bd)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 border border-[var(--bd)] rounded-lg text-[var(--ink)] hover:bg-[var(--soft)] font-semibold transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#0f172a] rounded-lg font-bold shadow-md transition-all active:scale-98"
            >
              {isHindi ? 'दर्ज करें' : 'Add to Safety Grid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
