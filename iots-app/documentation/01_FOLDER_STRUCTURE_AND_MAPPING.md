# CIRIL IOTS — Folder Structure & Component Mapping

> **Target Directory:** `iots-app/frontend/iots-app/`  
> **Audience:** Frontend Developers, System Architects, Layman Stakeholders  
> **Status:** Current Production Architecture

---

## 1. Complete Directory Tree

The complete project structure under `iots-app/frontend/iots-app/` is organized with clean separation of concerns:

```
iots-app/frontend/iots-app/
├── .gitignore                                 # Git version control exclusions
├── .oxlintrc.json                             # Oxlint rule configuration
├── index.html                                 # Single-page application root shell & token config
├── package.json                               # Dependencies, scripts, and package metadata
├── package-lock.json                          # Pinned dependency lockfile
├── vite.config.js                             # Vite bundler build options & plugins
├── public/                                    # Static assets served as-is at webroot
│   ├── favicon.svg                            # Default browser tab icon
│   ├── icons.svg                              # SVG sprite sheet
│   └── img/
│       └── logo.png                           # Fallback CIRIL logo for direct root-path requests
└── src/                                       # Core application source code
    ├── main.jsx                               # Application bootstrap entry point
    ├── App.jsx                                # Main orchestrator component & hardware state manager
    ├── App.css                                # Optional component styles
    ├── index.css                              # Global CSS (vignette, film-grain, shader keyframes)
    ├── assets/                                # Static media assets managed by Vite bundler
    │   ├── hero.png                           # Graphic asset
    │   ├── logo.png                           # Primary bundled CIRIL logo (hashed for caching)
    │   ├── react.svg                          # React framework logo
    │   └── vite.svg                           # Vite build tool logo
    ├── utils/                                 # Pure helper functions & stateless logic
    │   ├── cookieUtils.js                     # 30-day Lax cookie & LocalStorage permission sync
    │   └── geoUtils.js                        # BigDataCloud reverse geocoder & distance cache
    └── components/                            # Modular, reusable React UI components
        ├── Icons.jsx                          # 14 standalone lightweight SVG vector icons
        ├── SimplexNoiseBackground.jsx         # WebGL GLSL shader canvas with smooth dark mode fade
        ├── MinimalTypingTitle.jsx             # Dual-phase animated typing heading (zero layout shift)
        ├── UnlockingLock.jsx                  # Interactive padlock with springy shackle hover physics
        ├── AnimatedButton.jsx                 # Primary action button with expanding hover badge
        ├── ThemeToggle.jsx                    # Floating dark/light theme switch
        ├── TestingDock.jsx                    # QA simulation toolbar & live GPS telemetry dock
        ├── LoginFormSection.jsx               # Glassmorphic card, input fields & 4-step progress
        └── modals/                            # Floating isolated dialog windows
            ├── EmptyCredsModal.jsx            # Warning when username or password is blank
            ├── HelpModal.jsx                  # Access recovery IT helpdesk guidance
            └── PermissionDeniedModal.jsx      # Step-by-step browser location unlocking guide
```

---

## 2. Directory & File Breakdown (Layman vs. Technical)

### Root Files

#### `index.html`
- **Layman's View:** The outer picture frame of the website. It loads the CIRIL branding colors, nice fonts, and sets up the canvas before any code starts running.
- **Technical View:** The HTML5 entry point. Ingests Google Fonts (`Inter` and `JetBrains Mono`) via `<link>` tags, executes the Tailwind CSS CDN engine, and extends the Tailwind theme with the exact CIRIL corporate design tokens defined in `color.txt` (e.g., `#202830` dark slate, `#C09860` gold, `#F8F8F8` smoke). It mounts `<div id="root"></div>` and points to `/src/main.jsx`.

#### `vite.config.js`
- **Layman's View:** The recipe book that tells the computer how to quickly package up the website so it opens in milliseconds.
- **Technical View:** Configures Vite 8 with `@vitejs/plugin-react`. Manages ES module resolution, hot-module replacement (HMR), base paths, and production build minification.

