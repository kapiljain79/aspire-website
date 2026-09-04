<?php
/**
 * Aspire IT Systems - Chat proxy (Groq primary, Gemini fallback)
 * ------------------------------------------------
 * Receives a chat conversation from the browser widget, forwards it to
 * the chosen LLM API with our system prompt, returns the model's reply.
 *
 * Provider selection (in order):
 *   1. Groq      (if mail-config.php has groq.api_key set)
 *   2. Gemini    (if mail-config.php has gemini.api_key set)
 *
 * Why Groq first?  Groq's free tier doesn't require billing setup,
 * delivers fast Llama 3.3 responses, and is reliable for B2B chat
 * volume. Gemini stays as a fallback for tenants that already have it.
 *
 * The API key never reaches the browser - it's read server-side from
 * mail-config.php, which is HTTP-blocked by .htaccess.
 *
 * Expected POST body (JSON):
 *   { "messages": [
 *       {"role":"user","content":"..."},
 *       {"role":"assistant","content":"..."},
 *       ...
 *     ] }
 *
 * Response:  {"ok":true, "reply":"...", "provider":"groq"}
 * Or:        {"ok":false, "error":"..."}
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// ---------- Same-origin guard ----------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'https://www.aspireitsystems.io',
    'https://aspireitsystems.io',
    'http://localhost',
    'http://127.0.0.1',
];
foreach ($allowed as $o) {
    if ($origin === $o || strpos($origin, $o) === 0) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        break;
    }
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST')    {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

// ---------- Load config ----------
// Prefer a copy one level above the webroot: Hostinger's git auto-deploy
// only replaces public_html, so a config file living outside it survives
// every push instead of getting wiped and needing a manual re-upload.
$configFile = dirname(__DIR__) . '/mail-config.php';
if (!file_exists($configFile)) {
    $configFile = __DIR__ . '/mail-config.php';
}
$config = file_exists($configFile) ? require $configFile : [];

$groqKey    = trim((string)($config['groq']['api_key']    ?? ''));
$groqModel  = (string)($config['groq']['model']           ?? 'llama-3.3-70b-versatile');
$geminiKey  = trim((string)($config['gemini']['api_key']  ?? ''));
$geminiModel= (string)($config['gemini']['model']         ?? 'gemini-2.0-flash');

$hasGroq    = $groqKey   !== '' && $groqKey   !== 'PASTE_GROQ_API_KEY_HERE';
$hasGemini  = $geminiKey !== '' && $geminiKey !== 'PASTE_GEMINI_API_KEY_HERE';

if (!$hasGroq && !$hasGemini) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'chat_not_configured']);
    exit;
}

// ---------- Parse request ----------
$raw  = file_get_contents('php://input') ?: '';
$body = json_decode($raw, true);
$messages = is_array($body) ? ($body['messages'] ?? []) : [];

if (!is_array($messages) || empty($messages)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'no_messages']);
    exit;
}

// ---------- System prompt ----------
$systemPrompt = <<<SYSTEM
You are the friendly AI assistant for Aspire IT Systems (aspireitsystems.io), a trusted IT consultancy with 20+ years of experience operating across North America.

OUR SERVICES:
1. Network & Security Architecture - Spine/Leaf data centers, zero-trust segmentation, enterprise networks
2. Cloud Solutions & Migration - AWS, Azure, GCP, hybrid connectivity, landing zones, workload migration
3. End-to-End Project Management - discovery to ongoing support
4. Wireless & Collaboration - enterprise Wi-Fi, VoIP, video
5. Managed Services - comprehensive, tailored to client needs
6. Network Security & SASE - multi-vendor SASE, SD-WAN, ZTNA, NGFW
7. Media & Broadcast - SDI to IP migration, ST 2110 fabrics, PTP, multicast

DEEP EXPERTISE:
- Data Center: ACI, NDFC, DNAC, Nexus, Arista, Aruba, Juniper, VMware
- Routing & Switching: Cisco, Arista, Juniper, Aruba
- Network Security: Cisco ISE, Fortigate, Palo Alto, FTD/ASA, Checkpoint, Aruba ClearPass, Arista AGNI
- Cloud Networking: Azure, AWS, GCP
- Wireless: Cisco, Meraki, Aruba, Arista, Juniper
- SD-WAN: Palo Alto, Fortinet, Zscaler, Aruba Silverpeak
- VoIP & Video: Cisco CUCM/Unity/Jabber/Webex, Zoom, MS Teams, Grandstream

NOTABLE WORK:
- Data Center Refresh: Migrated legacy DCs to Spine/Leaf with zero downtime (Casino, Medical, ISP, Oil & Energy)
- 802.1X Secure Access: 100% endpoint migration using Cisco ISE (Financial, Government)
- VoIP Transformation: PBX -> Cisco CUCM (Healthcare, K-12, Defense)
- Azure Landing Zone with AVS migration (Manufacturing)
- Arista IP fabric for 4K/8K broadcast media - 25% CapEx reduction
- VxLAN/EVPN Tier-1 enterprise rebuild

CLIENTS: SMBs to Tier-1 enterprises. 100% project success rate.

OUR MOTTO: "We fix what others escalate."

TONE: Friendly, professional, concise. Use 2-4 sentences usually. Don't overload with bullet lists unless asked. Sound like a knowledgeable engineer, not a chatbot.

CONVERSION:
- If they ask about pricing/SLAs/timelines: say happy to set up a call, recommend the contact page or info@aspireitsystems.io
- If they want a free network assessment: tell them to email info@aspireitsystems.io with their company size and infrastructure focus
- Never invent specific prices or guarantees you don't know

If asked something completely off-topic (weather, jokes, coding help unrelated to IT infrastructure), politely redirect: "I'm focused on Aspire's services - happy to help with anything network, security, cloud, or IT-related!"

Format light HTML allowed in replies: use **bold** which gets converted to <b>, and natural line breaks. No tables, no headings, no Markdown beyond bold.
SYSTEM;

// ---------- Try Groq first ----------
if ($hasGroq) {
    $result = callGroq($groqKey, $groqModel, $systemPrompt, $messages);
    if ($result['ok']) {
        echo json_encode(['ok' => true, 'reply' => $result['reply'], 'provider' => 'groq']);
        exit;
    }
    logError('groq', $result['status'] ?? 0, $result['error'] ?? '');
    // Fall through to Gemini if it's configured
}

// ---------- Fallback: Gemini ----------
if ($hasGemini) {
    $result = callGemini($geminiKey, $geminiModel, $systemPrompt, $messages);
    if ($result['ok']) {
        echo json_encode(['ok' => true, 'reply' => $result['reply'], 'provider' => 'gemini']);
        exit;
    }
    logError('gemini', $result['status'] ?? 0, $result['error'] ?? '');
}

http_response_code(502);
echo json_encode(['ok' => false, 'error' => 'all_providers_failed']);
exit;

// ============================================================
// Provider implementations
// ============================================================

/**
 * Groq - OpenAI-compatible chat completions endpoint.
 * Free tier: 30 req/min for most models, no billing required.
 * @return array{ok:bool, reply?:string, status?:int, error?:string}
 */
