import { FORCE_TOUCH } from '../config.js';

/** True on devices whose primary input is touch (or when forced with ?touch). */
export function isTouchDevice() {
  return FORCE_TOUCH || window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}
