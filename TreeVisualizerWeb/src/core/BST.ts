import { TreeNode } from './TreeNode';

export type TraversalStep = {
  type: 'visit' | 'compare' | 'found' | 'not_found' | 'insert' | 'delete' | 'go_left' | 'go_right';
  nodeId: string;
  value: number;
  message: string;
};

export type TraversalResult = {
  order: number[];
  steps: TraversalStep[];
};

export function height(node: TreeNode | null): number {
  return node ? node.height : 0;
}

export function updateHeight(node: TreeNode): void {
  node.height = 1 + Math.max(height(node.left), height(node.right));
}

export function getBalanceFactor(node: TreeNode | null): number {
  if (!node) return 0;
  return height(node.left) - height(node.right);
}

export function updateBalanceFactor(node: TreeNode): void {
  node.balanceFactor = getBalanceFactor(node);
}

export function updateAllMetadata(node: TreeNode | null): void {
  if (!node) return;
  updateAllMetadata(node.left);
  updateAllMetadata(node.right);
  updateHeight(node);
  updateBalanceFactor(node);
}

export class BST {
  root: TreeNode | null = null;

  /**
   * Inserts a value into the binary search tree.
   * @param value - The number to insert.
   * @returns An object containing the updated root and the steps taken during insertion.
   */
  insert(value: number): { root: TreeNode | null; steps: TraversalStep[] } {
    const steps: TraversalStep[] = [];
    this.root = this._insert(this.root, value, steps);
    updateAllMetadata(this.root);
    return { root: this.root, steps };
  }

  private _insert(
    node: TreeNode | null,
    value: number,
    steps: TraversalStep[]
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
      node.left = this._insert(node.left, value, steps);
    } else if (value > node.value) {
      steps.push({
        type: 'go_right',
        nodeId: node.id,
        value: node.value,
        message: `${value} > ${node.value}, going right`,
      });
      node.right = this._insert(node.right, value, steps);
    } else {
      steps.push({
        type: 'found',
        nodeId: node.id,
        value: node.value,
        message: `Value ${value} already exists in the tree`,
      });
    }

