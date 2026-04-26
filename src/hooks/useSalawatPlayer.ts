'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { isAudioUnlocked, getAudioContext } from '@/lib/audio-session';

// Map salawat sound setting to actual audio file path
const SALAWAT_FILES: Record<string, string> = {
  default: '/audio/salawat.mp3',
};

export function useSalawatPlayer() {
  const { salawatSound } = useSettingsStore();
  
  // Persistent audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);
  
  const playSalawatSound = useCallback((soundName: string) => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve(false);
    
    const filePath = SALAWAT_FILES[soundName];
    if (!filePath) {
      console.log(`[SalawatPlayer] No file mapping for "${soundName}"`);
      return Promise.resolve(false);
    }
    
    audio.src = filePath;
    audio.currentTime = 0;
    
    return audio.play().then(() => true).catch((err) => {
      console.log(`[SalawatPlayer] ✗ play() rejected:`, err.message);
      return false;
    });
  }, []);
  
  const pauseSalawat = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }, []);

  const playSalawatPreview = useCallback((soundKey: string) => {
    if (!isAudioUnlocked()) {
      window.dispatchEvent(new CustomEvent('audio-unlock-needed'));
      return;
    }
    playSalawatSound(soundKey).then((played) => {
      if (!played) {
        console.log(`[SalawatPlayer] File failed to play`);
      }
    });
  }, [playSalawatSound]);

  return { playSalawatPreview, pauseSalawat, isPlaying };
}
