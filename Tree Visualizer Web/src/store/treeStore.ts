import { create } from 'zustand';
import { TreeNode } from '../core/TreeNode';
import { BST, TraversalStep } from '../core/BST';
import { AVLTree, AVLStep, generateRandomBST, generateRandomAVL } from '../core/AVL';
import { cloneNode } from '../core/BST';

export type TreeMode = 'BST' | 'AVL';
export type OperationType =
  | 'idle'
  | 'insert'
  | 'delete'
  | 'search'
  | 'inorder'
  | 'preorder'
  | 'postorder'
  | 'avl_convert';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export type NodeState = 'default' | 'active' | 'found' | 'balanced' | 'unbalanced' | 'visited';

export interface AnimationStep {
  nodeId: string;
  nodeState: NodeState;
  message: string;
  traversalOrder?: number[];
  rotation?: string;
}

export interface TreeStoreState {
  // Tree data
  root: TreeNode | null;
  mode: TreeMode;

  // Animation
  animationSteps: AnimationStep[];
  currentStepIndex: number;
  isAnimating: boolean;
  isPaused: boolean;
  animationSpeed: AnimationSpeed;
  stepMode: boolean;

  // Node highlights
  highlightedNodes: Map<string, NodeState>;
  traversalOutput: number[];
  operationLog: string[];

  // Current operation
  currentOperation: OperationType;
  searchValue: number | null;
  foundNodeId: string | null;

  // Actions
  setMode: (mode: TreeMode) => void;
  insertNode: (value: number) => void;
  deleteNode: (value: number) => void;
  searchNode: (value: number) => void;
  runInorder: () => void;
  runPreorder: () => void;
  runPostorder: () => void;
  convertToAVL: () => void;
  resetTree: () => void;
  generateRandom: () => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  toggleStepMode: () => void;
  nextStep: () => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  stopAnimation: () => void;
  setHighlightedNodes: (nodes: Map<string, NodeState>) => void;
  clearHighlights: () => void;
  addLog: (message: string) => void;
  clearLog: () => void;
}

function speedToMs(speed: AnimationSpeed): number {
  switch (speed) {
    case 'slow': return 1200;
    case 'normal': return 600;
    case 'fast': return 200;
  }
}

function stepsToAnimationSteps(steps: (TraversalStep | AVLStep)[]): AnimationStep[] {
  return steps.map(step => {
    let nodeState: NodeState = 'active';
    if (step.type === 'found') nodeState = 'found';
    else if (step.type === 'visit') nodeState = 'visited';
    else if (step.type === 'not_found') nodeState = 'default';
    else if (step.type === 'insert') nodeState = 'found';
    else if (step.type === 'compare') nodeState = 'active';
    else if (step.type === 'go_left' || step.type === 'go_right') nodeState = 'active';

    const avlStep = step as AVLStep;
    return {
      nodeId: step.nodeId,
      nodeState,
      message: step.message,
      rotation: avlStep.rotation,
    };
  });
}

