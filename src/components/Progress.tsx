import { getSessions } from '../store';
import type { Session } from '../types';

interface Props {
  onBack: () => void;
}

export function Progress({ onBack }: Props) {
  const sessions = getSessions();
  const totalSessions = sessions.length;
  const totalMinutes = Math.round(sessions.reduce((a, s) => a + s.durationSec, 0) / 60);
  const completed = sessions.filter(s => s.completed).length;
  const streak = calcStreak(sessions);

  // Group by day
  const byDay = new Map<string, Session[]>();
  sessions.forEach(s => {
    const key = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(s);
  });

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-12">
      <h2 className="text-2xl font-light text-slate-800 mb-8">Progress</h2>

      <div className="grid grid-cols-2 gap-3 max-w-sm w-full mb-8">
        <StatCard label="Sessions" value={totalSessions.toString()} />
        <StatCard label="Minutes" value={totalMinutes.toString()} />
        <StatCard label="Completed" value={`${completed}/${totalSessions}`} />
        <StatCard label="Day streak" value={streak.toString()} />
      </div>

      {sessions.length === 0 ? (
        <p className="text-slate-400 text-sm">No sessions yet. Start practicing!</p>
      ) : (
        <div className="max-w-sm w-full space-y-3">
          {Array.from(byDay.entries()).reverse().map(([day, daySessions]) => (
            <div key={day}>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{day}</p>
              {daySessions.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3 mb-2">
                  <div>
                    <p className="text-slate-700 text-sm font-medium">{s.exercise}</p>
                    <p className="text-slate-400 text-xs">{Math.floor(s.durationSec / 60)}m {s.durationSec % 60}s</p>
                  </div>
                  <span className="text-sm">{s.completed ? '✅' : '⏹'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-8 px-6 py-3 rounded-xl text-slate-400 border border-slate-200 hover:border-slate-300 transition-all text-sm"
      >
        Back
      </button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 backdrop-blur rounded-2xl p-4 text-center border border-slate-100">
      <p className="text-2xl font-light text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function calcStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map(s => new Date(s.date).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
