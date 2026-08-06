/**
 * report.js
 * Builds the on-screen / printable numerology report from a computed profile,
 * including Chart.js visualizations and the personal-year timeline.
 * Depends on: window.Numerology, window.NumerologyPyramid, Chart.js (global Chart)
 */

const N = window.Numerology;

/** Small helper to render a labeled "card" for one calculation result */
function renderNumberCard({ id, title, description, result, meaning, extraSteps }) {
  const value = result.value;
  const m = meaning || (value != null ? N.getMeaning(value) : null);
  const stepsHtml = (extraSteps || result.steps || [])
    .map((s) => `<li>${s}</li>`)
    .join('');

  const masterBadge = result.isMaster
    ? `<span class="badge badge-master" title="Master numbers carry amplified spiritual significance and are not reduced further.">Master Number</span>`
    : '';
  const karmicBadge = result.isKarmicDebt
    ? `<span class="badge badge-karmic" title="${N.KARMIC_DEBT_MEANINGS[result.karmicDebtNumber]?.theme || ''}">Karmic Debt ${result.karmicDebtNumber}</span>`
    : '';

  return `
  <article class="calc-card" id="${id}">
    <header class="calc-card-header">
      <h3>${title} <button class="info-icon" type="button" aria-label="What is ${title}?" data-tooltip="${description.replace(/"/g, '&quot;')}">i</button></h3>
      <div class="calc-value">${value != null ? value : '—'} ${masterBadge} ${karmicBadge}</div>
    </header>
    <p class="calc-desc">${description}</p>
    <details class="calc-breakdown">
      <summary>Show calculation steps</summary>
      <ol>${stepsHtml}</ol>
    </details>
    ${m ? renderMeaningBlock(m) : ''}
  </article>`;
}

function renderMeaningBlock(m) {
  return `
    <div class="meaning-block">
      <h4>${m.title}</h4>
      <div class="trait-grid">
        <div><strong>Positive traits</strong><ul>${m.positive.map((t) => `<li>${t}</li>`).join('')}</ul></div>
        <div><strong>Growth areas</strong><ul>${m.negative.map((t) => `<li>${t}</li>`).join('')}</ul></div>
        <div><strong>Suitable careers</strong><ul>${m.career.map((t) => `<li>${t}</li>`).join('')}</ul></div>
        <div><strong>Strengths</strong><ul>${m.strengths.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      </div>
      <p><strong>Relationships:</strong> ${m.relationships}</p>
      <p><strong>Finance:</strong> ${m.finance}</p>
      <p><strong>Health:</strong> ${m.health}</p>
      <p><strong>Life lessons:</strong> ${m.lifeLessons}</p>
      <p><strong>Compatible numbers:</strong> ${m.compatibility.join(', ')} &nbsp;|&nbsp;
         <strong>Lucky colors:</strong> ${m.luckyColors.join(', ')} &nbsp;|&nbsp;
         <strong>Lucky days:</strong> ${m.luckyDays.join(', ')} &nbsp;|&nbsp;
         <strong>Lucky numbers:</strong> ${m.luckyNumbers.join(', ')}</p>
      <p><strong>Suggested improvement:</strong> ${m.improvements}</p>
    </div>`;
}

/** Karmic Lessons + Debts summary card (no single "meaning" number) */
function renderKarmicSection(profile) {
  const lessonsRow = N.KARMIC_DEBT_NUMBERS.length; // unused, placeholder-safe
  const missing = profile.karmicLessons.missingNumbers;
  const debtRows = profile.karmicDebts.length
    ? profile.karmicDebts.map((d) => `
        <div class="karmic-debt-row">
          <strong>${d.number} (found in ${d.label})</strong>
          <p>${N.KARMIC_DEBT_MEANINGS[d.number].theme}</p>
          <p><em>Lessons:</em> ${N.KARMIC_DEBT_MEANINGS[d.number].lessons.join(', ')}</p>
        </div>`).join('')
    : '<p>No karmic debt numbers (13, 14, 16, 19) were detected in your core calculations.</p>';

  return `
  <article class="calc-card" id="calc-karmic">
    <header class="calc-card-header">
      <h3>Karmic Lessons &amp; Karmic Debt Numbers</h3>
    </header>
    <p class="calc-desc">Karmic Lessons reveal number-energies missing from your name — skills your soul is here to develop. Karmic Debt numbers (13, 14, 16, 19) point to lessons carried over from past-life patterns.</p>
    <p><strong>Missing numbers (Karmic Lessons):</strong> ${missing.join(', ') || 'None — all energies 1-9 are present in your name.'}</p>
    ${debtRows}
  </article>`;
}

