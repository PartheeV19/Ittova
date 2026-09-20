# ITOVA Website Logic Fixes

Date: 2026-09-20

## Overview
This document records the logic and flow corrections made to the website without changing the UI design or visual styling.

## Changes Made

### 1. Corrected role-based portal routing
- Updated the app-level route logic so users are directed to the correct portal based on the selected user journey.
- Prevented generic fallback behavior that sent users to the wrong page after starting the flow.

Files affected:
- src/App.jsx
- src/context/AppContext.jsx
- src/pages/Home/Home.jsx

### 2. Fixed visitor onboarding redirect behavior
- Visitor profiles now route to the matching portal flow instead of always falling back to the home view.
- Role-based mapping was added so buyer and vendor journeys are handled appropriately.

Files affected:
- src/context/AppContext.jsx

### 3. Fixed home page CTA behavior
- The main CTA buttons now open the correct portal route instead of sending users through a generic login flow.
- This preserves the expected user journey while keeping the visual layout the same.

Files affected:
- src/pages/Home/Home.jsx

### 4. Fixed login flow consistency
- Login screen tabs now remain aligned to the current route.
- Switching tabs updates the route and keeps the flow coherent.
- When the current view is a vendor route, the vendor tab opens automatically.

Files affected:
- src/pages/Login/LoginScreen.jsx

### 5. Strengthened intake validation
- Added a missing role validation check to the starting gate form.
- Ensured the form still uses the same design while validating required business details more reliably.

Files affected:
- src/pages/StartingGate/StartingGate.jsx

## Verification
The application was built successfully after the changes using:

npm run build

Result:
- Vite production build succeeded
- Build completed successfully with no blocking errors

## Notes
- No design changes were made.
- UI and styling remain as originally implemented.
- The scope of change was limited to logical flow and route correctness.
