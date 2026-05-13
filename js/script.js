/* ============================================
   ZERO-WASTE FASHION — MASTER SCRIPT
   ============================================ */

'use strict';

/* ---------- PAGE LOADER ---------- */
(function initLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  const numEl = loader.querySelector('.loader-num');
  let count = 0;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 12) + 3;
    if (count >= 100) { count = 100; clearInterval(interval); }
    if (numEl) numEl.textContent = count + '%';
  }, 60);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('done');
      loader.addEventListener('animationend', () => loader.remove(), { once: true });
    }, 600);
  });
})();

/* ---------- CUSTOM CURSOR ---------- */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animCursor() {
    // Use transform: translate for GPU-composited movement (no layout recalc)
    dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;

    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;

    requestAnimationFrame(animCursor);
  }
  animCursor();

  document.querySelectorAll('a, button, .garment-card, .story-item, .featured-item, .step-card, .value-item')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();

/* ---------- NAVBAR + PROGRESS BAR (single batched scroll handler) ---------- */
(function initScrollUI() {
  const nav = document.querySelector('.navbar');

  // Progress bar
  const bar = document.createElement('div');
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:2px;width:0;
    background:var(--red);z-index:99999;
    will-change:width;pointer-events:none;
  `;
  document.body.appendChild(bar);

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (nav) nav.classList.toggle('scrolled', y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0) bar.style.width = (y / max * 100) + '%';
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile toggle
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.querySelector('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobile.classList.toggle('open');
      document.body.style.overflow = mobile.classList.contains('open') ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ---------- SCROLL REVEAL ---------- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ---------- FEATURED CARDS REVEAL ---------- */
(function initFeaturedReveal() {
  const cards = document.querySelectorAll('.featured-item');
  if (!cards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach(c => obs.observe(c));
})();

/* ---------- PROCESS STEP ACTIVE STATE ---------- */
(function initProcessSteps() {
  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      e.target.classList.toggle('active', e.isIntersecting);
    });
  }, { threshold: 0.35 });

  steps.forEach(s => obs.observe(s));
})();

/* ---------- GARMENTS FILTER ---------- */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.garment-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        if (show) {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
          card.style.pointerEvents = 'auto';
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          card.style.pointerEvents = 'none';
        }
      });
    });
  });
})();

/* ---------- CONTACT FORM — FormSubmit AJAX ---------- */
(function initForm() {
  const form    = document.querySelector('.contact-form');
  const success = document.querySelector('.form-success');
  if (!form) return;

  const TO = form.dataset.email || 'gopikaajith1908@gmail.com';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + TO;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const fname   = (form.querySelector('#fname')   || {}).value || '';
    const lname   = (form.querySelector('#lname')   || {}).value || '';
    const email   = (form.querySelector('#email')   || {}).value || '';
    const subject = (form.querySelector('#subject') || {}).value || 'General Enquiry';
    const message = (form.querySelector('#message') || {}).value || '';

    if (!fname.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in all required fields.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span>Sending...</span>'; }

    const payload = {
      name:    (fname + ' ' + lname).trim(),
      email:   email,
      subject: 'MOUNAM —' + subject,
      message: message,
      _subject: 'MOUNAM — New Message from' + fname,
      _captcha: 'false',
      _template: 'table'
    };

    fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success === 'true' || data.success === true) {
        form.style.display = 'none';
        if (success) success.classList.add('show');
        showToast('Message sent to gopikaajith1908@gmail.com!');
      } else {
        throw new Error('FormSubmit error');
      }
    })
    .catch(function() {
      showToast('Check gopikaajith1908@gmail.com for a one-time activation email from FormSubmit, then try again.');
      if (btn) { btn.disabled = false; btn.innerHTML = '<span>Send Message</span><span class="btn-arrow">&#8594;</span>'; }
    });
  });
})();

/* ---------- TOAST ---------- */
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ---------- LIGHTBOX ---------- */
(function initLightbox() {
  const lb      = document.querySelector('.lightbox');
  const lbImg   = lb ? lb.querySelector('.lightbox-img') : null;
  const lbClose = lb ? lb.querySelector('.lightbox-close') : null;
  if (!lb) return;

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.dataset.lightbox || el.querySelector('img')?.src;
      if (src && lbImg) lbImg.src = src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (lbClose) lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
})();

/* ---------- PARALLAX HERO (rAF batched) ---------- */
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const content = hero.querySelector('.hero-content');
  const video   = hero.querySelector('video');
  let lastY = -1;
  let rafId;

  function updateParallax() {
    const y = window.scrollY;
    if (y === lastY) { rafId = requestAnimationFrame(updateParallax); return; }
    lastY = y;
    if (content) content.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
    if (video)   video.style.transform   = `translate3d(0, ${y * 0.12}px, 0) scale(1.05)`;
    rafId = requestAnimationFrame(updateParallax);
  }

  window.addEventListener('scroll', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateParallax);
  }, { passive: true });
})();

/* ---------- COUNTER ANIMATION ---------- */
(function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count || el.textContent);
      if (isNaN(target)) return;

      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      let start = null;
      const duration = 900;

      function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.floor(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(s => obs.observe(s));
})();

/* ---------- SMOOTH SECTION TRANSITIONS ---------- */
(function initSectionColors() {
  const sections = document.querySelectorAll('section[data-bg]');
  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.body.style.transition = 'background 0.5s ease';
        document.body.style.background = e.target.dataset.bg;
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();

/* ---------- STORY IMAGE STAGGER ---------- */
(function initStoryStagger() {
  const items = document.querySelectorAll('.story-item');
  if (!items.length) return;

  items.forEach((item, i) => {
    item.style.transitionDelay = (i % 3) * 0.08 + 's';
    item.classList.add('reveal');
  });
})();

/* ---------- HOVER MAGNETIC BUTTONS ---------- */
(function initMagneticBtns() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0,0,0)';
    });
  });
})();

/* ---------- TYPED TAGLINE ---------- */
(function initTyped() {
  const el = document.querySelector('.typed-text');
  if (!el) return;

  const words = el.dataset.words ? JSON.parse(el.dataset.words) : [];
  if (!words.length) return;

  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(type, 1600); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, deleting ? 50 : 100);
  }
  setTimeout(type, 600);
})();

/* ---------- HERO VIDEO: auto-play fallback fix ---------- */
(function fixHeroVideo() {
  const video = document.querySelector('.hero-video video');
  if (!video) return;
  video.play().catch(function() {
    document.body.addEventListener('click', function() {
      video.play();
    }, { once: true });
  });
})();
