import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Star, RotateCcw, Sparkles, User } from 'lucide-react';
import { useLeaderboardStore, type GameId } from '../stores/leaderboardStore';
import { useAdStore } from '../stores/adStore';

interface LeaderboardProps {
  game: GameId;
  unit: string;
  formatScore?: (score: number) => string;
  className?: string;
}

interface SubmitScoreProps {
  game: GameId;
  score: number;
  unit: string;
  formatScore?: (score: number) => string;
  onDone: () => void;
}

const RANK_STYLES = [
  { icon: Crown,  color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  { icon: Medal,  color: 'text-slate-300',  bg: 'bg-slate-300/10  border-slate-300/25'  },
  { icon: Medal,  color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/25' },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ game, unit, formatScore, className = '' }) => {
  const { getTopEntries, clearBoard, boards, playerName, getPersonalBest } = useLeaderboardStore();
  const isAdmin = useAdStore(s => s.isAdmin);
  const entries = getTopEntries(game, 75);
  const lowerIsBetter = boards[game]?.lowerIsBetter ?? false;
  const fmt = formatScore ?? ((s: number) => `${s}${unit}`);
  const myPB = playerName ? getPersonalBest(game, playerName) : null;

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-yellow-400" />
          <span className="text-white font-semibold text-sm">Leaderboard</span>
          <span className="text-white/25 text-xs">({lowerIsBetter ? '↓ lowest' : '↑ highest'})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/25 text-xs">{entries.length}/75</span>
          {entries.length > 0 && isAdmin && (
            <button onClick={() => { if (window.confirm('Clear global leaderboard?')) clearBoard(game); }}
              className="text-white/20 hover:text-white/50 transition-colors" title="Clear">
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Personal best banner */}
      {myPB && (
        <div className="px-4 py-2 bg-cyan-400/5 border-b border-cyan-400/15 flex items-center gap-2">
          <User size={12} className="text-cyan-400" />
          <span className="text-xs text-white/50">Your best ({playerName}):</span>
          <span className="text-xs font-mono font-bold text-cyan-400">{fmt(myPB.score)}</span>
          <span className="text-xs text-white/30 ml-auto">{new Date(myPB.timestamp).toLocaleDateString()}</span>
        </div>
      )}

      <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-white/25 text-sm">
            <Star size={22} className="mx-auto mb-2 opacity-30" />
            Be the first on the board!
          </div>
        ) : entries.map((entry, i) => {
          const rs  = RANK_STYLES[i];
          const RankIcon = rs?.icon;
          const isMe = playerName && entry.name.toLowerCase() === playerName.toLowerCase();
          return (
            <motion.div key={entry.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 px-4 py-2.5 ${i < 3 ? rs.bg + ' border-b' : ''} ${isMe ? 'ring-1 ring-inset ring-cyan-400/20' : ''}`}>
              <div className={`w-5 text-center flex-shrink-0 ${rs?.color ?? 'text-white/30'}`}>
                {RankIcon ? <RankIcon size={13} className="mx-auto" /> : <span className="text-xs font-mono">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-medium truncate ${isMe ? 'text-cyan-300' : 'text-white/90'}`}>{entry.name}</span>
                  {isMe && <span className="text-xs text-cyan-400/60">(you)</span>}
                  {entry.isPersonalBest && (
                    <Sparkles size={10} className="text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <span className="text-white/25 text-xs">{new Date(entry.timestamp).toLocaleDateString()}</span>
              </div>
              <span className={`font-mono text-sm font-bold ${i === 0 ? 'text-yellow-400' : i < 3 ? rs.color : 'text-white/60'}`}>
                {fmt(entry.score)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const SubmitScoreModal: React.FC<SubmitScoreProps> = ({ game, score, unit, formatScore, onDone }) => {
  const { submitScore, playerName, setPlayerName } = useLeaderboardStore();
  const [name, setName] = useState(playerName || '');
  const [result, setResult] = useState<{ madeBoard: boolean; isPersonalBest: boolean; prevBest: number | null } | null>(null);
  const fmt = formatScore ?? ((s: number) => `${s}${unit}`);

  const handleSubmit = () => {
    const n = name.trim() || 'Anonymous';
    setPlayerName(n);
    const r = submitScore(game, n, score);
    setResult(r);
  };

  if (result) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/15 bg-[#111128] p-5 text-center">
          <div className="text-3xl mb-2">
            {result.isPersonalBest ? '🏆' : result.madeBoard ? '🎉' : '💪'}
          </div>
          <div className="text-white font-bold text-lg mb-1">
            {result.isPersonalBest ? 'New Personal Best!' : result.madeBoard ? 'On the Board!' : 'Score Submitted'}
          </div>
          <div className="text-cyan-400 font-mono text-2xl font-black mb-2">{fmt(score)}</div>
          {result.isPersonalBest && result.prevBest !== null && (
            <div className="text-white/40 text-xs mb-3">
              Previous best: {fmt(result.prevBest)} — improved by {fmt(Math.abs(score - result.prevBest))}!
            </div>
          )}
          {!result.madeBoard && !result.isPersonalBest && (
            <div className="text-white/40 text-xs mb-3">Keep playing to crack the top 75!</div>
          )}
          <button onClick={onDone}
            className="mt-2 px-6 py-2 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 font-medium hover:bg-cyan-400/30 transition-all text-sm">
            Play Again
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/15 bg-[#111128] p-5">
      <div className="text-center mb-4">
        <div className="text-2xl mb-1">🏅</div>
        <div className="text-white font-bold">Submit Your Score</div>
        <div className="text-cyan-400 font-mono text-xl font-black">{fmt(score)}</div>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Your Name (shown on global board)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 20))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter name…"
            autoFocus
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-cyan-400/50 placeholder-white/25"
          />
          <div className="text-white/25 text-xs mt-1">Your name stays saved for future games</div>
        </div>
        <button onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
          Submit to Leaderboard
        </button>
        <button onClick={onDone} className="text-white/30 hover:text-white/60 text-xs text-center transition-colors">
          Skip
        </button>
      </div>
    </motion.div>
  );
};


