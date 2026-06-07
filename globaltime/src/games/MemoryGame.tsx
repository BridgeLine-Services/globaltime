import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';

const EMOJIS = ['🌍','🌎','🌏','🗺️','🧭','🌙','⭐','☀️','🌊','🏔️','🌴','🎮','⚡','🎯','🏆','💎'];

interface Card { id: number; emoji: string; flipped: boolean; matched: boolean; }

const getBest = () => parseInt(localStorage.getItem('memory_best') || '0', 10);

const createCards = (pairs: number): Card[] => {
  const selected = EMOJIS.slice(0, pairs);
  return [...selected, ...selected]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
};

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>(() => createCards(8));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (won) {
      setRunning(false);
      const score = Math.max(0, 1000 - moves * 10 - time * 2);
      const best = getBest();
      if (score > best) localStorage.setItem('memory_best', String(score));
    }
  }, [won]);

  const flip = useCallback((id: number) => {
    if (locked || flipped.includes(id) || cards[id].matched) return;
    if (!running) setRunning(true);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newFlipped.map(i => cards[i]);
      if (a.emoji === b.emoji) {
        setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
        setFlipped([]);
        setLocked(false);
        const newCards = cards.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c);
        if (newCards.every(c => c.matched)) setWon(true);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }, [locked, flipped, cards, running]);

  const reset = () => {
    setCards(createCards(8));
    setFlipped([]);
    setMoves(0);
    setWon(false);
    setLocked(false);
    setTime(0);
    setRunning(false);
  };

  const matched = cards.filter(c => c.matched).length / 2;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/games" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-white font-bold text-2xl">🧠 Memory Flip</h1>
          </div>
          <button onClick={reset} className="text-white/40 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10">
            <RefreshCw size={18} />
          </button>
        </div>

        <AdSlotComponent position="game" index={0} className="mb-4" />

        <div className="flex gap-4 mb-6">
          {[['Moves', moves], ['Pairs', `${matched}/8`], ['Time', `${time}s`]].map(([label, val]) => (
            <div key={label as string} className="flex-1 p-3 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="text-white font-bold text-xl">{val}</div>
              <div className="text-white/40 text-xs">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map(card => (
            <motion.button
              key={card.id}
              onClick={() => flip(card.id)}
              className={`aspect-square rounded-2xl border text-3xl flex items-center justify-center transition-all ${
                card.matched ? 'border-green-400/40 bg-green-900/30 cursor-default'
                  : card.flipped ? 'border-cyan-400/40 bg-cyan-900/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer'
              }`}
              whileTap={{ scale: 0.93 }}
              animate={{ rotateY: card.flipped || card.matched ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {(card.flipped || card.matched) ? card.emoji : ''}
            </motion.button>
          ))}
        </div>

        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl border border-green-400/30 bg-green-900/20 text-center mb-6"
          >
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-white font-bold text-xl">You won!</div>
            <div className="text-white/60 text-sm mt-1">{moves} moves · {time}s · Score: {Math.max(0, 1000 - moves * 10 - time * 2)}</div>
            <button onClick={reset} className="mt-4 px-6 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-sm hover:bg-green-500/30 transition-colors">
              Play Again
            </button>
          </motion.div>
        )}

        <AdSlotComponent position="game" index={0} className="mb-4" />
        <AdSlotComponent position="game" index={0} className="mb-4" />
      </div>
    </div>
  );
};
