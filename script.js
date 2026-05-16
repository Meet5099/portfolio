/* ═══════════════════════════════════════
   PAGE LOADER
═══════════════════════════════════════ */
const loaderTexts = ['Loading assets…','Setting up canvas…','Rendering portfolio…','Almost ready…','Done!'];
let loadPct = 0;
const fill = document.getElementById('loader-fill');
const ltxt = document.getElementById('loader-text');
const loader = document.getElementById('loader');

const loadInterval = setInterval(() => {
  loadPct += Math.random() * 18 + 7;
  if (loadPct >= 100) { loadPct = 100; clearInterval(loadInterval); }
  fill.style.width = loadPct + '%';
  ltxt.textContent = loaderTexts[Math.floor(loadPct / 25)] || 'Done!';
  if (loadPct >= 100) setTimeout(() => loader.classList.add('hidden'), 300);
}, 120);

/* ═══════════════════════════════════════
   CANVAS PARTICLE SYSTEM
═══════════════════════════════════════ */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

const colors = ['rgba(255,155,81,', 'rgba(37,52,63,', 'rgba(58,127,192,', 'rgba(42,138,138,', 'rgba(122,95,160,'];

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.8 + 0.3;
    this.vx = (Math.random() - .5) * .4;
    this.vy = (Math.random() - .5) * .4;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = Math.random() * .35 + .05;
    this.life = 0;
    this.maxLife = Math.random() * 400 + 200;
  }
  draw() {
    const progress = this.life / this.maxLife;
    const fade = progress < .1 ? progress * 10 : progress > .9 ? (1 - progress) * 10 : 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + (this.alpha * fade) + ')';
    ctx.fill();
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life >= this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor((W * H) / 9000), 140);
  for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

// Connection lines between nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(37,52,63,${.06 * (1 - dist / 90)})`;
        ctx.lineWidth = .5;
        ctx.stroke();
      }
    }
  }
}

// Mouse repulsion
let mouseX = W / 2, mouseY = H / 2;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    // Gentle mouse influence
    const dx = p.x - mouseX, dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      p.vx += (dx / dist) * .03;
      p.vy += (dy / dist) * .03;
    }
    // Dampen velocity
    p.vx *= .995; p.vy *= .995;
    p.update();
    p.draw();
  });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ═══════════════════════════════════════
   CURSOR
═══════════════════════════════════════ */
const cur = document.getElementById('cur'), ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.style.left = mx+'px'; cur.style.top = my+'px'; });
(function animRing() { rx += (mx-rx)*.1; ry += (my-ry)*.1; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(animRing); })();

/* ═══════════════════════════════════════
   NAV + PROGRESS + FAB
═══════════════════════════════════════ */
const nav = document.getElementById('main-nav');
const pb = document.getElementById('progress-bar');
const fab = document.getElementById('resume-fab');
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  nav.classList.toggle('scrolled', s > 20);
  pb.style.width = (s / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
  fab.classList.toggle('show', s > 500);
});

/* ═══════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), +(e.target.dataset.delay || 0));
      obs.unobserve(e.target);
    }
  });
}, { threshold: .1 });
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach((el, i) => {
  el.dataset.delay = (i % 6) * 65;
  obs.observe(el);
});

/* ═══════════════════════════════════════
   COUNT UP
═══════════════════════════════════════ */
const co = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target, target = +el.dataset.count;
      let v = 0; const step = target / 55;
      const t = setInterval(() => {
        v = Math.min(v + step, target);
        el.textContent = Math.floor(v);
        if (v >= target) { el.textContent = target; clearInterval(t); }
      }, 18);
      co.unobserve(el);
    }
  });
}, { threshold: .5 });
document.querySelectorAll('.stat-num[data-count]').forEach(el => co.observe(el));

/* ═══════════════════════════════════════
   STAGGER SKILL TAGS
═══════════════════════════════════════ */
const so = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-tag').forEach((t, i) => {
        t.style.opacity = '0'; t.style.transform = 'translateY(10px)';
        t.style.transition = 'opacity .3s ease, transform .3s ease';
        setTimeout(() => { t.style.opacity = '1'; t.style.transform = 'none'; }, i * 50 + 100);
      });
      so.unobserve(e.target);
    }
  });
}, { threshold: .15 });
document.querySelectorAll('.skill-group').forEach(g => so.observe(g));

