/* Anne-Charlotte · Art-thérapie · Lille — interactions */
(() => {
  document.documentElement.classList.add('js');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Révélations au scroll (avec léger décalage en cascade) ---------- */
  const groups = new Map();
  $$('.reveal').forEach(el => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    el.style.setProperty('--d', `${Math.min(i, 6) * 0.09}s`);
    groups.set(parent, i + 1);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Navigation ---------- */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  const floatCta = $('.float-cta');
  const hero = $('.hero');
  const rdv = $('#rdv');

  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    const rdvTop = rdv.getBoundingClientRect().top;
    floatCta.classList.toggle('is-visible', y > hero.offsetHeight * 0.8 && rdvTop > innerHeight * 0.6);
    updateSteps();
  };

  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Chemin des étapes dessiné au scroll ---------- */
  const stepsPath = $('.steps__path');
  function updateSteps() {
    if (!stepsPath) return;
    const r = stepsPath.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height));
    stepsPath.style.setProperty('--progress', reduceMotion ? 1 : p.toFixed(3));
  }

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Boutons : halo qui suit la souris ---------- */
  $$('.btn').forEach(b => b.addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', `${e.clientX - r.left}px`);
    b.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ---------- Hero : toile aquarelle interactive ---------- */
  const canvas = $('.hero__canvas');
  const ctx = canvas.getContext('2d');
  const palette = ['#E3A63B', '#E7A9A0', '#C4553A', '#7F9C7A', '#2B3A67'];
  let dpr = 1, W = 0, H = 0;
  let hue = 0, last = null, painted = false;

  function resize() {
    const snapshot = W ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (snapshot) ctx.putImageData(snapshot, 0, 0);
  }
  resize();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });

  const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const colorAt = t => {
    const n = palette.length;
    const x = ((t % n) + n) % n;
    const i = Math.floor(x);
    return mix(hexToRgb(palette[i]), hexToRgb(palette[(i + 1) % n]), x - i);
  };

  function dab(x, y, size, rgb, alpha) {
    // Tache d'aquarelle : dégradé radial + bord légèrement plus soutenu
    const g = ctx.createRadialGradient(x, y, 0, x, y, size);
    const [r, gg, b] = rgb;
    g.addColorStop(0, `rgba(${r},${gg},${b},${alpha * 0.55})`);
    g.addColorStop(0.72, `rgba(${r},${gg},${b},${alpha * 0.35})`);
    g.addColorStop(0.9, `rgba(${r},${gg},${b},${alpha * 0.6})`);
    g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    // forme irrégulière
    const pts = 9;
    for (let k = 0; k <= pts; k++) {
      const a = (k / pts) * Math.PI * 2;
      const rr = size * (0.82 + Math.random() * 0.22);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function strokeTo(x, y) {
    ctx.globalCompositeOperation = 'multiply';
    if (!last) { last = { x, y }; return; }
    const dx = x - last.x, dy = y - last.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(dist / 6));
    const size = Math.max(14, Math.min(46, 50 - dist * 0.35));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      hue += 0.004;
      dab(last.x + dx * t, last.y + dy * t, size * (0.85 + Math.random() * 0.3), colorAt(hue), 0.09);
    }
    // éclaboussures occasionnelles
    if (dist > 22 && Math.random() < 0.25) {
      for (let k = 0; k < 3; k++) {
        dab(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 80, 3 + Math.random() * 6, colorAt(hue + 1), 0.5);
      }
    }
    last = { x, y };
  }

  const pos = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const markPainted = () => { if (!painted) { painted = true; hero.classList.add('has-painted'); } };

  canvas.addEventListener('pointermove', e => {
    // souris : on peint en survolant ; tactile/stylet : en glissant
    if (e.pointerType === 'mouse' || e.buttons) { strokeTo(...pos(e)); markPainted(); }
  });
  canvas.addEventListener('pointerdown', e => { last = null; strokeTo(...pos(e)); });
  canvas.addEventListener('pointerleave', () => { last = null; });
  // Le contenu du hero laisse passer les événements : on peint aussi "sous" le texte
  hero.addEventListener('pointermove', e => {
    if (e.target !== canvas && !e.target.closest('a,button') && e.pointerType === 'mouse') { strokeTo(...pos(e)); markPainted(); }
  });

  $('.hero__clear').addEventListener('click', () => {
    // fondu vers la page blanche, via un canvas tampon
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width; tmp.height = canvas.height;
    tmp.getContext('2d').drawImage(canvas, 0, 0);
    let a = reduceMotion ? 0 : 1;
    const fade = () => {
      a = Math.max(0, a - 0.07);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = a; ctx.drawImage(tmp, 0, 0);
      ctx.restore();
      if (a > 0) requestAnimationFrame(fade);
      else { painted = false; hero.classList.remove('has-painted'); last = null; }
    };
    fade();
  });

  // Un premier coup de pinceau "tout seul" pour inviter à jouer
  if (!reduceMotion) {
    const path = t => {
      const x0 = W * 0.52, y0 = H * 0.78;
      return [x0 + t * W * 0.4, y0 - Math.sin(t * Math.PI * 1.3) * H * 0.22 - t * H * 0.1];
    };
    let t = 0;
    const auto = () => {
      if (painted) return; // l'utilisateur a pris la main
      t += 0.012;
      strokeTo(...path(t));
      if (t < 1) requestAnimationFrame(auto); else last = null;
    };
    setTimeout(() => { last = null; hue = 0; auto(); }, 900);
  }

  /* ---------- Palette des humeurs ---------- */
  const moods = {
    brique: { name: 'Rouge brique', ink: '#C4553A', text: "Il y a de l'élan… ou de la colère. Les deux sont précieux. En séance, on peut leur donner une forme — l'argile adore ça." },
    ocre:   { name: 'Ocre soleil', ink: '#A9731A', text: "Une envie de chaleur, de lumière, de joie à laisser déborder. Et si on osait les grands formats et les couleurs qui ne demandent pas la permission ?" },
    rose:   { name: 'Rose poudré', ink: '#B86A60', text: "De la tendresse à s'offrir, peut-être. Un besoin de douceur envers soi. L'aquarelle sait très bien accueillir ça." },
    sauge:  { name: 'Vert sauge', ink: '#56724F', text: "Quelque chose veut pousser, se renouveler. Un nouveau départ se prépare parfois bien avant qu'on le sache." },
    indigo: { name: 'Bleu indigo', ink: '#2B3A67', text: "Un besoin de calme, de profondeur, de silence. Ici, on peut créer lentement — sans rien avoir à prouver." },
    brume:  { name: 'Gris brume', ink: '#5E5E64', text: "Un peu de brouillard ? C'est souvent là que tout commence. Le gris est la couleur qui contient toutes les autres." }
  };
  const moodSection = $('.mood');
  const card = $('.mood__card');
  const drops = $$('.drop');
  drops.forEach((d, i) => {
    d.addEventListener('click', () => {
      const m = moods[d.dataset.mood];
      drops.forEach(x => { x.setAttribute('aria-checked', String(x === d)); x.tabIndex = x === d ? 0 : -1; });
      moodSection.classList.add('has-mood');
      moodSection.style.setProperty('--mood', d.style.getPropertyValue('--c'));
      card.style.setProperty('--mood-ink', m.ink);
      card.classList.remove('is-changing'); void card.offsetWidth; card.classList.add('is-changing');
      $('.mood__name', card).textContent = m.name;
      $('.mood__text', card).textContent = m.text;
      $('.mood__cta', card).hidden = false;
    });
    // navigation clavier type radiogroup
    d.addEventListener('keydown', e => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const next = drops[(i + dir + drops.length) % drops.length];
      next.focus(); next.click();
    });
    d.tabIndex = i === 0 ? 0 : -1;
  });

  /* ---------- Formulaire de rendez-vous ---------- */
  // Sans back-end : ouvre le client e-mail avec la demande pré-remplie.
  // Pour un envoi direct, brancher ce formulaire sur Formspree, Netlify Forms, etc.
  const form = $('#rdv-form');
  const status = $('.form__status', form);
  const TO = 'bonjour@annecharlotte-arttherapie.fr';
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    let ok = true;
    ['prenom', 'email'].forEach(n => {
      const input = form.elements[n];
      const valid = input.value.trim() && (n !== 'email' || /\S+@\S+\.\S+/.test(input.value));
      input.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid) ok = false;
    });
    if (!ok) { status.textContent = 'Il manque juste votre prénom et un e-mail valide ✎'; return; }
    const subject = `Demande de rendez-vous — ${data.get('type')}`;
    const body = `Bonjour Anne-Charlotte,\n\n${data.get('message') || ''}\n\n— ${data.get('prenom')}\n${data.get('email')}\n${data.get('tel') || ''}`;
    location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = `Merci ${data.get('prenom')} ! Votre message s'envole… À très vite ✦`;
  });

  $('#year').textContent = new Date().getFullYear();
})();
