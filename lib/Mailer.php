<?php
/**
 * Aspire IT Systems - Minimal SMTP STARTTLS client
 * ------------------------------------------------
 * Sends a plain-text email through an authenticated SMTP server
 * (designed for smtp.office365.com:587 but works with any STARTTLS
 * SMTP server). No external dependencies.
 *
 * Usage:
 *   $mailer = new AspireMailer([
 *       'host'     => 'smtp.office365.com',
 *       'port'     => 587,
 *       'username' => 'website@aspireitsystems.io',
 *       'password' => 'app-password-here',
 *       'timeout'  => 15,
 *   ]);
 *   $mailer->send([
 *       'from_email' => 'website@aspireitsystems.io',
 *       'from_name'  => 'Aspire IT Website',
 *       'to'         => 'info@aspireitsystems.io',
 *       'reply_to'   => 'jane@acme.com',
 *       'reply_name' => 'Jane Doe',
 *       'subject'    => 'New enquiry from Jane',
 *       'body'       => "Plain text body…",
 *   ]);
 *
 * Throws RuntimeException on any SMTP error - caller should catch
 * and fall back to mail() or just rely on the JSONL log.
 */

declare(strict_types=1);

final class AspireMailer
{
    /** @var resource|null */
    private $conn = null;
    private string $host;
    private int    $port;
    private string $username;
    private string $password;
    private int    $timeout;
    private bool   $debug;
    /** @var string[] */
    private array  $log = [];

    /**
     * @param array{
     *   host:string, port?:int, username:string, password:string,
     *   timeout?:int, debug?:bool
     * } $cfg
     */
    public function __construct(array $cfg)
    {
        $this->host     = $cfg['host'];
        $this->port     = (int)($cfg['port']    ?? 587);
        $this->username = $cfg['username'];
        $this->password = $cfg['password'];
        $this->timeout  = (int)($cfg['timeout'] ?? 15);
        $this->debug    = (bool)($cfg['debug']  ?? false);
    }

    /**
     * @param array{
     *   from_email:string, from_name?:string,
     *   to:string,
     *   reply_to?:string, reply_name?:string,
     *   subject:string, body:string
     * } $msg
     */
    public function send(array $msg): void
    {
        $this->connect();

        try {
            $this->ehloAndStartTls();
            $this->authenticate();

            $this->cmd('MAIL FROM:<' . $this->cleanAddr($msg['from_email']) . '>', 250);

            // Support a single address or a comma/semicolon-separated list
            $recipients = preg_split('/[,;]+/', (string)$msg['to']) ?: [(string)$msg['to']];
            $recipients = array_filter(array_map([$this, 'cleanAddr'], array_map('trim', $recipients)));
            if (empty($recipients)) {
                throw new RuntimeException('No valid recipient addresses');
            }
            foreach ($recipients as $rcpt) {
                $this->cmd('RCPT TO:<' . $rcpt . '>', [250, 251]);
            }

            $this->cmd('DATA', 354);

            $headers   = $this->buildHeaders($msg);
            $bodyDot   = $this->dotStuff($msg['body']);
            $payload   = $headers . "\r\n\r\n" . $bodyDot . "\r\n.";

            $this->write($payload);
            $this->expect(250);

            $this->cmd('QUIT', 221);
        } finally {
            $this->close();
        }
    }

    /** @return string[] Returns the SMTP transcript if debug=true */
    public function log(): array { return $this->log; }

    // ---------------------------------------------------------------
    // SMTP plumbing
    // ---------------------------------------------------------------

    private function connect(): void
    {
        $errno = 0; $errstr = '';
        $this->conn = @stream_socket_client(
            "tcp://{$this->host}:{$this->port}",
            $errno,
            $errstr,
            $this->timeout,
            STREAM_CLIENT_CONNECT
        );
        if (!$this->conn) {
            throw new RuntimeException("SMTP connect failed: {$errstr} ({$errno})");
        }
        stream_set_timeout($this->conn, $this->timeout);
        $this->expect(220);
    }

