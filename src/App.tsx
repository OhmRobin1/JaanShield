import React, { useState, useEffect, useRef } from 'react';
import {
  ConstructionWorker,
  AlertThresholds,
  SiteConditions,
  AuditLogEntry,
  RiskLevel,
} from './types/JaanShield';
import {
  INITIAL_WORKERS,
  DEFAULT_THRESHOLDS,
  INITIAL_SITE_CONDITIONS,
  INITIAL_AUDIT_LOGS,
} from './data/initialData';
import { calculateHeatIndex, evaluateVitals, generateAuditHash } from './utils/safetyRules';
import { safetyAudio } from './utils/audio';
import { Header } from './components/Header';
import { NavigationMenu, MainNavMenu } from './components/NavigationMenu';
import { StatsCards } from './components/StatsCards';
import { WorkerCard } from './components/WorkerCard';
import { SiteConditionsCard } from './components/SiteConditionsCard';
import { WorkerDetailCard } from './components/WorkerDetailCard';
import { AuditLogCard } from './components/AuditLogCard';
import { ThresholdRulesCard } from './components/ThresholdRulesCard';
import { CheckReadingCard } from './components/CheckReadingCard';
import { WearableConnectCard } from './components/WearableConnectCard';
import { WorkZonesView } from './components/WorkZonesView';
import { HydrationPlannerView } from './components/HydrationPlannerView';
import { ComplianceView } from './components/ComplianceView';
import { HardwareDiagnosticsView } from './components/HardwareDiagnosticsView';
import { EmergencySopView } from './components/EmergencySopView';
import { Earth3DView } from './components/Earth3DView';
import { AddWorkerModal } from './components/AddWorkerModal';
import { Search, HeartHandshake } from 'lucide-react';

