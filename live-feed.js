/* ============================================================
   Live IT industry pulse
   Pulls HackerNews top stories, filters for IT topics, renders cards.
   Runs in-browser - HN API is CORS-enabled.
   ============================================================ */

(() => {
  const mount = document.getElementById('live-feed-mount');
  if (!mount) return;

  const IT_KEYWORDS = [
    'cisco','arista','juniper','fortinet','palo alto','aruba','vmware','meraki',
    'cloud','aws','azure','gcp','google cloud','kubernetes','k8s','docker',
    'network','networking','sd-wan','sase','firewall','vpn','wifi','wi-fi','5g','fiber','ethernet',
    'security','cybersecurity','zero trust','802.1x','ransomware','breach','cve','vulnerability',
    'datacenter','data center','data-center','infrastructure','devops','sre','observability',
    'ai','llm','gpu','nvidia','h100','b100','inference','training',
    'broadcast','st 2110','ipfm','ptp','multicast',
    'storage','nas','san','zfs','truenas','ceph',
    'open source','opensource','linux','rhel','ubuntu',
    'okta','zscaler','cloudflare','tailscale','wireguard',
    'router','switch','telemetry','snmp','bgp','mpls',
    'soc','siem','xdr','edr','identity',
  ];

  const HN_API = 'https://hacker-news.firebaseio.com/v0';
  const POLL_MS = 5 * 60 * 1000; // 5 min auto-refresh
  const CACHE_KEY = 'aspire-feed-cache-v1';
  const CACHE_TTL = 10 * 60 * 1000;

  function relevanceScore(title) {
    const lower = (title || '').toLowerCase();
    let n = 0;
    for (const k of IT_KEYWORDS) if (lower.includes(k)) n++;
    return n;
  }

  function relativeTime(unixSec) {
    const diff = Math.floor(Date.now() / 1000 - unixSec);
    if (diff < 60)       return diff + 's ago';
    if (diff < 3600)     return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400)    return Math.floor(diff / 3600) + 'h ago';
    if (diff < 86400*7)  return Math.floor(diff / 86400) + 'd ago';
    return Math.floor(diff / (86400*7)) + 'w ago';
  }

  function domain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch (e) { return ''; }
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.t > CACHE_TTL) return null;
      return parsed.items;
    } catch (e) { return null; }
  }
  function writeCache(items) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), items })); }
    catch (e) {}
  }

  async function fetchTopIds() {
    const r = await fetch(`${HN_API}/topstories.json`);
    if (!r.ok) throw new Error('topstories ' + r.status);
    return await r.json();
  }
  async function fetchItem(id) {
    const r = await fetch(`${HN_API}/item/${id}.json`);
    if (!r.ok) return null;
    return await r.json();
  }

  async function loadFeed({ force = false } = {}) {
    if (!force) {
      const cached = readCache();
      if (cached) { render(cached, true); return; }
    }
    setLoading();
    try {
      const ids = await fetchTopIds();
      const candidates = ids.slice(0, 60); // scan top 60
      const items = (await Promise.all(candidates.map(fetchItem)))
        .filter(it => it && it.title && it.url && it.type === 'story');
      const ranked = items
        .map(it => ({ ...it, rel: relevanceScore(it.title) }))
        .filter(it => it.rel > 0)
        .sort((a, b) => (b.rel - a.rel) || (b.score - a.score))
        .slice(0, 8);
      writeCache(ranked);
      render(ranked, false);
    } catch (err) {
      console.warn('feed error', err);
      renderError();
    }
  }

  function setLoading() {
    mount.innerHTML = `
      <div class="feed-marquee">
        <div class="feed-marquee-track">
          ${Array.from({length: 6}).map(() => `
            <div class="feed-skel-card">
              <div class="feed-skel-line"></div>
              <div class="feed-skel-line short"></div>
              <div class="feed-skel-meta"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function render(items, fromCache) {
    if (!items.length) { renderEmpty(); return; }
    const cardHTML = (it) => `
      <a class="feed-card" href="${escapeHtml(it.url)}" target="_blank" rel="noopener">
        <div class="feed-card-meta">
          <span class="feed-source">${escapeHtml(domain(it.url) || 'hn')}</span>
          <span class="feed-dot"></span>
          <span class="feed-time">${relativeTime(it.time)}</span>
          <span class="feed-dot"></span>
          <span class="feed-points">▲ ${it.score || 0}</span>
        </div>
        <h3 class="feed-title">${escapeHtml(it.title)}</h3>
        <div class="feed-card-foot">
          <span class="feed-comments">${it.descendants || 0} comments</span>
          <span class="feed-go">Read →</span>
        </div>
      </a>
    `;
    const row = items.map(cardHTML).join('');
    mount.innerHTML = `
      <div class="feed-marquee">
        <div class="feed-marquee-track">
          ${row}
          ${row}
        </div>
      </div>
      <div class="feed-foot">
        <button class="feed-refresh" id="feed-refresh">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
          Refresh
        </button>
        <span class="feed-source-label">Source: Hacker News &middot; filtered for IT topics${fromCache ? ' &middot; cached' : ''}</span>
      </div>
    `;
    const refresh = document.getElementById('feed-refresh');
    if (refresh) refresh.addEventListener('click', () => loadFeed({ force: true }));
  }

  function renderError() {
    mount.innerHTML = `
      <div class="feed-empty">
        <p>Couldn't reach the live feed right now. Try again in a moment.</p>
        <button class="feed-refresh" id="feed-refresh-err">Retry</button>
      </div>
    `;
    document.getElementById('feed-refresh-err').addEventListener('click', () => loadFeed({ force: true }));
  }

  function renderEmpty() {
    mount.innerHTML = `<div class="feed-empty"><p>No IT-relevant stories at the moment.</p></div>`;
  }

  loadFeed();
  setInterval(() => loadFeed({ force: true }), POLL_MS);
})();
