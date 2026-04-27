'use client';

import { useSettingsStore } from '@/store/settings-store';
import { useSalawatPlayer } from '@/hooks/useSalawatPlayer';
import { SALAWAT_SOUNDS, SALAWAT_INTERVALS, TRANSLATIONS } from '@/lib/constants';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { 
    language, 
    salawatEnabled, 
    salawatSound, 
    salawatInterval,
    updateSettings 
  } = useSettingsStore();
  
  const { playCurrentSound, pauseSalawat, isPlaying } = useSalawatPlayer();
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  const handlePlayPreview = () => {
    if (isPlaying) {
      pauseSalawat();
    } else {
      playCurrentSound();
    }
  };

  return (
    <div className="custom-scrollbar flex flex-col gap-4 overflow-y-auto p-4 pb-6">
      <button
        onClick={onBack}
        className="mb-2 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary self-start"
      >
        {isAr ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        )}
        {isAr ? 'رجوع' : 'Back'}
      </button>

      <h1 className="text-xl font-bold text-text-primary">
        {isAr ? 'الإعدادات' : 'Settings'}
      </h1>

      <div className="rounded-xl border border-zad-border bg-zad-card p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-emerald-400">
            <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.salawatSound}
        </h2>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {isAr ? 'تفعيل' : 'Enable'}
          </span>
          <button
            onClick={() => updateSettings({ salawatEnabled: !salawatEnabled })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              salawatEnabled ? 'bg-emerald-500' : 'bg-zad-border'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                salawatEnabled ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {salawatEnabled && (
          <>
            <div className="mb-4 space-y-2">
              <label className="block text-sm text-text-secondary">
                {isAr ? 'اختر الصوت' : 'Select Sound'}
              </label>
              <select
                value={salawatSound}
                onChange={(e) => updateSettings({ salawatSound: e.target.value })}
                className="w-full rounded-lg border border-zad-border bg-zad-input px-3 py-2 text-text-primary"
              >
                {SALAWAT_SOUNDS.map((sound) => (
                  <option key={sound.value} value={sound.value}>
                    {isAr ? sound.nameAr : sound.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 space-y-2">
              <button
                onClick={handlePlayPreview}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-2 text-emerald-400 transition-colors hover:bg-emerald-500/30"
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
                {isPlaying ? (isAr ? 'إيقاف' : 'Stop') : (isAr ? 'تشغيل معاينة' : 'Play Preview')}
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-text-secondary">
                {t.salawatInterval}
              </label>
              <select
                value={salawatInterval}
                onChange={(e) => updateSettings({ salawatInterval: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-zad-border bg-zad-input px-3 py-2 text-text-primary"
              >
                {SALAWAT_INTERVALS.map((interval) => (
                  <option key={interval.value} value={interval.value}>
                    {isAr ? interval.nameAr : interval.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}