/** Bridges, Plane of Expression, Cycles combined "advanced insights" card */
function renderAdvancedSection(profile) {
  return `
  <article class="calc-card" id="calc-advanced">
    <header class="calc-card-header"><h3>Advanced Insights</h3></header>
    <div class="advanced-grid">
      <div>
        <h4>Bridge Numbers</h4>
        <ul>${profile.bridges.steps.map((s) => `<li>${s}</li>`).join('')}</ul>
      </div>
      <div>
        <h4>Plane of Expression</h4>
        <p>Dominant plane: <strong>${profile.plane.dominant}</strong></p>
        <ul>${profile.plane.steps.map((s) => `<li>${s}</li>`).join('')}</ul>
      </div>
      <div>
        <h4>Life Cycles</h4>
        <ul>${profile.lifeCycles.steps.map((s) => `<li>${s}</li>`).join('')}</ul>
      </div>
      <div>
        <h4>Universal Vibrations (today)</h4>
        <p>Universal Year: <strong>${profile.universalYear.value}</strong>,
           Universal Month: <strong>${profile.universalMonth.value}</strong>,
           Universal Day: <strong>${profile.universalDay.value}</strong></p>
      </div>
    </div>
  </article>`;
}

/** Build the 12-month personal-month timeline plus a 9-year personal-year cycle preview */
function renderTimeline(profile) {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 12; i++) {
    const m = ((now.getMonth() + i) % 12) + 1;
    const pm = N.calcPersonalMonth(profile.personalYear.value, m).value;
    const monthName = new Date(2000, m - 1, 1).toLocaleString('default', { month: 'short' });
    months.push({ monthName, value: pm });
  }

  const years = [];
  for (let i = 0; i < 9; i++) {
    const y = now.getFullYear() + i;
    const py = N.calcPersonalYear(profile.meta.day, profile.meta.month, y).value;
    years.push({ year: y, value: py });
  }

  return `
  <article class="calc-card" id="calc-timeline">
    <header class="calc-card-header"><h3>Personal Timeline</h3></header>
    <p class="calc-desc">Your Personal Year cycles through numbers 1–9, shaping the theme of each year and month of your life.</p>
    <h4>Current cycle: Personal Year ${profile.personalYear.value}, Personal Month ${profile.personalMonth.value}, Personal Day ${profile.personalDay.value}</h4>
    <div class="timeline-scroll">
      ${months.map((m) => `<div class="timeline-chip"><span class="tl-month">${m.monthName}</span><span class="tl-value">${m.value}</span></div>`).join('')}
    </div>
    <h4>Upcoming Personal Years</h4>
    <div class="timeline-scroll">
      ${years.map((y) => `<div class="timeline-chip ${y.year === now.getFullYear() ? 'timeline-chip-active' : ''}"><span class="tl-month">${y.year}</span><span class="tl-value">${y.value}</span></div>`).join('')}
    </div>
  </article>`;
}

