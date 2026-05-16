document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  if (!input) return;

  // Search index — mirrors the articles on the page
  const index = [
    { title: 'Welcome to COLORgenius',     category: 'Getting Started', url: 'articles/welcome.html' },
    { title: 'Setting Up Your Salon Profile', category: 'Getting Started', url: 'articles/salon-setup.html' },
    { title: 'Connecting Your POS (Square / Vagaro)', category: 'Getting Started', url: 'articles/connect-pos.html' },
    { title: 'Selecting Your Color Lines', category: 'Getting Started', url: 'articles/select-brands.html' },
    { title: 'Importing Clients from Your POS', category: 'Getting Started', url: 'articles/import-clients.html' },
    { title: 'Creating Your First Formula', category: 'Getting Started', url: 'articles/first-formula.html' },
    { title: 'Understanding the Dashboard', category: 'Getting Started', url: 'articles/dashboard.html' },
    { title: 'How to Create a Formula',    category: 'Formulas', url: 'articles/create-formula.html' },
    { title: 'Converting Between Brands',  category: 'Formulas', url: 'articles/convert-formula.html' },
    { title: 'Saving and Organizing Formulas', category: 'Formulas', url: 'articles/save-formula.html' },
    { title: 'Sharing Formulas with Your Team', category: 'Formulas', url: 'articles/share-formula.html' },
    { title: 'Selling Formulas on the Marketplace', category: 'Formulas', url: 'articles/sell-marketplace.html' },
    { title: 'Formula Version History',  category: 'Formulas', url: 'articles/formula-history.html' },
    { title: 'Managing Client Profiles', category: 'Client Management', url: 'articles/client-profiles.html' },
    { title: 'Tracking Color History',   category: 'Client Management', url: 'articles/color-history.html' },
    { title: 'Adding Photos and Notes',  category: 'Client Management', url: 'articles/client-notes.html' },
    { title: 'Square POS Setup',         category: 'Integrations', url: 'articles/square-setup.html' },
    { title: 'Vagaro Setup',             category: 'Integrations', url: 'articles/vagaro-setup.html' },
    { title: 'Inventory Sync',           category: 'Integrations', url: 'articles/inventory-sync.html' },
    { title: 'Marketplace Seller Setup', category: 'Integrations', url: 'articles/marketplace-setup.html' },
    { title: 'Color Theory Basics for Stylists', category: 'Learning', url: 'articles/color-theory.html' },
    { title: 'Understanding Levels and Tones', category: 'Learning', url: 'articles/levels-tones.html' },
    { title: 'Brand-Specific Guides',    category: 'Learning', url: 'articles/brand-guide.html' },
    { title: 'Troubleshooting Common Issues', category: 'Learning', url: 'articles/troubleshooting.html' },
    { title: 'Interactive Onboarding',     category: 'Getting Started', url: 'onboarding/index.html' },
    { title: 'Connect Your POS Walkthrough', category: 'Walkthroughs', url: 'walkthroughs/index.html#pos' },
    { title: 'Create a Formula Walkthrough', category: 'Walkthroughs', url: 'walkthroughs/index.html#formula' },
    { title: 'Convert a Formula Walkthrough', category: 'Walkthroughs', url: 'walkthroughs/index.html#convert' },
    { title: 'Share to Marketplace Walkthrough', category: 'Walkthroughs', url: 'walkthroughs/index.html#marketplace' },
    { title: 'View Client Profile Walkthrough', category: 'Walkthroughs', url: 'walkthroughs/index.html#client' },
  ];

  let resultsEl = document.createElement('div');
  resultsEl.className = 'search-results';
  input.parentNode.appendChild(resultsEl);

  function renderResults(q) {
    const term = q.trim().toLowerCase();
    if (!term) { resultsEl.classList.remove('active'); return; }

    const hits = index.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );

    if (!hits.length) {
      resultsEl.innerHTML = '<div class="search-result-item"><p>No results found.</p></div>';
      resultsEl.classList.add('active');
      return;
    }

    resultsEl.innerHTML = hits.map(h => `
      <a href="${h.url}" class="search-result-item">
        <h4>${highlight(h.title, term)}</h4>
        <span class="tag">${h.category}</span>
      </a>
    `).join('');
    resultsEl.classList.add('active');
  }

  function highlight(text, term) {
    const re = new RegExp(`(${term})`, 'gi');
    return text.replace(re, '<mark style="background:rgba(91,45,140,0.15);color:var(--accent-dark);border-radius:2px;padding:0 2px;">$1</mark>');
  }

  input.addEventListener('input', e => renderResults(e.target.value));
  input.addEventListener('focus', () => { if (input.value.trim()) renderResults(input.value); });

  document.addEventListener('click', e => {
    if (!input.parentNode.contains(e.target)) resultsEl.classList.remove('active');
  });

  // Keyboard nav
  input.addEventListener('keydown', e => {
    const items = resultsEl.querySelectorAll('.search-result-item');
    if (!items.length) return;
    const active = resultsEl.querySelector('.search-result-item.active');
    let idx = Array.from(items).indexOf(active);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idx = (idx + 1) % items.length;
      items.forEach(i => i.classList.remove('active'));
      items[idx].classList.add('active');
      items[idx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idx = idx <= 0 ? items.length - 1 : idx - 1;
      items.forEach(i => i.classList.remove('active'));
      items[idx].classList.add('active');
      items[idx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && active) {
      window.location.href = active.getAttribute('href');
    }
  });
});
