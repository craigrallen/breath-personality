import type { AppState, BreathProfile, Session } from './types';

const KEY = 'breath-personality';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt/missing localStorage entry */ }
  return { profile: null, sessions: [] };
}

function save(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getState(): AppState {
  return load();
}

export function saveProfile(profile: BreathProfile) {
  const state = load();
  state.profile = profile;
  save(state);
}

export function addSession(session: Session) {
  const state = load();
  state.sessions.push(session);
  save(state);
}

export function getSessions(): Session[] {
  return load().sessions;
}

export function getProfile(): BreathProfile | null {
  return load().profile;
}

export function clearAll() {
  localStorage.removeItem(KEY);
}
