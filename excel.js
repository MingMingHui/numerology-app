/**
 * excel.js
 * Exports the full numerology profile to a multi-sheet, styled .xlsx workbook using SheetJS.
 */

const N2 = window.Numerology;

/** Apply a header-row style + auto column width to a worksheet built from an array-of-arrays */
function styleSheet(ws, colWidths) {
  ws['!cols'] = colWidths.map((w) => ({ wch: w }));
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cellAddr]) {
      ws[cellAddr].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1B1440' } },
        alignment: { horizontal: 'center' }
      };
    }
  }
  return ws;
}

function exportToExcel(profile) {
  const p = profile;
  const wb = XLSX.utils.book_new();

  /* --- Summary Sheet --- */
  const summaryRows = [
    ['Numerology Report Summary'],
    ['Name', p.meta.fullName],
    ['Birth Date', `${p.meta.day}/${p.meta.month}/${p.meta.year}`],
    ['Current Age', p.meta.currentAge],
    [],
    ['Number', 'Value'],
    ['Life Path', p.lifePath.value],
    ['Destiny / Expression', p.destiny.value],
    ['Soul Urge', p.soulUrge.value],
    ['Personality', p.personality.value],
    ['Birthday', p.birthday.value],
    ['Maturity', p.maturity.value],
    ['Balance', p.balance.value],
    ['Hidden Passion', p.hiddenPassion.value],
    ['Personal Year', p.personalYear.value],
    ['Personal Month', p.personalMonth.value],
    ['Personal Day', p.personalDay.value],
    ['Attitude', p.attitude.value],
    ['Rational Thought', p.rationalThought.value],
    ['Subconscious Self', p.subconsciousSelf.value],
    ['Cornerstone', p.cornerstone.value],
    ['Capstone', p.capstone.value],
    ['First Vowel', p.firstVowel.value],
    ['First Consonant', p.firstConsonant.value],
    ['Essence', p.essence.value],
    ['Universal Year', p.universalYear.value],
    ['Universal Month', p.universalMonth.value],
    ['Universal Day', p.universalDay.value]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  styleSheet(wsSummary, [26, 30]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  /* --- Calculation Breakdown Sheet --- */
  const calcRows = [['Number', 'Value', 'Calculation Steps']];
  const pushCalc = (label, result) => {
    calcRows.push([label, result.value, (result.steps || []).join('  →  ')]);
  };
  pushCalc('Life Path', p.lifePath);
  pushCalc('Destiny', p.destiny);
  pushCalc('Soul Urge', p.soulUrge);
  pushCalc('Personality', p.personality);
  pushCalc('Birthday', p.birthday);
  pushCalc('Maturity', p.maturity);
  pushCalc('Balance', p.balance);
  pushCalc('Hidden Passion', p.hiddenPassion);
  pushCalc('Attitude', p.attitude);
  pushCalc('Rational Thought', p.rationalThought);
  pushCalc('Subconscious Self', p.subconsciousSelf);
  pushCalc('Cornerstone', p.cornerstone);
  pushCalc('Capstone', p.capstone);
  pushCalc('First Vowel', p.firstVowel);
  pushCalc('First Consonant', p.firstConsonant);
  pushCalc('Essence', p.essence);
  pushCalc('Personal Year', p.personalYear);
  pushCalc('Personal Month', p.personalMonth);
  pushCalc('Personal Day', p.personalDay);
  calcRows.push(['Challenge Numbers', `${p.challenges.first}/${p.challenges.second}/${p.challenges.third}/${p.challenges.fourth}`, p.challenges.steps.join('  →  ')]);
  calcRows.push(['Pinnacle Numbers', `${p.pinnacles.first}/${p.pinnacles.second}/${p.pinnacles.third}/${p.pinnacles.fourth}`, p.pinnacles.steps.join('  →  ')]);
  calcRows.push(['Life Cycles', `${p.lifeCycles.formative}/${p.lifeCycles.productive}/${p.lifeCycles.harvest}`, p.lifeCycles.steps.join('  →  ')]);
  const wsCalc = XLSX.utils.aoa_to_sheet(calcRows);
  styleSheet(wsCalc, [22, 20, 90]);
  XLSX.utils.book_append_sheet(wb, wsCalc, 'Calculations');

  /* --- Interpretation Sheet --- */
  const interpRows = [['Number', 'Value', 'Title', 'Positive Traits', 'Growth Areas', 'Careers', 'Lucky Numbers']];
  const pushInterp = (label, result) => {
    if (result.value == null) return;
    const m = N2.getMeaning(result.value);
    interpRows.push([label, result.value, m.title, m.positive.join(', '), m.negative.join(', '), m.career.join(', '), m.luckyNumbers.join(', ')]);
  };
  pushInterp('Life Path', p.lifePath);
  pushInterp('Destiny', p.destiny);
  pushInterp('Soul Urge', p.soulUrge);
  pushInterp('Personality', p.personality);
  pushInterp('Maturity', p.maturity);
  pushInterp('Hidden Passion', p.hiddenPassion);
  const wsInterp = XLSX.utils.aoa_to_sheet(interpRows);
  styleSheet(wsInterp, [16, 8, 26, 40, 40, 30, 20]);
  XLSX.utils.book_append_sheet(wb, wsInterp, 'Interpretation');

  /* --- Timeline Sheet --- */
  const now = new Date();
  const timelineRows = [['Year', 'Personal Year Number']];
  for (let i = -2; i < 10; i++) {
    const y = now.getFullYear() + i;
    timelineRows.push([y, N2.calcPersonalYear(p.meta.day, p.meta.month, y).value]);
  }
  const wsTimeline = XLSX.utils.aoa_to_sheet(timelineRows);
  styleSheet(wsTimeline, [12, 20]);
  XLSX.utils.book_append_sheet(wb, wsTimeline, 'Timeline');

  /* --- Compatibility Sheet --- */
  const compatRows = [['Your Number', 'Most Compatible Numbers']];
  [p.lifePath, p.destiny, p.soulUrge, p.personality].forEach((r, i) => {
    const labels = ['Life Path', 'Destiny', 'Soul Urge', 'Personality'];
    if (r.value != null) {
      const m = N2.getMeaning(r.value);
      compatRows.push([`${labels[i]} (${r.value})`, m.compatibility.join(', ')]);
    }
  });
  const wsCompat = XLSX.utils.aoa_to_sheet(compatRows);
  styleSheet(wsCompat, [22, 30]);
  XLSX.utils.book_append_sheet(wb, wsCompat, 'Compatibility');

  const filename = `Numerology_Report_${p.meta.fullName.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

window.NumerologyExcel = { exportToExcel };
