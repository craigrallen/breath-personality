import { useState, useEffect, useRef, useCallback } from 'react';
import { BreathAnalyzer, classifyProfile } from '../audio';
import type { BreathProfile } from '../types';
import { PROFILE_DATA } from '../types';
import { saveProfile } from '../store';
import { BreathCircle } from './BreathCircle';

interface Props {
  onComplete: (profile: BreathProfile) => void;
}

export function Assessment({ onComplete }: Props) {
  const [stage, setStage] = useState<'intro' | 'recording' | 'analyzing'>('intro');
  const [timeLeft, setTimeLeft] = useState(180);
  const [amplitude, setAmplitude] = useState(0);
  const analyzerRef = useRef<BreathAnalyzer | null>(null);
  const rafRef = useRef(0);

  const updateAmplitude = useCallback(() => {
    if (analyzerRef.current) {
      setAmplitude(analyzerRef.current.getAmplitude());
      rafRef.current = requestAnimationFrame(updateAmplitude);
    }
  }, []);

  const startRecording = async () => {
    const analyzer = new BreathAnalyzer();
    analyzerRef.current = analyzer;
    try {
      await analyzer.start();
      setStage('recording');
      updateAmplitude();
    } catch {
      alert('Microphone access is required for the breath assessment.');
    }
  };

  useEffect(() => {
    if (stage !== 'recording') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          finishRecording();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  const finishRecording = () => {
    cancelAnimationFrame(rafRef.current);
    if (!analyzerRef.current) return;
    setStage('analyzing');
    const metrics = analyzerRef.current.stop();
    const profileType = classifyProfile(metrics);
    const data = PROFILE_DATA[profileType];
    const profile: BreathProfile = { ...data, metrics, timestamp: Date.now() };
    saveProfile(profile);
    setTimeout(() => onComplete(profile), 1500);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-3xl font-light text-slate-800 mb-3">Breath Assessment</h1>
        <p className="text-slate-500 max-w-sm mb-2">
          We'll listen to your natural breathing for 3 minutes to understand your breath personality.
        </p>
        <p className="text-slate-400 text-sm max-w-sm mb-10">
          Find a quiet spot, sit comfortably, and breathe normally. Don't try to control it.
        </p>
        <button
          onClick={startRecording}
          className="px-8 py-4 rounded-2xl bg-sky-400 text-white font-medium text-lg shadow-lg shadow-sky-200 hover:bg-sky-500 transition-all active:scale-95"
        >
          Begin Assessment
        </button>
      </div>
    );
  }

  if (stage === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-400 rounded-full animate-spin mb-6" />
        <p className="text-slate-500 text-lg">Analyzing your breath pattern…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="text-slate-400 text-sm mb-2">Listening to your breath</p>
      <p className="text-4xl font-light text-slate-700 mb-8 tabular-nums">{formatTime(timeLeft)}</p>
      
      <BreathCircle phase="idle" duration={0} amplitude={amplitude} />
      
      <p className="text-slate-400 text-sm mt-8">Just breathe naturally</p>
      
      <button
        onClick={finishRecording}
        className="mt-12 px-6 py-3 rounded-xl text-slate-400 border border-slate-200 hover:border-slate-300 transition-all text-sm"
      >
        Finish early
      </button>
    </div>
  );
}
