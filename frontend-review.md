# Frontend review

Scope: frontend source and browser UI only. No server or database changes.

## Corrected
- Replaced the demo account picker with sign-in forms using existing client authentication actions.
- Added the missing admin route and role-specific workspace redirects; removed hardcoded admin credentials.
- Wait for session restoration before rendering sign-in or intake.
- Customer and supplier registration now await success before closing. Machine forms stay open on failure.
- Quote selections are isolated per project.
- Supplier workspace no longer silently selects the first unrelated vendor.
- CAD dialog displays project details and an explicit unavailable-preview message instead of fabricated geometry and DFM results; native dialog supplies keyboard trapping and Escape dismissal.
- Mobile navigation remains available; added focus indicators, reduced-motion rules and bounded toast/modal layouts.
- Toast announcements and intake field error associations improve screen-reader access.
- Removed fabricated contact defaults from customer submission.
- Renamed the misleading database-reset button to reflect its refresh behavior.

## Remaining gaps
- Customer drawing intake still submits a fixed demo drawing set. Real file selection, validation, preview and upload progress are unfinished.
- Customer document cards toggle sample filenames rather than attach files.
- Customer onboarding needs complete step validation, bank-account confirmation and explicit unchecked consent defaults.
- Several workflow actions still need pending/disabled states and field-level numeric validation.
- Finance/material partner links need dedicated destination flows or clear availability messaging.
- Authenticated portal layouts, modal interaction and responsive breakpoints require further browser verification with appropriate fixture data.

## Verification
- Production build passed with Vite.
- Browser checked empty intake: errors display and focus moves to the first invalid field.
- Browser checked intake continuation and customer portal sign-in rendering.
- No live login, financial or workflow submissions were performed.
