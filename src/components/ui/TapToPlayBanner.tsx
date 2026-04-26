'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';

interface TapToPlayBannerProps {
  visible: boolean;
  onTap: () => void;
}

export function TapToPlayBanner({ visible, onTap }: TapToPlayBannerProps) {
  const language = useSettingsStore((state) => state.language);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-4 right-4 z-[100] rounded-xl border border-zad-gold/30 bg-zad-navy/95 p-4 shadow-xl backdrop-blur-sm"
          onClick={onTap}
        >
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-zad-gold" />
            <span className="text-sm font-medium text-zad-gold">
              {language === 'ar'
                ? 'اضغط هنا لتفعيل الأصوات'
                : 'Tap here to enable sounds'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}