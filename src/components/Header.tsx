import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Play, Pause, Plus, Radio } from 'lucide-react';
import { safetyAudio } from '../utils/audio';
import { MajdoorLogo } from './MajdoorLogo';

interface HeaderProps {
  paused: boolean;
  onTogglePause: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  currentTime: string;
  isHindi: boolean;
  onToggleLanguage: () => void;
  onOpenAddWorker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  paused,
  onTogglePause,
  isDark,
  onToggleTheme,
  isSoundEnabled,
  onToggleSound,
  currentTime,
  isHindi,
  onToggleLanguage,
  onOpenAddWorker,
}) => {
  return (
    <header className="header-ecg-bg relative overflow-hidden bg-[#0f172a] text-white px-4 md:px-8 py-3.5 border-b-[3px] border-[#f59e0b] shadow-lg">
      <div className="max-w-[1240px] mx-auto flex flex-wrap gap-4 items-center justify-between relative z-10">
        {/* Brand Lockup with Authentic Majdoor (Construction Worker) Logo */}
        <MajdoorLogo isHindi={isHindi} size="md" showTagline={true} />

        {/* Header Controls */}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {/* Live Clock with Radio stream badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded-lg font-mono-num text-xs shadow-inner">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="tracking-wide">{currentTime}</span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => {
              safetyAudio.playClick();
              onToggleLanguage();
            }}
            type="button"
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all hover:border-slate-500 shadow-sm"
            title="Toggle Hindi / English"
          >
            {isHindi ? 'English' : 'हिन्दी'}
          </button>

          {/* Pause / Resume Simulation */}
          <button
            onClick={() => {
              safetyAudio.playClick();
              onTogglePause();
            }}
            type="button"
            className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
              paused
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30'
                : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-slate-500'
            }`}
          >
            {paused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{paused ? (isHindi ? 'चालू करें' : 'Resume') : (isHindi ? 'रोकें' : 'Pause')}</span>
          </button>

          {/* Sound Buzzer Mute / Unmute */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            type="button"
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all shadow-sm ${
              isSoundEnabled
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={isSoundEnabled ? 'Wearable vibration buzzer active' : 'Audio alerts muted'}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSoundEnabled ? 'Buzzer: ON' : 'Muted'}</span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={() => {
              safetyAudio.playClick();
              onToggleTheme();
            }}
            type="button"
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all shadow-sm"
            title="Toggle Dark / Light Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Register Worker Primary Action */}
          <button
            onClick={() => {
              safetyAudio.playClick();
              onOpenAddWorker();
            }}
            type="button"
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#0f172a] font-bold rounded-lg px-3.5 py-1.5 text-xs transition-all shadow-md active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isHindi ? 'नया मज़दूर' : 'Add Worker'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
