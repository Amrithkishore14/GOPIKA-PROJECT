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
    }, 800);
  });
})();

/* ---------- CUSTOM CURSOR ---------- */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animCursor() {
    // Dot snaps instantly; ring follows with lerp
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';

    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    raf = requestAnimationFrame(animCursor);
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

/* ---------- NAVBAR ---------- */
(function initNavbar() {
  const nav    = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.querySelector('.mobile-nav');
  if (!nav) return;

  // Scroll shrink
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile toggle
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

  // Active link highlight
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
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ---------- FEATURED CARDS REVEAL ---------- */
(function initFeaturedReveal() {
  const cards = document.querySelectorAll('.featured-item');
  if (!cards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('revealed'), 100);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

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
  }, { threshold: 0.4 });

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
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        if (show) {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
          card.style.pointerEvents = 'auto';
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
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
      subject: 'VOID Fashion — ' + subject,
      message: message,
      _subject: 'VOID Fashion Website — New Message from ' + fname,
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
      // First-time use: FormSubmit sends a confirmation email to Gopika.
      // She must click "Confirm your email" in that email — only needed once.
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
  const lb   = document.querySelector('.lightbox');
  const lbImg = lb ? lb.querySelector('.lightbox-img') : null;
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

/* ---------- PARALLAX HERO ---------- */
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const content = hero.querySelector('.hero-content');
    if (content) content.style.transform = `translateY(${y * 0.3}px)`;
    const video = hero.querySelector('video');
    if (video) video.style.transform = `translateY(${y * 0.15}px) scale(1.05)`;
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
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = prefix + Math.floor(current) + suffix;
      }, 16);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(s => obs.observe(s));
})();

/* ---------- SMOOTH SECTION TRANSITIONS ---------- */
(function initSectionColors() {
  // Subtle background color shift as user scrolls through sections
  const sections = document.querySelectorAll('section[data-bg]');
  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bg = e.target.dataset.bg;
        document.body.style.transition = 'background 0.6s ease';
        document.body.style.background = bg;
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
    item.style.transitionDelay = (i % 3) * 0.1 + 's';
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
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s ease';
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
      if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, deleting ? 60 : 110);
  }
  setTimeout(type, 600);
})();

/* ---------- NAV PROGRESS BAR ---------- */
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:2px;width:0;
    background:var(--red);z-index:99999;
    transition:width 0.1s linear;pointer-events:none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / max * 100) + '%';
  }, { passive: true });
})();

/* ---------- RANDOM PICSUM IMAGES FOR PLACEHOLDERS ---------- */
(function loadPlaceholderImages() {
  // Curated seeds that look great in grayscale for a fashion/textile context
  const seeds = [
    'fashion','fabric','textile','drape','void','studio',
    'minimal','form','structure','pattern','couture','thread',
    'silhouette','mono','design','fold','cut','stitch'
  ];

  const placeholders = document.querySelectorAll('.img-placeholder');
  placeholders.forEach(function(el, i) {
    const seed = seeds[i % seeds.length];
    const url  = 'https://picsum.photos/seed/' + seed + '/800/700?grayscale';

    el.style.backgroundImage    = 'url(' + url + ')';
    el.style.backgroundSize     = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat   = 'no-repeat';

    // Hide the text label once image loads
    const label = el.querySelector('.img-placeholder-text');
    if (label) label.style.display = 'none';
    el.querySelector && el.querySelectorAll('*').forEach(function(child) {
      if (child.classList && child.classList.contains('img-placeholder-text')) {
        child.style.display = 'none';
      }
    });
  });
})();

/* ---------- HERO VIDEO: auto-play fallback fix ---------- */
(function fixHeroVideo() {
  const video = document.querySelector('.hero-video video');
  if (!video) return;
  // Ensure it plays on user interaction if autoplay was blocked
  video.play().catch(function() {
    document.body.addEventListener('click', function() {
      video.play();
    }, { once: true });
  });
})();
