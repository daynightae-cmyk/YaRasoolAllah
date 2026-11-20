import { useEffect, useState } from "react";
import { getAmbientEngine } from "./ambience-engine";
import { isVoiceActive, installMediaVoicePresence, subscribeVoiceActive } from "./voice-presence";
import { useInstitution } from "@/visual-golden/lib/institution/store";

/**
 * Mounts the process-wide ambience bed.
 *
 * Consent contract: the bed is off until `ambientEnabled` is persisted as true
 * by the visitor. It pauses while the document is hidden, follows the live
 * motion-independent preference, and yields automatically when recitation or
 * speech is playing. It renders no visible surface.
 */
export function AmbientSound() {
  const enabled = useInstitution((state) => state.ambientEnabled);
  const hydrated = useInstitution((state) => state.hydrated);
  const [voice, setVoice] = useState(isVoiceActive);
  const [visible, setVisible] = useState(true);
  const engine = getAmbientEngine();

  useEffect(() => subscribeVoiceActive(setVoice), []);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    engine.setVoiceActive(voice);
  }, [engine, voice]);

  useEffect(() => {
    if (!enabled || !hydrated || !visible) {
      engine.stop();
      return;
    }
    if (engine.start()) return () => engine.stop();
  }, [engine, enabled, hydrated, visible]);

  useEffect(() => {
    if (!enabled) return;
    return installMediaVoicePresence();
  }, [enabled]);

  const state = !hydrated ? "idle" : enabled ? "on" : "off";

  return <div data-ambience={state} aria-hidden="true" />;
}
