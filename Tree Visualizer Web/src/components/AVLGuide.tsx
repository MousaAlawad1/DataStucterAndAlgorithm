import React, { useState } from 'react';

const rotations = [
  {
    type: 'LL',
    name: 'Right Rotate (LL)',
    color: '#f78166',
    desc: 'Left-Left case: balance factor > 1 and left child is left-heavy.',
    before: '     z\n    /\n   y\n  /\n x',
    after: '   y\n  / \\\n x   z',
  },
  {
    type: 'RR',
    name: 'Left Rotate (RR)',
    color: '#58a6ff',
    desc: 'Right-Right case: balance factor < -1 and right child is right-heavy.',
    before: 'x\n \\\n  y\n   \\\n    z',
    after: '   y\n  / \\\n x   z',
  },
  {
    type: 'LR',
    name: 'Left-Right Rotate',
    color: '#bc8cff',
    desc: 'Left-Right case: rotate left on left child, then right on root.',
    before: '   z\n  /\n x\n  \\\n   y',
    after: '   y\n  / \\\n x   z',
  },
  {
    type: 'RL',
    name: 'Right-Left Rotate',
    color: '#3fb950',
    desc: 'Right-Left case: rotate right on right child, then left on root.',
    before: 'x\n \\\n  z\n /\ny',
    after: '   y\n  / \\\n x   z',
  },
];

const AVLGuide: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3">
      <div className="text-[#8b949e] text-[10px] font-mono mb-2 uppercase tracking-wider">
        AVL Rotations Guide
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {rotations.map(r => (
          <button
            key={r.type}
            onClick={() => setExpanded(expanded === r.type ? null : r.type)}
            className="text-left p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: expanded === r.type ? `${r.color}10` : '#0d1117',
              borderColor: expanded === r.type ? `${r.color}40` : '#30363d',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-xs font-mono font-bold" style={{ color: r.color }}>
                {r.type}
              </span>
            </div>
            <div className="text-[#8b949e] text-[10px] font-mono">{r.name}</div>

            {expanded === r.type && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: `${r.color}20` }}>
                <p className="text-[#e6edf3] text-[10px] font-mono mb-2">{r.desc}</p>
                <div className="flex items-center gap-2">
                  <pre className="text-[#8b949e] text-[9px] font-mono leading-tight">{r.before}</pre>
                  <span className="text-[#388bfd] text-xs">→</span>
                  <pre className="text-[#3fb950] text-[9px] font-mono leading-tight">{r.after}</pre>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AVLGuide;
