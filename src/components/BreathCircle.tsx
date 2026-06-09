
interface Props {
  phase: 'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'idle';
  duration: number; // seconds for current phase
  color?: string;
  size?: number;
  amplitude?: number; // 0-1 for live mic visualization
}

export function BreathCircle({ phase, duration, color = '#38bdf8', size = 240, amplitude }: Props) {
  // hold always follows inhale (scale 1); holdAfter always follows exhale (scale 0.55)
  const scale = amplitude !== undefined
    ? 0.5 + amplitude * 3
    : (phase === 'inhale' || phase === 'hold') ? 1
    : (phase === 'exhale' || phase === 'holdAfter') ? 0.55
    : 0.7; // idle

  const label = amplitude !== undefined
    ? 'Breathe naturally'
    : phase === 'inhale' ? 'Breathe in'
    : phase === 'exhale' ? 'Breathe out'
    : phase === 'hold' ? 'Hold'
    : phase === 'holdAfter' ? 'Hold'
    : '';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color}15 0%, ${color}05 70%, transparent 100%)`,
          animation: 'pulse-ring 4s ease-in-out infinite',
        }}
      />
      {/* Main circle */}
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: size * 0.75,
          height: size * 0.75,
          background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}20)`,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${color}30`,
          transform: `scale(${scale})`,
          transition: amplitude !== undefined
            ? 'transform 0.1s ease-out'
            : `transform ${duration}s ease-in-out`,
          boxShadow: `0 0 ${40 * scale}px ${color}20, inset 0 0 ${20 * scale}px ${color}10`,
        }}
      >
        <span className="text-lg font-light text-slate-600 select-none">{label}</span>
      </div>
    </div>
  );
}
