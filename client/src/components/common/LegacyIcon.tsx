import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Heart,
  Info,
  Landmark,
  Lightbulb,
  ListChecks,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  Pause,
  Play,
  Printer,
  Quote,
  RotateCcw,
  Scale,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
  Video,
  Volume2,
  X,
  type LucideProps,
} from "lucide-react";

/**
 * Renders the icon names that the legacy pages used to spell out with the
 * `material-symbols-outlined` class.
 *
 * That class was never backed by a font in this project, so every occurrence
 * rendered the raw ligature word (`self_improvement`, `arrow_forward`, …) as
 * visible text. This adapter keeps the legacy call sites honest by mapping the
 * same vocabulary onto local, dependency-free Lucide icons.
 */
const LEGACY_ICONS: Record<string, LucideIcon> = {
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  bookmark_add: Bookmark,
  category: ListChecks,
  check_circle: CheckCircle2,
  clean_hands: Sparkles,
  close: X,
  download: Download,
  email: MessageCircle,
  female: Users,
  format_quote: Quote,
  gavel: Scale,
  group: Users,
  groups: Users,
  history_edu: GraduationCap,
  info: Info,
  location_on: Compass,
  menu: Menu,
  menu_book: BookOpen,
  psychology: Heart,
  public: Compass,
  quiz: ListChecks,
  record_voice_over: Mic,
  schedule: Clock,
  search: Search,
  self_improvement: Star,
  send: Send,
  share: Share2,
  skip_next: ArrowRight,
  skip_previous: ArrowLeft,
  star: Star,
  temple_buddhist: Landmark,
  thumb_up: ThumbsUp,
  today: Clock,
  video_library: Video,
  volume_up: Volume2,
  widgets: ListChecks,
  account_circle: ShieldCheck,
  pause: Pause,
  play: Play,
  print: Printer,
  rotate: RotateCcw,
  settings: ListChecks,
  lightbulb: Lightbulb,
  file: FileText,
  visibility: Eye,
};

export type LegacyIconName = keyof typeof LEGACY_ICONS | string;

export interface LegacyIconProps extends Omit<LucideProps, "ref"> {
  name: LegacyIconName;
}

/**
 * The icon scales with the surrounding font size (`1em`) so legacy utility
 * classes such as `text-6xl` keep working without touching their markup.
 */
export function LegacyIcon({ name, className, ...rest }: LegacyIconProps) {
  const Icon = LEGACY_ICONS[name] ?? Circle;
  return (
    <Icon
      {...rest}
      aria-hidden={rest["aria-label"] ? undefined : true}
      className={className}
      style={{ width: "1em", height: "1em", ...(rest.style ?? {}) }}
    />
  );
}