/** Assemble every calculation card in order into the report container */
function renderFullReport(profile) {
  const p = profile;
  const cards = [];

  cards.push(renderNumberCard({
    id: 'calc-lifepath', title: '1. Life Path Number',
    description: 'The sum of your full birth date — the single most important number, describing your core life journey and purpose.',
    result: p.lifePath
  }));
  cards.push(renderNumberCard({
    id: 'calc-destiny', title: '2. Destiny / Expression Number',
    description: 'Derived from every letter in your full birth name — reveals your natural talents and the path to fulfilling them.',
    result: p.destiny
  }));
  cards.push(renderNumberCard({
    id: 'calc-soulurge', title: '3. Soul Urge (Heart\'s Desire) Number',
    description: 'Calculated from the vowels in your name — reflects your inner motivations and true desires.',
    result: p.soulUrge
  }));
  cards.push(renderNumberCard({
    id: 'calc-personality', title: '4. Personality Number',
    description: 'Calculated from the consonants in your name — represents the impression you make on others.',
    result: p.personality
  }));
  cards.push(renderNumberCard({
    id: 'calc-birthday', title: '5. Birthday Number',
    description: 'The day of the month you were born, reduced — highlights a special talent you bring to your Life Path.',
    result: p.birthday
  }));
  cards.push(renderNumberCard({
    id: 'calc-maturity', title: '6. Maturity Number',
    description: 'Life Path + Destiny, reduced — describes the person you grow into during the second half of life.',
    result: p.maturity
  }));
  cards.push(renderNumberCard({
    id: 'calc-balance', title: '7. Balance Number',
    description: 'The initials of each part of your name, reduced — indicates how you regain emotional balance during hardship.',
    result: p.balance
  }));
  cards.push(renderNumberCard({
    id: 'calc-hiddenpassion', title: '8. Hidden Passion Number',
    description: 'The most frequently repeated number in your full name — an untapped talent you naturally excel at.',
    result: p.hiddenPassion
  }));
  cards.push(renderKarmicSection(p));
  cards.push(renderNumberCard({
    id: 'calc-challenges', title: '11. Challenge Numbers',
    description: 'Four numbers derived from your birth date that represent obstacles to master during specific life stages.',
    result: { value: `${p.challenges.first} / ${p.challenges.second} / ${p.challenges.third} / ${p.challenges.fourth}`, steps: p.challenges.steps, isMaster: false, isKarmicDebt: false },
    meaning: null
  }));
  cards.push(renderNumberCard({
    id: 'calc-pinnacles', title: '12. Pinnacle Numbers',
    description: 'Four major cycles across your lifetime, each with its own governing number and lesson.',
    result: { value: `${p.pinnacles.first} / ${p.pinnacles.second} / ${p.pinnacles.third} / ${p.pinnacles.fourth}`, steps: p.pinnacles.steps, isMaster: false, isKarmicDebt: false },
    meaning: null
  }));
  cards.push(renderNumberCard({
    id: 'calc-personalyear', title: '13. Personal Year Number',
    description: 'Your personal theme for the current calendar year, cycling from 1 to 9.',
    result: p.personalYear
  }));
  cards.push(renderNumberCard({
    id: 'calc-personalmonth', title: '14. Personal Month Number',
    description: 'A finer-grained theme layered on top of your Personal Year, for the current month.',
    result: p.personalMonth
  }));
  cards.push(renderNumberCard({
    id: 'calc-personalday', title: '15. Personal Day Number',
    description: 'The energetic theme of today specifically, based on your Personal Month.',
    result: p.personalDay
  }));
  cards.push(renderNumberCard({
    id: 'calc-attitude', title: '16. Attitude Number',
    description: 'Birth month + birth day, reduced — reflects the instinctive first impression / attitude others perceive in you.',
    result: p.attitude
  }));
  cards.push(renderNumberCard({
    id: 'calc-rational', title: '17. Rational Thought Number',
    description: 'A reflection of how logically vs. intuitively you tend to process decisions, based on your birth day.',
    result: p.rationalThought
  }));
  cards.push(renderNumberCard({
    id: 'calc-subconscious', title: '18. Subconscious Self Number',
    description: 'Derived from how many Karmic Lesson numbers are missing from your name — reflects instinctive confidence under pressure.',
    result: p.subconsciousSelf
  }));
  cards.push(renderNumberCard({
    id: 'calc-cornerstone', title: '19. Cornerstone',
    description: 'The first letter of your first name, converted to a number — shows your natural approach to new beginnings.',
    result: p.cornerstone
  }));
  cards.push(renderNumberCard({
    id: 'calc-capstone', title: '20. Capstone',
    description: 'The last letter of your last name, converted to a number — shows how you tend to complete tasks and cycles.',
    result: p.capstone
  }));
  cards.push(renderNumberCard({
    id: 'calc-firstvowel', title: '21. First Vowel Number',
    description: 'The value of the first vowel in your name — offers a secondary layer of insight into your inner self.',
    result: p.firstVowel
  }));
  cards.push(renderNumberCard({
    id: 'calc-firstconsonant', title: '22. First Consonant Number',
    description: 'The value of the first consonant in your name — a secondary layer of insight into first impressions.',
    result: p.firstConsonant
  }));
  cards.push(renderNumberCard({
    id: 'calc-essence', title: '27. Essence Number',
    description: 'Your Destiny Number blended with your current age — shows the spiritual theme active in your life right now.',
    result: p.essence
  }));
  cards.push(renderAdvancedSection(p));
  cards.push(renderTimeline(p));

  return cards.join('\n');
}

