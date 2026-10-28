import React from 'react';
import {
  Users,
  MapPin,
  CalendarClock,
  ShieldCheck,
  Cpu,
  HeartPulse,
  PhoneCall,
  Globe,
} from 'lucide-react';
import { safetyAudio } from '../utils/audio';

export type MainNavMenu = 'overview' | 'zones' | 'planner' | 'compliance' | 'hardware' | 'firstaid' | 'earth';

interface NavigationMenuProps {
  activeMenu: MainNavMenu;
  onSelectMenu: (menu: MainNavMenu) => void;
  workersCount: number;
  criticalCount: number;
  openAlertsCount: number;
  isHindi: boolean;
  onOpenEmergencySop: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  activeMenu,
  onSelectMenu,
  workersCount,
  criticalCount,
  openAlertsCount,
  isHindi,
  onOpenEmergencySop,
}) => {
  const menuItems: {
    id: MainNavMenu;
    label: string;
    labelHi: string;
    icon: React.ReactNode;
    badge?: string | number | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Live Workforce Grid',
      labelHi: 'सक्रिय मज़दूर ग्रिड',
      icon: <Users className="w-4 h-4" />,
      badge: workersCount,
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'zones',
      label: 'Site Work Zones',
      labelHi: 'कार्यक्षेत्र हीट मैप',
      icon: <MapPin className="w-4 h-4" />,
      badge: isHindi ? '5 ज़ोन' : '5 Zones',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'planner',
      label: 'Hydration & Rest Planner',
      labelHi: 'विश्राम व हाइड्रेशन शेड्यूल',
      icon: <CalendarClock className="w-4 h-4" />,
    },
    {
      id: 'compliance',
      label: 'Safety Audit & Compliance',
      labelHi: 'ऑडिट व BOCW अनुपालन',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: openAlertsCount > 0 ? `${openAlertsCount} Alert` : null,
      badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
    },
    {
      id: 'hardware',
      label: 'Wearables & IoT Nodes',
      labelHi: 'वियरेबल्स स्थिति',
      icon: <Cpu className="w-4 h-4" />,
      badge: 'ESP32',
      badgeColor: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300',
    },
    {
      id: 'firstaid',
      label: 'Heat Stroke First-Aid SOP',
      labelHi: 'आपातकालीन एसओपी',
      icon: <HeartPulse className="w-4 h-4" />,
    },
    {
      id: 'earth',
      label: '3D Earth Site Pin',
      labelHi: '3D ग्लोब साइट पिन',
      icon: <Globe className="w-4 h-4" />,
      badge: '3D World',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    },
  ];

  return (
    <nav className="bg-[var(--card)] border-b border-[var(--bd)] shadow-xs select-none sticky top-0 z-30">
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 py-1.5 shrink-0">
          {menuItems.map((item) => {
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  safetyAudio.playClick();
                  onSelectMenu(item.id);
                }}
                type="button"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'bg-[#0f172a] text-white dark:bg-amber-500 dark:text-[#0f172a] shadow-sm'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--soft)]'
                }`}
              >
                <span className={isActive ? 'text-amber-400 dark:text-[#0f172a]' : 'text-slate-400 dark:text-slate-400'}>
                  {item.icon}
                </span>
                <span>{isHindi ? item.labelHi : item.label}</span>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono-num font-bold px-1.5 py-0.2 rounded-full border border-black/10 dark:border-white/10 ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/15 dark:text-slate-900'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Rapid Medical SOS Trigger Button */}
        <div className="hidden lg:flex items-center gap-2 shrink-0 py-1.5 pl-3 border-l border-[var(--bd)]">
          <button
            onClick={() => {
              safetyAudio.playCriticalAlert();
              onOpenEmergencySop();
            }}
            type="button"
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs"
            title="Heat stroke emergency first aid SOP & site hospital hotline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>{isHindi ? '108 आपातकालीन हेल्पलाइन' : '108 Ambulance / SOS'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
