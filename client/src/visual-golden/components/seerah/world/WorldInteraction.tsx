/**
 * WorldInteraction — Proximity-based interaction system for the Living Seerah World.
 *
 * Features:
 * - Raycast and proximity detection for interaction points
 * - Contextual HUD prompts (Arabic)
 * - Governed content linking (chapter, event, atlas, database)
 * - Keyboard/gamepad/touch activation
 * - Interaction cooldown and debouncing
 * - Accessibility: screen reader announcements, keyboard navigation
 */

import * as THREE from "three";
import type { WorldInteractionPoint, WorldPlayerState, WorldRuntimeContext } from "./world-types";
import { buildTravelUrl } from "./WorldTravel";

/** Interaction prompt data for HUD. */
export interface InteractionPrompt {
  point: WorldInteractionPoint;
  distance: number;
  /** Screen position for HUD (if using 2D overlay). */
  screenPosition?: { x: number; y: number };
}

/** Interaction result. */
export interface InteractionResult {
  success: boolean;
  point: WorldInteractionPoint;
  action: "navigate" | "custom" | "none";
  url?: string;
}

/** Interaction key: E only. Space is jump, Enter is UI activation. */
const INTERACTION_KEYS = ["KeyE"];
const INTERACTION_GAMEPAD_BUTTON = 0; // A button

/** Options for the interaction system. */
export interface WorldInteractionOptions {
  /**
   * The id of the scene the traveller is currently in. Travel gates need
   * it to build a route that remembers where the journey started — with
   * no origin, a gate resolves to nothing instead of guessing.
   */
  sceneId?: string;
}

export class WorldInteraction {
  private readonly context: WorldRuntimeContext;
  private readonly sceneId: string | null;
  private points: WorldInteractionPoint[] = [];
  private activePrompt: InteractionPrompt | null = null;
  private lastInteractionTime = 0;
  private interactionCooldown = 500; // ms
  private raycastInterval = 0;
  private readonly raycastFrequency = 0.1; // seconds
  private onInteractionCallback?: (result: InteractionResult) => void;
  private onPromptChangeCallback?: (prompt: InteractionPrompt | null) => void;
  // Persistent invisible raycast targets — built once per point, never per tick.
  private readonly raycaster = new THREE.Raycaster();
  private readonly centerNdc = new THREE.Vector2(0, 0);
  private targetMeshes: THREE.Mesh[] = [];

  constructor(context: WorldRuntimeContext, options: WorldInteractionOptions = {}) {
    this.context = context;
    this.sceneId = options.sceneId ?? null;
    this.raycaster.far = 8; // Max interaction distance
  }

