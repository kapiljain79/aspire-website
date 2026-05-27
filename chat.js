/* ============================================================
   Aspire IT Systems - Live chat widget
   Uses window.claude.complete() for real AI responses
   ============================================================ */

(() => {
  const SYSTEM_CONTEXT = `You are the friendly AI assistant for Aspire IT Systems (aspireitsystems.io), a trusted IT consultancy with 20+ years of experience operating across North America.

OUR SERVICES:
1. Network & Security Architecture - Spine/Leaf data centers, zero-trust segmentation, enterprise networks
2. Cloud Solutions & Migration - AWS, Azure, GCP, hybrid connectivity, landing zones, workload migration
3. End-to-End Project Management - discovery to ongoing support
4. Wireless & Collaboration - enterprise Wi-Fi, VoIP, video
5. Managed Services - comprehensive, tailored to client needs

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
- VoIP Transformation: PBX → Cisco CUCM (Healthcare, K-12, Defense)
- Azure Landing Zone with AVS migration (Manufacturing)
- Arista IP fabric for 4K/8K broadcast media - 25% CapEx reduction
- VxLAN/EVPN Tier-1 enterprise rebuild

CLIENTS: SMBs to Tier-1 enterprises. 100% project success rate.

OUR MOTTO: "We fix what others escalate."

TONE: Friendly, professional, concise. Use 2-4 sentences usually. Don't overload with bullet lists unless asked. Sound like a knowledgeable engineer, not a chatbot.

CONVERSION:
- If they ask about pricing/SLAs/timelines: say happy to set up a call, recommend the "Talk to an expert" button or info@aspireitsystems.io
- If they want a free network assessment: tell them to email info@aspireitsystems.io with their company size and infrastructure focus
- Never invent specific prices or guarantees you don't know

If asked something completely off-topic (weather, jokes, coding help unrelated to IT infrastructure), politely redirect: "I'm focused on Aspire's services - happy to help with anything network, security, cloud, or IT-related!"`;

  const SUGGESTED_PROMPTS = [
    "What services do you offer?",
    "Tell me about your cloud migration experience",
    "Can you help with 802.1X / Cisco ISE?",
    "How do I get a free network assessment?",
  ];

  const messages = []; // {role, content}[]

  /* ---------- Build DOM ---------- */
  const root = document.createElement('div');
  root.className = 'chat-root';
  root.innerHTML = `
    <button class="chat-fab" id="chat-fab" aria-label="Open chat">
      <svg class="chat-fab-icon-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="chat-fab-icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
      <span class="chat-fab-pulse"></span>
    </button>

    <div class="chat-panel" id="chat-panel" role="dialog" aria-label="Aspire AI assistant">
      <header class="chat-header">
        <div class="chat-id">
          <span class="chat-avatar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 L4 6 V12 C4 16.5 7.5 20.5 12 22 C16.5 20.5 20 16.5 20 12 V6 Z"/>
            </svg>
          </span>
          <div class="chat-meta">
            <div class="chat-name">Aspire Assistant</div>
            <div class="chat-status"><span class="chat-dot"></span>AI · Replies instantly</div>
          </div>
        </div>
        <button class="chat-min" id="chat-min" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </header>

      <div class="chat-body" id="chat-body" role="log" aria-live="polite"></div>

      <div class="chat-suggestions" id="chat-suggestions"></div>

      <form class="chat-input" id="chat-form">
        <input type="text" id="chat-input" placeholder="Ask about our services…" autocomplete="off" />
        <button type="submit" id="chat-send" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      </form>

      <div class="chat-footnote">Powered by AI · Responses may vary · For binding quotes <a href="mailto:info@aspireitsystems.io">email our team</a></div>
    </div>
  `;
  document.body.appendChild(root);

  /* ---------- Refs ---------- */
  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  const body = document.getElementById('chat-body');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const suggestions = document.getElementById('chat-suggestions');
  const minBtn = document.getElementById('chat-min');

  /* ---------- Helpers ---------- */
  function addMsg(role, content, opts = {}) {
    const m = document.createElement('div');
    m.className = `chat-msg chat-msg-${role}`;
    if (role === 'assistant') {
      m.innerHTML = `
        <span class="chat-avatar chat-avatar-sm">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2 L4 6 V12 C4 16.5 7.5 20.5 12 22 C16.5 20.5 20 16.5 20 12 V6 Z"/>
          </svg>
        </span>
        <div class="chat-bubble">${content}</div>
      `;
    } else {
      m.innerHTML = `<div class="chat-bubble">${escapeHtml(content)}</div>`;
    }
    if (opts.id) m.id = opts.id;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'chat-msg chat-msg-assistant';
    t.id = 'chat-typing';
    t.innerHTML = `
      <span class="chat-avatar chat-avatar-sm">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2 L4 6 V12 C4 16.5 7.5 20.5 12 22 C16.5 20.5 20 16.5 20 12 V6 Z"/>
        </svg>
      </span>
      <div class="chat-bubble chat-typing">
        <span></span><span></span><span></span>
      </div>
    `;
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('chat-typing');
    if (t) t.remove();
  }

  function renderSuggestions() {
    suggestions.innerHTML = '';
    SUGGESTED_PROMPTS.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat-chip';
      b.textContent = p;
      b.addEventListener('click', () => {
        input.value = p;
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      });
      suggestions.appendChild(b);
    });
  }

  /* ---------- Greeting ---------- */
  function greet() {
    if (messages.length) return;
    const greeting = `Hi! I'm the Aspire Assistant. I can answer questions about our <b>cloud</b>, <b>networking</b>, <b>security</b>, and <b>managed-services</b> work - or help you set up a free network assessment. What's on your mind?`;
    addMsg('assistant', greeting);
    renderSuggestions();
  }

  /* ---------- Open / close ---------- */
  function open() {
    panel.classList.add('open');
    fab.classList.add('open');
    greet();
    setTimeout(() => input.focus(), 200);
  }
  function close() {
    panel.classList.remove('open');
    fab.classList.remove('open');
  }
  fab.addEventListener('click', () => {
    if (panel.classList.contains('open')) close();
    else open();
  });
  minBtn.addEventListener('click', close);

  /* ---------- Send ---------- */
  async function send(text) {
    if (!text || !text.trim()) return;
    addMsg('user', text.trim());
    messages.push({ role: 'user', content: text.trim() });
    suggestions.style.display = 'none';
    input.value = '';
    sendBtn.disabled = true;
    showTyping();

    try {
      // POST the conversation to our server-side proxy (which calls Gemini)
      const res = await fetch('chat-proxy.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      let data = {};
      try { data = await res.json(); } catch (_) { /* non-JSON */ }

      if (!res.ok || !data.ok || !data.reply) {
        throw new Error(data && data.error ? data.error : ('HTTP ' + res.status));
      }

      hideTyping();
      const cleaned = String(data.reply).trim() || "Sorry - I didn't catch that. Could you rephrase?";
      messages.push({ role: 'assistant', content: cleaned });

      // Reply may contain a small amount of trusted HTML from our server prompt (<b>, <a href="mailto:...">).
      // We escape user-content patterns then re-allow our markdown-ish formatting.
      const isLikelyHtml = /<\s*(b|a|br)\b/i.test(cleaned);
      const formatted = isLikelyHtml
        ? cleaned.replace(/\n/g, '<br/>')
        : escapeHtml(cleaned).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>');
      addMsg('assistant', formatted);
    } catch (err) {
      console.error('chat error', err);
      hideTyping();
      addMsg('assistant', `Hmm - I'm having trouble reaching the assistant right now. <br/>You can email us directly at <a href="mailto:info@aspireitsystems.io" style="color: var(--accent);">info@aspireitsystems.io</a> and we'll get back to you fast.`);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(input.value);
  });

})();
