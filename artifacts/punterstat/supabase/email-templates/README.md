# PunterStat — Supabase Email Templates

Branded HTML templates for all Supabase Auth emails.  
Each file uses Supabase's Go template variables (`{{ .ConfirmationURL }}` etc.)
and can be pasted directly into the Supabase dashboard.

## Step 1 — Configure Resend SMTP in Supabase

Route all Supabase auth emails through Resend so they come from `@punterstat.site`.

1. Go to **Supabase Dashboard → Project Settings → Auth → SMTP Settings**
2. Enable **Custom SMTP**
3. Fill in:

   | Field            | Value                              |
   |------------------|------------------------------------|
   | Sender name      | `PunterStat`                       |
   | Sender email     | `noreply@punterstat.site`          |
   | Host             | `smtp.resend.com`                  |
   | Port             | `465`                              |
   | Username         | `resend`                           |
   | Password         | *(your Resend API key)*            |

4. Click **Save**.

> **Domain verification:** `punterstat.site` must be a verified sender in your
> Resend account (Resend → Domains → Add domain → follow the DNS instructions).

---

## Step 2 — Paste the custom HTML templates

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. For each template listed below, click the tab, paste the HTML, and click **Save**.

| Template tab in Supabase  | File in this folder          |
|---------------------------|------------------------------|
| Confirm signup            | `confirm-signup.html`        |
| Reset password            | `reset-password.html`        |
| Magic link                | `magic-link.html`            |

All templates use `{{ .ConfirmationURL }}` — Supabase substitutes the real
one-time link before sending.

---

## Step 3 — Transactional emails (handled in app code)

These are sent via the Resend API directly from the Next.js app — no Supabase
dashboard config needed.

| Email            | Trigger                                   | Template function           |
|------------------|-------------------------------------------|-----------------------------|
| Welcome          | After `supabase.auth.signUp()` succeeds   | `welcomeEmail(displayName)` |
| Contact confirm  | After contact form submission             | inline in `contact/actions` |

Templates live in `lib/email/templates.ts`.  
Sending logic lives in `lib/email/resend.ts`.

---

## Environment variables required

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=PunterStat <noreply@punterstat.site>
```

Both are already in `.env.local.example`.
