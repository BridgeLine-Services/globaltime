import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, RotateCcw } from 'lucide-react';
import { useLeaderboardStore, type GameId } from '../stores/leaderboardStore';

interface LeaderboardProps {
  game: GameId;
  unit: string;
  formatScore?: (score: number) => string;
  className?: string;
}

const RANK_STYLES = [
  { icon: Crown,  color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  { icon: Medal,  color: 'text-slate-300',  bg: 'bg-slate-300/10  border-slate-300/20'  },
  { icon: Medal,  color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ game, unit, formatScore, className = '' }) => {
  const { getTopEntries, clearBoard, boards } = useLeaderboardStore();
  const entries = getTopEntries(game, 10);
  const lowerIsBetter = boards[game]?.lowerIsBetter ?? false;
  const fmt = formatScore ?? ((s: number) => `${s}${unit}`);

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-yellow-400" />
          <span className="text-white font-semibold text-sm">Leaderboard</span>
          <span className="text-white/25 text-xs">({lowerIsBetter ? '↓ lowest' : '↑ highest'})</span>
        </div>
        {entries.length > 0 && (
          <button onClick={() => { if (window.confirm('Clear leaderboard?')) clearBoard(game); }}
            className="text-white/20 hover:text-white/50 transition-colors" title="Clear">
            <RotateCcw size={12} />
          </button>
        )}
      </div>
      <div className="divide-y divide-white/5">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-white/25 text-sm">
            <Star size={22} className="mx-auto mb-2 opacity-30" />
            No scores yet!
          </div>
        ) : entries.map((entry, i) => {
          const rs  = RANK_STYLES[i];
          const RankIcon = rs?.icon;
          return (
            <motion.div key={entry.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-4 py-2.5 ${i < 3 ? rs.bg + ' border-b' : ''}`}>
              <div className={`w-5 text-center flex-shrink-0 ${rs?.color ?? 'text-white/30'}`}>
                {RankIcon ? <RankIcon size={13} className="mx-auto" /> : <span className="text-xs font-mono">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white/90 text-sm font-medium truncate block">{entry.name}</span>
                <span className="text-white/25 text-xs">{new Date(entry.timestamp).toLocaleDateString()}</span>
              </div>
              <div className={`text-sm font-mono font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-cyan-400'}`}>
                {fmt(entry.score)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface SubmitScoreProps {
  game: GameId;
  score: number;
  unit: string;
  formatScore?: (score: number) => string;
  onDone: () => void;
}

export const SubmitScoreModal: React.FC<SubmitScoreProps> = ({ game, score, unit, formatScore, onDone }) => {
  const { submitScore } = useLeaderboardStore();
  const [name, setName]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [madeBoard, setMadeBoard] = useState(false);
  const fmt = formatScore ?? ((s: number) => `${s}${unit}`);

  const handleSubmit = () => {
    const made = submitScore(game, name || 'Anonymous', score);
    setMadeBoard(made); setSubmitted(true);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88 }}
      className="rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-xl p-6 w-full max-w-xs mx-auto shadow-2xl">
      {!submitted ? (
        <>
          <div className="text-center mb-4">
            <Trophy size={28} className="mx-auto text-yellow-400 mb-2" />
            <div className="text-white font-bold text-lg">{fmt(score)}</div>
            <div className="text-white/40 text-sm mt-0.5">Submit to leaderboard?</div>
          </div>
          <input type="text" maxLength={16} placeholder="Your name (max 16 chars)" value={name}
            onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-cyan-400/60 mb-3"
            autoFocus />
          <div className="flex gap-2">
            <button onClick={onDone} className="flex-1 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white/80 transition-colors">Skip</button>
            <button onClick={handleSubmit} className="flex-1 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-colors">Submit</button>
          </div>
        </>
      ) : (
        <div className="text-center">
          {madeBoard ? (
            <><Crown size={28} className="mx-auto text-yellow-400 mb-2" />
            <div className="text-white font-bold text-lg mb-1">On the board! 🎉</div>
            <div className="text-white/50 text-sm mb-4">{fmt(score)}</div></>
          ) : (
            <><Star size={28} className="mx-auto text-white/40 mb-2" />
            <div className="text-white font-bold text-lg mb-1">Score saved</div>
            <div className="text-white/40 text-sm mb-4">Keep playing to crack the top 10!</div></>
          )}
          <button onClick={onDone} className="w-full py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-colors">Continue</button>
        </div>
      )}
    </motion.div>
  );
};
