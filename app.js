/* ============================================================
   Aspire IT Systems - interactions
   ============================================================ */

(() => {
  /* ------ Tweaks state ------ */
  const tweaks = { ...(window.TWEAK_DEFAULTS || {
    accent: '#2BB3B3',
    accent2: '#3FCFCF',
    background: 'navy',
    pattern: 'grid',
  })};

  const root = document.documentElement;

  const hexToRgba = (hex, a) => {
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  function applyTweaks() {
    root.style.setProperty('--accent', tweaks.accent);
    root.style.setProperty('--accent-2', tweaks.accent2);
    root.style.setProperty('--accent-soft', hexToRgba(tweaks.accent, 0.12));
    root.style.setProperty('--accent-glow', hexToRgba(tweaks.accent, 0.35));

    const bgPresets = {
      navy:     { bg:'#0B1A2E', elev:'#112740', card:'#163152', border:'#1F3A55', borderStrong:'#2D4A6B' },
      black:    { bg:'#050505', elev:'#0d0d0d', card:'#141414', border:'#1f1f1f', borderStrong:'#2e2e2e' },
      charcoal: { bg:'#0a0b10', elev:'#13151c', card:'#181b25', border:'#23262f', borderStrong:'#343847' },
    };
    const p = bgPresets[tweaks.background] || bgPresets.navy;
    root.style.setProperty('--bg', p.bg);
    root.style.setProperty('--bg-elev', p.elev);
    root.style.setProperty('--bg-card', p.card);
    root.style.setProperty('--border', p.border);
    root.style.setProperty('--border-strong', p.borderStrong);

    const grid = document.querySelector('.hero-grid');
    const dots = document.querySelector('.hero-dots');
    if (grid && dots) {
      if (tweaks.pattern === 'grid') {
        grid.style.display = '';
        dots.style.display = '';
      } else if (tweaks.pattern === 'dots') {
        grid.style.display = 'none';
        dots.style.display = '';
      } else {
        grid.style.display = 'none';
        dots.style.display = 'none';
      }
    }
  }

  applyTweaks();

  function persist(partial) {
    Object.assign(tweaks, partial);
    applyTweaks();
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: partial }, '*');
    } catch (e) {}
  }

  /* ------ Tweaks panel wiring (only if panel exists on this page) ------ */
  const tweaksEl = document.getElementById('tweaks');
  if (tweaksEl) {
    const closeBtn = document.getElementById('tweaks-close');

    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || !d.type) return;
      if (d.type === '__activate_edit_mode') tweaksEl.classList.add('open');
      if (d.type === '__deactivate_edit_mode') tweaksEl.classList.remove('open');
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

    if (closeBtn) closeBtn.addEventListener('click', () => {
      tweaksEl.classList.remove('open');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });

    document.querySelectorAll('#accent-swatches .swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        document.querySelectorAll('#accent-swatches .swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        persist({ accent: sw.dataset.accent, accent2: sw.dataset.accent2 });
      });
      if (sw.dataset.accent === tweaks.accent) {
        document.querySelectorAll('#accent-swatches .swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
      }
    });

    document.querySelectorAll('#bg-toggles .toggle-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#bg-toggles .toggle-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        persist({ background: btn.dataset.bg });
      });
      if (btn.dataset.bg === tweaks.background) {
        document.querySelectorAll('#bg-toggles .toggle-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });

    document.querySelectorAll('#pattern-toggles .toggle-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#pattern-toggles .toggle-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        persist({ pattern: btn.dataset.pattern });
      });
      if (btn.dataset.pattern === tweaks.pattern) {
        document.querySelectorAll('#pattern-toggles .toggle-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  }

  /* ------ Sticky nav scroll state ------ */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 24) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------ Case study tabs ------ */
  document.querySelectorAll('.case-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = tab.dataset.tab;
      document.querySelectorAll('.case-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.case-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`.case-panel[data-panel="${idx}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ------ Animated counters on stats ------ */
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const animateCount = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseInt(el.dataset.count, 10);
    const valSpan = el.querySelector('.val');
    if (!valSpan) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      valSpan.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (e.target.matches('.stat-num[data-count]')) animateCount(e.target);
        if (e.target.classList.contains('fade-in')) e.target.classList.add('in');
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => io.observe(c));
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  /* ------ Smooth scroll for nav anchors ------ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
