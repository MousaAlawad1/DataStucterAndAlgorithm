export interface TreeNodeData {
  value: number;
  left: TreeNodeData | null;
  right: TreeNodeData | null;
  height: number;
  balanceFactor: number;
  id: string;
}

/**
 * Represents a node in a binary tree.
 */
export class TreeNode implements TreeNodeData {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  height: number;
  balanceFactor: number;
  id: string;

  /**
   * Creates a new TreeNode with the given value.
   * @param value - The numeric value of the node.
   */
  constructor(value: number) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.balanceFactor = 0;
    this.id = `node-${value}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
