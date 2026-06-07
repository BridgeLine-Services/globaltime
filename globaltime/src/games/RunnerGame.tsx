import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';

const W = 600, H = 200, GROUND = 160, GRAVITY = 0.6, JUMP = -12;

interface Obstacle { x: number; w: number; h: number; }
interface Player { y: number; vy: number; onGround: boolean; }

const getBest = () => parseInt(localStorage.getItem('runner_best') || '0', 10);

export const RunnerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ player: { y: GROUND, vy: 0, onGround: true } as Player, obstacles: [] as Obstacle[], score: 0, speed: 4, frame: 0, running: false, dead: false });
  const rafRef = useRef(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'dead'>('idle');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0a1a');
    sky.addColorStop(1, '#0d0d2b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect((i * 47 + s.frame * 0.3) % W, (i * 13) % 100, 1, 1);
    }

    // Ground line
    ctx.strokeStyle = '#00d4ff33';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND + 28); ctx.lineTo(W, GROUND + 28); ctx.stroke();

    // Player (character)
    const px = 80, py = s.player.y;
    ctx.fillStyle = s.dead ? '#ff006e' : '#00d4ff';
    ctx.shadowColor = s.dead ? '#ff006e' : '#00d4ff';
    ctx.shadowBlur = 10;
    // Body
    ctx.fillRect(px - 12, py - 30, 24, 28);
    // Head
    ctx.beginPath(); ctx.arc(px, py - 36, 10, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Legs animation
    if (!s.dead && s.player.onGround) {
      ctx.fillStyle = '#0088aa';
      const legPhase = Math.sin(s.frame * 0.3);
      ctx.fillRect(px - 10, py - 2, 8, 12 + legPhase * 4);
      ctx.fillRect(px + 2, py - 2, 8, 12 - legPhase * 4);
    }

    // Obstacles
    s.obstacles.forEach(obs => {
      const grad = ctx.createLinearGradient(obs.x, GROUND + 28 - obs.h, obs.x + obs.w, GROUND + 28);
      grad.addColorStop(0, '#b347ea');
      grad.addColorStop(1, '#7b21a6');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#b347ea';
      ctx.shadowBlur = 8;
      ctx.fillRect(obs.x, GROUND + 28 - obs.h, obs.w, obs.h);
      ctx.shadowBlur = 0;
    });

    // Score
    ctx.fillStyle = '#ffffff88';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Score: ${Math.floor(s.score)}`, W - 130, 30);
    ctx.fillText(`Best: ${getBest()}`, W - 130, 50);

    if (!s.running && !s.dead) {
      ctx.fillStyle = 'rgba(0,212,255,0.9)';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE or TAP to START', W / 2, H / 2);
      ctx.textAlign = 'left';
    }
    if (s.dead) {
      ctx.fillStyle = 'rgba(255,0,110,0.9)';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER — Tap to restart', W / 2, H / 2 - 10);
      ctx.fillStyle = '#ffffff88';
      ctx.font = '14px monospace';
      ctx.fillText(`Score: ${Math.floor(s.score)} | Best: ${getBest()}`, W / 2, H / 2 + 20);
      ctx.textAlign = 'left';
    }
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) { draw(); return; }
    s.frame++;
    s.score += s.speed * 0.05;
    s.speed = Math.min(12, 4 + s.score * 0.003);

    // Player physics
    if (!s.player.onGround) {
      s.player.vy += GRAVITY;
      s.player.y += s.player.vy;
    }
    if (s.player.y >= GROUND) {
      s.player.y = GROUND;
      s.player.vy = 0;
      s.player.onGround = true;
    }

    // Spawn obstacles
    if (s.frame % Math.max(60, 120 - s.score * 0.5) === 0) {
      const h = 20 + Math.random() * 40;
      s.obstacles.push({ x: W + 10, w: 18 + Math.random() * 12, h });
    }

    // Move obstacles
    s.obstacles = s.obstacles.filter(o => o.x > -50);
    s.obstacles.forEach(o => { o.x -= s.speed; });

    // Collision
    const px = 80, py = s.player.y;
    for (const obs of s.obstacles) {
      if (px + 10 > obs.x && px - 10 < obs.x + obs.w && py - 2 > GROUND + 28 - obs.h && py < GROUND + 28) {
        s.dead = true;
        s.running = false;
        const score = Math.floor(s.score);
        if (score > getBest()) localStorage.setItem('runner_best', String(score));
        setScore(score);
        setPhase('dead');
      }
    }

    setScore(Math.floor(s.score));
    draw();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) {
      // Reset
      stateRef.current = { player: { y: GROUND, vy: 0, onGround: true }, obstacles: [], score: 0, speed: 4, frame: 0, running: true, dead: false };
      setPhase('playing');
      setScore(0);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    if (!s.running) {
      s.running = true;
      setPhase('playing');
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(gameLoop);
    }
    if (s.player.onGround) {
      s.player.vy = JUMP;
      s.player.onGround = false;
    }
  }, [gameLoop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-white/40 hover:text-white"><ArrowLeft size={20} /></Link>
          <h1 className="text-white font-bold text-2xl">🏃 Endless Runner</h1>
        </div>

        <AdSlotComponent position="game" index={0} className="mb-4" />

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full rounded-2xl border border-white/10 cursor-pointer"
          style={{ maxHeight: '220px', objectFit: 'fill' }}
          onClick={jump}
        />

        <div className="mt-3 text-white/30 text-xs text-center">SPACE / TAP to jump over obstacles</div>

        <div className="mt-4 flex gap-4">
          <div className="flex-1 p-3 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-white font-bold text-xl">{score}</div>
            <div className="text-white/40 text-xs">Score</div>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-cyan-400 font-bold text-xl">{getBest()}</div>
            <div className="text-white/40 text-xs">Best</div>
          </div>
        </div>

        <AdSlotComponent position="game" index={0} className="mt-4" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
