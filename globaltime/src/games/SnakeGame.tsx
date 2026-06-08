import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

const CELL = 20; const COLS = 20; const ROWS = 18;
const W = CELL * COLS; const H = CELL * ROWS;
type Dir = [number, number];
type Pos = [number, number];

const getBest = () => parseInt(localStorage.getItem('snake_best') || '0', 10);
const rand = (): Pos => [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    snake: [[10, 9], [9, 9], [8, 9]] as Pos[],
    dir: [1, 0] as Dir,
    nextDir: [1, 0] as Dir,
    food: rand(),
    score: 0,
    running: false,
    dead: false,
    speed: 120,
    frame: 0,
  });
  const rafRef     = useRef(0);
  const lastTick   = useRef(0);
  const [score, setScore]       = useState(0);
  const [dead, setDead]         = useState(false);
  const [started, setStarted]   = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);

  const placeFood = (): Pos => {
    const s = state.current;
    let f: Pos;
    do { f = rand(); } while (s.snake.some(p => p[0] === f[0] && p[1] === f[1]));
    return f;
  };

  const startGame = () => {
    const s = state.current;
    s.snake = [[10, 9], [9, 9], [8, 9]];
    s.dir = [1, 0]; s.nextDir = [1, 0];
    s.food = placeFood(); s.score = 0;
    s.running = true; s.dead = false; s.speed = 120; s.frame = 0;
    lastTick.current = 0;
    setScore(0); setDead(false); setStarted(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = (ts: number) => {
      const s = state.current;

      if (s.running && ts - lastTick.current > s.speed) {
        lastTick.current = ts;
        s.dir = s.nextDir;
        const head: Pos = [s.snake[0][0] + s.dir[0], s.snake[0][1] + s.dir[1]];

        // Wall wrap
        head[0] = (head[0] + COLS) % COLS;
        head[1] = (head[1] + ROWS) % ROWS;

        // Self collision
        if (s.snake.some(p => p[0] === head[0] && p[1] === head[1])) {
          s.running = false; s.dead = true;
          if (s.score > getBest()) localStorage.setItem('snake_best', String(s.score));
          setPendingScore(s.score); setScore(s.score); setDead(true);
          setShowSubmit(true);
        } else {
          const ate = head[0] === s.food[0] && head[1] === s.food[1];
          s.snake = [head, ...s.snake.slice(0, ate ? undefined : s.snake.length - 1)];
          if (ate) { s.score++; s.food = placeFood(); s.speed = Math.max(55, s.speed - 2); setScore(s.score); }
        }
      }

      // Draw
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, W, H);

      // Grid dots
      ctx.fillStyle = '#0a1030';
      for (let x = 0; x < COLS; x++)
        for (let y = 0; y < ROWS; y++)
          ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);

      if (!s.running && !s.dead) {
        ctx.fillStyle = '#ffffff30'; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
        ctx.fillText('Press WASD / arrows / tap buttons', W / 2, H / 2 - 10);
        ctx.fillText('to start', W / 2, H / 2 + 14);
        rafRef.current = requestAnimationFrame(draw); return;
      }

      // Food
      ctx.shadowBlur = 16; ctx.shadowColor = '#ff006e';
      ctx.fillStyle = '#ff006e';
      ctx.beginPath();
      ctx.arc(s.food[0] * CELL + CELL / 2, s.food[1] * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Snake
      s.snake.forEach(([x, y], i) => {
        const t = i / s.snake.length;
        ctx.shadowBlur = i === 0 ? 12 : 0;
        ctx.shadowColor = '#00d4ff';
        ctx.fillStyle = i === 0 ? '#00d4ff' : `hsl(${190 + t * 60}, 90%, ${65 - t * 20}%)`;
        ctx.beginPath();
        ctx.roundRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Score
      ctx.fillStyle = '#ffffff50'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'right';
      ctx.fillText(`Score: ${s.score}  Best: ${getBest()}`, W - 8, 18);

      if (s.dead) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff006e'; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 14);
        ctx.fillStyle = '#ffffff60'; ctx.font = '13px monospace';
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 14);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Keyboard
  useEffect(() => {
    const dirs: Record<string, Dir> = {
      ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0],
      w: [0,-1], s: [0,1], a: [-1,0], d: [1,0],
      W: [0,-1], S: [0,1], A: [-1,0], D: [1,0],
    };
    const onKey = (e: KeyboardEvent) => {
      if (dirs[e.key]) {
        e.preventDefault();
        if (!started || dead) { startGame(); return; }
        const nd = dirs[e.key];
        const cur = state.current.dir;
        if (nd[0] !== -cur[0] || nd[1] !== -cur[1]) state.current.nextDir = nd;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, dead]);

  const setDir = useCallback((d: Dir) => {
    if (!started || dead) { startGame(); return; }
    const cur = state.current.dir;
    if (d[0] !== -cur[0] || d[1] !== -cur[1]) state.current.nextDir = d;
  }, [started, dead]);

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-white/40 hover:text-white flex items-center gap-1 transition-colors text-sm">
            <ArrowLeft size={14} /> Games
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/70 flex items-center gap-1"><Gamepad2 size={14} /> Snake</span>
        </div>

        <AdSlotComponent position="header" index={0} className="mb-4" />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/10 overflow-hidden cursor-pointer"
              onClick={() => { if (!started || dead) startGame(); }}>
              <canvas ref={canvasRef} width={W} height={H} className="w-full" style={{ display: 'block' }} />
            </div>

            {/* D-pad for mobile */}
            <div className="grid grid-cols-3 gap-2 w-36 mx-auto">
              {[['↑',[0,-1]],[''],['↓',[0,1]],['←',[-1,0]],[''],['→',[1,0]]].map((row, i) => (
                Array.isArray(row) && row.length === 2
                  ? <button key={i} onClick={() => setDir(row[1] as Dir)}
                      className="aspect-square rounded-xl bg-white/10 border border-white/20 text-white text-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center">
                      {row[0] as string}
                    </button>
                  : <div key={i} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-cyan-400 font-bold text-xl">{score}</div>
                <div className="text-white/40 text-xs">Current</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-yellow-400 font-bold text-xl">{getBest()}</div>
                <div className="text-white/40 text-xs">Best</div>
              </div>
            </div>

            <AdSlotComponent position="mid-page" index={0} />
            <AdSlotComponent position="game" index={0} />
          </div>

          <div className="space-y-4">
            <Leaderboard game="snake" unit=" pts" formatScore={(s: number) => `${s} pts`} />
            <AdSlotComponent position="sidebar" index={0} />
            <AdSlotComponent position="sidebar" index={1} />
          </div>
        </div>
        <AdSlotComponent position="footer" index={0} className="mt-6" />
      </div>

      <AnimatePresence>
        {showSubmit && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SubmitScoreModal game="snake" score={pendingScore} unit=" pts" formatScore={(s: number) => `${s} pts`} onDone={() => setShowSubmit(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
