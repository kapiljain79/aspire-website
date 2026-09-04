<?php
/**
 * Aspire IT Systems - Readiness Assessment lead handler
 * ------------------------------------------------------
 * Receives the lead capture payload from /assessment.html
 * (assessment.js -> POST submit-assessment.php) together with the
 * computed score breakdown and a few bits of context, then:
 *
 *   1. Validate + sanitize
 *   2. Honeypot / spam check
 *   3. ALWAYS append to leads/assessments.jsonl (guaranteed capture)
 *   4. Email to info@aspireitsystems.io via Microsoft Graph (primary)
 *      -> SMTP via M365 (fallback)
 *      -> PHP mail() (last resort)
 *   5. Send a short autoresponse to the lead's email confirming
 *      their report is ready in the browser
 *   6. Return ok:true even if mail fails - the lead is captured in
 *      step 3 so we never lose it.
 *
 * Mail pipeline + config is identical to submit-contact.php; see
 * mail-config.php for credentials.
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/Mailer.php';
require_once __DIR__ . '/lib/GraphMailer.php';

// ===== LOAD CONFIG =====
// Prefer a copy one level above the webroot: Hostinger's git auto-deploy
// only replaces public_html, so a config file living outside it survives
// every push instead of getting wiped and needing a manual re-upload.
$configFile = dirname(__DIR__) . '/mail-config.php';
if (!file_exists($configFile)) {
    $configFile = __DIR__ . '/mail-config.php';
}
$config = file_exists($configFile) ? require $configFile : null;
if (!is_array($config)) {
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
function asra_clean($v, int $max = 500): string {
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

$first    = asra_clean($data['first']    ?? '', 80);
$last     = asra_clean($data['last']     ?? '', 80);
$company  = asra_clean($data['company']  ?? '', 160);
$email    = asra_clean($data['email']    ?? '', 160);
$role     = asra_clean($data['role']     ?? '', 120);
$trackId  = asra_clean($data['track_id'] ?? '', 40);
$trackNm  = asra_clean($data['track']    ?? '', 120);

$overall  = isset($data['overall']) ? (int)$data['overall'] : -1;
$tier     = asra_clean($data['tier'] ?? '', 60);

// Dimensions: [{ key, label, score, max, pct }, ...]
$dims = [];
if (isset($data['dimensions']) && is_array($data['dimensions'])) {
    foreach ($data['dimensions'] as $d) {
        if (!is_array($d)) continue;
        $dims[] = [
            'key'   => asra_clean($d['key']   ?? '', 60),
            'label' => asra_clean($d['label'] ?? '', 120),
            'score' => isset($d['score']) ? (int)$d['score'] : 0,
            'max'   => isset($d['max'])   ? (int)$d['max']   : 0,
            'pct'   => isset($d['pct'])   ? (int)$d['pct']   : 0,
        ];
    }
}

// ----- Validate -----
$errors = [];
if ($first === '')                              $errors['first']   = 'First name is required';
if ($last === '')                               $errors['last']    = 'Last name is required';
if ($company === '')                            $errors['company'] = 'Company is required';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email']   = 'Valid email is required';
if ($overall < 0 || $overall > 100)             $errors['overall'] = 'Invalid score';

if ($errors) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// ----- Always write to backup log first -----
$logDir  = __DIR__ . '/leads';
$logFile = $logDir . '/assessments.jsonl';
if (!is_dir($logDir)) @mkdir($logDir, 0755, true);

$logEntry = [
    'ts'         => date('c'),
    'kind'       => 'assessment',
    'first'      => $first,
    'last'       => $last,
    'company'    => $company,
    'email'      => $email,
    'role'       => $role,
    'track_id'   => $trackId,
    'track'      => $trackNm,
    'overall'    => $overall,
    'tier'       => $tier,
    'dimensions' => $dims,
    'ip'         => $_SERVER['REMOTE_ADDR']     ?? null,
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
    'referer'    => $_SERVER['HTTP_REFERER']    ?? null,
];
@file_put_contents(
    $logFile,
    json_encode($logEntry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n",
    FILE_APPEND | LOCK_EX
);

// ----- Build the internal email (to info@) -----
$recipient = $config['recipient_email'] ?? 'info@aspireitsystems.io';
$fromEmail = $config['from_email']      ?? 'info@aspireitsystems.io';
$fromName  = $config['from_name']       ?? 'Aspire IT Website';

$trackLabel = $trackNm !== '' ? $trackNm : ($trackId !== '' ? $trackId : 'Readiness Assessment');

$subject = '[Assessment] ' . $first . ' ' . $last . ' - ' . $company
         . ' - ' . $trackLabel . ' (' . $overall . '/100)';

$body  = "New readiness assessment submission from aspireitsystems.io\n";
$body .= str_repeat('=', 64) . "\n\n";
$body .= "LEAD\n";
$body .= str_repeat('-', 64) . "\n";
$body .= "Name:     {$first} {$last}\n";
$body .= "Company:  {$company}\n";
$body .= "Role:     " . ($role !== '' ? $role : '(not provided)') . "\n";
$body .= "Email:    {$email}\n\n";
$body .= "ASSESSMENT\n";
$body .= str_repeat('-', 64) . "\n";
$body .= "Track:    {$trackLabel}\n";
$body .= "Overall:  {$overall}/100" . ($tier !== '' ? " ({$tier})" : '') . "\n";

if (!empty($dims)) {
    $body .= "\nBy dimension:\n";
    foreach ($dims as $d) {
        $label = $d['label'] !== '' ? $d['label'] : $d['key'];
        $body .= sprintf(
            "  - %-32s %d/%d  (%d%%)\n",
            $label,
            $d['score'],
            $d['max'],
            $d['pct']
        );
    }
}

$body .= "\n" . str_repeat('-', 64) . "\n";
$body .= "Submitted: " . date('Y-m-d H:i:s') . " UTC\n";
$body .= "IP:        " . ($_SERVER['REMOTE_ADDR']     ?? '?') . "\n";
$body .= "Referer:   " . ($_SERVER['HTTP_REFERER']    ?? '?') . "\n";
$body .= "UA:        " . ($_SERVER['HTTP_USER_AGENT'] ?? '?') . "\n";

$replyName = preg_replace('/[^A-Za-z0-9 .\'\\-]/', '', $first . ' ' . $last) ?: 'Assessment lead';

// ----- Build the autoresponse (to the lead) -----
$ackSubject = 'Your Aspire IT readiness report - ' . $trackLabel;
$ackBody    = "Hi {$first},\n\n";
$ackBody   .= "Thanks for completing our {$trackLabel} assessment. Your personalised report is ready in your browser, and a copy has been logged with our team.\n\n";
$ackBody   .= "Summary\n";
$ackBody   .= str_repeat('-', 40) . "\n";
$ackBody   .= "Overall score: {$overall}/100" . ($tier !== '' ? " ({$tier})" : '') . "\n";
if (!empty($dims)) {
    foreach ($dims as $d) {
        $label = $d['label'] !== '' ? $d['label'] : $d['key'];
        $ackBody .= sprintf("  - %-30s %d%%\n", $label, $d['pct']);
    }
}
$ackBody .= "\nIf you'd like to walk through the results with an engineer, just reply to this email or book a slot at https://www.aspireitsystems.io/contact.html\n\n";
$ackBody .= "Aspire IT Systems\n";
$ackBody .= "https://www.aspireitsystems.io\n";

// ----- Helper: send one message through Graph -> SMTP -> mail() -----
$graphCfg   = $config['graph'] ?? null;
$graphDebug = $graphCfg['debug'] ?? false;
$smtpCfg    = $config['smtp']  ?? null;
$smtpDebug  = $smtpCfg['debug'] ?? false;

$graphReady = is_array($graphCfg)
    && !empty($graphCfg['tenant_id'])
    && !empty($graphCfg['client_id'])
    && !empty($graphCfg['client_secret'])
    && $graphCfg['client_secret'] !== 'PASTE_CLIENT_SECRET_HERE'
    && $graphCfg['tenant_id']     !== 'PASTE_TENANT_ID_HERE'
    && $graphCfg['client_id']     !== 'PASTE_CLIENT_ID_HERE';

$smtpReady = is_array($smtpCfg)
    && !empty($smtpCfg['password'])
    && $smtpCfg['password'] !== 'PASTE_APP_PASSWORD_HERE';

/**
 * @param array $msg ['to','subject','body','reply_to','reply_name']
 * @return array{ok:bool, transport:?string, error:?string}
 */
