import React, { useState } from 'react';

export default function IndoreMapCanvas({
  selectedHub = 'citadel',
  onSelectHub,
  showHeatmap = false,
  allocationAnimation = false
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [radarActive, setRadarActive] = useState(true);

  // Active route coordinates based on selection
  const routePaths = {
    citadel: 'M 320 410 Q 420 370 480 320 T 670 210',
    brilliant: 'M 320 410 Q 380 340 410 310 T 430 285',
    dukan: 'M 320 410 Q 290 440 270 460 T 260 480',
    holkar: 'M 320 410 Q 340 420 360 410 T 370 412'
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-surface-container-lowest overflow-hidden select-none flex items-center justify-center">
      
      {/* SVG Vector Radar Basemap */}
      <div
        className="w-full h-full transition-transform duration-500 origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1000 750"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="routeGlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#44e2b1" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f6c162" stopOpacity="1" />
            </linearGradient>

            <radialGradient id="centerSweepRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#44e2b1" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#44e2b1" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#121416" stopOpacity="0" />
            </radialGradient>

            {/* Demand Heatmap Gradients for Judge Demo */}
            <radialGradient id="heatStadium" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff5252" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#ffb142" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#121416" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatBCC" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff793f" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#ffb142" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#121416" stopOpacity="0" />
            </radialGradient>

            <pattern id="gridFine" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#282a2c" strokeWidth="0.7" strokeOpacity="0.6" />
            </pattern>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Base Background & Grid */}
          <rect width="1000" height="750" fill="#0c0e10" />
          <rect width="1000" height="750" fill="url(#gridFine)" />

          {/* Secondary Arterials */}
          <g fill="none" stroke="#1e2022" strokeWidth="2.5">
            <path d="M 80 680 Q 300 640 500 560 T 920 450" />
            <path d="M 120 180 L 380 320 L 520 420" strokeDasharray="3 3" />
            <path d="M 520 300 L 720 220 L 890 280" />
            <path d="M 280 620 L 360 480 L 440 280" />
            <path d="M 640 120 L 680 360 L 760 620" />
          </g>

          {/* Major Expressways & National Arterials */}
          <g fill="none" stroke="#333537" strokeLinecap="round">
            {/* AB Road */}
            <path d="M 460 40 L 410 240 L 330 460 L 260 710" strokeWidth="5" />
            {/* MR-10 Transversal Highway */}
            <path d="M 120 280 Q 450 250 880 200" stroke="#43474c" strokeWidth="6" />
            {/* Indore Bypass Outer Expressway */}
            <path d="M 720 60 Q 740 210 680 430 T 580 730" stroke="#43474c" strokeWidth="6" />
            {/* Palasia Cross Roads */}
            <path d="M 240 450 L 540 430" strokeWidth="4" />
          </g>

          {/* Road Labels */}
          <g fill="#9b8f7d" fontSize="9" fontFamily="Manrope, sans-serif" letterSpacing="2" opacity="0.8">
            <text x="690" y="160" transform="rotate(78 690 160)">INDORE BYPASS EXPRESSWAY</text>
            <text x="360" y="240" transform="rotate(-6 360 240)">MR-10 METRO CORRIDOR</text>
            <text x="355" y="490" transform="rotate(-70 355 490)">A.B. ROAD ARTERIAL</text>
            <text x="210" y="470">PALASIA RING</text>
            <text x="760" y="280">VIJAY NAGAR SEC-78</text>
            <text x="140" y="140">SUPER CORRIDOR AIRPORT LINK</text>
          </g>

          {/* Live Demand Heatmap Layer (Overlayed when toggled) */}
          {showHeatmap && (
            <g className="transition-opacity duration-700">
              {/* Stadium High Surge Heat Blob */}
              <circle cx="370" cy="412" r="140" fill="url(#heatStadium)" />
              {/* Brilliant Convention Centre Heat Blob */}
              <circle cx="430" cy="285" r="120" fill="url(#heatBCC)" />
              {/* Chappan Heat Blob */}
              <circle cx="260" cy="480" r="90" fill="url(#heatStadium)" opacity="0.6" />
            </g>
          )}

          {/* Allocation in action animation rays */}
          {allocationAnimation && (
            <g stroke="#f6c162" strokeWidth="2" strokeDasharray="6 4" className="animate-pulse">
              <line x1="370" y1="412" x2="670" y2="210" />
              <line x1="370" y1="412" x2="430" y2="285" />
              <line x1="370" y1="412" x2="260" y2="480" />
              <line x1="370" y1="412" x2="480" y2="350" />
              <line x1="370" y1="412" x2="310" y2="440" />
            </g>
          )}

          {/* Concentric Radar Rings Centered at User GPS (320, 410) */}
          <g>
            <circle cx="320" cy="410" r="100" fill="none" stroke="#44e2b1" strokeWidth="1" strokeDasharray="2 6" strokeOpacity="0.3" />
            <circle cx="320" cy="410" r="190" fill="none" stroke="#4f4537" strokeWidth="1" strokeOpacity="0.35" />
            <circle cx="320" cy="410" r="300" fill="none" stroke="#4f4537" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.2" />
            <circle cx="320" cy="410" r="420" fill="none" stroke="#4f4537" strokeWidth="0.8" strokeOpacity="0.15" />

            <line x1="20" y1="410" x2="620" y2="410" stroke="#44e2b1" strokeWidth="0.8" strokeDasharray="2 4" strokeOpacity="0.25" />
            <line x1="320" y1="100" x2="320" y2="720" stroke="#44e2b1" strokeWidth="0.8" strokeDasharray="2 4" strokeOpacity="0.25" />

            {/* Animated Radar Sweep Fan */}
            {radarActive && (
              <path
                d="M 320 410 L 590 280 A 320 320 0 0 0 320 90 Z"
                fill="url(#centerSweepRadial)"
                className="animate-radar-sweep"
                style={{ transformOrigin: '320px 410px' }}
              />
            )}
          </g>

          {/* Active Flowing Route to Selected Hub */}
          <path
            d={routePaths[selectedHub] || routePaths.citadel}
            fill="none"
            stroke="url(#routeGlowGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            filter="url(#neonGlow)"
            className="route-flow"
          />
        </svg>

        {/* INTERACTIVE PIN 1: Phoenix Citadel */}
        <div
          onClick={() => onSelectHub && onSelectHub('citadel')}
          className="absolute left-[67%] top-[28%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-transform group-hover:scale-110 shadow-xl ${
            selectedHub === 'citadel' ? 'bg-surface-container-low border-2 border-primary shadow-[0_0_24px_rgba(246,193,98,0.45)]' : 'bg-surface-container-lowest/90 border border-outline-variant/60'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-headline-sm text-xs font-bold text-on-surface">Phoenix Citadel</span>
            <span className="font-data-mono text-xs text-primary font-bold">45 Free</span>
            <span className="text-on-surface-variant font-data-mono text-xs">· ₹50</span>
          </div>
          <div className="w-7 h-7 -mt-1 rounded-full flex items-center justify-center font-bold text-xs bg-primary text-on-primary ring-4 ring-primary/20 shadow-[0_0_15px_#f6c162]">
            <span className="material-symbols-outlined text-[17px]">local_parking</span>
          </div>
        </div>

        {/* INTERACTIVE PIN 2: Brilliant Convention Centre */}
        <div
          onClick={() => onSelectHub && onSelectHub('brilliant')}
          className="absolute left-[43%] top-[38%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
        >
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md transition-transform group-hover:scale-110 shadow-lg ${
            selectedHub === 'brilliant' ? 'bg-surface-container-low border-2 border-tertiary shadow-[0_0_24px_rgba(68,226,177,0.45)]' : 'bg-surface-container-lowest/90 border border-outline-variant/60'
          }`}>
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="font-label-md text-xs font-semibold text-on-surface">Brilliant CC</span>
            <span className="font-data-mono text-xs text-tertiary font-bold">28 Free</span>
            <span className="text-on-surface-variant font-data-mono text-xs">· ₹40</span>
          </div>
          <div className="w-6 h-6 -mt-1 rounded-full bg-surface-container-high border border-tertiary/70 text-tertiary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[14px]">local_parking</span>
          </div>
        </div>

        {/* INTERACTIVE PIN 3: 56 Dukan */}
        <div
          onClick={() => onSelectHub && onSelectHub('dukan')}
          className="absolute left-[26%] top-[64%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
        >
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md transition-transform group-hover:scale-110 shadow-lg ${
            selectedHub === 'dukan' ? 'bg-surface-container-low border-2 border-primary' : 'bg-surface-container-lowest/90 border border-outline-variant/60'
          }`}>
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="font-label-md text-xs font-semibold text-on-surface">56 Dukan</span>
            <span className="font-data-mono text-xs text-primary font-bold">12 Free</span>
            <span className="text-on-surface-variant font-data-mono text-xs">· ₹35</span>
          </div>
          <div className="w-6 h-6 -mt-1 rounded-full bg-surface-container-high border border-primary/70 text-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[14px]">local_parking</span>
          </div>
        </div>

        {/* INTERACTIVE PIN 4: Holkar Stadium */}
        <div
          onClick={() => onSelectHub && onSelectHub('holkar')}
          className="absolute left-[37%] top-[55%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
        >
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md transition-transform group-hover:scale-110 shadow-lg ${
            selectedHub === 'holkar' ? 'bg-surface-container-low border-2 border-error shadow-[0_0_24px_rgba(255,100,100,0.45)]' : 'bg-surface-container-lowest/90 border border-outline-variant/60'
          }`}>
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span className="font-label-md text-xs font-semibold text-on-surface">Holkar Arena</span>
            <span className="font-data-mono text-xs text-error font-bold">60 Free</span>
            <span className="text-on-surface-variant font-data-mono text-xs">· ₹80</span>
          </div>
          <div className="w-6 h-6 -mt-1 rounded-full bg-surface-container-high border border-error/70 text-error flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[14px]">stadium</span>
          </div>
        </div>

        {/* User GPS Location Marker */}
        <div className="absolute left-[32%] top-[54%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none">
          <div className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/95 border border-tertiary text-tertiary font-data-mono text-[10px] tracking-wider uppercase font-bold mb-1 shadow-[0_0_12px_rgba(68,226,177,0.4)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
            YOUR VEHICLE (MP-09)
          </div>
          <div className="relative flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-tertiary shadow-[0_0_16px_#44e2b1] ring-2 ring-surface"></span>
            <span className="absolute w-8 h-8 rounded-full border border-tertiary/60 animate-ping"></span>
          </div>
        </div>
      </div>

      {/* Floating HUD Status */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-space-sm px-3 py-1.5 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 backdrop-blur-md shadow-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
          <span className="font-data-mono text-on-surface uppercase font-bold">RADAR: ACTIVE</span>
        </div>
        <span className="text-outline-variant">|</span>
        <span className="font-data-mono text-primary">SPEED: 24 km/h</span>
        <span className="text-outline-variant">|</span>
        <span className="font-data-mono text-on-surface-variant">22.7196° N, 75.8577° E</span>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
          className="w-9 h-9 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 backdrop-blur-md hover:bg-surface-container text-on-surface flex items-center justify-center shadow-xl transition-all"
          title="Zoom in"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
          className="w-9 h-9 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 backdrop-blur-md hover:bg-surface-container text-on-surface flex items-center justify-center shadow-xl transition-all"
          title="Zoom out"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <button
          type="button"
          onClick={() => setRadarActive(!radarActive)}
          className={`w-9 h-9 rounded-xl border border-outline-variant/40 backdrop-blur-md flex items-center justify-center shadow-xl transition-all ${
            radarActive ? 'bg-primary/20 text-primary' : 'bg-surface-container-lowest/90 text-on-surface-variant'
          }`}
          title="Toggle Radar Sweep"
        >
          <span className="material-symbols-outlined text-[18px]">radar</span>
        </button>
      </div>

    </div>
  );
}
