# ITTOVA — Latest TODOs & Missing Items

This document tracks all currently pending configurations, platform modules, and frontend/backend features identified across `.env`, `notes.txt`, project specification documents, and codebase reviews.

---

## 1. Environment & Credentials (`.env`)

- [ ] **MSG91 SMS Integration (`MSG91_AUTH_KEY` & `MSG91_TEMPLATE_ID`)**
  - **Status:** Empty / Unconfigured.
  - **Action Required:** Acquire an MSG91 account, complete DLT registration in India, obtain an approved SMS Flow template ID (with one `OTP` variable), and populate `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID`.
  - **Current Fallback:** `OTP_DEV_MODE=true` logs the OTP code directly to the server console.

- [ ] **Verified Sender Email Domain (`OTP_EMAIL_FROM`)**
  - **Status:** Currently using Resend testing sender (`ITOVA <onboarding@resend.dev>`).
  - **Action Required:** Verify custom domain DNS records in Resend (e.g., `ITOVA <otp@yourdomain.com>`) so OTP emails can be delivered to real customers and vendors (Resend test address only delivers to the account owner's email).

- [ ] **Production Environment Flag (`NODE_ENV`)**
  - **Status:** Defaults to development.
  - **Action Required:** Set `NODE_ENV=production` in the production deployment environment (which automatically enforces strict security and disables dev bypasses).

---

## 2. Platform Modules & Workspaces (from `notes.txt` & Spec Docs)

| # | Module / Requirement | Current Status | Scope & Missing Deliverables |
|---|----------------------|----------------|------------------------------|
| 1 | **Customer Work Platform** | Basic portal present | Real drawing/CAD file uploads, interactive Process Sheet, live chat board, and daily status update tracking. |
| 2 | **Vendor Work Platform** | Basic portal present | Work platform chat board, drawing/process sheet viewer, inward material tracking, manufacturing progress timeline, QC logs, and daily status alarms. |
| 3 | **Banks / NBFCs Portal** | [Spec doc exists](file:///d:/Projects/ITTOVA/bank_nbfc_registration_details.docx) | Registration and financing platform for vendors seeking invoice discounting / working capital. |
| 4 | **Raw Material Trader / Manufacturer** | [Spec doc exists](file:///d:/Projects/ITTOVA/raw_material_trader_manufacturer_registration_details.docx) | Dedicated registration, material catalog, quotation, and dispatch platform for raw material suppliers. |
| 5 | **Process Verification Team App** | Not started | WFH / remote evaluation app to review vendor process sheets and capabilities after AI filtration. |
| 6 | **Logistics Team App** | Not started | Operational app covering 3 transit legs: Vendor → ITTOVA store, ITTOVA store → Customer, and Material Trader → Vendor. |
| 7 | **IGI Team App (Inward & Outward)** | Not started | Incoming Goods Inspection workflow, digital inward/outward gate passes, and QC defect inspection reports. |
| 8 | **Stores Team App** | Not started | Warehouse inventory intake, storage rack allocation, and dispatch management following QC sign-off. |

---

## 3. Frontend & Data Layer Gaps (from `frontend-review.md`)

- [ ] **Real File Uploads (CAD / 2D Drawings)**
  - Replace static/demo drawing sets with real multipart upload handlers, file validation, storage integration (e.g. S3 / Cloudflare R2 / local disk), and actual preview generation.

- [ ] **Document Attachment Handlers**
  - Update customer/vendor onboarding document cards to accept real file attachments (GST, PAN, MSME, ISO, Bank passbooks) instead of toggling sample filenames.

- [ ] **Real-time Chat & Collaboration**
  - Implement a real-time messaging layer (WebSockets or Server-Sent Events) for the Customer-Vendor-Admin work platform chat boards.

- [ ] **Onboarding & KYC Validation**
  - Complete step-level validation, bank account verification (penny drop/IFSC lookup), and explicit consent controls.

- [ ] **Dedicated Destination Routes for Partners**
  - Wire up partner cards and links (Financing & Raw Material) to dedicated intake and management workflows.
