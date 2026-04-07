import type { Minutes } from '../core/models';

export function minutesToMilliseconds(minutes: Minutes): number {
  return minutes * 60_000;
}

export function millisecondsToWholeMinutes(milliseconds: number): Minutes {
  return Math.floor(milliseconds / 60_000);
}

export function nowUnixMs(): number {
  return Date.now();
}
