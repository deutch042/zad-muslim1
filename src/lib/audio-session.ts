'use client';

let ctx: AudioContext | null = null;
let unlocked = false;

export function getAudioContext(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioContextClass();
  }
  return ctx;
}

export async function unlockAudioSession(): Promise<boolean> {
  try {
    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
    unlocked = true;
    console.log('[AudioSession] Unlocked successfully');
    return true;
  } catch {
    console.warn('[AudioSession] Failed to unlock');
    return false;
  }
}

export function isAudioUnlocked(): boolean {
  return unlocked && ctx?.state === 'running';
}

export async function resumeIfSuspended(): Promise<void> {
  if (ctx && ctx.state !== 'running') {
    await ctx.resume();
  }
}