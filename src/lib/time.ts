import { MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from './constants';

interface TimeParts {
  hours: number;
  minutes: number;
  seconds?: number;
}

export function parseTimeString(timeStr: string): TimeParts | null {
  const cleaned = timeStr.replace(/\s*\(.*?\)/, '').trim();
  const parts = cleaned.split(':');
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  if (isNaN(hh) || isNaN(mm)) return null;
  return { hours: hh, minutes: mm };
}

export function formatTime12Hour(hours: number, minutes: number): string {
  const p = hours >= 12 ? 'م' : 'ص';
  const h = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${h}:${String(minutes).padStart(2, '0')} ${p}`;
}

export function msToTimeParts(ms: number): TimeParts {
  return {
    hours: Math.floor(ms / MS_PER_HOUR),
    minutes: Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND)
  };
}