$sendMessage = function (array $msg) use (
    $fromEmail, $fromName,
    $graphReady, $graphCfg, $graphDebug,
    $smtpReady,  $smtpCfg,  $smtpDebug,
    $logDir
): array {
    $err = null;

    // 1) Graph
    if ($graphReady) {
        try {
            $g = new AspireGraphMailer($graphCfg);
            $g->send(array_merge([
                'from_email' => $fromEmail,
                'from_name'  => $fromName,
            ], $msg));
            if ($graphDebug) {
                @file_put_contents(
                    $logDir . '/graph.log',
                    "[" . date('c') . "] OK (assessment)\n" . implode("\n", $g->log()) . "\n\n",
                    FILE_APPEND | LOCK_EX
                );
            }
            return ['ok' => true, 'transport' => 'graph', 'error' => null];
        } catch (Throwable $e) {
            $err = 'graph: ' . $e->getMessage();
            @file_put_contents(
                $logDir . '/graph.log',
                "[" . date('c') . "] ERROR (assessment): " . $e->getMessage() . "\n"
                . (isset($g) ? implode("\n", $g->log()) . "\n" : '') . "\n",
                FILE_APPEND | LOCK_EX
            );
        }
    }

    // 2) SMTP
    if ($smtpReady) {
        try {
            $m = new AspireMailer($smtpCfg);
            $m->send(array_merge([
                'from_email' => $fromEmail,
                'from_name'  => $fromName,
            ], $msg));
            if ($smtpDebug) {
                @file_put_contents(
                    $logDir . '/smtp.log',
                    "[" . date('c') . "] OK (assessment)\n" . implode("\n", $m->log()) . "\n\n",
                    FILE_APPEND | LOCK_EX
                );
            }
            return ['ok' => true, 'transport' => 'smtp', 'error' => null];
        } catch (Throwable $e) {
            $err = ($err ? $err . ' | ' : '') . 'smtp: ' . $e->getMessage();
            @file_put_contents(
                $logDir . '/smtp.log',
                "[" . date('c') . "] ERROR (assessment): " . $e->getMessage() . "\n"
                . (isset($m) ? implode("\n", $m->log()) . "\n" : '') . "\n",
                FILE_APPEND | LOCK_EX
            );
        }
    }

    // 3) mail()
    $hdrs = [
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'X-Mailer: PHP/' . phpversion(),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if (!empty($msg['reply_to'])) {
        $rn = $msg['reply_name'] ?? '';
        $hdrs[] = 'Reply-To: ' . ($rn !== '' ? "{$rn} <{$msg['reply_to']}>" : "<{$msg['reply_to']}>");
    }
    $sent = @mail($msg['to'], $msg['subject'], $msg['body'], implode("\r\n", $hdrs), '-f' . $fromEmail);
    if ($sent) {
        return ['ok' => true, 'transport' => 'mail', 'error' => null];
    }
    $err = ($err ? $err . ' | ' : '') . 'mail(): unknown error';
    return ['ok' => false, 'transport' => null, 'error' => $err];
};

// ----- Send #1: internal copy to info@ -----
$internal = $sendMessage([
    'to'         => $recipient,
    'reply_to'   => $email,
    'reply_name' => $replyName,
    'subject'    => $subject,
    'body'       => $body,
]);

// ----- Send #2: autoresponse to lead -----
$ack = $sendMessage([
    'to'         => $email,
    'reply_to'   => $recipient,
    'reply_name' => 'Aspire IT Systems',
    'subject'    => $ackSubject,
    'body'       => $ackBody,
]);

// ----- Respond -----
if ($internal['ok']) {
    http_response_code(200);
    echo json_encode([
        'ok'           => true,
        'transport'    => $internal['transport'],
        'ack_sent'     => (bool)$ack['ok'],
    ]);
} else {
    // Email failed but the lead IS captured in assessments.jsonl
    http_response_code(202);
    echo json_encode([
        'ok'   => true,
        'note' => 'logged_pending_email',
        // 'error' => $internal['error'],  // uncomment for debugging
    ]);
}
