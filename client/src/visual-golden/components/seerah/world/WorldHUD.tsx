/**
 * WorldHUD — In-world Heads-Up Display for the Living Seerah World.
 *
 * Features:
 * - Compass with cardinal directions (Arabic)
 * - Current location/biome name
 * - Interaction prompt
 * - Audio controls (mute, volume)
 * - Graphics quality indicator
 * - Exit button
 * - Reduced motion: static, no animations
 * - RTL Arabic support
 * - Accessible: keyboard navigable, screen reader friendly
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Compass, Volume2, VolumeX, Settings, LogOut, Minimize2, Maximize2 } from "lucide-react";
import type { WorldPlayerState, WorldGraphicsTier, InteractionPrompt } from "./world-types";
import styles from "./WorldHUD.module.css";

interface WorldHUDProps {
  playerState: WorldPlayerState;
  graphicsTier: WorldGraphicsTier;
  reducedMotion: boolean;
  /** Current interaction prompt from WorldInteraction. */
  prompt: InteractionPrompt | null;
  /** Audio state. */
  audio: { muted: boolean; volume: number } | null;
  /** Current world/scene name (Arabic). */
  worldNameAr: string;
  /** Current biome/area name (Arabic). */
  areaNameAr?: string;
  /** Compass heading in degrees (0 = North). */
  heading: number;
  /** Callbacks */
  onExit: () => void;
  onToggleMute: () => void;
  onToggleSettings?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  /** Minimized state */
  minimized?: boolean;
}

const ARABIC_CARDINALS = ["شمال", "شمال شرق", "شرق", "جنوب شرق", "جنوب", "جنوب غرب", "غرب", "شمال غرب"];
const CARDINAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** Convert heading to Arabic cardinal direction. */
function headingToCardinal(heading: number): string {
  // Heading: 0 = North (negative Z in Three.js), clockwise
  // Convert to degrees: 0 = North, 90 = East
  const deg = ((-heading * 180) / Math.PI + 360) % 360;
  const index = Math.round(deg / 45) % 8;
  return ARABIC_CARDINALS[index];
}

