# JamStockAnalytics - Android Studio Setup Guide

## 📱 Project Overview
**JamStockAnalytics** is a React Native/Expo app for Jamaica Stock Exchange financial news analysis with AI-powered insights.

## 🛠️ Android Studio Setup Instructions

### Prerequisites
1. **Android Studio** (latest version)
2. **Java Development Kit (JDK)** 11 or higher
3. **Android SDK** (API level 21+)
4. **Node.js** (v16 or higher)
5. **npm** or **yarn**

### Project Structure
```
JamStockAnalytics/
├── android/                 # Android Studio project
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/junior876/jamstockanalytics/
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle.properties
├── app/                     # React Native screens
├── components/              # Reusable components
├── lib/                     # Services and utilities
├── package.json
└── App.js
```

### Setup Steps

#### 1. Open in Android Studio
```bash
# Navigate to project directory
cd JamStockAnalytics

# Open Android Studio
# File -> Open -> Select the 'android' folder
```

#### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install React Native dependencies
npx react-native install
```

#### 3. Configure Android SDK
- Open **SDK Manager** in Android Studio
- Install **Android SDK Platform 33**
- Install **Android SDK Build-Tools 33.0.0**
- Install **Android SDK Platform-Tools**

#### 4. Configure Gradle
- Open `android/gradle.properties`
- Ensure these properties are set:
```properties
android.useAndroidX=true
android.enableJetifier=true
```

#### 5. Build Configuration
- **Package Name**: `com.junior876.jamstockanalytics`
- **Min SDK**: 21
- **Target SDK**: 33
- **Compile SDK**: 33

### 🚀 Running the App

#### Development Mode
```bash
# Start Metro bundler
npx react-native start

# Run on Android device/emulator
npx react-native run-android
```

#### Production Build
```bash
# Generate APK
cd android
./gradlew assembleRelease

# Generate AAB (for Play Store)
./gradlew bundleRelease
```

### 📱 Key Features
- **AI-Powered News Analysis**: Jamaica Stock Exchange news with AI prioritization
- **Real-time Market Data**: Live JSE market information
- **Chat Interface**: Conversational AI for financial insights
- **Analysis Mode**: Deep financial research tools
- **Authentication**: Secure user login and registration

### 🔧 Development Tools
- **React Native Debugger**: For debugging React Native code
- **Flipper**: For network debugging and performance monitoring
- **Android Studio Profiler**: For performance analysis

### 📦 Dependencies
- **React Native**: 0.72+
- **Expo**: Latest version
- **React Native Paper**: Material Design components
- **Supabase**: Backend services
- **DeepSeek**: AI integration

### 🐛 Troubleshooting
1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **Gradle build issues**: Clean project with `cd android && ./gradlew clean`
3. **Dependency conflicts**: Delete `node_modules` and run `npm install`

### 📞 Support
For technical support or questions about the project setup, contact the development team.

---
**Project ID**: 2241d06b-c07b-4ce2-8337-bc20021d2feb  
**Owner**: junior876  
**Last Updated**: $(date)
