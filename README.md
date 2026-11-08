# Petsy — Smart Pet Health Tracker

A real mobile app built with Expo (React Native). Track multiple pets, get
reminders for vaccinations/meds/grooming/vet visits, keep a digital health
record, and watch growth over time — all saved on your phone.

## Run it on your own phone (no developer account needed)

1. **Install Node.js** (if you don't have it): https://nodejs.org — get the
   "LTS" version, then restart your terminal.

2. **Install the Expo Go app** on your phone, from the Play Store (Android)
   or App Store (iPhone). Search "Expo Go".

3. **Unzip this project**, then open a terminal inside the `petsy` folder
   and run:

   ```
   npm install
   npx expo start
   ```

4. A QR code will appear in the terminal. Open the **Expo Go** app on your
   phone and scan it (Android: use the in-app scanner; iPhone: use the
   regular Camera app, then tap the banner that pops up).

5. Petsy opens on your phone. Any code changes you make and save will
   reload automatically while `npx expo start` is running.

Your phone and computer need to be on the **same Wi-Fi network** for this
to work.

## What's inside

- `App.js` — navigation shell (4 tabs: Home, Reminders, Records, Profile)
- `src/data/PetsContext.js` — all app data (pets, reminders, records),
  saved automatically to the phone's storage
- `src/screens/` — the four main screens
- `src/screens/forms/` — the "add pet" / "add reminder" / "add record" /
  "log weight" forms, shown as pop-up sheets
- `src/components/` — reusable pieces (cards, buttons, the growth chart,
  the paw-stamp status badge)
- `src/theme/theme.js` — all colors and category settings in one place

Sample data for two pets (Milo the dog, Nala the cat) is pre-loaded so you
can see how everything looks. Delete them from the Profile tab whenever
you're ready to add your own.

## When you're ready to publish to the App Store / Play Store

That part needs accounts that only you can create (they require your
identity and payment details):

- **Google Play**: a one-time $25 Google Play Developer account —
  https://play.google.com/console/signup
- **Apple App Store**: a $99/year Apple Developer account —
  https://developer.apple.com/programs/

Once you have those, Expo's own build service (called **EAS Build**) turns
this same project into the installable files each store needs, and
**EAS Submit** uploads them for you — both driven by simple terminal
commands, no native coding required. Their guide:
https://docs.expo.dev/tutorial/eas/introduction/
