import React from 'react';
import { useTreeStore } from '../store/treeStore';

const rotationColors: Record<string, string> = {
  LL: '#f78166',
  RR: '#58a6ff',
  LR: '#bc8cff',
  RL: '#3fb950',
};

const StepOverlay: React.FC = () => {
  const {
    stepMode,
    isAnimating,
    animationSteps,
    currentStepIndex,
    nextStep,
    stopAnimation,
  } = useTreeStore();

  if (!stepMode || !isAnimating) return null;

  const currentStep = animationSteps[currentStepIndex];
  const progress = animationSteps.length > 0
    ? ((currentStepIndex + 1) / animationSteps.length) * 100
    : 0;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[min(380px,90vw)]">
      <div className="bg-[#161b22]/95 backdrop-blur border border-[#388bfd]/40 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Progress bar */}
        <div className="h-0.5 bg-[#21262d]">
          <div
            className="h-full bg-gradient-to-r from-[#1f6feb] to-[#388bfd] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f78166] animate-pulse" />
              <span className="text-[#8b949e] text-[10px] font-mono uppercase tracking-wider">
                Step Mode
              </span>
            </div>
            <span className="text-[#8b949e] text-[10px] font-mono">
              {currentStepIndex + 1} / {animationSteps.length}
            </span>
          </div>

          {/* Current step message */}
          {currentStep ? (
            <div className="mb-3">
              <p className="text-[#e6edf3] text-sm font-mono leading-relaxed">
                {currentStep.message}
              </p>
              {currentStep.rotation && (
                <div
                  className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-bold"
                  style={{
                    backgroundColor: `${rotationColors[currentStep.rotation]}15`,
                    color: rotationColors[currentStep.rotation],
                    border: `1px solid ${rotationColors[currentStep.rotation]}30`,
                  }}
                >
                  <span>⟳</span>
                  <span>{currentStep.rotation} Rotation</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#484f58] text-sm font-mono mb-3">
              Press "Next Step" to begin...
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={nextStep}
              disabled={currentStepIndex >= animationSteps.length - 1}
              className="flex-1 py-2 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#484f58] text-white text-xs font-mono font-semibold rounded-lg transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              {currentStepIndex >= animationSteps.length - 1 ? '✓ Done' : '▶ Next Step'}
            </button>
            <button
              onClick={stopAnimation}
              className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] text-xs font-mono rounded-lg transition-all active:scale-95"
            >
              ⏹
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOverlay;
