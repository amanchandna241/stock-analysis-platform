# 📱 Alphiq — Native Android App Guide

The **Alphiq** platform is fully configured to compile and run as a **Native Android Application** using **Capacitor** by Ionic.

---

## 🏗️ Architecture & Features

- **100% Codebase Reuse**: Shares the exact same Next.js 14 frontend components, Recharts visualizations, and live FastAPI backend APIs.
- **Native Android Wrapper**: Located in [`frontend/android`](file:///d:/projects/stock-analysis-platform/frontend/android).
- **Cleartext & Network Config**: Configured to seamlessly connect with local/cloud backend APIs over HTTP/HTTPS (`cleartext: true`).
- **Capacitor Native Plugins**: Ready for native push notifications (valuation alerts), biometric login, and native social sharing.

---

## 🚀 Building & Running the Android App

### Prerequisites
- **Node.js**: v18+
- **Android Studio**: Jellyfish / Koala or newer
- **Android SDK**: API Level 33+ (Android 13/14)
- **Java Development Kit (JDK)**: JDK 17+

---

### Step 1: Export Web Build & Sync to Android
From the `frontend` directory:

```bash
cd frontend

# Build static web export
npm run build

# Sync assets & plugins into native Android project
npx cap sync android
```

---

### Step 2: Open in Android Studio
To inspect, edit, or run the app on an Android Emulator or physical phone:

```bash
npx cap open android
```
*Or open the folder `frontend/android` directly inside Android Studio.*

---

### Step 3: Build Debug APK via Command Line
If you want to compile an Android APK (`.apk`) directly without opening Android Studio:

```bash
cd frontend/android

# Build Debug APK (Windows)
.\gradlew assembleDebug

# Build Debug APK (macOS/Linux)
./gradlew assembleDebug
```

The compiled APK will be generated at:
📍 `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Installing on Your Android Phone

1. Transfer `app-debug.apk` to your Android phone via USB, Google Drive, or WhatsApp.
2. Open the file on your phone and tap **Install** (*Enable 'Install from Unknown Sources' if prompted*).
3. Open **Alphiq** and access live stock research, ML forecasts, and AI advisor recommendations natively!

---

## 🛠️ Project Configuration Files

| File | Location | Description |
| :--- | :--- | :--- |
| **Capacitor Config** | [`frontend/capacitor.config.json`](file:///d:/projects/stock-analysis-platform/frontend/capacitor.config.json) | App ID (`com.alphiq.stockresearch`), App Name, & Server settings |
| **Next.js Config** | [`frontend/next.config.js`](file:///d:/projects/stock-analysis-platform/frontend/next.config.js) | Static export (`output: 'export'`) & unoptimized image bundling |
| **Android Gradle** | [`frontend/android/build.gradle`](file:///d:/projects/stock-analysis-platform/frontend/android/build.gradle) | Android Gradle build pipeline configuration |
| **Android Manifest** | `frontend/android/app/src/main/AndroidManifest.xml` | Native permissions, package name, & activity intent filters |
