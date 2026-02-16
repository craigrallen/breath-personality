import type { BreathProfile } from '../types';

interface Props {
  profile: BreathProfile;
  onContinue: () => void;
}

export function ProfileCard({ profile, onContinue }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="text-slate-400 text-sm mb-6">Your breath personality</p>
      
      <div
        className="rounded-3xl p-8 max-w-sm w-full text-center shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${profile.color}10, ${profile.color}05)`,
          border: `1px solid ${profile.color}20`,
        }}
      >
        <span className="text-5xl mb-4 block">{profile.emoji}</span>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">{profile.label}</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{profile.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-left">
          <Stat label="Breath rate" value={`${profile.metrics.breathRate.toFixed(0)} /min`} />
          <Stat label="I:E ratio" value={profile.metrics.inhaleExhaleRatio.toFixed(2)} />
          <Stat label="Regularity" value={`${(profile.metrics.regularity * 100).toFixed(0)}%`} />
          <Stat label="Pauses" value={`${profile.metrics.pauseFrequency.toFixed(1)} /min`} />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-8 px-8 py-4 rounded-2xl bg-sky-400 text-white font-medium shadow-lg shadow-sky-200 hover:bg-sky-500 transition-all active:scale-95"
      >
        See Your Protocol
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 rounded-xl px-3 py-2">
      <p className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-slate-700 font-medium">{value}</p>
    </div>
  );
}
