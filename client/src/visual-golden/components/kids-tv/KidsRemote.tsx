import type { ReactNode } from "react";
import {
  Captions,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Expand,
  Home,
  Pause,
  Play,
  Power,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import styles from "./KidsTVRoom.module.css";

export type KidsRemoteCommand =
  | "power"
  | "up"
  | "down"
  | "left"
  | "right"
  | "ok"
  | "back"
  | "home"
  | "previous"
  | "play-pause"
  | "next"
  | "volume-up"
  | "volume-down"
  | "channel-up"
  | "channel-down"
  | "mute"
  | "captions"
  | "fullscreen";

type Props = {
  playing: boolean;
  muted: boolean;
  captions: boolean;
  onCommand: (command: KidsRemoteCommand) => void;
  compact?: boolean;
  /**
   * True when no episode is cleared for playback. Every control that can only
   * act on a video is then disabled and says why, because an enabled "play" on
   * a shelf holding nothing playable is a promise the product cannot keep.
   */
  nothingPlayable?: boolean;
  /** Why the transport is unavailable, shown to the reader and to assistive tech. */
  unavailableReason?: string;
};

type RemoteButtonProps = {
  label: string;
  command: KidsRemoteCommand;
  onCommand: (command: KidsRemoteCommand) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
};

function RemoteButton({
  label,
  command,
  onCommand,
  children,
  className = "",
  disabled = false,
  disabledReason,
}: RemoteButtonProps) {
  return (
    <button
      type="button"
      className={className}
      aria-label={disabled && disabledReason ? `${label} — ${disabledReason}` : label}
      disabled={disabled}
      onClick={() => onCommand(command)}
    >
      {children}
    </button>
  );
}

export function KidsRemote({
  playing,
  muted,
  captions,
  onCommand,
  compact = false,
  nothingPlayable = false,
  unavailableReason,
}: Props) {
  // Navigation stays live even with nothing to play: leaving is always allowed.
  // Everything that can only act on a video is disabled and says why.
  const locked = nothingPlayable;
  const lock = { disabled: locked, disabledReason: unavailableReason };
  if (compact) {
    return (
      <div className={styles.miniRemote} aria-label="أزرار التحكم السريعة">
        <RemoteButton label="الحلقة السابقة" command="previous" onCommand={onCommand} {...lock}><SkipBack /></RemoteButton>
        <RemoteButton label={playing ? "إيقاف مؤقت" : "تشغيل"} command="play-pause" onCommand={onCommand} {...lock}>
          {playing ? <Pause /> : <Play />}
        </RemoteButton>
        <RemoteButton label="الحلقة التالية" command="next" onCommand={onCommand} {...lock}><SkipForward /></RemoteButton>
        <RemoteButton label="ملء الشاشة" command="fullscreen" onCommand={onCommand} {...lock}><Expand /></RemoteButton>
      </div>
    );
  }

  return (
    <aside className={styles.remote} aria-label="ريموت مسرح النور">
      <div className={styles.remoteTop}>
        <RemoteButton label="تشغيل التلفزيون" command="power" onCommand={onCommand} {...lock}><Power size={17} /></RemoteButton>
        <span>NOOR</span>
      </div>

      <div className={styles.dpad}>
        <RemoteButton label="أعلى" command="up" onCommand={onCommand} {...lock} className={styles.dpadUp}><ChevronUp /></RemoteButton>
        <RemoteButton label="يسار" command="left" onCommand={onCommand} {...lock} className={styles.dpadLeft}><ChevronLeft /></RemoteButton>
        <RemoteButton label="اختيار وتشغيل" command="ok" onCommand={onCommand} {...lock} className={styles.dpadOk}>OK</RemoteButton>
        <RemoteButton label="يمين" command="right" onCommand={onCommand} {...lock} className={styles.dpadRight}><ChevronRight /></RemoteButton>
        <RemoteButton label="أسفل" command="down" onCommand={onCommand} {...lock} className={styles.dpadDown}><ChevronDown /></RemoteButton>
      </div>

      <div className={styles.remotePair}>
        <RemoteButton label="رجوع" command="back" onCommand={onCommand}><RotateCcw size={16} /> رجوع</RemoteButton>
        <RemoteButton label="الرئيسية" command="home" onCommand={onCommand}><Home size={16} /> الرئيسية</RemoteButton>
      </div>

      <div className={styles.transport}>
        <RemoteButton label="الحلقة السابقة" command="previous" onCommand={onCommand} {...lock}><SkipBack /></RemoteButton>
        <RemoteButton label={playing ? "إيقاف مؤقت" : "تشغيل"} command="play-pause" onCommand={onCommand} {...lock}>
          {playing ? <Pause /> : <Play />}
        </RemoteButton>
        <RemoteButton label="الحلقة التالية" command="next" onCommand={onCommand} {...lock}><SkipForward /></RemoteButton>
      </div>

      <div className={styles.remotePair}>
        <RemoteButton label="رفع الصوت" command="volume-up" onCommand={onCommand} {...lock}><Volume2 size={16} /> VOL+</RemoteButton>
        <RemoteButton label="القناة التالية" command="channel-up" onCommand={onCommand} {...lock}>CH+</RemoteButton>
      </div>
      <div className={styles.remotePair}>
        <RemoteButton label="خفض الصوت" command="volume-down" onCommand={onCommand} {...lock}><Volume1 size={16} /> VOL-</RemoteButton>
        <RemoteButton label="القناة السابقة" command="channel-down" onCommand={onCommand} {...lock}>CH-</RemoteButton>
      </div>

      <div className={styles.remotePair}>
        <RemoteButton label={muted ? "إلغاء كتم الصوت" : "كتم الصوت"} command="mute" onCommand={onCommand} {...lock}>
          <VolumeX size={16} /> {muted ? "صوت" : "كتم"}
        </RemoteButton>
        <RemoteButton label={captions ? "إيقاف الترجمة" : "تشغيل الترجمة"} command="captions" onCommand={onCommand} {...lock}>
          <Captions size={16} /> CC
        </RemoteButton>
      </div>

      <RemoteButton label="ملء الشاشة" command="fullscreen" onCommand={onCommand} {...lock} className={styles.fullRemoteButton}>
        <Expand size={17} /> ملء الشاشة
      </RemoteButton>
    </aside>
  );
}
