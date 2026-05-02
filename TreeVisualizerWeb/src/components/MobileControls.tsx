import React, { useState } from 'react';
import { useTreeStore } from '../store/treeStore';
import ControlPanel from './ControlPanel';

const MobileControls: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { isAnimating } = useTreeStore();

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-30 w-14 h-14 rounded-full bg-[#1f6feb] hover:bg-[#388bfd] text-white shadow-2xl shadow-[#1f6feb]/40 flex items-center justify-center transition-all active:scale-95"
      >
        {isAnimating ? (
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Drawer overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1117] border-t border-[#30363d] rounded-t-2xl max-h-[80vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#30363d]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d]">
              <span className="text-[#e6edf3] font-mono font-bold text-sm">Controls</span>
              <button
                onClick={() => setOpen(false)}
                className="text-[#8b949e] hover:text-[#e6edf3] text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Control panel content */}
            <div className="h-[60vh]">
              <ControlPanel />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileControls;
