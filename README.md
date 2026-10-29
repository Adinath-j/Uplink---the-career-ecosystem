# UPLINK — Unified Campus Career & Professional Ecosystem

> **A Unified Campus Career and Professional Ecosystem for Skill Matching, Opportunity Management, and Industry Interaction.**

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
  - [The Problem](#the-problem)
  - [Project Objectives](#project-objectives)
  - [User Roles & Platforms](#user-roles--platforms)
  - [Current Implementation Status](#current-implementation-status)
  - [Core Functional Modules](#core-functional-modules)
- [2. Technology Stack](#2-technology-stack)
  - [Mobile Application (Implemented)](#mobile-application-implemented)
  - [Backend Services (Planned Architecture)](#backend-services-planned-architecture)
- [3. Project Architecture](#3-project-architecture)
  - [Directory Structure](#directory-structure)
  - [Directory & Module Responsibilities](#directory--module-responsibilities)
  - [Mobile Navigation Topology](#mobile-navigation-topology)
- [4. Prerequisites & Environment Setup (Windows)](#4-prerequisites--environment-setup-windows)
  - [Required Software](#required-software)
  - [Environment Variables Configuration](#environment-variables-configuration)
  - [Environment Verification Commands](#environment-verification-commands)
- [5. Installation & Initial Setup](#5-installation--initial-setup)
- [6. Running UPLINK on an Android Emulator](#6-running-uplink-on-an-android-emulator)
  - [Emulator Setup](#emulator-setup)
  - [Workflow A: One-Command CLI Launch](#workflow-a-one-command-cli-launch)
  - [Workflow B: Dedicated Metro + Build Workflow](#workflow-b-dedicated-metro--build-workflow)
  - [Developer Menu & Fast Refresh](#developer-menu--fast-refresh)
- [7. Running UPLINK on a Physical Android Phone (USB Debugging)](#7-running-uplink-on-a-physical-android-phone-usb-debugging)
  - [Device Configuration](#device-configuration)
  - [ADB Device States](#adb-device-states)
  - [USB Reverse Port Forwarding & Port Conflicts](#usb-reverse-port-forwarding--port-conflicts)
  - [Deployment & Fast Refresh](#deployment--fast-refresh)
- [8. Running UPLINK over Wi-Fi Debugging](#8-running-uplink-over-wi-fi-debugging)
  - [Modern Android 11+ Wireless Debugging](#modern-android-11-wireless-debugging)
  - [Legacy USB-Assisted Wireless Debugging (Android 10 and below)](#legacy-usb-assisted-wireless-debugging-android-10-and-below)
  - [Security Considerations](#security-considerations)
- [9. Metro Bundler & Fast Refresh](#9-metro-bundler--fast-refresh)
  - [Metro Responsibilities](#metro-responsibilities)
  - [Babel & Worklets Configuration](#babel--worklets-configuration)
  - [When Are Native Rebuilds Required?](#when-are-native-rebuilds-required)
- [10. Common Development Commands Reference](#10-common-development-commands-reference)
- [11. Building the Android APK (Debug vs. Release)](#11-building-the-android-apk-debug-vs-release)
  - [Debug APK](#debug-apk)
  - [Release APK](#release-apk)
  - [Direct ADB Installation](#direct-adb-installation)
- [12. Backend Development (Planned Architecture)](#12-backend-development-planned-architecture)
  - [Core Principles & Architectural Boundaries](#core-principles--architectural-boundaries)
  - [Planned Spring Boot Modules](#planned-spring-boot-modules)
- [13. API & Database Specifications](#13-api--database-specifications)
- [14. Comprehensive Troubleshooting Matrix](#14-comprehensive-troubleshooting-matrix)
- [15. Recommended Daily Development Workflow](#15-recommended-daily-development-workflow)
- [16. Documentation Index](#16-documentation-index)
- [17. Roadmap & Contribution Guidelines](#17-roadmap--contribution-guidelines)
- [18. Public Landing Page (Web Portal)](#18-public-landing-page-web-portal)
  - [Architecture & Technology](#architecture--technology)
  - [Quick Start for Landing Development](#quick-start-for-landing-development)
  - [Android APK Distribution Setup](#android-apk-distribution-setup)

---

## 1. Project Overview

**UPLINK** is an integrated campus ecosystem engineered to bridge the divide between students, recruiters, and educational institutions. It provides a structured, transparent, and verified platform where academic credentials, verified skills, career opportunities, structured Q&A, and alumni mentorship converge.

### The Problem

Traditional campus placement and student professional networks suffer from several critical issues:
1. **Opaque Opportunity Distribution:** Internships, hackathons, and corporate opportunities are scattered across disorganized chat groups, unverified job boards, and departmental notice boards.
2. **Fabricated & Untracked Applications:** External links leave students with no status visibility, leading to duplicate submissions and unverified application claims.
3. **Unstructured Academic Discussions:** Student doubts are lost in transient chat apps without topic organization, searchability, or quality-ranking mechanisms.
4. **Isolated Mentorship:** Alumni and industry seniors are inaccessible to underclassmen seeking directional guidance.

### Project Objectives

- **Unified Discovery:** Provide a single hub for campus notices, events, internships, jobs, hackathons, scholarships, competitions, workshops, and certifications.
- **Auditable Applications:** Transparently manage internal campus application statuses (Applied, Screening, Interview, Offered, Closed) with explicit external-link handoffs.
- **Collaborative Problem Solving:** Deliver a structured Q&A platform with topic tags, transparent doubt-ranking, and community signals (Same-Doubt).
- **Verified Guidance:** Connect students with industry mentors through directory discovery and structured session requests.
- **Information-First Minimalism:** Maintain a distraction-free, professional aesthetic using curated typography, disciplined borders, and high-performance SVG vector iconography.

### User Roles & Platforms

| Role | Primary Interface | Scope & Permissions |
| :--- | :--- | :--- |
| **STUDENT** | **Mobile App (React Native)** | Full access to Discover Home, Opportunities, Q&A, Mentorship, Profile management, Application tracker, and Notifications. |
| **RECRUITER** | **Web Portal (Planned)** | Opportunity creation, lifecycle publishing, candidate search on permitted fields, and applicant pipeline review. |
| **ADMIN** | **Web Dashboard (Planned)** | Recruiter verification queue, Q&A content moderation, opportunity audits, and system configuration. |

> *Note:* Mentors do not have a dedicated login role in the initial implementation; they are discovered and requested through the student directory.

### Current Implementation Status

- **Student Mobile App:** **Fully Implemented & Verified** (Milestone 1). All 18 screens, 6 Zustand stores, 14 reusable components, and full navigation hierarchy are operational. Clean TypeScript compilation (0 errors), ESLint compliance (0 errors), and 100% Jest test suite passes. Native Android debug APK successfully compiled.
- **Core Backend:** **Planned** (Milestone 1 Core Backend). The mobile client operates against an abstracted API client layer (`src/services/api/apiClient.ts`) that falls back to realistic, typed mock data (`src/services/mockData/`) via the `USE_MOCK_DATA: true` flag in `src/config/env.ts`.
- **Recruiter & Admin Portals:** **Planned** (Milestone 2).

### Core Functional Modules

* **Home / Discover:** Top-level campus dashboard displaying the **Discover** header, search entry point, category filter chips, featured verified opportunities carousel, and upcoming campus notices & events.
* **Jobs / Explore Opportunities:** Complete listing covering 10 opportunity categories (Internships, Jobs, Hackathons, Competitions, Scholarships, Workshops, Certifications, Training, Research, Apprenticeships). Features real-time search, work-mode filters (Remote, On-site, Hybrid), bookmarking, internal applications, and external handoffs.
* **Q&A Ecosystem:** Topic-categorized student discussion system featuring 4 feed views (**For You**, **Unanswered**, **Trending**, **My Questions**), single-tap Same-Doubt count increment, question detail with answers, accepted-answer tags, and basic content reporting.
* **Mentor Directory:** Browse verified industry and alumni mentors by domain (Software, AI/ML, Cloud, Placement, etc.), view detailed profiles (bio, years of experience, current company), and submit structured booking requests.
* **Student Profile:** Academic records (institution, department, graduation year, CGPA), skills taxonomy, projects, certifications, and experience. Editable via a modal screen.
* **Application Tracker:** Centralized "My Applications" screen tracking internal application statuses with visual status badges.
* **Notifications:** In-app notification center tracking status changes, booking request responses, and campus announcements.

---

## 2. Technology Stack

### Mobile Application (Implemented)

The mobile client is built strictly using **React Native CLI** (avoiding Expo runtime overhead) targeting the modern New Architecture on React Native 0.88.

| Layer / Capability | Package / Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Core Framework** | `react-native` | `0.88.0` | Native mobile runtime (New Architecture enabled) |
| **Core Engine** | `react` | `19.3.0` | React core library |
| **Language** | `typescript` | `^6.0.3` | Strict static typing across models, stores, and screens |
| **Navigation** | `@react-navigation/native` | `^7.0.14` | Single root navigation container & theme provider |
| | `@react-navigation/native-stack` | `^7.2.0` | Native platform stack transitions |
| | `@react-navigation/bottom-tabs` | `^7.2.0` | 4-tab bottom navigation shell |
| **State Management** | `zustand` | `^5.0.16` | Lightweight, decoupled global client state |
| **Local Persistence**| `@react-native-async-storage/async-storage` | `^2.1.2` | Key-value storage for onboarding status & bookmark IDs |
| **Gestures & Motion**| `react-native-gesture-handler` | `^3.4.0` | Native touch interaction handling |
| | `react-native-reanimated` | `^4.7.1` | Declarative UI thread animations |
| | `react-native-worklets` | `^0.13.0` | Worklet runtime supporting Reanimated 4 |
| **Native Screens** | `react-native-screens` | `^4.30.0` | Native view hierarchy optimization |
| **Safe Areas** | `react-native-safe-area-context`| `^5.5.2` | Inset handling for notches, cutouts, and gesture bars |
| **Vector Icons** | `lucide-react-native` | `^1.61.0` | Crisp SVG vector outline icons (no font linking needed) |
| | `react-native-svg` | `^15.16.0` | Native SVG rendering engine |
| **UI Components** | `react-native-paper` | `^5.15.3` | Selective accessibility and surface utilities |
| **Bundler** | `@react-native/metro-config` | `0.88.0` | Metro JavaScript bundler (`useWatchman: false`) |
| **Babel Compiler** | `@react-native/babel-preset` | `0.88.0` | JS/TS transpilation with Worklets plugin |
| **Testing** | `jest` & `@react-native/jest-preset` | `^29.6.3` | Unit testing with custom mocks |
| **Linting** | `eslint` & `@react-native/eslint-config` | `^8.19.0` | Code quality and style enforcement |

### Backend Services (Planned Architecture)

*The backend architecture is documented as planned specification and is not yet implemented in the codebase.*

- **Framework:** Java 17+ with Spring Boot 3.x (Modular Monolith)
- **Database:** PostgreSQL (hosted via Supabase)
- **Persistence:** Spring Data JPA / Hibernate
- **Migrations:** Flyway for version-controlled schema evolution
- **Authentication:** Stateless Spring Security with signed JWT tokens
- **Caching & Rate Limiting:** Redis (targeted for refresh token blacklisting & search throttling)
- **API Documentation:** OpenAPI 3.0 / Swagger UI
- **Boundary Rule:** The mobile client communicates exclusively with the Spring Boot REST API (`/api/v1/*`). The mobile app **must never** communicate directly with Supabase application tables.

---

## 3. Project Architecture

### Directory Structure

```text
C:\dev\Uplink\
├── docs/                               # Authoritative product specifications
│   ├── COMPONENTS.md                   # Reusable UI component catalogue
│   ├── DESIGN_SYSTEM.md                # Design tokens, color palette, typography
│   ├── FEATURES.md                     # Feature breakdown by milestone
│   ├── NAVIGATION.md                   # Screen hierarchy & route parameters
│   ├── PROJECT.md                      # System overview, glossary, objectives
│   ├── REQUIREMENTS.md                 # Technical & functional requirements
│   ├── ROADMAP.md                      # Milestone timeline (0 through 5)
│   ├── SCREENS.md                      # Individual screen specifications
│   └── TASKS.md                        # Master implementation checklist
├── mobile/                             # React Native CLI mobile project
│   ├── __tests__/                      # Jest test suites
│   │   ├── stores/                     # Store unit tests (preferences, opportunity, qa, mentor)
│   │   └── App.test.tsx                # Root App render validation
│   ├── android/                        # Native Android Gradle project
│   │   ├── app/                        # Main application module
│   │   │   ├── src/main/AndroidManifest.xml
│   │   │   └── build.gradle            # applicationId: "com.mobile", SDK 34-37
│   │   ├── build.gradle                # Project build script (Kotlin 2.2.0, NDK 27)
│   │   ├── gradlew.bat                 # Windows Gradle wrapper
│   │   └── local.properties            # Machine-specific SDK path (ignored in git)
│   ├── ios/                            # Native iOS Xcode project & Podfile
│   ├── src/                            # Application TypeScript source code
│   │   ├── components/                 # Presentation components
│   │   │   ├── common/                 # 14 Reusable UI primitives (Buttons, Header, Icon, etc.)
│   │   │   ├── mentor/                 # MentorListItem
│   │   │   ├── opportunity/            # OpportunityCard, OpportunityListItem
│   │   │   ├── profile/                # ProfileSection
│   │   │   └── qa/                     # QuestionListItem, SameDoubtButton
│   │   ├── config/                     # Centralized environment configuration
│   │   │   └── env.ts                  # API base URLs, timeouts, feature flags
│   │   ├── navigation/                 # Navigation setup
│   │   │   ├── BottomTabNavigator.tsx  # Exactly 4 tabs: Home, Jobs, QA, Mentors
│   │   │   └── RootNavigator.tsx       # Root NativeStack inside single NavigationContainer
│   │   ├── screens/                    # 18 Modular application screens
│   │   │   ├── auth/                   # SignIn, SignUp, ForgotPassword
│   │   │   ├── bootstrap/              # BootstrapScreen (session & onboarding loader)
│   │   │   ├── home/                   # HomeScreen (Discover header & campus feed)
│   │   │   ├── feed/                   # FeedScreen (backwards compatibility alias)
│   │   │   ├── jobs/                   # JobsScreen, Detail, Saved, MyApplications
│   │   │   ├── mentors/                # MentorsScreen, Detail, BookingRequest
│   │   │   ├── notifications/          # NotificationsScreen
│   │   │   ├── onboarding/             # OnboardingScreen (3-step walkthrough)
│   │   │   ├── profile/                # MyProfileScreen, EditProfileScreen
│   │   │   └── qa/                     # QAFeedScreen, Detail, AskQuestion
│   │   ├── services/                   # API clients and mock fallback providers
│   │   │   ├── api/                    # apiClient.ts (timeout, bearer headers, typed responses)
│   │   │   ├── mockData/               # Typed mock data (10 categories, questions, mentors, profile)
│   │   │   ├── authService.ts
│   │   │   ├── mentorService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── opportunityService.ts
│   │   │   ├── profileService.ts
│   │   │   └── qaService.ts
│   │   ├── store/                      # Zustand global state stores
│   │   │   ├── authStore.ts            # Session, student auth, demo mode
│   │   │   ├── mentorStore.ts          # Mentor directory & booking requests
│   │   │   ├── opportunityStore.ts     # Opportunities, filters, application tracking
│   │   │   ├── preferencesStore.ts     # AsyncStorage: onboarding flag & saved bookmark IDs
│   │   │   ├── profileStore.ts         # Student profile & academic details
│   │   │   └── qaStore.ts              # Q&A feed tabs, voting, question creation
│   │   ├── theme/                      # Design tokens (colors, typography, spacing, radii)
│   │   ├── types/                      # TypeScript definitions (models.ts, navigation.ts)
│   │   └── utils/                      # Helper utilities (delay.ts)
│   ├── App.tsx                         # Root app entry (SafeAreaProvider + StatusBar)
│   ├── app.json                        # App name ("mobile") & displayName ("UPLINK")
│   ├── babel.config.js                 # Worklets plugin configuration
│   ├── index.js                        # Gesture handler bootstrap & AppRegistry
│   ├── jest.config.js                  # Jest configuration with ESM transform rules
│   ├── jest.setup.js                   # Mocks for AsyncStorage, Safe Area, Reanimated, Lucide
│   ├── metro.config.js                 # Metro bundler config (useWatchman: false)
│   ├── package.json                    # Dependencies & execution scripts
│   └── tsconfig.json                   # TypeScript compiler configuration
└── README.md                           # Primary documentation entry point
```

### Directory & Module Responsibilities

| Directory | Scope & Responsibility |
| :--- | :--- |
| `mobile/src/components/common/` | Strictly reusable, stateless or lightly-controlled design primitives (AppHeader, Avatar, Icon, PrimaryButton, SearchField, FilterChips, StatusBadge, EmptyState, LoadingState, ErrorState). |
| `mobile/src/config/` | Centralizes runtime variables (`API_BASE_URL`, timeouts, feature flags) so no API endpoints are hardcoded inside screen components. |
| `mobile/src/navigation/` | Houses the single `NavigationContainer` and declares all stack/tab route types. |
| `mobile/src/screens/` | Full-screen components implementing screen layouts specified in `docs/SCREENS.md`. Screen components read from stores and invoke service actions. |
| `mobile/src/services/` | Data access layer. Handles network calls, timeout wrapping, authentication header injection, and falls back to typed mock data when `USE_MOCK_DATA: true`. |
| `mobile/src/store/` | Zustand state slices. Isolates state mutation and persistence logic away from presentation components. |
| `mobile/src/theme/` | Raw design tokens from `docs/DESIGN_SYSTEM.md`: Primary `#135BEC`, Surface `#FFFFFF`, Muted `#F7F9FC`, Borders `#E5E7EB`, Text `#111827`. |
| `mobile/src/types/` | Data contracts (`Opportunity`, `StudentProfile`, `Question`, `Answer`, `Mentor`, `BookingRequest`) and React Navigation param lists. |

### Mobile Navigation Topology

The navigation hierarchy strictly enforces the architectural rules defined in `docs/NAVIGATION.md`:

```text
RootNavigator (NativeStack)
├── Bootstrap (Session & onboarding hydration)
├── Onboarding (3-slide walkthrough)
├── SignIn
├── SignUp
├── ForgotPassword
│
├── MainTabs (BottomTabNavigator - STRICTLY 4 TABS)
│   ├── Home (Header: "Discover" + Bookmark + Bell + Avatar)
│   ├── Jobs (Header: "Explore Opportunities" + Bookmark + Bell + Avatar)
│   ├── QA   (Header: "Q&A" + Bookmark + Bell + Avatar)
│   └── Mentors (Header: "Find Mentors" + Bookmark + Bell + Avatar)
│
├── OpportunityDetail (NativeStack Screen)
├── SavedOpportunities (NativeStack Screen)
├── MyApplications (NativeStack Screen)
├── QuestionDetail (NativeStack Screen)
├── AskQuestion (Modal Presentation)
├── MentorDetail (NativeStack Screen)
├── BookingRequest (Modal Presentation)
├── MyProfile (NativeStack Screen - accessed via Header Avatar)
├── EditProfile (Modal Presentation)
└── Notifications (NativeStack Screen)
```

> **Critical Architecture Rule:** Profile is **NOT** a 5th bottom navigation tab. It is accessible exclusively through the avatar button in the top-right header action across all screens.

---

## 4. Prerequisites & Environment Setup (Windows)

Developing and compiling UPLINK requires a properly configured Windows 10/11 environment.

### Required Software

1. **Node.js:** `v22.11.0 LTS` or later (tested on Node.js `v24.22.1`).
2. **npm:** `v10.x` or `v11.x` (tested on npm `11.19.1`).
3. **Java Development Kit (JDK):** **OpenJDK 17 LTS** (tested with Microsoft Build of OpenJDK `17.0.20.1`). React Native 0.88 requires JDK 17.
4. **Android Studio:** Android Studio Ladybug / Iguana or later.
5. **Android SDK:**
   - **Android SDK Platform 34 and 35** (Android 14 & 15).
   - **Android SDK Build-Tools:** Version `37.0.0` (as defined in `android/build.gradle`).
   - **Android SDK Command-line Tools (latest)**.
   - **Android NDK:** Version `27.1.12297006` (matches `ndkVersion` in `android/build.gradle`).
   - **Android SDK Platform-Tools:** Provides `adb`.

### Environment Variables Configuration

Set the following User or System Environment Variables in Windows:

1. **`JAVA_HOME`:**
   ```text
   C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot
   ```
   *(Adjust to match your installed JDK 17 folder).*

2. **`ANDROID_HOME`:**
   ```text
   C:\Users\<YOUR_USERNAME>\AppData\Local\Android\Sdk
   ```

3. **`PATH` Additions:** Append the following entries to your `Path` variable:
   ```text
   %JAVA_HOME%\bin
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\cmdline-tools\latest\bin
   ```

### Environment Verification Commands

Open a fresh Windows PowerShell prompt and run these commands to verify your setup:

```powershell
node --version
# Expected: v22.11.0 or higher

npm --version
# Expected: 10.x or 11.x

java -version
# Expected: openjdk version "17.0.x"

adb version
# Expected: Android Debug Bridge version 1.0.41 (or higher)

adb devices
# Expected: List of devices attached (shows emulator or physical device ID)
```

Verify that Android SDK configuration is recognized by checking `local.properties`:

```powershell
Get-Content C:\dev\Uplink\mobile\android\local.properties
# Expected: sdk.dir=C\:\\Users\\<YOUR_USERNAME>\\AppData\\Local\\Android\\Sdk
```

---

## 5. Installation & Initial Setup

To set up the project on a new development machine:

```powershell
# 1. Navigate to the mobile project root
cd C:\dev\Uplink\mobile

# 2. Install JavaScript and native wrapper dependencies
npm install --legacy-peer-deps

# 3. Ensure local.properties points to your Android SDK
# (Replace with your actual Windows username if different)
Set-Content -Path "android\local.properties" -Value "sdk.dir=C\:\\Users\\$env:USERNAME\\AppData\\Local\\Android\\Sdk"

# 4. Verify TypeScript compilation
npx tsc --noEmit
# Must report 0 errors

# 5. Verify ESLint compliance
npm run lint
# Must report 0 errors

# 6. Run all Jest unit tests
npm test -- --watchAll=false
# Must report 5/5 test suites passed
```

---

## 6. Running UPLINK on an Android Emulator

### Emulator Setup

1. Open **Android Studio**.
2. Navigate to **Tools → Device Manager**.
3. Click **Create Device** and select a modern phone profile (e.g., **Pixel 8** or **Pixel 7**).
4. Select a system image with **API Level 34 (UpsideDownCake)** or **API Level 35 (VanillaIceCream)** with Google APIs.
5. Finish creation and click the **Play** button to launch the emulator.
6. Verify ADB sees the emulator:
   ```powershell
   adb devices
   # Output should display: emulator-5554   device
   ```

### Workflow A: One-Command CLI Launch

The React Native CLI will automatically build the debug APK, start Metro, and launch the application on the active emulator:

```powershell
cd C:\dev\Uplink\mobile
npm run android
```

If your default port `8081` is occupied by another process, specify a custom port:

```powershell
npm run android -- --port 8082
```

### Workflow B: Dedicated Metro + Build Workflow

For day-to-day development, running Metro in a dedicated terminal provides clearer log visibility:

**Terminal 1 (Metro Bundler):**
```powershell
cd C:\dev\Uplink\mobile
npm start -- --port 8082
```

**Terminal 2 (Native Build & Launch):**
```powershell
cd C:\dev\Uplink\mobile
npm run android -- --port 8082
```

### Developer Menu & Fast Refresh

- **Open Developer Menu:** Press `Ctrl + M` (Windows) inside the emulator window.
- **Reload JS:** Press `R` twice rapidly in the emulator, or press `r` in the Metro terminal.
- **Toggle Fast Refresh:** Open the Developer Menu and select **Enable Fast Refresh**.

---

## 7. Running UPLINK on a Physical Android Phone (USB Debugging)

Running directly on a physical Android phone provides authentic rendering of display cutouts, safe areas, status bars, and hardware touch latency.

### Device Configuration

1. Open your phone's **Settings → About Phone**.
2. Tap **Build Number** 7 times until you see the toast: *"You are now a developer!"*.
3. Go back to **Settings → System → Developer Options**.
4. Enable **USB Debugging**.
5. Connect your phone to your PC via a USB data cable.
6. When prompted on your phone screen with **"Allow USB debugging?"**, check **"Always allow from this computer"** and tap **Allow**.

### ADB Device States

Run `adb devices` in PowerShell:

```powershell
adb devices
```

The device list indicates connection status:
- **`device`:** The device is authorized, online, and ready for deployment.
- **`unauthorized`:** Your phone screen is showing the RSA authorization prompt. Unlock your phone and tap **Allow**.
- **`offline`:** The connection is unstable. Re-plug the USB cable or run `adb kill-server` followed by `adb start-server`.

### USB Reverse Port Forwarding & Port Conflicts

Unlike an emulator, a physical device does not have a virtual loopback adapter to the PC. You must forward the Metro port from the phone to your computer via ADB.

#### Default Port (8081):
```powershell
adb reverse tcp:8081 tcp:8081
```

#### When Port 8081 is Busy (Port 8082 / 8083):
If another service occupies port 8081, pass `--port 8082` to Metro and reverse port 8082:

```powershell
# 1. Reverse port 8082 on the attached phone
adb reverse tcp:8082 tcp:8082

# 2. Verify active forwarding rules
adb reverse --list
# Output: UsbFfs tcp:8082 tcp:8082
```

### Deployment & Fast Refresh

Once port forwarding is active:

1. **Start Metro in Terminal 1:**
   ```powershell
   cd C:\dev\Uplink\mobile
   npm start -- --port 8082
   ```

2. **Deploy to Device in Terminal 2:**
   ```powershell
   cd C:\dev\Uplink\mobile
   npm run android -- --port 8082
   ```

3. **Fast Refresh:** Once installed, any change saved in `mobile/src/` will instantly update on the phone screen without a native rebuild.

---

## 8. Running UPLINK over Wi-Fi Debugging

Wireless debugging allows full development and Fast Refresh without being tethered to a USB cable.

### Modern Android 11+ Wireless Debugging

Android 11 and newer feature native wireless pairing with randomized security ports.

#### Step 1: Ensure Same Wi-Fi Network
Connect your Android phone and Windows development PC to the **same trusted Wi-Fi network**.

#### Step 2: Enable Wireless Debugging
1. Open **Settings → Developer Options → Wireless Debugging**.
2. Toggle **Wireless Debugging** to **On**.
3. Tap **"Pair device with pairing code"**. A dialog will appear displaying:
   - **Wi-Fi pairing code** (6 digits, e.g., `482910`)
   - **IP address & Port** (e.g., `192.168.1.45:39485`) — *this is the Pairing Port*.

#### Step 3: Pair from Windows PowerShell
```powershell
adb pair 192.168.1.45:39485
# Prompt: Enter pairing code: 482910
# Output: Successfully paired to 192.168.1.45:39485
```

#### Step 4: Connect to the Debugging Port
Return to the main **Wireless Debugging** screen. Note the IP address and port displayed under **"IP address & Port"** (e.g., `192.168.1.45:41829`).

> **Important:** The *Connection Port* is different from the *Pairing Port*. Always connect using the port listed on the main Wireless Debugging screen:

```powershell
adb connect 192.168.1.45:41829
# Output: connected to 192.168.1.45:41829
```

#### Step 5: Verify and Forward Port
```powershell
adb devices
# Output should show: 192.168.1.45:41829   device

# Forward Metro port over Wi-Fi
adb reverse tcp:8082 tcp:8082
```

Now you can start Metro (`npm start -- --port 8082`) and develop wirelessly with live Fast Refresh.

#### Disconnecting Wireless ADB
When finished, disconnect the session:
```powershell
adb disconnect 192.168.1.45:41829
```

---

### Legacy USB-Assisted Wireless Debugging (Android 10 and below)

For older Android versions:

1. Connect the phone via USB cable and confirm with `adb devices`.
2. Instruct the device's ADB daemon to listen on TCP port 5555:
   ```powershell
   adb tcpip 5555
   ```
3. Disconnect the USB cable.
4. Find the phone's IP address (**Settings → About Phone → Status → IP Address**).
5. Connect wirelessly:
   ```powershell
   adb connect 192.168.1.45:5555
   ```
6. Reverse the Metro port:
   ```powershell
   adb reverse tcp:8082 tcp:8082
   ```

### Security Considerations

- **Private Networks Only:** Never enable Wireless Debugging on public Wi-Fi (airports, cafes, open university Wi-Fi). Anyone on the network could theoretically connect to your device via ADB.
- **Turn Off When Inactive:** Disable Wireless Debugging in Developer Options when not actively testing.

---

## 9. Metro Bundler & Fast Refresh

### Metro Responsibilities

Metro is the dedicated JavaScript bundler for React Native. Its responsibilities include:
1. Resolving the JavaScript module dependency graph starting from index.js.
2. Transpiling modern TypeScript and JSX via Babel.
3. Serving the bundle over HTTP (`http://localhost:<PORT>/index.bundle?platform=android&dev=true`).
4. Maintaining a WebSocket connection with the app for Fast Refresh (HMR).

In `mobile/metro.config.js`, Watchman is explicitly disabled:
```javascript
const config = {
  resolver: {
    useWatchman: false, // Prevents Windows Watchman permission errors
  },
};
```

### Babel & Worklets Configuration

In `mobile/babel.config.js`, the Babel preset and Reanimated/Worklets plugin are configured:
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
};
```

### When Are Native Rebuilds Required?

| Change Type | Fast Refresh Handles Automatically? | Native Rebuild Required? |
| :--- | :---: | :---: |
| Editing TypeScript/JSX in `src/` (screens, components) | **YES** (Instant) | **NO** |
| Editing theme tokens, styles, or mock data | **YES** (Instant) | **NO** |
| Editing Zustand store state or business logic | **YES** (Instant) | **NO** |
| Adding an npm library that contains native code (C++, Java, Kotlin) | **NO** | **YES** (`assembleDebug` or `run-android`) |
| Modifying `android/app/src/main/AndroidManifest.xml` | **NO** | **YES** |
| Modifying `android/app/build.gradle` or native SDK versions | **NO** | **YES** |
| Adding custom app launcher icons to `android/app/src/main/res/mipmap-*` | **NO** | **YES** |

---

## 10. Common Development Commands Reference

All commands must be executed in PowerShell from `C:\dev\Uplink\mobile` (or `C:\dev\Uplink\mobile\android` where noted).

| Action | Command | Scope / Notes |
| :--- | :--- | :--- |
| **Install Dependencies** | `npm install --legacy-peer-deps` | Reconciles peer dependencies for React 19 / RN 0.88 |
| **Start Metro (Default Port)** | `npm start` | Runs Metro on default port `8081` |
| **Start Metro (Custom Port)** | `npm start -- --port 8082` | Runs Metro on port `8082` |
| **Reset Metro Cache** | `npm start -- --reset-cache --port 8082` | Clears Metro compilation cache |
| **Launch Android App** | `npm run android` | Builds debug APK and launches it |
| **Launch Android (Custom Port)**| `npm run android -- --port 8082` | Builds debug APK targeting Metro on port `8082` |
| **Run TypeScript Check** | `npx tsc --noEmit` | Strict type validation (0 errors expected) |
| **Run Linter** | `npm run lint` | ESLint static code analysis (0 errors expected) |
| **Run Unit Tests** | `npm test -- --watchAll=false` | Executes Jest test suites |
| **Verify JS Bundling** | `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output ./test-bundle.js` | Validates bundle generation without native build |
| **Assemble Debug APK** | `cd android; .\gradlew.bat assembleDebug` | Compiles native C++/Java/Kotlin into debug APK |
| **Clean Gradle Build** | `cd android; .\gradlew.bat clean` | Cleans Android build cache |
| **List Connected Devices** | `adb devices` | Shows emulator & USB/Wi-Fi devices |
| **Set USB Port Forwarding** | `adb reverse tcp:8082 tcp:8082` | Maps device port 8082 to PC port 8082 |
| **List Port Forwarding** | `adb reverse --list` | Displays active ADB forwarding rules |
| **View Real-Time JS Logs** | `adb logcat -s ReactNativeJS` | Streams `console.log` messages from phone |

---

## 11. Building the Android APK (Debug vs. Release)

### Debug APK

The Debug APK includes debug symbols, React Native Developer Menu hooks, and allows connecting to a running Metro development server for Fast Refresh.

To assemble the Debug APK:

```powershell
cd C:\dev\Uplink\mobile\android
.\gradlew.bat assembleDebug
```

- **Output Location:**
  ```text
  C:\dev\Uplink\mobile\android\app\build\outputs\apk\debug\app-debug.apk
  ```
- **Size:** ~218 MB (includes uncompressed debug symbols, C++ CMake libraries for arm64-v8a, armeabi-v7a, x86, x86_64, and Hermes runtime).

### Release APK

The Release APK is self-contained and pre-packages the compiled JavaScript bundle and static assets inside the APK. It **does not require Metro** to run and can be distributed to testers.

To assemble the Release APK:

```powershell
cd C:\dev\Uplink\mobile\android
.\gradlew.bat assembleRelease
```

- **Output Location:**
  ```text
  C:\dev\Uplink\mobile\android\app\build\outputs\apk\release\app-release.apk
  ```
- **Signing Note:** By default, Android requires signing keys for production releases. For internal evaluation, Gradle uses default debug signing unless a release keystore is configured in `android/app/build.gradle`.

### Direct ADB Installation

To install a compiled APK onto an attached device:

```powershell
adb install -r "C:\dev\Uplink\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
```

To cleanly uninstall the old package first (clearing launcher cache):

```powershell
adb uninstall com.mobile
adb install "C:\dev\Uplink\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## 12. Backend Development (Planned Architecture)

### Core Principles & Architectural Boundaries

*The backend has not yet been implemented. This section documents the authoritative architectural requirements defined in `docs/PROJECT.md` and `docs/REQUIREMENTS.md`.*

1. **Modular Monolith First:** The core backend must be built as a single deployable Spring Boot modular monolith. Do not prematurely split the backend into microservices.
2. **Spring Boot as the Sole API Provider:** All mobile client interactions must flow through Spring Boot REST controllers (`/api/v1/*`).
3. **Strict Data Boundary:** The mobile application **must never directly access Supabase database tables** using client SDKs or service-role keys. Database access is strictly encapsulated behind Spring Data JPA repositories.
4. **Isolated AI & Heavy Compute:** Advanced AI workloads, OCR resume parsing, and document extraction are planned as specialized auxiliary FastAPI/Python services (Milestone 4). They will communicate with Spring Boot via internal service APIs.

### Planned Spring Boot Modules

```text
uplink-backend/
├── src/main/java/com/uplink/
│   ├── auth/            # Registration, login, JWT issuance, password reset
│   ├── user/            # User account persistence & role management (STUDENT, RECRUITER, ADMIN)
│   ├── profile/         # Student academic records, skills, projects, certifications
│   ├── opportunity/     # 10 Opportunity categories, publishing, search & filtering
│   ├── application/     # Internal application lifecycle (Applied -> Review -> Offered)
│   ├── qa/              # Question & Answer taxonomy, same-doubt signals, moderation
│   ├── mentor/          # Mentor directory listings & booking request workflow
│   ├── notification/    # System event notifications
│   └── common/          # Error handling, API response wrappers, security filters
```

---

## 13. API & Database Specifications

Detailed specifications for backend developers are maintained in the following project documents:

- **[docs/PROJECT.md](file:///C:/dev/Uplink/docs/PROJECT.md):** Overall system design, terminology, and core architectural rules.
- **[docs/REQUIREMENTS.md](file:///C:/dev/Uplink/docs/REQUIREMENTS.md):** Functional & non-functional requirements, data ownership, and security constraints.
- **[docs/FEATURES.md](file:///C:/dev/Uplink/docs/FEATURES.md):** Granular feature matrix mapped to project milestones.
- **[docs/NAVIGATION.md](file:///C:/dev/Uplink/docs/NAVIGATION.md):** Mobile routing patterns and screen parameters.
- **Planned Backend Documents:** When backend development begins in Milestone 1 Core Backend, developers must create and maintain:
  - `docs/BACKEND_ARCHITECTURE.md` (Spring Boot package structure & service boundaries)
  - `docs/API_SPECIFICATION.md` (OpenAPI/Swagger endpoint schemas)
  - `docs/DATABASE_SCHEMA.md` (PostgreSQL table structures, constraints, and Flyway migration scripts)

---

## 14. Comprehensive Troubleshooting Matrix

| # | Symptom / Error | Root Cause | Diagnostic Command | Verified Solution |
| :- | :--- | :--- | :--- | :--- |
| **1** | `No apps connected` in Metro console | Device cannot reach the Metro packager over TCP. | `adb devices`<br>`adb reverse --list` | Run `adb reverse tcp:8082 tcp:8082` (or your active port). If using emulator, ensure Metro is running. |
| **2** | `No devices/emulators found` | ADB daemon is not detecting any active emulator or USB connection. | `adb devices` | Re-plug USB cable, restart emulator, or run `adb kill-server` followed by `adb start-server`. |
| **3** | Device shows `unauthorized` in `adb devices` | Phone has not accepted the computer's RSA debugging key. | `adb devices` | Unlock phone screen and tap **Allow** on the "Allow USB debugging?" prompt. |
| **4** | Device shows `offline` | USB connection drop or ADB transport state desync. | `adb devices` | Unplug and reconnect USB cable. Run `adb kill-server; adb start-server`. |
| **5** | Metro error: `EADDRINUSE: address already in use :::8081` | Another instance of Metro or a local server is occupying port 8081. | `netstat -ano \| findstr 8081` | Launch Metro on an alternate port: `npm start -- --port 8082` and reverse port 8082 with `adb reverse tcp:8082 tcp:8082`. |
| **6** | App stuck on *"Loading from localhost..."* | App is attempting to load JS from the wrong host/port. | `adb reverse --list` | Verify ADB reverse forwarding matches your Metro port. In the app Developer Menu, go to **Settings → Debug server host & port for device** and set `localhost:8082`. |
| **7** | HTTP 500 from `/index.bundle` | Syntax error, missing dependency, or invalid import during Babel compilation. | Inspect Metro terminal output for the red stack trace. | Fix the highlighted JavaScript/TypeScript syntax error. If module resolution fails, run `npm install --legacy-peer-deps`. |
| **8** | Metro watcher initialization failure (`watchman` error) | Watchman is missing, crashing, or hitting Windows file permission blocks. | Inspect `mobile/metro.config.js` | Ensure `useWatchman: false` is set in `mobile/metro.config.js` resolver options (already configured in UPLINK). |
| **9** | Fast Refresh not updating on physical phone | Port forwarding dropped or device lost connection. | `adb reverse --list` | Re-run `adb reverse tcp:8082 tcp:8082`. Shake device, open Developer Menu, and verify **Enable Fast Refresh** is checked. |
| **10** | Gradle build fails: `SDK location not found` | Android SDK path is missing in Android build environment. | `Test-Path mobile\android\local.properties` | Create `mobile/android/local.properties` with: `sdk.dir=C\:\\Users\\<USER>\\AppData\\Local\\Android\\Sdk`. |
| **11** | Gradle build fails: `[Reanimated] react-native-worklets library not found` | Reanimated 4 requires explicit worklets package dependency. | Check `mobile/package.json` | Ensure `react-native-worklets` is in `dependencies` and `plugins: ['react-native-worklets/plugin']` is in `babel.config.js` (already configured). |
| **12** | Blank white screen on app launch | Missing initial screen route or unhandled exception in `BootstrapScreen`. | `adb logcat -s ReactNativeJS` | Verify that route names match `MainTabParamList`. Ensure `Home` is the initial route and all navigation redirects use `{ screen: 'Home' }`. |
| **13** | App displays label "mobile" on phone launcher | Android resource label in `strings.xml` was set to template default. | Check `android/app/src/main/res/values/strings.xml` | Ensure `<string name="app_name">UPLINK</string>`. Uninstall the old app (`adb uninstall com.mobile`) to clear the launcher cache, then reinstall. |
| **14** | Jest test failure: `SyntaxError: Unexpected token 'export'` | A node_modules package uses ESM that Jest didn't transform. | Check `mobile/jest.config.js` | Add the package to `transformIgnorePatterns` or mock it in `jest.setup.js` (Lucide is mocked in `jest.setup.js`). |

---

## 15. Recommended Daily Development Workflow

Follow this standard procedure for daily feature development:

```powershell
# Step 1: Open terminal and navigate to mobile
cd C:\dev\Uplink\mobile

# Step 2: Ensure your device or emulator is connected
adb devices

# Step 3: Forward the development port (e.g., 8082)
adb reverse tcp:8082 tcp:8082

# Step 4: Start the Metro bundler in Terminal 1
npm start -- --port 8082

# Step 5: (Only needed if native code changed) Launch or rebuild app in Terminal 2
npm run android -- --port 8082

# Step 6: Make edits in mobile/src/
# Fast Refresh will automatically update the UI on your phone.

# Step 7: Before committing code, verify type safety and tests:
npx tsc --noEmit
npm run lint
npm test -- --watchAll=false
```

---

## 16. Documentation Index

The `docs/` folder contains the authoritative design and architecture contracts:

| Document | Description |
| :--- | :--- |
| **[PROJECT.md](file:///C:/dev/Uplink/docs/PROJECT.md)** | Master system design, terminology, product boundaries, and core guidelines. |
| **[REQUIREMENTS.md](file:///C:/dev/Uplink/docs/REQUIREMENTS.md)** | Detailed functional requirements, security constraints, and data ownership rules. |
| **[FEATURES.md](file:///C:/dev/Uplink/docs/FEATURES.md)** | Complete feature matrix organized by development milestone. |
| **[DESIGN_SYSTEM.md](file:///C:/dev/Uplink/docs/DESIGN_SYSTEM.md)** | Color tokens, typography scales, spacing rules, and visual guidelines. |
| **[SCREENS.md](file:///C:/dev/Uplink/docs/SCREENS.md)** | UI layout and interaction specifications for all 18 mobile screens. |
| **[NAVIGATION.md](file:///C:/dev/Uplink/docs/NAVIGATION.md)** | Navigation hierarchy, header specifications, and route parameters. |
| **[COMPONENTS.md](file:///C:/dev/Uplink/docs/COMPONENTS.md)** | Component catalogue and props interfaces for shared UI elements. |
| **[ROADMAP.md](file:///C:/dev/Uplink/docs/ROADMAP.md)** | Milestone schedule from Foundation to Production Hardening. |
| **[TASKS.md](file:///C:/dev/Uplink/docs/TASKS.md)** | Verified implementation checklist and backlog tracker. |

---

## 17. Roadmap & Contribution Guidelines

### Milestone Roadmap

- **Milestone 0: Foundation (Complete):** Architecture approval, design tokens, repository layout.
- **Milestone 1: Student Mobile MVP (Current Focus):**
  - Mobile client shell, 18 screens, 4 bottom tabs, navigation, stores, mock services: **Complete & Verified**.
  - Core Backend: Spring Boot skeleton, PostgreSQL migrations, auth, and REST APIs: **Next Priority**.
- **Milestone 2: Recruiter & Admin (Planned):** Recruiter company profiles, opportunity management, candidate discovery, and admin web verification queue.
- **Milestone 3: Skills & Recommendation Engine (Planned):** Rule-based skill matching, assessment benchmarks, and explainable recommendations.
- **Milestone 4: Documents & Processing (Planned):** Storage integration, automated resume generation, OCR document verification.
- **Milestone 5: Hardening & Campus Rollout (Planned):** Security audits, performance benchmarking, rate limiting, and user acceptance testing.

### Contribution Guidelines

1. **Adhere to the Source of Truth:** Never create features or modify navigation structures that conflict with `docs/PROJECT.md` or `docs/NAVIGATION.md`.
2. **Strict TypeScript:** Maintain strict typing without using `any`. Define data models in `src/types/models.ts`.
3. **No Secret Leaks:** Never commit API secrets, private keys, database passwords, or JWT secrets to version control.
4. **Preserve Navigation Discipline:** The student application must always have **exactly four bottom tabs** (Home, Jobs, Q&A, Mentors). Profile must remain in the top-right header action.
5. **Verified Verification:** Always ensure `npx tsc --noEmit`, `npm run lint`, and `npm test` pass before proposing code changes.

---

## 18. Public Landing Page (Web Portal)

The `landing/` directory hosts the official, public-facing marketing and presentation website for UPLINK. It is built as an independent, modern web application that presents the platform's value proposition, demonstrates verified student mobile capabilities, and provides a direct gateway to download the standalone Android release APK.

### Architecture & Technology

- **Independent Subproject:** Located in `landing/` with its own decoupled dependencies, build tools, and deployment configuration. Does not alter or interfere with the `mobile/` React Native workspace.
- **Tech Stack:** Next.js 15.1.7 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4, Lucide Icons, GSAP 3.12 (ScrollTrigger), and Lenis smooth momentum scrolling.
- **Visual Design Discipline:** Editorial + immersive hybrid inspired by Linear, Stripe, and Apple design standards with high-contrast accessibility (WCAG AA), zero layout shift (CLS: 0), and reduced-motion support.
- **Dynamic Edge Social Cards:** Built-in dynamic 1200x630 Open Graph preview image generator at `landing/src/app/opengraph-image.tsx`.
- **Full Documentation:** See **[landing/README.md](file:///C:/dev/Uplink/landing/README.md)** for in-depth architectural details, SEO configurations, and deployment strategies.

### Quick Start for Landing Development

```powershell
# Navigate to the landing project
cd C:\dev\Uplink\landing

# Install independent dependencies
npm install

# Start local Next.js development server
npm run dev

# Run linting check
npm run lint

# Compile production build
npm run build
```

The web application runs at `http://localhost:3000`.

### Android APK Distribution Setup

The landing page features an integrated APK download action in the header, hero section, and final call-to-action banner:
- Set `NEXT_PUBLIC_ANDROID_DOWNLOAD_URL` in `landing/.env.local` to point directly to your hosted release APK (e.g., GitHub Releases or Cloud Object Storage).
- When left blank, the UI automatically transitions to an informative *"Android Release Coming Soon"* fallback state without broken links.

