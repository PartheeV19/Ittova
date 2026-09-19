# Implementation Plan: Hexagon Diagram, Portal Streamlining & History Navigation

Address the four user requirements across the ITTOVA web application:
1. Replace the diamond diagram with a high-tech industrial **Hexagon** featuring **CUSTOMER**, **QUALITY**, **MATERIAL**, and **LOGISTICS** on the corners with ITOVA in the center.
2. Completely remove the **Admin login portal**, keeping only **Customer** and **Vendor** portals.
3. Resolve the **duplicate buttons** in Customer & Vendor registration and remove the **"Operating Network Active"** status pill from the Navbar.
4. Fix **Back button navigation** so the browser Back button and in-app Back buttons transition smoothly between previous pages instead of jumping out to the browser's "New Tab".

---

## User Review Required

> [!IMPORTANT]
> - **Hexagon Layout**: The diagram in the hero section will be built using an SVG/CSS geometric hexagon with tech pulse lines and 4 interactive corner nodes (**CUSTOMER**, **QUALITY**, **LOGISTICS**, **MATERIAL**) surrounding the central **ITOVA** hexagonal core.
> - **Admin Portal Removal**: The admin tab in `LoginScreen.jsx`, admin credentials, and the Operations Console card in the Home page portal section will be removed. Only Customer and Vendor portals will remain accessible.
> - **Registration Buttons**: In `LoginScreen.jsx`, we will provide a clean mode toggle (or unified flow) so there is strictly one action button per workflow, eliminating redundant buttons that perform the same action.
> - **Back Button Fix**: We will implement browser history synchronization (`pushState` / `popstate` with hash routes `#home`, `#login`, `#customer`, `#vendor`) and in-app back buttons so clicking Back navigates to the previous view rather than closing the app to the browser's New Tab.

---

## Proposed Changes

### 1. Hexagon Diagram (`Home.jsx` & `styles.css`)

#### [MODIFY] [Home.jsx](file:///d:/Projects/ITTOVA/src/pages/Home/Home.jsx)
- Replace the diamond container (`control-diamond-bg`, square `control-core`) with a responsive industrial hexagon schematic:
  - Central hexagonal badge for **ITOVA** with glowing perimeter.
  - Hexagonal geometry containing connecting signal lines to the 4 corner nodes: **CUSTOMER**, **QUALITY**, **MATERIAL**, and **LOGISTICS**.
  - Interactive click handlers and tooltips for each node.
- Update Section 5 ("Industrial Command Portals") to display the two primary portals: **Customer Portal** and **Vendor Portal** (removing the Operations Console admin card).
- Replace any lingering `handleLaunchAuth('admin')` calls with direct routes to Customer or Vendor.

#### [MODIFY] [styles.css](file:///d:/Projects/ITTOVA/src/styles.css)
- Implement `.control-hexagon-wrapper`, `.control-hex-core`, `.control-hex-polygon`, `.control-hex-node`, and animated signal beams.
- Ensure perfect responsive scaling on mobile and desktop screens.

---

### 2. Remove Admin Login Portal (`LoginScreen.jsx`, `Home.jsx`, `Navbar.jsx`)

#### [MODIFY] [LoginScreen.jsx](file:///d:/Projects/ITTOVA/src/pages/Login/LoginScreen.jsx)
- Remove `admin` from `ROLE_TABS`. Only `customer` and `vendor` tabs will be displayed.
- Remove admin credentials state (`adminUser`, `adminPass`, `staffId`, `adminMode`) and the admin form tab.
- Remove admin logic from `handleLogin`.

#### [MODIFY] [Navbar.jsx](file:///d:/Projects/ITTOVA/src/components/Navbar.jsx)
- Remove admin/staff references from navigation and badges.

---

### 3. Fix Duplicate Registration Buttons & Remove "Operating Network Active"

#### [MODIFY] [LoginScreen.jsx](file:///d:/Projects/ITTOVA/src/pages/Login/LoginScreen.jsx)
- Redesign the action layout for Customer and Vendor portals:
  - If existing accounts exist: Provide an account selector with a single "Enter Workspace" button, plus a distinct "Register New Customer / Facility" action.
  - If no accounts exist (or user chooses to register): Display a single clear primary button ("Start Customer Registration →" / "Start Facility Onboarding →") without duplicate redundant buttons that perform the same function.

#### [MODIFY] [Navbar.jsx](file:///d:/Projects/ITTOVA/src/components/Navbar.jsx)
- Remove the `<span className="status-indicator-pill">...Operating Network Active...</span>` element completely.

---

### 4. Browser History & Back Navigation (`AppContext.jsx`, `LoginScreen.jsx`, `CustomerPortal.jsx`, `SupplierPortal.jsx`)

#### [MODIFY] [AppContext.jsx](file:///d:/Projects/ITTOVA/src/context/AppContext.jsx)
- Add history integration using `window.history.pushState` and `window.history.replaceState` whenever `setCurrentView` is invoked.
- Add a `popstate` listener that reacts to the browser's Back/Forward buttons and restores the matching `currentView` (e.g. from `#home`, `#login`, `#customer`, `#vendor`) without kicking the user back to the "New Tab".
- Provide a `navigateBack()` method in context.

#### [MODIFY] [LoginScreen.jsx](file:///d:/Projects/ITTOVA/src/pages/Login/LoginScreen.jsx)
- Update the top navigation bar to have a clear Back button (`&larr; Back to Overview`) using the router/history.

#### [MODIFY] [CustomerPortal.jsx](file:///d:/Projects/ITTOVA/src/pages/Customer/CustomerPortal.jsx) & [SupplierPortal.jsx](file:///d:/Projects/ITTOVA/src/pages/Supplier/SupplierPortal.jsx)
- Add a dedicated top Back button so users can navigate back to Overview/Home at any point with a single click.

---

## Verification Plan

### Manual Verification
1. **Hexagon Diagram**:
   - Inspect the Home page hero section. Verify the hexagon shape renders cleanly with ITOVA at the center and CUSTOMER, QUALITY, MATERIAL, LOGISTICS on the corners.
   - Verify hover effects and click actions on all nodes.
2. **Admin Portal Removal**:
   - Navigate to the Portal Sign-In page (`#login`). Verify only **Customer Portal** and **Vendor Portal** tabs exist. Verify no admin login is accessible anywhere.
3. **Duplicate Buttons & Status Pill**:
   - Verify Navbar no longer displays "Operating Network Active".
   - In Login Screen, test Customer and Vendor tabs. Confirm there is only one clear action button to register a new customer/facility, eliminating the duplicate button issue.
4. **Back Button Navigation**:
   - From Home, navigate to Login, then to Customer Registration or Vendor Portal.
   - Click the browser's Back button: Verify the browser moves back to the previous view (e.g. from Login back to Home) instead of navigating out to the browser's "New Tab".
   - Test in-app Back buttons in Login and Portals to ensure instant return to the previous page.