function callGroq(string $apiKey, string $model, string $systemPrompt, array $messages): array
{
    // Build OpenAI-format messages (system + history)
    $oaMessages = [['role' => 'system', 'content' => $systemPrompt]];
    foreach ($messages as $m) {
        if (!is_array($m)) continue;
        $role = ($m['role'] ?? '') === 'assistant' ? 'assistant' : 'user';
        $text = trim((string)($m['content'] ?? ''));
        if ($text === '') continue;
        if (function_exists('mb_substr') && mb_strlen($text) > 4000) $text = mb_substr($text, 0, 4000);
        $oaMessages[] = ['role' => $role, 'content' => $text];
    }
    if (count($oaMessages) < 2) return ['ok' => false, 'error' => 'empty_messages'];

    $payload = [
        'model'       => $model,
        'messages'    => $oaMessages,
        'temperature' => 0.6,
        'max_tokens'  => 600,
        'top_p'       => 0.95,
        'stream'      => false,
    ];

    [$status, $resp] = httpPostJson(
        'https://api.groq.com/openai/v1/chat/completions',
        $payload,
        ['Authorization: Bearer ' . $apiKey]
    );

    if ($status !== 200) {
        return ['ok' => false, 'status' => $status, 'error' => substr((string)$resp, 0, 400)];
    }

    $data  = json_decode((string)$resp, true);
    $reply = trim((string)($data['choices'][0]['message']['content'] ?? ''));
    if ($reply === '') {
        return ['ok' => false, 'status' => 200, 'error' => 'empty_reply'];
    }
    return ['ok' => true, 'reply' => $reply];
}

/**
 * Google Gemini - generateContent endpoint.
 * @return array{ok:bool, reply?:string, status?:int, error?:string}
 */
function callGemini(string $apiKey, string $model, string $systemPrompt, array $messages): array
{
    $contents = [];
    foreach ($messages as $m) {
        if (!is_array($m)) continue;
        $role = ($m['role'] ?? '') === 'assistant' ? 'model' : 'user';
        $text = trim((string)($m['content'] ?? ''));
        if ($text === '') continue;
        if (function_exists('mb_substr') && mb_strlen($text) > 4000) $text = mb_substr($text, 0, 4000);
        $contents[] = ['role' => $role, 'parts' => [['text' => $text]]];
    }
    if (empty($contents)) return ['ok' => false, 'error' => 'empty_messages'];

    $payload = [
        'system_instruction' => ['parts' => [['text' => $systemPrompt]]],
        'contents'           => $contents,
        'generationConfig'   => ['temperature' => 0.6, 'maxOutputTokens' => 600, 'topP' => 0.95],
        'safetySettings'     => [
            ['category' => 'HARM_CATEGORY_HARASSMENT',        'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_HATE_SPEECH',       'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
        ],
    ];

    $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/'
              . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey);

    [$status, $resp] = httpPostJson($endpoint, $payload, []);

    if ($status !== 200) {
        return ['ok' => false, 'status' => $status, 'error' => substr((string)$resp, 0, 400)];
    }
    $data  = json_decode((string)$resp, true);
    $reply = '';
    foreach (($data['candidates'][0]['content']['parts'] ?? []) as $p) {
        if (isset($p['text'])) $reply .= $p['text'];
    }
    $reply = trim($reply);
    if ($reply === '') return ['ok' => false, 'status' => 200, 'error' => 'empty_reply'];
    return ['ok' => true, 'reply' => $reply];
}

/**
 * @return array{0:int, 1:string}
 */
function httpPostJson(string $url, array $payload, array $headers): array
{
    if (!function_exists('curl_init')) {
        return [0, 'curl_extension_missing'];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_HTTPHEADER     => array_merge(['Content-Type: application/json'], $headers),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 25,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT      => 'AspireChatProxy/2.0',
    ]);
    $resp   = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err    = curl_error($ch);
    curl_close($ch);

    if ($resp === false) {
        return [0, 'curl: ' . $err];
    }
    return [$status, (string)$resp];
}

function logError(string $provider, int $status, string $body): void
{
    $line = '[' . date('c') . "] {$provider} HTTP {$status}: " . substr($body, 0, 500) . "\n";
    @file_put_contents(__DIR__ . '/leads/chat.log', $line, FILE_APPEND | LOCK_EX);
}