#### `.oxlintrc.json`
- **Layman's View:** An automated proofreader that spots mistakes, typos, and bad code habits before anyone notices them.
- **Technical View:** Linter configuration for Oxlint (the ultra-fast Rust-based linter). Configured for React 19, JSX rules, and ES modules, ensuring zero unused variables and preventing unintentional cascading re-renders in `useEffect` hooks.

---

### `src/utils/` — Pure Logic Layer

#### `src/utils/cookieUtils.js`
- **Layman's View:** A secure digital memory box. If you grant location permission once, it remembers your choice for 30 days so you don't get asked again every single time you switch tabs or open a new browser window.
- **Technical View:** Implements dual-layer persistent storage. Writes a cookie with `SameSite=Lax`, path `/`, and a 30-day `expires` header (`ciril_loc_perm`). In parallel, it synchronizes with browser `localStorage`. This redundancy guarantees that tab switching, private window restrictions, and browser restarts maintain seamless state synchronization.

#### `src/utils/geoUtils.js`
- **Layman's View:** A smart GPS translator. It takes complex satellite numbers (like `17.448291° N, 78.374829° E`) and turns them into a human-readable neighborhood name like `HITEC City, Hyderabad`. It is smart enough not to repeat questions if you haven't moved.
- **Technical View:** Interfaces with the BigDataCloud Client Reverse Geocoding API (`https://api.bigdatacloud.net/data/reverse-geocode-client`). Contains a Euclidean coordinate distance cache using `lastGeocodeRef`. If the employee moves less than `0.0005` degrees (~55 meters), it reuses the cached locality string to prevent network rate-limiting.

---

### `src/components/` — UI Component Layer

#### `Icons.jsx`
- **Layman's View:** A collection of clean, crisp icons (locks, shields, eye icons, satellite crosshairs) that never get blurry on retina screens.
- **Technical View:** Contains 14 standalone SVG React functional components (`EyeIcon`, `EyeOffIcon`, `ShieldIcon`, `LockIcon`, `AlertCircleIcon`, `CheckCircleIcon`, `MapPinIcon`, `CrosshairIcon`, `TerminalIcon`, `MoonIcon`, `SunIcon`, `PermissionIcon`, `ShieldCheckIcon`, `OctagonXIcon`). Replaces heavy icon packages like Lucide or FontAwesome, saving over 120kB of bundle weight.

#### `SimplexNoiseBackground.jsx`
- **Layman's View:** An ambient, moving background texture that flows like liquid silk. It gives the login screen a modern, high-tech feel without making your laptop fan spin.
- **Technical View:** A raw WebGL 1.0 canvas executing GLSL vertex and fragment shaders. Uses domain-warped fractional Brownian motion (fBm) simplex noise computed directly on the user's GPU. Interpolates smoothly between light `#F8F8F8` and dark `#202830` using an exponential dampening factor (`0.08`), pausing or cleaning up buffers on unmount to prevent GPU memory leaks.

#### `MinimalTypingTitle.jsx`
- **Layman's View:** A typewriter that types out "Internal Operations Tracking System" letter-by-letter, then elegantly hides its blinking cursor once done.
- **Technical View:** A layout-stable React component. Reserves vertical space using `min-h-[1.2em]` to completely eliminate Cumulative Layout Shift (CLS). Uses a dual-stage `setTimeout` queue to type Line 1, transfer the blinking cursor to Line 2, finish typing, and fade the cursor out after 500ms.

#### `UnlockingLock.jsx` & `AnimatedButton.jsx`
- **Layman's View:** A playful lock icon that unlocks itself when your mouse hovers over the Login button, and a button whose gold arrow badge zooms forward when clicked.
- **Technical View:** Micro-interaction component with CSS transform origin `[transform-origin:16px_11px]` and cubic bezier spring curve `cubic-bezier(0.34, 1.56, 0.64, 1)`. The button contains an in-bounds overflow-hidden badge that expands from scale 0 to 1.6 on hover with active depression feedback.

