import { Component, computed, input } from '@angular/core';

interface NetNode {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  pulseDelay: number;
  pulseDur: number;
  isHub: boolean;
  importance: number;
}

interface NetEdge {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  width: number;
  baseOpacity: number;
  color: string;
  shimmerDelay: number;
  shimmerDur: number;
  importance: number;
}

const VIEW_W = 600;
const VIEW_H = 360;

const PALETTE = {
  outer:      '#3b82f6', // blue-500
  mid:        '#8b5cf6', // violet-500
  hub:        '#a78bfa', // violet-400
  highlight:  '#67e8f9', // cyan-300
  edgeDim:    '#3b82f6',
  edgeBright: '#a78bfa',
  edgeNeon:   '#67e8f9',
};

const LEVEL_LABELS: ReadonlyArray<{ at: number; label: string }> = [
  { at: 0.00, label: 'Synapsen erwachen' },
  { at: 0.10, label: 'Erste Verbindungen' },
  { at: 0.25, label: 'Wachsendes Netzwerk' },
  { at: 0.45, label: 'Aktives Lernen' },
  { at: 0.65, label: 'Starkes Netzwerk' },
  { at: 0.85, label: 'Hochaktiv' },
  { at: 0.97, label: 'Meisterschaft' },
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Region { cx: number; cy: number; spread: number; count: number }

function generateNodes(): NetNode[] {
  const rand = mulberry32(20260426);
  const regions: Region[] = [
    { cx: 300, cy: 180, spread:  60, count: 14 }, // central hub cluster
    { cx: 130, cy: 130, spread:  70, count: 16 },
    { cx: 470, cy: 130, spread:  70, count: 16 },
    { cx: 130, cy: 240, spread:  70, count: 16 },
    { cx: 470, cy: 240, spread:  70, count: 16 },
  ];

  const nodes: NetNode[] = [];
  let id = 0;
  for (let regionIdx = 0; regionIdx < regions.length; regionIdx++) {
    const region = regions[regionIdx];
    for (let i = 0; i < region.count; i++) {
      const angle = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.6) * region.spread;
      const x = region.cx + Math.cos(angle) * r;
      const y = region.cy + Math.sin(angle) * r;
      const distFromCenter = Math.hypot(x - VIEW_W / 2, y - VIEW_H / 2);
      const isCentral = regionIdx === 0;
      nodes.push({
        id: id++,
        x, y,
        r: 2.6 + rand() * 1.6,
        color: '#3b82f6',
        pulseDelay: rand() * 4,
        pulseDur: 2.4 + rand() * 2.4,
        isHub: isCentral,
        importance: -distFromCenter,
      });
    }
  }

  // Order: most central first (ascending unlock — networks "grow from the seed")
  nodes.sort((a, b) => b.importance - a.importance);

  // Re-assign visual props based on rank-driven role
  const total = nodes.length;
  for (let i = 0; i < total; i++) {
    const rankPct = i / total; // 0 = most central, 1 = most peripheral
    const node = nodes[i];
    if (rankPct < 0.12) {
      node.color = PALETTE.highlight;
      node.r = 4.2 + Math.random() * 0.8;
      node.isHub = true;
    } else if (rankPct < 0.32) {
      node.color = PALETTE.hub;
      node.r = 3.4 + Math.random() * 0.8;
    } else if (rankPct < 0.65) {
      node.color = PALETTE.mid;
      node.r = 2.8 + Math.random() * 0.7;
    } else {
      node.color = PALETTE.outer;
      node.r = 2.2 + Math.random() * 0.6;
    }
    // Re-stamp seeded pulse so first-loaded nodes don't all pulse together
    node.pulseDelay = (i * 0.13) % 3.5;
  }

  // Stable IDs after sort
  nodes.forEach((n, i) => (n.id = i));
  return nodes;
}

