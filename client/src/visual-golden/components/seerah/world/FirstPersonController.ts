/**
 * FirstPersonController — walkable first-person movement for the Living World.
 *
 * Design:
 * - Analytic ground: a `groundHeightAt(x, z)` sampler (bilinear heightfield)
 *   keeps the player grounded continuously — no raycast ground dependency.
 * - Horizontal collision: circle-vs-box push-out + slide against registered
 *   solid shapes (tents, stalls, rocks, walls). Deterministic and cheap.
 * - Gravity + jump for vertical motion; crouch lowers eye height.
 * - WASD/arrows + Shift sprint + C/Ctrl crouch + Space jump.
 * - Pointer-lock mouse look with drag-look fallback; touch dual-zone controls.
 * - Owns its DOM listeners with an AbortController so dispose() truly unbinds.
 * - Reduced motion: movement stays functional (it is user-driven), but no
 *   head-bob and instant response; ambient animation is owned elsewhere.
 */

import * as THREE from "three";
import type { WorldPlayerState, WorldCollisionShape } from "./world-types";

const PLAYER_RADIUS = 0.35;
const EYE_HEIGHT_STANDING = 1.62;
const EYE_HEIGHT_CROUCHING = 1.1;
const WALK_SPEED = 3.8;
const SPRINT_MULTIPLIER = 1.7;
const CROUCH_MULTIPLIER = 0.45;
const ACCELERATION = 26;
const DECELERATION = 20;
const JUMP_VELOCITY = 6.4;
const GRAVITY = 20;
const MAX_FALL_SPEED = 35;
const MOUSE_SENSITIVITY = 0.0022;
const DRAG_LOOK_SENSITIVITY = 0.0042;
const TOUCH_LOOK_SENSITIVITY = 0.0038;
const TOUCH_DEADZONE = 10;
const TOUCH_MAX_RADIUS = 80;
const PITCH_MIN = -Math.PI / 2 + 0.08;
const PITCH_MAX = Math.PI / 2 - 0.08;

/** Axis-aligned solid derived from a collision shape (XZ circle tests). */
interface SolidBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
}

export interface FirstPersonControllerOptions {
  /** Analytic terrain height at world (x, z). */
  groundHeightAt: (x: number, z: number) => number;
  /** World half-extent; player is clamped inside. */
  worldHalfSize: number;
  reducedMotion?: boolean;
  onFootstep?: (position: THREE.Vector3, material: string) => void;
  onInteractionEnter?: (pointId: string) => void;
  onInteractionExit?: (pointId: string) => void;
  /**
   * Called when movement input is active. Under reduced motion the runtime
   * only renders discrete frames, so the host uses this to keep invalidating
   * while the user-driven experience is actually moving.
   */
  onMotionInput?: () => void;
}

export class FirstPersonController {
  public readonly state: WorldPlayerState;

  private readonly options: FirstPersonControllerOptions;
  private readonly abort = new AbortController();
  private readonly solids: SolidBox[] = [];

