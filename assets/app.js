// Small progressive enhancements for the public site.
(function () {
  'use strict';

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mark current nav link active if not already marked
  try {
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href === path && !a.classList.contains('active')) a.classList.add('active');
    });
  } catch (e) { /* noop */ }
})();

// Quote form handler — no backend wired yet. This just provides friendly UX.
// When you connect to a backend, replace the body of this function with a fetch().
function handleQuoteSubmit(event) {
  event.preventDefault();
  var form = event.target;
  var success = document.getElementById('quote-success');
  // Basic honeypot-ish: require name + email + location
  var data = new FormData(form);
  if (!data.get('name') || !data.get('email') || !data.get('location')) {
    return false;
  }
  // Simulate success for now
  if (success) {
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  form.reset();
  return false;
}
