import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================
interface Token {
  type: 'number' | 'operator' | 'paren';
  value: string;
  position: number;
}

interface ASTNode {
  type: 'operator' | 'operand';
  value: string;
  left?: ASTNode;
  right?: ASTNode;
}

interface TreeNode {
  type: 'operator' | 'operand';
  value: string;
  left?: TreeNode;
  right?: TreeNode;
  id: string;
  x: number;
  y: number;
  depth: number;
  width: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

// ============================================
// LEXER - Tokenizes the expression
// ============================================
class Lexer {
  private input: string;
  private position: number = 0;

  constructor(input: string) {
    this.input = input.replace(/\s/g, '');
    this.position = 0;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      const startPos = this.position;

      // Numbers (including decimals)
      if (/\d/.test(char)) {
        let value = '';
        while (this.position < this.input.length && (/\d/.test(this.input[this.position]) || this.input[this.position] === '.')) {
          value += this.input[this.position];
          this.position++;
        }
        // Validate decimal
        if (value.split('.').length > 2) {
          throw new Error(`Invalid number format at position ${startPos}`);
        }
        tokens.push({ type: 'number', value, position: startPos });
        continue;
      }

      // Operators
      if (/[\+\-\*\/]/.test(char)) {
        tokens.push({ type: 'operator', value: char, position: startPos });
        this.position++;
        continue;
      }

      // Parentheses
      if (char === '(' || char === ')') {
        tokens.push({ type: 'paren', value: char, position: startPos });
        this.position++;
        continue;
      }

      // Invalid character
      throw new Error(`Invalid character '${char}' at position ${startPos}`);
    }

    return tokens;
  }
}

// ============================================
// PARSER - Builds AST from tokens
// ============================================
class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ASTNode {
    if (this.tokens.length === 0) {
      throw new Error('Empty expression');
    }
    const result = this.parseExpression();
    if (this.position < this.tokens.length) {
      const token = this.tokens[this.position];
      throw new Error(`Unexpected token '${token.value}' at position ${token.position}`);
    }
    return result;
  }

  private parseExpression(): ASTNode {
    return this.parseAddSub();
  }

  private parseAddSub(): ASTNode {
    let left = this.parseMulDiv();

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position];
      if (token.type === 'operator' && (token.value === '+' || token.value === '-')) {
        this.position++;
        const right = this.parseMulDiv();
        left = {
          type: 'operator',
          value: token.value,
          left,
          right
        };
      } else {
        break;
      }
    }

    return left;
  }

  private parseMulDiv(): ASTNode {
    let left = this.parseFactor();

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position];
      if (token.type === 'operator' && (token.value === '*' || token.value === '/')) {
        this.position++;
        const right = this.parseFactor();
        left = {
          type: 'operator',
          value: token.value,
          left,
          right
        };
      } else {
        break;
      }
    }

    return left;
  }

  private parseFactor(): ASTNode {
    const token = this.tokens[this.position];

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'number') {
      this.position++;
      return {
        type: 'operand',
        value: token.value
      };
    }

    if (token.type === 'paren' && token.value === '(') {
      this.position++;
      const expr = this.parseExpression();
      
      if (this.position >= this.tokens.length || 
          this.tokens[this.position].type !== 'paren' || 
          this.tokens[this.position].value !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      this.position++;
      return expr;
    }

    throw new Error(`Unexpected token '${token.value}' at position ${token.position}`);
  }
}

// ============================================
// TREE LAYOUT ALGORITHM
// ============================================
class TreeLayout {
  private nodeWidth: number = 80;
  private nodeHeight: number = 100;

  layout(ast: ASTNode): TreeNode {
    const treeWithWidths = this.computeWidths(ast, 0);
    return this.assignPositions(treeWithWidths, 0, 0).node;
  }

  private computeWidths(node: ASTNode, depth: number): TreeNode {
    const treeNode: TreeNode = {
      type: node.type,
      value: node.value,
      id: Math.random().toString(36).substr(2, 9),
      x: 0,
      y: depth * this.nodeHeight,
      depth,
      width: this.nodeWidth
    };

    if (node.left && node.right) {
      const left = this.computeWidths(node.left, depth + 1);
      const right = this.computeWidths(node.right, depth + 1);
      treeNode.left = left;
      treeNode.right = right;
      treeNode.width = left.width + right.width + this.nodeWidth;
    }

    return treeNode;
  }

