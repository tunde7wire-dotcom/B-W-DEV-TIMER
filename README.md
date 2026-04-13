# B&W Film Development Timer (PWA)

A professional, offline-first single-page application for black and white film development.

## Features
- **Offline-First**: Works without an internet connection once installed.
- **PWA Support**: Installable on iOS (Add to Home Screen) and Android.
- **Session Recovery**: If the app is closed or refreshed during a timer, it resumes exactly where it left off.
- **Accurate Timing**: Uses system timestamps to prevent drift, even when the browser is in the background.
- **Darkroom Mode**: Red-light interface to protect light-sensitive materials.
- **Voice Guidance**: Calm British female voice for hands-free operation.
- **Lock Protection**: Long-press to unlock prevents accidental taps during development.

## Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Deployment
This is a pure client-side application. You can deploy it to any static hosting service:
- **Vercel / Netlify**: Connect your GitHub repo and it will auto-deploy.
- **GitHub Pages**: Use the `gh-pages` branch or a GitHub Action.
- **Cloud Run / S3**: Build the app (`npm run build`) and serve the `dist/` folder.

## iOS Installation
1. Open the app in Safari.
2. Tap the **Share** button (box with upward arrow).
3. Scroll down and tap **Add to Home Screen**.
4. The app will now appear on your home screen and run in full-screen mode without browser UI.
