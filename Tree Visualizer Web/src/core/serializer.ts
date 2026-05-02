import { TreeNode } from './TreeNode';

export function serializeTree(root: TreeNode | null): object | null {
  if (!root) return null;
  return {
    value: root.value,
    id: root.id,
    height: root.height,
    balanceFactor: root.balanceFactor,
    left: serializeTree(root.left),
    right: serializeTree(root.right),
  };
}

export function deserializeTree(data: any): TreeNode | null {
  if (!data) return null;
  const node = new TreeNode(data.value);
  node.id = data.id || node.id;
  node.height = data.height || 1;
  node.balanceFactor = data.balanceFactor || 0;
  node.left = deserializeTree(data.left);
  node.right = deserializeTree(data.right);
  return node;
}

export function treeToValues(root: TreeNode | null): number[] {
  if (!root) return [];
  const values: number[] = [];
  function inorder(node: TreeNode | null) {
    if (!node) return;
    inorder(node.left);
    values.push(node.value);
    inorder(node.right);
  }
  inorder(root);
  return values;
}
