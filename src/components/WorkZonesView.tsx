import React, { useState } from 'react';
import { ConstructionWorker, SiteConditions } from '../types/JaanShield';
import { safetyAudio } from '../utils/audio';
import { MapPin, Sun, Wind, Droplets, Flame, Users, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WorkZone {
  id: string;
  name: string;
  nameHi: string;
  type: string;
  tempDelta: number; // relative to base site temp
  rhDelta: number;
  solarExposure: 'Direct Unshaded' | 'Partial Shade' | 'Enclosed Underground' | 'High-Altitude Wind';
  activeWorkers: string[]; // worker IDs
  hydrationPoint: string;
  hazardNote: string;
}

interface WorkZonesViewProps {
  workers: ConstructionWorker[];
  siteConditions: SiteConditions;
  onSendBreak: (workerId: string) => void;
  isHindi: boolean;
}

export const WorkZonesView: React.FC<WorkZonesViewProps> = ({
  workers,
  siteConditions,
  onSendBreak,
  isHindi,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('Z01');
  const [broadcastActive, setBroadcastActive] = useState<boolean>(false);

  const ZONES: WorkZone[] = [
    {
      id: 'Z01',
      name: 'Steel Rebar Fabrication Yard',
      nameHi: 'सरिया यार्ड (स्टील फैब्रिकेशन)',
      type: 'Open Yard',
      tempDelta: +2.8,
      rhDelta: -4,
      solarExposure: 'Direct Unshaded',
      activeWorkers: ['W02', 'W04'], // Sunita (Welder), Kavita (Rebar fixer)
      hydrationPoint: 'Kiosk #3 · ORS & Cold Clay Pot (Matka)',
      hazardNote: 'Unshaded steel surfaces radiate secondary radiant heat up to 52°C.',
    },
    {
      id: 'Z02',
      name: 'Tower B External Scaffolding (8th Floor)',
      nameHi: 'टावर बी मचान (8वीं मंजिल)',
      type: 'High Elevation',
      tempDelta: +1.2,
      rhDelta: -8,
      solarExposure: 'High-Altitude Wind',
      activeWorkers: ['W01', 'W06'], // Ramesh (Mason), Pooja (Painter)
      hydrationPoint: 'Mobile Water Carrier #2',
      hazardNote: 'High solar exposure combined with physical balance hazard on scaffolding.',
    },
    {
      id: 'Z03',
      name: 'Foundation Excavation Pit',
      nameHi: 'नींव खुदाई गड्ढा (फाउंडेशन पिट)',
      type: 'Deep Trench',
      tempDelta: +3.4,
      rhDelta: +14,
      solarExposure: 'Partial Shade',
      activeWorkers: ['W08'], // Anita (Helper)
      hydrationPoint: 'Kiosk #1 · North Trench Ramp',
      hazardNote: 'Enclosed trench traps ambient humidity and restricts convective cooling.',
    },
    {
      id: 'Z04',
      name: 'Concrete Batching & Mixing Plant',
      nameHi: 'कंक्रीट मिक्सर व बैचिंग प्लांट',
      type: 'Heavy Industrial',
      tempDelta: +2.1,
      rhDelta: +2,
      solarExposure: 'Partial Shade',
      activeWorkers: ['W05', 'W07'], // Mahesh (Carpenter), Dinesh (Electrician)
      hydrationPoint: 'Kiosk #4 · Control Room Porch',
      hazardNote: 'Mechanical engine exhaust and friction heat add to ambient thermal load.',
    },
    {
      id: 'Z05',
      name: 'Tower A Crane Cabin & High Mast',
      nameHi: 'टावर क्रेन केबिन',
      type: 'Elevated Operator Cabin',
      tempDelta: -0.5,
      rhDelta: -10,
      solarExposure: 'Direct Unshaded',
      activeWorkers: ['W03'], // Imran (Crane operator)
      hydrationPoint: 'Onboard 10L Insulated Thermos',
      hazardNote: 'Cabin greenhouse effect. Solar reflective film active.',
    },
  ];

  const currentZone = ZONES.find((z) => z.id === selectedZoneId) || ZONES[0];

  const zoneTemp = Number((siteConditions.temp + currentZone.tempDelta).toFixed(1));
  const zoneRh = Math.max(20, Math.min(95, siteConditions.rh + currentZone.rhDelta));
  const zoneHeatIndex = Number((siteConditions.heatIndex + currentZone.tempDelta * 1.3).toFixed(1));

  const assignedWorkers = workers.filter((w) => currentZone.activeWorkers.includes(w.id));

  const handleBroadcastShadeBreak = () => {
    safetyAudio.playBreakGranted();
    safetyAudio.playWearableBuzzer();
    setBroadcastActive(true);
    assignedWorkers.forEach((w) => onSendBreak(w.id));
    setTimeout(() => setBroadcastActive(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-fraunces font-bold text-lg md:text-xl text-[var(--ink)] m-0 leading-tight">
                {isHindi ? 'कार्यक्षेत्र हीट मैप व माइक्रो-क्लाइमेट' : 'Work Zones & Micro-Climates'}
              </h2>
              <p className="text-xs text-[var(--muted)] m-0 font-medium">
                {isHindi
                  ? 'प्रत्येक कार्यक्षेत्र में तापमान, नमी और सौर विकिरण के आधार पर विशिष्ट जोखिम निगरानी'
                  : 'Sector-specific thermal conditions and worker allocation across construction site'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleBroadcastShadeBreak}
          type="button"
          className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md active:scale-98"
        >
          <Flame className="w-4 h-4 text-amber-400 dark:text-slate-900" />
          <span>
            {broadcastActive
              ? isHindi ? 'वाइब्रेशन भेजा गया!' : 'Zone Buzzer Broadcasted!'
              : isHindi ? 'इस ज़ोन को सामूहिक विश्राम आदेश दें' : 'Order Zone Mandatory Rest Break'}
          </span>
        </button>
      </div>

      {/* Main Grid: Zones Selector (Left) + Selected Zone Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Zones List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider px-1">
            {isHindi ? 'सक्रिय कार्यक्षेत्र (5 ज़ोन)' : 'Site Sectors (5 Active Zones)'}
          </div>

          {ZONES.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            const approxHi = Number((siteConditions.heatIndex + zone.tempDelta * 1.3).toFixed(1));
            const zoneWorkers = workers.filter((w) => zone.activeWorkers.includes(w.id));
            const hasResting = zoneWorkers.some((w) => w.level === 2);
            const hasCaution = zoneWorkers.some((w) => w.level === 1);

            return (
              <div
                key={zone.id}
                onClick={() => {
                  safetyAudio.playClick();
                  setSelectedZoneId(zone.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs select-none ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-sm'
                    : 'bg-[var(--card)] border-[var(--bd)] hover:border-slate-400 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div>
                    <b className="text-sm font-bold text-[var(--ink)] block leading-tight">
                      {isHindi ? zone.nameHi : zone.name}
                    </b>
                    <span className="text-[11px] text-[var(--muted)] font-medium">
                      {zone.type} · {zone.solarExposure}
                    </span>
                  </div>

                  <span
                    className={`font-mono-num font-bold text-xs px-2 py-0.5 rounded-full border ${
                      approxHi >= 41
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                        : approxHi >= 32
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    HI {approxHi}°C
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--bd)]/60 text-[var(--muted)]">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{zoneWorkers.length} {isHindi ? 'मज़दूर' : 'Workers'}</span>
                  </span>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    {hasResting && (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        <span>Rest Due</span>
                      </span>
                    )}
                    {!hasResting && hasCaution && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Caution</span>
                    )}
                    {!hasResting && !hasCaution && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Nominal</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Zone Deep Dive (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--bd)] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start gap-3 pb-3 border-b border-[var(--bd)]">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                SELECTED SECTOR // {currentZone.id}
              </span>
              <h3 className="font-serif-fraunces font-bold text-xl text-[var(--ink)] m-0 leading-tight">
                {isHindi ? currentZone.nameHi : currentZone.name}
              </h3>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                Classification: <span className="font-semibold text-[var(--ink)]">{currentZone.solarExposure}</span>
              </p>
            </div>

            <span className="text-xs font-mono-num font-bold px-2.5 py-1 rounded-lg bg-[var(--soft)] border border-[var(--bd)] text-[var(--ink)]">
              {currentZone.type}
            </span>
          </div>

          {/* Micro-Climate Sensor Dashboard */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/60">
              <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--muted)] font-semibold mb-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Zone Temp</span>
              </div>
              <b className="font-mono-num font-bold text-2xl text-[var(--ink)]">{zoneTemp}°</b>
              <span className="text-[10px] text-[var(--muted)] ml-0.5">C</span>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                {currentZone.tempDelta >= 0 ? `+${currentZone.tempDelta}°C offset` : `${currentZone.tempDelta}°C offset`}
              </div>
            </div>

            <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/60">
              <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--muted)] font-semibold mb-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                <span>Zone Humidity</span>
              </div>
              <b className="font-mono-num font-bold text-2xl text-[var(--ink)]">{zoneRh}%</b>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Wet bulb index: {Math.round(zoneRh * 0.4 + zoneTemp * 0.6)}°
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-bold mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Micro Heat Index</span>
              </div>
              <b className="font-mono-num font-bold text-2xl text-amber-700 dark:text-amber-300">{zoneHeatIndex}°</b>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold ml-0.5">C</span>
              <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-0.5">
                {zoneHeatIndex >= 41 ? 'Hazardous' : zoneHeatIndex >= 32 ? 'Extreme Caution' : 'Moderate'}
              </div>
            </div>
          </div>

          {/* Hazard & Hydration Details */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isHindi ? 'कार्यक्षेत्र जोखिम विश्लेषण:' : 'Micro-Climate Hazard Assessment:'}</span>
            </div>
            <p className="text-amber-900/90 dark:text-amber-200/90 m-0 leading-relaxed font-medium">
              {currentZone.hazardNote}
            </p>
            <div className="text-xs text-[var(--ink-secondary)] pt-1 flex items-center gap-2">
              <span className="font-bold">{isHindi ? 'निकटतम जल केंद्र:' : 'Hydration Station:'}</span>
              <span className="text-[var(--ink)]">{currentZone.hydrationPoint}</span>
            </div>
          </div>

          {/* Workers Currently Stationed */}
          <div>
            <div className="flex justify-between items-center mb-2 text-xs font-bold text-[var(--ink)]">
              <span>{isHindi ? 'इस ज़ोन में तैनात मज़दूर:' : 'Assigned Workers in Sector:'}</span>
              <span className="text-[var(--muted)] font-normal">{assignedWorkers.length} active</span>
            </div>

            <div className="space-y-2">
              {assignedWorkers.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--soft)] border border-[var(--bd)]/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-700 font-bold text-xs flex items-center justify-center font-mono-num text-[var(--ink)]">
                      {w.id}
                    </div>
                    <div>
                      <b className="text-[var(--ink)]">{w.name}</b>
                      <span className="text-[var(--muted)] text-[11px] block">{w.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono-num text-xs">
                    <span>
                      HR: <b className="text-[var(--ink)]">{Math.round(w.hr)}</b>
                    </span>
                    <span>
                      Skin: <b className="text-[var(--ink)]">{w.skinTemp.toFixed(1)}°</b>
                    </span>
                    <button
                      onClick={() => onSendBreak(w.id)}
                      type="button"
                      className="px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-900 font-bold text-[11px] hover:opacity-90 transition-opacity"
                    >
                      {isHindi ? 'ब्रेक दें' : 'Rest'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
