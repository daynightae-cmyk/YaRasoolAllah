/**
 * LivingSeerahWorld — The main walkable 3D world experience.
 *
 * Integrates all world systems on top of the shared ThreeRuntime (one rAF
 * scheduler, one renderer, one lifecycle owner):
 * - FirstPersonController for continuous movement + collision
 * - WorldTerrain for procedural ground (analytic height sampler)
 * - WorldAtmosphere for sky, fog, particles
 * - WorldLife for animated entities (with solid colliders)
 * - WorldAudio for opt-in synthesized spatial sound
 * - WorldInteraction for proximity interactions → governed content
 * - WorldHUD for in-world UI
 *
 * Entry: /seerah/world (with optional ?scene= query)
 * Exit: Returns to /seerah reading experience (wouter navigation).
 *
 * Religious guardrails: no depiction of the Prophet ﷺ or companions, no
 * fabricated quotes; every scene carries an artistic-reconstruction
 * disclosure and links only to governed Seerah records.
 */

import { useCallback, useEffect, useRef, useState, useMemo, Suspense, lazy } from "react";
import * as THREE from "three";
import { ThreeRuntime, type ThreeRuntimeContext, type ThreeSceneAdapter } from "@/visual-golden/components/three/three-runtime";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import { FirstPersonController } from "./FirstPersonController";
import { generateWorldTerrain, sampleTerrainHeight } from "./WorldTerrain";
import {
  createSkyDome,
  createHorizonMeshes,
  setupFog,
  createSunLight,
  createSunGlow,
  createDustMotes,
  updateDustMotes,
  settleDustMotes,
  createHemisphereLight,
  createNightStars,
  updateNightStars,
  FootstepDust,
  WorldParticleSystem,
} from "./WorldAtmosphere";
import { WorldLife } from "./WorldLife";
import { WorldAudio } from "./WorldAudio";
import { WorldInteraction, type InteractionPrompt } from "./WorldInteraction.tsx";
import { getWorldScene, DEFAULT_WORLD_SCENE } from "./WorldSceneRegistry";
import { AmbientCrowdManager } from "./ambient/AmbientCrowdManager";
import { AMBIENT_SCENE_PRESETS } from "./ambient/AmbientPresetRegistry";
import type { AmbientPresetName, AmbientQualityTier } from "./ambient/AmbientTypes";
import type { WorldGraphicsTier, WorldPlayerState, WorldRuntimeContext, WorldSceneHandle } from "./world-types";
import styles from "./LivingSeerahWorld.module.css";

// Lazy-load HUD to reduce initial bundle.
const WorldHUDComponent = lazy(() => import("./WorldHUD").then((m) => ({ default: m.WorldHUD })));

interface LivingSeerahWorldProps {
  /** Scene ID to load (defaults to desert-camp). */
  sceneId?: string;
  /** Callback when user exits the world. */
  onExit: () => void;
  /** Callback when WebGL is unavailable. */
  onUnavailable: () => void;
  /** Navigate to governed content (wouter navigate from the host page). */
  onNavigate?: (url: string) => void;
  /** Full viewport immersive mode. */
  immersive?: boolean;
  /** Initial player position override. */
  initialPosition?: THREE.Vector3;
  /** Initial yaw override. */
  initialYaw?: number;
  /**
   * Arabic name of the scene the traveller came from. When present, the
   * world opens with a cinematic travel transition instead of the plain
   * title card.
   */
  travelFromAr?: string;
  /** Current scene id (used by the HUD station log). */
  onSceneVisited?: (sceneId: string) => void;
}

/** HUD state is throttled — React must not re-render at frame rate. */
const HUD_UPDATE_INTERVAL = 0.12; // ~8 Hz
/** Keep discrete frames flowing briefly after input under reduced motion. */
const REDUCED_MOTION_GRACE_SECONDS = 0.7;
/** Base vertical field of view for the world camera. */
const BASE_FOV = 70;
/** Extra lens width while sprinting — the world opens up at speed. */
const SPRINT_FOV_BONUS = 9;

const EMPTY_PLAYER_STATE: WorldPlayerState = {
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  onGround: false,
  sprinting: false,
  crouching: false,
};

