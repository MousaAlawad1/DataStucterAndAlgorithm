import React from 'react';
import { useTreeStore } from '../store/treeStore';

const rotationColors: Record<string, string> = {
  LL: '#f78166',
  RR: '#58a6ff',
  LR: '#bc8cff',
  RL: '#3fb950',
};

const InfoPanel: React.FC = () => {
  const {
    traversalOutput,
    operationLog,
    currentOperation,
    animationSteps,
    currentStepIndex,
    isAnimating,
    mode,
    clearLog,
    root,
  } = useTreeStore();

  const currentStep = animationSteps[currentStepIndex];

  // Count nodes
  function countNodes(node: any): number {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  function treeHeight(node: any): number {
    if (!node) return 0;
    return node.height || 1;
  }

  const nodeCount = countNodes(root);
  const treeH = treeHeight(root);

  const operationLabel: Record<string, string> = {
    idle: 'Idle',
    insert: '➕ Insert',
    delete: '➖ Delete',
    search: '🔍 Search',
    inorder: '📋 Inorder',
    preorder: '📋 Preorder',
    postorder: '📋 Postorder',
    avl_convert: '⚖️ AVL Convert',
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2 h-full overflow-hidden">
      {/* Stats */}
      <div className="flex gap-2 flex-wrap lg:flex-col lg:w-40 lg:flex-shrink-0">
        <div className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 flex-1 min-w-[80px]">
          <div className="text-[#8b949e] text-[10px] font-mono">NODES</div>
          <div className="text-[#e6edf3] text-xl font-mono font-bold">{nodeCount}</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 flex-1 min-w-[80px]">
          <div className="text-[#8b949e] text-[10px] font-mono">HEIGHT</div>
          <div className="text-[#e6edf3] text-xl font-mono font-bold">{treeH}</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 flex-1 min-w-[80px]">
          <div className="text-[#8b949e] text-[10px] font-mono">MODE</div>
          <div className={`text-xl font-mono font-bold ${mode === 'AVL' ? 'text-[#3fb950]' : 'text-[#1f6feb]'}`}>
            {mode}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 flex-1 min-w-[80px]">
          <div className="text-[#8b949e] text-[10px] font-mono">STEP</div>
          <div className="text-[#e6edf3] text-xl font-mono font-bold">
            {currentStepIndex >= 0 ? `${currentStepIndex + 1}/${animationSteps.length}` : '—'}
          </div>
        </div>
      </div>

      {/* Current Step Info */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
        {/* Current step highlight */}
        {currentStep && isAnimating && (
          <div className="bg-[#161b22] border border-[#388bfd]/40 rounded-md px-3 py-2 flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-[#f78166] mt-1 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[#8b949e] text-[10px] font-mono mb-0.5">CURRENT STEP</div>
              <div className="text-[#e6edf3] text-sm font-mono">{currentStep.message}</div>
              {currentStep.rotation && (
                <div
                  className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-mono font-bold"
                  style={{
                    backgroundColor: `${rotationColors[currentStep.rotation]}20`,
                    color: rotationColors[currentStep.rotation],
                    border: `1px solid ${rotationColors[currentStep.rotation]}40`,
                  }}
                >
                  {currentStep.rotation} Rotation
                </div>
              )}
            </div>
          </div>
        )}

        {/* Traversal Output */}
        {traversalOutput.length > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2">
            <div className="text-[#8b949e] text-[10px] font-mono mb-1">
              {operationLabel[currentOperation] || 'TRAVERSAL'} OUTPUT
            </div>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
              {traversalOutput.map((val, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-xs font-mono font-bold transition-all"
                  style={{
                    backgroundColor: '#1f6feb20',
                    color: '#58a6ff',
                    border: '1px solid #1f6feb40',
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Operation Log */}
        <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#21262d]">
            <span className="text-[#8b949e] text-[10px] font-mono">OPERATION LOG</span>
            <button
              onClick={clearLog}
              className="text-[#484f58] hover:text-[#e6edf3] text-[10px] font-mono transition-colors"
            >
              clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {operationLog.length === 0 ? (
              <div className="text-[#484f58] text-xs font-mono p-1">No operations yet...</div>
            ) : (
              operationLog.map((log, i) => (
                <div
                  key={i}
                  className="text-xs font-mono py-0.5 px-1 rounded"
                  style={{
                    color: i === 0 ? '#e6edf3' : '#8b949e',
                    backgroundColor: i === 0 ? '#161b22' : 'transparent',
                  }}
                >
                  <span className="text-[#484f58] mr-1">{operationLog.length - i}.</span>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="lg:w-32 flex-shrink-0">
        <div className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2">
          <div className="text-[#8b949e] text-[10px] font-mono mb-2">LEGEND</div>
          <div className="space-y-1.5">
            {[
              { color: '#1f6feb', label: 'Default' },
              { color: '#f78166', label: 'Active' },
              { color: '#58a6ff', label: 'Found' },
              { color: '#bc8cff', label: 'Visited' },
              { color: '#3fb950', label: 'Balanced' },
              { color: '#f85149', label: 'Unbalanced' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[#8b949e] text-[10px] font-mono">{label}</span>
              </div>
            ))}
          </div>

          {mode === 'AVL' && (
            <>
              <div className="text-[#8b949e] text-[10px] font-mono mt-3 mb-2">ROTATIONS</div>
              <div className="space-y-1">
                {Object.entries(rotationColors).map(([rot, color]) => (
                  <div key={rot} className="flex items-center gap-2">
                    <div className="w-3 h-2 rounded flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-mono" style={{ color }}>{rot}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
