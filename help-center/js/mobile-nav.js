document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const header = document.querySelector('.site-header');
  if (!toggle || !header) return;

  toggle.addEventListener('click', () => {
    header.classList.toggle('nav-open');
    const spans = toggle.querySelectorAll('span');
    if (header.classList.contains('nav-open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
});
