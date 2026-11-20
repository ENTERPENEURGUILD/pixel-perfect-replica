# Make Litemile Studio SaaS-ready

## Product outcome

Turn the working image studio into an honest, launchable SaaS that a new owner can configure and operate. Keep the existing signed-in image generation, private library, and account-level credit balances. Do not label payment processing, additional image providers, or public API access as live until implemented and verified.

## Work

1. **SaaS foundation and owner handover**
   - Audit sign-up, profile, credit, storage, and account-isolation behavior; repair gaps that block a real customer journey.
   - Add owner-facing setup/status guidance for payment providers, image providers, and required launch configuration without exposing credentials.
   - Document the real capabilities, deployment/setup steps, operational dependencies, and remaining launch blockers.

2. **Customer billing**
   - Implement the confirmed billing choice. Use prepaid credit packs as the temporary default until the owner chooses prepaid credits, subscriptions, or both.
   - For the selected Razorpay/Stripe option(s), build server-created checkout, signed webhook verification, idempotent credit fulfillment, and clear failure/refund handling.
   - Keep development pricing visibly non-purchasable until the merchant's test credentials and webhook flow are verified. Never treat a browser redirect as proof of payment.

3. **Provider connections and image generation**
   - Add secure, account-isolated connection management for the agreed image providers and buyer payment providers; credentials stay server-side and are never returned after save.
   - Keep Gemini-through-Lovable as the fallback and add only provider adapters with server-side validation, safe destination rules, and usage/credit safeguards.
   - Keep the Litemile owner's credit-checkout credentials separate from each customer's own provider connections.

4. **SaaS operations and verification**
   - Provide accurate API availability and connection/billing statuses; do not show mock endpoints or pretend integrations are active.
   - Add tests for account isolation, secret non-disclosure, provider allowlists, and payment idempotency/credit amounts.
   - Verify signed-in customer flows, a provider test flow, and checkout/webhook behavior when test credentials are available. State clearly what still requires owner credentials or launch configuration.

## Technical details

- Preserve TanStack Start and Lovable Cloud patterns. Use authenticated server functions for account-owned operations and public API routes only for callbacks with verified signatures.
- Use migrations with explicit grants and row-level security. Store owner IDs from the authenticated session, never client-supplied identity.
- Store credentials only in server-managed secrets or encrypted server-only storage. Do not commit credentials, log them, or return them to the browser.
- Keep account-level tenancy as the initial boundary; shared workspaces/teams are not assumed.

## Working assumption

The existing product is credit-based. Prepaid credits are the working billing choice until the owner answers whether to offer prepaid credits, monthly plans, or both. Live payments and live provider accounts cannot be verified without the new owner's test credentials and configuration.