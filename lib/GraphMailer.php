<?php
/**
 * Aspire IT Systems - Microsoft Graph mailer
 * ------------------------------------------------
 * Sends mail via Microsoft Graph API (the modern OAuth2 path that
 * replaces SMTP AUTH on M365 tenants).
 *
 * Auth flow: OAuth2 client_credentials grant
 *   POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
 *   -> access_token (valid ~60 min, we cache for 55 min)
 *
 * Send flow:
 *   POST https://graph.microsoft.com/v1.0/users/{sender}/sendMail
 *   with the message body as JSON.
 *
 * Requires:
 *   - Azure App Registration with Microsoft Graph -> Application
 *     permission "Mail.Send" (admin consent granted).
 *   - Sender mailbox must be a real licensed user in the tenant.
 *
 * Dependencies: PHP curl extension (standard on Hostinger).
 */

declare(strict_types=1);

final class AspireGraphMailer
{
    private string $tenantId;
    private string $clientId;
    private string $clientSecret;
    private int    $timeout;
    private bool   $debug;
    private string $tokenCachePath;
    /** @var string[] */
    private array  $log = [];

    /**
     * @param array{
     *   tenant_id:string,
     *   client_id:string,
     *   client_secret:string,
     *   timeout?:int,
     *   debug?:bool,
     *   token_cache_path?:string
     * } $cfg
     */
    public function __construct(array $cfg)
    {
        $this->tenantId       = $cfg['tenant_id'];
        $this->clientId       = $cfg['client_id'];
        $this->clientSecret   = $cfg['client_secret'];
        $this->timeout        = (int)($cfg['timeout']         ?? 20);
        $this->debug          = (bool)($cfg['debug']          ?? false);
        $this->tokenCachePath = (string)($cfg['token_cache_path'] ?? __DIR__ . '/../leads/.graph-token');
    }

    /**
     * @param array{
     *   from_email:string,
     *   from_name?:string,
     *   to:string,
     *   reply_to?:string,
     *   reply_name?:string,
     *   subject:string,
     *   body:string
     * } $msg
     */
    public function send(array $msg): void
    {
        $token = $this->getAccessToken();

        // Build the Graph payload
        $toAddresses = $this->splitAddresses((string)$msg['to']);
        if (empty($toAddresses)) {
            throw new RuntimeException('Graph: no valid recipient addresses');
        }

        $message = [
            'subject' => (string)$msg['subject'],
            'body'    => [
                'contentType' => 'Text',
                'content'     => (string)$msg['body'],
            ],
            'toRecipients' => array_map(function ($a) {
                return ['emailAddress' => ['address' => $a]];
            }, $toAddresses),
            'from' => [
                'emailAddress' => [
                    'address' => $this->cleanAddr((string)$msg['from_email']),
                    'name'    => (string)($msg['from_name'] ?? ''),
                ],
            ],
        ];

        if (!empty($msg['reply_to'])) {
            $message['replyTo'] = [[
                'emailAddress' => [
                    'address' => $this->cleanAddr((string)$msg['reply_to']),
                    'name'    => (string)($msg['reply_name'] ?? ''),
                ],
            ]];
        }

        $payload = [
            'message'         => $message,
            'saveToSentItems' => true,
        ];

        $sender = $this->cleanAddr((string)$msg['from_email']);
        $url    = 'https://graph.microsoft.com/v1.0/users/' . rawurlencode($sender) . '/sendMail';

        [$status, $body] = $this->httpPost($url, json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ]);

        if ($status !== 202) {
            // Graph returns 202 Accepted on success. Anything else = failure.
            $this->logLine("sendMail HTTP {$status}: " . substr((string)$body, 0, 400));
            throw new RuntimeException("Graph sendMail failed (HTTP {$status}): " . substr((string)$body, 0, 300));
        }

        $this->logLine("sendMail HTTP 202 (accepted)");
    }

    /** @return string[] Debug transcript (if debug=true) */
    public function log(): array { return $this->log; }

    // ---------------------------------------------------------------
    // Token cache + acquisition
    // ---------------------------------------------------------------

    private function getAccessToken(): string
    {
        // Try cache first
        $cached = $this->readTokenCache();
        if ($cached !== null) {
            $this->logLine('using cached access_token');
            return $cached;
        }

        $tokenUrl = 'https://login.microsoftonline.com/' . rawurlencode($this->tenantId) . '/oauth2/v2.0/token';
        $body = http_build_query([
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'scope'         => 'https://graph.microsoft.com/.default',
            'grant_type'    => 'client_credentials',
        ]);

        [$status, $resp] = $this->httpPost($tokenUrl, $body, [
            'Content-Type: application/x-www-form-urlencoded',
        ]);

        if ($status !== 200) {
            $this->logLine("token HTTP {$status}: " . substr((string)$resp, 0, 400));
            throw new RuntimeException("Graph token request failed (HTTP {$status}): " . substr((string)$resp, 0, 300));
        }

        $data = json_decode((string)$resp, true);
        if (!is_array($data) || empty($data['access_token'])) {
            throw new RuntimeException('Graph token response missing access_token');
        }

        $token     = (string)$data['access_token'];
        $expiresIn = (int)($data['expires_in'] ?? 3600);

        $this->writeTokenCache($token, $expiresIn);
        $this->logLine('acquired new access_token (expires in ' . $expiresIn . 's)');

        return $token;
    }

    private function readTokenCache(): ?string
    {
        if (!is_file($this->tokenCachePath)) return null;
        $raw = @file_get_contents($this->tokenCachePath);
        if (!$raw) return null;
        $data = json_decode($raw, true);
        if (!is_array($data) || empty($data['access_token']) || empty($data['expires_at'])) return null;
        // Refresh 60s early to avoid edge-of-expiry failures
        if ((int)$data['expires_at'] <= time() + 60) return null;
        return (string)$data['access_token'];
    }

    private function writeTokenCache(string $token, int $expiresIn): void
    {
        $dir = dirname($this->tokenCachePath);
        if (!is_dir($dir)) @mkdir($dir, 0755, true);

        $payload = json_encode([
            'access_token' => $token,
            'expires_at'   => time() + max(60, $expiresIn - 60),
        ]);
        // 0600 - readable only by the PHP user
        @file_put_contents($this->tokenCachePath, $payload, LOCK_EX);
        @chmod($this->tokenCachePath, 0600);
    }

    // ---------------------------------------------------------------
    // HTTP
    // ---------------------------------------------------------------

    /** @return array{0:int,1:string} */
    private function httpPost(string $url, string $body, array $headers): array
    {
        if (!function_exists('curl_init')) {
            throw new RuntimeException('PHP curl extension not available');
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_USERAGENT      => 'AspireGraphMailer/1.0',
        ]);

        $resp = curl_exec($ch);
        if ($resp === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new RuntimeException('Graph HTTP error: ' . $err);
        }
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [$status, (string)$resp];
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    /** @return string[] */
    private function splitAddresses(string $list): array
    {
        $parts = preg_split('/[,;]+/', $list) ?: [$list];
        $out = [];
        foreach ($parts as $p) {
            $a = $this->cleanAddr(trim($p));
            if ($a !== '' && filter_var($a, FILTER_VALIDATE_EMAIL)) {
                $out[] = $a;
            }
        }
        return $out;
    }

    private function cleanAddr(string $a): string
    {
        return str_replace(["\r", "\n", "\0"], '', trim($a));
    }

    private function logLine(string $s): void
    {
        if ($this->debug) $this->log[] = '[' . date('H:i:s') . '] ' . $s;
    }
}
