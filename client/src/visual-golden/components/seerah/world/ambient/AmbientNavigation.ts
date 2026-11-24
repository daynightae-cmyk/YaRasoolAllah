/**
 * Bounded NavGrid + spatial hash for anonymous world-life movement.
 * Paths are computed on destination changes, never with an all-to-all search
 * in the render loop. The same world collision shapes block people, animals,
 * and the visitor; no second renderer or navigation runtime is introduced.
 */
import * as THREE from "three";
import type { AmbientNavigationOptions } from "./AmbientTypes";

interface Cell { x: number; z: number }
interface HeapNode { index: number; score: number }

class MinHeap {
  private values: HeapNode[] = [];
  get size() { return this.values.length; }
  push(node: HeapNode): void {
    this.values.push(node);
    let i = this.values.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.values[parent].score <= node.score) break;
      this.values[i] = this.values[parent];
      i = parent;
    }
    this.values[i] = node;
  }
  pop(): HeapNode | undefined {
    const first = this.values[0];
    const last = this.values.pop();
    if (!last || this.values.length === 0) return first;
    let i = 0;
    while (true) {
      const left = i * 2 + 1;
      const right = left + 1;
      if (left >= this.values.length) break;
      let child = left;
      if (right < this.values.length && this.values[right].score < this.values[left].score) child = right;
      if (this.values[child].score >= last.score) break;
      this.values[i] = this.values[child];
      i = child;
    }
    this.values[i] = last;
    return first;
  }
}

export class NavGrid {
  readonly cellSize: number;
  readonly columns: number;
  readonly rows: number;
  readonly halfWidth: number;
  readonly halfDepth: number;
  private readonly agentRadius: number;
  private readonly groundHeightAt: (x: number, z: number) => number;
  private readonly walkable: Uint8Array;

  constructor(options: AmbientNavigationOptions) {
    this.cellSize = Math.max(1, options.cellSize ?? 3);
    this.agentRadius = Math.max(0.25, options.agentRadius ?? 0.55);
    this.halfWidth = options.width / 2;
    this.halfDepth = options.depth / 2;
    this.columns = Math.max(1, Math.floor((options.width - this.cellSize) / this.cellSize));
    this.rows = Math.max(1, Math.floor((options.depth - this.cellSize) / this.cellSize));
    this.groundHeightAt = options.groundHeightAt;
    this.walkable = new Uint8Array(this.columns * this.rows);
    this.walkable.fill(1);
    for (const shape of options.collisionShapes) this.blockShape(shape);
    // The authored boundary walls already block edge cells. This additional
    // half-cell margin keeps wide animal bodies inside the visible terrain.
    for (let z = 0; z < this.rows; z++) {
      for (let x = 0; x < this.columns; x++) {
        if (x === 0 || z === 0 || x === this.columns - 1 || z === this.rows - 1) {
          this.walkable[this.index(x, z)] = 0;
        }
      }
    }
  }

  private index(x: number, z: number): number { return z * this.columns + x; }
  private valid(x: number, z: number): boolean {
    return x >= 0 && z >= 0 && x < this.columns && z < this.rows;
  }
  isCellWalkable(x: number, z: number): boolean {
    return this.valid(x, z) && this.walkable[this.index(x, z)] === 1;
  }
  cellCenter(x: number, z: number): THREE.Vector3 {
    const wx = -this.halfWidth + this.cellSize * (x + 1);
    const wz = -this.halfDepth + this.cellSize * (z + 1);
    return new THREE.Vector3(wx, this.groundHeightAt(wx, wz), wz);
  }
  worldToCell(x: number, z: number): Cell | null {
    if (Math.abs(x) >= this.halfWidth || Math.abs(z) >= this.halfDepth) return null;
    const cx = Math.floor((x + this.halfWidth) / this.cellSize) - 1;
    const cz = Math.floor((z + this.halfDepth) / this.cellSize) - 1;
    return this.valid(cx, cz) ? { x: cx, z: cz } : null;
  }
  isWalkablePoint(x: number, z: number): boolean {
    const cell = this.worldToCell(x, z);
    return !!cell && this.isCellWalkable(cell.x, cell.z);
  }

