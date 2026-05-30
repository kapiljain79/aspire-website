/* ============================================================
   Shared nav + footer partials
   Injected into <header id="nav-mount"></header> and <div id="footer-mount"></div>
   ============================================================ */

(() => {
  const EMAIL_DISPLAY = 'info@aspireitsystems.io';
  const EMAIL = 'info@aspireitsystems.io';
  const LINKEDIN = 'https://linkedin.com/company/aspire-it-systems';

  const navHTML = `
    <div class="event-marquee" id="event-marquee" role="banner">
      <a href="contact.html?ref=infocomm" class="event-marquee-track" aria-label="June 17-19 - we'd love to connect with you">
        <span class="event-marquee-item"><span class="event-pip"></span><b>InfoComm 2026 June 17–19</b> · We'd love to connect with you · <span class="event-cta">Book a meeting</span></span>
        <span class="event-marquee-item" aria-hidden="true"><span class="event-pip"></span><b>InfoComm 2026 June 17–19</b> · We'd love to connect with you · <span class="event-cta">Book a meeting</span></span>
        <span class="event-marquee-item" aria-hidden="true"><span class="event-pip"></span><b>InfoComm 2026 June 17–19</b> · We'd love to connect with you · <span class="event-cta">Book a meeting</span></span>
        <span class="event-marquee-item" aria-hidden="true"><span class="event-pip"></span><b>InfoComm 2026 June 17–19</b> · We'd love to connect with you · <span class="event-cta">Book a meeting</span></span>
      </a>
      <button class="event-marquee-close" id="event-marquee-close" aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <nav class="nav" id="nav">
      <div class="container nav-inner">
        <a href="index.html" class="brand" aria-label="Aspire IT Systems">
          <img src="logo-mark.png?v=3" alt="" class="brand-mark-img" />
          <span class="brand-wordmark">Aspire <span class="brand-wordmark-sub">IT Systems</span></span>
        </a>
        <ul class="nav-links">
          <li><a href="index.html" data-page="index">Home</a></li>
          <li class="nav-dropdown">
            <a href="services.html" data-page="services" class="nav-dropdown-trigger" aria-haspopup="menu" aria-expanded="false">
              Services
              <svg class="nav-dropdown-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </a>
            <div class="nav-dropdown-menu" role="menu">
              <a href="network-architecture.html" role="menuitem" class="nav-dropdown-item">
                <span class="nav-dropdown-item-title">Network &amp; Security Architecture</span>
                <span class="nav-dropdown-item-desc">Spine/Leaf, EVPN VXLAN, zero trust</span>
              </a>
              <a href="cloud-migration.html" role="menuitem" class="nav-dropdown-item">
                <span class="nav-dropdown-item-title">Cloud Solutions &amp; Migration</span>
                <span class="nav-dropdown-item-desc">Azure CAF, AVS, HCX, AWS, GCP</span>
              </a>
              <a href="network-security-sase.html" role="menuitem" class="nav-dropdown-item">
                <span class="nav-dropdown-item-title">Network Security &amp; SASE</span>
                <span class="nav-dropdown-item-desc">Cisco ISE, Palo Alto, Fortinet, ZTNA</span>
              </a>
              <a href="wireless-collaboration.html" role="menuitem" class="nav-dropdown-item">
                <span class="nav-dropdown-item-title">Wireless &amp; Collaboration</span>
                <span class="nav-dropdown-item-desc">Wi-Fi 6E, CUCM, Webex, Teams Phone</span>
              </a>
              <a href="managed-services.html" role="menuitem" class="nav-dropdown-item">
                <span class="nav-dropdown-item-title">Managed Services</span>
                <span class="nav-dropdown-item-desc">24/7 monitoring, SLA-backed response</span>
              </a>
              <a href="media-broadcast.html" role="menuitem" class="nav-dropdown-item">
                <span class="nav-dropdown-item-title">Media &amp; Broadcast</span>
                <span class="nav-dropdown-item-desc">ST 2110, SDI to IP, broadcast IP fabric</span>
              </a>
              <a href="project-management.html" role="menuitem" class="nav-dropdown-item">
                <span class="nav-dropdown-item-title">Project Management</span>
                <span class="nav-dropdown-item-desc">Discovery to handover, hypercare</span>
              </a>
              <a href="services.html" class="nav-dropdown-all">View all services <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </div>
          </li>
          <li><a href="case-studies.html" data-page="case-studies">Case Studies</a></li>
          <li><a href="partners.html" data-page="partners">Partners</a></li>
          <li><a href="blog.html" data-page="blog">Blog</a></li>
          <li><a href="about.html" data-page="about">About</a></li>
          <li><a href="contact.html" data-page="contact">Contact</a></li>
          <li class="mobile-only">
            <div class="mobile-assess-section">
              <div class="mobile-assess-label">Free Infrastructure Health Check</div>
              <a href="assessment.html?track=datacentre" class="mobile-assess-link">
                <span class="mobile-assess-title">Data Centre Readiness</span>
                <span class="mobile-assess-desc">Multi-site connectivity, segmentation, monitoring</span>
              </a>
              <a href="assessment.html?track=media" class="mobile-assess-link">
                <span class="mobile-assess-title">Media &amp; Broadcast Readiness</span>
                <span class="mobile-assess-desc">ST 2110, PTP, multicast, REMI workflows</span>
              </a>
              <a href="assessment.html?track=cloud" class="mobile-assess-link">
                <span class="mobile-assess-title">Cloud Readiness</span>
                <span class="mobile-assess-desc">Landing zone, IaC, identity, FinOps</span>
              </a>
            </div>
          </li>
        </ul>
        <div class="nav-actions">
          <a href="${LINKEDIN}" target="_blank" rel="noopener" class="nav-icon-link" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
          <div class="nav-cta-group">
            <a href="assessment.html" class="btn btn-primary nav-cta-trigger" aria-haspopup="menu" aria-expanded="false">
              Free Infrastructure Health Check
              <svg class="nav-cta-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </a>
            <div class="nav-cta-menu" role="menu">
              <a href="assessment.html?track=datacentre" role="menuitem" class="nav-cta-item">
                <span class="nav-cta-item-title">Data Centre Readiness</span>
                <span class="nav-cta-item-desc">Multi-site connectivity, segmentation, monitoring</span>
              </a>
              <a href="assessment.html?track=media" role="menuitem" class="nav-cta-item">
                <span class="nav-cta-item-title">Media &amp; Broadcast Readiness</span>
                <span class="nav-cta-item-desc">ST 2110, PTP, multicast, REMI workflows</span>
              </a>
              <a href="assessment.html?track=cloud" role="menuitem" class="nav-cta-item">
                <span class="nav-cta-item-title">Cloud Readiness</span>
                <span class="nav-cta-item-desc">Landing zone, IaC, identity, FinOps</span>
              </a>
            </div>
          </div>
          <button class="menu-toggle" aria-label="Menu"><span></span></button>
        </div>
      </div>
    </nav>
  `;

  const footerHTML = `
    <footer>
      <div class="container">
        <div class="footer-inner">
          <div class="footer-col footer-brand">
            <a href="index.html" class="brand">
              <img src="logo-mark.png?v=3" alt="" class="brand-mark-img" />
              <span class="brand-wordmark">Aspire <span class="brand-wordmark-sub">IT Systems</span></span>
            </a>
            <p>Engineering the networks and clouds that power North American business.</p>
          </div>
          <div class="footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="services.html#network">Network &amp; Security</a></li>
              <li><a href="services.html#cloud">Cloud Solutions</a></li>
              <li><a href="services.html#wireless">Wireless &amp; VoIP</a></li>
              <li><a href="services.html#managed">Managed Services</a></li>
              <li><a href="services.html#compliance">Network Security &amp; SASE</a></li>
            <li><a href="services.html#media">Media &amp; Broadcast</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="about.html">About</a></li>
              <li><a href="case-studies.html">Case Studies</a></li>
              <li><a href="partners.html">Partners</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Connect</h4>
            <ul>
              <li class="footer-address">
                <span class="footer-address-label">US Office</span>
                4310 Regency Drive<br/>
                Suite 100-1<br/>
                High Point, NC 27265
              </li>
              <li><a href="mailto:${EMAIL}">${EMAIL_DISPLAY}</a></li>
              <li><a href="${LINKEDIN}" target="_blank" rel="noopener" class="footer-linkedin-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Aspire IT Systems - aspireitsystems.io</span>
        </div>
      </div>
    </footer>
  `;

  /* ----- Inject ----- */
  const navMount = document.getElementById('nav-mount');
  if (navMount) navMount.innerHTML = navHTML;

  const footerMount = document.getElementById('footer-mount');
  if (footerMount) footerMount.innerHTML = footerHTML;

  /* ----- Active page highlight ----- */
  const path = location.pathname.split('/').pop().replace('.html', '') || 'index';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === path) a.classList.add('active');
  });


  /* ----- Nav CTA dropdown: tap-toggle for touch devices ----- */
  // nav-cta-tap-toggle
  const ctaGroup = document.querySelector('.nav-cta-group');
  if (ctaGroup) {
    const trigger = ctaGroup.querySelector('.nav-cta-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        // Only intercept on touch / small screens
        if (window.matchMedia('(hover: none)').matches || window.innerWidth < 880) {
          const isOpen = ctaGroup.classList.contains('open');
          if (!isOpen) {
            e.preventDefault();
            ctaGroup.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
          // Second tap follows the link
        }
      });
      document.addEventListener('click', (e) => {
        if (!ctaGroup.contains(e.target)) {
          ctaGroup.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ----- Services dropdown: tap-toggle for touch devices ----- */
  const servicesDropdown = document.querySelector('.nav-dropdown');
  if (servicesDropdown) {
    const trigger = servicesDropdown.querySelector('.nav-dropdown-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        // On touch / small screens, first tap opens; second tap follows link
        if (window.matchMedia('(hover: none)').matches || window.innerWidth < 880) {
          const isOpen = servicesDropdown.classList.contains('open');
          if (!isOpen) {
            e.preventDefault();
            servicesDropdown.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        }
      });
      document.addEventListener('click', (e) => {
        if (!servicesDropdown.contains(e.target)) {
          servicesDropdown.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ----- Mobile menu ----- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navEl = document.getElementById('nav');
  if (menuToggle && navEl) {
    const setMobileOpen = (isOpen) => {
      navEl.classList.toggle('mobile-open', isOpen);
      document.body.classList.toggle('has-mobile-menu', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setMobileOpen(!navEl.classList.contains('mobile-open'));
    });
    // Close menu when clicking a link
    navEl.querySelectorAll('.nav-links a, .nav-cta-menu a, .nav-actions a:not(.nav-icon-link)').forEach(a => {
      a.addEventListener('click', () => setMobileOpen(false));
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navEl.contains(e.target) && navEl.classList.contains('mobile-open')) {
        setMobileOpen(false);
      }
    });
    // Close on Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navEl.classList.contains('mobile-open')) {
        setMobileOpen(false);
      }
    });
  }

  /* ----- Event marquee dismiss + persistence ----- */
  const marquee = document.getElementById('event-marquee');
  if (marquee) {
    if (localStorage.getItem('infocomm-dismissed') === '1') {
      marquee.style.display = 'none';
      document.body.classList.remove('has-event-marquee');
    } else {
      document.body.classList.add('has-event-marquee');
    }
    const close = document.getElementById('event-marquee-close');
    if (close) close.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      localStorage.setItem('infocomm-dismissed', '1');
      marquee.style.transition = 'transform 0.3s ease, opacity 0.3s ease, height 0.3s ease, margin 0.3s ease';
      marquee.style.transform = 'translateY(-100%)';
      marquee.style.opacity = '0';
      document.body.classList.remove('has-event-marquee');
      setTimeout(() => marquee.style.display = 'none', 300);
    });
  }
})();