export default function App() {
  const [workers, setWorkers] = useState<ConstructionWorker[]>(INITIAL_WORKERS);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('W02');
  const [siteConditions, setSiteConditions] = useState<SiteConditions>(INITIAL_SITE_CONDITIONS);
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const [activeMenu, setActiveMenu] = useState<MainNavMenu>('overview');
  const [activeFilter, setActiveFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [searchWorker, setSearchWorker] = useState<string>('');
  const [tradeFilter, setTradeFilter] = useState<string>('ALL');

  const [paused, setPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isHindi, setIsHindi] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<string>('');
  const tickRef = useRef<number>(0);
  const prevHashRef = useRef<string>('9b4f12');

  // Handle Theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Main Simulation Loop
  useEffect(() => {
    if (paused) return;

    const intervalTime = Math.max(500, 2000 / speed);

    const timer = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;

      // 1. Update Site Conditions (Temperature & Humidity)
      setSiteConditions((prev) => {
        const baseTemp = 29 + 2.5 * Math.sin(tick / 40) + (prev.heatwaveActive ? 6.5 : 0);
        const newTemp = Number((prev.temp + (baseTemp - prev.temp) * 0.3 + (Math.random() - 0.5) * 0.2).toFixed(1));
        const targetRh = 54 + (prev.heatwaveActive ? 10 : 0);
        const newRh = Math.round(Math.max(30, Math.min(92, prev.rh + (targetRh - prev.rh) * 0.2 + (Math.random() - 0.5) * 2)));
        const oldHi = prev.heatIndex;
        const newHi = calculateHeatIndex(newTemp, newRh);

        // Site heat alert check
        if (oldHi < thresholds.hiR && newHi >= thresholds.hiR) {
          addAuditEntry(2, 'Site Node', `Heat index reached dangerous ${newHi}°C`, 'Heat alert');
          safetyAudio.playCriticalAlert();
        } else if (oldHi < thresholds.hiY && newHi >= thresholds.hiY) {
          addAuditEntry(1, 'Site Node', `Heat index reached caution ${newHi}°C`, 'Heat alert');
          safetyAudio.playCautionAlert();
        }

        return {
          ...prev,
          temp: newTemp,
          rh: newRh,
          heatIndex: newHi,
        };
      });

      // 2. Update Workers' vitals and rule evaluations
      setWorkers((prevWorkers) => {
        return prevWorkers.map((w) => {
          const isResting = w.restRemaining > 0;
          const nextRestRemaining = isResting ? w.restRemaining - 1 : 0;
          const nextMinutes = isResting ? w.minutesSinceBreak : w.minutesSinceBreak + 2;

          // Target heart rate calculation based on physical load + heat stress
          const overHeat = Math.max(0, siteConditions.heatIndex - 30);
          const targetHr = isResting
            ? w.baselineHr + 4
            : w.baselineHr + 26 * w.loadFactor + overHeat * 1.8 + (w.stressActive ? 45 : 0);

          const nextHr = Math.max(50, Math.min(195, Math.round(w.hr + (targetHr - w.hr) * 0.35 + (Math.random() - 0.5) * 3)));

          // Skin temperature
          const targetSkin = 33.4 + Math.max(0, siteConditions.heatIndex - 28) * 0.16 + (w.stressActive ? 1.4 : 0) - (isResting ? 0.7 : 0);
          const nextSkin = Number((w.skinTemp + (targetSkin - w.skinTemp) * 0.2 + (Math.random() - 0.5) * 0.06).toFixed(1));

          // SpO2
          const targetSpO2 = Math.min(99, 98.5 - Math.max(0, siteConditions.heatIndex - 38) * 0.18 - (w.stressActive ? 4.5 : 0));
          const nextSpO2 = Math.min(99, Math.max(82, Math.round(w.spO2 + (targetSpO2 - w.spO2) * 0.3 + (Math.random() - 0.5) * 0.4)));

          // History sparkline
          const nextHistory = [...w.hrHistory, nextHr];
          if (nextHistory.length > 30) nextHistory.shift();

          // Rule Evaluation
          const evaluation = evaluateVitals(
            nextHr,
            nextSpO2,
            nextSkin,
            siteConditions.heatIndex,
            nextMinutes,
            thresholds
          );

          // Escalate alert check
          if (evaluation.level > w.level && tick - w.lastAlertTick > 6) {
            addAuditEntry(evaluation.level, w.name, evaluation.reasons.join('; '), evaluation.level === 2 ? 'Rest now' : 'Caution');
            if (evaluation.level === 2) {
              safetyAudio.playCriticalAlert();
              safetyAudio.playWearableBuzzer();
            } else {
              safetyAudio.playCautionAlert();
            }
            return {
              ...w,
              hr: nextHr,
              spO2: nextSpO2,
              skinTemp: nextSkin,
              hrHistory: nextHistory,
              minutesSinceBreak: nextMinutes,
              restRemaining: nextRestRemaining,
              level: evaluation.level,
              reasons: evaluation.reasons,
              lastAlertTick: tick,
            };
          }

          return {
            ...w,
            hr: nextHr,
            spO2: nextSpO2,
            skinTemp: nextSkin,
            hrHistory: nextHistory,
            minutesSinceBreak: nextMinutes,
            restRemaining: nextRestRemaining,
            level: evaluation.level,
            reasons: evaluation.reasons,
          };
        });
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [paused, speed, thresholds, siteConditions.heatIndex]);

  // Add immutable entry to audit log
  const addAuditEntry = (level: RiskLevel, who: string, message: string, label: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const hashId = generateAuditHash(prevHashRef.current, timeStr, who, message);
    prevHashRef.current = hashId;

    const newLog: AuditLogEntry = {
      id: hashId,
      timestamp: timeStr,
      level,
      who,
      message,
      label,
      acknowledgedBy: null,
      notifiedChannels: 'supervisor dashboard + wearable buzzer',
    };

    setAuditLogs((prev) => [newLog, ...prev.slice(0, 45)]);
  };

  // Supervisor Actions
  const handleAcknowledgeAlert = (logId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, acknowledgedBy: `Supervisor (${timeStr})` } : l))
    );
  };

  const handleSendBreak = (workerId: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          addAuditEntry(0, w.name, 'Break ordered by site supervisor; wearable vibrated', 'Action');
          return {
            ...w,
            restRemaining: 15,
            minutesSinceBreak: 0,
            stressActive: false,
          };
        }
        return w;
      })
    );
  };

  const handleBroadcastBreakToAll = () => {
    workers.forEach((w) => handleSendBreak(w.id));
    addAuditEntry(0, 'All Active Workers', 'Mandatory site-wide hydration break broadcasted', 'Hydration Bell');
  };

  const handleToggleStress = (workerId: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const nextStress = !w.stressActive;
          addAuditEntry(0, w.name, nextStress ? 'Physical stress test started' : 'Stress test cleared', 'Simulation');
          return { ...w, stressActive: nextStress };
        }
        return w;
      })
    );
  };

  // Set site conditions from 3D Earth pinned location
  const handleApplySiteLocation = (temp: number, rh: number, locName: string) => {
    const newHi = calculateHeatIndex(temp, rh);
    setSiteConditions((prev) => ({
      ...prev,
      temp,
      rh,
      heatIndex: newHi,
    }));
    addAuditEntry(
      newHi >= thresholds.hiR ? 2 : newHi >= thresholds.hiY ? 1 : 0,
      'Supervisor Dashboard',
      `Worksite environment calibrated to ${locName} (${temp}°C, ${rh}% RH, HI ${newHi}°C) via 3D World Pin`,
      'Site Relocation'
    );
  };

  // Ingest sample ESP32 payload
  const handleSimulateIncomingPacket = (packet: { worker_id: string; hr: number; spo2: number; skin_c: number }) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === packet.worker_id) {
          const nextHistory = [...w.hrHistory, packet.hr];
          if (nextHistory.length > 30) nextHistory.shift();

          const evaluation = evaluateVitals(
            packet.hr,
            packet.spo2,
            packet.skin_c,
            siteConditions.heatIndex,
            w.minutesSinceBreak,
            thresholds
          );

          addAuditEntry(evaluation.level, `${w.name} [${packet.worker_id}]`, `ESP32 payload synced: HR ${packet.hr} bpm, SpO₂ ${packet.spo2}%, Skin ${packet.skin_c}°C`, evaluation.level === 2 ? 'Rest now' : evaluation.level === 1 ? 'Caution' : 'Fit to work');

          return {
            ...w,
            hr: packet.hr,
            spO2: packet.spo2,
            skinTemp: packet.skin_c,
            hrHistory: nextHistory,
            level: evaluation.level,
            reasons: evaluation.reasons,
          };
        }
        return w;
      })
    );
  };

  // Filter workers
  const filteredWorkers = workers.filter((w) => {
    const matchesLevel = activeFilter === 'ALL' || w.level === activeFilter;
    const matchesSearch =
      searchWorker === '' ||
      w.name.toLowerCase().includes(searchWorker.toLowerCase()) ||
      w.role.toLowerCase().includes(searchWorker.toLowerCase()) ||
      w.id.toLowerCase().includes(searchWorker.toLowerCase());
    const matchesTrade = tradeFilter === 'ALL' || w.role === tradeFilter;
    return matchesLevel && matchesSearch && matchesTrade;
  });

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];
  const uniqueTrades = Array.from(new Set(workers.map((w) => w.role)));

  const criticalWorkersCount = workers.filter((w) => w.level === 2).length;
  const openAlertsCount = auditLogs.filter((l) => !l.acknowledgedBy && l.level > 0).length;

  return (
    <div className="min-h-screen flex flex-col font-sans-ui bg-[var(--bg)] text-[var(--ink)]">
      {/* Top Header with Authentic Majdoor Logo */}
      <Header
        paused={paused}
        onTogglePause={() => setPaused(!paused)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => {
          const next = !isSoundEnabled;
          setIsSoundEnabled(next);
          safetyAudio.setEnabled(next);
        }}
        currentTime={currentTime}
        isHindi={isHindi}
        onToggleLanguage={() => setIsHindi(!isHindi)}
        onOpenAddWorker={() => setIsAddModalOpen(true)}
      />

      {/* Multi-Section Navigation Menu */}
      <NavigationMenu
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        workersCount={workers.length}
        criticalCount={criticalWorkersCount}
        openAlertsCount={openAlertsCount}
        isHindi={isHindi}
        onOpenEmergencySop={() => setActiveMenu('firstaid')}
      />

      {/* Main Container */}
      <main className="max-w-[1240px] w-full mx-auto px-4 md:px-6 py-6 flex-1">
        {/* VIEW 1: OVERVIEW (Main Workforce Grid) */}
        {activeMenu === 'overview' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Summary Statistics */}
            <StatsCards
              workers={workers}
              logs={auditLogs}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
              isHindi={isHindi}
            />

            {/* Main Grid: Workers (Left) + Site & Selected Details (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start mb-5">
              {/* Workers Section */}
              <section className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--bd)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif-fraunces font-bold text-lg md:text-xl text-[var(--ink)] m-0 leading-tight">
                        {isHindi ? 'कार्यस्थल पर सक्रिय मज़दूर' : 'Workers on site'}
                      </h2>
                      <span className="text-[11px] font-mono-num font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--muted)] border border-[var(--bd)]">
                        {filteredWorkers.length} / {workers.length}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--muted)] font-medium">
                      {isHindi ? 'रीयल-टाइम बायोमेट्रिक मॉनिटरिंग ग्रिड' : 'Real-time physiological stress & heat strain monitoring'}
                    </span>
                  </div>

                  {/* Search & Trade filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={isHindi ? 'नाम या ट्रेड खोजें...' : 'Filter workers...'}
                        value={searchWorker}
                        onChange={(e) => setSearchWorker(e.target.value)}
                        className="pl-8 pr-2.5 py-1.5 text-xs border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] focus:outline-none focus:border-amber-400 w-36 sm:w-44 transition-colors font-medium"
                      />
                    </div>

                    <select
                      value={tradeFilter}
                      onChange={(e) => setTradeFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] cursor-pointer font-medium focus:outline-none focus:border-amber-400"
                    >
                      <option value="ALL">{isHindi ? 'सभी ट्रेड' : 'All Trades'}</option>
                      {uniqueTrades.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    {activeFilter !== 'ALL' && (
                      <button
                        onClick={() => setActiveFilter('ALL')}
                        className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline px-1.5 py-1"
                      >
                        {isHindi ? 'फ़िल्टर हटाएँ' : 'Clear filter'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Workers Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {filteredWorkers.map((w) => (
                    <WorkerCard
                      key={w.id}
                      worker={w}
                      isSelected={w.id === selectedWorkerId}
                      onSelect={(selected) => setSelectedWorkerId(selected.id)}
                      isHindi={isHindi}
                    />
                  ))}
                </div>
              </section>

              {/* Right Aside: Site Conditions + Worker Detail */}
              <aside className="space-y-4">
                <SiteConditionsCard
                  conditions={siteConditions}
                  onToggleHeatwave={(active) =>
                    setSiteConditions((prev) => ({ ...prev, heatwaveActive: active }))
                  }
                  speed={speed}
                  onChangeSpeed={setSpeed}
                  isHindi={isHindi}
                />

                {selectedWorker && (
                  <WorkerDetailCard
                    worker={selectedWorker}
                    thresholds={thresholds}
                    onSendBreak={handleSendBreak}
                    onToggleStress={handleToggleStress}
                    isHindi={isHindi}
                  />
                )}
              </aside>
            </div>

            {/* Safety Audit Log */}
            <AuditLogCard logs={auditLogs} onAcknowledge={handleAcknowledgeAlert} isHindi={isHindi} />

            {/* Lower 3 Cards: Rules, Check Reading, Hardware Connect */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <ThresholdRulesCard
                thresholds={thresholds}
                onUpdateThreshold={(key, val) =>
                  setThresholds((prev) => ({ ...prev, [key]: val }))
                }
                onResetDefaults={() => setThresholds(DEFAULT_THRESHOLDS)}
                isHindi={isHindi}
              />

              <CheckReadingCard
                currentHeatIndex={siteConditions.heatIndex}
                thresholds={thresholds}
                isHindi={isHindi}
              />

              <WearableConnectCard
                onSimulateIncomingPacket={handleSimulateIncomingPacket}
                isHindi={isHindi}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: SITE WORK ZONES */}
        {activeMenu === 'zones' && (
          <div className="animate-in fade-in duration-150">
            <WorkZonesView
              workers={workers}
              siteConditions={siteConditions}
              onSendBreak={handleSendBreak}
              isHindi={isHindi}
            />
          </div>
        )}

        {/* VIEW 3: HYDRATION & WORK-REST PLANNER */}
        {activeMenu === 'planner' && (
          <div className="animate-in fade-in duration-150">
            <HydrationPlannerView
              siteConditions={siteConditions}
              isHindi={isHindi}
              onBroadcastBreakToAll={handleBroadcastBreakToAll}
            />
          </div>
        )}

        {/* VIEW 4: SAFETY AUDIT & BOCW COMPLIANCE */}
        {activeMenu === 'compliance' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <ComplianceView logs={auditLogs} isHindi={isHindi} />
            <AuditLogCard logs={auditLogs} onAcknowledge={handleAcknowledgeAlert} isHindi={isHindi} />
          </div>
        )}

        {/* VIEW 5: WEARABLES & IOT HARDWARE */}
        {activeMenu === 'hardware' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <HardwareDiagnosticsView workers={workers} isHindi={isHindi} />
            <WearableConnectCard
              onSimulateIncomingPacket={handleSimulateIncomingPacket}
              isHindi={isHindi}
            />
          </div>
        )}

        {/* VIEW 6: HEAT STROKE FIRST-AID SOP */}
        {activeMenu === 'firstaid' && (
          <div className="animate-in fade-in duration-150">
            <EmergencySopView isHindi={isHindi} />
          </div>
        )}

        {/* VIEW 7: 3D EARTH SITE PIN */}
        {activeMenu === 'earth' && (
          <div className="animate-in fade-in duration-150">
            <Earth3DView
              isHindi={isHindi}
              onApplySiteLocation={handleApplySiteLocation}
            />
          </div>
        )}

        {/* Responsible Footer */}
        <footer className="text-center text-xs text-[var(--muted)] py-6 border-t border-[var(--bd)] space-y-1.5 mt-8">
          <div className="font-semibold text-[var(--ink)] flex items-center justify-center gap-2">
            <HeartHandshake className="w-4 h-4 text-amber-500" />
            <span>
              {isHindi
                ? 'जानबैंड: हर मज़दूर की सुरक्षा, स्वास्थ्य और सम्मान के लिए समर्पित'
                : 'JaanShield: Dedicated to worker health, occupational safety, and zero heat-stress deaths'}
            </span>
          </div>
          <div className="text-[11px] text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
            {isHindi
              ? 'अनुसंधान व प्रदर्शन प्रोटोटाइप। यह प्रमाणित चिकित्सा उपकरण नहीं है। अनुमानित हीट इंडेक्स और वाइटल्स जोखिम संकेतक।'
              : 'Prototype for demonstration. Not a certified medical device. Wearable wrist sensor estimates physiological heat strain to prompt early rest interventions.'}
          </div>
        </footer>
      </main>

      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWorker={(newWorker) => {
          setWorkers((prev) => [...prev, newWorker]);
          setSelectedWorkerId(newWorker.id);
          addAuditEntry(0, newWorker.name, `New worker registered on site as ${newWorker.role}`, 'Registration');
        }}
        nextId={`W0${workers.length + 1}`}
        isHindi={isHindi}
      />
    </div>
  );
}
