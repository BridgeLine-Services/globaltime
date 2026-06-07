import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Eager-load the main pages
import { HomePage } from './pages/HomePage';
import { WorldClockPage } from './pages/WorldClockPage';
import { CountryPage } from './pages/CountryPage';
import { GamesPage } from './pages/GamesPage';

// Lazy-load games (each is a separate chunk)
const ReactionGame = lazy(() => import('./games/ReactionGame').then(m => ({ default: m.ReactionGame })));
const MemoryGame   = lazy(() => import('./games/MemoryGame').then(m => ({ default: m.MemoryGame })));
const ClickerGame  = lazy(() => import('./games/ClickerGame').then(m => ({ default: m.ClickerGame })));
const PuzzleGame   = lazy(() => import('./games/PuzzleGame').then(m => ({ default: m.PuzzleGame })));
const RunnerGame   = lazy(() => import('./games/RunnerGame').then(m => ({ default: m.RunnerGame })));

// Admin panel — lazy + hidden route
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/world" element={<WorldClockPage />} />
          <Route path="/time/:slug" element={<CountryPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/reaction" element={<Suspense fallback={<GameFallback />}><ReactionGame /></Suspense>} />
          <Route path="/games/memory"   element={<Suspense fallback={<GameFallback />}><MemoryGame /></Suspense>} />
          <Route path="/games/clicker"  element={<Suspense fallback={<GameFallback />}><ClickerGame /></Suspense>} />
          <Route path="/games/puzzle"   element={<Suspense fallback={<GameFallback />}><PuzzleGame /></Suspense>} />
          <Route path="/games/runner"   element={<Suspense fallback={<GameFallback />}><RunnerGame /></Suspense>} />
          {/* Admin: hidden route, not in nav */}
          <Route path="/x-admin-9f3a" element={<Suspense fallback={<GameFallback />}><AdminPanel /></Suspense>} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
