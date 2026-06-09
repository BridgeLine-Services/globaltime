import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { WorldClockPage } from './pages/WorldClockPage';
import { CountryPage } from './pages/CountryPage';
import { GamesPage } from './pages/GamesPage';
import { BlogPage } from './pages/BlogPage';
import { AIChatbot } from './components/AIChatbot';

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

const MathBlitz     = lazy(() => import('./games/MathBlitz').then(m => ({ default: m.MathBlitz })));
const FlagQuiz      = lazy(() => import('./games/FlagQuiz').then(m => ({ default: m.FlagQuiz })));
const CapitalsQuiz  = lazy(() => import('./games/CapitalsQuiz').then(m => ({ default: m.CapitalsQuiz })));
const SimonWave     = lazy(() => import('./games/SimonWave').then(m => ({ default: m.SimonWave })));
const NumberMemory  = lazy(() => import('./games/NumberMemory').then(m => ({ default: m.NumberMemory })));
const WordScramble  = lazy(() => import('./games/WordScramble').then(m => ({ default: m.WordScramble })));
const TicTacToe     = lazy(() => import('./games/TicTacToe').then(m => ({ default: m.TicTacToe })));
const ChronoWord    = lazy(() => import('./games/ChronoWord').then(m => ({ default: m.ChronoWord })));
const CountdownTimer= lazy(() => import('./games/CountdownTimer').then(m => ({ default: m.CountdownTimer })));
const Minesweeper   = lazy(() => import('./games/Minesweeper').then(m => ({ default: m.Minesweeper })));
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
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/games/mathblitz"     element={<Suspense fallback={<GameFallback />}><MathBlitz /></Suspense>} />
          <Route path="/games/flagquiz"       element={<Suspense fallback={<GameFallback />}><FlagQuiz /></Suspense>} />
          <Route path="/games/capitals"       element={<Suspense fallback={<GameFallback />}><CapitalsQuiz /></Suspense>} />
          <Route path="/games/simon"          element={<Suspense fallback={<GameFallback />}><SimonWave /></Suspense>} />
          <Route path="/games/numbermemory"   element={<Suspense fallback={<GameFallback />}><NumberMemory /></Suspense>} />
          <Route path="/games/wordscramble"   element={<Suspense fallback={<GameFallback />}><WordScramble /></Suspense>} />
          <Route path="/games/tictactoe"      element={<Suspense fallback={<GameFallback />}><TicTacToe /></Suspense>} />
          <Route path="/games/chronoword"     element={<Suspense fallback={<GameFallback />}><ChronoWord /></Suspense>} />
          <Route path="/games/countdown"      element={<Suspense fallback={<GameFallback />}><CountdownTimer /></Suspense>} />
          <Route path="/games/minesweeper"    element={<Suspense fallback={<GameFallback />}><Minesweeper /></Suspense>} />
          {/* Admin: hidden route */}
          <Route path="/x-admin-9f3a"     element={<Suspense fallback={<GameFallback />}><AdminPanel /></Suspense>} />
        </Routes>
        <Footer />
        <AIChatbot />
      </div>
    </BrowserRouter>
  );
}
