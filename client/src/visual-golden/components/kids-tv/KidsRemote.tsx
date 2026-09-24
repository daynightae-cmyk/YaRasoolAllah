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
};

type RemoteButtonProps = {
  label: string;
  command: KidsRemoteCommand;
  onCommand: (command: KidsRemoteCommand) => void;
  children: ReactNode;
  className?: string;
};

function RemoteButton({ label, command, onCommand, children, className = "" }: RemoteButtonProps) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => onCommand(command)}
    >
      {children}
    </button>
  );
}

export function KidsRemote({ playing, muted, captions, onCommand, compact = false }: Props) {
  if (compact) {
    return (
      <div className={styles.miniRemote} aria-label="أزرار التحكم السريعة">
        <RemoteButton label="الحلقة السابقة" command="previous" onCommand={onCommand}><SkipBack /></RemoteButton>
        <RemoteButton label={playing ? "إيقاف مؤقت" : "تشغيل"} command="play-pause" onCommand={onCommand}>
          {playing ? <Pause /> : <Play />}
        </RemoteButton>
        <RemoteButton label="الحلقة التالية" command="next" onCommand={onCommand}><SkipForward /></RemoteButton>
        <RemoteButton label="ملء الشاشة" command="fullscreen" onCommand={onCommand}><Expand /></RemoteButton>
      </div>
    );
  }

  return (
    <aside className={styles.remote} aria-label="ريموت مسرح النور">
      <div className={styles.remoteTop}>
        <RemoteButton label="تشغيل التلفزيون" command="power" onCommand={onCommand}><Power size={17} /></RemoteButton>
        <span>NOOR</span>
      </div>

      <div className={styles.dpad}>
        <RemoteButton label="أعلى" command="up" onCommand={onCommand} className={styles.dpadUp}><ChevronUp /></RemoteButton>
        <RemoteButton label="يسار" command="left" onCommand={onCommand} className={styles.dpadLeft}><ChevronLeft /></RemoteButton>
        <RemoteButton label="اختيار وتشغيل" command="ok" onCommand={onCommand} className={styles.dpadOk}>OK</RemoteButton>
        <RemoteButton label="يمين" command="right" onCommand={onCommand} className={styles.dpadRight}><ChevronRight /></RemoteButton>
        <RemoteButton label="أسفل" command="down" onCommand={onCommand} className={styles.dpadDown}><ChevronDown /></RemoteButton>
      </div>

      <div className={styles.remotePair}>
        <RemoteButton label="رجوع" command="back" onCommand={onCommand}><RotateCcw size={16} /> رجوع</RemoteButton>
        <RemoteButton label="الرئيسية" command="home" onCommand={onCommand}><Home size={16} /> الرئيسية</RemoteButton>
      </div>

      <div className={styles.transport}>
        <RemoteButton label="الحلقة السابقة" command="previous" onCommand={onCommand}><SkipBack /></RemoteButton>
        <RemoteButton label={playing ? "إيقاف مؤقت" : "تشغيل"} command="play-pause" onCommand={onCommand}>
          {playing ? <Pause /> : <Play />}
        </RemoteButton>
        <RemoteButton label="الحلقة التالية" command="next" onCommand={onCommand}><SkipForward /></RemoteButton>
      </div>

      <div className={styles.remotePair}>
        <RemoteButton label="رفع الصوت" command="volume-up" onCommand={onCommand}><Volume2 size={16} /> VOL+</RemoteButton>
        <RemoteButton label="القناة التالية" command="channel-up" onCommand={onCommand}>CH+</RemoteButton>
      </div>
      <div className={styles.remotePair}>
        <RemoteButton label="خفض الصوت" command="volume-down" onCommand={onCommand}><Volume1 size={16} /> VOL-</RemoteButton>
        <RemoteButton label="القناة السابقة" command="channel-down" onCommand={onCommand}>CH-</RemoteButton>
      </div>

      <div className={styles.remotePair}>
        <RemoteButton label={muted ? "إلغاء كتم الصوت" : "كتم الصوت"} command="mute" onCommand={onCommand}>
          <VolumeX size={16} /> {muted ? "صوت" : "كتم"}
        </RemoteButton>
        <RemoteButton label={captions ? "إيقاف الترجمة" : "تشغيل الترجمة"} command="captions" onCommand={onCommand}>
          <Captions size={16} /> CC
        </RemoteButton>
      </div>

      <RemoteButton label="ملء الشاشة" command="fullscreen" onCommand={onCommand} className={styles.fullRemoteButton}>
        <Expand size={17} /> ملء الشاشة
      </RemoteButton>
    </aside>
  );
}
