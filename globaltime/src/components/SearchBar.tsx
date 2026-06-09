import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchCountries, type Country } from '../data/countries';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  onSelect?: (country: Country) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelect, placeholder = 'Search any country, city, or timezone...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Country[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchCountries(query));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (country: Country) => {
    setQuery('');
    setResults([]);
    if (onSelect) onSelect(country);
    navigate(`/time/${country.slug}`);
  };

  const showResults = isFocused && results.length > 0;

  return (
    <div className="relative w-full max-w-2xl">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 bg-white/5 backdrop-blur-md ${
        isFocused ? 'border-cyan-400/60 shadow-[0_0_20px_rgba(0,212,255,0.2)]' : 'border-white/20 hover:border-white/40'
      }`}>
        <Search size={20} className="text-cyan-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-base font-display"
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search" className="text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/20 bg-[#0d0d2b]/95 backdrop-blur-xl overflow-hidden shadow-2xl z-50">
          {results.map((country) => (
            <button
              key={country.slug}
              onClick={() => handleSelect(country)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
            >
              <span className="text-2xl">{country.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">{country.name}</div>
                <div className="text-white/50 text-xs truncate">{country.capital} · {country.timezone}</div>
              </div>
              <span className="text-white/30 text-xs flex-shrink-0">{country.continent}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
