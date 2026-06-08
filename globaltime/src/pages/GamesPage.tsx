import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Zap, Brain, MousePointer, Grid3X3, Play, Keyboard, Globe, Gamepad2, Palette } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';

const GAMES = [
  { slug: 'reaction', Icon: Zap,          name: 'Reaction Test',    desc: 'Tap the instant the screen turns green. How fast are your reflexes?',      color: 'from-yellow-500/20 to-orange-600/20', border: 'border-yellow-500/30',  badge: 'Speed',    emoji: '⚡' },
  { slug: 'clicker',  Icon: MousePointer, name: 'Click Speed',      desc: 'Click as fast as humanly possible for 10 seconds. What\'s your CPS?',       color: 'from-green-500/20 to-emerald-600/20', border: 'border-green-500/30',   badge: 'Endurance',emoji: '👆' },
  { slug: 'memory',   Icon: Brain,        name: 'Memory Flip',      desc: 'Match pairs of emoji cards. How sharp is your memory?',                     color: 'from-blue-500/20 to-cyan-600/20',     border: 'border-blue-500/30',    badge: 'Memory',   emoji: '🧠' },
  { slug: 'puzzle',   Icon: Grid3X3,      name: 'Sliding Puzzle',   desc: 'Classic 15-puzzle. Slide tiles into order in the fewest moves.',             color: 'from-purple-500/20 to-pink-600/20',   border: 'border-purple-500/30',  badge: 'Logic',    emoji: '🧩' },
  { slug: 'runner',   Icon: Play,         name: 'Endless Runner',   desc: 'Jump over obstacles and survive as long as possible. Speed increases!',      color: 'from-red-500/20 to-rose-600/20',      border: 'border-red-500/30',     badge: 'Arcade',   emoji: '🏃' },
  { slug: 'typing',   Icon: Keyboard,     name: 'Speed Typing',     desc: 'Type world-themed words as fast as you can. 30 seconds, WPM rating.',        color: 'from-teal-500/20 to-cyan-600/20',     border: 'border-teal-500/30',    badge: 'Skill',    emoji: '⌨️' },
  { slug: 'quiz',     Icon: Globe,        name: 'Timezone Quiz',    desc: 'Test your world geography — capitals, continents, timezones. 10 questions!', color: 'from-sky-500/20 to-blue-600/20',      border: 'border-sky-500/30',     badge: 'Knowledge',emoji: '🌍' },
  { slug: 'snake',    Icon: Gamepad2,     name: 'Snake',            desc: 'Classic snake with a twist — wrap-around walls and increasing speed.',       color: 'from-lime-500/20 to-green-600/20',    border: 'border-lime-500/30',    badge: 'Classic',  emoji: '🐍' },
  { slug: 'color',    Icon: Palette,      name: 'Color Match',      desc: 'Stroop effect game — does the ink color match the word? Sounds easy...',    color: 'from-fuchsia-500/20 to-pink-600/20',  border: 'border-fuchsia-500/30', badge: 'Brain',    emoji: '🎨' },
];

export const GamesPage: React.FC = () => (
  <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-16">
    <div className="max-w-6xl mx-auto">

      <AdSlotComponent position="header" index={0} className="mb-6" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-5xl font-black text-white mb-3">
          Mini <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Games</span>
        </h1>
        <p className="text-white/50 max-w-lg mx-auto text-lg">
          Take a break from time zones. 9 quick, addictive games — no download, no install.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-white/30 text-sm">
          <Trophy size={14} className="text-yellow-400" />
          <span>All games have leaderboards — submit your score!</span>
        </div>
      </motion.div>

      <AdSlotComponent position="mid-page" index={0} className="mb-8" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {GAMES.map((game, i) => (
          <motion.div key={game.slug}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}>
            <Link to={`/games/${game.slug}`}
              className={`group block p-6 rounded-3xl border ${game.border} bg-gradient-to-br ${game.color} hover:scale-[1.03] transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20`}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl">{game.emoji}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium">{game.badge}</span>
                  <div className="flex items-center gap-0.5 text-yellow-400/60 text-xs">
                    <Trophy size={10} /><span>Leaderboard</span>
                  </div>
                </div>
              </div>
              <h2 className="text-white font-bold text-xl mb-2">{game.name}</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-5">{game.desc}</p>
              <div className="flex items-center gap-1.5 text-white/40 text-sm group-hover:text-white/80 transition-colors font-medium">
                <game.Icon size={14} /> Play now <ArrowRight size={14} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <AdSlotComponent position="mid-page" index={1} className="mb-4" />
      <AdSlotComponent position="game" index={0} />
    </div>
  </div>
);
