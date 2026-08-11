const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');

function closeMenu() {
  menuToggle.classList.remove('active');
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  document.body.style.overflow = '';
}

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.classList.toggle('active', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navAnchors.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 24); }
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach(section => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const form = document.querySelector('#booking-form');
const dateInput = document.querySelector('#date');
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
dateInput.min = localToday;

function showError(input, message) {
  const group = input.closest('.form-group');
  group.classList.add('invalid');
  group.querySelector('.error').textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
  const group = input.closest('.form-group');
  group.classList.remove('invalid');
  group.querySelector('.error').textContent = '';
  input.removeAttribute('aria-invalid');
}

function validateField(input) {
  clearError(input);
  const value = input.value.trim();
  if (input.required && !value) { showError(input, 'This field is required.'); return false; }
  if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { showError(input, 'Enter a valid email address.'); return false; }
  if (input.type === 'tel' && value && !/^[+\d][\d\s()-]{7,}$/.test(value)) { showError(input, 'Enter a valid phone number.'); return false; }
  if (input.type === 'date' && value && value < localToday) { showError(input, 'Please select a future date.'); return false; }
  return true;
}

const requiredFields = [...form.querySelectorAll('[required]')];
requiredFields.forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => { if (input.getAttribute('aria-invalid')) validateField(input); });
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const isValid = requiredFields.map(validateField).every(Boolean);
  const success = document.querySelector('#form-success');
  success.classList.remove('show', 'failure');
  if (!isValid) {
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  const submitButton = form.querySelector('.submit-btn');
  const originalLabel = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending request…';
  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch('/api/appointments', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Unable to submit your request.');
    success.textContent = `Thank you! Your booking reference is ${result.reference}. Our team will contact you shortly.`;
    success.classList.add('show');
    form.reset();
    dateInput.min = localToday;
  } catch (error) {
    success.textContent = `${error.message} Please call or WhatsApp us if the problem continues.`;
    success.classList.add('failure');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalLabel;
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();