/** Render the four Chart.js visualizations. Returns the created Chart instances (for later destroy on re-calc). */
function renderCharts(profile) {
  const charts = {};

  const coreLabels = ['Life Path', 'Destiny', 'Soul Urge', 'Personality', 'Maturity'];
  const coreValues = [profile.lifePath.value, profile.destiny.value, profile.soulUrge.value, profile.personality.value, profile.maturity.value]
    .map((v) => (v > 9 ? N.sumDigits(v) : v)); // normalize master numbers for radar scale

  const radarCtx = document.getElementById('chart-radar');
  if (radarCtx) {
    charts.radar = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: coreLabels,
        datasets: [{
          label: 'Core Number Balance',
          data: coreValues,
          backgroundColor: 'rgba(200,162,74,0.25)',
          borderColor: '#c8a24a',
          pointBackgroundColor: '#c8a24a'
        }]
      },
      options: {
        responsive: true,
        scales: { r: { suggestedMin: 0, suggestedMax: 9, ticks: { stepSize: 1, color: '#cfc9e6' }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#f5f1e6' } } },
        plugins: { legend: { labels: { color: '#f5f1e6' } } }
      }
    });
  }

  const wheelCtx = document.getElementById('chart-wheel');
  if (wheelCtx) {
    const letters = N.nameToLetters(profile.meta.fullName);
    const dist = Array(9).fill(0);
    letters.forEach((l) => { dist[l.value - 1]++; });
    charts.wheel = new Chart(wheelCtx, {
      type: 'doughnut',
      data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        datasets: [{
          data: dist,
          backgroundColor: ['#c8a24a', '#7a5fb5', '#4a6fc8', '#4ac89a', '#c84a6f', '#c8a24a99', '#7a5fb599', '#4a6fc899', '#4ac89a99']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: '#f5f1e6' } }, title: { display: true, text: 'Numerology Wheel — Letter Value Distribution', color: '#f5f1e6' } }
      }
    });
  }

  const cycleCtx = document.getElementById('chart-cycles');
  if (cycleCtx) {
    const now = new Date();
    const years = [];
    const values = [];
    for (let i = -2; i < 7; i++) {
      const y = now.getFullYear() + i;
      years.push(y);
      values.push(N.calcPersonalYear(profile.meta.day, profile.meta.month, y).value);
    }
    charts.cycles = new Chart(cycleCtx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Personal Year',
          data: values,
          borderColor: '#7a5fb5',
          backgroundColor: 'rgba(122,95,181,0.2)',
          tension: 0.35,
          fill: true,
          pointBackgroundColor: years.map((y) => (y === now.getFullYear() ? '#c8a24a' : '#7a5fb5')),
          pointRadius: years.map((y) => (y === now.getFullYear() ? 7 : 4))
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { min: 0, max: 10, ticks: { stepSize: 1, color: '#cfc9e6' }, grid: { color: 'rgba(255,255,255,0.08)' } },
          x: { ticks: { color: '#cfc9e6' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        },
        plugins: { legend: { labels: { color: '#f5f1e6' } }, title: { display: true, text: 'Personal Year Life Cycle', color: '#f5f1e6' } }
      }
    });
  }

  const energyCtx = document.getElementById('chart-energy');
  if (energyCtx) {
    charts.energy = new Chart(energyCtx, {
      type: 'bar',
      data: {
        labels: ['Physical', 'Mental', 'Emotional', 'Intuitive'],
        datasets: [{
          label: 'Energy Distribution',
          data: [profile.plane.counts.Physical, profile.plane.counts.Mental, profile.plane.counts.Emotional, profile.plane.counts.Intuitive],
          backgroundColor: ['#c8a24a', '#4a6fc8', '#c84a6f', '#7a5fb5']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { ticks: { color: '#cfc9e6', precision: 0 }, grid: { color: 'rgba(255,255,255,0.08)' } },
          x: { ticks: { color: '#cfc9e6' }, grid: { display: false } }
        },
        plugins: { legend: { display: false }, title: { display: true, text: 'Plane of Expression — Energy Distribution', color: '#f5f1e6' } }
      }
    });
  }

  return charts;
}

/** Build the summary section shown at the top of the report */
function renderSummary(profile) {
  const p = profile;
  return `
    <div class="summary-grid">
      <div class="summary-item"><span class="summary-num">${p.lifePath.value}</span><span class="summary-label">Life Path</span></div>
      <div class="summary-item"><span class="summary-num">${p.destiny.value}</span><span class="summary-label">Destiny</span></div>
      <div class="summary-item"><span class="summary-num">${p.soulUrge.value}</span><span class="summary-label">Soul Urge</span></div>
      <div class="summary-item"><span class="summary-num">${p.personality.value}</span><span class="summary-label">Personality</span></div>
      <div class="summary-item"><span class="summary-num">${p.birthday.value}</span><span class="summary-label">Birthday</span></div>
      <div class="summary-item"><span class="summary-num">${p.maturity.value}</span><span class="summary-label">Maturity</span></div>
      <div class="summary-item"><span class="summary-num">${p.personalYear.value}</span><span class="summary-label">Personal Year</span></div>
      <div class="summary-item"><span class="summary-num">${p.hiddenPassion.value}</span><span class="summary-label">Hidden Passion</span></div>
    </div>
    <p class="summary-name">Full report for <strong>${p.meta.fullName}</strong> — born ${p.meta.day}/${p.meta.month}/${p.meta.year} (age ${p.meta.currentAge})</p>`;
}

window.NumerologyReport = { renderFullReport, renderCharts, renderSummary, renderNumberCard, renderMeaningBlock };
