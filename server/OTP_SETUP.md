# OTP setup: Resend email and MSG91 SMS

The welcome form requests one server-generated six-digit code for both destinations. ITOVA checks the code itself; providers only deliver it. A shared code proves access to at least one destination, not independent ownership of both.

## Resend first

1. In https://resend.com/domains add a domain you own, preferably a transactional subdomain. Add the DNS records Resend gives you and wait for verification. Keep click/open tracking off for authentication emails.
2. Create a sending API key scoped to that domain at https://resend.com/api-keys.
3. In the ignored root `.env`, set `RESEND_API_KEY` and `OTP_EMAIL_FROM`, for example `ITOVA <otp@your-verified-domain.com>`. Do not use an unverified example address. Never put credentials in a `VITE_` variable or paste them into chat.
4. Configure `DATABASE_URL` for your PostgreSQL database. Run `npm run db:migrate`, then `npm run server:dev`.
5. Email-only requests are supported by the existing portal sign-in screen. Choose registration for a new customer/vendor, request a code with an email address, and verify it. The initial details form intentionally waits for BOTH providers to be configured, preserving its promise of sending the same code to email and phone.

## MSG91 for SMS

Recommended for this India-focused application. Create an MSG91 account, complete its India DLT onboarding, and map an approved sender and SMS content template in the SMS dashboard. Use the SMS Flow API, not a separate provider-generated OTP, so the exact email code is reused.

Set these server-side values in `.env`:

- `MSG91_AUTH_KEY`: MSG91 API auth key.
- `MSG91_TEMPLATE_ID`: SMS template ID shown in MSG91, not the DLT template ID.
- `MSG91_OTP_VARIABLE`: exact variable name defined in that template, default `OTP`.

Use a template with one OTP variable. Example content to submit for approval: "Your ITOVA verification code is ##OTP##. It expires in 10 minutes. Do not share this code." Actual text must match your approved template. Enter phone numbers in international format, e.g. `+919876543210`.

## Verification and operational behavior

- `OTP_HASH_SECRET` must contain at least 32 characters of cryptographically random secret material. The local setup generated a secret without printing it. Keep it stable across API workers; changing it invalidates outstanding codes.
- Migration `003_otp_delivery.sql` adds destination and delivery-acceptance metadata. Older locally logged codes cannot be used after this change.
- Codes expire after 10 minutes, allow five attempts and are consumed atomically. Resends invalidate earlier codes.
- Database-backed limits allow one request per minute and five per hour per destination. A per-process IP limit allows ten requests per 15 minutes. For multiple instances, configure a shared edge IP limit and trusted proxy settings for your deployment.
- Requests have a 15-second provider timeout. Partial failure revokes the challenge even if one message arrives. Request a new code after the cooldown.
- A successful API response means providers accepted the messages, not that delivery is confirmed. Delivery receipts/webhooks are not implemented.
- The API never logs or returns OTPs. Tests mock provider requests and do not send live messages.
- Apply normal data-retention housekeeping to expired OTP rows, retaining at least the last hour for rate limits.

## Checks

`node --test server/src/auth/otp-input.test.js server/src/auth/otp-delivery.test.js`

`npm run build`

Live delivery and PostgreSQL transaction behavior still require configured credentials/database and an end-to-end verification run.

Official references:
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/domains/introduction
- https://docs.msg91.com/sms/send-sms
- https://msg91.com/help/template/how-to-create-flow-id-to-send-sms-via-api