  private input = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    crouch: false,
  };
  private prevJump = false;
  private yaw: number;
  private pitch = 0;
  private pointerLocked = false;
  private dragging = false;
  private dragLast = { x: 0, y: 0 };
  private inputEnabled = true;
  private reducedMotion: boolean;

  private stepTimer = 0;
  private readonly stepInterval = 0.42;
  private bobPhase = 0;

  private touchMoveId: number | null = null;
  private touchLookId: number | null = null;
  private touchMoveStart = { x: 0, y: 0 };
  private touchLookLast = { x: 0, y: 0 };
  /** Analog gamepad axes (set externally each frame); deadzone applied. */
  private gamepadMove = { x: 0, y: 0 };
  private gamepadLook = { x: 0, y: 0 };
  private gamepadButtons = { sprint: false, crouch: false, jump: false };

  private interactionPoints: Array<{
    id: string;
    position: THREE.Vector3;
    radius: number;
    entered: boolean;
  }> = [];

  // Scratch vectors (no per-frame allocation in hot paths).
  private readonly wishDir = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();

  constructor(
    colliderShapes: WorldCollisionShape[],
    startPosition: THREE.Vector3,
    startYaw: number,
    options: FirstPersonControllerOptions,
  ) {
    this.options = options;
    this.reducedMotion = options.reducedMotion ?? false;
    this.yaw = startYaw;

    const groundY = options.groundHeightAt(startPosition.x, startPosition.z);
    this.state = {
      position: new THREE.Vector3(startPosition.x, groundY, startPosition.z),
      velocity: new THREE.Vector3(),
      yaw: startYaw,
      pitch: 0,
      onGround: true,
      sprinting: false,
      crouching: false,
    };

    for (const shape of colliderShapes) {
      const box = this.shapeToSolid(shape);
      if (box) this.solids.push(box);
    }

    this.bindDOMEvents();
  }

  /** Convert supported shapes to XZ solids; rotated boxes use their AABB. */
  private shapeToSolid(shape: WorldCollisionShape): SolidBox | null {
    if (shape.type === "box") {
      const half = shape.size.clone().multiplyScalar(0.5);
      if (shape.rotation) {
        // Conservative AABB of the rotated box.
        const m = new THREE.Matrix4().makeRotationFromEuler(shape.rotation);
        const corners = new THREE.Vector3();
        const ext = new THREE.Vector3();
        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            for (const sz of [-1, 1]) {
              corners
                .set(sx * half.x, sy * half.y, sz * half.z)
                .applyMatrix4(m);
              ext.set(
                Math.max(ext.x, Math.abs(corners.x)),
                Math.max(ext.y, Math.abs(corners.y)),
                Math.max(ext.z, Math.abs(corners.z)),
              );
            }
          }
        }
        return {
          minX: shape.center.x - ext.x,
          maxX: shape.center.x + ext.x,
          minZ: shape.center.z - ext.z,
          maxZ: shape.center.z + ext.z,
          minY: shape.center.y - ext.y,
          maxY: shape.center.y + ext.y,
        };
      }
      return {
        minX: shape.center.x - half.x,
        maxX: shape.center.x + half.x,
        minZ: shape.center.z - half.z,
        maxZ: shape.center.z + half.z,
        minY: shape.center.y - half.y,
        maxY: shape.center.y + half.y,
      };
    }
    if (shape.type === "cylinder") {
      const r = Math.max(shape.radiusTop, shape.radiusBottom);
      return {
        minX: shape.center.x - r,
        maxX: shape.center.x + r,
        minZ: shape.center.z - r,
        maxZ: shape.center.z + r,
        minY: shape.center.y - shape.height / 2,
        maxY: shape.center.y + shape.height / 2,
      };
    }
    if (shape.type === "sphere") {
      // Only ground-level spheres act as walk blockers.
      return {
        minX: shape.center.x - shape.radius,
        maxX: shape.center.x + shape.radius,
        minZ: shape.center.z - shape.radius,
        maxZ: shape.center.z + shape.radius,
        minY: shape.center.y - shape.radius,
        maxY: shape.center.y + shape.radius,
      };
    }
    return null;
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  addInteractionPoint(id: string, position: THREE.Vector3, radius: number): void {
    this.interactionPoints.push({ id, position: position.clone(), radius, entered: false });
  }

  removeInteractionPoint(id: string): void {
    const idx = this.interactionPoints.findIndex((p) => p.id === id);
    if (idx >= 0) this.interactionPoints.splice(idx, 1);
  }

  getEyeHeight(): number {
    return this.state.crouching ? EYE_HEIGHT_CROUCHING : EYE_HEIGHT_STANDING;
  }

  /** Small velocity-driven head bob; disabled under reduced motion. */
  getHeadBobOffset(): number {
    if (this.reducedMotion || !this.state.onGround) return 0;
    const speed = Math.hypot(this.state.velocity.x, this.state.velocity.z);
    if (speed < 0.5) return 0;
    return Math.sin(this.bobPhase) * 0.035 * Math.min(1, speed / WALK_SPEED);
  }

  update(deltaTime: number): void {
    if (deltaTime <= 0) return;
    // Gamepad right stick look (continuous, applied per-frame).
    const gl = this.gamepadLook;
    if (this.inputEnabled && Math.hypot(gl.x, gl.y) > 0.22) {
      this.applyLook(gl.x * deltaTime * 900, gl.y * deltaTime * 700, MOUSE_SENSITIVITY);
      this.options.onMotionInput?.();
    }
    this.computeWishDirection();
    if (this.wishDir.lengthSq() > 0) this.options.onMotionInput?.();
    this.applyHorizontalMotion(deltaTime);
    this.applyVerticalMotion(deltaTime);
    this.resolveSolids();
    this.clampToWorld();
    this.updateGroundAndSteps(deltaTime);
    this.updateInteractions();
    this.state.yaw = this.yaw;
    this.state.pitch = this.pitch;
  }

  private computeWishDirection(): void {
    this.wishDir.set(0, 0, 0);
    if (this.inputEnabled) {
      if (this.input.forward) this.wishDir.z -= 1;
      if (this.input.backward) this.wishDir.z += 1;
      if (this.input.left) this.wishDir.x -= 1;
      if (this.input.right) this.wishDir.x += 1;
      // Analog gamepad stick (y negative = forward, matching keyboard).
      const gm = this.gamepadMove;
      if (Math.hypot(gm.x, gm.y) > 0.22) {
        this.wishDir.x += gm.x;
        this.wishDir.z += gm.y;
      }
    }
    if (this.wishDir.lengthSq() > 0) {
      this.wishDir.normalize();
      // Camera forward at yaw is (-sin yaw, -cos yaw); rotate local wish.
      const sin = Math.sin(this.yaw);
      const cos = Math.cos(this.yaw);
      const x = this.wishDir.x * cos + this.wishDir.z * sin;
      const z = -this.wishDir.x * sin + this.wishDir.z * cos;
      this.wishDir.set(x, 0, z);
    }
  }

  private applyHorizontalMotion(dt: number): void {
    this.state.crouching =
      this.inputEnabled && (this.input.crouch || this.gamepadButtons.crouch);
    this.state.sprinting =
      this.inputEnabled &&
      (this.input.sprint || this.gamepadButtons.sprint) &&
      !this.state.crouching &&
      this.state.onGround;

    let speed = WALK_SPEED;
    if (this.state.sprinting) speed *= SPRINT_MULTIPLIER;
    if (this.state.crouching) speed *= CROUCH_MULTIPLIER;

    const vel = this.state.velocity;
    if (this.wishDir.lengthSq() > 0) {
      const targetX = this.wishDir.x * speed;
      const targetZ = this.wishDir.z * speed;
      const dx = targetX - vel.x;
      const dz = targetZ - vel.z;
      const diff = Math.hypot(dx, dz);
      if (diff > 0.001) {
        const step = Math.min(ACCELERATION * dt, diff);
        vel.x += (dx / diff) * step;
        vel.z += (dz / diff) * step;
      }
    } else {
      const speedNow = Math.hypot(vel.x, vel.z);
      if (speedNow > 0.001) {
        const step = Math.min(DECELERATION * dt, speedNow);
        vel.x -= (vel.x / speedNow) * step;
        vel.z -= (vel.z / speedNow) * step;
      } else {
        vel.x = 0;
        vel.z = 0;
      }
    }

    this.state.position.x += vel.x * dt;
    this.state.position.z += vel.z * dt;
  }

  private applyVerticalMotion(dt: number): void {
    const vel = this.state.velocity;
    const jumpHeld = this.input.jump || this.gamepadButtons.jump;
    if (this.inputEnabled && jumpHeld && !this.prevJump && this.state.onGround) {
      vel.y = JUMP_VELOCITY;
      this.state.onGround = false;
    }
    if (!this.state.onGround) {
      vel.y = Math.max(-MAX_FALL_SPEED, vel.y - GRAVITY * dt);
      this.state.position.y += vel.y * dt;
    }
    this.prevJump = jumpHeld;
  }

  /** Circle-vs-box push-out with slide; only solids overlapping player Y. */
  private resolveSolids(): void {
    const pos = this.state.position;
    const playerTop = pos.y + this.getEyeHeight() + 0.1;
    for (let iter = 0; iter < 2; iter++) {
      let pushed = false;
      for (const box of this.solids) {
        // Vertical overlap test: skip solids entirely above head or below feet.
        if (box.minY > playerTop || box.maxY < pos.y + 0.25) continue;
        const closestX = THREE.MathUtils.clamp(pos.x, box.minX, box.maxX);
        const closestZ = THREE.MathUtils.clamp(pos.z, box.minZ, box.maxZ);
        const dx = pos.x - closestX;
        const dz = pos.z - closestZ;
        const distSq = dx * dx + dz * dz;
        if (distSq >= PLAYER_RADIUS * PLAYER_RADIUS) continue;

        pushed = true;
        if (distSq > 1e-8) {
          const dist = Math.sqrt(distSq);
          const push = PLAYER_RADIUS - dist;
          pos.x += (dx / dist) * push;
          pos.z += (dz / dist) * push;
        } else {
          // Center inside the box: push out along the shallowest axis.
          const toLeft = pos.x - box.minX;
          const toRight = box.maxX - pos.x;
          const toBack = pos.z - box.minZ;
          const toFront = box.maxZ - pos.z;
          const min = Math.min(toLeft, toRight, toBack, toFront);
          if (min === toLeft) pos.x = box.minX - PLAYER_RADIUS;
          else if (min === toRight) pos.x = box.maxX + PLAYER_RADIUS;
          else if (min === toBack) pos.z = box.minZ - PLAYER_RADIUS;
          else pos.z = box.maxZ + PLAYER_RADIUS;
        }
      }
      if (!pushed) break;
    }
  }

  private clampToWorld(): void {
    const limit = this.options.worldHalfSize - 1;
    this.state.position.x = THREE.MathUtils.clamp(this.state.position.x, -limit, limit);
    this.state.position.z = THREE.MathUtils.clamp(this.state.position.z, -limit, limit);
  }

  private updateGroundAndSteps(dt: number): void {
    const pos = this.state.position;
    const groundY = this.options.groundHeightAt(pos.x, pos.z);

    if (this.state.onGround) {
      // Follow terrain continuously (up dunes and down slopes alike).
      pos.y = groundY;
      this.state.velocity.y = 0;
    } else if (pos.y <= groundY) {
      pos.y = groundY;
      this.state.velocity.y = 0;
      this.state.onGround = true;
    }

    const horizSpeed = Math.hypot(this.state.velocity.x, this.state.velocity.z);
    if (this.state.onGround && horizSpeed > 0.5) {
      this.bobPhase += dt * (6 + horizSpeed * 1.6);
      this.stepTimer += dt;
      const interval = this.stepInterval / Math.min(1.4, horizSpeed / WALK_SPEED + 0.4);
      if (this.stepTimer >= interval) {
        this.stepTimer = 0;
        this.options.onFootstep?.(this.tmp.copy(pos), "sand");
      }
    } else {
      this.stepTimer = 0;
    }
  }

  private updateInteractions(): void {
    const pos = this.state.position;
    for (const point of this.interactionPoints) {
      const dx = pos.x - point.position.x;
      const dz = pos.z - point.position.z;
      const inside = dx * dx + dz * dz <= point.radius * point.radius;
      if (inside && !point.entered) {
        point.entered = true;
        this.options.onInteractionEnter?.(point.id);
      } else if (!inside && point.entered) {
        point.entered = false;
        this.options.onInteractionExit?.(point.id);
      }
    }
  }

  // ==================== Input ====================

  handleKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.input.forward = true;
        event.preventDefault();
        break;
      case "KeyS":
      case "ArrowDown":
        this.input.backward = true;
        event.preventDefault();
        break;
      case "KeyA":
      case "ArrowLeft":
        this.input.left = true;
        event.preventDefault();
        break;
      case "KeyD":
      case "ArrowRight":
        this.input.right = true;
        event.preventDefault();
        break;
      case "Space":
        this.input.jump = true;
        event.preventDefault();
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.input.sprint = true;
        break;
      case "ControlLeft":
      case "ControlRight":
      case "KeyC":
        this.input.crouch = true;
        break;
    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.input.forward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        this.input.backward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.input.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        this.input.right = false;
        break;
      case "Space":
        this.input.jump = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.input.sprint = false;
        break;
      case "ControlLeft":
      case "ControlRight":
      case "KeyC":
        this.input.crouch = false;
        break;
    }
  }

  /** Pointer-locked look, or drag-look when not locked. */
  handleMouseMove(event: MouseEvent): void {
    if (!this.inputEnabled) return;
    if (this.pointerLocked) {
      this.applyLook(event.movementX, event.movementY, MOUSE_SENSITIVITY);
    } else if (this.dragging) {
      this.applyLook(
        event.clientX - this.dragLast.x,
        event.clientY - this.dragLast.y,
        DRAG_LOOK_SENSITIVITY,
      );
      this.dragLast = { x: event.clientX, y: event.clientY };
    }
  }

  private applyLook(dx: number, dy: number, sensitivity: number): void {
    this.yaw -= dx * sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy * sensitivity, PITCH_MIN, PITCH_MAX);
    this.options.onMotionInput?.();
  }

  /**
   * Feed analog gamepad state (called by the host once per frame).
   * move: left stick (x right+, y back+). look: right stick. Buttons are held
   * states. Passing zeros releases everything — no synthetic key events.
   */
  setGamepadState(
    move: { x: number; y: number },
    look: { x: number; y: number },
    buttons: { sprint?: boolean; crouch?: boolean; jump?: boolean },
  ): void {
    this.gamepadMove.x = move.x;
    this.gamepadMove.y = move.y;
    this.gamepadLook.x = look.x;
    this.gamepadLook.y = look.y;
    this.gamepadButtons.sprint = Boolean(buttons.sprint);
    this.gamepadButtons.crouch = Boolean(buttons.crouch);
    this.gamepadButtons.jump = Boolean(buttons.jump);
  }

  requestPointerLock(canvas: HTMLCanvasElement): void {
    if (this.pointerLocked) return;
    try {
      const result = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
      result?.catch?.(() => undefined);
    } catch {
      // Drag-look fallback remains available.
    }
  }

  handleTouchStart(event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      if (touch.clientX < window.innerWidth / 2) {
        if (this.touchMoveId === null) {
          this.touchMoveId = touch.identifier;
          this.touchMoveStart = { x: touch.clientX, y: touch.clientY };
        }
      } else if (this.touchLookId === null) {
        this.touchLookId = touch.identifier;
        this.touchLookLast = { x: touch.clientX, y: touch.clientY };
      }
    }
    event.preventDefault();
  }

  handleTouchMove(event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.touchMoveId) {
        let dx = touch.clientX - this.touchMoveStart.x;
        let dy = touch.clientY - this.touchMoveStart.y;
        const mag = Math.hypot(dx, dy);
        if (mag > TOUCH_MAX_RADIUS) {
          dx *= TOUCH_MAX_RADIUS / mag;
          dy *= TOUCH_MAX_RADIUS / mag;
        }
        this.input.forward = dy < -TOUCH_DEADZONE;
        this.input.backward = dy > TOUCH_DEADZONE;
        this.input.left = dx < -TOUCH_DEADZONE;
        this.input.right = dx > TOUCH_DEADZONE;
      } else if (touch.identifier === this.touchLookId) {
        this.applyLook(
          touch.clientX - this.touchLookLast.x,
          touch.clientY - this.touchLookLast.y,
          TOUCH_LOOK_SENSITIVITY,
        );
        this.touchLookLast = { x: touch.clientX, y: touch.clientY };
      }
    }
    event.preventDefault();
  }

  handleTouchEnd(event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.touchMoveId) {
        this.touchMoveId = null;
        this.input.forward = false;
        this.input.backward = false;
        this.input.left = false;
        this.input.right = false;
      } else if (touch.identifier === this.touchLookId) {
        this.touchLookId = null;
      }
    }
  }

  private bindDOMEvents(): void {
    const signal = this.abort.signal;
    window.addEventListener("keydown", (e) => this.handleKeyDown(e), { signal, passive: false });
    window.addEventListener("keyup", (e) => this.handleKeyUp(e), { signal });
    window.addEventListener("mousemove", (e) => this.handleMouseMove(e), { signal });
    window.addEventListener("mousedown", (e) => {
      if (e.button === 0 && !this.pointerLocked) {
        this.dragging = true;
        this.dragLast = { x: e.clientX, y: e.clientY };
      }
    }, { signal });
    window.addEventListener("mouseup", () => { this.dragging = false; }, { signal });
    window.addEventListener("blur", () => {
      this.dragging = false;
      this.resetInput();
    }, { signal });
    window.addEventListener("touchstart", (e) => this.handleTouchStart(e), { signal, passive: false });
    window.addEventListener("touchmove", (e) => this.handleTouchMove(e), { signal, passive: false });
    window.addEventListener("touchend", (e) => this.handleTouchEnd(e), { signal });
    window.addEventListener("touchcancel", (e) => this.handleTouchEnd(e), { signal });
    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement !== null;
      if (!this.pointerLocked) this.dragging = false;
    }, { signal });
  }

  private resetInput(): void {
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      crouch: false,
    };
  }

  dispose(): void {
    this.abort.abort();
    this.interactionPoints = [];
    if (this.pointerLocked && document.exitPointerLock) {
      try { document.exitPointerLock(); } catch { /* best effort */ }
    }
  }

  teleport(position: THREE.Vector3, yaw?: number): void {
    const groundY = this.options.groundHeightAt(position.x, position.z);
    this.state.position.set(position.x, groundY, position.z);
    this.state.velocity.set(0, 0, 0);
    this.state.onGround = true;
    if (yaw !== undefined) {
      this.yaw = yaw;
      this.state.yaw = yaw;
    }
  }

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
    if (!enabled) this.resetInput();
  }

  getCameraDirection(): THREE.Vector3 {
    const cosPitch = Math.cos(this.pitch);
    return new THREE.Vector3(
      -Math.sin(this.yaw) * cosPitch,
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * cosPitch,
    );
  }
}
