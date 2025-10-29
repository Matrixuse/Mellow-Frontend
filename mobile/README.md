Mellow Mobile Prototype

This folder contains a minimal React Native prototype that demonstrates usage of `react-native-track-player` to create a native media session and OS-managed notification. The goal is to show how letting the native library manage the notification prevents flicker when updating playback position.

Important: This is a lightweight scaffold. To run it you need a full React Native environment (Node, Yarn or npm, Android SDK/Android Studio for Android builds). See React Native docs if you need to install the toolchain.

Quick setup

1. From the repository root run (powershell):

   cd mobile
   npm install

2. If you haven't generated native Android/iOS project files, initialize the RN project. If `npm install` produced errors related to missing native folders, run:

   npx react-native init MellowMobile

   This will create a complete RN project. If that creates a new folder, merge the files from this `mobile/` scaffold into the generated project (overwrite `App.js`, `index.js`, `service.js`, `app.json`, and `package.json` as needed).

3. Install iOS pods (macOS only):

   cd ios
   npx pod-install

4. Run on Android (requires Android toolchain and emulator or device):

   npx react-native run-android

   Or run via Android Studio.

What this prototype includes

- `index.js` — registers the `playbackService` with TrackPlayer.
- `App.js` — sets up the TrackPlayer, defines capabilities, and offers a small UI to add a demo track and play/pause.
- `service.js` — playback service that responds to remote play/pause/next/prev/stop events.

Notes

- `react-native-track-player` will manage the native MediaSession and notification. Do not add custom notification-building code for playback; that will reintroduce flicker.
- After you confirm this prototype works for your needs, we can proceed to a full migration plan or port UI components incrementally.
