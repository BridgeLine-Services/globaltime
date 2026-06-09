import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard } from '../components/Leaderboard';

const SIZE = 4;
const N = SIZE * SIZE;
const GOAL = [...Array(N - 1).keys()].map(i => i + 1).concat(0);

function isSolvable(arr: number[]): boolean {
  let inv = 0;
  const flat = arr.filter(x => x !== 0);
  for (let i = 0; i < flat.length; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[i] > flat[j]) inv++;
  const blankRow = Math.floor(arr.indexOf(0) / SIZE);
  if (SIZE % 2 === 1) return inv % 2 === 0;
  return (inv + blankRow) % 2 === 1;
}

function shuffle(): number[] {
  let arr = [...GOAL];
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr) || JSON.stringify(arr) === JSON.stringify(GOAL));
  return arr;
}

const getBest = () => parseInt(localStorage.getItem('puzzle_best') || '0', 10);

export const PuzzleGame: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>(() => shuffle());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const move = useCallback((i: number) => {
    if (won) return;
    const blank = tiles.indexOf(0);
    const row = Math.floor(i / SIZE), col = i % SIZE;
    const bRow = Math.floor(blank / SIZE), bCol = blank % SIZE;
    const adj = (Math.abs(row - bRow) + Math.abs(col - bCol)) === 1;
    if (!adj) return;
    if (!running) setRunning(true);
    const next = [...tiles];
    [next[i], next[blank]] = [next[blank], next[i]];
    setTiles(next);
    setMoves(m => m + 1);
    if (JSON.stringify(next) === JSON.stringify(GOAL)) {
      setWon(true);
      setRunning(false);
      const score = Math.max(0, 5000 - moves * 10 - time * 5);
      if (score > getBest()) localStorage.setItem('puzzle_best', String(score));
    }
  }, [tiles, running, won, moves, time]);

  const reset = () => {
    setTiles(shuffle());
    setMoves(0);
    setTime(0);
    setRunning(false);
    setWon(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/games" className="text-white/40 hover:text-white"><ArrowLeft size={20} /></Link>
            <h1 className="text-white font-bold text-2xl">🧩 Number Puzzle</h1>
          </div>
          <button onClick={reset} className="text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/10"><RefreshCw size={18} /></button>
        </div>

        <AdSlotComponent position="game" index={0} className="mb-4" />

        <div className="flex gap-4 mb-4">
          {[['Moves', moves], ['Time', `${time}s`], ['Best', getBest() || '—']].map(([l, v]) => (
            <div key={l as string} className="flex-1 p-3 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="text-white font-bold">{v}</div>
              <div className="text-white/40 text-xs">{l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {tiles.map((n, i) => (
            <motion.button
              key={i}
              onClick={() => move(i)}
              className={`aspect-square rounded-xl text-xl font-black transition-all ${
                n === 0 ? 'bg-transparent border border-white/10 cursor-default'
                  : 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 text-white hover:from-cyan-800/50 hover:border-cyan-400/50 cursor-pointer'
              }`}
              whileTap={n !== 0 ? { scale: 0.92 } : {}}
            >
              {n !== 0 && n}
            </motion.button>
          ))}
        </div>

        {won && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl border border-purple-400/30 bg-purple-900/20 text-center mb-4">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-white font-bold text-xl">Puzzle Solved!</div>
            <div className="text-white/50 text-sm">{moves} moves · {time}s</div>
            <button onClick={reset} className="mt-3 px-6 py-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-sm">Play Again</button>
          </motion.div>
        )}

        <AdSlotComponent position="game" index={0} className="mb-4" />
        
        <Leaderboard game="puzzle" unit=" moves" className="mt-4" />
<AdSlotComponent position="game" index={0} />
      </div>
    </div>
  );
};
