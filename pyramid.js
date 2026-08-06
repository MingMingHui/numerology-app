/**
 * pyramid.js
 * Renders the "Triangle of Life" (Pinnacles + Challenges) as an interactive SVG.
 * Depends on window.Numerology for calculation results — takes already-computed
 * pinnacle/challenge data and only handles presentation.
 */

const PYRAMID_COLORS = {
  pinnacle: '#c8a24a',      // gold
  challenge: '#7a5fb5',     // soft purple
  base: '#0b1330',          // dark navy
  text: '#f5f1e6'
};

/**
 * Build the SVG markup for the Triangle of Life.
 * @param {Object} pinnacles - result of calcPinnacleNumbers
 * @param {Object} challenges - result of calcChallengeNumbers
 * @param {string} containerId - DOM id to attach hover tooltip listeners to (post-render)
 * @returns {string} SVG markup
 */
function buildPyramidSVG(pinnacles, challenges) {
  const w = 760;
  const h = 420;

  // Four diamonds across the top row (Pinnacles), four squares below (Challenges)
  const pinnacleValues = [pinnacles.first, pinnacles.second, pinnacles.third, pinnacles.fourth];
  const challengeValues = [challenges.first, challenges.second, challenges.third, challenges.fourth];
  const ageRanges = pinnacles.ageRanges;

  const cellW = w / 4;
  const pinnacleY = 110;
  const challengeY = 300;
  const shapeSize = 70;

  let shapes = '';

  pinnacleValues.forEach((val, i) => {
    const cx = cellW * i + cellW / 2;
    const cy = pinnacleY;
    const half = shapeSize / 2;
    const points = `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;
    shapes += `
      <g class="pyramid-shape" tabindex="0" role="img"
         aria-label="Pinnacle ${i + 1}: number ${val}, ages ${ageRanges[i]}"
         data-tooltip="Pinnacle ${i + 1} — Number ${val}&#10;Ages: ${ageRanges[i]}">
        <polygon points="${points}" fill="${PYRAMID_COLORS.pinnacle}" stroke="#fff" stroke-width="2" opacity="0.92"/>
        <text x="${cx}" y="${cy + 7}" text-anchor="middle" font-size="24" font-weight="700" fill="#1a1330">${val}</text>
        <text x="${cx}" y="${cy - half - 12}" text-anchor="middle" font-size="12" fill="${PYRAMID_COLORS.text}">Pinnacle ${i + 1}</text>
        <text x="${cx}" y="${cy + half + 20}" text-anchor="middle" font-size="11" fill="${PYRAMID_COLORS.text}" opacity="0.8">${ageRanges[i]}</text>
      </g>`;
  });

  challengeValues.forEach((val, i) => {
    const cx = cellW * i + cellW / 2;
    const cy = challengeY;
    const half = shapeSize / 2;
    shapes += `
      <g class="pyramid-shape" tabindex="0" role="img"
         aria-label="Challenge ${i + 1}: number ${val}"
         data-tooltip="Challenge ${i + 1} — Number ${val}">
        <rect x="${cx - half}" y="${cy - half}" width="${shapeSize}" height="${shapeSize}" rx="10"
              fill="${PYRAMID_COLORS.challenge}" stroke="#fff" stroke-width="2" opacity="0.92"/>
        <text x="${cx}" y="${cy + 7}" text-anchor="middle" font-size="24" font-weight="700" fill="#fff">${val}</text>
        <text x="${cx}" y="${cy - half - 12}" text-anchor="middle" font-size="12" fill="${PYRAMID_COLORS.text}">Challenge ${i + 1}</text>
      </g>`;
  });

  // connecting lines
  let lines = '';
  for (let i = 0; i < 4; i++) {
    const cx = cellW * i + cellW / 2;
    lines += `<line x1="${cx}" y1="${pinnacleY + shapeSize / 2}" x2="${cx}" y2="${challengeY - shapeSize / 2}" stroke="${PYRAMID_COLORS.pinnacle}" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="4 4"/>`;
  }

  return `
  <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="pyramid-svg" role="group" aria-label="Numerology Triangle of Life showing Pinnacles and Challenges">
    <rect x="0" y="0" width="${w}" height="${h}" fill="transparent"/>
    <text x="${w / 2}" y="34" text-anchor="middle" font-size="18" font-weight="700" fill="${PYRAMID_COLORS.text}">Triangle of Life — Pinnacles &amp; Challenges</text>
    ${lines}
    ${shapes}
  </svg>`;
}

/**
 * Render the pyramid into a container element and wire up a floating tooltip.
 * @param {string} containerSelector
 * @param {Object} pinnacles
 * @param {Object} challenges
 */
function renderPyramid(containerSelector, pinnacles, challenges) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = buildPyramidSVG(pinnacles, challenges);

  let tooltip = document.getElementById('pyramid-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'pyramid-tooltip';
    tooltip.className = 'pyramid-tooltip';
    document.body.appendChild(tooltip);
  }

  const shapes = container.querySelectorAll('.pyramid-shape');
  shapes.forEach((shape) => {
    const text = shape.getAttribute('data-tooltip');
    const show = (e) => {
      tooltip.innerHTML = text.replace(/\n|&#10;/g, '<br>');
      tooltip.style.opacity = '1';
      const evt = e.touches ? e.touches[0] : e;
      tooltip.style.left = `${evt.clientX + 14}px`;
      tooltip.style.top = `${evt.clientY + 14}px`;
    };
    const hide = () => { tooltip.style.opacity = '0'; };

    shape.addEventListener('mousemove', show);
    shape.addEventListener('mouseleave', hide);
    shape.addEventListener('focus', (e) => {
      const rect = shape.getBoundingClientRect();
      tooltip.innerHTML = text.replace(/\n|&#10;/g, '<br>');
      tooltip.style.opacity = '1';
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
    });
    shape.addEventListener('blur', hide);
  });
}

window.NumerologyPyramid = { buildPyramidSVG, renderPyramid };
