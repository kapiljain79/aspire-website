<?php
/**
 * Aspire IT Systems - Mail + Chat config TEMPLATE
 * -----------------------------------------------
 * Copy this file to `mail-config.php` (same folder) on the server
 * and fill in your real credentials. The live file is read by
 * submit-contact.php and chat-proxy.php.
 *
 * `mail-config.php` should NEVER be committed to git or uploaded to
 * a public bucket. It's protected from direct HTTP access by .htaccess.
 */

return [
    // ---- Where lead emails get delivered ----
    'recipient_email' => 'info@aspireitsystems.io',

    // ---- The mailbox the website sends AS (real user in your M365 tenant) ----
    'from_email'      => 'info@aspireitsystems.io',
    'from_name'       => 'Aspire IT Website',

    // ============================================================
    // PRIMARY EMAIL PATH - Microsoft Graph (OAuth2 client credentials)
    // ============================================================
    // Azure portal → App registrations → New registration → Mail.Send
    // application permission → admin consent → client secret.
    'graph' => [
        'tenant_id'     => 'PASTE_TENANT_ID_HERE',
        'client_id'     => 'PASTE_CLIENT_ID_HERE',
        'client_secret' => 'PASTE_CLIENT_SECRET_HERE',
        'timeout'       => 20,
        'debug'         => false,
    ],

    // ============================================================
    // CHAT WIDGET - Groq (PRIMARY, no billing required)
    // ============================================================
    // Free API key: https://console.groq.com/keys
    // Free tier: 30 req/min, generous tokens, no card required.
    'groq' => [
        'api_key' => 'PASTE_GROQ_API_KEY_HERE',
        'model'   => 'llama-3.3-70b-versatile',
    ],

    // ============================================================
    // CHAT FALLBACK - Google Gemini (only used if Groq fails)
    // ============================================================
    // Free API key: https://aistudio.google.com/app/apikey
    // NOTE: Gemini free tier now requires billing on most accounts.
    'gemini' => [
        'api_key' => 'PASTE_GEMINI_API_KEY_HERE',
        'model'   => 'gemini-2.0-flash',
    ],

    // ============================================================
    // OPTIONAL FALLBACK - SMTP via M365 (legacy, only if Graph fails)
    // ============================================================
    'smtp' => [
        'host'     => 'smtp.office365.com',
        'port'     => 587,
        'username' => 'info@aspireitsystems.io',
        'password' => 'PASTE_APP_PASSWORD_HERE',
        'timeout'  => 15,
        'debug'    => false,
    ],
];
