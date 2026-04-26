# Salawat Sound Feature - Testing Guide

## What Was Fixed

The salawat sound reminder feature now allows you to:
1. ✅ **Enable/Disable** the salawat reminder sound
2. ✅ **Choose** which salawat sound to use (from available options)
3. ✅ **Preview** the sound before confirming the selection
4. ✅ **Set the interval** (1, 5, 10, 15, 30 minutes, or every hour)
5. ✅ **Auto-play** the selected sound at your chosen interval

## How to Test

### Step 1: Open Settings
1. Open the app at `http://localhost:3000`
2. Navigate to **Settings** (usually in the "More" menu or bottom navigation)

### Step 2: Find Salawat Settings
1. Scroll to the **"Push Notifications"** section
2. Look for **"Salawat Sound"** setting with a Volume icon 🔊

### Step 3: Enable Salawat Reminder
1. Toggle the **"Salawat Sound"** to **ON**
2. You should see a new card appear: **"Choose Salawat"**

### Step 4: Preview & Select Sound
1. Click the **Play button** (▶️) to hear the salawat sound
2. Click the **dropdown button** to see available sounds
3. Select your preferred sound
4. The preview will automatically play when you select

### Step 5: Set the Interval
1. Another card will appear: **"Repeat Interval"**
2. Choose when you want the sound to play:
   - Every 1 Minute (testing)
   - Every 5 Minutes
   - Every 10 Minutes
   - Every 15 Minutes (default)
   - Every 30 Minutes
   - Every 1 Hour

### Step 6: Verify It Works
1. Once enabled with a selected interval, your settings should be saved automatically
2. The reminder will start playing at the configured interval
3. You can pause the sound at any time by turning off the toggle

## Features in Action

### English View
```
Salawat Sound              [ON/OFF]
Choose Salawat
├─ Play/Pause Button
└─ Sound Selector Dropdown
  
Repeat Interval           [Selected: 15 Minutes]
```

### Arabic View
```
صوت الصلاة على النبي      [ON/OFF]
اختر نوع الصلاة
├─ زر التشغيل/الإيقاف
└─ اختر من القائمة
  
فترة التكرار              [المختار: 15 دقيقة]
```

## Available Sounds

Currently available:
- **Salawat - Default**: Basic salawat sound

Future sounds can be added by:
1. Adding audio files to `/public/audio/` directory
2. Updating the `SALAWAT_SOUNDS` configuration in `src/lib/constants.ts`

## Troubleshooting

### Sound doesn't play?
- ✅ Make sure audio is enabled in browser settings
- ✅ Check that salawat reminder is turned ON
- ✅ Make sure volume is not muted on your device
- ✅ Try clicking the play button to test audio first

### Settings not saving?
- ✅ The settings are auto-saved to browser localStorage
- ✅ Refresh the page to verify settings persist
- ✅ Check browser developer tools: Application → LocalStorage → zad-muslim-settings

### Interval not working?
- ✅ Browser tab must remain open for reminders to play
- ✅ Audio must be unlocked (first interaction required)
- ✅ Check browser console for any errors (F12 → Console)

## Technical Details

### What Changed
- **New Setting**: `salawatSound` field added to user preferences
- **New Hook**: `useSalawatPlayer` for playing preview audio
- **UI Update**: New selector card in Settings → Push Notifications section
- **Auto-persistence**: Settings saved to browser localStorage automatically

### Browser Support
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS, Android)

## Next Steps

To customize salawat sounds further:
1. Add more audio files to `/public/audio/salawat_*.mp3`
2. Update `SALAWAT_SOUNDS` in constants
3. Users can then select different sounds in settings

## Questions?

If the feature isn't working as expected:
1. Check the browser console (F12 → Console tab) for errors
2. Verify that the `dev.log` shows no compilation errors
3. Clear browser cache and refresh
4. Try in incognito/private mode to rule out cached settings
