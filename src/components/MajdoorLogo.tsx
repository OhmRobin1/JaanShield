import React from 'react';

interface MajdoorLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  isHindi?: boolean;
}

export const MajdoorLogo: React.FC<MajdoorLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  isHindi = false,
}) => {
  const iconSize = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Custom Majdoor (Construction Worker) Hardhat + Vital Heartbeat Band SVG Emblem */}
      <div
        className="relative shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-1.5 shadow-md border border-amber-300/40 flex items-center justify-center text-slate-900 overflow-hidden"
        style={{ width: iconSize, height: iconSize }}
      >
        {/* Subtle background solar rays radiating */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)]" />

        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-xs"
        >
          {/* Construction Worker Hardhat (मजदूर सुरक्षा हेल्मेट) */}
          {/* Hardhat Crown */}
          <path
            d="M16 28C16 19.1634 23.1634 12 32 12C40.8366 12 48 19.1634 48 28V32H16V28Z"
            fill="#0F172A"
          />
          {/* Hardhat Center Reinforcement Ridge */}
          <path
            d="M30 12H34V32H30V12Z"
            fill="#FBBF24"
          />
          {/* Hardhat Brim (मजबूत छज्जा) */}
          <path
            d="M11 32H53C54.6569 32 56 33.3431 56 35C56 35.5523 55.5523 36 55 36H9C8.44772 36 8 35.5523 8 35C8 33.3431 9.34315 32 11 32Z"
            fill="#0F172A"
          />
          {/* Safety Reflector Strip on Helmet */}
          <path
            d="M18 26C21.5 24 26.5 23 32 23C37.5 23 42.5 24 46 26"
            stroke="#FDE047"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Protective Wristband & Vital Life Pulse (जानबैंड - जीवन तरंग) */}
          {/* Wristband Base Arc */}
          <path
            d="M14 44C14 52.8366 22.0589 58 32 58C41.9411 58 50 52.8366 50 44"
            stroke="#0F172A"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Vital ECG Pulse Line in Helmet & Band (दिल की धड़कन) */}
          <path
            d="M16 46H23L26 39L30 53L34 41L37 49L39 46H48"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Green Health Guardian Dot */}
          <circle cx="32" cy="18" r="2.5" fill="#10B981" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-serif-fraunces text-2xl md:text-[27px] font-bold tracking-tight text-white leading-none">
            JaanShield
          </span>
          <span className="text-[10px] font-sans-ui font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wide uppercase">
            {isHindi ? 'मज़दूर सुरक्षा' : 'Worker Safety'}
          </span>
        </div>

        {showTagline && (
          <div className="text-slate-300 text-xs md:text-sm font-medium mt-0.5 flex items-center gap-1.5">
            <span>{isHindi ? 'हर मज़दूर की जान, एक बैंड में।' : 'Har mazdoor ki jaan, ek band mein.'}</span>
            <span className="hidden sm:inline text-amber-400/70">·</span>
            <span className="hidden sm:inline text-[11px] text-amber-300/90 font-serif-fraunces italic">
              {isHindi ? 'श्रमेव जयते' : 'Shramev Jayate'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
