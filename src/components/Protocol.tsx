import type { BreathProfile, BreathExercise } from '../types';
import { PROTOCOLS } from '../types';

interface Props {
  profile: BreathProfile;
  onStartExercise: (exercise: BreathExercise) => void;
}

export function Protocol({ profile, onStartExercise }: Props) {
  const exercises = PROTOCOLS[profile.type];

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-12">
      <p className="text-slate-400 text-sm mb-1">Protocol for</p>
      <h2 className="text-2xl font-light text-slate-800 mb-8">{profile.emoji} {profile.label}</h2>

      <div className="space-y-4 max-w-sm w-full">
        {exercises.map((ex, i) => (
          <button
            key={i}
            onClick={() => onStartExercise(ex)}
            className="w-full text-left rounded-2xl p-5 bg-white/70 backdrop-blur border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all active:scale-[0.98]"
          >
            <h3 className="text-slate-800 font-medium mb-1">{ex.name}</h3>
            <p className="text-slate-400 text-sm mb-3">{ex.description}</p>
            <div className="flex gap-3 text-xs text-slate-500">
              <span className="bg-sky-50 px-2 py-1 rounded-lg">In {ex.inhale}s</span>
              {ex.hold > 0 && <span className="bg-violet-50 px-2 py-1 rounded-lg">Hold {ex.hold}s</span>}
              <span className="bg-emerald-50 px-2 py-1 rounded-lg">Out {ex.exhale}s</span>
              {ex.holdAfter > 0 && <span className="bg-amber-50 px-2 py-1 rounded-lg">Hold {ex.holdAfter}s</span>}
              <span className="bg-slate-50 px-2 py-1 rounded-lg">×{ex.rounds}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
