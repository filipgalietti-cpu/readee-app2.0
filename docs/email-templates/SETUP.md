# Auth email setup — make signup emails look like they're actually from Readee

Right now the confirmation email comes from `Supabase Auth
<noreply@mail.app.supabase.io>` and has a "powered by Supabase"
footer the dashboard cannot remove. Two pieces fix this:

1. **Configure custom SMTP** so emails come from `hello@readee.app`.
2. **Paste the Readee-branded HTML templates** so the body matches our brand.

Both are dashboard-only changes — no code deploys.

---

## Important — Google sign-in is unaffected

These emails ONLY fire for **password signup**. When a user clicks
"Continue with Google":

- Google has already verified the email address.
- Supabase auto-confirms the account on first sign-in.
- No email is sent.

So polishing this email path doesn't slow down or duplicate the
Google flow — it just makes the password path feel as polished
as the OAuth one.

---

## Step 1 — Custom SMTP via Resend

We already use Resend for the parent digest, so the API key exists.

### 1a. Verify `readee.app` in Resend (one-time)
1. Resend Dashboard → Domains → Add Domain.
2. Enter `readee.app`.
3. Resend gives you 3 DNS records to add at Porkbun:
   - **SPF** (TXT): `v=spf1 include:_spf.resend.com ~all`
   - **DKIM** (CNAME, 2 records): `resend._domainkey.readee.app` → values from Resend
   - Optional **MX** if you want Resend to receive bounces (not required).
4. Add them at Porkbun → DNS → Add Record. Wait 5-10 min for verification.
5. Confirm in Resend the domain shows ✓ Verified.

### 1b. Plug Resend into Supabase
1. Supabase Dashboard → Project Settings → Auth → SMTP Settings.
2. Enable Custom SMTP.
3. Fill in:
   - **Sender email**: `hello@readee.app`
   - **Sender name**: `Readee`
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL)
   - **Username**: `resend`
   - **Password**: your Resend API key (`re_...`)
4. Save. Send a test email from the Auth → Users → "Send recovery"
   button on a test account to confirm.

After this, the "powered by Supabase" footer is gone and the sender
shows as `Readee <hello@readee.app>`.

---

## Step 2 — Paste the branded HTML templates

In Supabase Dashboard → Auth → Email Templates, replace each
template's HTML source with the corresponding file in this folder:

| Template in Supabase | File to paste |
|---|---|
| Confirm signup | `confirm-signup.html` |
| Reset password | `reset-password.html` |

Optional ones we haven't written yet (use `confirm-signup.html` as
a starting point and tweak the headline/body — same shell):

- Magic link
- Invite user
- Change email address

### Subject lines (set in the same Supabase template editor)
- Confirm signup: `Welcome to Readee — confirm your email`
- Reset password: `Reset your Readee password`

### Variables Supabase substitutes
- `{{ .ConfirmationURL }}` — the magic confirm/reset link
- `{{ .Email }}` — the recipient's email
- `{{ .SiteURL }}` — usually readee.app
- `{{ .Token }}` and `{{ .TokenHash }}` — for OTP-style flows

---

## Verifying it works

Use an incognito browser:

1. Go to `learn.readee.app/signup`, fill in a fresh email + password.
2. Check the inbox — sender should be `Readee <hello@readee.app>`,
   not `noreply@mail.app.supabase.io`.
3. Email body should show the violet gradient header with the Readee
   logo, no "powered by Supabase" footer, the CTA button gradient.
4. Click the confirm button → land on `/dashboard` (or `/classroom`
   if `?as=teacher` was on the signup URL).

---

## DNS deliverability extras (do these once, never again)

For maximum inbox placement (avoids Promotions / Spam tab):

1. **DMARC** record at Porkbun:
   - Type: TXT
   - Host: `_dmarc.readee.app`
   - Value: `v=DMARC1; p=none; rua=mailto:hello@readee.app; pct=100; aspf=r; adkim=r;`
2. **BIMI** (shows the Readee logo next to emails in Gmail):
   - Requires the SVG-Tiny version of the logo hosted somewhere public.
   - Worth doing later — not blocking.

---

## After all this is done

The auth email path is one of the few remaining "this looks shitty"
surfaces left. Once both steps above are complete, the password
signup feels as polished as the rest of the product. Marketing /
brand teams notice this kind of detail in district pitches.
