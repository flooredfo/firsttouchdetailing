/* ─────────────────────────────────────────
   FIRST TOUCH DETAILING — Booking / EmailJS
   ─────────────────────────────────────────
   TO ACTIVATE EMAIL:
   1. Sign up free at https://www.emailjs.com
   2. Add a Gmail service
   3. Create a template using the variables below
   4. Replace the 4 config values
   ───────────────────────────────────────── */

const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const OWNER_EMAIL         = 'your@email.com';   // ← your business email

emailjs.init(EMAILJS_PUBLIC_KEY);

// Set minimum date to tomorrow
const dateInput = document.getElementById('date');
if (dateInput) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

// Pre-fill service from URL param (e.g. booking.html?service=Premium)
const urlParams = new URLSearchParams(window.location.search);
const preService = urlParams.get('service');
if (preService) {
  const sel = document.getElementById('service');
  if (sel) {
    [...sel.options].forEach(o => {
      if (o.text.toLowerCase().includes(preService.toLowerCase())) sel.value = o.value;
    });
  }
}

async function submitBooking() {
  const fields = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName:  document.getElementById('lastName').value.trim(),
    email:     document.getElementById('email').value.trim(),
    phone:     document.getElementById('phone').value.trim(),
    vehicle:   document.getElementById('vehicle').value.trim(),
    vehicleSize: document.getElementById('vehicleSize').value,
    service:   document.getElementById('service').value,
    date:      document.getElementById('date').value,
    time:      document.getElementById('time').value || 'Flexible',
    notes:     document.getElementById('notes').value.trim() || 'None',
  };

  // Validate
  if (!fields.firstName || !fields.lastName || !fields.email || !fields.phone || !fields.vehicle || !fields.service || !fields.date) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  const params = {
    to_email:       OWNER_EMAIL,
    customer_name:  `${fields.firstName} ${fields.lastName}`,
    customer_email: fields.email,
    customer_phone: fields.phone,
    vehicle:        fields.vehicle,
    vehicle_size:   fields.vehicleSize || 'Not specified',
    service:        fields.service,
    date:           fields.date,
    time:           fields.time,
    notes:          fields.notes,
    reply_to:       fields.email,
  };

  try {
    // Email to owner
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    // Confirmation to customer
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      ...params,
      to_email: fields.email,
    });

    document.getElementById('formContent').style.display = 'none';
    document.getElementById('formSuccess').style.display  = 'block';

  } catch (err) {
    console.warn('EmailJS failed, falling back to mailto:', err);

    // Mailto fallback
    const subject = encodeURIComponent(`Booking Request – ${fields.firstName} ${fields.lastName}`);
    const body = encodeURIComponent(
`New Booking — First Touch Detailing

Name:         ${fields.firstName} ${fields.lastName}
Email:        ${fields.email}
Phone:        ${fields.phone}
Vehicle:      ${fields.vehicle} (${fields.vehicleSize || 'size not specified'})
Service:      ${fields.service}
Date:         ${fields.date}
Time:         ${fields.time}
Notes:        ${fields.notes}
`);
    window.open(`mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`);

    document.getElementById('formContent').style.display = 'none';
    document.getElementById('formSuccess').style.display  = 'block';
  }
}
