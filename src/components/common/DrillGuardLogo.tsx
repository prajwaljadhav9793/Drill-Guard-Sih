import React, { useId } from 'react';
import { useNWIS } from '../../context/NWISContext';

interface DrillGuardLogoProps {
  variant?: 'stacked' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  forceTheme?: 'dark' | 'light';
  className?: string;
}

export const DrillGuardShieldMark: React.FC<{
  className?: string;
  isLight?: boolean;
}> = ({ className = 'w-10 h-10', isLight = false }) => {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 select-none`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`dg-shield-outer-${uid}`}
          x1="20"
          y1="20"
          x2="220"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0E3475" />
          <stop offset="50%" stopColor="#071D44" />
          <stop offset="100%" stopColor="#030D22" />
        </linearGradient>
        <linearGradient
          id={`dg-shield-rim-${uid}`}
          x1="30"
          y1="25"
          x2="205"
          y2="215"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#47E8FF" />
          <stop offset="45%" stopColor="#0088FF" />
          <stop offset="100%" stopColor="#003B9E" />
        </linearGradient>
        <linearGradient
          id={`dg-radar-bg-${uid}`}
          x1="115"
          y1="35"
          x2="205"
          y2="165"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#00A2FF" />
          <stop offset="55%" stopColor="#0051C4" />
          <stop offset="100%" stopColor="#031D4D" />
        </linearGradient>
        <linearGradient
          id={`dg-swoosh-${uid}`}
          x1="15"
          y1="70"
          x2="195"
          y2="195"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5CEBFF" />
          <stop offset="45%" stopColor="#008CFF" />
          <stop offset="100%" stopColor="#042661" />
        </linearGradient>
        <linearGradient
          id={`dg-well-glow-${uid}`}
          x1="125"
          y1="115"
          x2="125"
          y2="210"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <clipPath id={`dg-inner-clip-${uid}`}>
          <path d="M120 32 C158 32 194 46 202 52 C202 124 182 176 120 212 C58 176 38 124 38 52 C46 46 82 32 120 32 Z" />
        </clipPath>
      </defs>

      {/* Subtle Adaptive Halo for Dark / Light Mode */}
      <path
        d="M120 18 C166 18 208 35 216 42 C216 128 192 188 120 229 C48 188 24 128 24 42 C32 35 74 18 120 18 Z"
        fill={isLight ? '#FFFFFF' : '#38BDF8'}
        fillOpacity={isLight ? '0.9' : '0.14'}
      />

      {/* Outer Shield Base */}
      <path
        d="M120 22 C164 22 204 38 212 45 C212 126 189 184 120 224 C51 184 28 126 28 45 C36 38 76 22 120 22 Z"
        fill={`url(#dg-shield-outer-${uid})`}
        stroke={isLight ? '#0A2558' : '#38BDF8'}
        strokeWidth="2.5"
      />
      <path
        d="M120 28 C160 28 197 42 205 49 C205 125 184 179 120 216 C56 179 35 125 35 49 C43 42 80 28 120 28 Z"
        fill="none"
        stroke={`url(#dg-shield-rim-${uid})`}
        strokeWidth="5.5"
      />

      {/* Clipped Inner Shield Scene */}
      <g clipPath={`url(#dg-inner-clip-${uid})`}>
        {/* Left Sky Backdrop behind Derrick */}
        <rect x="30" y="25" width="92" height="105" fill="#EAF6FF" />
        <path d="M38 48 L96 36 L96 125 L38 125 Z" fill="#0095FF" opacity="0.24" />

        {/* Right GIS Radar & Map Half */}
        <rect x="115" y="25" width="98" height="115" fill={`url(#dg-radar-bg-${uid})`} />

        {/* GIS Grid & Topographic Contour Lines */}
        <g stroke="#47E8FF" strokeOpacity="0.24" strokeWidth="1">
          <line x1="130" y1="30" x2="130" y2="135" />
          <line x1="150" y1="30" x2="150" y2="135" />
          <line x1="170" y1="30" x2="170" y2="135" />
          <line x1="190" y1="30" x2="190" y2="135" />
          <line x1="115" y1="55" x2="210" y2="55" />
          <line x1="115" y1="75" x2="210" y2="75" />
          <line x1="115" y1="95" x2="210" y2="95" />
          <line x1="115" y1="115" x2="210" y2="115" />
          <path
            d="M116 44 Q138 38 152 54 T198 62"
            fill="none"
            stroke="#5CEBFF"
            strokeOpacity="0.45"
            strokeWidth="1.3"
          />
          <path
            d="M118 98 Q144 88 168 104 T204 108"
            fill="none"
            stroke="#5CEBFF"
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
        </g>

        {/* Radar Concentric Dashed Circles */}
        <circle
          cx="156"
          cy="92"
          r="34"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle
          cx="156"
          cy="92"
          r="21"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.9"
          strokeWidth="1.4"
          strokeDasharray="3 2.5"
        />
        <circle cx="156" cy="92" r="10" fill="#00E1FF" fillOpacity="0.32" />

        {/* Primary Center Location Pin */}
        <path
          d="M156 72 C149.5 72 144.5 77 144.5 83.5 C144.5 92 156 103 156 103 C156 103 167.5 92 167.5 83.5 C167.5 77 162.5 72 156 72 Z"
          fill="#FFFFFF"
        />
        <circle cx="156" cy="83" r="4.5" fill="#0088FF" />

        {/* 4 Surrounding Offset Well Pins on Radar */}
        <g fill="#FFFFFF">
          <circle cx="163" cy="54" r="4.5" />
          <path d="M159 55 L163 62 L167 55 Z" />
          <circle cx="131" cy="82" r="4" />
          <path d="M128 83 L131 89 L134 83 Z" />
          <circle cx="182" cy="79" r="4" />
          <path d="M179 80 L182 86 L185 80 Z" />
          <circle cx="184" cy="112" r="4" />
          <path d="M181 113 L184 119 L187 113 Z" />
        </g>

        {/* Subsurface Geological Strata Layers (Bottom Half) */}
        <path d="M35 122 Q78 116 120 126 T205 120 L205 220 L35 220 Z" fill="#F59E0B" />
        <path d="M35 136 Q78 126 120 140 T205 134 L205 220 L35 220 Z" fill="#B45309" />
        <path d="M35 152 Q78 140 120 156 T205 148 L205 220 L35 220 Z" fill="#78350F" />
        <path d="M35 170 Q78 158 120 174 T205 166 L205 220 L35 220 Z" fill="#3B1506" />

        {/* Rig Base Platform Silhouette */}
        <path d="M42 114 L138 114 L138 125 L42 125 Z" fill="#041530" />
        <rect x="58" y="103" width="24" height="12" fill="#062047" />
        <rect
          x="118"
          y="96"
          width="16"
          height="22"
          rx="2"
          fill="#062047"
          stroke="#38BDF8"
          strokeWidth="1.2"
        />

        {/* Glowing Subsurface Wellbore Column */}
        <rect x="119" y="116" width="12" height="98" fill="#F97316" fillOpacity="0.5" />
        <rect x="121.5" y="116" width="7" height="98" fill={`url(#dg-well-glow-${uid})`} />
        <line x1="125" y1="116" x2="125" y2="214" stroke="#FFFFFF" strokeWidth="2.2" />
      </g>

      {/* Towering Drilling Derrick (Rises Above Top of Shield) */}
      <g stroke="#041530" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M101 5 L107 5 L108 19 L100 19 Z"
          fill="#0B3B8C"
          stroke="#38BDF8"
          strokeWidth="1.5"
        />
        <rect
          x="95"
          y="19"
          width="18"
          height="6"
          rx="1.5"
          fill="#041530"
          stroke="#38E4FF"
          strokeWidth="1.2"
        />
        <path d="M98 25 L84 114 L90 114 L101 25 Z" fill="#041530" />
        <path d="M110 25 L124 114 L118 114 L107 25 Z" fill="#041530" />
        <line x1="104" y1="25" x2="104" y2="114" stroke="#041530" strokeWidth="3.5" />
        <line x1="96" y1="38" x2="112" y2="38" strokeWidth="3" />
        <line x1="93" y1="56" x2="115" y2="56" strokeWidth="3.5" />
        <line x1="90" y1="76" x2="118" y2="76" strokeWidth="3.5" />
        <line x1="87" y1="96" x2="121" y2="96" strokeWidth="3.5" />
        <line x1="96" y1="38" x2="115" y2="56" strokeWidth="2.2" />
        <line x1="112" y1="38" x2="93" y2="56" strokeWidth="2.2" />
        <line x1="93" y1="56" x2="118" y2="76" strokeWidth="2.4" />
        <line x1="115" y1="56" x2="90" y2="76" strokeWidth="2.4" />
        <line x1="90" y1="76" x2="121" y2="96" strokeWidth="2.5" />
        <line x1="118" y1="76" x2="87" y2="96" strokeWidth="2.5" />
        <line x1="87" y1="96" x2="120" y2="114" strokeWidth="2.5" />
        <line x1="121" y1="96" x2="88" y2="114" strokeWidth="2.5" />
      </g>

      {/* Sweeping Dynamic Blue Orbital Swoosh */}
      <path
        d="M78 68 C22 98 12 152 54 176 C30 150 38 110 80 82 Z"
        fill={`url(#dg-swoosh-${uid})`}
      />
      <path
        d="M40 120 C52 178 112 214 166 218 C196 196 212 156 214 105 C206 148 184 184 148 206 C104 196 64 164 40 120 Z"
        fill={`url(#dg-shield-rim-${uid})`}
        opacity="0.95"
      />
    </svg>
  );
};

