import React, { useState, useEffect, useRef } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  ConstructionWorker,
  AlertThresholds,
  SiteConditions,
  AuditLogEntry,
  RiskLevel,
} from './types/JaanShield';
import { DEFAULT_THRESHOLDS, INITIAL_SITE_CONDITIONS } from './data/initialData';
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
import { Search, HeartHandshake, LogIn, LogOut, Radio } from 'lucide-react';

const firebaseConfig = {
  projectId: 'thinking-airway-t01dl',
  appId: '1:984732787044:web:b970a90fdb9b10d39a5a71',
  apiKey: 'AIzaSyDFw7FIj8YCGllc6ofNXP12swKndUVJHdE',
  authDomain: 'thinking-airway-t01dl.firebaseapp.com',
  firestoreDatabaseId:
    'ai-studio-jaanbandcoremkiv-70021240-1a25-48a5-9641-54bb740133e2',
  storageBucket: 'thinking-airway-t01dl.firebasestorage.app',
  messagingSenderId: '984732787044',
};

const firebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
const googleProvider = new GoogleAuthProvider();

function sanitizeId(raw: string, maxLen = 32): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLen);
}

function conditionToRiskLevel(condition: unknown): RiskLevel {
  if (condition === 'critical') return 2;
  if (condition === 'caution') return 1;
  return 0;
}