/* ═══════════════════════════════════════
   TYPEWRITER — HERO ROLE
═══════════════════════════════════════ */
const roles = ['Full-Stack Developer', 'AI/ML Enthusiast', 'React.js Engineer', 'Open Source Contributor', 'Problem Solver'];
let ri = 0, ci = 0, deleting = false;
const el = document.getElementById('typed-role');
function typeRole() {
  const word = roles[ri];
  if (!deleting) {
    el.textContent = word.slice(0, ++ci);
    if (ci === word.length) { deleting = true; setTimeout(typeRole, 1600); return; }
  } else {
    el.textContent = word.slice(0, --ci);
    if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
  }
  setTimeout(typeRole, deleting ? 45 : 95);
}
setTimeout(typeRole, 1500);

/* ═══════════════════════════════════════
   PARALLAX BLOBS on mousemove
═══════════════════════════════════════ */
document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - .5) * 22;
  const y = (e.clientY / window.innerHeight - .5) * 22;
  document.querySelectorAll('.orb').forEach((b, i) => {
    const f = (i + 1) * .35;
    b.style.transform = `translate(${x * f}px, ${y * f}px)`;
  });
  // Subtle parallax on geo shapes
  document.querySelectorAll('.geo').forEach((g, i) => {
    const f = (i + 1) * .15;
    g.style.transform = `translate(${x * f}px, ${y * f}px)`;
  });
});

/* ═══════════════════════════════════════
   MAGNETIC BUTTONS
═══════════════════════════════════════ */
document.querySelectorAll('.btn-fill, .btn-line, .nav-hire, .resume-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * .18}px, ${y * .18}px) scale(1.04)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ═══════════════════════════════════════
   3D TILT ON PROJ CARDS
═══════════════════════════════════════ */
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
    card.style.transition = 'transform .1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'all .4s cubic-bezier(.4,0,.2,1)';
  });
});

/* ═══════════════════════════════════════
   3D TILT ON INFO CARD
═══════════════════════════════════════ */
const infoCard = document.querySelector('.info-card');
if (infoCard) {
  infoCard.addEventListener('mousemove', e => {
    const r = infoCard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    infoCard.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-8px) scale(1.02)`;
    infoCard.style.transition = 'transform .1s ease';
    infoCard.style.animationPlayState = 'paused';
  });
  infoCard.addEventListener('mouseleave', () => {
    infoCard.style.transform = '';
    infoCard.style.transition = 'all .5s cubic-bezier(.4,0,.2,1)';
    infoCard.style.animationPlayState = 'running';
  });
}

/* ═══════════════════════════════════════
   RIPPLE on clickable elements
═══════════════════════════════════════ */
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes ripple-out{to{transform:scale(3);opacity:0;}}`;
document.head.appendChild(rippleStyle);
document.querySelectorAll('.chip, .btn-fill, .btn-line, .contact-link').forEach(el2 => {
  el2.addEventListener('click', function(e) {
    const r = this.getBoundingClientRect();
    const sz = Math.max(r.width, r.height);
    const rip = document.createElement('span');
    Object.assign(rip.style, {
      position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
      width: sz + 'px', height: sz + 'px',
      left: (e.clientX - r.left - sz / 2) + 'px',
      top: (e.clientY - r.top - sz / 2) + 'px',
      background: 'rgba(255,255,255,.28)',
      transform: 'scale(0)', animation: 'ripple-out .6s ease-out forwards'
    });
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(rip);
    setTimeout(() => rip.remove(), 620);
  });
});

/* ═══════════════════════════════════════
   SECTION BG COLOUR SHIFT on scroll
═══════════════════════════════════════ */
const sections = document.querySelectorAll('section');
const bgColors = {
  hero: '#EAEFEF', about: '#EAEFEF', skills: '#FFFFFF',
  experience: '#F2F5F5', projects: '#FFFFFF', education: '#F2F5F5',
  certs: '#FFFFFF', contact: '#25343F'
};
const scrollObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      if (bgColors[id]) document.body.style.background = bgColors[id];
    }
  });
}, { threshold: .4 });
sections.forEach(s => scrollObs.observe(s));