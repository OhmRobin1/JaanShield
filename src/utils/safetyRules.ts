import { AlertThresholds, RuleEvaluationResult } from '../types/JaanShield';

/**
 * Standard Rothfusz Regression Formula for Heat Index (°C)
 * Takes ambient temperature (°C) and relative humidity (%)
 */
export function calculateHeatIndex(tempC: number, rh: number): number {
  const f = (tempC * 9) / 5 + 32;
  if (f < 80) return Number(tempC.toFixed(1));

  const h =
    -42.379 +
    2.04901523 * f +
    10.14333127 * rh -
    0.22475541 * f * rh -
    0.00683783 * f * f -
    0.05481717 * rh * rh +
    0.00122874 * f * f * rh +
    0.00085282 * f * rh * rh -
    0.00000199 * f * f * rh * rh;

  return Number((((h - 32) * 5) / 9).toFixed(1));
}

/**
 * Transparent, explainable rule-based scoring:
 * Classifies as Green (0: Fit to work), Yellow (1: Caution), or Red (2: Rest now).
 */
export function evaluateVitals(
  hr: number,
  spO2: number,
  skinTemp: number,
  heatIndex: number,
  minsSinceBreak: number,
  thresholds: AlertThresholds
): RuleEvaluationResult {
  let penaltyPoints = 0;
  const reasons: string[] = [];
  let isDirectRed = false;

  // Heart Rate
  if (hr >= thresholds.hrR) {
    penaltyPoints += 2;
    isDirectRed = true;
    reasons.push(`Heart rate ${Math.round(hr)} bpm (critical)`);
  } else if (hr >= thresholds.hrY) {
    penaltyPoints += 1;
    reasons.push(`Heart rate ${Math.round(hr)} bpm (elevated)`);
  }

  // SpO2 (low values indicate hypoxia / respiratory strain)
  if (spO2 <= thresholds.spR) {
    penaltyPoints += 2;
    isDirectRed = true;
    reasons.push(`SpO₂ ${Math.round(spO2)}% (critical hypoxia)`);
  } else if (spO2 <= thresholds.spY) {
    penaltyPoints += 1;
    reasons.push(`SpO₂ ${Math.round(spO2)}% (low)`);
  }

  // Skin Temperature
  if (skinTemp >= thresholds.tR) {
    penaltyPoints += 2;
    isDirectRed = true;
    reasons.push(`Skin temp ${skinTemp.toFixed(1)}°C (hyperthermia risk)`);
  } else if (skinTemp >= thresholds.tY) {
    penaltyPoints += 1;
    reasons.push(`Skin temp ${skinTemp.toFixed(1)}°C (high)`);
  }

  // Site Heat Index
  if (heatIndex >= thresholds.hiR) {
    penaltyPoints += 2;
    isDirectRed = true;
    reasons.push(`Site heat index ${heatIndex}°C (dangerous)`);
  } else if (heatIndex >= thresholds.hiY) {
    penaltyPoints += 1;
    reasons.push(`Site heat index ${heatIndex}°C (extreme caution)`);
  }

  // Shift Duration without Rest
  if (minsSinceBreak >= thresholds.brk) {
    penaltyPoints += 1;
    reasons.push(`No break for ${formatDuration(minsSinceBreak)}`);
  }

  const level = isDirectRed || penaltyPoints >= 3 ? 2 : penaltyPoints >= 1 ? 1 : 0;
  return { level, reasons };
}

/**
 * Format minutes into "2h 30m"
 */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/**
 * Cryptographic djb2 hash chain for tamper-proof safety audit logs
 */
export function generateAuditHash(prevId: string, timestamp: string, who: string, message: string): string {
  const seed = `${prevId}_${timestamp}_${who}_${message}`;
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0').slice(0, 6);
}
