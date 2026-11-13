# Admin recovery activation checklist

This feature is ready in the `feature/secure-admin-recovery-2026` branch and is intentionally **not enabled in production** before the following steps are complete.

1. In the **existing** Supabase project connected to the website, run `supabase/admin-auth.sql` in SQL Editor. RLS is enabled and service-role access only is used.
2. In Vercel's **Production** environment variables set:
   - `ADMIN_RECOVERY_EMAIL` to the authorized and verified recovery address.
   - `SITE_URL` to the production **HTTPS origin**, e.g. `https://example.com` (no path).
   - `SESSION_SECRET` to a randomly generated 32+ character string, unrelated to passwords.
   - `RESEND_API_KEY` to a Resend API key.
   - `RESET_FROM_EMAIL` to a sender address on the domain verified in Resend.
   - Confirm `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` exist.
3. Verify sender DNS records with Resend. Never commit API keys or environment values to GitHub.
4. Deploy a **Preview**, run the admin login flow, browser autofill, username reminder, 20-minute reset link, expired link rejection, password update, and editor permissions.
5. Merge the PR and redeploy production after all checks pass. Older unsigned `admin_session` cookies will be rejected, so admins will need to sign in again.

**Design notes:** The user-provided recovery email is only used for the configured primary admin account. Existing Vercel credentials still work until the first successful recovery, after which that username's stored Supabase hash takes precedence. Old sessions issued before a reset remain valid until their 24-hour expiry; rotate SESSION_SECRET to invalidate them immediately if necessary. If mail/DB configuration is missing the recovery API returns a clear 503 rather than pretending a message was sent.

**Security:** Do not enable this flow with weak default passwords. Never expose a service-role key to client-side code. The DB and Resend setup requires the project owner's explicit access.
