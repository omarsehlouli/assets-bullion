import type React from 'react';
import {useMemo} from 'react';
import {random} from 'remotion';
import {C} from '../theme';

type NodeFieldProps = {
  readonly frame: number;
  readonly width: number;
  readonly height: number;
  // Camera rotation around the vertical and horizontal axes, in radians.
  readonly yaw: number;
  readonly pitch: number;
  readonly zoom: number;
  readonly count?: number;
  readonly accent?: string;
  readonly opacity?: number;
};

const CAMERA_DISTANCE = 1500;
const FOCAL = 1150;

type Node = {x: number; y: number; z: number; gold: boolean; size: number};

const buildNodes = (count: number): Node[] =>
  Array.from({length: count}, (_, i) => ({
    x: (random(`nx-${i}`) - 0.5) * 1900,
    y: (random(`ny-${i}`) - 0.5) * 3000,
    z: (random(`nz-${i}`) - 0.5) * 1400,
    gold: random(`ng-${i}`) < 0.16,
    size: 2 + random(`ns-${i}`) * 3.5,
  }));

// Connect every node to its two nearest neighbours.
const buildEdges = (nodes: Node[]) => {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    const nearest = nodes
      .map((b, j) => ({j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2}))
      .filter(({j}) => j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    nearest.forEach(({j}) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    });
  });
  return edges;
};

export const NodeField: React.FC<NodeFieldProps> = ({
  frame,
  width,
  height,
  yaw,
  pitch,
  zoom,
  count = 80,
  accent = C.cyan,
  opacity = 1,
}) => {
  const nodes = useMemo(() => buildNodes(count), [count]);
  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosX = Math.cos(pitch);
  const sinX = Math.sin(pitch);

  const projected = nodes.map((n) => {
    const x1 = n.x * cosY + n.z * sinY;
    const z1 = -n.x * sinY + n.z * cosY;
    const y2 = n.y * cosX - z1 * sinX;
    const z2 = n.y * sinX + z1 * cosX;
    const depth = z2 + CAMERA_DISTANCE;
    const scale = (FOCAL * zoom) / Math.max(depth, 120);
    return {
      sx: width / 2 + x1 * scale,
      sy: height / 2 + y2 * scale,
      scale,
      // 1 = nearest, 0 = farthest
      near: Math.min(1, Math.max(0, 1 - (z2 + 700) / 1400)),
      visible: depth > 120,
      gold: n.gold,
      size: n.size,
    };
  });

  return (
    <svg
      width={width}
      height={height}
      style={{position: 'absolute', inset: 0, opacity}}
    >
      {edges.map(([a, b], i) => {
        const p = projected[a];
        const q = projected[b];
        if (!p.visible || !q.visible) {
          return null;
        }
        const near = (p.near + q.near) / 2;
        return (
          <line
            key={`e-${i}`}
            x1={p.sx}
            y1={p.sy}
            x2={q.sx}
            y2={q.sy}
            stroke={accent}
            strokeOpacity={0.05 + near * 0.16}
            strokeWidth={0.6 + near * 1.2}
          />
        );
      })}
      {/* Data packets travelling along every third edge */}
      {edges.map(([a, b], i) => {
        if (i % 3 !== 0) {
          return null;
        }
        const p = projected[a];
        const q = projected[b];
        if (!p.visible || !q.visible) {
          return null;
        }
        const t = (frame * (0.004 + random(`pk-${i}`) * 0.006) + random(`po-${i}`)) % 1;
        const near = (p.near + q.near) / 2;
        return (
          <circle
            key={`p-${i}`}
            cx={p.sx + (q.sx - p.sx) * t}
            cy={p.sy + (q.sy - p.sy) * t}
            r={1.2 + near * 2.2}
            fill={accent}
            opacity={0.25 + near * 0.6}
          />
        );
      })}
      {projected.map((p, i) => {
        if (!p.visible) {
          return null;
        }
        const r = p.size * (0.5 + p.scale * 0.7);
        const color = p.gold ? C.gold : accent;
        const twinkle = 0.75 + 0.25 * Math.sin(frame / 30 + i);
        return (
          <g key={`n-${i}`} opacity={(0.25 + p.near * 0.75) * twinkle}>
            <circle cx={p.sx} cy={p.sy} r={r * 3.2} fill={color} opacity={0.12} />
            <circle cx={p.sx} cy={p.sy} r={r} fill={color} />
          </g>
        );
      })}
    </svg>
  );
};
