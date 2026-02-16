export type BreathProfileType =
  | 'shallow-racer'
  | 'breath-holder'
  | 'reverse-breather'
  | 'chest-gripper'
  | 'natural-breather';

export interface BreathMetrics {
  breathRate: number; // breaths per minute
  inhaleExhaleRatio: number; // inhale / exhale duration
  pauseFrequency: number; // pauses per minute (>1.5s gaps)
  regularity: number; // 0-1, how consistent timing is
  avgAmplitude: number;
}

export interface BreathProfile {
  type: BreathProfileType;
  label: string;
  description: string;
  emoji: string;
  color: string;
  metrics: BreathMetrics;
  timestamp: number;
}

export interface BreathExercise {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  rounds: number;
}

export interface Session {
  id: string;
  date: number;
  exercise: string;
  durationSec: number;
  completed: boolean;
}

export interface AppState {
  profile: BreathProfile | null;
  sessions: Session[];
}

export const PROFILE_DATA: Record<BreathProfileType, Omit<BreathProfile, 'metrics' | 'timestamp'>> = {
  'shallow-racer': {
    type: 'shallow-racer',
    label: 'Shallow Racer',
    description: 'Your breath moves fast and stays near the surface. You tend to breathe rapidly with small volume — often linked to stress or anxiety. Your nervous system is stuck in "go" mode.',
    emoji: '⚡',
    color: '#f59e0b',
  },
  'breath-holder': {
    type: 'breath-holder',
    label: 'Breath Holder',
    description: 'You unconsciously hold your breath in irregular patterns. This creates tension buildup and sudden gasps. Common in people who concentrate intensely or carry unprocessed stress.',
    emoji: '⏸️',
    color: '#8b5cf6',
  },
  'reverse-breather': {
    type: 'reverse-breather',
    label: 'Reverse Breather',
    description: 'Your exhales are shorter than your inhales — the opposite of what calms the nervous system. You\'re taking in more than you\'re letting go, literally and figuratively.',
    emoji: '🔄',
    color: '#ef4444',
  },
  'chest-gripper': {
    type: 'chest-gripper',
    label: 'Chest Gripper',
    description: 'Your breath is tense and controlled, driven by chest muscles rather than the diaphragm. High amplitude with rigidity suggests you\'re armoring against something.',
    emoji: '💪',
    color: '#ec4899',
  },
  'natural-breather': {
    type: 'natural-breather',
    label: 'Natural Breather',
    description: 'Your breathing is balanced, rhythmic, and effortless. Longer exhales, steady pace, good regularity. Your nervous system is well-regulated. Keep nurturing this.',
    emoji: '🌿',
    color: '#10b981',
  },
};

export const PROTOCOLS: Record<BreathProfileType, BreathExercise[]> = {
  'shallow-racer': [
    { name: 'Extended Exhale', description: 'Slow down by lengthening your exhale', inhale: 3, hold: 0, exhale: 6, holdAfter: 0, rounds: 8 },
    { name: '4-7-8 Calming', description: 'The classic anxiety reset', inhale: 4, hold: 7, exhale: 8, holdAfter: 0, rounds: 4 },
  ],
  'breath-holder': [
    { name: 'Rhythmic Flow', description: 'Build a steady breathing rhythm', inhale: 4, hold: 0, exhale: 4, holdAfter: 0, rounds: 10 },
    { name: 'Box Breathing', description: 'Equal parts create predictability', inhale: 4, hold: 4, exhale: 4, holdAfter: 4, rounds: 6 },
  ],
  'reverse-breather': [
    { name: '2:1 Exhale Training', description: 'Retrain your exhale to be longer', inhale: 3, hold: 0, exhale: 6, holdAfter: 2, rounds: 8 },
    { name: 'Sighing Breath', description: 'Deep inhale, long audible exhale', inhale: 4, hold: 0, exhale: 8, holdAfter: 0, rounds: 6 },
  ],
  'chest-gripper': [
    { name: 'Belly Breathing', description: 'Reconnect with diaphragmatic movement', inhale: 5, hold: 0, exhale: 5, holdAfter: 0, rounds: 8 },
    { name: 'Progressive Relaxation', description: 'Breathe into tension, release on exhale', inhale: 4, hold: 2, exhale: 6, holdAfter: 0, rounds: 6 },
  ],
  'natural-breather': [
    { name: 'Coherent Breathing', description: 'Optimize your already-good baseline', inhale: 5, hold: 0, exhale: 5, holdAfter: 0, rounds: 10 },
    { name: 'Wim Hof Light', description: 'Energizing breath for the advanced', inhale: 2, hold: 0, exhale: 2, holdAfter: 0, rounds: 30 },
  ],
};
