<?php
/**
 * Aspire IT Systems - Contact form handler
 * ------------------------------------------------
 * Flow per submission (in order):
 *   1. Validate + sanitize
 *   2. Honeypot / spam check
 *   3. ALWAYS append to leads/leads.jsonl (guaranteed capture)
 *   4. Send via Microsoft Graph API (OAuth2 - primary path)
 *   5. If Graph fails, fall back to SMTP via M365 (legacy)
 *   6. If SMTP fails, fall back to PHP mail()
 *   7. Either way, return ok:true so the user sees success - the
 *      lead is already saved in step 3.
 *
 * Why Graph?  Modern M365 tenants no longer support App Passwords
 * needed for SMTP AUTH. OAuth2 via Graph works regardless of tenant
 * MFA / Authentication methods policy and is what Microsoft is
 * actively investing in. Mail originates from authenticated M365
 * infrastructure, passing SPF/DKIM/DMARC.
 *
 * Config lives in `mail-config.php` (copy from mail-config.example.php).
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/Mailer.php';
require_once __DIR__ . '/lib/GraphMailer.php';

// ===== LOAD CONFIG =====
$configFile = __DIR__ . '/mail-config.php';
$config = file_exists($configFile) ? require $configFile : null;
if (!is_array($config)) {
    // Don't crash hard - we can still log the lead even with no mail config.
    $config = [
        'recipient_email' => 'info@aspireitsystems.io',
        'from_email'      => 'info@aspireitsystems.io',
        'from_name'       => 'Aspire IT Website',
        'smtp'            => null,
    ];
}

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// ----- Same-origin / CORS guard -----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://www.aspireitsystems.io',
    'https://aspireitsystems.io',
    'http://localhost',
    'http://127.0.0.1',
];
foreach ($allowedOrigins as $o) {
    if ($origin === $o || strpos($origin, $o) === 0) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        break;
    }
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ----- Read body (JSON or form-urlencoded) -----
$raw  = file_get_contents('php://input') ?: '';
$data = [];
if ($raw !== '') {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) $data = $decoded;
}
if (!$data) $data = $_POST;

// ----- Honeypot -----
if (!empty($data['website'])) {
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}

// ----- Sanitize -----
function aspire_clean($v, int $max = 500): string {
    $v = is_string($v) ? $v : '';
    $v = trim($v);
    $v = str_replace(["\r", "\n", "\0"], ' ', $v);
    $v = strip_tags($v);
    if (function_exists('mb_substr')) {
        if (mb_strlen($v) > $max) $v = mb_substr($v, 0, $max);
    } else {
        if (strlen($v) > $max)    $v = substr($v, 0, $max);
    }
    return $v;
}
function aspire_clean_multiline($v, int $max = 4000): string {
    $v = is_string($v) ? $v : '';
    $v = trim($v);
    $v = str_replace("\0", '', $v);
    $v = preg_replace("/\r\n?/", "\n", $v) ?? $v;
    $v = strip_tags($v);
    if (function_exists('mb_substr')) {
        if (mb_strlen($v) > $max) $v = mb_substr($v, 0, $max);
    } else {
        if (strlen($v) > $max)    $v = substr($v, 0, $max);
    }
    return $v;
}

$first   = aspire_clean($data['first']   ?? '', 80);
$last    = aspire_clean($data['last']    ?? '', 80);
$company = aspire_clean($data['company'] ?? '', 160);
$email   = aspire_clean($data['email']   ?? '', 160);
$phone   = aspire_clean($data['phone']   ?? '', 60);
$topic   = aspire_clean($data['topic']   ?? '', 120);
$message = aspire_clean_multiline($data['message'] ?? '', 4000);

// ----- Validate -----
$errors = [];
if ($first === '')                              $errors['first']   = 'First name is required';
if ($last === '')                               $errors['last']    = 'Last name is required';
if ($company === '')                            $errors['company'] = 'Company is required';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email']   = 'Valid email is required';
if ($topic === '')                              $errors['topic']   = 'Topic is required';
if ($message === '')                            $errors['message'] = 'Message is required';

if ($errors) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// ----- Always write to backup log first -----
$logDir  = __DIR__ . '/leads';
$logFile = $logDir . '/leads.jsonl';
if (!is_dir($logDir)) @mkdir($logDir, 0755, true);

$logEntry = [
    'ts'         => date('c'),
    'first'      => $first,
    'last'       => $last,
    'company'    => $company,
    'email'      => $email,
    'phone'      => $phone,
    'topic'      => $topic,
    'message'    => $message,
    'ip'         => $_SERVER['REMOTE_ADDR']     ?? null,
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
    'referer'    => $_SERVER['HTTP_REFERER']    ?? null,
];
@file_put_contents(
    $logFile,
    json_encode($logEntry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n",
    FILE_APPEND | LOCK_EX
);

// ----- Build the email -----
$recipient = $config['recipient_email'];
$fromEmail = $config['from_email'];
$fromName  = $config['from_name'] ?? 'Aspire IT Website';

$subject = '[Website Enquiry] ' . $first . ' ' . $last . ' - ' . $company;

$body  = "New enquiry from aspireitsystems.io\n";
$body .= str_repeat('=', 56) . "\n\n";
$body .= "Name:    {$first} {$last}\n";
$body .= "Company: {$company}\n";
$body .= "Email:   {$email}\n";
$body .= "Phone:   " . ($phone !== '' ? $phone : '(not provided)') . "\n";
$body .= "Topic:   {$topic}\n\n";
$body .= "Message\n";
$body .= str_repeat('-', 56) . "\n";
$body .= $message . "\n";
$body .= str_repeat('-', 56) . "\n\n";
$body .= "Submitted: " . date('Y-m-d H:i:s') . " UTC\n";
$body .= "IP:        " . ($_SERVER['REMOTE_ADDR']     ?? '?') . "\n";
$body .= "Referer:   " . ($_SERVER['HTTP_REFERER']    ?? '?') . "\n";
$body .= "UA:        " . ($_SERVER['HTTP_USER_AGENT'] ?? '?') . "\n";

$replyName = preg_replace('/[^A-Za-z0-9 .\'\\-]/', '', $first . ' ' . $last) ?: 'Website lead';

$mailOk    = false;
$mailError = null;
$transport = null;

// ----- Try Microsoft Graph first (primary path) -----
$graphCfg = $config['graph'] ?? null;
$graphDebug = $graphCfg['debug'] ?? false;
if (
    is_array($graphCfg)
    && !empty($graphCfg['tenant_id'])
    && !empty($graphCfg['client_id'])
    && !empty($graphCfg['client_secret'])
    && $graphCfg['client_secret'] !== 'PASTE_CLIENT_SECRET_HERE'
    && $graphCfg['tenant_id']     !== 'PASTE_TENANT_ID_HERE'
    && $graphCfg['client_id']     !== 'PASTE_CLIENT_ID_HERE'
) {
    try {
        $graphMailer = new AspireGraphMailer($graphCfg);
        $graphMailer->send([
            'from_email' => $fromEmail,
            'from_name'  => $fromName,
            'to'         => $recipient,
            'reply_to'   => $email,
            'reply_name' => $replyName,
            'subject'    => $subject,
            'body'       => $body,
        ]);
        $mailOk    = true;
        $transport = 'graph';

        if ($graphDebug) {
            @file_put_contents(
                $logDir . '/graph.log',
                "[" . date('c') . "] OK\n" . implode("\n", $graphMailer->log()) . "\n\n",
                FILE_APPEND | LOCK_EX
            );
        }
    } catch (Throwable $e) {
        $mailError = 'graph: ' . $e->getMessage();
        @file_put_contents(
            $logDir . '/graph.log',
            "[" . date('c') . "] ERROR: " . $e->getMessage() . "\n"
            . (isset($graphMailer) ? implode("\n", $graphMailer->log()) . "\n" : '')
            . "\n",
            FILE_APPEND | LOCK_EX
        );
    }
}

// ----- If Graph failed or not configured, try SMTP via M365 -----
$smtpOk    = $mailOk;
$smtpDebug = $config['smtp']['debug'] ?? false;

if (!$mailOk && !empty($config['smtp']) && !empty($config['smtp']['password']) && $config['smtp']['password'] !== 'PASTE_APP_PASSWORD_HERE') {
    try {
        $mailer = new AspireMailer($config['smtp']);
        $mailer->send([
            'from_email' => $fromEmail,
            'from_name'  => $fromName,
            'to'         => $recipient,
            'reply_to'   => $email,
            'reply_name' => $replyName,
            'subject'    => $subject,
            'body'       => $body,
        ]);
        $mailOk    = true;
        $transport = 'smtp';

        if ($smtpDebug) {
            @file_put_contents(
                $logDir . '/smtp.log',
                "[" . date('c') . "] OK\n" . implode("\n", $mailer->log()) . "\n\n",
                FILE_APPEND | LOCK_EX
            );
        }
    } catch (Throwable $e) {
        $mailError = ($mailError ? $mailError . ' | ' : '') . 'smtp: ' . $e->getMessage();
        @file_put_contents(
            $logDir . '/smtp.log',
            "[" . date('c') . "] ERROR: " . $e->getMessage() . "\n"
            . (isset($mailer) ? implode("\n", $mailer->log()) . "\n" : '')
            . "\n",
            FILE_APPEND | LOCK_EX
        );
    }
}

// ----- Final fallback: PHP mail() (likely spam-flagged but better than nothing) -----
if (!$mailOk) {
    $headers = implode("\r\n", [
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'Reply-To: ' . $replyName . ' <' . $email . '>',
        'X-Mailer: PHP/' . phpversion(),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $sent = @mail($recipient, $subject, $body, $headers, '-f' . $fromEmail);
    if ($sent) {
        $mailOk    = true;
        $transport = 'mail';
    } else {
        $mailError = ($mailError ? $mailError . ' | ' : '') . 'mail(): unknown error';
    }
}

// ----- Respond -----
if ($mailOk) {
    http_response_code(200);
    echo json_encode([
        'ok'        => true,
        'transport' => $transport,
    ]);
} else {
    // Email failed everywhere, but the lead IS captured in leads.jsonl
    http_response_code(202);
    echo json_encode([
        'ok'    => true,
        'note'  => 'logged_pending_email',
        // 'error' => $mailError,  // uncomment temporarily if debugging
    ]);
}