    private function ehloAndStartTls(): void
    {
        $this->cmd('EHLO ' . $this->ehloName(), 250);

        $this->cmd('STARTTLS', 220);
        // Crypto: try TLS 1.2+, fall back to whatever's available
        $crypto = STREAM_CRYPTO_METHOD_TLS_CLIENT;
        if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
            $crypto |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
        }
        if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
            $crypto |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
        }
        $ok = @stream_socket_enable_crypto($this->conn, true, $crypto);
        if ($ok !== true) {
            throw new RuntimeException('STARTTLS negotiation failed');
        }
        // Must re-EHLO after STARTTLS
        $this->cmd('EHLO ' . $this->ehloName(), 250);
    }

    private function authenticate(): void
    {
        $this->cmd('AUTH LOGIN', 334);
        $this->cmd(base64_encode($this->username), 334);
        $this->cmd(base64_encode($this->password), 235);
    }

    /**
     * @param int|int[] $expected
     */
    private function cmd(string $line, $expected): string
    {
        $this->write($line);
        return $this->expect($expected);
    }

    private function write(string $line): void
    {
        if ($this->debug) $this->log[] = '> ' . $this->sanitizeLogLine($line);
        $bytes = @fwrite($this->conn, $line . "\r\n");
        if ($bytes === false) {
            throw new RuntimeException('SMTP write failed');
        }
    }

    /** @param int|int[] $expected */
    private function expect($expected): string
    {
        $expected = (array)$expected;
        $response = '';
        while (!feof($this->conn)) {
            $line = @fgets($this->conn, 4096);
            if ($line === false) break;
            $response .= $line;
            if ($this->debug) $this->log[] = '< ' . rtrim($line);
            // SMTP multi-line continuation: "250-…", final line is "250 …"
            if (preg_match('/^\d{3} /', $line)) break;
        }
        if ($response === '') {
            $meta = stream_get_meta_data($this->conn);
            if (!empty($meta['timed_out'])) {
                throw new RuntimeException('SMTP read timed out');
            }
            throw new RuntimeException('SMTP empty response');
        }
        $code = (int)substr($response, 0, 3);
        if (!in_array($code, $expected, true)) {
            throw new RuntimeException('SMTP unexpected reply: ' . trim($response));
        }
        return $response;
    }

    private function close(): void
    {
        if ($this->conn) {
            @fclose($this->conn);
            $this->conn = null;
        }
    }

    private function ehloName(): string
    {
        $h = $_SERVER['SERVER_NAME'] ?? 'localhost';
        // Strip ports if any
        return preg_replace('/[^A-Za-z0-9\.\-]/', '', $h) ?: 'localhost';
    }

    /** Don't log credentials in plaintext. */
    private function sanitizeLogLine(string $line): string
    {
        // The two AUTH LOGIN responses are base64(username) and base64(password)
        // After AUTH LOGIN we expect two 334 challenges -> redact the next 2 sends
        static $authStage = 0;
        if (strpos($line, 'AUTH LOGIN') === 0) {
            $authStage = 1;
            return $line;
        }
        if ($authStage === 1) { $authStage = 2; return '[base64 username redacted]'; }
        if ($authStage === 2) { $authStage = 0; return '[base64 password redacted]'; }
        return $line;
    }

    /**
     * RFC 5321 §4.5.2 - any line in the body starting with "." must be
     * doubled to ".." so the receiver doesn't interpret it as end-of-data.
     */
    private function dotStuff(string $body): string
    {
        $body = preg_replace("/\r\n?/", "\n", $body) ?? $body;
        $body = str_replace("\n", "\r\n", $body);
        return preg_replace('/^\./m', '..', $body) ?? $body;
    }

    private function cleanAddr(string $a): string
    {
        $a = trim($a);
        // Strip CR/LF (header injection guard)
        return str_replace(["\r", "\n"], '', $a);
    }

    /** @param array{from_email:string, from_name?:string, to:string, reply_to?:string, reply_name?:string, subject:string} $msg */
    private function buildHeaders(array $msg): string
    {
        $fromName = $this->encodeHeaderWord($msg['from_name'] ?? '');
        $from     = $fromName !== ''
            ? "{$fromName} <" . $this->cleanAddr($msg['from_email']) . '>'
            : '<' . $this->cleanAddr($msg['from_email']) . '>';

        // Build the visible To: header (may be a list)
        $toRecipients = preg_split('/[,;]+/', (string)$msg['to']) ?: [(string)$msg['to']];
        $toRecipients = array_filter(array_map(function ($a) {
            return '<' . $this->cleanAddr(trim($a)) . '>';
        }, $toRecipients));
        $toHeader = implode(', ', $toRecipients);

        $lines = [
            'Date: '        . date('r'),
            'From: '        . $from,
            'To: '          . $toHeader,
            'Subject: '     . $this->encodeHeaderWord($msg['subject']),
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'Message-ID: <' . bin2hex(random_bytes(8)) . '@' . $this->ehloName() . '>',
            'X-Mailer: AspireMailer/1.0',
        ];

        if (!empty($msg['reply_to'])) {
            $replyName = $this->encodeHeaderWord($msg['reply_name'] ?? '');
            $reply = $replyName !== ''
                ? "{$replyName} <" . $this->cleanAddr($msg['reply_to']) . '>'
                : '<' . $this->cleanAddr($msg['reply_to']) . '>';
            $lines[] = 'Reply-To: ' . $reply;
        }

        return implode("\r\n", $lines);
    }

    /** RFC 2047 encode header content if it contains non-ASCII or special chars. */
    private function encodeHeaderWord(string $s): string
    {
        $s = str_replace(["\r", "\n"], '', $s);
        if ($s === '' || preg_match('/^[\x20-\x7E]*$/', $s)) {
            // ASCII clean - just quote if it contains special chars
            if (preg_match('/[<>@,;:"\.\(\)\[\]\\\\]/', $s)) {
                return '"' . str_replace(['\\', '"'], ['\\\\', '\\"'], $s) . '"';
            }
            return $s;
        }
        return '=?UTF-8?B?' . base64_encode($s) . '?=';
    }
}
