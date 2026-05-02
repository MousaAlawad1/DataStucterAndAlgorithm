import { TreeNode } from './TreeNode';
import { BST, TraversalStep, height, updateHeight, updateBalanceFactor, updateAllMetadata, cloneNode } from './BST';

export type RotationType = 'LL' | 'RR' | 'LR' | 'RL';

export type AVLStep = TraversalStep & {
  rotation?: RotationType;
  balanceFactor?: number;
};

function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateBalanceFactor(y);
  updateHeight(x);
  updateBalanceFactor(x);
  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateBalanceFactor(x);
  updateHeight(y);
  updateBalanceFactor(y);
  return y;
}

function balance(node: TreeNode, steps: AVLStep[]): TreeNode {
  updateHeight(node);
  const bf = height(node.left) - height(node.right);
  node.balanceFactor = bf;

  // LL Case
  if (bf > 1 && (node.left ? height(node.left.left) >= height(node.left.right) : false)) {
    steps.push({
      type: 'visit',
      nodeId: node.id,
      value: node.value,
      rotation: 'LL',
      balanceFactor: bf,
      message: `LL Rotation at node ${node.value} (BF=${bf > 0 ? '+' : ''}${bf})`,
    });
    return rotateRight(node);
  }

  // LR Case
  if (bf > 1 && node.left) {
    steps.push({
      type: 'visit',
      nodeId: node.id,
      value: node.value,
      rotation: 'LR',
      balanceFactor: bf,
      message: `LR Rotation at node ${node.value} (BF=${bf > 0 ? '+' : ''}${bf})`,
    });
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }

  // RR Case
  if (bf < -1 && (node.right ? height(node.right.right) >= height(node.right.left) : false)) {
    steps.push({
      type: 'visit',
      nodeId: node.id,
      value: node.value,
      rotation: 'RR',
      balanceFactor: bf,
      message: `RR Rotation at node ${node.value} (BF=${bf > 0 ? '+' : ''}${bf})`,
    });
    return rotateLeft(node);
  }

  // RL Case
  if (bf < -1 && node.right) {
    steps.push({
      type: 'visit',
      nodeId: node.id,
      value: node.value,
      rotation: 'RL',
      balanceFactor: bf,
      message: `RL Rotation at node ${node.value} (BF=${bf > 0 ? '+' : ''}${bf})`,
    });
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }

  return node;
}

export class AVLTree extends BST {
  insert(value: number): { root: TreeNode | null; steps: AVLStep[] } {
    const steps: AVLStep[] = [];
    this.root = this._avlInsert(this.root, value, steps);
    updateAllMetadata(this.root);
    return { root: this.root, steps };
  }

  private _avlInsert(
    node: TreeNode | null,
    value: number,
    steps: AVLStep[]
  ): TreeNode {
    if (!node) {
      const newNode = new TreeNode(value);
      steps.push({
        type: 'insert',
        nodeId: newNode.id,
        value,
        message: `Inserted node with value ${value}`,
      });
      return newNode;
    }

    steps.push({
      type: 'compare',
      nodeId: node.id,
      value: node.value,
      message: `Comparing ${value} with ${node.value}`,
    });

    if (value < node.value) {
      steps.push({
        type: 'go_left',
        nodeId: node.id,
        value: node.value,
        message: `${value} < ${node.value}, going left`,
      });
      node.left = this._avlInsert(node.left, value, steps);
    } else if (value > node.value) {
      steps.push({
        type: 'go_right',
        nodeId: node.id,
        value: node.value,
        message: `${value} > ${node.value}, going right`,
      });
      node.right = this._avlInsert(node.right, value, steps);
    } else {
      steps.push({
        type: 'found',
        nodeId: node.id,
        value: node.value,
        message: `Value ${value} already exists`,
      });
      return node;
    }

    return balance(node, steps);
  }

  delete(value: number): { root: TreeNode | null; steps: AVLStep[] } {
    const steps: AVLStep[] = [];
    this.root = this._avlDelete(this.root, value, steps);
    if (this.root) updateAllMetadata(this.root);
    return { root: this.root, steps };
  }

  private _avlDelete(
    node: TreeNode | null,
    value: number,
    steps: AVLStep[]
  ): TreeNode | null {
    if (!node) {
      steps.push({
        type: 'not_found',
        nodeId: '',
        value,
        message: `Value ${value} not found`,
      });
      return null;
    }

    steps.push({
      type: 'compare',
      nodeId: node.id,
      value: node.value,
      message: `Comparing ${value} with ${node.value}`,
    });

    if (value < node.value) {
      steps.push({ type: 'go_left', nodeId: node.id, value: node.value, message: `${value} < ${node.value}, going left` });
      node.left = this._avlDelete(node.left, value, steps);
    } else if (value > node.value) {
      steps.push({ type: 'go_right', nodeId: node.id, value: node.value, message: `${value} > ${node.value}, going right` });
      node.right = this._avlDelete(node.right, value, steps);
    } else {
      steps.push({ type: 'found', nodeId: node.id, value: node.value, message: `Found ${value}, deleting...` });
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      let successor = node.right;
      while (successor.left) successor = successor.left;
      steps.push({ type: 'visit', nodeId: successor.id, value: successor.value, message: `Inorder successor: ${successor.value}` });
      node.value = successor.value;
      node.id = `node-${node.value}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      node.right = this._avlDelete(node.right, successor.value, steps);
    }

    return balance(node, steps);
  }

  /** Convert a BST root into a balanced AVL tree, returning steps */
  static fromBST(bstRoot: TreeNode | null): { root: TreeNode | null; steps: AVLStep[] } {
    const steps: AVLStep[] = [];
    const avl = new AVLTree();

    // Collect values in inorder (sorted)
    const values: number[] = [];
    function collect(node: TreeNode | null) {
      if (!node) return;
      collect(node.left);
      values.push(node.value);
      collect(node.right);
    }
    collect(bstRoot);

    steps.push({
      type: 'visit',
      nodeId: '',
      value: 0,
      message: `Converting BST to AVL. Inserting ${values.length} values in order...`,
    });

    for (const val of values) {
      const result = avl.insert(val);
      steps.push(...result.steps);
    }

    return { root: avl.root, steps };
  }

  clone(): AVLTree {
    const newAVL = new AVLTree();
    newAVL.root = cloneNode(this.root);
    return newAVL;
  }
}

export function generateRandomBST(count: number = 10): TreeNode | null {
  const bst = new BST();
  const used = new Set<number>();
  let attempts = 0;
  while (used.size < count && attempts < count * 10) {
    const val = Math.floor(Math.random() * 90) + 10;
    if (!used.has(val)) {
      used.add(val);
      bst.insert(val);
    }
    attempts++;
  }
  return bst.root;
}

export function generateRandomAVL(count: number = 10): TreeNode | null {
  const avl = new AVLTree();
  const used = new Set<number>();
  let attempts = 0;
  while (used.size < count && attempts < count * 10) {
    const val = Math.floor(Math.random() * 90) + 10;
    if (!used.has(val)) {
      used.add(val);
      avl.insert(val);
    }
    attempts++;
  }
  return avl.root;
}
