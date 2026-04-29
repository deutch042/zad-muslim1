// Client-side API module — replaces all server API routes for static export.
// These functions call external APIs directly (AlAdhan, alquran.cloud) from the browser.

// ═══════════════════════════════════════════════════════════════
//  PRAYER TIMES — AlAdhan API (supports CORS)
// ═══════════════════════════════════════════════════════════════

export async function fetchPrayerTimes(params: {
  lat: string;
  lng: string;
  method?: string;
  school?: string;
}) {
  const ts = Math.floor(Date.now() / 1000);
  const url = `https://api.aladhan.com/v1/timings/${ts}?latitude=${params.lat}&longitude=${params.lng}&method=${params.method || 5}&school=${params.school || 0}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AlAdhan API error: ${res.status}`);
  const data = await res.json();

  // Normalize timings (same logic as the server route)
  const timings: Record<string, string> = {};
  for (const [key, val] of Object.entries(data.data.timings)) {
    if (['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha', 'Midnight'].includes(key)) {
      let timeStr = '';
      if (typeof val === 'string') timeStr = val;
      else if (val && typeof val === 'object' && val !== null && 'time' in val) {
        const timingObj = val as { time?: unknown };
        timeStr = typeof timingObj.time === 'string' ? timingObj.time : '';
      }
      const cleaned = timeStr.replace(/\s*\(.*?\)\s*$/, '').trim();
      if (/^\d{1,2}:\d{2}$/.test(cleaned)) timings[key] = cleaned;
    }
  }

  const hijri = data.data.date.hijri;
  const gregorian = data.data.date.gregorian;

  return {
    timings,
    date: {
      gregorian: `${gregorian.day} ${gregorian.month.en} ${gregorian.year}`,
      hijri: {
        day: hijri.day,
        month: String(hijri.month.number),
        monthAr: hijri.month.ar,
        monthEn: hijri.month.en,
        year: hijri.year,
        designation: hijri.designation,
        weekday: hijri.weekday,
      },
    },
    meta: data.data.meta,
  };
}

// ═══════════════════════════════════════════════════════════════
//  QURAN — alquran.cloud API (supports CORS)
// ═══════════════════════════════════════════════════════════════

export async function fetchQuranSurahs() {
  const res = await fetch('https://api.alquran.cloud/v1/surah');
  if (!res.ok) throw new Error(`Alquran API error: ${res.status}`);
  const result = await res.json();
  return { surahs: result.data };
}

export async function fetchQuranPage(pageNumber: number) {
  const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
  if (!res.ok) throw new Error(`Alquran API error: ${res.status}`);
  const result = await res.json();

  // Same processing logic as server route
  const { ayahs: pageAyahs } = result.data;
  const ayahs = pageAyahs.map((ayah: Record<string, unknown>) => ({
    number: ayah.number,
    text: ayah.text,
    numberInSurah: ayah.numberInSurah,
    juz: ayah.juz,
    hizbQuarter: ayah.hizbQuarter,
    sajda: typeof ayah.sajda === 'object'
      ? ((ayah.sajda as { obligatory?: boolean; recommended?: boolean }).obligatory || (ayah.sajda as { obligatory?: boolean; recommended?: boolean }).recommended)
      : !!ayah.sajda,
    surah: ayah.surah,
  }));

  const surahStarts: Record<string, unknown>[] = [];
  for (const ayah of pageAyahs) {
    if (ayah.numberInSurah === 1 && ayah.surah && !surahStarts.find((s: Record<string, unknown>) => s.number === (ayah.surah as Record<string, unknown>).number)) {
      surahStarts.push(ayah.surah as Record<string, unknown>);
    }
  }

  return { number: result.data.number, ayahs, surahStarts };
}

export async function fetchQuranSurah(surahNumber: number) {
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`),
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`).catch(() => null),
  ]);

  if (!arabicRes.ok) throw new Error(`Alquran API error: ${arabicRes.status}`);
  const arabicResult = await arabicRes.json();

  let translations: Record<number, string> = {};
  if (translationRes && translationRes.ok) {
    try {
      const translationResult = await translationRes.json();
      if (translationResult.code === 200) {
        translations = (translationResult.data.ayahs as { number: number; text: string }[]).reduce(
          (acc: Record<number, string>, ayah) => {
            acc[ayah.number] = ayah.text;
            return acc;
          },
          {} as Record<number, string>
        );
      }
    } catch {
      // Translation parse error — continue without translations
    }
  }

  const { ayahs: arabicAyahs, ...surahMeta } = arabicResult.data;
  const ayahs = (arabicAyahs as { number: number; numberInSurah: number; text: string }[]).map((ayah) => ({
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    text: ayah.text,
    translation: translations[ayah.number] || undefined,
  }));

  return { surah: surahMeta, ayahs };
}
