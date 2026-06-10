import React, { useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Gamepad2, Clock, Menu, X, BookOpen, Cloud, Calendar, HelpCircle, ChevronDown, Telescope, CloudLightning, Map } from 'lucide-react';

const SECRET_TAPS   = 5;
const SECRET_WINDOW = 3000;

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const loc      = useLocation();
  const navigate = useNavigate();

  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretTap = useCallback(() => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, SECRET_WINDOW);
    if (tapCount.current >= SECRET_TAPS) {
      tapCount.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);
      navigate('/x-admin-9f3a');
    }
  }, [navigate]);

  const mainLinks = [
    { to: '/',      label: 'Home',        icon: <Globe    size={16} /> },
    { to: '/world', label: 'World Clock', icon: <Clock    size={16} /> },
    { to: '/games', label: 'Mini Games',  icon: <Gamepad2 size={16} /> },
    { to: '/blog',  label: 'Blog',        icon: <BookOpen size={16} /> },
    { to: '/collections', label: 'Collections', icon: <Map size={16} /> },
  ];

  const moreLinks = [
    { to: '/weather',     label: 'World Weather',   icon: <Cloud           size={15} /> },
    { to: '/sky',         label: 'Sky & Space',     icon: <Telescope       size={15} /> },
    { to: '/storms',      label: 'Storm Tracker',   icon: <CloudLightning  size={15} /> },
    { to: '/on-this-day', label: 'On This Day',     icon: <Calendar        size={15} /> },
    { to: '/faq',         label: 'FAQ',             icon: <HelpCircle      size={15} /> },
    { to: '/legal',       label: 'Legal & Privacy', icon: <Globe           size={15} /> },
  ];

  const allMobileLinks = [...mainLinks, ...moreLinks];
  const isMoreActive = moreLinks.some(l => loc.pathname.startsWith(l.to));

  const activeClass = 'bg-cyan-400/20 text-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.2)]';
  const inactiveClass = 'text-white/60 hover:text-white hover:bg-white/10';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] transition-shadow"
            onClick={handleSecretTap}
            onClickCapture={e => { if (tapCount.current + 1 >= SECRET_TAPS) e.preventDefault(); }}
          >
            <Globe size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">
            World<span className="text-cyan-400">Clock</span><span className="text-purple-400">.live</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {mainLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${loc.pathname === link.to ? activeClass : inactiveClass}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(o => !o)}
              onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isMoreActive ? activeClass : inactiveClass}`}
            >
              More
              <ChevronDown size={13} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[#0d0d20]/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl py-2 z-50">
                {moreLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${loc.pathname === link.to ? 'text-cyan-400' : 'text-white/60 hover:text-white'}`}
                  >
                    <span className="text-white/40">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/60 hover:text-white transition-colors p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {allMobileLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${loc.pathname === link.to ? 'bg-cyan-400/20 text-cyan-400' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

