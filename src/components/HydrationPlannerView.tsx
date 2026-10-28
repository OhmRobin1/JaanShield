import React, { useState, useEffect } from 'react';
import { SiteConditions } from '../types/jaanband';
import { safetyAudio } from '../utils/audio';
import { CalendarClock, Bell, Droplets, Coffee, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface HydrationPlannerViewProps {
  siteConditions: SiteConditions;
  isHindi: boolean;
  onBroadcastBreakToAll: () => void;
}

export const HydrationPlannerView: React.FC<HydrationPlannerViewProps> = ({
  siteConditions,
  isHindi,
  onBroadcastBreakToAll,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(18 * 60 + 35); // ~18m 35s
  const [bellRung, setBellRung] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 20 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Work-Rest Ratio based on OSHA & Indian NDMA Heatwave Guidelines
  const getWorkRestRatio = (hi: number) => {
    if (hi >= 42) {
      return {
        workMin: 15,
        restMin: 45,
        waterLiters: '1.0 L / hour',
        severity: 'Hazardous Heatwave',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
        note: isHindi
          ? 'अत्यधिक खतरा: केवल आवश्यक हल्के कार्य। हर 15 मिनट बाद 45 मिनट छाया विश्राम।'
          : 'High Hazard: Limit to essential tasks. 15 min work / 45 min shaded rest rotation.',
      };
    }
    if (hi >= 38) {
      return {
        workMin: 30,
        restMin: 30,
        waterLiters: '0.9 L / hour',
        severity: 'Extreme Caution',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
        note: isHindi
          ? 'गंभीर चेतावनी: 30 मिनट काम / 30 मिनट छाया में विश्राम व ओआरएस पेय।'
          : 'Extreme Caution: 30 min work / 30 min shaded rest with electrolyte fluids.',
      };
    }
    if (hi >= 32) {
      return {
        workMin: 45,
        restMin: 15,
        waterLiters: '0.75 L / hour',
        severity: 'Moderate Caution',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
        note: isHindi
          ? 'सतर्कता स्तर: 45 मिनट काम / 15 मिनट छाया ब्रेक व नियमित जलपान।'
          : 'Caution: 45 min work / 15 min rest under shaded kiosk every hour.',
      };
    }
    return {
      workMin: 50,
      restMin: 10,
      waterLiters: '0.5 L / hour',
      severity: 'Normal Operational Limits',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
      note: isHindi
        ? 'सामान्य कार्य: हर घंटे 10 मिनट का मानक विश्राम और पर्याप्त पीने का पानी।'
        : 'Nominal: Standard 10 min break per hour. Active water points maintained.',
    };
  };

  const currentPolicy = getWorkRestRatio(siteConditions.heatIndex);

  const handleManualHydrationBell = () => {
    safetyAudio.playBreakGranted();
    safetyAudio.playWearableBuzzer();
    setBellRung(true);
    onBroadcastBreakToAll();
    setTimeout(() => setBellRung(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <CalendarClock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-serif-fraunces font-bold text-lg md:text-xl text-[var(--ink)] m-0 leading-tight">
              {isHindi ? 'विश्राम व हाइड्रेशन शेड्यूलर' : 'Hydration & Work-Rest Planner'}
            </h2>
            <p className="text-xs text-[var(--muted)] m-0 font-medium">
              {isHindi
                ? 'राष्ट्रीय आपदा प्रबंधन (NDMA) व OSHA हीट इंडेक्स दिशा-निर्देशों के अनुरूप कार्य-विश्राम चक्र'
                : 'Automated work-rest ratios and hydration schedules calibrated to ambient heat stress'}
            </p>
          </div>
        </div>

        {/* Global Bell Trigger */}
        <button
          onClick={handleManualHydrationBell}
          type="button"
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-98"
        >
          <Bell className={`w-4 h-4 ${bellRung ? 'animate-bounce' : ''}`} />
          <span>
            {bellRung
              ? isHindi ? 'अलर्ट सभी वियरेबल्स पर भेजा गया!' : 'Hydration Chime Broadcasted!'
              : isHindi ? 'सभी को पानी पीने का वाइब्रेशन भेजें' : 'Broadcast Hydration Alert to All Bands'}
          </span>
        </button>
      </div>

      {/* Main Grid: Policy & Ratio (Left) + Schedule & Kiosks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (6 cols): Heat Stress Ratio Calculator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-[var(--bd)]">
              <div>
                <b className="text-sm font-bold text-[var(--ink)] block">
                  {isHindi ? 'वर्तमान कार्य-विश्राम अनुपात' : 'Current Work-Rest Policy'}
                </b>
                <span className="text-xs text-[var(--muted)]">
                  Live Heat Index: <b className="font-mono-num text-[var(--ink)]">{siteConditions.heatIndex}°C</b>
                </span>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${currentPolicy.badgeColor}`}>
                {currentPolicy.severity}
              </span>
            </div>

            {/* Visual Work vs Rest Ratio Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#0f172a] dark:text-amber-300 flex items-center gap-1">
                  <span>Work: {currentPolicy.workMin} min</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>Rest: {currentPolicy.restMin} min (Shade)</span>
                </span>
              </div>

              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-[#0f172a] dark:bg-amber-500 h-full flex items-center justify-center text-[9px] font-bold text-white dark:text-slate-900 transition-all duration-500"
                  style={{ width: `${(currentPolicy.workMin / (currentPolicy.workMin + currentPolicy.restMin)) * 100}%` }}
                >
                  {currentPolicy.workMin}m
                </div>
                <div
                  className="bg-emerald-500 h-full flex items-center justify-center text-[9px] font-bold text-white transition-all duration-500"
                  style={{ width: `${(currentPolicy.restMin / (currentPolicy.workMin + currentPolicy.restMin)) * 100}%` }}
                >
                  {currentPolicy.restMin}m
                </div>
              </div>
            </div>

            {/* Guidance Note */}
            <div className="p-3.5 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/60 text-xs space-y-1">
              <b className="text-[var(--ink)] block">
                {isHindi ? 'सुपरवाइज़र कार्य निर्देश:' : 'Supervisor Directive:'}
              </b>
              <p className="text-[var(--muted)] m-0 leading-relaxed font-medium">
                {currentPolicy.note}
              </p>
            </div>

            {/* Target Hydration Metrics */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-cyan-800 dark:text-cyan-300 mb-0.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Target Water Intake</span>
                </div>
                <b className="font-mono-num text-xl font-bold text-cyan-900 dark:text-cyan-100">
                  {currentPolicy.waterLiters}
                </b>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                  <Coffee className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Electrolyte Sachet</span>
                </div>
                <b className="font-mono-num text-xl font-bold text-emerald-900 dark:text-emerald-100">
                  1 Sachet / 3h
                </b>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Hydration Bell Countdown & Kiosks */}
        <div className="lg:col-span-6 space-y-4">
          {/* Hydration Bell Countdown Tile */}
          <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-5 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
              {isHindi ? 'अगला अनिवार्य जलपान ब्रेक टाइमर' : 'Next Mandatory Hydration Bell'}
            </span>

            <div className="font-mono-num text-4xl md:text-5xl font-bold text-[var(--ink)] tracking-tight my-2">
              {formatCountdown(secondsRemaining)}
            </div>

            <p className="text-xs text-[var(--muted)] m-0 max-w-sm mx-auto font-medium">
              {isHindi
                ? 'समय समाप्त होने पर सभी मज़दूरों के जानबैंड पर कंपन (वाइब्रेशन) सिग्नल भेजा जाएगा।'
                : 'Wearable buzzers will pulse automatically when this timer lapses to remind outdoor workers to drink water.'}
            </p>
          </div>

          {/* Active Hydration & Shade Points Checklist */}
          <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-5 shadow-sm space-y-3">
            <b className="text-sm font-bold text-[var(--ink)] block pb-2 border-b border-[var(--bd)]">
              {isHindi ? 'कार्यस्थल जल केंद्र व छाया शेल्टर' : 'Site Hydration Kiosks & Shelters'}
            </b>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--soft)] border border-[var(--bd)]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <b className="text-[var(--ink)] block">Kiosk #1: North Excavation Ramp</b>
                    <span className="text-[11px] text-[var(--muted)]">200L Potable Water + Chilled Clay Matkas</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Replenished
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--soft)] border border-[var(--bd)]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <b className="text-[var(--ink)] block">Kiosk #2: Rebar Fabrication Shed</b>
                    <span className="text-[11px] text-[var(--muted)]">Canopy Shade (28°C under tarp) + ORS Packs</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--soft)] border border-[var(--bd)]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <b className="text-[var(--ink)] block">Kiosk #3: Tower B Ground Staging</b>
                    <span className="text-[11px] text-[var(--muted)]">Mobile Water Carrier #2 Assigned to 8th Floor</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  En Route
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
