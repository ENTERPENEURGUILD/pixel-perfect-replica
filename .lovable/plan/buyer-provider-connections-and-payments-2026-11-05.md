# Buyer Provider Connections and Payments

## Product outcome

Add a signed-in **Connections** area where each buyer can securely connect and manage their own image-generation accounts (OpenAI, Google Gemini, Replicate/FLUX, or a compatible custom endpoint) and merchant payment accounts (Razorpay, Stripe, PayPal). Connections are isolated per account; provider secrets are write-only and never shown again. Connected image providers can be selected for generation, with usage charged to the buyer's own provider account where supported.

Keep Litemile's own checkout separate: Litemile sells image credits to buyers using Razorpay and Stripe. Built-in Lovable checkout is not eligible for this India-based digital-credit product, so this requires a custom provider integration using Litemile's own credentials. Buyers' merchant accounts are for payments from their customers, not for paying Litemile.

## Work

1. **Foundation and account isolation**
   - Add a provider-connection data model scoped to the authenticated account, with encrypted credentials and non-secret provider/mode/status metadata.
   - Restrict credential storage to server-side access; add authenticated server operations for save/replace, test, status, and disconnect.
   - Build a Connections page in Settings with masked status, clear test/live states, and provider-specific fields. Never return stored secrets to the browser or logs.

2. **Image-provider connections**
   - Keep the existing Google generation path available and add account-owned OpenAI, Gemini, and Replicate/FLUX adapters behind server routes.
   - Add a constrained custom-provider option with HTTPS and destination restrictions; do not send credentials to arbitrary or unsafe URLs.
   - Validate credentials server-side, route generation through the signed-in account's selected connection, and keep generated image storage, ownership, and credit safeguards intact.
   - Show provider availability and connection errors in the existing model selection experience.

3. **Merchant payment connections for buyers**
   - Add buyer-owned Razorpay, Stripe, and PayPal connection settings with test/live modes and server-side validation.
   - Add tenant-owned customer checkout/order records and provider-specific checkout creation, signed webhook verification, idempotent fulfillment, and failure/refund handling. No payment is considered complete from a browser redirect alone.

4. **Litemile credit purchases**
   - Add Litemile-owned Razorpay and Stripe test/live checkout for the existing credit packages, verified webhooks, and atomic, idempotent credit fulfillment.
   - Keep Litemile's merchant credentials separate from buyer merchant connections. Request them securely only after the checkout/webhook paths exist; never put them in source files.

5. **Verification**
   - Add tests for account isolation, secret non-disclosure, provider/model allowlists, payment fulfillment idempotency, and credit amounts.
   - Run existing relevant tests and verify signed-in connection management, one image-provider test/generation flow, and payment webhook/checkout behavior with provider test credentials. Live-money processing remains unverified until the owner supplies and activates live credentials.

## Technical details

- Use authenticated TanStack server functions for account-scoped connection management and authenticated server routes for streaming generation; use public API routes only for provider webhooks, validating provider signatures before any write.
- Use Lovable Cloud migrations with explicit grants and row-level security. Encrypt credential values with a server-only managed key; only encrypted values and safe metadata are stored. Derive account ownership from the authenticated session, never a client-supplied owner ID.
- Keep provider clients and credentials server-side. Use fixed adapters for OpenAI, Gemini, Replicate, Razorpay, Stripe, and PayPal; custom endpoints require strict SSRF controls, timeouts, payload limits, and redirect restrictions.
- Use per-provider webhook verification and idempotency keys/event records; payment balances change only after verified provider events.
- Keep existing Gemini-through-Lovable generation intact as a fallback. The existing 10-credit welcome grant remains unchanged.

## Assumptions and boundaries

- “Buyer payment connection” means the buyer accepts payments from their own customers inside Litemile; Litemile credit purchases use Litemile-owned merchant accounts.
- Account-level tenancy is the initial boundary because the current app has individual accounts, not shared organizations. Shared teams and roles are not added in this scope.
- Provider test credentials and callback/webhook configuration are required for real end-to-end verification. No live credentials are assumed or fabricated.
