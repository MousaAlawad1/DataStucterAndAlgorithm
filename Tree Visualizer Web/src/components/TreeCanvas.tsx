import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { useTreeStore, NodeState } from '../store/treeStore';

function treeNodeToHierarchy(node: any): any {
  if (!node) return null;
  const obj: any = {
    value: node.value,
    id: node.id,
    height: node.height,
    balanceFactor: node.balanceFactor,
    children: [],
  };
  if (node.left) obj.children.push(treeNodeToHierarchy(node.left));
  else if (node.right) obj.children.push({ value: null, id: `phantom-l-${node.id}`, phantom: true, children: [] });

  if (node.right) obj.children.push(treeNodeToHierarchy(node.right));
  else if (node.left) obj.children.push({ value: null, id: `phantom-r-${node.id}`, phantom: true, children: [] });

  // Remove phantom children that aren't needed (no siblings)
  if (!node.left && !node.right) {
    obj.children = [];
  }

  return obj;
}

function getNodeFill(state: NodeState | undefined, mode: string, bf: number): string {
  switch (state) {
    case 'active':    return '#f78166';
    case 'found':     return '#58a6ff';
    case 'visited':   return '#bc8cff';
    case 'balanced':  return '#3fb950';
    case 'unbalanced':return '#f85149';
    default:
      if (mode === 'AVL' && Math.abs(bf) > 1) return '#6e2020';
      return '#1f6feb';
  }
}

function getNodeStroke(state: NodeState | undefined): string {
  switch (state) {
    case 'active':   return '#ff9580';
    case 'found':    return '#79c0ff';
    case 'visited':  return '#d2a8ff';
    case 'balanced': return '#56d364';
    default:         return '#388bfd';
  }
}

function getBFBadgeColor(bf: number): string {
  if (bf === 0) return '#238636';
  if (Math.abs(bf) === 1) return '#1f6feb';
  return '#da3633';
}

const TreeCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { root, mode, highlightedNodes, deleteNode } = useTreeStore();
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.max(width, 200), height: Math.max(height, 200) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const renderTree = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // ── Definitions ─────────────────────────────────────────────────
    const defs = svg.append('defs');

    // Glow filter
    const glow = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glow.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'blur');
    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Strong glow
    const strongGlow = defs.append('filter').attr('id', 'strongglow').attr('x', '-80%').attr('y', '-80%').attr('width', '260%').attr('height', '260%');
    strongGlow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur');
    const fm2 = strongGlow.append('feMerge');
    fm2.append('feMergeNode').attr('in', 'blur');
    fm2.append('feMergeNode').attr('in', 'SourceGraphic');

    // Drop shadow
    const shadow = defs.append('filter').attr('id', 'shadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    shadow.append('feDropShadow').attr('dx', 0).attr('dy', 3).attr('stdDeviation', 4).attr('flood-color', '#00000088');

    if (!root) {
      svg.append('text')
        .attr('x', width / 2).attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#30363d')
        .attr('font-size', '14px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text('Empty tree — insert nodes or click Random Tree');
      return;
    }

    const hierarchyData = treeNodeToHierarchy(root);
    if (!hierarchyData) return;

    const rootH = d3.hierarchy(hierarchyData, d => d.children?.length ? d.children : null);
    const realNodes = rootH.descendants().filter((d: any) => !d.data.phantom);
    const nodeCount = realNodes.length;
    const treeDepth = rootH.height;

    const R = Math.max(16, Math.min(26, Math.floor((width * 0.8) / (nodeCount * 4.5))));
    const levelH = Math.max(65, Math.min(95, (height - 80) / Math.max(treeDepth, 1)));

    const treeLayout = d3.tree<any>()
      .size([Math.max(width - 80, nodeCount * R * 5.5), treeDepth * levelH])
      .separation((a, b) => {
        const aPhantom = a.data.phantom;
        const bPhantom = b.data.phantom;
        if (aPhantom || bPhantom) return 0.8;
        return a.parent === b.parent ? 1.4 : 2.0;
      });

    treeLayout(rootH);

    const allNodes = rootH.descendants() as any[];
    const xs = allNodes.filter(n => !n.data.phantom).map((n: any) => n.x);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const treeW = maxX - minX || 1;
    const offsetX = (width / 2) - (minX + treeW / 2);
    const offsetY = R + 30;

    // ── Zoom + Pan ────────────────────────────────────────────────
    const g = svg.append('g').attr('class', 'tree-g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .on('zoom', evt => g.attr('transform', evt.transform.toString()));
    svg.call(zoom);

    // Initial transform
    g.attr('transform', `translate(${offsetX},${offsetY})`);

    // ── Links ─────────────────────────────────────────────────────
    const links = rootH.links().filter((l: any) => !l.target.data.phantom && !l.source.data.phantom);

    g.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#30363d')
      .attr('stroke-width', 1.8)
      .attr('opacity', 0.9)
      .attr('d', (d: any) =>
        `M${d.source.x},${d.source.y}
         C${d.source.x},${(d.source.y + d.target.y) / 2}
          ${d.target.x},${(d.source.y + d.target.y) / 2}
          ${d.target.x},${d.target.y}`
      )
      .attr('stroke-dasharray', function(this: SVGPathElement) {
        const len = (this as SVGPathElement).getTotalLength?.() || 200;
        return len;
      })
      .attr('stroke-dashoffset', function(this: SVGPathElement) {
        const len = (this as SVGPathElement).getTotalLength?.() || 200;
        return len;
      })
      .transition()
      .duration(500)
      .delay((_: any, i: number) => i * 40)
      .attr('stroke-dashoffset', 0);

    // ── Node groups (real only) ───────────────────────────────────
    const nodeGroups = g.selectAll('.node')
      .data(allNodes.filter((n: any) => !n.data.phantom))
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .attr('cursor', 'pointer')
      .on('click', (_evt: any, d: any) => deleteNode(d.data.value))
      .on('mouseenter', function(_evt: any, _d: any) {
        d3.select(this).select('.main-circle')
          .transition().duration(150).attr('r', R + 5);
        d3.select(this).select('.delete-hint').attr('display', 'block');
      })
      .on('mouseleave', function(_evt: any, _d: any) {
        d3.select(this).select('.main-circle')
          .transition().duration(200).attr('r', R);
        d3.select(this).select('.delete-hint').attr('display', 'none');
      });

    // Outer glow ring for highlighted nodes
    nodeGroups.append('circle')
      .attr('class', 'glow-ring')
      .attr('r', R + 6)
      .attr('fill', 'none')
      .attr('stroke', (d: any) => {
        const state = highlightedNodes.get(d.data.id);
        if (!state) return 'none';
        return getNodeStroke(state);
      })
      .attr('stroke-width', 2)
      .attr('opacity', (d: any) => highlightedNodes.has(d.data.id) ? 0.5 : 0)
      .attr('filter', 'url(#glow)');

    // Shadow
    nodeGroups.append('circle')
      .attr('r', R + 1)
      .attr('fill', 'rgba(0,0,0,0.4)')
      .attr('cy', 3);

    // Main circle
    nodeGroups.append('circle')
      .attr('class', 'main-circle')
      .attr('r', 0)
      .attr('fill', (d: any) => {
        const state = highlightedNodes.get(d.data.id);
        return getNodeFill(state, mode, d.data.balanceFactor);
      })
      .attr('stroke', (d: any) => {
        const state = highlightedNodes.get(d.data.id);
        return getNodeStroke(state);
      })
      .attr('stroke-width', (d: any) => highlightedNodes.has(d.data.id) ? 2.5 : 1.5)
      .attr('filter', (d: any) => highlightedNodes.has(d.data.id) ? 'url(#strongglow)' : 'url(#shadow)')
      .transition()
      .duration(350)
      .delay((_: any, i: number) => i * 35)
      .attr('r', R);

    // Value text
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#e6edf3')
      .attr('font-size', Math.max(9, Math.min(13, R * 0.72)) + 'px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .attr('letter-spacing', '-0.5px')
      .text((d: any) => d.data.value);

    // Height label above node
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -R - 7)
      .attr('fill', '#484f58')
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('pointer-events', 'none')
      .text((d: any) => `h=${d.data.height}`);

    // ── AVL Balance Factor Badge ──────────────────────────────────
    if (mode === 'AVL') {
      const bfX = R * 0.75, bfY = -R * 0.75;
      const bfR = Math.max(9, R * 0.45);

      nodeGroups.append('circle')
        .attr('cx', bfX).attr('cy', bfY)
        .attr('r', bfR)
        .attr('fill', (d: any) => getBFBadgeColor(d.data.balanceFactor))
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 1.5)
        .attr('filter', 'url(#shadow)');

      nodeGroups.append('text')
        .attr('x', bfX).attr('y', bfY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#ffffff')
        .attr('font-size', Math.max(7, bfR * 0.75) + 'px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '700')
        .attr('pointer-events', 'none')
        .text((d: any) => {
          const bf = d.data.balanceFactor;
          return bf > 0 ? `+${bf}` : `${bf}`;
        });
    }

    // Delete hint
    nodeGroups.append('rect')
      .attr('class', 'delete-hint')
      .attr('x', -22).attr('y', R + 4)
      .attr('width', 44).attr('height', 14)
      .attr('rx', 3)
      .attr('fill', '#da363380')
      .attr('display', 'none');

    nodeGroups.append('text')
      .attr('class', 'delete-hint')
      .attr('text-anchor', 'middle')
      .attr('y', R + 14)
      .attr('fill', '#ffb3ae')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('pointer-events', 'none')
      .attr('display', 'none')
      .text('⌫ delete');

    // Fade-in animation for groups
    nodeGroups
      .attr('opacity', 0)
      .transition()
      .duration(300)
      .delay((_: any, i: number) => i * 30)
      .attr('opacity', 1);

  }, [root, mode, dimensions, deleteNode]);

  useEffect(() => {
    if (!svgRef.current || !root) return;
    const svg = d3.select(svgRef.current);
    const nodeGroups = svg.selectAll<SVGGElement, any>('.node');

    nodeGroups.each(function(d: any) {
      const state = highlightedNodes.get(d.data.id);
      const mainCircle = d3.select(this).select('.main-circle');

      mainCircle
        .attr('fill', getNodeFill(state, mode, d.data.balanceFactor))
        .attr('stroke', getNodeStroke(state))
        .attr('stroke-width', highlightedNodes.has(d.data.id) ? 2.5 : 1.5)
        .attr('filter', highlightedNodes.has(d.data.id) ? 'url(#strongglow)' : 'url(#shadow)');

      d3.select(this).select('.glow-ring')
        .attr('stroke', state ? getNodeStroke(state) : 'none')
        .attr('opacity', highlightedNodes.has(d.data.id) ? 0.5 : 0);
    });
  }, [highlightedNodes, mode, root]);

  useEffect(() => {
    renderTree();
  }, [renderTree]);

  return (
    <div ref={containerRef} className="w-full h-full relative tree-canvas-container">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full block"
      />
      {!root && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-5xl mb-3 opacity-30">🌲</div>
          <p className="text-[#30363d] font-mono text-sm">Tree is empty</p>
          <p className="text-[#30363d] font-mono text-xs mt-1 opacity-60">
            Type a value and click Insert, or use Random Tree
          </p>
        </div>
      )}
    </div>
  );
};

export default TreeCanvas;
