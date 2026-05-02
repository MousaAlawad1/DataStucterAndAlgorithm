import React from 'react';
import { useTreeStore, TreeMode } from '../store/treeStore';

const Header: React.FC = () => {
  const { mode, setMode, isAnimating } = useTreeStore();

  const handleModeSwitch = (newMode: TreeMode) => {
    if (isAnimating) return;
    setMode(newMode);
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#21262d] bg-[#0d1117] z-10">
      {/* Logo / Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1f6feb] to-[#388bfd] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
              <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 17a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm18 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
              <path d="M12 8v3M12 11l-7 5M12 11l7 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#3fb950] border border-[#0d1117]" />
        </div>
        <div>
          <h1 className="text-[#e6edf3] font-mono font-bold text-sm leading-none">
            TreeViz
          </h1>
          <p className="text-[#8b949e] font-mono text-[10px] leading-none mt-0.5">
            BST · AVL · Interactive
          </p>
          <p className="text-[#8b949e] font-mono text-[10px] leading-none mt-0.5">
            Mousa Alawad · Full stack development
          </p>
        </div>
      </div>

      {/* Center: Mode Toggle */}
      <div className="flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded-lg p-1">
        {(['BST', 'AVL'] as TreeMode[]).map(m => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            disabled={isAnimating}
            className={`
              px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${mode === m
                ? m === 'BST'
                  ? 'bg-[#1f6feb] text-white shadow-lg shadow-[#1f6feb]/20'
                  : 'bg-[#238636] text-white shadow-lg shadow-[#3fb950]/20'
                : 'text-[#8b949e] hover:text-[#e6edf3]'
              }
            `}
          >
            {m === 'BST' ? '🌲 BST' : '⚖️ AVL'}
          </button>
        ))}
      </div>

      {/* Right: Info badges */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 text-[#8b949e] text-[10px] font-mono bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1">
          <span className="text-[#3fb950]">●</span>
          <span>Interactive</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[#8b949e] text-[10px] font-mono bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1">
          <span className="text-[#58a6ff]">v2.1</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 flex items-center justify-center rounded-md bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </header>
  );
};

export default Header;
