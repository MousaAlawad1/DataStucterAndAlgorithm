import { useState } from 'react';
import Header from './components/Header';
import TreeCanvas from './components/TreeCanvas';
import ControlPanel from './components/ControlPanel';
import InfoPanel from './components/InfoPanel';
import StepOverlay from './components/StepOverlay';
import MobileControls from './components/MobileControls';
import AVLGuide from './components/AVLGuide';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useTreeStore } from './store/treeStore';

function AppContent() {
  useKeyboardNav();
  const { mode } = useTreeStore();
  const [showAVLGuide, setShowAVLGuide] = useState(false);

  return (
    <div
      className="flex flex-col min-h-screen max-h-screen overflow-hidden"
      style={{ backgroundColor: '#0d1117', color: '#e6edf3' }}
    >
      {/* ── Header ── */}
      <Header />

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar (desktop) ── */}
        <aside
          className="hidden lg:flex flex-col w-56 xl:w-64 border-r border-[#21262d] overflow-y-auto flex-shrink-0"
          style={{ backgroundColor: '#0d1117' }}
        >
          <ControlPanel />

          {/* AVL Guide toggle */}
          {mode === 'AVL' && (
            <div className="px-3 pb-3">
              <button
                onClick={() => setShowAVLGuide(!showAVLGuide)}
                className="w-full text-left text-[#8b949e] text-[10px] font-mono py-1 flex items-center gap-1 hover:text-[#e6edf3] transition-colors"
              >
                <span>{showAVLGuide ? '▾' : '▸'}</span>
                AVL Rotations Guide
              </button>
              {showAVLGuide && <AVLGuide />}
            </div>
          )}
        </aside>

        {/* ── Center: Tree Canvas ── */}
        <main className="flex-1 relative overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, #21262d 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.4,
            }}
          />

          {/* Tree canvas */}
          <div className="relative w-full h-full">
            <TreeCanvas />
          </div>

          {/* Step mode overlay (floating) */}
          <StepOverlay />

          {/* Keyboard hints (desktop only, bottom-left) */}
          <div className="hidden lg:flex absolute bottom-3 left-3 gap-3 pointer-events-none">
            <kbd className="bg-[#161b22] border border-[#30363d] text-[#484f58] text-[9px] font-mono px-1.5 py-0.5 rounded">
              scroll to zoom
            </kbd>
            <kbd className="bg-[#161b22] border border-[#30363d] text-[#484f58] text-[9px] font-mono px-1.5 py-0.5 rounded">
              drag to pan
            </kbd>
            <kbd className="bg-[#161b22] border border-[#30363d] text-[#484f58] text-[9px] font-mono px-1.5 py-0.5 rounded">
              → next step
            </kbd>
            <kbd className="bg-[#161b22] border border-[#30363d] text-[#484f58] text-[9px] font-mono px-1.5 py-0.5 rounded">
              Esc stop
            </kbd>
          </div>
        </main>
      </div>

      {/* ── Bottom Info Panel ── */}
      <div
        className="border-t border-[#21262d] flex-shrink-0"
        style={{ minHeight: '120px', maxHeight: '200px', backgroundColor: '#0d1117' }}
      >
        <div className="h-full p-2">
          <InfoPanel />
        </div>
      </div>

      {/* ── Mobile: Floating Controls Button ── */}
      <div className="lg:hidden">
        <MobileControls />
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
