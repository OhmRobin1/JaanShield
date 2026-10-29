import React, { useState } from 'react';
import { AuditLogEntry, RiskLevel } from '../types/JaanShield';
import { safetyAudio } from '../utils/audio';
import { ShieldCheck, Download, Search, CheckCircle2, AlertOctagon, AlertTriangle, Copy, Check } from 'lucide-react';

interface AuditLogCardProps {
  logs: AuditLogEntry[];
  onAcknowledge: (logId: string) => void;
  isHindi: boolean;
}

export const AuditLogCard: React.FC<AuditLogCardProps> = ({
  logs,
  onAcknowledge,
  isHindi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | RiskLevel>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.who.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSeverity === 'ALL' || l.level === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  const handleCopyHash = (hash: string) => {
    safetyAudio.playClick();
    navigator.clipboard.writeText(`#${hash}`);
    setCopiedId(hash);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const exportCSV = () => {
    safetyAudio.playClick();
    const headers = ['Audit Hash', 'Timestamp', 'Risk Level', 'Entity', 'Details', 'Notification', 'Acknowledged By'];
    const rows = logs.map((l) => [
      `#${l.id}`,
      l.timestamp,
      l.label,
      `"${l.who}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${l.notifiedChannels}"`,
      `"${l.acknowledgedBy || 'Unacknowledged'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JaanShield_Safety_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-sm mb-5">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--bd)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm border border-slate-700">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-fraunces font-bold text-lg md:text-xl text-[var(--ink)] m-0 leading-tight">
                {isHindi ? 'सुरक्षा ऑडिट रिकॉर्ड (टैम्पर-प्रूफ)' : 'Safety audit log'}
              </h2>
              <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--muted)] border border-[var(--bd)]">
                {logs.length} Records
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] m-0 font-medium mt-0.5">
              {isHindi
                ? 'क्रिप्टोग्राफ़िक हैश चेनिंग के साथ प्रत्येक चेतावनी व सुपरवाइज़र प्रतिक्रिया का सत्यापन'
                : 'Tamper-proof cryptographic ledger with supervisor response verification for compliance'}
            </p>
          </div>
        </div>

        {/* Action strip */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Filter tabs */}
          <div className="flex items-center gap-1 bg-[var(--soft)] p-1 rounded-lg border border-[var(--bd)] text-xs">
            <button
              onClick={() => {
                safetyAudio.playClick();
                setFilterSeverity('ALL');
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterSeverity === 'ALL'
                  ? 'bg-[var(--card)] text-[var(--ink)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                safetyAudio.playClick();
                setFilterSeverity(2);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterSeverity === 2
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-rose-600'
              }`}
            >
              Rest Now
            </button>
            <button
              onClick={() => {
                safetyAudio.playClick();
                setFilterSeverity(1);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterSeverity === 1
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-amber-600'
              }`}
            >
              Caution
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isHindi ? 'मज़दूर या हैश खोजें...' : 'Search logs...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs border border-[var(--bd)] rounded-lg bg-[var(--soft)] text-[var(--ink)] focus:outline-none focus:border-amber-400 w-36 sm:w-44"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            type="button"
            className="flex items-center gap-1.5 bg-[var(--card)] hover:bg-[var(--soft)] text-[var(--ink)] border border-[var(--bd)] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHindi ? 'CSV डाउनलोड' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="divide-y divide-[var(--bd)] max-h-88 overflow-y-auto pr-1">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const badgeStyle = {
              0: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' },
              1: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800' },
              2: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800' },
            }[log.level];

            return (
              <div
                key={log.id}
                className="grid grid-cols-1 md:grid-cols-[75px_95px_1fr_auto_80px] gap-2 md:gap-3 items-center py-2.5 text-xs transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/20 px-2 rounded-lg"
              >
                {/* 1. Time */}
                <span className="text-[var(--muted)] font-mono-num text-[11px] font-semibold tabular-nums">
                  {log.timestamp}
                </span>

                {/* 2. Chip */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[10px] md:text-[11px] px-2.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.color}`}
                  >
                    {log.level === 2 && <AlertOctagon className="w-3 h-3 text-rose-500 animate-pulse" />}
                    {log.level === 1 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                    {log.level === 0 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    <span>{log.label}</span>
                  </span>
                </div>

                {/* 3. Description & Notification channels */}
                <div className="leading-snug pr-2">
                  <span className="font-bold text-[var(--ink)]">{log.who}</span>: {log.message}
                  <small className="block text-[10px] text-[var(--muted)] font-medium mt-0.5">
                    {isHindi ? 'सूचित चैनल: सुपरवाइज़र डैशबोर्ड + मज़दूर का वाइब्रेशन बैंड' : `Channels notified: ${log.notifiedChannels}`}
                  </small>
                </div>

                {/* 4. Acknowledgment status / button */}
                <div className="shrink-0">
                  {log.acknowledgedBy ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 inline" />
                      <span>{log.acknowledgedBy}</span>
                    </span>
                  ) : log.level > 0 ? (
                    <button
                      onClick={() => {
                        safetyAudio.playClick();
                        onAcknowledge(log.id);
                      }}
                      type="button"
                      className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-900 rounded-md px-3 py-1 text-xs font-bold transition-all shadow-xs"
                    >
                      {isHindi ? 'स्वीकार करें' : 'Acknowledge'}
                    </button>
                  ) : null}
                </div>

                {/* 5. Cryptographic hash */}
                <div className="text-right">
                  <button
                    onClick={() => handleCopyHash(log.id)}
                    type="button"
                    className="inline-flex items-center gap-1 text-[10px] font-mono-num font-semibold text-[var(--muted)] bg-[var(--soft)] hover:bg-[var(--bd)] px-2 py-1 rounded-md border border-[var(--bd)] transition-colors"
                    title="Copy cryptographic audit hash"
                  >
                    <span>#{log.id}</span>
                    {copiedId === log.id ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-[var(--muted)]">
            {isHindi ? 'कोई रिकॉर्ड नहीं मिला।' : 'No audit entries found matching the filter.'}
          </div>
        )}
      </div>
    </section>
  );
};
