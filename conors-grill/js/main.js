/* ============================================================
   CONOR'S GRILL — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAV SCROLL STATE
  ---------------------------------------------------------- */
  const nav = document.getElementById('nav');
  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ----------------------------------------------------------
     2. MOBILE NAV
  ---------------------------------------------------------- */
  const hamburger = document.querySelector('.nav__hamburger');
  const navDrawer  = document.getElementById('navDrawer');

  function openDrawer() {
    navDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }
  function closeDrawer() {
    navDrawer.classList.remove('open');
    document.body.style.overflow = '';
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
  if (hamburger) hamburger.addEventListener('click', () => navDrawer.classList.contains('open') ? closeDrawer() : openDrawer());
  document.querySelectorAll('.nav-drawer__link, .nav-drawer .btn').forEach(l => l.addEventListener('click', closeDrawer));

  /* ----------------------------------------------------------
     3. HERO HEADLINE — WORD-BY-WORD SLIDE-UP
  ---------------------------------------------------------- */
  const headline = document.querySelector('.hero__headline');
  if (headline) {
    // Split each line into words wrapped in spans
    headline.querySelectorAll('.hero__word-line').forEach((line, li) => {
      const words = line.textContent.trim().split(' ');
      line.innerHTML = words.map((w, wi) =>
        `<span class="hw" style="animation-delay:${(li * 3 + wi) * 0.08 + 0.3}s">${w}</span>`
      ).join(' ');
    });
  }

  /* ----------------------------------------------------------
     4. PARALLAX STEAK — STICKY + SCROLL TRANSFORM
  ---------------------------------------------------------- */
  const steakImg     = document.getElementById('steakImg');
  const steakWrapper = document.querySelector('.hero__steak-wrapper');
  let ticking = false, lastScrollY = 0;

  function applyParallax() {
    if (!steakImg || window.innerWidth < 768) {
      if (steakImg) steakImg.style.transform = '';
      return;
    }
    const y = lastScrollY;
    const translateY = Math.max(-100, Math.min(60,  y * -0.18));
    const rotate     = Math.max(-3,   Math.min(3,   y *  0.008));
    const scale      = Math.min(1.14, 1 + y * 0.00008);
    steakImg.style.transform = `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`;
    ticking = false;
  }
  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  applyParallax();

  /* ----------------------------------------------------------
     5. STATS COUNT-UP ANIMATION
  ---------------------------------------------------------- */
  function countUp(el, target, suffix, duration) {
    const isFloat = String(target).includes('.');
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = isFloat ? (eased * target).toFixed(1) : Math.round(eased * target);
      el.textContent = val + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw    = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      countUp(el, parseFloat(raw), suffix, 1800);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stats__number[data-count]').forEach(el => statsObserver.observe(el));

  /* ----------------------------------------------------------
     6. SCROLL REVEAL
  ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------
     7. MENU CARD — GOLD FLARE ON HOVER
  ---------------------------------------------------------- */
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.classList.add('flare');
    });
    card.addEventListener('mouseleave', function () {
      this.classList.remove('flare');
    });
  });

  /* ----------------------------------------------------------
     8. EMBER PARTICLES — RESERVE SECTION
  ---------------------------------------------------------- */
  const reserveSection = document.querySelector('.reserve');
  if (reserveSection) {
    const canvas = document.createElement('canvas');
    canvas.className = 'ember-canvas';
    reserveSection.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = reserveSection.offsetWidth;
      H = canvas.height = reserveSection.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function () {
      this.x    = Math.random() * W;
      this.y    = H + 10;
      this.size = Math.random() * 3 + 1;
      this.speedY = Math.random() * 1.2 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.life   = 0;
      this.maxLife = Math.random() * 120 + 80;
      this.gold = Math.random() > 0.4;
    };
    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y -= this.speedY;
      this.life++;
      if (this.life >= this.maxLife) this.reset();
    };
    Particle.prototype.draw = function () {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.gold
        ? `rgba(196, 152, 42, ${alpha * 0.7})`
        : `rgba(255, 200, 80, ${alpha * 0.4})`;
      ctx.fill();
    };

    for (let i = 0; i < 60; i++) {
      const p = new Particle();
      p.life = Math.random() * p.maxLife; // stagger initial positions
      particles.push(p);
    }

    let emberRunning = false;
    const emberObserver = new IntersectionObserver((entries) => {
      emberRunning = entries[0].isIntersecting;
      if (emberRunning) loop();
    }, { threshold: 0.1 });
    emberObserver.observe(reserveSection);

    function loop() {
      if (!emberRunning) return;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    }
  }

  /* ----------------------------------------------------------
     9. SMOOTH SCROLL FOR ANCHOR LINKS
  ---------------------------------------------------------- */
  const NAV_HEIGHT = 72;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT, behavior: 'smooth' });
    });
  });

})();
