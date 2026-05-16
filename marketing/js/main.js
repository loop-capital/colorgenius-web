/**
 * COLORgenius Marketing Site - Main JavaScript
 * Smooth scroll animations, mobile nav, form handling
 */

document.addEventListener('DOMContentLoaded', () => {
  // ========================================
  // Mobile Navigation Toggle
  // ========================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      const isOpen = mobileMenu.classList.contains('active');
      mobileToggle.setAttribute('aria-expanded', isOpen);

      // Animate hamburger to X
      const spans = mobileToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close mobile menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // ========================================
  // Navbar background on scroll
  // ========================================
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      nav.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
    } else {
      nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
  });

  // ========================================
  // Scroll Reveal Animation
  // ========================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ========================================
  // Smooth scroll for anchor links
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========================================
  // Form handling
  // ========================================
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Creating account...';

      // Simulate form submission
      setTimeout(() => {
        submitBtn.innerHTML = '✓ Account created!';
        submitBtn.style.background = '#22c55e';
        submitBtn.style.borderColor = '#22c55e';

        // Reset after 3 seconds
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
          signupForm.reset();
        }, 3000);
      }, 1500);
    });
  }

  // ========================================
  // Pricing toggle (monthly/yearly)
  // ========================================
  const pricingToggle = document.getElementById('pricingToggle');
  if (pricingToggle) {
    const monthlyPrices = ['$19', '$49', '$99'];
    const yearlyPrices = ['$15', '$39', '$79'];
    const priceElements = document.querySelectorAll('.pricing-amount');

    pricingToggle.addEventListener('change', () => {
      const isYearly = pricingToggle.checked;
      const prices = isYearly ? yearlyPrices : monthlyPrices;

      priceElements.forEach((el, i) => {
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = prices[i];
          el.style.opacity = '1';
        }, 200);
      });
    });
  }

  // ========================================
  // Counter animation for hero stats
  // ========================================
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current) + suffix;
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target + suffix;
          }
        };

        updateCounter();
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
});
