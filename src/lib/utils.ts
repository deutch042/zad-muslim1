import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtTime(timeStr: string): string {
  const parts = timeStr.replace(/\s*\(.*?\)/, '').trim().split(':');
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  if (isNaN(hh) || isNaN(mm)) return timeStr;
  const p = hh >= 12 ? 'م' : 'ص';
  return `${hh === 0 ? 12 : hh > 12 ? hh - 12 : hh}:${String(mm).padStart(2, '0')} ${p}`;
}