    updateHeight(node);
    updateBalanceFactor(node);
    return node;
  }

  /**
   * Deletes a value from the binary search tree.
   * @param value - The number to delete.
   * @returns An object containing the updated root and the steps taken during deletion.
   */
  delete(value: number): { root: TreeNode | null; steps: TraversalStep[] } {
    const steps: TraversalStep[] = [];
    this.root = this._delete(this.root, value, steps);
    if (this.root) updateAllMetadata(this.root);
    return { root: this.root, steps };
  }

  private _delete(
    node: TreeNode | null,
    value: number,
    steps: TraversalStep[]
  ): TreeNode | null {
    if (!node) {
      steps.push({
        type: 'not_found',
        nodeId: '',
        value,
        message: `Value ${value} not found in tree`,
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
      steps.push({
        type: 'go_left',
        nodeId: node.id,
        value: node.value,
        message: `${value} < ${node.value}, going left`,
      });
      node.left = this._delete(node.left, value, steps);
    } else if (value > node.value) {
      steps.push({
        type: 'go_right',
        nodeId: node.id,
        value: node.value,
        message: `${value} > ${node.value}, going right`,
      });
      node.right = this._delete(node.right, value, steps);
    } else {
      steps.push({
        type: 'found',
        nodeId: node.id,
        value: node.value,
        message: `Found node ${value}, deleting...`,
      });

      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Find inorder successor (smallest in right subtree)
      let successor = node.right;
      while (successor.left) successor = successor.left;

      steps.push({
        type: 'visit',
        nodeId: successor.id,
        value: successor.value,
        message: `Using inorder successor: ${successor.value}`,
      });

      node.value = successor.value;
      node.id = `node-${node.value}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      node.right = this._delete(node.right, successor.value, steps);
    }

    updateHeight(node);
    updateBalanceFactor(node);
    return node;
  }

  /**
   * Searches for a value in the binary search tree.
   * @param value - The number to search for.
   * @returns An object indicating if the value was found and the steps taken during search.
   */
  search(value: number): { found: boolean; steps: TraversalStep[] } {
    const steps: TraversalStep[] = [];
    const found = this._search(this.root, value, steps);
    return { found, steps };
  }

  private _search(
    node: TreeNode | null,
    value: number,
    steps: TraversalStep[]
  ): boolean {
    if (!node) {
      steps.push({
        type: 'not_found',
        nodeId: '',
        value,
        message: `Value ${value} not found`,
      });
      return false;
    }

    steps.push({
      type: 'compare',
      nodeId: node.id,
      value: node.value,
      message: `Comparing ${value} with ${node.value}`,
    });

    if (value === node.value) {
      steps.push({
        type: 'found',
        nodeId: node.id,
        value: node.value,
        message: `Found ${value}! ✓`,
      });
      return true;
    }

    if (value < node.value) {
      steps.push({
        type: 'go_left',
        nodeId: node.id,
        value: node.value,
        message: `${value} < ${node.value}, going left`,
      });
      return this._search(node.left, value, steps);
    } else {
      steps.push({
        type: 'go_right',
        nodeId: node.id,
        value: node.value,
        message: `${value} > ${node.value}, going right`,
      });
      return this._search(node.right, value, steps);
    }
  }

  /**
   * Performs an inorder traversal of the tree.
   * @returns An object containing the traversal order and steps.
   */
  inorder(): TraversalResult {
    const order: number[] = [];
    const steps: TraversalStep[] = [];
    this._inorder(this.root, order, steps);
    return { order, steps };
  }

  private _inorder(
    node: TreeNode | null,
    order: number[],
    steps: TraversalStep[]
  ): void {
    if (!node) return;
    this._inorder(node.left, order, steps);
    order.push(node.value);
    steps.push({
      type: 'visit',
      nodeId: node.id,
      value: node.value,
      message: `Visit ${node.value} (Inorder)`,
    });
    this._inorder(node.right, order, steps);
  }

  /**
   * Performs a preorder traversal of the tree.
   * @returns An object containing the traversal order and steps.
   */
  preorder(): TraversalResult {
    const order: number[] = [];
    const steps: TraversalStep[] = [];
    this._preorder(this.root, order, steps);
    return { order, steps };
  }

  private _preorder(
    node: TreeNode | null,
    order: number[],
    steps: TraversalStep[]
  ): void {
    if (!node) return;
    order.push(node.value);
    steps.push({
      type: 'visit',
      nodeId: node.id,
      value: node.value,
      message: `Visit ${node.value} (Preorder)`,
    });
    this._preorder(node.left, order, steps);
    this._preorder(node.right, order, steps);
  }

  /**
   * Performs a postorder traversal of the tree.
   * @returns An object containing the traversal order and steps.
   */
  postorder(): TraversalResult {
    const order: number[] = [];
    const steps: TraversalStep[] = [];
    this._postorder(this.root, order, steps);
    return { order, steps };
  }

  private _postorder(
    node: TreeNode | null,
    order: number[],
    steps: TraversalStep[]
  ): void {
    if (!node) return;
    this._postorder(node.left, order, steps);
    this._postorder(node.right, order, steps);
    order.push(node.value);
    steps.push({
      type: 'visit',
      nodeId: node.id,
      value: node.value,
      message: `Visit ${node.value} (Postorder)`,
    });
  }

  /**
   * Creates a deep clone of the binary search tree.
   * @returns A new BST instance with the same structure.
   */
  clone(): BST {
    const newBST = new BST();
    newBST.root = cloneNode(this.root);
    return newBST;
  }
}

export function cloneNode(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  const newNode = new TreeNode(node.value);
  newNode.id = node.id;
  newNode.height = node.height;
  newNode.balanceFactor = node.balanceFactor;
  newNode.left = cloneNode(node.left);
  newNode.right = cloneNode(node.right);
  return newNode;
}
