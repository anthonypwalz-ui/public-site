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

// Quote form submission
var INTAKE_ENDPOINT = 'https://vzwecznvjwlzcaidzgmz.functions.supabase.co/customer-intake';
var COMPANY_ID = '11111111-1111-1111-1111-111111111111';

(function () {
  var form = document.getElementById('quote-form');
  if (!form) return;

  var submitBtn  = document.getElementById('submit-btn');
  var errorMsg   = document.getElementById('error-msg');
  var formView   = document.getElementById('form-view');
  var successView = document.getElementById('success-view');

  function showError(msg) { errorMsg.textContent = msg; errorMsg.style.display = 'block'; }
  function hideError()    { errorMsg.style.display = 'none'; }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideError();

    var data = new FormData(form);
    var name = (data.get('name') || '').trim();
    if (!name) { showError('Please enter your full name.'); return; }

    var payload = {
      companyId:   COMPANY_ID,
      name:        name,
      email:       (data.get('email')   || '').trim() || undefined,
      phone:       (data.get('phone')   || '').trim() || undefined,
      street:      (data.get('address') || '').trim() || undefined,
      city:        (data.get('city')    || '').trim() || undefined,
      state:       (data.get('state')   || '').trim() || undefined,
      postalCode:  (data.get('zip')     || '').trim() || undefined,
      isEmergency: data.get('emergency') === 'yes',
      details:     (data.get('details') || '').trim() || undefined,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      var res = await fetch(INTAKE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      var json = await res.json().catch(function () { return {}; });

      if (!res.ok) {
        throw new Error(json.error || 'Server error (' + res.status + ')');
      }

      formView.style.display = 'none';
      successView.style.display = 'block';
    } catch (err) {
      showError((err && err.message) || 'Something went wrong. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send request';
    }
  });
})();
