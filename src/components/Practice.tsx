import { useState, useEffect, useRef, useCallback } from 'react';
import type { BreathExercise, Session } from '../types';
import { addSession } from '../store';
import { BreathCircle } from './BreathCircle';

interface Props {
  exercise: BreathExercise;
  onDone: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdAfter';

function haptic() {
  if ('vibrate' in navigator) navigator.vibrate(30);
}

export function Practice({ exercise, onDone }: Props) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [phaseTime, setPhasetime] = useState(exercise.inhale);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(0);

  // Countdown
  useEffect(() => {
    if (started) return;
    if (countdown <= 0) {
      setStarted(true);
      startTime.current = Date.now();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, started]);

  // Phase timer
  useEffect(() => {
    if (!started || done) return;
    const t = setTimeout(() => {
      haptic();
      advancePhase();
    }, phaseTime * 1000);
    return () => clearTimeout(t);
  }, [phase, round, started, done]);

  // Elapsed timer
  useEffect(() => {
    if (!started || done) return;
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 200);
    return () => clearInterval(i);
  }, [started, done]);

  const advancePhase = useCallback(() => {
    const phases = ([
      { p: 'inhale' as Phase, d: exercise.inhale },
      { p: 'hold' as Phase, d: exercise.hold },
      { p: 'exhale' as Phase, d: exercise.exhale },
      { p: 'holdAfter' as Phase, d: exercise.holdAfter },
    ] satisfies { p: Phase; d: number }[]).filter(x => x.d > 0);

    const currentIdx = phases.findIndex(x => x.p === phase);
    const nextIdx = currentIdx + 1;

    if (nextIdx < phases.length) {
      setPhase(phases[nextIdx].p);
      setPhasetime(phases[nextIdx].d);
    } else {
      // Next round
      const nextRound = round + 1;
      if (nextRound >= exercise.rounds) {
        finishSession(true);
      } else {
        setRound(nextRound);
        setPhase(phases[0].p);
        setPhasetime(phases[0].d);
      }
    }
  }, [phase, round, exercise]);

  const finishSession = (completed: boolean) => {
    setDone(true);
    const session: Session = {
      id: Date.now().toString(),
      date: Date.now(),
      exercise: exercise.name,
      durationSec: Math.floor((Date.now() - startTime.current) / 1000),
      completed,
    };
    addSession(session);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-slate-400 text-sm mb-4">{exercise.name}</p>
        <span className="text-7xl font-light text-sky-400">{countdown}</span>
        <p className="text-slate-400 text-sm mt-4">Get ready…</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <span className="text-5xl mb-4">✨</span>
        <h2 className="text-2xl font-light text-slate-800 mb-2">Session Complete</h2>
        <p className="text-slate-400 mb-2">{exercise.name} — {formatTime(elapsed)}</p>
        <p className="text-slate-400 text-sm mb-8">{exercise.rounds} rounds completed</p>
        <button
          onClick={onDone}
          className="px-8 py-4 rounded-2xl bg-sky-400 text-white font-medium shadow-lg shadow-sky-200 hover:bg-sky-500 transition-all active:scale-95"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="text-slate-400 text-sm mb-1">{exercise.name}</p>
      <p className="text-slate-300 text-xs mb-8">Round {round + 1} of {exercise.rounds} · {formatTime(elapsed)}</p>

      <BreathCircle phase={phase} duration={phaseTime} color="#38bdf8" />

      <p className="text-slate-500 text-lg mt-8 font-light">
        {phase === 'inhale' ? `Breathe in · ${phaseTime}s` :
         phase === 'exhale' ? `Breathe out · ${phaseTime}s` :
         `Hold · ${phaseTime}s`}
      </p>

      <button
        onClick={() => finishSession(false)}
        className="mt-12 px-6 py-3 rounded-xl text-slate-400 border border-slate-200 hover:border-slate-300 transition-all text-sm"
      >
        End session
      </button>
    </div>
  );
}
