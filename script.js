// Smooth scroll for nav links
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Navbar shadow on scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('nav');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Fade-in animations on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-section').forEach(section => {
  observer.observe(section);
});

// Simple carousel/slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
function showSlide(index) {
  if (!slides || slides.length === 0) return;
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? 'block' : 'none';
  });
}


const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });
}
if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  });
}
showSlide(currentSlide);

// Hamburger menu toggle
// Mobile hamburger: make the checkbox/label approach robust and add JS fallback
(() => {
  const checkbox = document.getElementById('menu-toggle');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (!navMenu) return;

  // Toggle the menu (keeps checkbox in sync for CSS rules)
  function toggleMenu(force) {
    if (checkbox) {
      if (typeof force === 'boolean') checkbox.checked = force;
      else checkbox.checked = !checkbox.checked;
    }
    navMenu.classList.toggle('open', checkbox ? checkbox.checked : undefined);
  }

  // If label is clicked, the browser toggles the checkbox automatically, but
  // add a click handler on the label for extra reliability and to sync classes.
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu();
    });
  }

  // Close menu when a nav link is clicked (mobile behaviour)
  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close menu on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu(false);
  });
})();

// Contact form validation
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = contactForm.querySelector('input[placeholder="Your Name"]').value;
    const email = contactForm.querySelector('input[placeholder="Your Email"]').value;
    const message = contactForm.querySelector('textarea').value;

    if (name && email && message) {
      alert(`Thank you for your message, ${name}! We'll get back to you soon at ${email}.`);
      contactForm.reset();
    } else {
      alert('Please fill in all fields.');
    }
  });
}