/**
 * Custom Helical Drill-Bit "I" Glyph for the DR[I]LL GUARD Wordmark
 */
const DrillBitLetterI: React.FC<{
  className?: string;
  isLight: boolean;
}> = ({ className = 'w-2.5 h-5', isLight }) => {
  const fluteColor = isLight ? '#061838' : '#F8FAFC';
  return (
    <svg
      viewBox="0 0 24 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} inline-block shrink-0 mx-[1px]`}
      aria-label="I"
    >
      {/* Top Angled Blue Shank */}
      <path d="M3 12 L21 2 L21 17 L3 26 Z" fill="#0099FF" />
      {/* Helical Flute 1 */}
      <path d="M3 30 L21 21 L21 31 L3 40 Z" fill={fluteColor} />
      {/* Helical Flute 2 */}
      <path d="M3 44 L21 35 L21 45 L3 54 Z" fill={fluteColor} />
      {/* Pointed Drill Bit Tip */}
      <path d="M18 50 L21 49 L21 56 L12 63 L3 56 L3 57 Z" fill={fluteColor} />
    </svg>
  );
};

export const DrillGuardLogo: React.FC<DrillGuardLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = true,
  forceTheme,
  className = '',
}) => {
  const { themeMode } = useNWIS();
  const effectiveTheme = forceTheme ?? themeMode;
  const isLight = effectiveTheme === 'light';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-28 h-28 sm:w-32 sm:h-32',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const bitSizes = {
    sm: 'w-2 h-4',
    md: 'w-2.5 h-[19px]',
    lg: 'w-3.5 h-6',
    xl: 'w-4 h-8 sm:w-5 sm:h-9',
  };

  const subtitleSizes = {
    sm: 'text-[7.5px] tracking-[0.14em]',
    md: 'text-[8.5px] tracking-[0.16em]',
    lg: 'text-[10px] tracking-[0.2em]',
    xl: 'text-[11px] sm:text-xs tracking-[0.22em]',
  };

  if (variant === 'icon') {
    return <DrillGuardShieldMark className={`${iconSizes[size]} ${className}`} isLight={isLight} />;
  }

  const drillTextStyle: React.CSSProperties = isLight
    ? {
        color: '#061838',
        textShadow: '0 1px 0 rgba(255,255,255,0.8)',
      }
    : {
        color: '#F8FAFC',
        textShadow: '0 1px 8px rgba(56, 189, 248, 0.22)',
      };

  const guardTextStyle: React.CSSProperties = isLight
    ? {
        backgroundImage: 'linear-gradient(180deg, #1CC4FF 0%, #0066E6 55%, #003A99 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }
    : {
        backgroundImage: 'linear-gradient(180deg, #47E8FF 0%, #0EA5E9 55%, #2563EB 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };

  const subtitleColor = isLight ? '#0B2144' : '#C5D6CC';
  const lineColor = isLight ? '#0B2144' : '#38BDF8';

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
        <DrillGuardShieldMark className={iconSizes[size]} isLight={isLight} />
        <div
          className={`mt-1.5 font-black uppercase tracking-tight leading-none flex items-baseline justify-center ${titleSizes[size]}`}
        >
          <span className="inline-flex items-baseline" style={drillTextStyle}>
            <span>DR</span>
            <DrillBitLetterI className={bitSizes[size]} isLight={isLight} />
            <span>LL</span>
          </span>
          <span className="ml-1.5" style={guardTextStyle}>
            GUARD
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center justify-center gap-2 mt-1 w-full">
            <span
              className="h-[1.5px] w-6 sm:w-10 rounded-full opacity-75"
              style={{ backgroundColor: lineColor }}
            />
            <span
              className={`font-mono font-bold uppercase whitespace-nowrap ${subtitleSizes[size]}`}
              style={{ color: subtitleColor }}
            >
              NEARBY WELLS INTELLIGENCE SYSTEM
            </span>
            <span
              className="h-[1.5px] w-6 sm:w-10 rounded-full opacity-75"
              style={{ backgroundColor: lineColor }}
            />
          </div>
        )}
      </div>
    );
  }

  // Horizontal variant (Navbar, Sidebar, Headers)
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <DrillGuardShieldMark className={iconSizes[size]} isLight={isLight} />
      <div className="flex flex-col justify-center leading-none">
        <div
          className={`font-black uppercase tracking-tight leading-none flex items-baseline ${titleSizes[size]}`}
        >
          <span className="inline-flex items-baseline" style={drillTextStyle}>
            <span>DR</span>
            <DrillBitLetterI className={bitSizes[size]} isLight={isLight} />
            <span>LL</span>
          </span>
          <span className="ml-1" style={guardTextStyle}>
            GUARD
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="h-[1.5px] w-3 rounded-full opacity-75"
              style={{ backgroundColor: lineColor }}
            />
            <span
              className={`font-mono font-bold uppercase whitespace-nowrap ${subtitleSizes[size]}`}
              style={{ color: subtitleColor }}
            >
              NEARBY WELLS INTELLIGENCE SYSTEM
            </span>
            <span
              className="h-[1.5px] w-3 rounded-full opacity-75"
              style={{ backgroundColor: lineColor }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
