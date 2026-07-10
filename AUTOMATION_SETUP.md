# AB Kreative Permanent Automation Setup

## What This Automation Does

- Runs on Vercel Cron at 05:00 UTC daily.
- Finds existing verified leads that have not been pitched.
- Sends the correct category pitch from the matching sender email.
- Marks the lead as `SENT` in the database after successful send.
- Marks the lead as `FAILED` with an error message if SMTP fails.

It does not generate new AI leads automatically. This avoids wasting free AI quota.

## Required Vercel Environment Variables

Core:

```env
AUTOMATION_SEND_PITCHES=enabled
AUTOMATION_DAILY_PITCH_LIMIT=5
AUTOMATION_SECRET=choose-a-long-secret
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Global SMTP fallback:

```env
SMTP_HOST=mail.abkreative.com
SMTP_PORT=465
SMTP_USER=design@abkreative.com
SMTP_PASS=mailbox-password
SMTP_FROM_EMAIL=design@abkreative.com
SMTP_FROM_NAME=Arshad
```

Category-specific SMTP examples:

```env
DESIGN_SMTP_HOST=mail.abkreative.com
DESIGN_SMTP_PORT=465
DESIGN_SMTP_USER=design@abkreative.com
DESIGN_SMTP_PASS=mailbox-password
DESIGN_FROM_EMAIL=design@abkreative.com
DESIGN_FROM_NAME=Arshad

FITOUT_SMTP_HOST=mail.abkreative.com
FITOUT_SMTP_PORT=465
FITOUT_SMTP_USER=fitout@abkreative.com
FITOUT_SMTP_PASS=mailbox-password
FITOUT_FROM_EMAIL=fitout@abkreative.com
FITOUT_FROM_NAME=AB Kreative Design & Fitout
```

Available prefixes:

- `DESIGN_`
- `FITOUT_`
- `APPROVALS_`
- `UAE_APPROVALS_`
- `FINANCE_`
- `LOGISTICS_`

## Setup Steps

1. Add the environment variables in Vercel.
2. Open `/api/setup-db` once after deployment to add pitch tracking columns.
3. Check `/api/email-config-health` and confirm the needed routes are configured.
4. Keep `AUTOMATION_DAILY_PITCH_LIMIT` low at first, such as `5`.
5. Watch sent/failed counts from `/api/automations/send-pitches?secret=YOUR_SECRET`.

## Manual Test

```bash
curl "https://ab-kreative.vercel.app/api/automations/send-pitches?secret=YOUR_SECRET&limit=1"
```

Expected result:

```json
{
  "success": true,
  "enabled": true,
  "processed": 1,
  "sent": 1,
  "failed": 0
}
```
