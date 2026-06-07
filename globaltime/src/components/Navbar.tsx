import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Gamepad2, Clock, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();

  const links = [
    { to: '/', label: 'Home', icon: <Globe size={16} /> },
    { to: '/world', label: 'World Clock', icon: <Clock size={16} /> },
    { to: '/games', label: 'Mini Games', icon: <Gamepad2 size={16} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] transition-shadow">
            <Globe size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">
            World<span className="text-cyan-400">Clock</span><span className="text-purple-400">.live</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                loc.pathname === link.to
                  ? 'bg-cyan-400/20 text-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden text-white/60 hover:text-white transition-colors p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                loc.pathname === link.to ? 'bg-cyan-400/20 text-cyan-400' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.icon}{link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
