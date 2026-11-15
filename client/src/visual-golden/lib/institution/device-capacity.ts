/**
 * Lightweight device-capacity signals.
 *
 * This module deliberately has no Three.js import: the Library route uses it
 * to choose the complete DOM shelves on a weak device without pulling the 3D
 * engine into the route chunk.
 */
export interface DeviceCapacitySignals {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  saveData?: boolean;
}

/**
 * A conservative low-capacity decision. Missing browser signals default to a
 * normal device, but an explicit Save-Data request or a genuinely small
 * CPU/memory footprint always selects the lighter path.
 */
export function isLowCapacityDevice(
  signals: DeviceCapacitySignals = {},
): boolean {
  const cores = signals.hardwareConcurrency ?? 4;
  const memory = signals.deviceMemory ?? 4;
  return signals.saveData === true || cores <= 2 || memory <= 2;
}

/** Read the live browser signals once, without subscribing to changes. */
export function readDeviceCapacitySignals(): DeviceCapacitySignals {
  if (typeof navigator === "undefined") return {};
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    saveData: nav.connection?.saveData,
  };
}
