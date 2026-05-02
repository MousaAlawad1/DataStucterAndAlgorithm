import React, { useState, useRef } from 'react';
import { useTreeStore, AnimationSpeed } from '../store/treeStore';

const ControlPanel: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    mode,
    isAnimating,
    isPaused,
    stepMode,
    animationSpeed,
    currentOperation,
    insertNode,
    deleteNode,
    searchNode,
    runInorder,
    runPreorder,
    runPostorder,
    convertToAVL,
    resetTree,
    generateRandom,
    setAnimationSpeed,
    toggleStepMode,
    nextStep,
    pauseAnimation,
    resumeAnimation,
    stopAnimation,
  } = useTreeStore();

  const parseValue = (): number | null => {
    const trimmed = inputValue.trim();
    if (!trimmed) { setError('Enter a value'); return null; }
    const val = parseInt(trimmed, 10);
    if (isNaN(val)) { setError('Must be a number'); return null; }
    if (val < 1 || val > 999) { setError('Range: 1–999'); return null; }
    setError('');
    return val;
  };

  const handleInsert = () => {
    const val = parseValue();
    if (val === null) return;
    insertNode(val);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleDelete = () => {
    const val = parseValue();
    if (val === null) return;
    deleteNode(val);
    setInputValue('');
  };

  const handleSearch = () => {
    const val = parseValue();
    if (val === null) return;
    searchNode(val);
  };

  const disabled = isAnimating && !stepMode;

  // Tailwind-compatible button classes
  const btn = 'px-2 py-1.5 rounded-md text-[11px] font-mono font-semibold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border select-none';
  const primary   = `${btn} bg-[#1f6feb] hover:bg-[#388bfd] text-white border-[#388bfd]/30`;
  const danger    = `${btn} bg-[#da3633]/90 hover:bg-[#f85149] text-white border-[#f85149]/30`;
  const success   = `${btn} bg-[#238636]/90 hover:bg-[#3fb950] text-white border-[#3fb950]/30`;
  const neutral   = `${btn} bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border-[#30363d]`;
  const purple    = `${btn} bg-[#6e40c9]/80 hover:bg-[#8957e5] text-white border-[#8957e5]/30`;
  const muted     = `${btn} bg-transparent hover:bg-[#21262d] text-[#8b949e] border-[#30363d]`;

  const section = 'mb-3';
  const label = 'text-[#8b949e] text-[9px] font-mono uppercase tracking-wider mb-1 block';

  return (
    <div className="flex flex-col gap-0 p-3 overflow-y-auto h-full">

      {/* ── Input ─────────────────────────────── */}
      <div className={section}>
        <span className={label}>Node Value</span>
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          placeholder="1 – 999"
          min={1} max={999}
          onChange={e => { setInputValue(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && !disabled && handleInsert()}
          className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#388bfd] rounded-md px-2.5 py-2 text-[#e6edf3] font-mono text-sm placeholder-[#484f58] outline-none transition-colors"
        />
        {error && <p className="text-[#f85149] text-[10px] font-mono mt-0.5">{error}</p>}
      </div>

      {/* ── Node Operations ─────────────────── */}
      <div className={section}>
        <span className={label}>Node Ops</span>
        <div className="grid grid-cols-3 gap-1">
          <button className={primary} onClick={handleInsert} disabled={disabled} title="Insert (Enter)">
            <span>＋</span> Insert
          </button>
          <button className={danger} onClick={handleDelete} disabled={disabled} title="Delete node">
            <span>－</span> Delete
          </button>
          <button className={success} onClick={handleSearch} disabled={disabled} title="Search">
            🔍 Search
          </button>
        </div>
      </div>

      {/* ── Traversals ──────────────────────── */}
      <div className={section}>
        <span className={label}>Traversals</span>
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: 'Inorder', sub: 'L·N·R', fn: runInorder },
            { label: 'Preorder', sub: 'N·L·R', fn: runPreorder },
            { label: 'Postorder', sub: 'L·R·N', fn: runPostorder },
          ].map(({ label: l, sub, fn }) => (
            <button key={l} className={neutral} onClick={fn} disabled={disabled}>
              <span className="block text-[10px]">{l}</span>
              <span className="block text-[9px] text-[#8b949e] mt-0.5">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── AVL Convert (BST mode only) ──────── */}
      {mode === 'BST' && (
        <div className={section}>
          <span className={label}>Convert</span>
          <button className={`${purple} w-full`} onClick={convertToAVL} disabled={disabled}>
            ⚖ Convert BST → AVL
          </button>
        </div>
      )}

      {/* ── Animation Speed ─────────────────── */}
      <div className={section}>
        <span className={label}>Speed</span>
        <div className="grid grid-cols-3 gap-1">
          {(['slow', 'normal', 'fast'] as AnimationSpeed[]).map(speed => (
            <button
              key={speed}
              onClick={() => setAnimationSpeed(speed)}
              className={`${btn} ${animationSpeed === speed
                ? 'bg-[#388bfd] text-white border-[#388bfd]'
                : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3] hover:bg-[#21262d]'
              }`}
            >
              {speed === 'slow' ? '🐢' : speed === 'normal' ? '🚶' : '⚡'}
              <span className="ml-0.5 capitalize">{speed}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Step Mode ───────────────────────── */}
      <div className={section}>
        <span className={label}>Step Mode</span>
        <button
          onClick={toggleStepMode}
          className={`w-full ${btn} flex items-center justify-center gap-2 ${
            stepMode
              ? 'bg-[#f78166]/15 text-[#f78166] border-[#f78166]/40'
              : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:bg-[#21262d]'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${stepMode ? 'bg-[#f78166] shadow-[0_0_6px_#f78166]' : 'bg-[#30363d]'}`} />
          {stepMode ? 'Step-by-Step ON' : 'Step-by-Step OFF'}
        </button>
        {stepMode && (
          <p className="text-[#484f58] text-[9px] font-mono mt-0.5">→ key or button to advance</p>
        )}
      </div>

      {/* ── Playback Controls ───────────────── */}
      {isAnimating && (
        <div className={section}>
          <span className={label}>Playback</span>
          <div className="grid grid-cols-3 gap-1">
            {stepMode ? (
              <>
                <button className={`col-span-2 ${primary}`} onClick={nextStep}>
                  ▶ Next Step
                </button>
                <button className={muted} onClick={stopAnimation}>⏹ Stop</button>
              </>
            ) : isPaused ? (
              <>
                <button className={`col-span-2 ${success}`} onClick={resumeAnimation}>▶ Resume</button>
                <button className={muted} onClick={stopAnimation}>⏹</button>
              </>
            ) : (
              <>
                <button className={`col-span-2 ${neutral}`} onClick={pauseAnimation}>⏸ Pause</button>
                <button className={muted} onClick={stopAnimation}>⏹</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Tree Utils ──────────────────────── */}
      <div className={section}>
        <span className={label}>Tree</span>
        <div className="grid grid-cols-2 gap-1">
          <button className={success} onClick={generateRandom} disabled={isAnimating && !stepMode}>
            🎲 Random
          </button>
          <button className={danger} onClick={resetTree}>
            🗑 Reset
          </button>
        </div>
      </div>

      {/* ── Status ──────────────────────────── */}
      {currentOperation !== 'idle' && (
        <div className="mt-1 bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isAnimating ? 'bg-[#f78166] animate-pulse' : 'bg-[#3fb950]'}`} />
          <span className="text-[#8b949e] text-[10px] font-mono uppercase tracking-wide truncate">
            {currentOperation}
          </span>
        </div>
      )}

      {/* ── Footer ──────────────────────────── */}
      <div className="mt-auto pt-3 border-t border-[#21262d]">
        <p className="text-[#30363d] text-[9px] font-mono leading-relaxed">
          Click node → delete<br />
          Scroll → zoom | Drag → pan<br />
          Esc → stop animation
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;
