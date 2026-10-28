export type RiskLevel = 0 | 1 | 2; // 0 = Fit to work, 1 = Caution, 2 = Rest now

export interface ConstructionWorker {
  id: string; // e.g. "W01"
  name: string;
  role: string;
  baselineHr: number;
  loadFactor: number; // 0.1 to 1.0 (heavy task multiplier)
  hr: number;
  spO2: number;
  skinTemp: number; // in °C
  hrHistory: number[]; // last 30 readings
  minutesSinceBreak: number;
  level: RiskLevel;
  reasons: string[];
  restRemaining: number; // ticks of break remaining
  stressActive: boolean; // simulated physical stress
  lastAlertTick: number;
}

export interface AlertThresholds {
  hrY: number; // Heart rate caution (bpm)
  hrR: number; // Heart rate critical (bpm)
  spY: number; // SpO2 caution (%)
  spR: number; // SpO2 critical (%)
  tY: number;  // Skin temp caution (°C)
  tR: number;  // Skin temp critical (°C)
  hiY: number; // Heat index caution (°C)
  hiR: number; // Heat index critical (°C)
  brk: number; // Break due after (min)
}

export interface SiteConditions {
  temp: number; // Air temp °C
  rh: number;   // Relative humidity %
  heatIndex: number; // Calculated Rothfusz heat index °C
  heatwaveActive: boolean;
}

export interface AuditLogEntry {
  id: string; // Cryptographic hash
  timestamp: string; // Time string
  level: RiskLevel;
  who: string;
  message: string;
  label: string;
  acknowledgedBy: string | null;
  notifiedChannels: string;
}

export interface RuleEvaluationResult {
  level: RiskLevel;
  reasons: string[];
}