  /** Register an interaction point. */
  addPoint(point: WorldInteractionPoint): void {
    this.points.push(point);
    // Invisible proxy sphere for crosshair raycast; added once, disposed later.
    const geo = new THREE.SphereGeometry(Math.min(point.radius, 2.5), 8, 6);
    const mat = new THREE.MeshBasicMaterial({ visible: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(point.position);
    mesh.userData.interactionPoint = point;
    this.context.scene.add(mesh);
    this.targetMeshes.push(mesh);
  }

  /** Remove an interaction point by ID. */
  removePoint(id: string): void {
    const idx = this.points.findIndex((p) => p.id === id);
    if (idx >= 0) this.points.splice(idx, 1);
    const meshIdx = this.targetMeshes.findIndex(
      (m) => (m.userData.interactionPoint as WorldInteractionPoint).id === id,
    );
    if (meshIdx >= 0) {
      const mesh = this.targetMeshes[meshIdx];
      this.context.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      this.targetMeshes.splice(meshIdx, 1);
    }
  }

  /** Set callback for when interaction occurs. */
  onInteract(callback: (result: InteractionResult) => void): void {
    this.onInteractionCallback = callback;
  }

  /** Set callback for when prompt changes (for HUD). */
  onPromptChange(callback: (prompt: InteractionPrompt | null) => void): void {
    this.onPromptChangeCallback = callback;
  }

  /** Update interaction system (call each frame). */
  update(deltaTime: number, playerState: WorldPlayerState, camera: THREE.Camera): void {
    this.raycastInterval += deltaTime;
    if (this.raycastInterval < this.raycastFrequency) return;
    this.raycastInterval = 0;

    this.updateProximity(playerState);
    this.updateRaycast(playerState, camera);
  }

  /** Check proximity to interaction points. */
  private updateProximity(playerState: WorldPlayerState): void {
    const pos = playerState.position;
    let closest: InteractionPrompt | null = null;
    let closestDist = Infinity;

    for (const point of this.points) {
      // Horizontal distance: points carry a nominal y=2 while the player's
      // feet follow the terrain — a 3D measure would silently shrink every
      // radius on raised ground (the camp prompt never fired on dunes).
      const dx = pos.x - point.position.x;
      const dz = pos.z - point.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= point.radius) {
        if (dist < closestDist) {
          closestDist = dist;
          closest = { point, distance: dist };
        }
      }
    }

    if (closest?.point.id !== this.activePrompt?.point.id) {
      this.activePrompt = closest;
      this.onPromptChangeCallback?.(closest);
    } else if (closest && this.activePrompt) {
      // Same point: keep distance fresh without notifying React each tick.
      this.activePrompt.distance = closest.distance;
    }
  }

  /** Raycast from camera center for precise interaction (crosshair). */
  private updateRaycast(playerState: WorldPlayerState, camera: THREE.Camera): void {
    if (this.targetMeshes.length === 0) return;

    this.raycaster.setFromCamera(this.centerNdc, camera);
    const intersects = this.raycaster.intersectObjects(this.targetMeshes, false);

    // Raycast hit takes priority over proximity for "looking at" interaction
    if (intersects.length > 0) {
      const hitPoint = intersects[0].object.userData.interactionPoint as WorldInteractionPoint;
      const dist = Math.hypot(
        playerState.position.x - hitPoint.position.x,
        playerState.position.z - hitPoint.position.z,
      );
      if (dist <= hitPoint.radius * 1.5) { // Slightly generous for raycast
        if (hitPoint.id !== this.activePrompt?.point.id) {
          const prompt: InteractionPrompt = { point: hitPoint, distance: dist };
          this.activePrompt = prompt;
          this.onPromptChangeCallback?.(prompt);
        } else if (this.activePrompt) {
          this.activePrompt.distance = dist;
        }
      }
    }
  }

  /** Attempt to interact with the current prompt. */
  tryInteract(): InteractionResult | null {
    if (!this.activePrompt) return null;

    const now = Date.now();
    if (now - this.lastInteractionTime < this.interactionCooldown) return null;
    this.lastInteractionTime = now;

    const point = this.activePrompt.point;
    let result: InteractionResult;

    if (point.onInteract) {
      // Custom handler
      point.onInteract();
      result = { success: true, point, action: "custom" };
    } else if (point.targetRef) {
      // Governed content navigation
      const url = this.buildTargetUrl(point.targetRef);
      if (url) {
        result = { success: true, point, action: "navigate", url };
        // Navigation handled by caller
      } else {
        result = { success: false, point, action: "none" };
      }
    } else {
      result = { success: false, point, action: "none" };
    }

    this.onInteractionCallback?.(result);
    return result;
  }

  /** Build URL for governed content target. */
  private buildTargetUrl(ref: WorldInteractionPoint["targetRef"]): string | null {
    if (!ref) return null;
    switch (ref.type) {
      case "event":
        // Event-only deep link: SeerahPage resolves the owning chapter itself,
        // so an event can never be paired with the wrong chapter.
        return `/seerah?event=${encodeURIComponent(ref.id)}`;
      case "chapter":
        return `/seerah?chapter=${encodeURIComponent(ref.id)}`;
      case "atlas":
        return `/atlas?place=${encodeURIComponent(ref.id)}`;
      case "database":
        return `/seerah/database?event=${encodeURIComponent(ref.id)}`;
      case "scene": {
        // Travel gate: the destination and the origin both travel with the
        // route so the arrival pose can be resolved exactly.
        if (!this.sceneId) return null;
        return buildTravelUrl(this.sceneId, ref.id);
      }
      default:
        return null;
    }
  }

  /** Handle keyboard input for interaction. */
  handleKeyDown(event: KeyboardEvent): boolean {
    if (INTERACTION_KEYS.includes(event.code)) {
      const result = this.tryInteract();
      if (result?.success) {
        event.preventDefault();
        return true;
      }
    }
    return false;
  }

  /** Handle gamepad input for interaction. */
  handleGamepadButtonPressed(buttonIndex: number): boolean {
    if (buttonIndex === INTERACTION_GAMEPAD_BUTTON) {
      const result = this.tryInteract();
      return result?.success ?? false;
    }
    return false;
  }

  /** Handle touch interaction (tap on prompt). */
  handleTouchInteraction(): boolean {
    const result = this.tryInteract();
    return result?.success ?? false;
  }

  /** Get current active prompt for HUD rendering. */
  getActivePrompt(): InteractionPrompt | null {
    return this.activePrompt;
  }

  /** Clear current prompt (e.g., on pause). */
  clearPrompt(): void {
    this.activePrompt = null;
    this.onPromptChangeCallback?.(null);
  }

  /** Set interaction cooldown. */
  setCooldown(ms: number): void {
    this.interactionCooldown = Math.max(0, ms);
  }

  /** Dispose. */
  dispose(): void {
    for (const mesh of this.targetMeshes) {
      this.context.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    this.targetMeshes = [];
    this.points = [];
    this.activePrompt = null;
    this.onInteractionCallback = undefined;
    this.onPromptChangeCallback = undefined;
  }
}

/** HUD prompt renderer (React component for use in JSX). */
export function InteractionPromptDisplay({
  prompt,
  t,
}: {
  prompt: InteractionPrompt | null;
  t: (key: string) => string;
}): React.ReactElement | null {
  if (!prompt) return null;

  return (
    <div className="world-interaction-prompt" role="status" aria-live="polite">
      <span className="prompt-icon" aria-hidden>⟳</span>
      <span className="prompt-label">{prompt.point.labelAr}</span>
      <span className="prompt-hint">{t("pressToInteract") || "اضغط E للتفاعل"}</span>
    </div>
  );
}

/** Default Arabic translations for interaction prompts. */
export const INTERACTION_TRANSLATIONS = {
  pressToInteract: "اضغط E للتفاعل",
  pressToEnter: "اضغط E للدخول",
  pressToRead: "اضغط E للقراءة",
  pressToView: "اضغط E للعرض",
  interactionPoint: "نقطة تفاعل",
  loadingContent: "جاري تحميل المحتوى…",
} as const;