#### `ThemeToggle.jsx`
- **Layman's View:** A small button at the top right of the screen that toggles between Day Mode (clean smoke white) and Night Mode (deep executive slate).
- **Technical View:** Floating button with backdrop blur (`backdrop-blur-md`). Toggles the `isDarkMode` boolean in the parent `App.jsx`, which applies or removes the `.dark` class on the root container, triggering CSS custom property cascades across the application.

#### `TestingDock.jsx`
- **Layman's View:** A secret control panel for testers and managers. With one click, you can test how the app looks when login succeeds, when passwords fail, or when someone logs in from outside the office.
- **Technical View:** QA simulation widget. Exposes three scenario states (`success`, `failed`, `mismatch`) and a toggle for `locationPermissionState`. Renders live GPS accuracy readings and coordinates, allowing developers to test without needing to drive outside the office radius.

#### `LoginFormSection.jsx`
- **Layman's View:** The central glass card where employees enter their username and password. Once submitted, it transforms into an informative 4-step progress checklist.
- **Technical View:** Composed form component. Handles password visibility toggle, client validation triggers, error banners, audit rejection dismissals, and renders the 4-phase authentication pipeline (`Verifying Your Account` → `Confirming Your Access` → `Geofence Analysis / Option B Mismatch` → `Preparing Your Workspace`).

#### `src/components/modals/` (Modal Ecosystem)
1. **`EmptyCredsModal.jsx`:** Triggered when the employee clicks "Login" without typing their username or password. Directs keyboard focus back into the missing field upon closing.
2. **`HelpModal.jsx`:** Explains that password resets are handled strictly through the IT Service Desk or Department Administrator for corporate security.
3. **`PermissionDeniedModal.jsx`:** If the employee previously blocked location in their browser, this modal pops up with step-by-step instructions on clicking the browser address bar padlock icon to toggle Location to "Allow".

---

### `src/App.jsx` — The Central Orchestrator

- **Layman's View:** The conductor of the orchestra. It brings together the background graphics, the login box, the GPS satellites, and the security rules so everything moves in perfect harmony.
- **Technical View:** Root state container. Manages:
  - Form credentials (`empId`, `password`, `showPassword`)
  - Modal open/close flags (`helpModalOpen`, `emptyCredsModalOpen`, `permissionDeniedModalOpen`)
  - Geolocation tracking loop (`startPreciseTracking`, `watchPosition`, `clearWatch`)
  - Telemetry state (`lat`, `lon`, `accuracy`, `altitude`, `locality`)
  - Authentication phases (`idle`, `processing`, `error`, `success`)
  - Plug-in connection points (`[PLUG-IN INDICATION 1-6]`) for future backend REST and SIEM endpoints.

---

## 3. Component Hierarchy & Data Flow (Mermaid Diagram)

The following diagram reveals the component tree and shows how properties and state callbacks flow downward from `App.jsx`:

```mermaid
graph TD
    App["App.jsx (Root Controller)"]
    
    %% Children of App
    App --> BG["SimplexNoiseBackground\nprops: isDarkMode"]
    App --> Theme["ThemeToggle\nprops: isDarkMode, setIsDarkMode"]
    App --> Title["MinimalTypingTitle"]
    App --> Form["LoginFormSection"]
    App --> Dock["TestingDock\nprops: activeScenario, geoDetails, etc."]
    
    %% Modals
    App --> MEmpty["EmptyCredsModal\nprops: isOpen, onClose"]
    App --> MHelp["HelpModal\nprops: isOpen, onClose"]
    App --> MPerm["PermissionDeniedModal\nprops: isOpen, onClose"]
    
    %% Children of LoginFormSection
    Form --> FormBtn["AnimatedButton"]
    FormBtn --> LockIcon["UnlockingLock"]
    Form --> Icons["Icons.jsx (Alert, Check, Shield, Crosshair)"]
    
    %% Utilities feeding into App
    CookieUtil["cookieUtils.js"] -.->|getStoredLocationPermission / setStoredLocationPermission| App
    GeoUtil["geoUtils.js"] -.->|reverseGeocode(lat, lon)| App
    
    %% Styles
    IndexCSS["index.css"] -.->|vignette-glow / film-grain| App
    HTMLTailwind["index.html"] -.->|brand colors & fonts| App

    classDef root fill:#202830,stroke:#C09860,stroke-width:2px,color:#F8F8F8;
    classDef comp fill:#F8F8F8,stroke:#4A4943,stroke-width:1px,color:#202830;
    classDef util fill:#C09860,stroke:#202830,stroke-width:1px,color:#202830;
    
    class App root;
    class BG,Theme,Title,Form,Dock,MEmpty,MHelp,MPerm,FormBtn,LockIcon,Icons comp;
    class CookieUtil,GeoUtil,IndexCSS,HTMLTailwind util;
```

