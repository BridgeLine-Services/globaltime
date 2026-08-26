import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 flex items-center justify-center">
    <section className="max-w-lg text-center">
      <p className="text-cyan-400 font-mono text-sm">404</p>
      <h1 className="mt-3 text-3xl font-bold text-white">Time zone not found</h1>
      <p className="mt-3 text-white/60 leading-relaxed">That GlobalTime page does not exist. Return to the world clock to browse available countries and tools.</p>
      <Link to="/world" className="inline-flex min-h-11 items-center mt-6 px-5 rounded-xl bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30 transition-colors">Browse world clock</Link>
    </section>
  </div>
);