export const useTreeStore = create<TreeStoreState>((set, get) => ({
  root: null,
  mode: 'BST',
  animationSteps: [],
  currentStepIndex: -1,
  isAnimating: false,
  isPaused: false,
  animationSpeed: 'normal',
  stepMode: false,
  highlightedNodes: new Map(),
  traversalOutput: [],
  operationLog: [],
  currentOperation: 'idle',
  searchValue: null,
  foundNodeId: null,

  setMode: (mode) => {
    const { root } = get();
    let newRoot = root;

    if (mode === 'AVL' && root) {
      // Re-balance the existing tree as AVL
      const avl = new AVLTree();
      function collectValues(node: TreeNode | null) {
        if (!node) return;
        collectValues(node.left);
        avl.insert(node.value);
        collectValues(node.right);
      }
      collectValues(root);
      newRoot = avl.root;
    }

    set({ mode, root: newRoot, highlightedNodes: new Map(), traversalOutput: [], operationLog: [] });
  },

  insertNode: (value) => {
    const { mode, root, stepMode, animationSpeed, isAnimating } = get();
    if (isAnimating && !stepMode) return;

    get().stopAnimation();

    let result: { root: TreeNode | null; steps: (TraversalStep | AVLStep)[] };

    if (mode === 'AVL') {
      const avl = new AVLTree();
      avl.root = cloneNode(root);
      result = avl.insert(value);
    } else {
      const bst = new BST();
      bst.root = cloneNode(root);
      result = bst.insert(value);
    }

    const animSteps = stepsToAnimationSteps(result.steps);

    set({
      root: result.root,
      animationSteps: animSteps,
      currentStepIndex: -1,
      isAnimating: true,
      isPaused: stepMode,
      currentOperation: 'insert',
      traversalOutput: [],
    });

    if (!stepMode) {
      runAnimation(get, set, animSteps, speedToMs(animationSpeed));
    }
  },

  deleteNode: (value) => {
    const { mode, root, stepMode, animationSpeed, isAnimating } = get();
    if (isAnimating && !stepMode) return;

    get().stopAnimation();

    let result: { root: TreeNode | null; steps: (TraversalStep | AVLStep)[] };

    if (mode === 'AVL') {
      const avl = new AVLTree();
      avl.root = cloneNode(root);
      result = avl.delete(value);
    } else {
      const bst = new BST();
      bst.root = cloneNode(root);
      result = bst.delete(value);
    }

    const animSteps = stepsToAnimationSteps(result.steps);

    set({
      root: result.root,
      animationSteps: animSteps,
      currentStepIndex: -1,
      isAnimating: true,
      isPaused: stepMode,
      currentOperation: 'delete',
      traversalOutput: [],
    });

    if (!stepMode) {
      runAnimation(get, set, animSteps, speedToMs(animationSpeed));
    }
  },

  searchNode: (value) => {
    const { mode, root, stepMode, animationSpeed, isAnimating } = get();
    if (isAnimating && !stepMode) return;

    get().stopAnimation();

    let result: { found: boolean; steps: (TraversalStep | AVLStep)[] };

    if (mode === 'AVL') {
      const avl = new AVLTree();
      avl.root = cloneNode(root);
      result = avl.search(value);
    } else {
      const bst = new BST();
      bst.root = cloneNode(root);
      result = bst.search(value);
    }

    const animSteps = stepsToAnimationSteps(result.steps);

    set({
      searchValue: value,
      animationSteps: animSteps,
      currentStepIndex: -1,
      isAnimating: true,
      isPaused: stepMode,
      currentOperation: 'search',
      traversalOutput: [],
    });

    if (!stepMode) {
      runAnimation(get, set, animSteps, speedToMs(animationSpeed));
    }
  },

  runInorder: () => {
    const { mode, root, stepMode, animationSpeed, isAnimating } = get();
    if (isAnimating && !stepMode) return;

    get().stopAnimation();

    let result: { order: number[]; steps: TraversalStep[] };

    if (mode === 'AVL') {
      const avl = new AVLTree();
      avl.root = cloneNode(root);
      result = avl.inorder();
    } else {
      const bst = new BST();
      bst.root = cloneNode(root);
      result = bst.inorder();
    }

    const animSteps = stepsToAnimationSteps(result.steps).map((s, i) => ({
      ...s,
      traversalOrder: result.order.slice(0, i + 1),
    }));

    set({
      animationSteps: animSteps,
      currentStepIndex: -1,
      isAnimating: true,
      isPaused: stepMode,
      currentOperation: 'inorder',
      traversalOutput: [],
    });

    if (!stepMode) {
      runAnimation(get, set, animSteps, speedToMs(animationSpeed));
    }
  },

  runPreorder: () => {
    const { mode, root, stepMode, animationSpeed, isAnimating } = get();
    if (isAnimating && !stepMode) return;

    get().stopAnimation();

    let result: { order: number[]; steps: TraversalStep[] };

    if (mode === 'AVL') {
      const avl = new AVLTree();
      avl.root = cloneNode(root);
      result = avl.preorder();
    } else {
      const bst = new BST();
      bst.root = cloneNode(root);
      result = bst.preorder();
    }

    const animSteps = stepsToAnimationSteps(result.steps).map((s, i) => ({
      ...s,
      traversalOrder: result.order.slice(0, i + 1),
    }));

    set({
      animationSteps: animSteps,
      currentStepIndex: -1,
      isAnimating: true,
      isPaused: stepMode,
      currentOperation: 'preorder',
      traversalOutput: [],
    });

    if (!stepMode) {
      runAnimation(get, set, animSteps, speedToMs(animationSpeed));
    }
  },

  runPostorder: () => {
    const { mode, root, stepMode, animationSpeed, isAnimating } = get();
    if (isAnimating && !stepMode) return;

    get().stopAnimation();

    let result: { order: number[]; steps: TraversalStep[] };

    if (mode === 'AVL') {
      const avl = new AVLTree();
      avl.root = cloneNode(root);
      result = avl.postorder();
    } else {
      const bst = new BST();
      bst.root = cloneNode(root);
      result = bst.postorder();
    }

    const animSteps = stepsToAnimationSteps(result.steps).map((s, i) => ({
      ...s,
      traversalOrder: result.order.slice(0, i + 1),
    }));

    set({
      animationSteps: animSteps,
      currentStepIndex: -1,
      isAnimating: true,
      isPaused: stepMode,
      currentOperation: 'postorder',
      traversalOutput: [],
    });

    if (!stepMode) {
      runAnimation(get, set, animSteps, speedToMs(animationSpeed));
    }
  },

  convertToAVL: () => {
    const { root, stepMode, animationSpeed, isAnimating } = get();
    if (isAnimating && !stepMode) return;

    get().stopAnimation();

    const result = AVLTree.fromBST(root);
    const animSteps = stepsToAnimationSteps(result.steps);

    set({
      root: result.root,
      mode: 'AVL',
      animationSteps: animSteps,
      currentStepIndex: -1,
      isAnimating: true,
      isPaused: stepMode,
      currentOperation: 'avl_convert',
      traversalOutput: [],
    });

    if (!stepMode) {
      runAnimation(get, set, animSteps, speedToMs(animationSpeed));
    }
  },

  resetTree: () => {
    get().stopAnimation();
    set({
      root: null,
      animationSteps: [],
      currentStepIndex: -1,
      isAnimating: false,
      isPaused: false,
      highlightedNodes: new Map(),
      traversalOutput: [],
      operationLog: [],
      currentOperation: 'idle',
      searchValue: null,
      foundNodeId: null,
    });
  },

  generateRandom: () => {
    const { mode } = get();
    get().stopAnimation();
    const root = mode === 'AVL' ? generateRandomAVL(9) : generateRandomBST(9);
    set({
      root,
      animationSteps: [],
      currentStepIndex: -1,
      isAnimating: false,
      isPaused: false,
      highlightedNodes: new Map(),
      traversalOutput: [],
      operationLog: [`Generated random ${mode} tree`],
      currentOperation: 'idle',
    });
  },

  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  toggleStepMode: () => {
    const { stepMode, isAnimating } = get();
    if (isAnimating) get().stopAnimation();
    set({ stepMode: !stepMode });
  },

  nextStep: () => {
    const { animationSteps, currentStepIndex } = get();
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= animationSteps.length) {
      set({ isAnimating: false, isPaused: false, currentStepIndex: animationSteps.length - 1 });
      return;
    }

    const step = animationSteps[nextIdx];
    const newHighlights = new Map<string, NodeState>();
    if (step.nodeId) newHighlights.set(step.nodeId, step.nodeState);

    set({
      currentStepIndex: nextIdx,
      highlightedNodes: newHighlights,
      traversalOutput: step.traversalOrder || get().traversalOutput,
      operationLog: [step.message, ...get().operationLog].slice(0, 50),
      isAnimating: nextIdx < animationSteps.length,
    });
  },

  pauseAnimation: () => set({ isPaused: true }),
  resumeAnimation: () => {
    const { animationSteps, currentStepIndex, animationSpeed } = get();
    set({ isPaused: false });
    runAnimation(get, set, animationSteps, speedToMs(animationSpeed), currentStepIndex + 1);
  },

  stopAnimation: () => {
    set({
      isAnimating: false,
      isPaused: false,
      animationSteps: [],
      currentStepIndex: -1,
      highlightedNodes: new Map(),
    });
  },

  setHighlightedNodes: (nodes) => set({ highlightedNodes: nodes }),
  clearHighlights: () => set({ highlightedNodes: new Map() }),

  addLog: (message) =>
    set(state => ({ operationLog: [message, ...state.operationLog].slice(0, 50) })),

  clearLog: () => set({ operationLog: [] }),
}));