function generateEdges(nodes: NetNode[]): NetEdge[] {
  const rand = mulberry32(0xC0FFEE);
  const edges = new Map<string, NetEdge>();
  const K = 3; // each node connects to its k nearest neighbours

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const distances = nodes
      .map((b, j) => ({ j, d: i === j ? Infinity : Math.hypot(a.x - b.x, a.y - b.y) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, K);

    for (const { j } of distances) {
      const lo = Math.min(i, j), hi = Math.max(i, j);
      const key = `${lo}-${hi}`;
      if (edges.has(key)) continue;
      const b = nodes[j];

      // Edge importance = lower of the two endpoint ranks (i.e. importance dominated by less-important endpoint)
      const importance = Math.max(i, j);

      const isLong = Math.hypot(a.x - b.x, a.y - b.y) > 90;
      const isCore = i < 8 && j < 16;
      const baseOpacity = isCore ? 0.55 : isLong ? 0.18 : 0.32;
      const width = isCore ? 1.05 : isLong ? 0.55 : 0.75;
      const color = isCore ? PALETTE.edgeNeon : isLong ? PALETTE.edgeDim : PALETTE.edgeBright;

      edges.set(key, {
        id: key,
        x1: a.x, y1: a.y,
        x2: b.x, y2: b.y,
        width, baseOpacity, color,
        shimmerDelay: rand() * 6,
        shimmerDur: 5 + rand() * 5,
        importance,
      });
    }
  }

  return [...edges.values()].sort((a, b) => a.importance - b.importance);
}

const ALL_NODES = generateNodes();
const ALL_EDGES = generateEdges(ALL_NODES);

@Component({
  selector: 'app-neural-progress',
  standalone: true,
  template: `
    <figure class="container" [attr.data-progress]="Math.round(clamped() * 100)">
      <svg [attr.viewBox]="'0 0 ' + VIEW_W + ' ' + VIEW_H" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="np-bg" cx="50%" cy="50%" r="65%">
            <stop offset="0%"   stop-color="#312e81" stop-opacity="0.35"/>
            <stop offset="55%"  stop-color="#1e1b4b" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#0d0f14" stop-opacity="0"/>
          </radialGradient>

          <filter id="np-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.2" result="b1"/>
            <feMerge>
              <feMergeNode in="b1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="np-glow-strong" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4.5" result="b1"/>
            <feMerge>
              <feMergeNode in="b1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect [attr.width]="VIEW_W" [attr.height]="VIEW_H" fill="url(#np-bg)" class="bg-pulse"/>

        <g class="edges">
          @for (edge of visibleEdges(); track edge.id) {
            <line
              class="edge"
              [attr.x1]="edge.x1" [attr.y1]="edge.y1"
              [attr.x2]="edge.x2" [attr.y2]="edge.y2"
              [attr.stroke]="edge.color"
              [attr.stroke-width]="edge.width"
              [attr.stroke-opacity]="edge.baseOpacity"
              [style.--shimmer-delay]="edge.shimmerDelay + 's'"
              [style.--shimmer-dur]="edge.shimmerDur + 's'"
              [style.--peak]="(edge.baseOpacity * 1.6).toFixed(2)"
              [style.--base]="edge.baseOpacity.toFixed(2)" />
          }
        </g>

        <g class="nodes">
          @for (node of visibleNodes(); track node.id) {
            <g class="node-group"
               [class.hub]="node.isHub"
               [style.--pulse-delay]="node.pulseDelay + 's'"
               [style.--pulse-dur]="node.pulseDur + 's'"
               [attr.transform]="'translate(' + node.x + ' ' + node.y + ')'">
              <circle
                class="node-aura"
                r="0"
                [attr.fill]="node.color"
                [style.--target-r]="node.r * 3.4"
                opacity="0.18"/>
              <circle
                class="node-core"
                [attr.r]="node.r"
                [attr.fill]="node.color"
                filter="url(#np-glow)"/>
            </g>
          }
        </g>
      </svg>

      @if (showLabel()) {
        <figcaption class="meta">
          <div class="pct">
            <span class="num">{{ pctText() }}</span>
            <span class="suffix">%</span>
          </div>
          <div class="level">{{ levelLabel() }}</div>
        </figcaption>
      }
    </figure>
  `,
  styleUrl: './neural-progress.component.css',
})
export class NeuralProgressComponent {
  readonly progress = input<number>(0);
  readonly showLabel = input<boolean>(true);

  // expose constants/Math for template
  readonly Math = Math;
  readonly VIEW_W = VIEW_W;
  readonly VIEW_H = VIEW_H;

  readonly clamped = computed(() => {
    const v = this.progress();
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(1, v));
  });

  readonly visibleNodes = computed<NetNode[]>(() => {
    const p = this.clamped();
    const eased = 1 - Math.pow(1 - p, 1.6); // ease-out — quick early growth
    const min = 6;
    const count = Math.max(min, Math.floor(ALL_NODES.length * eased));
    return ALL_NODES.slice(0, count);
  });

  readonly visibleEdges = computed<NetEdge[]>(() => {
    const p = this.clamped();
    const visibleNodeCount = this.visibleNodes().length;
    const visibleSet = new Set<number>();
    for (let i = 0; i < visibleNodeCount; i++) visibleSet.add(i);
    // Edges grow quadratically with progress for the "denser as you learn" feel
    const cap = Math.floor(ALL_EDGES.length * Math.pow(p, 1.4));
    const out: NetEdge[] = [];
    for (const edge of ALL_EDGES) {
      const [a, b] = edge.id.split('-').map(Number);
      if (visibleSet.has(a) && visibleSet.has(b)) {
        out.push(edge);
        if (out.length >= cap) break;
      }
    }
    return out;
  });

  readonly pctText = computed(() => Math.round(this.clamped() * 100).toString());

  readonly levelLabel = computed(() => {
    const p = this.clamped();
    let label = LEVEL_LABELS[0].label;
    for (const lv of LEVEL_LABELS) {
      if (p >= lv.at) label = lv.label;
    }
    return label;
  });
}