---

## 4. Props & State Mapping Table

| Component | Key Props Received | Emitter / Source | Callback Handlers |
| :--- | :--- | :--- | :--- |
| **`SimplexNoiseBackground`** | `isDarkMode` (boolean) | `App.jsx` | Internal resize and RAF render loops |
| **`ThemeToggle`** | `isDarkMode`, `setIsDarkMode` | `App.jsx` | `onClick={() => setIsDarkMode(!isDarkMode)}` |
| **`LoginFormSection`** | `phase`, `processStep`, `empId`, `password`, `geoDetails`, `activeScenario`, `isMismatchPending`, `auditNotice` | `App.jsx` | `handleLogin`, `onOpenRecovery`, `onAcceptLocation`, `onAbortLogin`, `onDismissAuditNotice` |
| **`AnimatedButton`** | `type`, `children`, `onClick` | `LoginFormSection.jsx` | Native button click event |
| **`TestingDock`** | `activeScenario`, `geoDetails`, `locationPermissionState` | `App.jsx` | `setActiveScenario`, `setPhase`, `setProcessStep`, `setLocationPermissionState` |
| **`EmptyCredsModal`** | `isOpen`, `onClose` | `App.jsx` | Sets focus back to empty input field |
| **`HelpModal`** | `isOpen`, `onClose` | `App.jsx` | Closes dialog |
| **`PermissionDeniedModal`** | `isOpen`, `onClose` | `App.jsx` | Closes dialog, directs user to browser lock icon |

---

## 5. Design System Color Tokens

The application visual identity strictly adheres to the official CIRIL token definitions extracted from `color.txt`:

| Token Name | Hex Code | Visual Role | Applied In |
| :--- | :--- | :--- | :--- |
| `brand-dark` | `#202830` | Deep Slate (Primary background in dark mode, primary text in light mode) | Form headers, buttons, cards |
| `brand-black` | `#22272F` | Midnight Slate (Dark card backgrounds) | Glassmorphic form panels |
| `brand-darkslate`| `#4A4943` | Charcoal Slate (Subtle borders and muted text) | Input borders, timeline dividers |
| `brand-forestslate`| `#2D312B` | Hover tone for dark buttons | Button `:hover` state |
| `brand-gold` | `#C09860` | Warm Gold (Primary brand accent) | Badges, typing text, spinners, icons |
| `brand-goldHover`| `#ad844b` | Deepened Gold (Active accent states) | Button hover in dark mode |
| `brand-smoke` | `#F8F8F8` | Warm White (Primary light mode background) | Light mode cards and body background |
| `brand-silver` | `#CAC1AB` | Soft Warm Gray (Borders, secondary labels) | Subtitles, input placeholders |

---

## 6. Asset Loading & Bundling Strategy

To ensure zero asset failures whether running in development, production Docker containers, or sub-directory deployments:
1. **Bundled Asset (`src/assets/logo.png`):** Imported in `App.jsx` as `import logoImg from './assets/logo.png'`. Vite hashes this file on build (e.g. `dist/assets/logo-1iCslowA.png`), providing automatic cache invalidation and CDN optimization.
2. **Public Fallback (`public/img/logo.png`):** Stored in `public/` so that any direct reference to `/img/logo.png` (e.g., standard HTML `<link rel="icon">` or legacy static tags) resolves without a 404 error.
