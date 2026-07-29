import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const COARSE_POINTER_QUERY = '(pointer: coarse)';

const SERVER_CAPABILITY = {
  reducedMotion: true,
  coarsePointer: false,
  lowPower: true,
  maxPixelRatio: 1,
};

/**
 * Reads how much decorative GPU work this device should be asked to do.
 *
 * The landing pages carry full-screen WebGL backdrops. On phones, on machines
 * with little RAM/few cores, and for anyone who asked for reduced motion those
 * backdrops cost far more than they add, so callers use `lowPower` to skip
 * mounting them entirely.
 */
// jsdom (and older browsers) may not implement matchMedia at all.
const mediaMatches = (query) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(query).matches;

export const readDeviceCapability = () => {
  if (typeof window === 'undefined') return SERVER_CAPABILITY;

  const reducedMotion = mediaMatches(REDUCED_MOTION_QUERY);
  const coarsePointer = mediaMatches(COARSE_POINTER_QUERY);

  // All three are optional APIs; only treat them as a signal when present.
  const saveData = navigator.connection?.saveData === true;
  const cores = navigator.hardwareConcurrency;
  const memory = navigator.deviceMemory;

  const lowPower =
    reducedMotion ||
    coarsePointer ||
    saveData ||
    (typeof cores === 'number' && cores <= 4) ||
    (typeof memory === 'number' && memory <= 4);

  return {
    reducedMotion,
    coarsePointer,
    lowPower,
    // Decorative fragment shaders are the most expensive thing on the page and
    // gain almost nothing from a retina backing store, so they stay at 1x.
    maxPixelRatio: 1,
  };
};

const useDeviceCapability = () => {
  const [capability, setCapability] = useState(readDeviceCapability);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const coarse = window.matchMedia(COARSE_POINTER_QUERY);
    const sync = () => setCapability(readDeviceCapability());

    reduced.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    return () => {
      reduced.removeEventListener('change', sync);
      coarse.removeEventListener('change', sync);
    };
  }, []);

  return capability;
};

export default useDeviceCapability;