  nearestWalkable(position: THREE.Vector3, maxRing = 12): THREE.Vector3 | null {
    const start = this.worldToCell(position.x, position.z);
    if (!start) return null;
    if (this.isCellWalkable(start.x, start.z)) {
      const result = position.clone();
      result.y = this.groundHeightAt(result.x, result.z);
      return result;
    }
    for (let ring = 1; ring <= maxRing; ring++) {
      let best: THREE.Vector3 | null = null;
      let bestDistance = Infinity;
      for (let dz = -ring; dz <= ring; dz++) {
        for (let dx = -ring; dx <= ring; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
          const x = start.x + dx;
          const z = start.z + dz;
          if (!this.isCellWalkable(x, z)) continue;
          const candidate = this.cellCenter(x, z);
          const distance = (candidate.x - position.x) ** 2 + (candidate.z - position.z) ** 2;
          if (distance < bestDistance) { best = candidate; bestDistance = distance; }
        }
      }
      if (best) return best;
    }
    return null;
  }

  /** A* on eight-connected cells, with corner cutting forbidden. */
  findPath(startPosition: THREE.Vector3, endPosition: THREE.Vector3, maxVisited = 5000): THREE.Vector3[] {
    const startPoint = this.nearestWalkable(startPosition);
    const endPoint = this.nearestWalkable(endPosition);
    if (!startPoint || !endPoint) return [];
    const start = this.worldToCell(startPoint.x, startPoint.z);
    const goal = this.worldToCell(endPoint.x, endPoint.z);
    if (!start || !goal) return [];
    const startIndex = this.index(start.x, start.z);
    const goalIndex = this.index(goal.x, goal.z);
    if (startIndex === goalIndex) return [endPoint];

    const count = this.columns * this.rows;
    const costs = new Float32Array(count);
    costs.fill(Infinity);
    const parents = new Int32Array(count);
    parents.fill(-1);
    const closed = new Uint8Array(count);
    const heap = new MinHeap();
    costs[startIndex] = 0;
    heap.push({ index: startIndex, score: 0 });
    let visited = 0;

    while (heap.size && visited++ < maxVisited) {
      const node = heap.pop()!;
      if (closed[node.index]) continue;
      if (node.index === goalIndex) {
        const cells: Cell[] = [];
        let cursor = goalIndex;
        while (cursor >= 0) {
          cells.push({ x: cursor % this.columns, z: Math.floor(cursor / this.columns) });
          if (cursor === startIndex) break;
          cursor = parents[cursor];
        }
        cells.reverse();
        const dense = cells.map((cell) => this.cellCenter(cell.x, cell.z));
        dense[dense.length - 1] = endPoint;
        return this.simplify(dense);
      }
      closed[node.index] = 1;
      const cx = node.index % this.columns;
      const cz = Math.floor(node.index / this.columns);
      for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dz === 0) continue;
          const nx = cx + dx;
          const nz = cz + dz;
          if (!this.isCellWalkable(nx, nz)) continue;
          if (dx !== 0 && dz !== 0 &&
            (!this.isCellWalkable(cx + dx, cz) || !this.isCellWalkable(cx, cz + dz))) continue;
          const ni = this.index(nx, nz);
          if (closed[ni]) continue;
          const nextCost = costs[node.index] + (dx !== 0 && dz !== 0 ? Math.SQRT2 : 1);
          if (nextCost >= costs[ni]) continue;
          costs[ni] = nextCost;
          parents[ni] = node.index;
          const h = Math.hypot(goal.x - nx, goal.z - nz);
          heap.push({ index: ni, score: nextCost + h });
        }
      }
    }
    return [];
  }

  hasLineOfSight(a: THREE.Vector3, b: THREE.Vector3): boolean {
    const distance = Math.hypot(a.x - b.x, a.z - b.z);
    const steps = Math.max(1, Math.ceil(distance / (this.cellSize * 0.35)));
    let previous: Cell | null = null;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = THREE.MathUtils.lerp(a.x, b.x, t);
      const z = THREE.MathUtils.lerp(a.z, b.z, t);
      const cell = this.worldToCell(x, z);
      if (!cell || !this.isCellWalkable(cell.x, cell.z)) return false;
      if (previous) {
        const dx = cell.x - previous.x;
        const dz = cell.z - previous.z;
        // Simplification must obey the same diagonal rule as A*. Checking
        // only sampled cells would let a straight shortcut squeeze through
        // the touching corners of two blocked orthogonal neighbours.
        if (Math.abs(dx) > 1 || Math.abs(dz) > 1) return false;
        if (dx !== 0 && dz !== 0 &&
          (!this.isCellWalkable(previous.x + dx, previous.z) ||
            !this.isCellWalkable(previous.x, previous.z + dz))) return false;
      }
      previous = cell;
    }
    return true;
  }

  private simplify(points: THREE.Vector3[]): THREE.Vector3[] {
    if (points.length <= 2) return points;
    const result: THREE.Vector3[] = [points[0]];
    let anchor = 0;
    for (let i = 2; i < points.length; i++) {
      if (this.hasLineOfSight(points[anchor], points[i])) continue;
      result.push(points[i - 1]);
      anchor = i - 1;
    }
    result.push(points[points.length - 1]);
    return result;
  }

  private blockShape(shape: AmbientNavigationOptions["collisionShapes"][number]): void {
    let center: THREE.Vector3;
    let minX: number, maxX: number, minZ: number, maxZ: number, minY: number, maxY: number;
    if (shape.type === "box") {
      center = shape.center;
      const half = shape.size.clone().multiplyScalar(0.5);
      let ex = half.x, ez = half.z;
      if (shape.rotation) {
        const matrix = new THREE.Matrix4().makeRotationFromEuler(shape.rotation);
        const corner = new THREE.Vector3();
        ex = 0; ez = 0;
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
          corner.set(sx * half.x, sy * half.y, sz * half.z).applyMatrix4(matrix);
          ex = Math.max(ex, Math.abs(corner.x));
          ez = Math.max(ez, Math.abs(corner.z));
        }
      }
      minX = center.x - ex; maxX = center.x + ex;
      minZ = center.z - ez; maxZ = center.z + ez;
      minY = center.y - half.y; maxY = center.y + half.y;
    } else if (shape.type === "cylinder") {
      center = shape.center;
      const r = Math.max(shape.radiusTop, shape.radiusBottom);
      minX = center.x - r; maxX = center.x + r;
      minZ = center.z - r; maxZ = center.z + r;
      minY = center.y - shape.height / 2; maxY = center.y + shape.height / 2;
    } else if (shape.type === "sphere") {
      center = shape.center;
      minX = center.x - shape.radius; maxX = center.x + shape.radius;
      minZ = center.z - shape.radius; maxZ = center.z + shape.radius;
      minY = center.y - shape.radius; maxY = center.y + shape.radius;
    } else {
      const box = new THREE.Box3().setFromObject(shape.mesh);
      center = box.getCenter(new THREE.Vector3());
      minX = box.min.x; maxX = box.max.x; minZ = box.min.z; maxZ = box.max.z;
      minY = box.min.y; maxY = box.max.y;
    }
    const first = this.worldToCell(minX - this.agentRadius, minZ - this.agentRadius) ?? { x: 0, z: 0 };
    const last = this.worldToCell(maxX + this.agentRadius, maxZ + this.agentRadius) ?? {
      x: this.columns - 1,
      z: this.rows - 1,
    };
    for (let z = Math.max(0, first.z); z <= Math.min(this.rows - 1, last.z); z++) {
      for (let x = Math.max(0, first.x); x <= Math.min(this.columns - 1, last.x); x++) {
        const p = this.cellCenter(x, z);
        if (maxY < p.y - 0.35 || minY > p.y + 2.1) continue;
        if (p.x < minX - this.agentRadius || p.x > maxX + this.agentRadius ||
          p.z < minZ - this.agentRadius || p.z > maxZ + this.agentRadius) continue;
        this.walkable[this.index(x, z)] = 0;
      }
    }
  }
}

export interface SpatialEntity {
  id: string;
  position: THREE.Vector3;
  radius: number;
}

/** Uniform spatial hash; local avoidance only inspects adjacent buckets. */
export class AmbientSpatialIndex {
  private readonly buckets = new Map<string, SpatialEntity[]>();
  constructor(private readonly cellSize = 5) {}
  clear(): void { this.buckets.clear(); }
  private key(x: number, z: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(z / this.cellSize)}`;
  }
  insert(entity: SpatialEntity): void {
    const key = this.key(entity.position.x, entity.position.z);
    const bucket = this.buckets.get(key);
    if (bucket) bucket.push(entity); else this.buckets.set(key, [entity]);
  }
  query(position: THREE.Vector3, radius: number): SpatialEntity[] {
    const result: SpatialEntity[] = [];
    const reach = Math.ceil(radius / this.cellSize);
    const cx = Math.floor(position.x / this.cellSize);
    const cz = Math.floor(position.z / this.cellSize);
    for (let dz = -reach; dz <= reach; dz++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const bucket = this.buckets.get(`${cx + dx},${cz + dz}`);
        if (bucket) result.push(...bucket);
      }
    }
    return result;
  }
}