  private assignPositions(node: TreeNode, x: number, depth: number): { node: TreeNode; width: number } {
    const newNode: TreeNode = { ...node, y: depth * this.nodeHeight + 50 };

    if (!node.left || !node.right) {
      newNode.x = x + node.width / 2;
      return { node: newNode, width: node.width };
    }

    const leftWidth = node.left.width;
    const rightWidth = node.right.width;

    const leftResult = this.assignPositions(node.left, x, depth + 1);
    const rightResult = this.assignPositions(node.right, x + leftWidth + this.nodeWidth, depth + 1);

    newNode.left = leftResult.node;
    newNode.right = rightResult.node;
    newNode.x = (leftResult.node.x + rightResult.node.x) / 2;

    return { node: newNode, width: leftWidth + rightWidth + this.nodeWidth };
  }
}

// ============================================
// PARTICLE BACKGROUND COMPONENT
// ============================================
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const colors = ['#00c2ff', '#0066ff', '#7b2fff'];
      particlesRef.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 1.5,
        opacity: 0.2 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      // Draw connections
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#00c2ff';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    const updateParticles = () => {
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
    };

    let lastTime = 0;
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= 16) { // ~60fps
        drawParticles();
        updateParticles();
        lastTime = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas" />;
}

// ============================================
// TREE RENDERER COMPONENT
// ============================================
interface TreeRendererProps {
  tree: TreeNode | null;
  scale: number;
  offsetX: number;
  offsetY: number;
  onNodeHover: (node: TreeNode | null, x: number, y: number) => void;
  onNodeClick: (node: TreeNode) => void;
  highlightedSubtree: string | null;
}

function TreeRenderer({ tree, scale, offsetX, offsetY, onNodeHover, onNodeClick, highlightedSubtree }: TreeRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animatedNodes, setAnimatedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (tree) {
      const nodes = collectNodes(tree);
      setAnimatedNodes(new Set());
      
      nodes.forEach((node, index) => {
        setTimeout(() => {
          setAnimatedNodes(prev => new Set([...prev, node.id]));
        }, index * 150);
      });
    }
  }, [tree]);

  const collectNodes = (node: TreeNode): TreeNode[] => {
    const nodes: TreeNode[] = [node];
    if (node.left) nodes.push(...collectNodes(node.left));
    if (node.right) nodes.push(...collectNodes(node.right));
    return nodes;
  };

  const renderConnections = (node: TreeNode): React.ReactElement[] => {
    const connections: React.ReactElement[] = [];

    if (node.left) {
      const isHighlighted = highlightedSubtree === node.id || highlightedSubtree === node.left.id;
      connections.push(
        <line
          key={`${node.id}-left`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke={isHighlighted ? '#7b2fff' : 'rgba(0, 194, 255, 0.4)'}
          strokeWidth={isHighlighted ? 2.5 : 1.5}
          className="connector-line"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: animatedNodes.has(node.left.id) ? 0 : 200,
            transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s'
          }}
        />
      );
      connections.push(...renderConnections(node.left));
    }

    if (node.right) {
      const isHighlighted = highlightedSubtree === node.id || highlightedSubtree === node.right.id;
      connections.push(
        <line
          key={`${node.id}-right`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke={isHighlighted ? '#7b2fff' : 'rgba(0, 194, 255, 0.4)'}
          strokeWidth={isHighlighted ? 2.5 : 1.5}
          className="connector-line"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: animatedNodes.has(node.right.id) ? 0 : 200,
            transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s'
          }}
        />
      );
      connections.push(...renderConnections(node.right));
    }

    return connections;
  };

  const renderNodes = (node: TreeNode): React.ReactElement[] => {
    const nodes: React.ReactElement[] = [];
    const isOperator = node.type === 'operator';
    const radius = isOperator ? 32 : 28;
    const isAnimated = animatedNodes.has(node.id);
    const isHighlighted = highlightedSubtree === node.id;

    nodes.push(
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        style={{
          opacity: isAnimated ? 1 : 0,
          transform: `translate(${node.x}px, ${node.y}px) scale(${isAnimated ? 1 : 0})`,
          transition: 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => onNodeHover(node, e.clientX, e.clientY)}
        onMouseLeave={() => onNodeHover(null, 0, 0)}
        onClick={() => onNodeClick(node)}
      >
        <circle
          r={radius}
          className={isOperator ? 'node-operator' : 'node-operand'}
          fill={isHighlighted ? 'rgba(123, 47, 255, 0.4)' : isOperator ? 'rgba(0, 102, 255, 0.25)' : 'rgba(0, 194, 255, 0.15)'}
          stroke={isHighlighted ? '#7b2fff' : isOperator ? 'rgba(0, 194, 255, 0.7)' : 'rgba(0, 194, 255, 0.4)'}
          strokeWidth={isOperator ? 2 : 1}
          filter={isHighlighted ? 'drop-shadow(0 0 20px rgba(123, 47, 255, 0.6))' : undefined}
        />
        <text
          y={isOperator ? 1 : 0}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#f0f4ff"
          fontSize={isOperator ? 18 : 16}
          fontWeight={600}
          fontFamily="'Space Grotesk', sans-serif"
          style={{
            textShadow: isOperator ? '0 0 10px rgba(0, 194, 255, 0.8)' : 'none'
          }}
        >
          {node.value}
        </text>
      </g>
    );

    if (node.left) nodes.push(...renderNodes(node.left));
    if (node.right) nodes.push(...renderNodes(node.right));

    return nodes;
  };

  if (!tree) return null;

  const allNodes = collectNodes(tree);
  const minX = Math.min(...allNodes.map(n => n.x)) - 60;
  const maxX = Math.max(...allNodes.map(n => n.x)) + 60;
  const minY = Math.min(...allNodes.map(n => n.y)) - 60;
  const maxY = Math.max(...allNodes.map(n => n.y)) + 60;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {renderConnections(tree)}
      {renderNodes(tree)}
    </svg>
  );
}

