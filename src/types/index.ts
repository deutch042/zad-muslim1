export interface UserSettings {
  language: "ar" | "en";
  theme: "dark" | "light";
  prayerMethod: number;
  madhab: 0 | 1;
  reciterId: string;
  quranFontSize: number;
  translationLang: "ar" | "en";
  locationLat: number;
  locationLng: number;
  locationName: string;
  notificationsEnabled: boolean;
  eyeComfort: boolean;
  salawatEnabled: boolean;
  salawatInterval: number;
  salawatSound: string;
  prayerReminderEnabled: boolean;
  prayerReminderMinutes: number;
  adhanEnabled: boolean;
  adhanSound: string;
  pushEnabled: boolean;
}

export interface Reciter {
  id: string;
  name: string;
  nameAr: string;
  style: string;
}

export type AppTab = "home" | "quran" | "prayer" | "azkar" | "more";

export type QuranView = "home" | "surah" | "mushaf";

export type QuranMode = "reading" | "listening";

export type MoreView = "qibla" | "calendar" | "radio" | "settings" | "names" | "hadith" | "goals";

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  date: string;
  month: string;
  year: string;
  day: string;
}

export interface NextPrayer {
  name: string;
  nameAr: string;
  time: string;
  remaining: string;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
}

export interface NameOfAllah {
  id: number;
  name: string;
  nameAr: string;
  meaning: string;
  meaningAr: string;
}