export function LivingSeerahWorld({
  sceneId = "desert-camp",
  onExit,
  onUnavailable,
  onNavigate,
  immersive = true,
  initialPosition,
  initialYaw,
  travelFromAr,
  onSceneVisited,
}: LivingSeerahWorldProps) {
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";

  const rootRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ThreeRuntime | null>(null);

  // World systems (owned by the runtime build, released via registerDisposable).
  const controllerRef = useRef<FirstPersonController | null>(null);
  const audioRef = useRef<WorldAudio | null>(null);

  // HUD state (throttled snapshots — never per-frame setState).
  const [playerState, setPlayerState] = useState<WorldPlayerState>(EMPTY_PLAYER_STATE);
  const [graphicsTier, setGraphicsTier] = useState<WorldGraphicsTier>("balanced");
  const [worldNameAr, setWorldNameAr] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState<InteractionPrompt | null>(null);
  const [audioState, setAudioState] = useState<{ muted: boolean; volume: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  const [entranceGone, setEntranceGone] = useState(false);
  // Travel veil: shown while the traveller arrives from another scene.
  const [travelVeil, setTravelVeil] = useState(() => Boolean(travelFromAr));

  // Travel arrival transition (reduced motion: no veil at all).
  useEffect(() => {
    if (!travelFromAr) {
      setTravelVeil(false);
      return;
    }
    if (reducedMotion) {
      setTravelVeil(false);
      return;
    }
    setTravelVeil(true);
    const timer = setTimeout(() => setTravelVeil(false), 2600);
    return () => clearTimeout(timer);
  }, [travelFromAr, reducedMotion]);

  // Scene config (stable per sceneId).
  const sceneConfig = useMemo(() => getWorldScene(sceneId) ?? DEFAULT_WORLD_SCENE, [sceneId]);

  // Live refs so the adapter never depends on changing callbacks/state.
  const callbacksRef = useRef({ onExit, onUnavailable, onNavigate, onSceneVisited });
  callbacksRef.current = { onExit, onUnavailable, onNavigate, onSceneVisited };
  const motionRef = useRef(reducedMotion);
  motionRef.current = reducedMotion;
  const initialRef = useRef({ position: initialPosition, yaw: initialYaw });
  initialRef.current = { position: initialPosition, yaw: initialYaw };
  const gestureRef = useRef(false);
  const hudTimerRef = useRef(0);
  const reducedGraceRef = useRef(0);
  const dustMotesRef = useRef<THREE.Points | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const footDustRef = useRef<FootstepDust | null>(null);

  const initializeWorld = useCallback(async (threeContext: ThreeRuntimeContext): Promise<WorldSceneHandle> => {
    const { renderer, graphicsTier: tier, shadowsEnabled, registerDisposable, signal, host } = threeContext;
    const config = sceneConfig;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(BASE_FOV, Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight), 0.1, 500);

    setGraphicsTier(tier);

    // Shared time + player view for subsystems (mutated per frame, no React).
    const timeState = { delta: 0, elapsed: 0 };
    const worldContext: WorldRuntimeContext = {
      renderer,
      host,
      scene,
      camera,
      graphicsTier: tier,
      shadowsEnabled,
      signal,
      invalidate: () => threeContext.invalidate(),
      registerDisposable,
      playerState: { ...EMPTY_PLAYER_STATE, position: new THREE.Vector3(), velocity: new THREE.Vector3() },
      get deltaTime() { return timeState.delta; },
      get elapsedTime() { return timeState.elapsed; },
    };

    // ---- CINEMATIC COLOR PIPELINE ----
    // ACES filmic tone mapping (same treatment as the Library halls and the
    // entrance door) — golden highlights roll off softly instead of clipping,
    // and shadow detail survives. Restored on dispose for the shared runtime.
    const prevToneMapping = renderer.toneMapping;
    const prevExposure = renderer.toneMappingExposure;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    registerDisposable(() => {
      renderer.toneMapping = prevToneMapping;
      renderer.toneMappingExposure = prevExposure;
    });

    // ---- ATMOSPHERE ----
    setupFog(scene, config);
    scene.background = new THREE.Color(config.skyColor);

    const skyDome = createSkyDome(config, tier);
    scene.add(skyDome);
    registerDisposable(() => {
      skyDome.geometry.dispose();
      (skyDome.material as THREE.Material).dispose();
    });

    const horizonGroup = createHorizonMeshes(config, tier, shadowsEnabled);
    scene.add(horizonGroup);
    registerDisposable(() => {
      horizonGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
    });

    const sun = createSunLight(config, shadowsEnabled);
    scene.add(sun);
    registerDisposable(() => { sun.shadow?.map?.dispose(); });

    const hemi = createHemisphereLight(config);
    scene.add(hemi);

    // Warm bounce fill from the anti-sun side (no shadows): rock faces turned
    // away from the sun keep a believable golden-hour bounce instead of
    // collapsing to black under ACES.
    const bounce = new THREE.DirectionalLight(
      new THREE.Color(config.sunColor).lerp(new THREE.Color(config.groundColor), 0.5),
      0.5,
    );
    bounce.position.copy(config.sunPosition.clone().negate().setY(Math.abs(config.sunPosition.y) * 0.6));
    scene.add(bounce);

    // ---- CINEMATIC SUN GLOW (camera-facing sprites, not a light source) ----
    const sunGlow = createSunGlow(config);
    scene.add(sunGlow);
    registerDisposable(() => {
      sunGlow.traverse((obj) => {
        if (obj instanceof THREE.Sprite) obj.material.dispose();
      });
      (sunGlow.userData.glowTexture as THREE.Texture | undefined)?.dispose();
    });

    // ---- DUST MOTES (GPU-animated; static under reduced motion) ----
    const dustMotes = createDustMotes(config, tier);
    dustMotesRef.current = dustMotes;
    scene.add(dustMotes);
    registerDisposable(() => {
      dustMotes.geometry.dispose();
      const m = dustMotes.material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m.dispose();
      if (dustMotesRef.current === dustMotes) dustMotesRef.current = null;
    });

    // ---- NIGHT STARS (night scenes only) ----
    // A moonless desert sky needs a real sky: hundreds of twinkling
    // points instead of a flat black gradient.
    if (config.night) {
      const stars = createNightStars(config, tier);
      starsRef.current = stars;
      scene.add(stars);
      registerDisposable(() => {
        stars.geometry.dispose();
        const m = stars.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m.dispose();
        if (starsRef.current === stars) starsRef.current = null;
      });
    }

    // ---- TERRAIN ----
    const { ground, collisionShapes, instances, disposables: terrainDisposables } =
      generateWorldTerrain(config, tier, shadowsEnabled);
    scene.add(ground);
    for (const inst of instances) scene.add(inst);
    for (const dispose of terrainDisposables) registerDisposable(dispose);

    const groundHeightAt = (x: number, z: number) => sampleTerrainHeight(ground, x, z);
    const worldHalfSize = Math.max(config.bounds.width, config.bounds.depth) / 2;

    // ---- PARTICLES ----
    const particleSystems: WorldParticleSystem[] = [];
    for (const pConfig of config.particles) {
      const ps = new WorldParticleSystem(worldContext, pConfig);
      scene.add(ps.build());
      particleSystems.push(ps);
      registerDisposable(() => ps.dispose());
    }

    // ---- LIFE (with solid colliders) ----
    // Entities cluster around the scene's points of interest — the camp,
    // the well, the mosque yard — instead of scattering uniformly across
    // the map where a giant tent could land on the spawn point and stare
    // the player into a wall.
    const life = new WorldLife(worldContext, tier);
    const anchors = [...config.interactions, ...config.exits].map((p) => p.position);
    const ambientCoversCamels = (AMBIENT_SCENE_PRESETS[config.id] ?? [])
      .some((preset) => preset === "camp" || preset === "caravan" || preset === "market");
    for (const entityConfig of config.lifeEntities) {
      // Preserve the legacy creator, but do not render two uncoordinated
      // camel populations where the NavGrid caravan/camp preset owns them.
      if (ambientCoversCamels && entityConfig.id.includes("camel")) continue;
      const seed = hashString(entityConfig.id + config.seed.toString());
      const random = mulberry(seed);
      const anchor = anchors[Math.floor(random() * anchors.length)] ?? new THREE.Vector3();
      const angle = random() * Math.PI * 2;
      const radius = 5 + random() * 13;
      const position = new THREE.Vector3(
        anchor.x + Math.cos(angle) * radius,
        0,
        anchor.z + Math.sin(angle) * radius,
      );
      position.y = groundHeightAt(position.x, position.z) + 0.1;

      if (entityConfig.id.includes("camel")) {
        life.createCamel(position, 1, seed);
      } else if (entityConfig.id.includes("tent")) {
        life.createTent(position, 1, seed);
      } else if (entityConfig.id.includes("awning")) {
        life.createAwning(position, 3, 2, seed);
      } else if (entityConfig.id.includes("palm")) {
        life.createPalm(position, 1, seed);
      }
    }
    life.setGroundSampler(groundHeightAt);
    registerDisposable(() => life.dispose());

    // ---- SCENE PROPS (well, campfire) ----
    // Authored props stand at exact positions (the camp well beside the
    // caravan road, the watch-fire on the trench edge) — the random
    // life-entity scatter would never land them beside their subject.
    for (const prop of config.props ?? []) {
      const propPosition = prop.position.clone();
      propPosition.y = groundHeightAt(propPosition.x, propPosition.z);
      if (prop.type === "well") {
        life.createWell(propPosition, prop.scale ?? 1, hashString(prop.id));
      } else if (prop.type === "campfire") {
        life.createCampfire(propPosition, prop.scale ?? 1, hashString(prop.id));
      }
    }

    // ---- FOOTSTEP DUST ----
    const footDust = new FootstepDust(worldContext, tier);
    footDustRef.current = footDust;

    // ---- AUDIO (opt-in; synthesized, no fetched assets) ----
    const audio = new WorldAudio();
    audioRef.current = audio;
    try {
      await audio.initialize({
        zones: config.audioZones,
        graphicsTier: tier,
        reducedMotion: motionRef.current,
      });
    } catch (e) {
      console.warn("[WorldAudio] Initialization failed:", e);
    }
    registerDisposable(() => {
      audio.dispose();
      if (audioRef.current === audio) audioRef.current = null;
    });

    // ---- INTERACTION ----
    const interaction = new WorldInteraction(worldContext, { sceneId: config.id });
    const allPoints = [...config.interactions, ...config.exits];
    for (const point of allPoints) interaction.addPoint(point);
    interaction.onPromptChange((prompt) => setCurrentPrompt(prompt));
    interaction.onInteract((result) => {
      if (result.success && result.action === "navigate" && result.url) {
        const navigate = callbacksRef.current.onNavigate;
        if (navigate) {
          navigate(result.url);
        } else {
          window.location.assign(result.url);
        }
      }
    });
    registerDisposable(() => interaction.dispose());

    // E activates interaction; the controller owns movement keys itself.
    const onInteractionKey = (event: KeyboardEvent) => {
      interaction.handleKeyDown(event);
    };
    window.addEventListener("keydown", onInteractionKey, { signal });

    // ---- FIRST PERSON CONTROLLER (new API) ----
    const staticCollisionShapes = collisionShapes.concat(life.getCollisionShapes());
    const startPos = initialRef.current.position ?? config.entryPosition;
    const startYaw = initialRef.current.yaw ?? config.entryYaw;
    const controller = new FirstPersonController(
      staticCollisionShapes,
      startPos,
      startYaw,
      {
        groundHeightAt,
        worldHalfSize,
        reducedMotion: motionRef.current,
        onFootstep: (pos) => {
          void audio.playFootstep(pos, "sand");
          // Dust intensity follows the actual speed — sprinting kicks up
          // a visible cloud, walking only a wisp.
          const speed = controllerRef.current?.getHorizontalSpeed() ?? 0;
          footDust.emit(pos, speed > 5 ? 1.4 : 0.85);
        },
        onInteractionEnter: (id) => {
          const point = allPoints.find((p) => p.id === id);
          if (point) void audio.playEnvironmental("cloth", point.position);
        },
        onMotionInput: () => {
          // Under reduced motion the runtime renders discrete frames only;
          // keep them flowing while the user-driven experience is moving.
          reducedGraceRef.current = REDUCED_MOTION_GRACE_SECONDS;
          threeContext.invalidate();
        },
      },
    );
    controllerRef.current = controller;
    for (const point of allPoints) controller.addInteractionPoint(point.id, point.position, point.radius);
    registerDisposable(() => {
      controller.dispose();
      if (controllerRef.current === controller) controllerRef.current = null;
    });

    // ---- OPTIONAL ANONYMOUS AMBIENT POPULATION ----
    // Construction is cheap, but NavGrid/entity creation starts only after the
    // essential scene and controls are ready. This manager owns no renderer or
    // animation loop; it is updated by the same ThreeRuntime frame below.
    const ambient = new AmbientCrowdManager({
      sceneConfig: config,
      context: worldContext,
      collisionShapes: staticCollisionShapes,
      groundHeightAt,
    });
    let ambientState: "scheduled" | "loading" | "ready" | "isolated-error" = "scheduled";
    ambient.setReducedMotion(motionRef.current);
    controller.setDynamicCollisionSource((position) => ambient.getCollisionShapesNear(position));
    host.dataset.worldAmbientState = ambientState;
    registerDisposable(() => {
      controller.setDynamicCollisionSource(null);
      ambient.dispose();
    });
    const ambientTimer = window.setTimeout(() => {
      void (async () => {
        try {
          ambientState = "loading";
          host.dataset.worldAmbientState = ambientState;
          await ambient.initialize(signal);
          const presets = AMBIENT_SCENE_PRESETS[config.id] ?? [];
          for (let i = 0; i < presets.length; i++) {
            if (signal.aborted) return;
            await ambient.spawnPresetCrowd(presets[i], { append: i > 0 });
          }
          if (signal.aborted) return;
          ambientState = "ready";
          host.dataset.worldAmbientState = ambientState;
        } catch (error) {
          // Optional population failure must never tear down the living world.
          if (signal.aborted) return;
          ambientState = "isolated-error";
          host.dataset.worldAmbientState = ambientState;
          console.warn("[AmbientWorld] Optional population isolated:", error);
        }
      })();
    }, 120);
    registerDisposable(() => window.clearTimeout(ambientTimer));

    // Camera starts at the player's eyes.
    camera.position.copy(controller.state.position);
    camera.position.y += controller.getEyeHeight();

    setWorldNameAr(config.nameAr);
    setLoading(false);
    setAudioState({ muted: audio.isMuted(), volume: audio.getMasterVolume() });
    // Record the visit so the station log can show the traveller's route.
    callbacksRef.current.onSceneVisited?.(config.id);

    // Cinematic entrance: brief golden title card, then fade out to reveal
    // the world. Reduced motion gets an immediate reveal (no timer drama).
    if (motionRef.current) {
      setEntered(true);
      setEntranceGone(true);
    } else {
      const entranceTimer = setTimeout(() => setEntered(true), 2200);
      const removeTimer = setTimeout(() => setEntranceGone(true), 3600);
      registerDisposable(() => { clearTimeout(entranceTimer); clearTimeout(removeTimer); });
    }

    // Pointer lock + audio unlock on canvas click (user gesture).
    const canvas = renderer.domElement;
    const requestLock = () => {
      controller.requestPointerLock(canvas);
      if (!gestureRef.current) {
        gestureRef.current = true;
        audio.onUserGesture();
      }
    };
    canvas.addEventListener("click", requestLock, { signal });

    // Single Escape owner: first press releases pointer lock (browser default
    // or explicit), a press while unlocked exits to the reading experience.
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (document.pointerLockElement) {
        document.exitPointerLock();
        return;
      }
      event.preventDefault();
      callbacksRef.current.onExit();
    };
    window.addEventListener("keydown", onEscape, { signal });

    // M toggles mute (HUD button does the same).
    const onMuteKey = (event: KeyboardEvent) => {
      if (event.code === "KeyM") {
        audio.setMuted(!audio.isMuted());
        setAudioState({ muted: audio.isMuted(), volume: audio.getMasterVolume() });
      }
    };
    window.addEventListener("keydown", onMuteKey, { signal });

    // Gamepad: feed analog state through the public API (no private hacks).
    let lastGamepadInteract = false;
    const pollGamepad = () => {
      const gp = navigator.getGamepads?.()[0];
      if (!gp) return;
      controller.setGamepadState(
        { x: gp.axes[0] ?? 0, y: gp.axes[1] ?? 0 },
        { x: gp.axes[2] ?? 0, y: gp.axes[3] ?? 0 },
        {
          sprint: Boolean(gp.buttons[6]?.pressed),
          crouch: Boolean(gp.buttons[7]?.pressed),
          jump: Boolean(gp.buttons[1]?.pressed),
        },
      );
      const interactPressed = Boolean(gp.buttons[0]?.pressed);
      if (interactPressed && !lastGamepadInteract) interaction.handleGamepadButtonPressed(0);
      lastGamepadInteract = interactPressed;
    };

    // Scratch objects reused per frame (no hot-path allocation).
    const playerPos = new THREE.Vector3();

    // Extend the opt-in diagnostics hook (?diag=1, installed by the effect
    // before build resolves) with subsystem handles so acceptance tests can
    // drive frames deterministically and inspect real state.
    const diagHost = (window as unknown as Record<string, unknown>).__seerahWorldDiag as
      | Record<string, unknown>
      | undefined;
    if (diagHost) {
      Object.assign(diagHost, {
        scene,
        camera,
        controller,
        audio,
        interaction,
        life,
        particleSystems,
        ambient,
        getAmbientStats: () => ambient.getAmbientStats(),
        getAmbientSnapshot: () => ambient.getDiagnosticSnapshot(),
        getAmbientState: () => ambientState,
        spawnPresetCrowd: (preset: AmbientPresetName) => {
          if (!(["market", "camp", "caravan", "march"] as string[]).includes(preset)) {
            return Promise.reject(new Error("Unknown ambient preset"));
          }
          return ambient.spawnPresetCrowd(preset);
        },
        setAmbientQuality: (tier: AmbientQualityTier) => {
          if (!(["low", "medium", "high"] as string[]).includes(tier)) throw new Error("Unknown ambient quality");
          ambient.setQuality(tier);
        },
        pauseAmbientWorld: () => ambient.pause(),
        resumeAmbientWorld: () => ambient.resume(),
      });
    }

    return {
      frame: (delta: number, elapsed: number) => {
        timeState.delta = delta;
        timeState.elapsed = elapsed;

        pollGamepad();
        controller.update(delta);
        const state = controller.state;
        worldContext.playerState = state;
        playerPos.copy(state.position);

        life.update(delta, elapsed, playerPos);
        ambient.update(delta);
        for (const ps of particleSystems) ps.update(delta, elapsed, playerPos);
        if (dustMotesRef.current && !motionRef.current) {
          updateDustMotes(dustMotesRef.current, delta, elapsed);
        }
        if (starsRef.current && !motionRef.current) {
          updateNightStars(starsRef.current, elapsed);
        }
        footDustRef.current?.update(delta);

        audio.updateListener(state);
        audio.updateZones(state);
        interaction.update(delta, state, camera);

        // ---- CAMERA: sprint FOV, breathing, sway ----
        // Running widens the lens the way human peripheral vision opens
        // up; breathing and the weight-shift sway keep the camera attached
        // to a body instead of a tripod.
        const targetFov = state.sprinting ? BASE_FOV + SPRINT_FOV_BONUS : BASE_FOV;
        if (Math.abs(camera.fov - targetFov) > 0.01) {
          camera.fov += (targetFov - camera.fov) * Math.min(1, delta * 4.5);
          camera.updateProjectionMatrix();
        }

        const breath = controller.getBreathingOffset(elapsed);
        const sway = controller.getWalkSwayOffset(elapsed);
        const eye = controller.getEyeHeight() + controller.getHeadBobOffset() + breath;
        camera.position.set(
          state.position.x + sway * 0.35,
          state.position.y + eye,
          state.position.z,
        );
        const cosPitch = Math.cos(state.pitch);
        camera.lookAt(
          state.position.x - Math.sin(state.yaw) * cosPitch * 10,
          state.position.y + eye + Math.sin(state.pitch) * 10,
          state.position.z - Math.cos(state.yaw) * cosPitch * 10,
        );

        // Throttled HUD snapshot (~8 Hz) — clones so React sees new vectors.
        hudTimerRef.current += delta;
        if (hudTimerRef.current >= HUD_UPDATE_INTERVAL) {
          hudTimerRef.current = 0;
          setPlayerState({
            ...state,
            position: state.position.clone(),
            velocity: state.velocity.clone(),
          });
          // Bounded, non-sensitive diagnostics for browser evidence (same
          // pattern as ThreeRuntime's host dataset).
          host.dataset.worldPlayerX = state.position.x.toFixed(2);
          host.dataset.worldPlayerZ = state.position.z.toFixed(2);
          host.dataset.worldPlayerYaw = state.yaw.toFixed(3);
          host.dataset.worldOnGround = String(state.onGround);
          host.dataset.worldAudioZone = audio.getState().currentZone ?? "";
          host.dataset.worldAudioState = audio.getState().state;
          host.dataset.worldPrompt = interaction.getActivePrompt()?.point.id ?? "";
          const ambientStats = ambient.getAmbientStats();
          host.dataset.worldAmbientActive = String(ambientStats.activeEntities);
          host.dataset.worldAmbientVisible = String(ambientStats.visibleEntities);
          host.dataset.worldAmbientFallbacks = String(ambientStats.developmentFallbacks);
          host.dataset.worldAmbientQuality = ambientStats.qualityTier;
          host.dataset.worldAmbientDrawCalls = String(ambientStats.drawCalls);
          host.dataset.worldAmbientFrameMs = ambientStats.frameTimeMs?.toFixed(2) ?? "";
        }

        renderer.render(scene, camera);

        // Reduced motion: keep discrete frames alive briefly after input.
        if (motionRef.current && reducedGraceRef.current > 0) {
          reducedGraceRef.current -= delta;
          threeContext.invalidate();
        }
      },
      resize: (width: number, height: number) => {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      },
      setMotion: (motion: "full" | "reduced") => {
        const reduced = motion === "reduced";
        controller.setReducedMotion(reduced);
        life.setReducedMotion(reduced);
        ambient.setReducedMotion(reduced);
        for (const ps of particleSystems) ps.setReducedMotion(reduced);
        audio.setReducedMotion(reduced);
        if (reduced && dustMotesRef.current) settleDustMotes(dustMotesRef.current);
      },
      dispose: () => {
        // All resources released through registerDisposable by the runtime.
      },
      getPlayerState: () => controller.state,
      setPlayerPosition: (pos: THREE.Vector3, yaw?: number) => controller.teleport(pos, yaw),
      setInputEnabled: (enabled: boolean) => controller.setInputEnabled(enabled),
    };
  }, [sceneConfig]);

  // Stable adapter — rebuilds only when the scene itself changes.
  const adapter = useMemo<ThreeSceneAdapter>(() => ({
    build: (context) => initializeWorld(context),
  }), [initializeWorld]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    setFailed(false);
    setLoading(true);
    setCurrentPrompt(null);
    gestureRef.current = false;

    const runtime = new ThreeRuntime({
      host,
      motion: effectiveMotion,
      adapter,
      onFallback: (error) => {
        if (disposed) return;
        console.warn("[LivingSeerahWorld] runtime fallback:", error);
        setFailed(true);
        callbacksRef.current.onUnavailable();
      },
    });
    runtimeRef.current = runtime;
    void runtime.start();

    // Opt-in diagnostics hook (?diag=1): exposes the runtime and scene handle
    // so acceptance tests can drive frames deterministically even when the
    // host window is occluded and Chromium throttles frame scheduling.
    if (new URLSearchParams(window.location.search).get("diag") === "1") {
      (window as unknown as Record<string, unknown>).__seerahWorldDiag = {
        runtime,
        getHandle: () => (runtime as unknown as { scene: WorldSceneHandle | null }).scene,
      };
    }

    return () => {
      disposed = true;
      runtimeRef.current = null;
      runtime.stop();
      const diagWindow = window as unknown as Record<string, unknown>;
      if (diagWindow.__seerahWorldDiag) delete diagWindow.__seerahWorldDiag;
    };
    // effectiveMotion changes are applied via setMotion below, not a rebuild.
  }, [adapter]);

  // Motion sync without rebuilding the world.
  useEffect(() => {
    runtimeRef.current?.setMotion(effectiveMotion);
  }, [effectiveMotion]);

  // Focus management.
  useEffect(() => {
    const root = rootRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root?.focus({ preventScroll: true });
    return () => {
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.setMuted(!audio.isMuted());
    setAudioState({ muted: audio.isMuted(), volume: audio.getMasterVolume() });
  }, []);

  if (failed) return null;

  return (
    <section
      ref={rootRef}
      className={`${styles.world} ${immersive ? styles.immersive : ""} ${reducedMotion ? styles.reducedMotion : ""}`}
      data-visual="living-seerah-world"
      data-scene={sceneConfig.id}
      data-tier={graphicsTier}
      data-motion={reducedMotion ? "reduced" : "full"}
      aria-label={`العالم الحي: ${sceneConfig.nameAr}`}
      tabIndex={0}
    >
      <div ref={hostRef} className={styles.canvasHost} data-visual="world-canvas" />

      {/* HUD Overlay */}
      <div className={styles.hudOverlay}>
        <Suspense fallback={<div className={styles.hudLoading} aria-hidden="true" />}>
          <WorldHUDComponent
            playerState={playerState}
            graphicsTier={graphicsTier}
            reducedMotion={reducedMotion}
            prompt={currentPrompt}
            audio={audioState}
            worldNameAr={worldNameAr}
            heading={playerState.yaw}
            currentSceneId={sceneConfig.id}
            onNavigate={onNavigate}
            onExit={onExit}
            onToggleMute={toggleMute}
          />
        </Suspense>
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className={styles.loadingScreen} data-visual="world-loading" role="status" aria-live="polite">
          <div className={styles.loadingSpinner} aria-hidden="true" />
          <p className={styles.loadingText}>يُبنى العالم الحي…</p>
          <p className={styles.loadingHint}>انقر للدخول · WASD للتحرك · ماوس للنظر · E للتفاعل · Esc للخروج</p>
        </div>
      )}

      {/* Cinematic entrance overlay — golden title card that fades away */}
      {!loading && !entranceGone && !travelVeil && (
        <div
          className={`${styles.entranceOverlay} ${entered ? styles.entranceOut : ""}`}
          data-visual="world-entrance"
          aria-hidden="true"
        >
          <div className={styles.entranceSun} aria-hidden="true" />
          <div className={styles.entranceRings} aria-hidden="true" />
          <div className={styles.entranceText}>
            <span className={styles.entranceTitle}>العالم الحي</span>
            <span className={styles.entranceSubtitle}>السيرة النبوية — إعادة بناء فنية</span>
          </div>
        </div>
      )}

      {/* Travel transition — the journey between two living-world scenes */}
      {travelVeil && (
        <div className={styles.travelVeil} data-visual="world-travel-transition" aria-hidden="true">
          <div className={styles.travelSweep} />
          <div className={styles.travelText}>
            <span className={styles.travelFrom}>{travelFromAr}</span>
            <span className={styles.travelArrow} aria-hidden="true">←</span>
            <span className={styles.travelTo}>{sceneConfig.nameAr}</span>
          </div>
        </div>
      )}

      {/* Reconstruction disclosure (always visible) */}
      <div className={styles.disclosure} data-visual="world-disclosure">
        <span>{sceneConfig.disclosureAr}</span>
        <span className={styles.ambientAttribution} data-visual="ambient-development-fallback">
          الحياة البيئية المجرَّدة: نماذج تطوير إجرائية مجهولة، لا أصول شخصيات نهائية ولا تمثيل لشخصيات محددة.
        </span>
      </div>
    </section>
  );
}

// Hash string to seed
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Mulberry PRNG
function mulberry(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

LivingSeerahWorld.displayName = "LivingSeerahWorld";