// Video preview modal: open iframe when a game-card is clicked
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');
  const closeBtn = document.getElementById('modalClose');
  const overlay = document.getElementById('modalOverlay');
  const videoEl = document.getElementById('videoElement');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalDescription = document.getElementById('modalDescription');
  const modalAddToCart = document.getElementById('modalAddToCart');
  // Timer to detect iframe/video load failure
  let modalLoadTimer = null;

  function openModal(src, title, price, description) {
    if (!modal) return;
    // set text
    if (modalTitle) modalTitle.textContent = title || '';
    if (modalPrice) modalPrice.textContent = price || '';
    if (modalDescription) modalDescription.textContent = description || '';
    // handle video source: MP4 uses <video>, otherwise iframe
    function handleVideoUnavailable() {
      if (modalLoadTimer) { clearTimeout(modalLoadTimer); modalLoadTimer = null; }
      if (videoEl) { videoEl.style.display = 'none'; try{ videoEl.pause(); }catch(e){} videoEl.src = ''; videoEl.onerror = null; videoEl.oncanplay = null; }
      if (iframe) { iframe.style.display = 'none'; iframe.onload = null; }
      if (modalDescription) modalDescription.textContent = 'Preview not available.';
    }

    // Clear any previous handlers/timers
    if (modalLoadTimer) { clearTimeout(modalLoadTimer); modalLoadTimer = null; }
    if (!src) {
      handleVideoUnavailable();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      return;
    }

    if (src.toLowerCase().endsWith('.mp4')) {
      if (iframe) { iframe.style.display = 'none'; iframe.src = ''; iframe.onload = null; }
      if (videoEl) {
        videoEl.style.display = 'block';
        videoEl.src = src;
        // clear previous handlers
        videoEl.onerror = null;
        videoEl.oncanplay = null;

        // success handler
        videoEl.oncanplay = () => {
          if (modalLoadTimer) { clearTimeout(modalLoadTimer); modalLoadTimer = null; }
        };

        // failure handler
        videoEl.onerror = () => { handleVideoUnavailable(); };

        // start a fallback timer: if it doesn't canplay within 6s, show unavailable
        modalLoadTimer = setTimeout(() => { handleVideoUnavailable(); }, 6000);

        videoEl.play().catch(()=>{});
      }
    } else {
      if (videoEl) { videoEl.pause(); videoEl.src = ''; videoEl.style.display = 'none'; videoEl.onerror = null; videoEl.oncanplay = null; }
      if (iframe) {
        iframe.style.display = 'block';
        // remove previous onload
        iframe.onload = null;
        iframe.src = src + (src.includes('?') ? '&autoplay=1' : '?autoplay=1');

        // If iframe loads successfully, clear the timer. If not loaded in 6s, mark unavailable.
        iframe.onload = () => { if (modalLoadTimer) { clearTimeout(modalLoadTimer); modalLoadTimer = null; } };
        modalLoadTimer = setTimeout(() => { handleVideoUnavailable(); }, 6000);
      }
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (iframe) { iframe.src = ''; iframe.onload = null; }
    if (videoEl) { try{ videoEl.pause(); }catch(e){} videoEl.src = ''; videoEl.onerror = null; videoEl.oncanplay = null; }
    if (modalLoadTimer) { clearTimeout(modalLoadTimer); modalLoadTimer = null; }
    document.body.style.overflow = '';
  }

  // Open modal from Preview buttons on cards
  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.game-card');
      if (!card) return;
      const video = card.dataset.video;
      const title = card.querySelector('.game-title') ? card.querySelector('.game-title').textContent : '';
      const price = card.querySelector('.price') ? card.querySelector('.price').textContent : '';
      const desc = card.dataset.description || (card.querySelector('.game-desc') ? card.querySelector('.game-desc').textContent : '');
      if (video) openModal(video, title, price, desc);
    });
  });

  // Open PlayStation channel when any "Learn More" button is clicked
  const playstationChannel = 'https://www.youtube.com/playstation/ps5';
  document.querySelectorAll('button').forEach(btn => {
    try{
      if (btn.textContent && btn.textContent.trim().toLowerCase() === 'learn more'){
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.open(playstationChannel, '_blank');
        });
      }
    }catch(e){}
  });

  // "Find out more" button should open PS5 video in the same video modal
  const findOutBtn = document.querySelector('.btn-findout');
  if (findOutBtn) {
    findOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // use YouTube embed URL (openModal will append autoplay=1)
      const ps5VideoEmbed = 'https://www.youtube.com/embed/RkC0l4iekYo';
      openModal(ps5VideoEmbed, 'PlayStation 5 Overview', '', '');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);
  if (modalAddToCart) {
    modalAddToCart.addEventListener('click', () => {
      const name = modalTitle ? modalTitle.textContent : 'Game';
      alert(`Added "${name}" to cart.`);
      closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});

// Device preview modal
document.addEventListener('DOMContentLoaded', () => {
  const deviceModal = document.getElementById('deviceModal');
  const deviceImage = document.getElementById('deviceImage');
  const deviceName = document.getElementById('deviceName');
  const devicePrice = document.getElementById('devicePrice');
  const deviceDescription = document.getElementById('deviceDescription');
  const deviceAddToCart = document.getElementById('deviceAddToCart');
  const deviceModalClose = document.getElementById('deviceModalClose');
  const deviceModalOverlay = document.getElementById('deviceModalOverlay');

  function openDeviceModal(name, price, description, image) {
    if (!deviceModal) return;
    if (deviceName) deviceName.textContent = name || '';
    if (devicePrice) devicePrice.textContent = price || '';
    if (deviceDescription) deviceDescription.textContent = description || '';
    if (deviceImage) deviceImage.src = image || '';
    
    deviceModal.classList.add('open');
    deviceModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDeviceModal() {
    if (!deviceModal) return;
    deviceModal.classList.remove('open');
    deviceModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Open modal from device preview buttons
  document.querySelectorAll('.device-preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const name = btn.dataset.device;
      const price = btn.dataset.price;
      const description = btn.dataset.description;
      const image = btn.dataset.image;
      openDeviceModal(name, price, description, image);
    });
  });

  if (deviceModalClose) deviceModalClose.addEventListener('click', closeDeviceModal);
  if (deviceModalOverlay) deviceModalOverlay.addEventListener('click', closeDeviceModal);
  
  if (deviceAddToCart) {
    deviceAddToCart.addEventListener('click', () => {
      const name = deviceName ? deviceName.textContent : 'Device';
      alert(`Added "${name}" to cart.`);
      closeDeviceModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDeviceModal();
  });
});

  // Google Sign-In (Identity Services) - simple client-side handling
  (function(){
    function parseJwt(token){
      try{
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c){
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      }catch(e){ return null; }
    }

    function handleCredentialResponse(response){
      const user = parseJwt(response.credential);
      const btn = document.getElementById('googleSignInBtn');
      if (user && btn){
        btn.textContent = user.name || user.email || 'Signed in';
        btn.disabled = true;
        let img = document.getElementById('userAvatar');
        if (!img){
          img = document.createElement('img');
          img.id = 'userAvatar';
          img.className = 'user-avatar';
          img.style.width = '32px';
          img.style.height = '32px';
          img.style.borderRadius = '50%';
          img.style.marginLeft = '8px';
          btn.parentNode.appendChild(img);
        }
        img.src = user.picture || '';
      } else {
        alert('Sign-in failed or cancelled.');
      }
    }

    function initGoogle(){
      const btn = document.getElementById('googleSignInBtn');
      if (!btn) return;
      const clientId = btn.dataset.clientId;
      if (!clientId || clientId === 'REPLACE_WITH_CLIENT_ID'){
        btn.addEventListener('click', ()=>{
          alert('Google Sign-In not configured. Set data-client-id on the button with your OAuth Client ID.');
        });
        return;
      }

      function initialize(){
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse
        });
        btn.addEventListener('click', ()=> google.accounts.id.prompt());
      }

      if (window.google && google.accounts && google.accounts.id){
        initialize();
      } else {
        let attempts = 0;
        const t = setInterval(()=>{
          if (window.google && google.accounts && google.accounts.id){
            clearInterval(t);
            initialize();
          } else if (++attempts > 20){
            clearInterval(t);
            btn.addEventListener('click', ()=> alert('Google Sign-In library failed to load.'));
          }
        },200);
      }
    }

    document.addEventListener('DOMContentLoaded', initGoogle);
  })();

  // Custom Sign-in modal handling and Explore Games scroll
  (function(){
    function openModal(){
      const m = document.getElementById('signinModal');
      if (!m) return;
      m.setAttribute('aria-hidden','false');
    }
    function closeModal(){
      const m = document.getElementById('signinModal');
      if (!m) return;
      m.setAttribute('aria-hidden','true');
    }

    document.addEventListener('DOMContentLoaded', ()=>{
      const signInBtn = document.getElementById('signInBtn');
      const signinClose = document.getElementById('signinClose');
      const signinOverlay = document.getElementById('signinOverlay');
      const signinCancel = document.getElementById('signinCancel');
      const signinForm = document.getElementById('signinForm');

      if (signInBtn){
        signInBtn.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); });
      }
      if (signinClose) signinClose.addEventListener('click', closeModal);
      if (signinOverlay) signinOverlay.addEventListener('click', closeModal);
      if (signinCancel) signinCancel.addEventListener('click', closeModal);

      if (signinForm){
        signinForm.addEventListener('submit', (e)=>{
          e.preventDefault();
          const email = document.getElementById('signinEmail').value.trim();
          const name = email.split('@')[0] || email;
          // Simple client-side 'sign-in' (no backend)
          localStorage.setItem('signedInUser', JSON.stringify({name, email}));
          const btn = document.getElementById('signInBtn');
          if (btn){ btn.textContent = 'Hi, ' + (name || 'Player'); btn.disabled = true; }
          closeModal();
        });
      }

      // If already signed in, show name
      try{
        const stored = JSON.parse(localStorage.getItem('signedInUser')||'null');
        if (stored && stored.name){
          const btn = document.getElementById('signInBtn');
          if (btn){ btn.textContent = 'Hi, ' + stored.name; btn.disabled = true; }
        }
      }catch(e){}

      // Explore Games scroll
      const explore = document.getElementById('exploreBtn');
      if (explore){
        explore.addEventListener('click', (e)=>{
          e.preventDefault();
          const target = document.getElementById('games');
          if (target) target.scrollIntoView({behavior:'smooth'});
        });
      }
    });
  })();
