// ===== Theme toggle =====
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('codalithic-theme');
  root.setAttribute('data-theme', saved || 'dark');
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if(btn){
      btn.textContent = root.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
      btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        localStorage.setItem('codalithic-theme', next);
        btn.textContent = next === 'light' ? '🌙' : '☀️';
      });
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {

  // ===== Mobile nav =====
  const burger = document.getElementById('burger');
  const links  = document.getElementById('navLinks');
  if(burger && links){
    burger.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // ===== 3D tilt card =====
  const stage = document.querySelector('.tilt-stage');
  const card  = document.querySelector('.tilt-card');
  if(stage && card){
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `rotateY(${x*14}deg) rotateX(${-y*14}deg)`;
    });
    stage.addEventListener('mouseleave', () => { card.style.transform = 'rotateY(0) rotateX(0)'; });
  }

  // ===== Scroll reveal =====
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(r => io.observe(r));

  // ===== FAQ accordion =====
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });

  // ===== Active nav link =====
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if(a.getAttribute('href') === path) a.classList.add('active');
  });

  // ===== Contact form — sends to /api/contact (Gmail SMTP) =====
  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const consent = document.getElementById('consentCheck');
      if(!consent || !consent.checked){
        showFormMsg(form, 'error', 'Please tick the consent box before submitting.');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      const payload = {
        name:    form.querySelector('[name="name"]')?.value    || '',
        email:   form.querySelector('[name="email"]')?.value   || '',
        phone:   form.querySelector('[name="phone"]')?.value   || '',
        service: form.querySelector('[name="service"]')?.value || '',
        message: form.querySelector('[name="message"]')?.value || '',
        consent: consent.checked ? 'true' : 'false'
      };

      try {
        const res  = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if(res.ok && data.success){
          form.innerHTML = `
            <div style="text-align:center;padding:48px 20px;">
              <div style="font-size:2.5rem;margin-bottom:16px;">✅</div>
              <h3 class="h-md">Message received!</h3>
              <p class="text-dim" style="margin-top:10px;max-width:360px;margin-inline:auto;">
                Thanks for reaching out. Our team will get back to you within one business day.
              </p>
            </div>`;
        } else {
          showFormMsg(form, 'error', data.error || 'Something went wrong. Please try again.');
          btn.textContent = originalText;
          btn.disabled = false;
        }
      } catch(err) {
        showFormMsg(form, 'error', 'Network error — please try again or email us directly at info@codalithic.com');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

});

function showFormMsg(form, type, text){
  const existing = form.querySelector('.form-alert');
  if(existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'form-alert';
  el.style.cssText = `margin-top:16px;padding:12px 16px;border-radius:10px;font-size:.88rem;font-weight:500;
    background:${type==='error'?'rgba(220,38,38,.12)':'rgba(34,197,94,.12)'};
    border:1px solid ${type==='error'?'rgba(220,38,38,.4)':'rgba(34,197,94,.4)'};
    color:${type==='error'?'#f87171':'#4ade80'};`;
  el.textContent = text;
  form.appendChild(el);
}
