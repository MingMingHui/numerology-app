/**
 * script.js
 * Application entry point: wires up the form, validation, calculation trigger,
 * report rendering, theme toggle, and export/print actions.
 */

(function () {
  const N = window.Numerology;
  let currentProfile = null;
  let currentCharts = {};

  const els = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    bindEvents();
    populateDaySelect();
    initTheme();
    registerServiceWorker();
  }

  function cacheElements() {
    els.form = document.getElementById('numerology-form');
    els.firstName = document.getElementById('firstName');
    els.middleName = document.getElementById('middleName');
    els.lastName = document.getElementById('lastName');
    els.day = document.getElementById('birthDay');
    els.month = document.getElementById('birthMonth');
    els.year = document.getElementById('birthYear');
    els.gender = document.getElementById('gender');
    els.resetBtn = document.getElementById('resetBtn');
    els.excelBtn = document.getElementById('excelBtn');
    els.pdfBtn = document.getElementById('pdfBtn');
    els.printBtn = document.getElementById('printBtn');
    els.errorBox = document.getElementById('form-errors');
    els.resultsSection = document.getElementById('results-section');
    els.summaryContainer = document.getElementById('summary-container');
    els.reportContainer = document.getElementById('report-container');
    els.pyramidContainer = document.getElementById('pyramid-container');
    els.themeToggle = document.getElementById('themeToggle');
    els.navToggle = document.getElementById('navToggle');
    els.mainNav = document.getElementById('mainNav');
  }

  function bindEvents() {
    els.form.addEventListener('submit', onCalculate);
    els.resetBtn.addEventListener('click', onReset);
    els.excelBtn.addEventListener('click', onExportExcel);
    els.pdfBtn.addEventListener('click', onExportPdf);
    els.printBtn.addEventListener('click', () => window.print());
    els.themeToggle.addEventListener('click', toggleTheme);
    els.navToggle.addEventListener('click', () => {
      const expanded = els.navToggle.getAttribute('aria-expanded') === 'true';
      els.navToggle.setAttribute('aria-expanded', String(!expanded));
      els.mainNav.classList.toggle('open');
    });
    els.month.addEventListener('change', populateDaySelect);
    els.year.addEventListener('change', populateDaySelect);

    // Delegate info-icon tooltip toggling (works for dynamically rendered cards)
    document.addEventListener('click', (e) => {
      if (e.target.classList && e.target.classList.contains('info-icon')) {
        showInfoTooltip(e.target);
      }
    });
  }

  /** Populate the day <select> with the correct number of days for the chosen month/year, handling leap years */
  function populateDaySelect() {
    const month = Number(els.month.value) || 1;
    const year = Number(els.year.value) || 2000;
    const daysInMonth = new Date(year, month, 0).getDate();
    const current = Number(els.day.value) || 1;

    els.day.innerHTML = '';
    for (let d = 1; d <= daysInMonth; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === current && d <= daysInMonth) opt.selected = true;
      els.day.appendChild(opt);
    }
  }

  function showInfoTooltip(btn) {
    const text = btn.getAttribute('data-tooltip');
    let tip = document.getElementById('global-info-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'global-info-tooltip';
      tip.className = 'info-tooltip-popup';
      document.body.appendChild(tip);
    }
    const isSame = tip.dataset.owner === btn.id && tip.style.display === 'block';
    if (isSame) {
      tip.style.display = 'none';
      return;
    }
    tip.textContent = text;
    tip.style.display = 'block';
    const rect = btn.getBoundingClientRect();
    tip.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
    tip.style.top = `${rect.bottom + window.scrollY + 6}px`;
    tip.dataset.owner = btn.id || '';

    document.addEventListener('click', function closeOnce(ev) {
      if (ev.target !== btn) {
        tip.style.display = 'none';
        document.removeEventListener('click', closeOnce);
      }
    });
  }

  /* ============================================================
   * VALIDATION
   * ============================================================ */

  function validateForm() {
    const errors = [];
    const nameRegex = /^[A-Za-z\s\-'.]+$/;

    const firstName = els.firstName.value.trim();
    const lastName = els.lastName.value.trim();
    const middleName = els.middleName.value.trim();

    if (!firstName) errors.push('First name is required.');
    else if (!nameRegex.test(firstName)) errors.push('First name contains invalid characters. Use letters only.');

    if (!lastName) errors.push('Last name is required.');
    else if (!nameRegex.test(lastName)) errors.push('Last name contains invalid characters. Use letters only.');

    if (middleName && !nameRegex.test(middleName)) errors.push('Middle name contains invalid characters. Use letters only.');

    const day = Number(els.day.value);
    const month = Number(els.month.value);
    const year = Number(els.year.value);

    if (!els.year.value) {
      errors.push('Birth year is required.');
    } else {
      const dateCheck = N.validateBirthDate(day, month, year);
      if (!dateCheck.valid) errors.push(dateCheck.message);
    }

    return errors;
  }

  function renderErrors(errors) {
    if (!errors.length) {
      els.errorBox.hidden = true;
      els.errorBox.innerHTML = '';
      return;
    }
    els.errorBox.hidden = false;
    els.errorBox.innerHTML = `
      <strong>Please fix the following before continuing:</strong>
      <ul>${errors.map((e) => `<li>${e}</li>`).join('')}</ul>`;
    els.errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ============================================================
   * CALCULATE / RENDER
   * ============================================================ */

  function onCalculate(e) {
    e.preventDefault();
    const errors = validateForm();
    renderErrors(errors);
    if (errors.length) return;

    const input = {
      firstName: els.firstName.value.trim(),
      middleName: els.middleName.value.trim(),
      lastName: els.lastName.value.trim(),
      day: Number(els.day.value),
      month: Number(els.month.value),
      year: Number(els.year.value),
      gender: els.gender.value
    };

    currentProfile = N.calculateFullProfile(input);
    renderResults(currentProfile);
  }

  function renderResults(profile) {
    els.resultsSection.hidden = false;
    els.summaryContainer.innerHTML = window.NumerologyReport.renderSummary(profile);
    els.reportContainer.innerHTML = window.NumerologyReport.renderFullReport(profile);

    window.NumerologyPyramid.renderPyramid('#pyramid-container', profile.pinnacles, profile.challenges);

    // Destroy previous chart instances to avoid canvas re-use errors
    Object.values(currentCharts).forEach((c) => c && c.destroy && c.destroy());
    currentCharts = window.NumerologyReport.renderCharts(profile);

    els.excelBtn.disabled = false;
    els.pdfBtn.disabled = false;
    els.printBtn.disabled = false;

    els.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    saveToLocalStorage(profile);
  }

  function onReset() {
    els.form.reset();
    populateDaySelect();
    renderErrors([]);
    els.resultsSection.hidden = true;
    els.excelBtn.disabled = true;
    els.pdfBtn.disabled = true;
    els.printBtn.disabled = true;
    currentProfile = null;
  }

  /* ============================================================
   * EXPORTS
   * ============================================================ */

  function onExportExcel() {
    if (!currentProfile) return;
    window.NumerologyExcel.exportToExcel(currentProfile);
  }

  function onExportPdf() {
    if (!currentProfile) return;
    const btn = els.pdfBtn;
    const originalText = btn.textContent;
    btn.textContent = 'Generating PDF…';
    btn.disabled = true;

    const reportEl = document.getElementById('report-root');
    const { jsPDF } = window.jspdf;

    html2canvas(reportEl, { backgroundColor: '#0b1330', scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Numerology_Report_${currentProfile.meta.fullName.replace(/\s+/g, '_')}.pdf`);
      btn.textContent = originalText;
      btn.disabled = false;
    }).catch((err) => {
      console.error('PDF generation failed:', err);
      alert('Sorry, PDF generation failed. You can still use Print → Save as PDF from your browser.');
      btn.textContent = originalText;
      btn.disabled = false;
    });
  }

  /* ============================================================
   * THEME
   * ============================================================ */

  function initTheme() {
    const saved = localStorage.getItem('numerology-theme');
    if (saved === 'light') document.body.classList.add('theme-light');
  }

  function toggleTheme() {
    document.body.classList.toggle('theme-light');
    localStorage.setItem('numerology-theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
  }

  /* ============================================================
   * PERSISTENCE (last report autosave, offline-friendly)
   * ============================================================ */

  function saveToLocalStorage(profile) {
    try {
      localStorage.setItem('numerology-last-report', JSON.stringify(profile.meta));
    } catch (e) {
      // localStorage may be unavailable (private browsing) — fail silently
    }
  }

  /* ============================================================
   * PWA SERVICE WORKER
   * ============================================================ */

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {
          // Non-fatal: app still works fully online without SW
        });
      });
    }
  }
})();