function riskLevelToCondition(level: RiskLevel): 'normal' | 'caution' | 'critical' {
  if (level === 2) return 'critical';
  if (level === 1) return 'caution';
  return 'normal';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [syncConnected, setSyncConnected] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [workers, setWorkers] = useState<ConstructionWorker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [siteConditions, setSiteConditions] = useState<SiteConditions>(INITIAL_SITE_CONDITIONS);
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

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
  const prevHashRef = useRef<string>('9b4f12');
  const hrHistoryRef = useRef<Record<string, number[]>>({});
  const prevLevelRef = useRef<Record<string, RiskLevel>>({});
  const ownerMapRef = useRef<Record<string, string>>({});
  const bandMapRef = useRef<Record<string, string>>({});

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

  const addAuditEntry = (level: RiskLevel, who: string, message: string, label: string) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setWorkers([]);
        setSyncConnected(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user || paused) return;

    const isAdmin =
      user.emailVerified && user.email?.toLowerCase() === 'dancerohmrobin@gmail.com';
    const workersRef = collection(db, 'workers');
    const q = isAdmin ? workersRef : query(workersRef, where('ownerUid', '==', user.uid));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setSyncConnected(true);
        setSyncError(null);

        const mapped: ConstructionWorker[] = snapshot.docs
          .map((docSnap) => {
            const d = docSnap.data() as Record<string, unknown>;
            const id = String(d.id || docSnap.id);
            const name = String(d.name || 'Worker');
            const role = String(d.role || 'Site Worker');
            const bandId = String(d.bandId || `JB-MK4-${id}`);
            const baselineHr = Number(d.baselineHr || 74);
            const loadFactor = Number(d.loadFactor || 0.5);
            const last =
              d.lastReport && typeof d.lastReport === 'object'
                ? (d.lastReport as Record<string, unknown>)
                : null;

            ownerMapRef.current[id] = String(d.ownerUid || user.uid);
            bandMapRef.current[id] = bandId;

            const hr = last ? Number(last.bpm || 0) : 0;
            const spO2 = last ? Number(last.spo2 || 0) : 0;
            const skinTemp = last ? Number(last.skinTempC || 0) : 0;
            const minutesSinceBreak = last ? Number(last.minutesSinceBreak || 0) : 0;

            const prevHist = hrHistoryRef.current[id] || [];
            const nextHist =
              hr > 0 && prevHist[prevHist.length - 1] !== hr
                ? [...prevHist, hr].slice(-30)
                : prevHist;
            hrHistoryRef.current[id] = nextHist;

            const level = last
              ? conditionToRiskLevel(last.condition ?? d.condition)
              : (0 as RiskLevel);

            const reasons = Array.isArray(d.reasons)
              ? d.reasons.map((r) => String(r))
              : [`Band ${bandId} paired — awaiting live reading`];

            const prevLevel = prevLevelRef.current[id] ?? 0;
            if (last && level > prevLevel) {
              addAuditEntry(
                level,
                `${name} [${bandId}]`,
                reasons.join('; '),
                level === 2 ? 'Rest now' : 'Caution'
              );
              if (level === 2) {
                safetyAudio.playCriticalAlert();
                safetyAudio.playWearableBuzzer();
              } else {
                safetyAudio.playCautionAlert();
              }
            }
            prevLevelRef.current[id] = level;

            return {
              id,
              name,
              role,
              baselineHr,
              loadFactor,
              hr,
              spO2,
              skinTemp,
              hrHistory: nextHist,
              minutesSinceBreak,
              restRemaining: 0,
              level,
              reasons,
              stressActive: level === 2,
              lastAlertTick: 0,
            };
          })
          .sort((a, b) => a.id.localeCompare(b.id));

        setWorkers(mapped);
        setSelectedWorkerId((prev) =>
          prev && mapped.some((w) => w.id === prev) ? prev : mapped[0]?.id || ''
        );
      },
      (err) => {
        setSyncConnected(false);
        setSyncError(err.message || 'Firestore sync permission error');
      }
    );

    return () => unsub();
  }, [authReady, user, paused]);

  const pushTelemetryToFirestore = async (
    workerId: string,
    bpm: number,
    spo2: number,
    skinTempC: number,
    minutesSinceBreak = 0,
    source: 'api' | 'manual' = 'api'
  ) => {
    if (!user) return;
    const cleanId = sanitizeId(workerId, 32);
    const bandId = sanitizeId(bandMapRef.current[cleanId] || `JB-MK4-${cleanId}`, 48);
    const ownerUid = ownerMapRef.current[cleanId] || user.uid;

    const evaluation = evaluateVitals(
      bpm,
      spo2,
      skinTempC,
      siteConditions.heatIndex,
      minutesSinceBreak,
      thresholds
    );
    const condition = riskLevelToCondition(evaluation.level);
    const reasons = (
      evaluation.reasons.length > 0
        ? evaluation.reasons
        : ['All biometric thresholds within safe limits']
    )
      .map((r) => r.slice(0, 160))
      .slice(0, 10);

    const reportId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `rep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const snapshot = {
      id: reportId,
      workerId: cleanId,
      bandId,
      bpm: Math.round(Math.min(240, Math.max(25, bpm))),
      spo2: Number(Math.min(100, Math.max(50, spo2)).toFixed(1)),
      skinTempC: Number(Math.min(45, Math.max(25, skinTempC)).toFixed(2)),
      hrvMs: null,
      heatIndexC: Number(siteConditions.heatIndex.toFixed(1)),
      perfusionIndex: null,
      batteryPct: null,
      minutesSinceBreak: Math.round(Math.min(1440, Math.max(0, minutesSinceBreak))),
      condition,
      reasons,
      source,
      timestamp: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'workers', cleanId, 'telemetry', reportId), {
      ...snapshot,
      ownerUid,
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'workers', cleanId), {
      bandId,
      condition,
      reasons,
      lastReport: snapshot,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  };

  const handleAddWorkerToFirestore = async (newWorker: ConstructionWorker) => {
    if (!user) {
      setSyncError('Please sign in with Google before registering workers.');
      return;
    }
    const cleanId = sanitizeId(newWorker.id || `W0${workers.length + 1}`, 32);
    const cleanBandId = sanitizeId(`JB-MK4-${cleanId}`, 48);

    await setDoc(doc(db, 'workers', cleanId), {
      id: cleanId,
      name: (newWorker.name || 'Worker').trim().slice(0, 80),
      role: (newWorker.role || 'Site Worker').trim().slice(0, 60),
      bandId: cleanBandId,
      baselineHr: Math.min(140, Math.max(40, Number(newWorker.baselineHr || 74))),
      loadFactor: Math.min(2.0, Math.max(0.1, Number(newWorker.loadFactor || 0.5))),
      condition: 'unlinked',
      reasons: ['Band paired — awaiting live sensor report'],
      lastReport: null,
      ownerUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setSelectedWorkerId(cleanId);
    addAuditEntry(
      0,
      newWorker.name,
      `Worker ${cleanId} synced to Firestore with band ${cleanBandId}`,
      'Registration'
    );
  };

  const handleSignIn = async () => {
    setSyncError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Google Sign-In failed');
    }
  };

  const handleSignOut = async () => {
    setSyncError(null);
    await signOut(auth);
  };

  const handleAcknowledgeAlert = (logId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, acknowledgedBy: `Supervisor (${timeStr})` } : l))
    );
  };

  const handleSendBreak = (workerId: string) => {
    const target = workers.find((w) => w.id === workerId);
    if (!target) return;
    addAuditEntry(0, target.name, 'Break ordered by site supervisor; wearable vibrated', 'Action');
    if (target.hr > 0) {
      void pushTelemetryToFirestore(
        target.id,
        target.hr,
        target.spO2 || 98,
        target.skinTemp || 35,
        0,
        'manual'
      );
    }
  };

  const handleBroadcastBreakToAll = () => {
    workers.forEach((w) => handleSendBreak(w.id));
    addAuditEntry(
      0,
      'All Active Workers',
      'Mandatory site-wide hydration break broadcasted',
      'Hydration Bell'
    );
  };

  const handleToggleStress = (workerId: string) => {
    const target = workers.find((w) => w.id === workerId);
    if (!target) return;
    addAuditEntry(0, target.name, 'Live JaanBand hardware stream active (simulation disabled)', 'Live Band');
  };

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

  const handleSimulateIncomingPacket = (packet: {
    worker_id: string;
    hr: number;
    spo2: number;
    skin_c: number;
  }) => {
    void pushTelemetryToFirestore(packet.worker_id, packet.hr, packet.spo2, packet.skin_c, 0, 'api');
  };

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

      <NavigationMenu
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        workersCount={workers.length}
        criticalCount={criticalWorkersCount}
        openAlertsCount={openAlertsCount}
        isHindi={isHindi}
        onOpenEmergencySop={() => setActiveMenu('firstaid')}
      />

      <main className="max-w-[1240px] w-full mx-auto px-4 md:px-6 py-6 flex-1">
        <div className="mb-5 p-3.5 rounded-xl bg-[var(--card)] border border-[var(--bd)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs">
            <Radio
              className={`w-4 h-4 ${syncConnected ? 'text-emerald-500 animate-pulse' : 'text-[var(--muted)]'}`}
            />
            <span className="font-semibold text-[var(--ink)]">
              {user
                ? syncConnected
                  ? `Live JaanBand Firestore Sync (${user.email})`
                  : 'Connecting to shared Firestore...'
                : 'Sign in with Google to receive live JaanBand telemetry'}
            </span>
          </div>

          {authReady &&
            (user ? (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--bd)] text-xs font-semibold hover:border-amber-400 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSignIn()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            ))}
        </div>

        {syncError && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 font-medium">
            {syncError}
          </div>
        )}

        {activeMenu === 'overview' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <StatsCards
              workers={workers}
              logs={auditLogs}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
              isHindi={isHindi}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start mb-5">
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
                      {isHindi
                        ? 'रीयल-टाइम बायोमेट्रिक मॉनिटरिंग ग्रिड'
                        : 'Real-time physiological stress & heat strain monitoring (live band data)'}
                    </span>
                  </div>

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

                {filteredWorkers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--bd)] rounded-xl">
                    {user
                      ? 'No live workers registered yet. Add a worker here or pair one in JaanBand.'
                      : 'Sign in with Google above to load real workers and live JaanBand readings.'}
                  </div>
                ) : (
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
                )}
              </section>

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

            <AuditLogCard logs={auditLogs} onAcknowledge={handleAcknowledgeAlert} isHindi={isHindi} />

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

        {activeMenu === 'planner' && (
          <div className="animate-in fade-in duration-150">
            <HydrationPlannerView
              siteConditions={siteConditions}
              isHindi={isHindi}
              onBroadcastBreakToAll={handleBroadcastBreakToAll}
            />
          </div>
        )}

        {activeMenu === 'compliance' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <ComplianceView logs={auditLogs} isHindi={isHindi} />
            <AuditLogCard logs={auditLogs} onAcknowledge={handleAcknowledgeAlert} isHindi={isHindi} />
          </div>
        )}

        {activeMenu === 'hardware' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <HardwareDiagnosticsView workers={workers} isHindi={isHindi} />
            <WearableConnectCard
              onSimulateIncomingPacket={handleSimulateIncomingPacket}
              isHindi={isHindi}
            />
          </div>
        )}

        {activeMenu === 'firstaid' && (
          <div className="animate-in fade-in duration-150">
            <EmergencySopView isHindi={isHindi} />
          </div>
        )}

        {activeMenu === 'earth' && (
          <div className="animate-in fade-in duration-150">
            <Earth3DView
              isHindi={isHindi}
              onApplySiteLocation={handleApplySiteLocation}
            />
          </div>
        )}

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

      <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWorker={(newWorker) => {
          void handleAddWorkerToFirestore(newWorker);
        }}
        nextId={`W0${workers.length + 1}`}
        isHindi={isHindi}
      />
    </div>
  );
}