/** Format coordinates for display. */
function formatCoord(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

export function WorldHUD({
  playerState,
  graphicsTier,
  reducedMotion,
  prompt,
  audio,
  worldNameAr,
  areaNameAr,
  heading,
  onExit,
  onToggleMute,
  onToggleSettings,
  onMinimize,
  onMaximize,
  minimized = false,
}: WorldHUDProps) {
  const hudRef = useRef<HTMLDivElement>(null);
  const [compassDirection, setCompassDirection] = useState("");
  // Coordinates stay available for diagnostics via the HUD data attribute.
  const showCoordinates = false;

  // Update compass direction
  useEffect(() => {
    setCompassDirection(headingToCardinal(heading));
  }, [heading]);

  // Keyboard shortcuts: Escape (exit) and M (mute) are owned by the world
  // component; C is crouch in the controller. The HUD binds no global keys.

  // Announce prompt changes for screen readers
  useEffect(() => {
    if (prompt) {
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = `نقطة تفاعل قريبة: ${prompt.point.labelAr}. اضغط E للتفاعل.`;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 3000);
    }
  }, [prompt?.point.id]);

  if (minimized) {
    return (
      <button
        className={styles.minimizedFab}
        onClick={onMaximize}
        aria-label="إظهار واجهة العالم"
        title="إظهار الواجهة"
      >
        <Maximize2 size={20} aria-hidden />
      </button>
    );
  }

  return (
    <div
      ref={hudRef}
      className={`${styles.hud} ${reducedMotion ? styles.reducedMotion : ""}`}
      data-visual="world-hud"
      dir="rtl"
      lang="ar"
      role="region"
      aria-label="واجهة العالم الحي"
    >
      {/* Top-left: Compass & Location */}
      <div className={styles.topLeft} aria-label="البوصلة والموقع">
        <div className={styles.compassCard}>
          <div className={styles.compassRose} aria-hidden>
            <Compass size={28} className={styles.compassNeedle} style={{ transform: `rotate(${(-heading * 180) / Math.PI}deg)` }} />
          </div>
          <div className={styles.compassInfo}>
            <span className={styles.cardinal}>{compassDirection}</span>
            <span className={styles.headingDegrees}>{Math.round(((-heading * 180) / Math.PI + 360) % 360)}°</span>
          </div>
        </div>

        <div className={styles.locationCard}>
          <div className={styles.worldName}>{worldNameAr}</div>
          {areaNameAr && <div className={styles.areaName}>{areaNameAr}</div>}
          {showCoordinates && (
            <div className={styles.coordinates}>
              <span>س: {formatCoord(playerState.position.x)}</span>
              <span>ع: {formatCoord(playerState.position.y)}</span>
              <span>ع: {formatCoord(playerState.position.z)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top-right: Audio & Settings */}
      <div className={styles.topRight} aria-label="الصوت والإعدادات">
        <div className={styles.controlGroup}>
          <button
            className={`${styles.controlButton} ${audio?.muted ? styles.muted : ""}`}
            onClick={onToggleMute}
            aria-label={audio?.muted ? "إلغاء كتم الصوت" : "كتم الصوت"}
            aria-pressed={audio?.muted}
            title={audio?.muted ? "إلغاء كتم الصوت" : "كتم الصوت"}
          >
            {audio?.muted ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
            {audio !== null && (
              <span className={styles.volumeValue}>{Math.round((audio.volume || 1) * 100)}%</span>
            )}
          </button>

          {onToggleSettings && (
            <button
              className={styles.controlButton}
              onClick={onToggleSettings}
              aria-label="إعدادات الرسوميات"
              title={`جودة الرسوميات: ${graphicsTier === "high" ? "عالية" : graphicsTier === "low" ? "منخفضة" : "متوازنة"}`}
            >
              <Settings size={18} aria-hidden />
            </button>
          )}

          {onMinimize && (
            <button
              className={styles.controlButton}
              onClick={onMinimize}
              aria-label="تصغير الواجهة"
              title="تصغير الواجهة"
            >
              <Minimize2 size={18} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Center-bottom: Interaction Prompt */}
      {prompt && (
        <div className={styles.promptContainer} role="status" aria-live="polite" aria-atomic="true">
          <div className={styles.promptCard}>
            <span className={styles.promptIcon} aria-hidden>⟳</span>
            <span className={styles.promptLabel}>{prompt.point.labelAr}</span>
            {prompt.point.descriptionAr && (
              <span className={styles.promptDesc}>{prompt.point.descriptionAr}</span>
            )}
            <span className={styles.promptHint}>اضغط <kbd className={styles.keybind}>E</kbd> للتفاعل</span>
            <div className={styles.promptDistance}>
              {Math.round(prompt.distance)} م
            </div>
          </div>
        </div>
      )}

      {/* Bottom-right: Exit */}
      <div className={styles.bottomRight}>
        <button
          className={styles.exitButton}
          onClick={onExit}
          aria-label="الخروج من العالم الحي"
          title="الخروج (Esc)"
        >
          <LogOut size={18} aria-hidden />
          <span>خروج</span>
        </button>
      </div>

      {/* Help tooltip (hidden by default, shown on ? key or first visit) */}
      <div className={styles.helpTooltip} aria-hidden="true">
        <div className={styles.helpItem}><kbd>WASD</kbd> / <kbd>أسهم</kbd> تحرك</div>
        <div className={styles.helpItem}><kbd>ماوس</kbd> نظر</div>
        <div className={styles.helpItem}><kbd>Shift</kbd> ركض</div>
        <div className={styles.helpItem}><kbd>Ctrl/C</kbd> انحناء</div>
        <div className={styles.helpItem}><kbd>Space</kbd> قفز</div>
        <div className={styles.helpItem}><kbd>E</kbd> تفاعل</div>
        <div className={styles.helpItem}><kbd>M</kbd> كتم/إلغاء كتم</div>
        <div className={styles.helpItem}><kbd>Esc</kbd> خروج</div>
      </div>
    </div>
  );
}

WorldHUD.displayName = "WorldHUD";