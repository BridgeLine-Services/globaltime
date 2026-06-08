import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { WorldClockPage } from './pages/WorldClockPage';
import { CountryPage } from './pages/CountryPage';
import { GamesPage } from './pages/GamesPage';

// Original games
const ReactionGame  = lazy(() => import('./games/ReactionGame').then(m => ({ default: m.ReactionGame })));
const MemoryGame    = lazy(() => import('./games/MemoryGame').then(m => ({ default: m.MemoryGame })));
const ClickerGame   = lazy(() => import('./games/ClickerGame').then(m => ({ default: m.ClickerGame })));
const PuzzleGame    = lazy(() => import('./games/PuzzleGame').then(m => ({ default: m.PuzzleGame })));
const RunnerGame    = lazy(() => import('./games/RunnerGame').then(m => ({ default: m.RunnerGame })));
// New games
const TypingGame    = lazy(() => import('./games/TypingGame').then(m => ({ default: m.TypingGame })));
const TimezoneQuiz  = lazy(() => import('./games/TimezoneQuiz').then(m => ({ default: m.TimezoneQuiz })));
const SnakeGame     = lazy(() => import('./games/SnakeGame').then(m => ({ default: m.SnakeGame })));
const ColorMatch    = lazy(() => import('./games/ColorMatch').then(m => ({ default: m.ColorMatch })));
// Admin
const AdminPanel    = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));

const GameFallback = () => (
  <div className="min-h-screen bg-[#0a0a1a] pt-24 flex items-center justify-center">
    <div className="text-white/40 text-sm animate-pulse">Loading game…</div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a1a]">
        <Navbar />
        <Analytics />
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/world"             element={<WorldClockPage />} />
          <Route path="/time/:slug"        element={<CountryPage />} />
          <Route path="/games"             element={<GamesPage />} />
          {/* Original */}
          <Route path="/games/reaction"   element={<Suspense fallback={<GameFallback />}><ReactionGame /></Suspense>} />
          <Route path="/games/memory"     element={<Suspense fallback={<GameFallback />}><MemoryGame /></Suspense>} />
          <Route path="/games/clicker"    element={<Suspense fallback={<GameFallback />}><ClickerGame /></Suspense>} />
          <Route path="/games/puzzle"     element={<Suspense fallback={<GameFallback />}><PuzzleGame /></Suspense>} />
          <Route path="/games/runner"     element={<Suspense fallback={<GameFallback />}><RunnerGame /></Suspense>} />
          {/* New */}
          <Route path="/games/typing"     element={<Suspense fallback={<GameFallback />}><TypingGame /></Suspense>} />
          <Route path="/games/quiz"       element={<Suspense fallback={<GameFallback />}><TimezoneQuiz /></Suspense>} />
          <Route path="/games/snake"      element={<Suspense fallback={<GameFallback />}><SnakeGame /></Suspense>} />
          <Route path="/games/color"      element={<Suspense fallback={<GameFallback />}><ColorMatch /></Suspense>} />
          {/* Admin: hidden route */}
          <Route path="/x-admin-9f3a"     element={<Suspense fallback={<GameFallback />}><AdminPanel /></Suspense>} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
