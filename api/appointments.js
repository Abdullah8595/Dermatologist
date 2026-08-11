const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const SERVICES = new Set([
  'Signature Facial', 'Acne Treatment', 'Anti-Aging Therapy',
  'Laser Treatment', 'Skin Brightening', 'Chemical Peel', 'Hydra Facial'
]);

function clean(value, max = 1000) {
  return String(value ?? '').trim().slice(0, max);
}

function validate(body) {
  if (clean(body.website)) return 'Invalid submission.';
  if (clean(body.name, 101).length < 2 || clean(body.name, 101).length > 100) return 'Please enter a valid name.';
  if (!/^[+\d][\d\s()-]{7,}$/.test(clean(body.phone, 40))) return 'Please enter a valid phone number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(body.email, 255))) return 'Please enter a valid email address.';
  if (!SERVICES.has(clean(body.service, 100))) return 'Please select a valid service.';
  const selected = new Date(`${clean(body.date, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(selected.getTime()) || selected < today) return 'Please select a current or future date.';
  if (clean(body.message, 1001).length > 1000) return 'Message must be under 1,000 characters.';
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not configured.');
    return res.status(503).json({ message: 'Booking service is not configured yet.' });
  }

  const error = validate(req.body || {});
  if (error) return res.status(400).json({ message: error });

  const appointment = {
    reference: `LSC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    name: clean(req.body.name, 100),
    phone: clean(req.body.phone, 40),
    email: clean(req.body.email, 255).toLowerCase(),
    service: clean(req.body.service, 100),
    preferredDate: clean(req.body.date, 10),
    message: clean(req.body.message, 1000)
  };

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO appointments (reference, name, phone, email, service, preferred_date, message)
      VALUES (${appointment.reference}, ${appointment.name}, ${appointment.phone}, ${appointment.email}, ${appointment.service}, ${appointment.preferredDate}, ${appointment.message})
    `;
    return res.status(201).json({ message: 'Appointment request received.', reference: appointment.reference });
  } catch (databaseError) {
    console.error('Appointment insert failed:', databaseError);
    return res.status(500).json({ message: 'We could not save your appointment right now.' });
  }
};
