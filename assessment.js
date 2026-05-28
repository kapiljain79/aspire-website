/* ============================================================
   Aspire IT Readiness Assessment Suite
   3 tracks · 12 questions each · AI-personalised + PDF
   ============================================================ */

(() => {
  // --------------------------------------------------------------
  // Assessment tracks
  // --------------------------------------------------------------
  const TRACKS = {

    datacentre: {
      id: 'datacentre',
      name: 'Data Centre Readiness',
      short: 'Data centre',
      tagline: 'Multi-site footprint, connectivity, segmentation, monitoring, and growth posture for organisations running their own network infrastructure.',
      icon: 'M3 12h4l3-9 4 18 3-9h4',
      dimensions: [
        { key: 'footprint',  label: 'Footprint & Connectivity', short: 'Footprint' },
        { key: 'resilience', label: 'Resilience & Applications', short: 'Resilience' },
        { key: 'core',       label: 'Access & Core Network', short: 'Core Network' },
        { key: 'security',   label: 'Segmentation & Security', short: 'Security' },
        { key: 'ops',        label: 'Operations & Growth', short: 'Operations' },
      ],
      questions: [
        { dim: 'footprint', q: 'How many locations do you operate, and how are they interconnected today?', a: [
          { t: 'Multiple sites with no formal interconnect (consumer-grade VPNs)', s: 0 },
          { t: 'Single site - no inter-site connectivity required',                  s: 1 },
          { t: 'Multiple sites over MPLS or dedicated private WAN',                  s: 2 },
          { t: 'Multi-site SD-WAN with diverse backhaul and policy-based routing',   s: 3 },
        ]},
        { dim: 'footprint', q: 'What is your current internet bandwidth setup?', a: [
          { t: 'Single ISP, no failover path',                              s: 0 },
          { t: 'Single ISP with manual failover (e.g. backup 4G/LTE)',       s: 1 },
          { t: 'Dual ISPs with automatic failover (active/standby)',         s: 2 },
          { t: 'Dual ISPs load-balanced active/active with BGP',             s: 3 },
        ]},
        { dim: 'resilience', q: 'What does a network outage cost the business, and how often does it happen?', a: [
          { t: 'Significant cost - multiple outages per year',               s: 0 },
          { t: 'Significant cost but outages are rare',                      s: 1 },
          { t: 'Tolerable cost, infrequent outages',                         s: 2 },
          { t: 'Negligible cost and no notable outages in recent memory',    s: 3 },
        ]},
        { dim: 'resilience', q: 'Where do your critical business applications live?', a: [
          { t: 'All on-prem on aging or end-of-life hardware',               s: 0 },
          { t: 'Mostly on-prem with a few SaaS apps',                        s: 1 },
          { t: 'Hybrid mix with cloud-first strategy underway',              s: 2 },
          { t: 'Cloud-native or fully migrated to cloud / SaaS',             s: 3 },
        ]},
        { dim: 'core', q: 'How do your employees connect to the network?', a: [
          { t: 'Open Wi-Fi or shared PSK, ad-hoc remote access',             s: 0 },
          { t: 'WPA2 PSK + basic remote-access VPN',                         s: 1 },
          { t: 'WPA2-Enterprise + managed VPN with MFA',                     s: 2 },
          { t: '802.1X / NAC for wired & wireless, zero-trust SASE remote',  s: 3 },
        ]},
        { dim: 'core', q: 'What is your current switching and routing infrastructure?', a: [
          { t: 'Aging mixed-vendor gear, much of it past end-of-life',       s: 0 },
          { t: 'Standardised but approaching end-of-life',                   s: 1 },
          { t: 'Current-generation gear, manual configuration',              s: 2 },
          { t: 'Modern Spine/Leaf with EVPN/VxLAN and automation',           s: 3 },
        ]},
        { dim: 'security', q: 'Do you have network segmentation in place?', a: [
          { t: 'Flat network - single VLAN for everything',                  s: 0 },
          { t: 'VLANs by department, no enforcement between them',           s: 1 },
          { t: 'VLANs with ACLs and firewall policy enforcement',            s: 2 },
          { t: 'Microsegmentation / zero-trust between workloads',           s: 3 },
        ]},
        { dim: 'core', q: 'How is your wireless network designed and managed?', a: [
          { t: 'Standalone APs, no central controller',                      s: 0 },
          { t: 'Controller-based but legacy Wi-Fi 5 or older',               s: 1 },
          { t: 'Wi-Fi 6, cloud-managed (Meraki / Mist / etc.)',              s: 2 },
          { t: 'Wi-Fi 6E with location services and AIOps analytics',        s: 3 },
        ]},
        { dim: 'ops', q: 'What network monitoring and management tools do you use?', a: [
          { t: 'None - reactive troubleshooting only',                       s: 0 },
          { t: 'Basic SNMP / ping monitors',                                 s: 1 },
          { t: 'Full monitoring suite (PRTG, SolarWinds, LogicMonitor)',     s: 2 },
          { t: 'Streaming telemetry + AIOps platform with auto-remediation', s: 3 },
        ]},
        { dim: 'ops', q: 'What are your growth plans over the next 1–3 years?', a: [
          { t: 'No formal plans documented',                                 s: 0 },
          { t: 'Modest growth - no infrastructure refresh planned',          s: 1 },
          { t: 'Significant growth with capacity planning underway',         s: 2 },
          { t: 'Major transformation (M&A, new sites, cloud migration)',     s: 3 },
        ]},
      ],
    },

    media: {
      id: 'media',
      name: 'Media & Broadcast Readiness',
      short: 'Media & broadcast',
      tagline: 'For broadcasters, post-production, sports venues, and live-event producers moving from SDI to IP-based workflows.',
      icon: 'M23 7l-7 5 7 5V7zM1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z',
      dimensions: [
        { key: 'fabric',   label: 'IP Media Fabric', short: 'IP Fabric' },
        { key: 'sync',     label: 'Timing & Synchronisation', short: 'Sync (PTP)' },
        { key: 'transport',label: 'Transport & QoS', short: 'Transport' },
        { key: 'workflow', label: 'Production Workflow', short: 'Workflow' },
        { key: 'ops',      label: 'Monitoring & Operations', short: 'Monitoring' },
      ],
      questions: [
        { dim: 'fabric', q: 'Where are you in your SDI → IP migration?', a: [
          { t: 'All SDI - no IP plans yet',                               s: 0 },
          { t: 'Evaluating IP - pilot underway',                          s: 1 },
          { t: 'Hybrid SDI + IP in production',                           s: 2 },
          { t: 'Full IP fabric, SDI fully decommissioned',                s: 3 },
        ]},
        { dim: 'fabric', q: 'ST 2110 / ST 2022-7 deployment posture?', a: [
          { t: 'Not deployed',                                            s: 0 },
          { t: 'ST 2110-20/30 in some flows',                             s: 1 },
          { t: 'ST 2110 + ST 2022-7 seamless protection',                 s: 2 },
          { t: 'Full ST 2110 suite with NMOS IS-04/05 control',           s: 3 },
        ]},
        { dim: 'fabric', q: 'Spine/Leaf fabric tuned for broadcast?', a: [
          { t: 'Generic enterprise switching',                            s: 0 },
          { t: 'Spine/Leaf but no IPFM tuning',                           s: 1 },
          { t: 'Arista / Cisco IPFM with non-blocking spine',             s: 2 },
          { t: 'Fully validated IPFM with multicast policy automation',   s: 3 },
        ]},
        { dim: 'sync', q: 'PTP (IEEE 1588) timing infrastructure?', a: [
          { t: 'No PTP - Genlock only',                                   s: 0 },
          { t: 'PTP deployed but not boundary-clock end-to-end',          s: 1 },
          { t: 'Boundary clocks throughout the fabric',                   s: 2 },
          { t: 'PTP + Genlock hybrid with redundant GMs and SMPTE 2059',  s: 3 },
        ]},
        { dim: 'sync', q: 'Redundancy / fallback for time sync failures?', a: [
          { t: 'Single GM, no fallback',                                  s: 0 },
          { t: 'Two GMs, manual failover',                                s: 1 },
          { t: 'Two GMs with automatic BMCA',                             s: 2 },
          { t: 'Geographically separated GMs + Genlock holdover',         s: 3 },
        ]},
        { dim: 'transport', q: 'Multicast routing design (PIM)?', a: [
          { t: 'No multicast / IGMP snooping only',                       s: 0 },
          { t: 'PIM-SM basic deployment',                                 s: 1 },
          { t: 'PIM-SSM tuned for media',                                 s: 2 },
          { t: 'Automated multicast with NMOS-driven flow management',    s: 3 },
        ]},
        { dim: 'transport', q: 'QoS engineering for real-time media flows?', a: [
          { t: 'No QoS - best effort',                                    s: 0 },
          { t: 'DSCP marking, no policing',                               s: 1 },
          { t: 'Strict priority queues for media',                        s: 2 },
          { t: 'End-to-end QoS validated under load',                     s: 3 },
        ]},
        { dim: 'workflow', q: 'REMI / remote production capability?', a: [
          { t: 'Not supported',                                           s: 0 },
          { t: 'Occasional REMI via custom rigs',                         s: 1 },
          { t: 'REMI workflows operational',                              s: 2 },
          { t: 'Standardised REMI with mezzanine compression',            s: 3 },
        ]},
        { dim: 'workflow', q: '4K / 8K capacity in the contribution network?', a: [
          { t: 'HD only',                                                 s: 0 },
          { t: '1080p / partial 4K paths',                                s: 1 },
          { t: '4K production-ready across plant',                        s: 2 },
          { t: '8K capable on the spine',                                 s: 3 },
        ]},
        { dim: 'workflow', q: 'Talkback / intercom / VoIP integration with IP fabric?', a: [
          { t: 'Separate analog intercom',                                s: 0 },
          { t: 'Digital intercom but isolated',                           s: 1 },
          { t: 'AES67 integrated with IP fabric',                         s: 2 },
          { t: 'Unified IP audio + intercom + VoIP, PTP-synced',          s: 3 },
        ]},
        { dim: 'ops', q: 'IP media monitoring and validation tooling?', a: [
          { t: 'No automated monitoring',                                 s: 0 },
          { t: 'Basic flow alarms',                                       s: 1 },
          { t: 'IP-aware monitoring (Providius / TAG / Bridgetech)',      s: 2 },
          { t: 'Full real-time validation + PTP drift dashboards',        s: 3 },
        ]},
        { dim: 'ops', q: 'Cutover and change-control discipline?', a: [
          { t: 'Ad-hoc, on-air interruptions are common',                 s: 0 },
          { t: 'Documented but limited test coverage',                    s: 1 },
          { t: 'Mature change control with shadow paths',                 s: 2 },
          { t: 'Zero-disruption cutover playbooks, validated regularly',  s: 3 },
        ]},
      ],
    },

    cloud: {
      id: 'cloud',
      name: 'Cloud Readiness',
      short: 'Cloud readiness',
      tagline: 'For teams planning, migrating, or modernising workloads across Azure, AWS, and Google Cloud.',
      icon: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z',
      dimensions: [
        { key: 'workloads',    label: 'Workload Strategy', short: 'Workloads' },
        { key: 'landingzone',  label: 'Landing Zone & IaC', short: 'Landing Zone' },
        { key: 'connectivity', label: 'Hybrid Connectivity', short: 'Connectivity' },
        { key: 'identity',     label: 'Identity & Zero Trust', short: 'Identity' },
        { key: 'finops',       label: 'FinOps & Compliance', short: 'FinOps' },
      ],
      questions: [
        { dim: 'workloads', q: 'What percentage of workloads run in public cloud today?', a: [
          { t: '0–10% - almost all on-prem',                              s: 0 },
          { t: '10–30% - beginning to migrate',                           s: 1 },
          { t: '30–70% - hybrid, well underway',                          s: 2 },
          { t: '70%+ - cloud-first',                                      s: 3 },
        ]},
        { dim: 'workloads', q: 'Cloud-native vs lift-and-shift mix?', a: [
          { t: 'All lift-and-shift IaaS',                                 s: 0 },
          { t: 'Mostly IaaS, some PaaS',                                  s: 1 },
          { t: 'Balanced PaaS and managed services',                      s: 2 },
          { t: 'Predominantly cloud-native (serverless / containers)',    s: 3 },
        ]},
        { dim: 'landingzone', q: 'Do you have a documented landing zone aligned with CAF / Well-Architected?', a: [
          { t: 'No - workloads deployed ad-hoc',                          s: 0 },
          { t: 'Started but incomplete',                                  s: 1 },
          { t: 'Aligned to CAF / Well-Architected Framework',             s: 2 },
          { t: 'CAF-aligned + automated guardrails',                      s: 3 },
        ]},
        { dim: 'landingzone', q: 'Infrastructure-as-Code adoption?', a: [
          { t: 'None - manual portal deployments',                        s: 0 },
          { t: 'Some Terraform / Bicep templates',                        s: 1 },
          { t: 'IaC for most deployments, no formal review',              s: 2 },
          { t: 'IaC with version control, peer review, and CI/CD',        s: 3 },
        ]},
        { dim: 'landingzone', q: 'Multi-account / subscription strategy?', a: [
          { t: 'Single account / subscription for everything',            s: 0 },
          { t: 'Two or three accounts, no formal hierarchy',              s: 1 },
          { t: 'Organisation structure (Org / Mgmt Group) with OUs',      s: 2 },
          { t: 'Full Control Tower / Mgmt Group hierarchy + SCPs',        s: 3 },
        ]},
        { dim: 'connectivity', q: 'Private connectivity to cloud (ExpressRoute / Direct Connect / Interconnect)?', a: [
          { t: 'Internet / VPN only',                                     s: 0 },
          { t: 'VPN with backup paths',                                   s: 1 },
          { t: 'Single ExpressRoute / Direct Connect circuit',            s: 2 },
          { t: 'Redundant private circuits with diverse providers',       s: 3 },
        ]},
        { dim: 'connectivity', q: 'SD-WAN / SASE for cloud egress?', a: [
          { t: 'No SD-WAN - direct internet breakout per site',           s: 0 },
          { t: 'SD-WAN considered, not deployed',                         s: 1 },
          { t: 'SD-WAN deployed with cloud onramps',                      s: 2 },
          { t: 'Full SASE with cloud-delivered security stack',           s: 3 },
        ]},
        { dim: 'identity', q: 'Cloud identity foundation?', a: [
          { t: 'Local accounts, no SSO',                                  s: 0 },
          { t: 'AD synced to cloud directory',                            s: 1 },
          { t: 'SSO + MFA enterprise-wide',                               s: 2 },
          { t: 'SSO + MFA + conditional access policies + PAM',           s: 3 },
        ]},
        { dim: 'identity', q: 'Zero-trust posture for cloud apps?', a: [
          { t: 'Perimeter-based VPN access',                              s: 0 },
          { t: 'Beginning ZTNA pilots',                                   s: 1 },
          { t: 'ZTNA for most internal apps',                             s: 2 },
          { t: 'Full zero-trust: identity, device, network, app',         s: 3 },
        ]},
        { dim: 'finops', q: 'Cost governance and tagging discipline?', a: [
          { t: 'No formal tagging - surprise bills',                      s: 0 },
          { t: 'Tagging in some accounts, no enforcement',                s: 1 },
          { t: 'Tag policies enforced, monthly cost reviews',             s: 2 },
          { t: 'Showback / chargeback + automated anomaly alerts',        s: 3 },
        ]},
        { dim: 'finops', q: 'Reserved capacity / Savings Plans / CUDs?', a: [
          { t: 'All on-demand pricing',                                   s: 0 },
          { t: 'Some reservations, no formal review',                     s: 1 },
          { t: 'Annual reservation planning aligned to forecast',         s: 2 },
          { t: 'Continuous optimisation with FinOps practice',            s: 3 },
        ]},
        { dim: 'finops', q: 'Regulatory compliance in cloud (SOC 2 / PCI / HIPAA / NIST)?', a: [
          { t: 'Not applicable / not formally aligned',                   s: 0 },
          { t: 'Partial alignment, no recent audit',                      s: 1 },
          { t: 'Aligned to a framework, internal audits',                 s: 2 },
          { t: 'Externally audited, attested annually',                   s: 3 },
        ]},
      ],
    },

  };

  function tierFor(pct) {
    if (pct >= 80) return { tier: 'Advanced',     desc: 'Modernised and well-operationalised.', tone: 'good' };
    if (pct >= 60) return { tier: 'Mature',       desc: 'Solid foundation with targeted gaps.', tone: 'good' };
    if (pct >= 40) return { tier: 'Developing',   desc: 'Functional today; modernisation needed.', tone: 'warn' };
    if (pct >= 20) return { tier: 'Foundational', desc: 'Significant gaps; risk to business agility.', tone: 'warn' };
    return            { tier: 'At-risk',     desc: 'Urgent modernisation recommended.', tone: 'bad' };
  }

  // --------------------------------------------------------------
  // State
  // --------------------------------------------------------------
  const state = {
    stage: 'intro',   // intro | quiz | capture | results
    track: 'datacentre',
    answers: [],
    current: 0,
    lead: { first: '', last: '', email: '', company: '', role: '' },
  };

  const shell = document.getElementById('ara-shell');

  function currentTrack() { return TRACKS[state.track]; }
  function totalQs() { return currentTrack().questions.length; }
  function maxScore() { return currentTrack().questions.reduce((s, q) => s + Math.max(...q.a.map(a => a.s)), 0); }

  // Honour URL ?track= param if present
  const urlTrack = new URL(location.href).searchParams.get('track');
  if (urlTrack && TRACKS[urlTrack]) state.track = urlTrack;

  // --------------------------------------------------------------
  // Rendering
  // --------------------------------------------------------------
  function render() {
    switch (state.stage) {
      case 'intro':    return renderIntro();
      case 'quiz':     return renderQuiz();
      case 'capture':  return renderCapture();
      case 'results':  return renderResults();
    }
  }

  function setStage(stage) {
    state.stage = stage;
    render();
    window.scrollTo({ top: shell.offsetTop - 100, behavior: 'smooth' });
  }

  function startTrack(trackId) {
    state.track = trackId;
    state.answers = new Array(totalQs()).fill(null);
    state.current = 0;
    setStage('quiz');
  }

  // --------------------------------------------------------------
  // Intro
  // --------------------------------------------------------------
  function renderIntro() {
    const t = currentTrack();
    shell.innerHTML = `
      <div class="ara-intro">
        <div class="ara-intro-grid">
          <div class="ara-intro-copy">
            <div class="ara-pip-row">
              <span class="ara-pip"></span>
              <span class="ara-pip-label">~5 minutes · 12 questions · free PDF report</span>
            </div>
            <h2>How modern is your infrastructure - really?</h2>
            <p>Choose the assessment that matches what you're working on. Same 12-question format our engineers use in discovery workshops. You'll see a maturity score, dimension breakdown, AI-generated executive summary, and three prioritised recommendations.</p>

            <label class="ara-track-select-label">Pick your assessment</label>
            <div class="ara-track-select-wrap">
              <select id="ara-track-select" class="ara-track-select">
                ${Object.values(TRACKS).map(tr => `
                  <option value="${tr.id}" ${tr.id === state.track ? 'selected' : ''}>${tr.name}</option>
                `).join('')}
              </select>
              <svg class="ara-track-select-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <p class="ara-track-tagline" id="ara-track-tagline">${t.tagline}</p>

            <button class="btn btn-primary ara-start">
              Start the assessment
              <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <div class="ara-fineprint">Lead capture happens at the end - answer first, see results before sharing details.</div>
          </div>
          <div class="ara-intro-side">
            <div class="ara-dim-list" id="ara-dim-list">
              ${renderDimList(t)}
            </div>
          </div>
        </div>
      </div>
    `;
    const sel = document.getElementById('ara-track-select');
    sel.addEventListener('change', () => {
      state.track = sel.value;
      const nt = currentTrack();
      document.getElementById('ara-track-tagline').textContent = nt.tagline;
      document.getElementById('ara-dim-list').innerHTML = renderDimList(nt);
    });
    shell.querySelector('.ara-start').addEventListener('click', () => startTrack(state.track));
  }

  function renderDimList(t) {
    return `
      <div class="ara-dim-list-head">${t.name}</div>
      ${t.dimensions.map(d => `
        <div class="ara-dim-item">
          <span class="ara-dim-dot"></span>
          <div>
            <div class="ara-dim-name">${d.label}</div>
            <div class="ara-dim-questions">${t.questions.filter(q => q.dim === d.key).length} questions</div>
          </div>
        </div>
      `).join('')}
    `;
  }

  // --------------------------------------------------------------
  // Quiz
  // --------------------------------------------------------------
  function renderQuiz() {
    const t = currentTrack();
    const TOTAL = totalQs();
    const q = t.questions[state.current];
    const dim = t.dimensions.find(d => d.key === q.dim);
    const pct = ((state.current) / TOTAL * 100).toFixed(1);
    const chosen = state.answers[state.current];

    shell.innerHTML = `
      <div class="ara-quiz">
        <div class="ara-progress">
          <div class="ara-progress-meta">
            <span class="ara-progress-label">${t.short} · Question ${state.current + 1} of ${TOTAL}</span>
            <span class="ara-progress-dim">${dim.label}</span>
          </div>
          <div class="ara-progress-bar"><div class="ara-progress-fill" style="width: ${pct}%"></div></div>
        </div>

        <div class="ara-q-card">
          <h2 class="ara-q">${q.q}</h2>
          <div class="ara-options">
            ${q.a.map((a, i) => `
              <button class="ara-option ${chosen === i ? 'active' : ''}" data-i="${i}">
                <span class="ara-option-marker">${String.fromCharCode(65 + i)}</span>
                <span class="ara-option-text">${a.t}</span>
              </button>
            `).join('')}
          </div>
          <div class="ara-q-nav">
            <button class="btn btn-ghost ara-back" ${state.current === 0 ? 'disabled' : ''}>← Back</button>
            <button class="btn btn-primary ara-next" ${chosen === null ? 'disabled' : ''}>
              ${state.current === TOTAL - 1 ? 'See results' : 'Next'}
              <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    shell.querySelectorAll('.ara-option').forEach(btn => {
      btn.addEventListener('click', () => {
        state.answers[state.current] = parseInt(btn.dataset.i, 10);
        renderQuiz();
      });
    });
    shell.querySelector('.ara-back').addEventListener('click', () => {
      if (state.current === 0) return;
      state.current--;
      renderQuiz();
    });
    shell.querySelector('.ara-next').addEventListener('click', () => {
      if (state.answers[state.current] === null) return;
      if (state.current === totalQs() - 1) {
        setStage('capture');
      } else {
        state.current++;
        renderQuiz();
      }
    });
  }

  // --------------------------------------------------------------
  // Lead capture
  // --------------------------------------------------------------
  function renderCapture() {
    const score = computeScores();
    shell.innerHTML = `
      <div class="ara-capture">
        <div class="ara-capture-grid">
          <div class="ara-capture-side">
            <div class="ara-mini-score">
              <div class="ara-mini-score-num">${score.overall}<span>/100</span></div>
              <div class="ara-mini-score-label">${currentTrack().short} score is ready</div>
            </div>
            <p>We use the email below only to send your personalised PDF report and (occasionally) follow up with one short note. No newsletter. No spam. Unsubscribe any time.</p>
          </div>
          <form class="ara-capture-form" id="ara-form" novalidate>
            <h2>Where should we send the report?</h2>
            <div class="form-row">
              <div class="form-field">
                <label for="ara-first">First name</label>
                <input id="ara-first" name="first" type="text" required autocomplete="given-name" />
              </div>
              <div class="form-field">
                <label for="ara-last">Last name</label>
                <input id="ara-last" name="last" type="text" required autocomplete="family-name" />
              </div>
            </div>
            <div class="form-field">
              <label for="ara-email">Work email</label>
              <input id="ara-email" name="email" type="email" required autocomplete="email" />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="ara-company">Company</label>
                <input id="ara-company" name="company" type="text" required autocomplete="organization" />
              </div>
              <div class="form-field">
                <label for="ara-role">Role</label>
                <input id="ara-role" name="role" type="text" placeholder="e.g. Director of IT" autocomplete="organization-title" />
              </div>
            </div>
            <!-- Honeypot for bots; humans never see this -->
            <input type="text" name="website" tabindex="-1" autocomplete="off"
                   aria-hidden="true"
                   style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;" />
            <div class="form-submit-row" style="margin-top: 16px;">
              <button type="submit" class="btn btn-primary ara-submit">
                <span class="ara-submit-label">Generate my report</span>
                <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
            <div class="ara-form-error" id="ara-form-error" role="alert" aria-live="polite"
                 style="display:none; margin-top:12px; color:#b54708; font-size:13px;"></div>
          </form>
        </div>
      </div>
    `;
    const form    = shell.querySelector('#ara-form');
    const submit  = shell.querySelector('.ara-submit');
    const submitL = shell.querySelector('.ara-submit-label');
    const errEl   = shell.querySelector('#ara-form-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      state.lead = {
        first:   form.first.value.trim(),
        last:    form.last.value.trim(),
        email:   form.email.value.trim(),
        company: form.company.value.trim(),
        role:    form.role.value.trim(),
      };

      // Build the payload the backend logs + emails. Score is recomputed
      // here so the server can include it in the email to info@.
      const t        = currentTrack();
      const score    = computeScores();
      const tierInfo = tierFor(score.overall);
      const payload  = {
        ...state.lead,
        website:   form.website ? form.website.value : '', // honeypot
        track_id:  t.id,
        track:     t.name,
        overall:   score.overall,
        tier:      tierInfo.tier,
        dimensions: score.perDim.map(d => ({
          key:   d.key,
          label: d.label,
          score: d.score,
          max:   d.max,
          pct:   d.pct,
        })),
      };

      // UI: lock the button while we POST
      submit.disabled = true;
      const originalLabel = submitL.textContent;
      submitL.textContent = 'Sending…';
      errEl.style.display = 'none';
      errEl.textContent = '';

      try {
        const res = await fetch('submit-assessment.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        let json = null;
        try { json = await res.json(); } catch (_) { /* tolerate non-JSON */ }

        if (!res.ok || !json || json.ok !== true) {
          // 400 with field errors -> show inline
          if (json && json.errors) {
            const first = Object.values(json.errors)[0];
            throw new Error(first || 'Please check the form and try again.');
          }
          throw new Error('Something went wrong sending the report. Please try again.');
        }

        // Success - reveal the results stage.
        if (typeof gtag === 'function') {
          gtag('event', 'assessment_complete', {
            track: payload.track,
            track_id: payload.track_id,
            overall_score: payload.overall,
            tier: payload.tier
          });
        }
        setStage('results');
      } catch (err) {
        console.error('Assessment submit failed', err);
        errEl.textContent = err.message || 'Could not send the report. Please try again.';
        errEl.style.display = 'block';
        submit.disabled = false;
        submitL.textContent = originalLabel;
      }
    });
  }

  // --------------------------------------------------------------
  // Scoring
  // --------------------------------------------------------------
  function computeScores() {
    const t = currentTrack();
    const perDim = {};
    t.dimensions.forEach(d => { perDim[d.key] = { score: 0, max: 0 }; });

    t.questions.forEach((q, i) => {
      const chosen = state.answers[i];
      const s = chosen === null ? 0 : q.a[chosen].s;
      perDim[q.dim].score += s;
      perDim[q.dim].max   += Math.max(...q.a.map(a => a.s));
    });

    const total = Object.values(perDim).reduce((a, d) => a + d.score, 0);
    const overall = Math.round((total / maxScore()) * 100);

    return {
      overall,
      perDim: t.dimensions.map(d => ({
        ...d,
        score: perDim[d.key].score,
        max:   perDim[d.key].max,
        pct:   Math.round((perDim[d.key].score / perDim[d.key].max) * 100),
      })),
    };
  }

  // --------------------------------------------------------------
  // Results
  // --------------------------------------------------------------
  function renderResults() {
    const t = currentTrack();
    const score = computeScores();
    const tier  = tierFor(score.overall);

    shell.innerHTML = `
      <div class="ara-results" id="ara-results">
        <header class="ara-results-head">
          <div class="ara-results-head-l">
            <div class="eyebrow">${t.name} · Report</div>
            <h2>${state.lead.first ? `Hi ${state.lead.first} -` : ''} here's where you stand.</h2>
            ${state.lead.company ? `<div class="ara-results-meta">${state.lead.company}${state.lead.role ? ' · ' + state.lead.role : ''}</div>` : ''}
          </div>
          <div class="ara-results-head-r">
            <button class="btn btn-ghost ara-print">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Download PDF
            </button>
            <a href="contact.html?ref=${t.id}" class="btn btn-primary">
              Discuss with an engineer
              <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        </header>

        <div class="ara-results-grid">
          <div class="ara-gauge-card">
            <div class="ara-gauge">
              <svg viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r="84" fill="none" stroke="var(--border)" stroke-width="14"/>
                <circle cx="100" cy="100" r="84" fill="none" stroke="var(--accent)" stroke-width="14"
                        stroke-linecap="round"
                        stroke-dasharray="${(score.overall / 100 * 527.78).toFixed(1)} 527.78"
                        transform="rotate(-90 100 100)"/>
              </svg>
              <div class="ara-gauge-center">
                <div class="ara-gauge-num">${score.overall}<span>/100</span></div>
                <div class="ara-gauge-tier ara-tier-${tier.tone}">${tier.tier}</div>
              </div>
            </div>
            <p class="ara-gauge-desc">${tier.desc}</p>
          </div>

          <div class="ara-dims-card">
            <h3>By dimension</h3>
            <div class="ara-dims">
              ${score.perDim.map(d => `
                <div class="ara-dim-row">
                  <div class="ara-dim-row-head">
                    <span class="ara-dim-row-label">${d.label}</span>
                    <span class="ara-dim-row-score">${d.score}/${d.max} · ${d.pct}%</span>
                  </div>
                  <div class="ara-dim-bar">
                    <div class="ara-dim-bar-fill ara-tier-${tierFor(d.pct).tone}" style="width: ${d.pct}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="ara-ai-card">
          <div class="ara-ai-head">
            <span class="ara-ai-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              AI ANALYSIS
            </span>
            <span class="ara-ai-status" id="ara-ai-status">Generating…</span>
          </div>
          <div id="ara-ai-body">
            <div class="ara-ai-skeleton">
              <div class="ara-skel-line"></div>
              <div class="ara-skel-line"></div>
              <div class="ara-skel-line short"></div>
            </div>
          </div>
        </div>

        <div class="ara-priorities-card">
          <h3>Recommended priorities</h3>
          <div id="ara-priorities-body">
            <div class="ara-ai-skeleton">
              <div class="ara-skel-line"></div>
              <div class="ara-skel-line short"></div>
            </div>
          </div>
        </div>

        <div class="ara-cta-row">
          <div>
            <div class="eyebrow">Next step</div>
            <h3>Want a real engineer to walk through this?</h3>
            <p>30-minute call. No pitch. We'll tell you where we'd start and what it would take.</p>
          </div>
          <div class="ara-cta-actions">
            <a href="contact.html?ref=${t.id}" class="btn btn-primary">Book a call</a>
            <a href="assessment.html" class="btn btn-ghost">Try another assessment</a>
          </div>
        </div>
      </div>
    `;

    shell.querySelector('.ara-print').addEventListener('click', () => window.print());
    runAI(score);
  }

  // --------------------------------------------------------------
  // AI personalised summary + priorities
  // --------------------------------------------------------------
  async function runAI(score) {
    const t = currentTrack();
    const statusEl = document.getElementById('ara-ai-status');
    const bodyEl   = document.getElementById('ara-ai-body');
    const priosEl  = document.getElementById('ara-priorities-body');

    const answersDump = t.questions.map((q, i) => {
      const a = state.answers[i];
      if (a === null) return null;
      return `- ${q.q}\n  Answer: ${q.a[a].t} (score ${q.a[a].s}/3)`;
    }).filter(Boolean).join('\n');

    const dimsDump = score.perDim.map(d => `- ${d.label}: ${d.pct}% (${d.score}/${d.max})`).join('\n');

    const prompt = `You are a senior infrastructure consultant at Aspire IT Systems writing a personalised executive summary for a client who just completed our "${t.name}" assessment.

ASSESSMENT FOCUS: ${t.name} - ${t.tagline}

CLIENT CONTEXT:
- Name: ${state.lead.first || '(anonymous)'} ${state.lead.last || ''}
- Company: ${state.lead.company || '(unspecified)'}
- Role: ${state.lead.role || '(unspecified)'}

OVERALL SCORE: ${score.overall}/100 (${tierFor(score.overall).tier})

DIMENSION BREAKDOWN:
${dimsDump}

THEIR ANSWERS:
${answersDump}

TASK:
Respond with valid JSON only, no other text, in this exact shape:
{
  "summary": "Two short paragraphs (3-4 sentences each). Acknowledge what they're doing well, then highlight the most important gaps. Tone: warm, direct, technically credible. Specific to their answers and the assessment focus - name the technologies and dimensions. NO marketing fluff.",
  "priorities": [
    { "title": "Short title (5-8 words)", "rationale": "1-2 sentences explaining why this matters and the rough scope of work", "horizon": "Next 90 days / Next 6 months / Next 12 months" },
    { "title": "...", "rationale": "...", "horizon": "..." },
    { "title": "...", "rationale": "...", "horizon": "..." }
  ]
}

Exactly 3 priorities. Order them by impact / urgency. Reference the specific weak dimensions from the assessment.`;

    try {
      const raw = await window.claude.complete(prompt);
      const parsed = parseJSON(raw);
      if (!parsed || !parsed.summary || !parsed.priorities) throw new Error('parse');

      statusEl.textContent = 'Personalised for you';
      statusEl.classList.add('ok');

      bodyEl.innerHTML = parsed.summary
        .split(/\n\n+/)
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('');

      priosEl.innerHTML = parsed.priorities.map((p, i) => `
        <div class="ara-priority">
          <div class="ara-priority-num">${String(i + 1).padStart(2, '0')}</div>
          <div class="ara-priority-body">
            <div class="ara-priority-head">
              <h4>${escapeHtml(p.title)}</h4>
              <span class="ara-priority-horizon">${escapeHtml(p.horizon || '')}</span>
            </div>
            <p>${escapeHtml(p.rationale)}</p>
          </div>
        </div>
      `).join('');

    } catch (err) {
      console.error('AI generation failed', err);
      statusEl.textContent = 'AI unavailable - see baseline';
      statusEl.classList.add('warn');
      renderFallback(score, bodyEl, priosEl);
    }
  }

  function parseJSON(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) {}
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
    return null;
  }

  function renderFallback(score, bodyEl, priosEl) {
    const overall = score.overall;
    const weak = [...score.perDim].sort((a, b) => a.pct - b.pct).slice(0, 3);
    bodyEl.innerHTML = `
      <p>Your overall maturity score is <b>${overall}/100</b> - <b>${tierFor(overall).tier}</b>. ${tierFor(overall).desc}</p>
      <p>Strongest area: <b>${[...score.perDim].sort((a,b) => b.pct - a.pct)[0].label}</b>. Weakest area: <b>${weak[0].label}</b>. Focus there first.</p>
    `;
    priosEl.innerHTML = weak.map((d, i) => `
      <div class="ara-priority">
        <div class="ara-priority-num">${String(i+1).padStart(2,'0')}</div>
        <div class="ara-priority-body">
          <div class="ara-priority-head">
            <h4>Modernise ${d.short}</h4>
            <span class="ara-priority-horizon">Next ${i === 0 ? '90 days' : i === 1 ? '6 months' : '12 months'}</span>
          </div>
          <p>Your ${d.label} score is ${d.pct}%. A focused engagement here will have the largest impact on your overall posture.</p>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  // --------------------------------------------------------------
  // Boot
  // --------------------------------------------------------------
  render();
})();
