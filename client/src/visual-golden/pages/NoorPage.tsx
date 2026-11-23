import { NoorMediaTheatre } from "@/visual-golden/components/media/NoorMediaTheatre";

/**
 * `/noor` — the independent Noor media theatre. It explores the governed
 * public media catalog and mounts a provider player only after all seven
 * review gates pass. It never fabricates playback while the approved count is 0.
 */
export function NoorPage() {
  return <NoorMediaTheatre />;
}
