(function () {
  'use strict';
  var page = location.pathname.split('/').pop() || 'index.html';

  var NAV = '<nav class="site-nav">' +
    '<div class="nav-inner">' +
      '<a class="nav-brand" href="index.html">' +
        '<div class="nav-logo">' +
          '<svg viewBox="0 0 24 24"><path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z" fill="#1b2e24"/></svg>' +
        '</div>' +
        '<span class="nav-brand-name">NP<em>Lawn</em> LLC</span>' +
      '</a>' +
      '<button class="nav-toggle" id="navToggle" aria-label="Menu">&#9776;</button>' +
      '<div class="nav-links" id="navLinks">' +

        '<div class="nav-drop" id="servDrop">' +
          '<button class="nav-link nav-link--drop" id="servBtn">Services &#9662;</button>' +
          '<div class="nav-drop-menu">' +

            '<a href="mowing.html">' +
              '<div class="drop-icon"><svg viewBox="0 0 24 24"><path d="M3 17h18M3 12h18M3 7h18"/><circle cx="6" cy="17" r="1.5" fill="#74c69d" stroke="none"/></svg></div>' +
              '<div class="drop-text"><strong>Lawn Mowing</strong><small>Scheduled cuts &amp; edging</small></div>' +
            '</a>' +

            '<a href="tree-trimming.html">' +
              '<div class="drop-icon"><svg viewBox="0 0 24 24"><path d="M12 22V10M6 4l6 6 6-6"/><path d="M4 14l8 8 8-8"/></svg></div>' +
              '<div class="drop-text"><strong>Tree Trimming</strong><small>Pruning &amp; crown shaping</small></div>' +
            '</a>' +

            '<div class="drop-divider"></div>' +

            '<a href="lawn-care.html">' +
              '<div class="drop-icon"><svg viewBox="0 0 24 24"><path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/></svg></div>' +
              '<div class="drop-text"><strong>Lawn Care Plans</strong><small>GrassBasic · GrassPro · GrassNatural</small></div>' +
            '</a>' +

            '<a href="tree-shrubs.html">' +
              '<div class="drop-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M12 13v9M9 22h6"/></svg></div>' +
              '<div class="drop-text"><strong>Tree &amp; Shrubs</strong><small>Planting &amp; maintenance</small></div>' +
            '</a>' +

            '<a href="aeration-seeding.html">' +
              '<div class="drop-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg></div>' +
              '<div class="drop-text"><strong>Aeration &amp; Seeding</strong><small>Core aeration &amp; overseeding</small></div>' +
            '</a>' +

            '<a href="landscape-design.html">' +
              '<div class="drop-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>' +
              '<div class="drop-text"><strong>Landscape Design</strong><small>Custom outdoor spaces</small></div>' +
            '</a>' +

          '</div>' +
        '</div>' +

        '<a class="nav-link" href="blog.html">Blog</a>' +
        '<a class="nav-link" href="about.html">About</a>' +
        '<a class="nav-link" href="contact.html">Contact</a>' +
        '<a class="nav-cta" href="contact.html">Free Quote</a>' +
      '</div>' +
    '</div>' +
  '</nav>';

  var placeholder = document.getElementById('site-nav');
  if (placeholder) {
    placeholder.outerHTML = NAV;
  } else {
    document.body.insertAdjacentHTML('afterbegin', NAV);
  }

  /* active link */
  document.querySelectorAll('.nav-link[href]').forEach(function (a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* dropdown */
  var servBtn  = document.getElementById('servBtn');
  var servDrop = document.getElementById('servDrop');
  if (servBtn && servDrop) {
    servBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      servDrop.classList.toggle('open');
    });
    document.addEventListener('click', function () {
      servDrop.classList.remove('open');
    });
  }

  /* mobile toggle */
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? '\u2715' : '\u2630'; /* ✕ / ☰ */
    });
    /* close nav when a page link is tapped on mobile */
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '\u2630';
      }
    });
  }
}());
