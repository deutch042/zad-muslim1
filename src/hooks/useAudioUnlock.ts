'use client';

import { useEffect, useState } from 'react';
import { unlockAudioSession, isAudioUnlocked, resumeIfSuspended } from '@/lib/audio-session';

export function useAudioUnlock() {
  const [unlocked, setUnlocked] = useState(false);
  const [needsPrompt, setNeedsPrompt] = useState(false);

  useEffect(() => {
    async function onInteraction() {
      const ok = await unlockAudioSession();
      if (ok) {
        setUnlocked(true);
        setNeedsPrompt(false);
        document.removeEventListener('click', onInteraction);
        document.removeEventListener('touchend', onInteraction);
      }
    }

    document.addEventListener('click', onInteraction);
    document.addEventListener('touchend', onInteraction);

    return () => {
      document.removeEventListener('click', onInteraction);
      document.removeEventListener('touchend', onInteraction);
    };
  }, []);

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        resumeIfSuspended();
      }
    }

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!isAudioUnlocked()) {
        setNeedsPrompt(true);
      }
    };

    window.addEventListener('audio-unlock-needed', handler);
    return () => {
      window.removeEventListener('audio-unlock-needed', handler);
    };
  }, []);

  return { unlocked, needsPrompt, setNeedsPrompt };
}