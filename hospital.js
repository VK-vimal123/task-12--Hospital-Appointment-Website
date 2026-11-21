document.addEventListener('DOMContentLoaded', () => {
  const siteHeader = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');

  const appointmentForm = document.getElementById('appointmentForm');
  const departmentSelect = document.getElementById('departmentSelect');
  const doctorSelect = document.getElementById('doctorSelect');
  const appointmentDateInput = document.getElementById('appointmentDate');
  const timeSlotSelect = document.getElementById('timeSlot');
  const patientPhoneInput = document.getElementById('patientPhone');
  const bookingConfirmation = document.getElementById('bookingConfirmation');
  const confirmationSummary = document.getElementById('confirmationSummary');
  const bookAnotherBtn = document.getElementById('bookAnotherBtn');

  const contactForm = document.getElementById('contactForm');
  const contactFeedback = document.getElementById('contactFeedback');

  const allDoctorOptions = Array.from(doctorSelect.querySelectorAll('option[data-dept]'));

  // Doctor-specific consultation time slots
  const DOCTOR_SCHEDULES = {
    'Dr. Arvind Subramanian': [
      '09:00 AM - 10:00 AM (Morning Cardiac OPD)',
      '11:30 AM - 12:30 PM (Echo & Consultation)',
      '04:30 PM - 05:30 PM (Evening OPD)'
    ],
    'Dr. Meera Krishnamurthy': [
      '10:00 AM - 11:00 AM (Morning Neuro OPD)',
      '02:00 PM - 03:00 PM (Afternoon OPD)',
      '05:00 PM - 06:00 PM (Evening OPD)'
    ],
    'Dr. Kavitha Rajan': [
      '09:30 AM - 10:30 AM (Well-Baby & Immunization)',
      '11:00 AM - 12:00 PM (Morning Pediatrics OPD)',
      '04:00 PM - 05:30 PM (After-School Clinic)'
    ],
    'Dr. Vikramaditya Nair': [
      '08:30 AM - 09:30 AM (Early Ortho & Sports OPD)',
      '01:30 PM - 02:30 PM (Afternoon OPD)',
      '06:00 PM - 07:00 PM (Evening Joint Clinic)'
    ],
    'Dr. Ananya Deshmukh': [
      '10:30 AM - 11:30 AM (Morning Skin OPD)',
      '03:00 PM - 04:00 PM (Afternoon Dermoscopy)',
      '05:30 PM - 06:30 PM (Evening OPD)'
    ],
    'Dr. Siddharth Menon': [
      '08:00 AM - 09:30 AM (Fasting Checkup & Primary Care)',
      '11:00 AM - 12:30 PM (Morning General OPD)',
      '04:30 PM - 06:00 PM (Evening General OPD)'
    ]
  };

  const DEFAULT_SLOTS = [
    '09:30 AM - 10:30 AM (Morning OPD)',
    '11:00 AM - 12:00 PM (Mid-Morning OPD)',
    '02:30 PM - 03:30 PM (Afternoon OPD)',
    '05:00 PM - 06:00 PM (Evening OPD)'
  ];

  function getTodayLocalISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function setMinimumAppointmentDate() {
    if (appointmentDateInput) {
      appointmentDateInput.min = getTodayLocalISO();
    }
  }

  function updateTimeSlotsForDoctor(doctorName) {
    const slots = DOCTOR_SCHEDULES[doctorName] || DEFAULT_SLOTS;
    timeSlotSelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = doctorName
      ? `Select available slot for ${doctorName}`
      : 'Select preferred time window';
    timeSlotSelect.appendChild(placeholder);

    slots.forEach((slotLabel) => {
      const option = document.createElement('option');
      option.value = slotLabel;
      option.textContent = slotLabel;
      timeSlotSelect.appendChild(option);
    });
  }

  function toggleMobileMenu(forceClose = false) {
    const shouldOpen = forceClose ? false : !mainNav.classList.contains('open');
    mainNav.classList.toggle('open', shouldOpen);
    menuToggle.classList.toggle('open', shouldOpen);
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
  }

  function filterDoctorsByDepartment(selectedDepartment) {
    const currentDoctorValue = doctorSelect.value;
    doctorSelect.innerHTML = '<option value="">Choose a specialist</option>';

    const matchingDoctors = selectedDepartment
      ? allDoctorOptions.filter((option) => option.dataset.dept === selectedDepartment)
      : allDoctorOptions;

    matchingDoctors.forEach((option) => {
      doctorSelect.appendChild(option.cloneNode(true));
    });

    const stillExists = matchingDoctors.some((option) => option.value === currentDoctorValue);
    if (stillExists) {
      doctorSelect.value = currentDoctorValue;
    } else {
      updateTimeSlotsForDoctor('');
    }
  }

  function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    if (message) {
      inputEl.classList.add('invalid');
      errorEl.textContent = message;
    } else {
      inputEl.classList.remove('invalid');
      errorEl.textContent = '';
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function validateAppointmentForm() {
    let isValid = true;

    const nameInput = document.getElementById('patientName');
    const emailInput = document.getElementById('patientEmail');

    const nameVal = nameInput.value.trim();
    const phoneVal = patientPhoneInput.value.trim();
    const emailVal = emailInput.value.trim();
    const deptVal = departmentSelect.value;
    const doctorVal = doctorSelect.value;
    const dateVal = appointmentDateInput.value;
    const slotVal = timeSlotSelect.value;

    if (nameVal.length < 2) {
      setFieldError(nameInput, document.getElementById('patientNameError'), 'Please enter the patient’s full name.');
      isValid = false;
    } else {
      setFieldError(nameInput, document.getElementById('patientNameError'), '');
    }

    if (!/^\d{10}$/.test(phoneVal)) {
      setFieldError(patientPhoneInput, document.getElementById('patientPhoneError'), 'Enter a valid 10-digit mobile number.');
      isValid = false;
    } else {
      setFieldError(patientPhoneInput, document.getElementById('patientPhoneError'), '');
    }

    if (!isValidEmail(emailVal)) {
      setFieldError(emailInput, document.getElementById('patientEmailError'), 'Enter a valid email address.');
      isValid = false;
    } else {
      setFieldError(emailInput, document.getElementById('patientEmailError'), '');
    }

    if (!deptVal) {
      setFieldError(departmentSelect, document.getElementById('departmentSelectError'), 'Please select a medical department.');
      isValid = false;
    } else {
      setFieldError(departmentSelect, document.getElementById('departmentSelectError'), '');
    }

    if (!doctorVal) {
      setFieldError(doctorSelect, document.getElementById('doctorSelectError'), 'Please choose a specialist.');
      isValid = false;
    } else {
      setFieldError(doctorSelect, document.getElementById('doctorSelectError'), '');
    }

    const todayISO = getTodayLocalISO();
    if (!dateVal) {
      setFieldError(appointmentDateInput, document.getElementById('appointmentDateError'), 'Please select a preferred date.');
      isValid = false;
    } else if (dateVal < todayISO) {
      setFieldError(appointmentDateInput, document.getElementById('appointmentDateError'), 'Past dates cannot be selected.');
      isValid = false;
    } else {
      setFieldError(appointmentDateInput, document.getElementById('appointmentDateError'), '');
    }

    if (!slotVal) {
      setFieldError(timeSlotSelect, document.getElementById('timeSlotError'), 'Please select an available time slot.');
      isValid = false;
    } else {
      setFieldError(timeSlotSelect, document.getElementById('timeSlotError'), '');
    }

    return isValid;
  }

  function renderBookingSummary() {
    const patientName = document.getElementById('patientName').value.trim();
    const patientPhone = patientPhoneInput.value.trim();
    const patientEmail = document.getElementById('patientEmail').value.trim();
    const department = departmentSelect.value;
    const doctor = doctorSelect.value;
    const rawDate = appointmentDateInput.value;
    const timeSlot = timeSlotSelect.value;
    const message = document.getElementById('patientMessage').value.trim();

    const formattedDate = new Date(`${rawDate}T00:00:00`).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const rows = [
      { label: 'Patient Name', value: patientName },
      { label: 'Phone / Email', value: `${patientPhone} • ${patientEmail}` },
      { label: 'Department', value: department },
      { label: 'Specialist', value: doctor },
      { label: 'Preferred Date', value: formattedDate },
      { label: 'Time Window', value: timeSlot },
    ];

    if (message) {
      rows.push({ label: 'Notes', value: message });
    }

    confirmationSummary.innerHTML = rows
      .map(
        (row) => `
        <div class="summary-row">
          <span>${escapeHTML(row.label)}</span>
          <strong>${escapeHTML(row.value)}</strong>
        </div>`
      )
      .join('');
  }

  // Header scroll elevation & active link tracking
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 16);

    const scrollPosition = window.scrollY + 140;
    document.querySelectorAll('main section[id]').forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  });

  // Mobile navigation events
  menuToggle.addEventListener('click', () => toggleMobileMenu());

  mainNav.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener('click', () => toggleMobileMenu(true));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mainNav.classList.contains('open')) {
      toggleMobileMenu(true);
    }
  });

  // Restrict phone input to digits only
  patientPhoneInput.addEventListener('input', () => {
    patientPhoneInput.value = patientPhoneInput.value.replace(/\D/g, '').slice(0, 10);
  });

  // Sync department, doctor, and doctor's time slots
  departmentSelect.addEventListener('change', () => {
    filterDoctorsByDepartment(departmentSelect.value);
  });

  doctorSelect.addEventListener('change', () => {
    const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.dept) {
      departmentSelect.value = selectedOption.dataset.dept;
    }
    updateTimeSlotsForDoctor(doctorSelect.value);
  });

  // Pre-fill appointment form from service links
  document.querySelectorAll('.service-link[data-dept]').forEach((link) => {
    link.addEventListener('click', () => {
      const dept = link.dataset.dept;
      bookingConfirmation.hidden = true;
      appointmentForm.hidden = false;
      departmentSelect.value = dept;
      filterDoctorsByDepartment(dept);
      updateTimeSlotsForDoctor(doctorSelect.value);
    });
  });

  // Pre-fill doctor, department, and doctor's exact time slots when clicking a doctor card
  document.querySelectorAll('.book-doctor-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const doctorName = button.dataset.doctor;
      const departmentName = button.dataset.department;

      bookingConfirmation.hidden = true;
      appointmentForm.hidden = false;

      departmentSelect.value = departmentName;
      filterDoctorsByDepartment(departmentName);
      doctorSelect.value = doctorName;
      updateTimeSlotsForDoctor(doctorName);

      const appointmentSection = document.getElementById('appointment');
      appointmentSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        timeSlotSelect.focus();
      }, 450);
    });
  });

  // Appointment submission
  appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateAppointmentForm()) return;

    renderBookingSummary();
    appointmentForm.hidden = true;
    bookingConfirmation.hidden = false;
    bookingConfirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  bookAnotherBtn.addEventListener('click', () => {
    appointmentForm.reset();
    filterDoctorsByDepartment('');
    updateTimeSlotsForDoctor('');
    setMinimumAppointmentDate();
    bookingConfirmation.hidden = true;
    appointmentForm.hidden = false;
  });

  // Contact form validation & preview response
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;

    const cName = document.getElementById('contactName');
    const cEmail = document.getElementById('contactEmail');
    const cSubject = document.getElementById('contactSubject');
    const cMessage = document.getElementById('contactMessage');

    if (cName.value.trim().length < 2) {
      setFieldError(cName, document.getElementById('contactNameError'), 'Please enter your name.');
      isValid = false;
    } else {
      setFieldError(cName, document.getElementById('contactNameError'), '');
    }

    if (!isValidEmail(cEmail.value)) {
      setFieldError(cEmail, document.getElementById('contactEmailError'), 'Please enter a valid email address.');
      isValid = false;
    } else {
      setFieldError(cEmail, document.getElementById('contactEmailError'), '');
    }

    if (cSubject.value.trim().length < 3) {
      setFieldError(cSubject, document.getElementById('contactSubjectError'), 'Please enter a brief subject.');
      isValid = false;
    } else {
      setFieldError(cSubject, document.getElementById('contactSubjectError'), '');
    }

    if (cMessage.value.trim().length < 10) {
      setFieldError(cMessage, document.getElementById('contactMessageError'), 'Please enter at least 10 characters.');
      isValid = false;
    } else {
      setFieldError(cMessage, document.getElementById('contactMessageError'), '');
    }

    if (!isValid) return;

    contactFeedback.textContent = `Thank you, ${cName.value.trim()}. Your inquiry regarding "${cSubject.value.trim()}" has been validated in this frontend demo.`;
    contactFeedback.hidden = false;
    contactForm.reset();
  });

  setMinimumAppointmentDate();
});