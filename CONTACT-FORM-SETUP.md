# Contact form backend - Hostinger + Microsoft 365

The contact form on `contact.html` now actually submits. Each enquiry is:

1. **Always** appended to `leads/leads.jsonl` (the guaranteed safety net),
2. **Sent via Microsoft 365 SMTP** so it passes SPF/DKIM/DMARC and lands
   in the inbox - not spam,
3. As a last resort, falls back to PHP `mail()` if SMTP is misconfigured.

## Why we send via M365 (not PHP `mail()`)

The DNS records for `aspireitsystems.io` tell the world that Microsoft 365
is the authorized mail sender for the domain (via SPF + DKIM). When PHP
`mail()` sends from Hostinger's IP, the `From:` says `@aspireitsystems.io`
but the originating IP isn't in your SPF - so receivers correctly flag it
as spoofed and route it to spam.

The only durable fix is to **send via M365 itself.** That's what
`submit-contact.php` + `lib/Mailer.php` do.

---

## Files

| File | Purpose |
|------|---------|
| `submit-contact.php` | Form endpoint. Validates, logs, sends mail. |
| `lib/Mailer.php` | Minimal SMTP STARTTLS client (no dependencies). |
| `lib/.htaccess` | Blocks HTTP access to library files. |
| `mail-config.example.php` | Template - copy to `mail-config.php` and fill in. |
| `.htaccess` (root) | Blocks HTTP access to `mail-config*.php`. |
| `leads/.htaccess` | Blocks HTTP access to the lead log + SMTP log. |
| `leads/index.html` | Anti-listing stub. |
| `contact.html` | Form now POSTs to backend; includes honeypot. |

---

## One-time setup in Microsoft 365 (10 minutes)

You need a **dedicated mailbox** that the website will authenticate as.
Don't reuse `info@aspireitsystems.io` - keep a separate identity for
machine-sent mail.

### 1. Create a service mailbox

In **M365 Admin Center → Users → Active users → Add user**:

- Username: `website@aspireitsystems.io` (or `noreply@`, `forms@` - your call)
- Assign any plan that includes Exchange Online (a Business Basic license is enough).
- Set a strong password.

### 2. Enable Authenticated SMTP for that mailbox

Microsoft disabled SMTP AUTH by default in 2022. You need to turn it on
for **this one mailbox** only:

- **Admin Center → Users → Active users → [website@aspireitsystems.io] → Mail tab → Manage email apps**
- Tick **Authenticated SMTP** → Save.

Alternatively (PowerShell, admin):
```powershell
Set-CASMailbox -Identity website@aspireitsystems.io -SmtpClientAuthenticationDisabled $false
```

### 3. Get an App Password for that mailbox

If MFA is on (it should be), regular passwords won't work for SMTP - you
need an App Password.

- Sign in as `website@aspireitsystems.io` at
  https://account.microsoft.com/security
- **Additional security options → App passwords → Create**
- Copy the 16-character password.

If **App Passwords don't appear** in that menu, your tenant has them
disabled. Either enable them (Microsoft Entra Admin Center → Protection →
Authentication methods), or skip MFA on this mailbox only (least
preferred), or move to Microsoft Graph API + OAuth2 (more involved - ping
me if you want this path).

### 4. Verify the domain's DNS records

In Hostinger DNS Zone Editor (or wherever you manage DNS for
`aspireitsystems.io`), confirm:

- **SPF (TXT @)**
  ```
  v=spf1 include:spf.protection.outlook.com -all
  ```
- **DKIM** - must be **enabled in M365**:
  Admin → Setup → Domains → `aspireitsystems.io` → Email Authentication →
  DKIM → Enable for the domain. M365 will give you two CNAME records like:
  ```
  selector1._domainkey   CNAME   selector1-aspireitsystems-io._domainkey.<tenant>.onmicrosoft.com
  selector2._domainkey   CNAME   selector2-aspireitsystems-io._domainkey.<tenant>.onmicrosoft.com
  ```
  Add these to DNS, then click Enable.
- **DMARC (TXT _dmarc)** - start safe:
  ```
  v=DMARC1; p=none; rua=mailto:info@aspireitsystems.io
  ```
  Move to `p=quarantine` later once you're confident.

These records are what tell receivers like Outlook and Gmail that mail
from `aspireitsystems.io` via M365 is legitimately yours. Without DKIM
in particular, mail still risks the spam folder.

---

## Deploying to Hostinger

1. **Upload the whole `dist/` folder to `public_html/`** (File Manager or
   SFTP).
2. **Rename `mail-config.example.php` → `mail-config.php`** on the server
   and fill in the App Password from step 3 above.
3. Confirm the `leads/` directory is writable by PHP (`0755`).
4. Visit `https://www.aspireitsystems.io/contact.html` and send a test
   message. You should see the success banner, get an email at
   `info@aspireitsystems.io`, and find a new line in
   `leads/leads.jsonl`.

The response JSON will say `"transport":"smtp"` when SMTP worked, or
`"transport":"mail"` if it fell back. If `"note":"logged_pending_email"`
appears, both transports failed - the lead is still safely in the JSONL
log, and `leads/smtp.log` (set `debug=true` in config) will show why.

---

## Quick smoke test from the terminal

```bash
curl -X POST https://www.aspireitsystems.io/submit-contact.php \
  -H 'Content-Type: application/json' \
  -d '{
    "first":"Test","last":"User","company":"Sanity check",
    "email":"yourname@gmail.com","phone":"",
    "topic":"Other / Not sure",
    "message":"Ignore - testing the endpoint."
  }'
```

- Expect: `{"ok":true,"transport":"smtp"}`
- Expect: an email at `info@aspireitsystems.io` (in the **inbox**, not Junk)
- Expect: a new line in `leads/leads.jsonl`

---

## Troubleshooting

**SMTP error: `535 5.7.139 Authentication unsuccessful`**
→ App password wrong, or SMTP AUTH disabled for this mailbox.
Re-check steps 2 + 3 above.

**SMTP error: `550 5.7.60 SMTP; Client does not have permissions to send as this sender`**
→ The `from_email` in `mail-config.php` must match the mailbox you're
authenticating as. Set both to `website@aspireitsystems.io`.

**SMTP connect timeout**
→ Hostinger sometimes blocks outbound port 587 on the cheapest shared
plans. Verify with: `curl -v telnet://smtp.office365.com:587`
from SSH. If blocked, contact Hostinger support to unblock, or switch
to a Business plan, or use Microsoft Graph API (which uses HTTPS 443).

**Mail arrives but lands in spam**
→ DKIM not enabled yet in M365. Complete step 4 of the M365 setup.

**Form returns `{"ok":true,"note":"logged_pending_email"}`**
→ Both SMTP and `mail()` failed. The lead IS in `leads/leads.jsonl`.
Check `leads/smtp.log` (set `'debug' => true` in `mail-config.php`)
for the SMTP transcript.

---

## Downloading the lead backup

```
File Manager → public_html/leads/leads.jsonl → Download
```

Each line is a JSON object with all submission fields plus timestamp,
IP, user-agent, referer. Pipe straight into Excel, `jq`, or a CRM.

---

## Future: switch to MySQL instead of JSONL

A 10-line drop-in replacement is documented at the bottom of the
previous version of this file - happy to write it out again when you
want to graduate from the flat file. JSONL is genuinely fine for the
first few hundred leads.