// Animation runner
let animationTimer: ReturnType<typeof setTimeout> | null = null;

function runAnimation(
  get: () => TreeStoreState,
  set: (state: Partial<TreeStoreState>) => void,
  steps: AnimationStep[],
  delayMs: number,
  startIndex: number = 0
) {
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }

  let idx = startIndex;

  function tick() {
    const state = get();
    if (!state.isAnimating || state.isPaused || idx >= steps.length) {
      if (idx >= steps.length) {
        set({ isAnimating: false, currentStepIndex: idx - 1 });
      }
      return;
    }

    const step = steps[idx];
    const newHighlights = new Map<string, NodeState>();
    if (step.nodeId) newHighlights.set(step.nodeId, step.nodeState);

    // Also keep previously visited nodes as 'visited' color
    const prevHighlights = state.highlightedNodes;
    prevHighlights.forEach((val, key) => {
      if (!newHighlights.has(key) && val !== 'default') {
        newHighlights.set(key, 'visited');
      }
    });

    set({
      currentStepIndex: idx,
      highlightedNodes: new Map(newHighlights),
      traversalOutput: step.traversalOrder || state.traversalOutput,
      operationLog: [step.message, ...state.operationLog].slice(0, 50),
    });

    idx++;
    animationTimer = setTimeout(tick, delayMs);
  }

  tick();
}
