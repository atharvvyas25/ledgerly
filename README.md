# 🦊 Ledgerly — Premium Personal Finance & Group Trips Tracker

**Ledgerly** is a premium, fully responsive, feature-rich single-page application (SPA) designed to simplify personal budget tracking and automate shared trip group expenses. Styled with harmonious dark and light themes, subtle micro-animations, and dynamic HSL color systems, Ledgerly provides a native-app-like experience directly in the web browser.

---

## 🚀 Key Features

### 1. 📊 Personal Daily Finance Dashboard
* **Dynamic Budgeting**: Real-time updates of Total Income, Total Expenses, and net Balance.
* **Period-Based Filters**: Switch instantly between **Today**, **7 Days**, **Month**, and **Year** time frames.
* **Interactive Timelines**: Add, edit, and delete transactions with instant synchronization across categories and history views.

### 2. ✈️ Adventures & Group Trips Directory
* **Trip Setup**: Configure adventure names, destinations, trip dates, custom travel style types (Friends, Family, Couple, Solo), and dynamic buddy backdrops.
* **Travel Buddy Management**: Add buddies with dynamic backdrop colors and cute emoji presets (🦁, 🐯, 🐨, etc.) via comfortable bottom sheets.
* **Unified Timeline**: Chronological log of group spend nodes showing category badges and details drawers.

### 3. ⚖️ Greedy Splitwise Settlements Engine
* **Automated Matcher**: Leverages a Splitwise-style greedy matching algorithm to balance group dues instantly.
* **Personal vs. Shared Logic**: Correctly handles personal solo trip expenditures (marks them on timeline metrics but ignores them for shared debt settlement loops).
* **Failsafe Calculations**: Solid defensive calculations prevent `NaN` values and protect data integrity when members are modified or deleted.

### 4. ⚡ Dynamic Onboarding & Demo Mode Seeding
* **Onboarding auth guards**: Seamlessly transitions between signup page, restore session prompts, and the main home tab dashboard.
* **One-Click Seeding**: Click **Demo Mode 🚀** on onboarding to immediately seed beautiful mock trips, members, and transactions.

### 5. 📱 Premium Mobile Viewport Layout Optimizations
* **Notch & Status Bar Safe Area Insets**: Fully integrates CSS `env(safe-area-inset-top)` to push view headers below phone notches and browser status bars cleanly.
* **Bottom Sheet Modals Support**: Transformed modal dialog structures to `position: fixed` viewport frames with bottom safe-area pushes (`env(safe-area-inset-bottom)`) so form buttons are never covered by browser navigation controls.
* **Squeeze-Resistant Styling**: Uses dynamic padding reductions (`16px`), smaller date cell gaps, and scaled numeric dashboard typography to remain extremely readable on narrow phone screens (e.g. 360px width displays).

---

## 🛠️ Technology Stack
1. **HTML5**: Structured semantic nodes, fully accessible bottom sheet dialogue containers.
2. **Vanilla CSS3**: Curated dark/light variables, glassmorphism filters, viewport-flexible grids, transitions, and native layout support.
3. **Vanilla Javascript**: Optimized, event-driven reactive state system with localStorage pipeline caching.

---

## 🏁 Getting Started
Ledgerly is built as a highly responsive single-page web app. You do not need complex installation routines or package builders to run it.

1. Clone this repository locally:
   ```bash
   git clone https://github.com/atharvvyas25/ledgerly.git
   ```
2. Simply open `index.html` in any modern web browser to run Ledgerly instantly:
   ```bash
   # Windows
   start index.html

   # macOS / Linux
   open index.html
   ```
3. Tap **Demo Mode 🚀** on the welcome screen to populate Ledgerly instantly with rich, interactive mockup data!

---

## 💅 Clean UI, No Cap.
Ledgerly features a beautiful dark mode default stylesheet, HSL-tailored accents, responsive layout adjustments, and smooth interactive click transitions. Built with attention to every pixel. 🚀
