import { useState } from 'react';
import type { BreathProfile, BreathExercise } from './types';
import { getProfile } from './store';
import { Assessment } from './components/Assessment';
import { ProfileCard } from './components/ProfileCard';
import { Protocol } from './components/Protocol';
import { Practice } from './components/Practice';
import { Progress } from './components/Progress';

type Screen = 'home' | 'assess' | 'profile' | 'protocol' | 'practice' | 'progress';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<BreathProfile | null>(() => getProfile());
  const [exercise, setExercise] = useState<BreathExercise | null>(null);

  if (screen === 'assess') {
    return (
      <Assessment
        onComplete={(p) => {
          setProfile(p);
          setScreen('profile');
        }}
      />
    );
  }

  if (screen === 'profile' && profile) {
    return <ProfileCard profile={profile} onContinue={() => setScreen('protocol')} />;
  }

  if (screen === 'protocol' && profile) {
    return (
      <Protocol
        profile={profile}
        onStartExercise={(ex) => {
          setExercise(ex);
          setScreen('practice');
        }}
      />
    );
  }

  if (screen === 'practice' && exercise) {
    return <Practice exercise={exercise} onDone={() => setScreen('protocol')} />;
  }

  if (screen === 'progress') {
    return <Progress onBack={() => setScreen('home')} />;
  }

  // Home
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-light text-slate-800 mb-2">Breath</h1>
        <h1 className="text-4xl font-light text-sky-400">Personality</h1>
        <p className="text-slate-400 text-sm mt-3">Discover how you breathe. Transform how you feel.</p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={() => setScreen('assess')}
          className="w-full px-8 py-4 rounded-2xl bg-sky-400 text-white font-medium text-lg shadow-lg shadow-sky-200 hover:bg-sky-500 transition-all active:scale-95"
        >
          {profile ? 'Retake Assessment' : 'Take Assessment'}
        </button>

        {profile && (
          <>
            <button
              onClick={() => setScreen('profile')}
              className="w-full px-8 py-3 rounded-2xl bg-white/70 text-slate-700 border border-slate-200 hover:border-sky-300 transition-all active:scale-95"
            >
              {profile.emoji} My Profile
            </button>
            <button
              onClick={() => setScreen('protocol')}
              className="w-full px-8 py-3 rounded-2xl bg-white/70 text-slate-700 border border-slate-200 hover:border-sky-300 transition-all active:scale-95"
            >
              🫁 Practice
            </button>
          </>
        )}

        <button
          onClick={() => setScreen('progress')}
          className="w-full px-8 py-3 rounded-2xl bg-white/70 text-slate-700 border border-slate-200 hover:border-sky-300 transition-all active:scale-95"
        >
          📊 Progress
        </button>
      </div>
    </div>
  );
}

export default App;
