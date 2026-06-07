import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';

const GAMES = [
  { slug: 'reaction', emoji: '⚡', name: 'Reaction Test', desc: 'Wait for the color change — tap as fast as you can! Tests your raw reaction speed in milliseconds.', color: 'from-yellow-500/20 to-orange-600/20', border: 'border-yellow-500/30', badge: 'Speed' },
  { slug: 'memory', emoji: '🧠', name: 'Memory Flip', desc: 'Flip cards and match pairs. How many can you remember before time runs out?', color: 'from-blue-500/20 to-cyan-600/20', border: 'border-blue-500/30', badge: 'Memory' },
  { slug: 'clicker', emoji: '👆', name: 'Click Speed', desc: 'Click as fast as humanly possible for 10 seconds. What\'s your CPS record?', color: 'from-green-500/20 to-emerald-600/20', border: 'border-green-500/30', badge: 'Endurance' },
  { slug: 'puzzle', emoji: '🧩', name: 'Number Puzzle', desc: 'Slide the tiles into order. Classic 15-puzzle with a twist — beat the par time!', color: 'from-purple-500/20 to-pink-600/20', border: 'border-purple-500/30', badge: 'Logic' },
  { slug: 'runner', emoji: '🏃', name: 'Endless Runner', desc: 'Jump over obstacles and survive as long as possible. How far can you go?', color: 'from-red-500/20 to-rose-600/20', border: 'border-red-500/30', badge: 'Arcade' },
];

export const GamesPage: React.FC = () => (
  <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4">
    <div className="max-w-5xl mx-auto">
      <AdSlotComponent position="game" index={0} className="mb-6" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <div className="text-5xl mb-4">🎮</div>
        <h1 className="text-4xl font-black text-white mb-3">Mini <span className="text-purple-400">Games</span></h1>
        <p className="text-white/50 max-w-xl mx-auto">Take a break from time zones. Quick, addictive, browser-based games — no download needed.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {GAMES.map((game, i) => (
          <motion.div key={game.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link
              to={`/games/${game.slug}`}
              className={`group block p-6 rounded-3xl border ${game.border} bg-gradient-to-br ${game.color} hover:scale-[1.03] transition-all duration-300 hover:shadow-xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl">{game.emoji}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium">{game.badge}</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-2">{game.name}</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{game.desc}</p>
              <div className="flex items-center gap-1 text-white/40 text-sm group-hover:text-white/70 transition-colors">
                <Trophy size={14} /> Play now <ArrowRight size={14} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <AdSlotComponent position="game" index={0} className="mb-4" />
    </div>
  </div>
);