// ============================================
// DEVELOPER CARD COMPONENT
// ============================================
function DeveloperCard() {
  return (
    <div className="glass-panel p-6 sticky top-6 overflow-hidden group">
      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            transform: 'translateX(-100%)',
            animation: 'shimmer 3s infinite'
          }}
        />
      </div>

      {/* Gradient border on hover */}
      <div 
        className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #00c2ff, #0066ff, #7b2fff)',
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />

      <div className="text-center relative z-10">
        {/* Avatar */}
        <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #0066ff, #00c2ff)',
            boxShadow: '0 0 30px rgba(0, 194, 255, 0.4)'
          }}
        >
          MA
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Mousa Alawad</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Information Engineering Student
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Third Year
        </p>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
            Connect
          </p>

          <div className="space-y-2">
            <a 
              href="https://github.com/MousaAlawad1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:translate-x-1 group/link"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm truncate">github.com/MousaAlawad1</span>
            </a>

            <a 
              href="https://instagram.com/1mousa_alawad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:translate-x-1 group/link"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-sm truncate">instagram/1mousa_alawad</span>
            </a>

            <a 
              href="https://t.me/Mousa_Alawad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:translate-x-1 group/link"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className="text-sm truncate">t.me/Mousa_Alawad</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  const [expression, setExpression] = useState('');
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [highlightedSubtree, setHighlightedSubtree] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [evaluationSteps, setEvaluationSteps] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Example expressions
  const examples = [
    '(7 + 2) * (3 - 1)',
    '(5 + 3) * (8 - 2) / 4',
    '((10 - 2) * 3) + (6 / 2)',
    '8 * (4 + 2) - 10 / 5',
    '((1 + 2) * (3 + 4)) / 7'
  ];

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!expression.trim()) {
        setIsValid(null);
        return;
      }
      try {
        const lexer = new Lexer(expression);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        parser.parse();
        setIsValid(true);
      } catch {
        setIsValid(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [expression]);

  // Evaluate expression and collect steps
  const evaluateWithSteps = useCallback((node: ASTNode): { value: number; steps: string[] } => {
    if (node.type === 'operand') {
      return { value: parseFloat(node.value), steps: [] };
    }

    const leftResult = evaluateWithSteps(node.left!);
    const rightResult = evaluateWithSteps(node.right!);

    let value: number;
    switch (node.value) {
      case '+': value = leftResult.value + rightResult.value; break;
      case '-': value = leftResult.value - rightResult.value; break;
      case '*': value = leftResult.value * rightResult.value; break;
      case '/': 
        if (rightResult.value === 0) throw new Error('Division by zero');
        value = leftResult.value / rightResult.value; 
        break;
      default: value = 0;
    }

    const step = `(${leftResult.value} ${node.value} ${rightResult.value}) = ${value}`;
    return {
      value,
      steps: [...leftResult.steps, ...rightResult.steps, step]
    };
  }, []);

  const generateTree = useCallback(() => {
    if (!expression.trim()) {
      setError('Please enter an expression');
      return;
    }

    try {
      const lexer = new Lexer(expression);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      const layout = new TreeLayout();
      const treeNode = layout.layout(ast);
      
      setTree(treeNode);
      setError(null);
      
      // Calculate result with steps
      const { value, steps } = evaluateWithSteps(ast);
      setResult(value);
      setEvaluationSteps(steps);
      
      // Reset view
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
      setHighlightedSubtree(null);
    } catch (err: any) {
      setError(err.message || 'Invalid expression');
      setTree(null);
      setResult(null);
      setEvaluationSteps([]);
    }
  }, [expression, evaluateWithSteps]);

  const clearAll = useCallback(() => {
    setExpression('');
    setTree(null);
    setError(null);
    setResult(null);
    setIsValid(null);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setHighlightedSubtree(null);
    setEvaluationSteps([]);
  }, []);

  const exportPNG = useCallback(() => {
    if (!canvasRef.current || !tree) return;
    
    const svg = canvasRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = '#070f1f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = `expression-tree-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [tree]);

  // Canvas interactions
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.3, Math.min(3, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  }, [offsetX, offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setOffsetX(e.clientX - dragStart.x);
      setOffsetY(e.clientY - dragStart.y);
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleNodeHover = useCallback((node: TreeNode | null, x: number, y: number) => {
    setHoveredNode(node);
    setTooltipPos({ x, y });
  }, []);

  const handleNodeClick = useCallback((node: TreeNode) => {
    setHighlightedSubtree(prev => prev === node.id ? null : node.id);
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        generateTree();
      } else if (e.key === 'Escape') {
        clearAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateTree, clearAll]);

  const inputBorderColor = useMemo(() => {
    if (isValid === null) return 'rgba(0, 194, 255, 0.3)';
    return isValid ? 'var(--success)' : 'var(--error)';
  }, [isValid]);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-void)' }}>
      <ParticleBackground />
      
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="glass-panel px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,194,255,0.2), rgba(0,102,255,0.2))',
                  border: '1px solid rgba(0,194,255,0.3)'
                }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--glow-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="3"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <circle cx="6" cy="18" r="3"/>
                  <line x1="6" y1="15" x2="9" y2="12"/>
                  <circle cx="18" cy="18" r="3"/>
                  <line x1="18" y1="15" x2="15" y2="12"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold gradient-text">Expression Tree Visualizer</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Binary Tree Parser & Visualizer
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(0,194,255,0.1)',
                border: '1px solid rgba(0,194,255,0.2)',
                color: 'var(--glow-primary)'
              }}
            >
              v1.0
            </span>
          </div>
          {/* Gradient border bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,194,255,0.3), transparent)'
            }}
          />
        </header>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Input Panel */}
            <div className="glass-panel p-6 mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Expression Input
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="Enter expression like: (7 + 2) * (3 - 1)"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 text-white font-mono text-lg transition-all duration-200 outline-none input-glow"
                  style={{
                    border: `2px solid ${inputBorderColor}`,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {expression.length} chars
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm animate-fade-in-up" style={{ color: 'var(--error)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Operator Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['+', '-', '*', '/', '(', ')'].map(op => (
                  <span
                    key={op}
                    className="px-3 py-1 rounded-lg text-sm font-mono"
                    style={{
                      background: 'rgba(0,194,255,0.1)',
                      border: '1px solid rgba(0,194,255,0.2)',
                      color: 'var(--glow-primary)',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    {op}
                  </span>
                ))}
              </div>

              {/* Example Expressions */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Try these examples:
                </p>
                <div className="flex flex-wrap gap-2">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setExpression(ex)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono hover:bg-white/10 transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={generateTree}
                  className="btn-glass-filled px-6 py-2.5 rounded-xl font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Generate Tree
                </button>
                <button
                  onClick={clearAll}
                  className="btn-glass-outline px-6 py-2.5 rounded-xl font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Clear
                </button>
                <button
                  onClick={exportPNG}
                  disabled={!tree}
                  className="btn-glass-outline px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Export PNG
                </button>
              </div>
            </div>

            {/* Visualization Canvas */}
            <div className="glass-panel p-1 mb-6 overflow-hidden">
              <div
                ref={canvasRef}
                className="relative w-full rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
                style={{
                  background: 'var(--bg-deep)',
                  minHeight: tree ? '500px' : '300px',
                  backgroundImage: 'radial-gradient(rgba(0,194,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {tree ? (
                  <TreeRenderer
                    tree={tree}
                    scale={scale}
                    offsetX={offsetX}
                    offsetY={offsetY}
                    onNodeHover={handleNodeHover}
                    onNodeClick={handleNodeClick}
                    highlightedSubtree={highlightedSubtree}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'rgba(0,194,255,0.1)',
                          border: '1px solid rgba(0,194,255,0.2)'
                        }}
                      >
                        <svg className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Enter an expression and click Generate Tree
                      </p>
                    </div>
                  </div>
                )}

                {/* Zoom Controls */}
                {tree && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 glass-panel px-3 py-2">
                    <button
                      onClick={() => setScale(s => Math.max(0.3, s - 0.2))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      −
                    </button>
                    <span className="text-sm font-mono w-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale(s => Math.min(3, s + 0.2))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      +
                    </button>
                    <button
                      onClick={resetView}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors ml-1"
                      style={{ color: 'var(--text-secondary)' }}
                      title="Reset View"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Result Card */}
            {result !== null && (
              <div 
                className="glass-panel p-6 animate-fade-in-up glow-violet"
                style={{ borderColor: 'rgba(123, 47, 255, 0.3)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'rgba(123, 47, 255, 0.2)',
                      border: '1px solid rgba(123, 47, 255, 0.3)'
                    }}
                  >
                    <span className="text-lg font-bold" style={{ color: 'var(--glow-accent)' }}>=</span>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Expression Result</p>
                    <p className="text-3xl font-bold" style={{ 
                      color: 'var(--glow-primary)',
                      textShadow: '0 0 20px rgba(0, 194, 255, 0.5)'
                    }}>
                      {Number.isInteger(result) ? result : result.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Evaluation Steps */}
                {evaluationSteps.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <button
                      onClick={() => setShowSteps(!showSteps)}
                      className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${showSteps ? 'rotate-90' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                      Evaluation Steps
                    </button>
                    
                    {showSteps && (
                      <div className="mt-3 space-y-2 animate-fade-in-up">
                        {evaluationSteps.map((step, i) => (
                          <div 
                            key={i}
                            className="px-3 py-2 rounded-lg text-sm font-mono"
                            style={{
                              background: 'rgba(0,194,255,0.05)',
                              border: '1px solid rgba(0,194,255,0.1)',
                              color: 'var(--text-primary)',
                              fontFamily: "'JetBrains Mono', monospace"
                            }}
                          >
                            {step}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 sidebar">
            <DeveloperCard />
          </aside>
        </div>
      </div>

      {/* Node Tooltip */}
      {hoveredNode && (
        <div 
          className="fixed z-50 glass-panel px-4 py-3 pointer-events-none"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Value:</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--glow-primary)' }}>
                {hoveredNode.value}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
              <span className="capitalize" style={{ color: 'var(--text-primary)' }}>
                {hoveredNode.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--text-secondary)' }}>Depth:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {hoveredNode.depth}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
