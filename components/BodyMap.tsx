import React from 'react';

interface BodyMapProps {
  onSelectMuscle: (muscle: string) => void;
  selectedMuscle: string | null;
}

const BodyMap: React.FC<BodyMapProps> = ({ onSelectMuscle, selectedMuscle }) => {
  const getFill = (muscle: string) => selectedMuscle === muscle ? '#10b981' : 'transparent';
  const getStroke = (muscle: string) => selectedMuscle === muscle ? '#10b981' : '#334155';

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-darker border border-gray-800 rounded-xl p-4 overflow-hidden group">
      {/* Grid Background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-[repeat(20,minmax(0,1fr))] opacity-10 pointer-events-none">
        {Array.from({ length: 400 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-primary/20"></div>
        ))}
      </div>
      
      {/* Decorative Tech Circles */}
      <div className="absolute top-4 left-4 w-12 h-12 border border-dashed border-gray-700 rounded-full animate-spin-slow opacity-30"></div>
      <div className="absolute bottom-4 right-4 w-20 h-20 border-2 border-primary/10 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 border border-primary/20 rounded-full"></div>
      </div>

      <svg viewBox="0 0 300 600" className="h-full w-auto z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.1)]">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* --- HEAD --- */}
        <path 
            d="M130 50 Q150 30 170 50 Q180 70 170 90 Q150 100 130 90 Q120 70 130 50" 
            fill="#1e293b" stroke={getStroke('Head')} strokeWidth="2"
        />

        {/* --- TRAPS (Neck/Shoulder connector) --- */}
        <path 
            d="M130 90 L110 110 L190 110 L170 90 Z" 
            fill={getFill('Traps')} stroke={getStroke('Traps')} strokeWidth="2"
            onClick={() => onSelectMuscle('Traps')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />

        {/* --- SHOULDERS (Deltoids) --- */}
        <path 
            d="M110 110 L80 120 L80 160 L110 150 Z" 
            fill={getFill('Shoulders')} stroke={getStroke('Shoulders')} strokeWidth="2"
            onClick={() => onSelectMuscle('Shoulders')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />
        <path 
            d="M190 110 L220 120 L220 160 L190 150 Z" 
            fill={getFill('Shoulders')} stroke={getStroke('Shoulders')} strokeWidth="2"
            onClick={() => onSelectMuscle('Shoulders')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />

        {/* --- CHEST (Pecs) --- */}
        <path 
            d="M110 110 L150 115 L190 110 L190 150 L150 160 L110 150 Z" 
            fill={getFill('Chest')} stroke={getStroke('Chest')} strokeWidth="2"
            onClick={() => onSelectMuscle('Chest')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />
        {/* Mid-line for pecs */}
        <path d="M150 115 L150 160" stroke={getStroke('Chest')} strokeWidth="1" opacity="0.5" />

        {/* --- ARMS (Biceps/Triceps) --- */}
        <path 
            d="M80 160 L70 220 L100 220 L110 150 Z" 
            fill={getFill('Biceps')} stroke={getStroke('Biceps')} strokeWidth="2"
            onClick={() => onSelectMuscle('Biceps')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />
         <path 
            d="M220 160 L230 220 L200 220 L190 150 Z" 
            fill={getFill('Biceps')} stroke={getStroke('Biceps')} strokeWidth="2"
            onClick={() => onSelectMuscle('Biceps')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />

        {/* --- FOREARMS --- */}
        <path 
            d="M70 220 L60 280 L90 280 L100 220 Z" 
            fill={getFill('Forearms')} stroke={getStroke('Forearms')} strokeWidth="2"
            onClick={() => onSelectMuscle('Forearms')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />
        <path 
            d="M230 220 L240 280 L210 280 L200 220 Z" 
            fill={getFill('Forearms')} stroke={getStroke('Forearms')} strokeWidth="2"
            onClick={() => onSelectMuscle('Forearms')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />

        {/* --- ABS (Abdominals) --- */}
        <path 
            d="M115 155 L185 155 L180 230 L120 230 Z" 
            fill={getFill('Abs')} stroke={getStroke('Abs')} strokeWidth="2"
            onClick={() => onSelectMuscle('Abs')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />
        {/* Six pack lines */}
        <path d="M118 180 L182 180" stroke={getStroke('Abs')} strokeWidth="1" opacity="0.5" />
        <path d="M120 205 L180 205" stroke={getStroke('Abs')} strokeWidth="1" opacity="0.5" />
        <path d="M150 155 L150 230" stroke={getStroke('Abs')} strokeWidth="1" opacity="0.5" />

        {/* --- HIPS / OBLIQUES --- */}
         <path 
            d="M120 230 L180 230 L190 260 L110 260 Z" 
            fill={getFill('Core')} stroke={getStroke('Core')} strokeWidth="2"
            onClick={() => onSelectMuscle('Core')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />

        {/* --- QUADS (Legs Upper) --- */}
        <path 
            d="M110 260 L145 270 L140 400 L100 390 L90 300 Z" 
            fill={getFill('Quads')} stroke={getStroke('Quads')} strokeWidth="2"
            onClick={() => onSelectMuscle('Quads')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />
        <path 
            d="M190 260 L155 270 L160 400 L200 390 L210 300 Z" 
            fill={getFill('Quads')} stroke={getStroke('Quads')} strokeWidth="2"
            onClick={() => onSelectMuscle('Quads')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />

        {/* --- KNEES --- */}
        <circle cx="120" cy="410" r="10" stroke={getStroke('Legs')} fill="transparent" opacity="0.5"/>
        <circle cx="180" cy="410" r="10" stroke={getStroke('Legs')} fill="transparent" opacity="0.5"/>

        {/* --- CALVES (Legs Lower) --- */}
        <path 
            d="M100 420 L140 420 L135 520 L105 520 Z" 
            fill={getFill('Calves')} stroke={getStroke('Calves')} strokeWidth="2"
            onClick={() => onSelectMuscle('Calves')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />
         <path 
            d="M200 420 L160 420 L165 520 L195 520 Z" 
            fill={getFill('Calves')} stroke={getStroke('Calves')} strokeWidth="2"
            onClick={() => onSelectMuscle('Calves')}
            className="cursor-pointer hover:stroke-emerald-400 transition-all"
        />

      </svg>
      
      <div className="absolute bottom-2 right-2 text-xs text-primary/70 font-mono tracking-widest">
        BIO_SCAN.active
      </div>
      <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-mono">
        {selectedMuscle ? `TARGET: ${selectedMuscle.toUpperCase()}` : 'STATUS: IDLE'}
      </div>
    </div>
  );
};

export default BodyMap;