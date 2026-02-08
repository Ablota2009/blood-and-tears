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
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
}

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

  function openModal(src, title, price, description) {
    if (!modal) return;
    // set text
    if (modalTitle) modalTitle.textContent = title || '';
    if (modalPrice) modalPrice.textContent = price || '';
    if (modalDescription) modalDescription.textContent = description || '';
    // handle video source: MP4 uses <video>, otherwise iframe
    function handleVideoUnavailable() {
      if (videoEl) { videoEl.style.display = 'none'; videoEl.pause(); videoEl.src = ''; }
      if (iframe) iframe.style.display = 'none';
      if (modalDescription) modalDescription.textContent = 'Preview not available.';
    }

    if (src && src.toLowerCase().endsWith('.mp4')) {
      if (iframe) iframe.style.display = 'none';
      if (videoEl) {
        videoEl.style.display = 'block';
        // Try a lightweight HEAD request to verify the file exists before assigning it.
        fetch(src, { method: 'HEAD' }).then(res => {
          if (res.ok) {
            videoEl.src = src;
            videoEl.play().catch(()=>{});
          } else {
            handleVideoUnavailable();
          }
        }).catch(() => {
          // Some servers may not support HEAD; fall back to try setting src but handle errors.
          videoEl.src = src;
          // If it errors, the error handler below will call the fallback.
        });

        // If the video element errors while loading, show a friendly message instead of leaving the UI broken.
        videoEl.onerror = () => { handleVideoUnavailable(); };
      }
    } else {
      if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
        videoEl.style.display = 'none';
      }
      if (iframe) {
        iframe.style.display = 'block';
        iframe.src = src + (src.includes('?') ? '&autoplay=1' : '?autoplay=1');
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
    if (iframe) iframe.src = '';
    if (videoEl) { videoEl.pause(); videoEl.src = ''; }
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
