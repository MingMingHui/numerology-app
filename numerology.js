/**
 * numerology.js
 * Core Pythagorean numerology calculation engine.
 * Pure functions, no DOM access — fully unit-testable and reusable.
 *
 * All calculation functions return an object of the shape:
 * {
 *   value: Number,            // final reduced value (may be master number)
 *   steps: [String],          // human-readable calculation breakdown
 *   isMaster: Boolean,
 *   isKarmicDebt: Boolean,
 *   karmicDebtNumber: Number|null
 * }
 */

/* ============================================================
 * 1. LETTER / DATE MAP CONSTANTS
 * ============================================================ */

// Pythagorean letter-to-number map
const LETTER_MAP = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const MASTER_NUMBERS = [11, 22, 33, 44];
const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19];

/* ============================================================
 * 2. LOW-LEVEL HELPERS
 * ============================================================ */

/**
 * Sum the digits of an integer.
 * @param {number} n
 * @returns {number}
 */
function sumDigits(n) {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((acc, d) => acc + Number(d), 0);
}

/**
 * Reduce a number to a single digit or a master number (11, 22, 33, 44),
 * recording every intermediate step for display purposes.
 * @param {number} n - starting number
 * @param {object} opts
 * @param {boolean} opts.allowMaster - stop reducing on 11/22/33/44
 * @param {boolean} opts.trackKarmicDebt - flag if the *first* reduction step is 13/14/16/19
 * @returns {{value:number, steps:string[], isMaster:boolean, isKarmicDebt:boolean, karmicDebtNumber:number|null}}
 */
function reduceNumber(n, opts = {}) {
  const allowMaster = opts.allowMaster !== false; // default true
  const trackKarmicDebt = !!opts.trackKarmicDebt;

  let current = Math.abs(Math.round(n));
  const steps = [];
  let karmicDebtNumber = null;
  let firstPass = true;

  steps.push(`Start value = ${current}`);

  while (current > 9 && !(allowMaster && MASTER_NUMBERS.includes(current))) {
    if (firstPass && trackKarmicDebt && KARMIC_DEBT_NUMBERS.includes(current)) {
      karmicDebtNumber = current;
    }
    firstPass = false;

    const digits = current.toString().split('').join(' + ');
    const next = sumDigits(current);
    steps.push(`${digits} = ${next}`);
    current = next;
  }

  const isMaster = allowMaster && MASTER_NUMBERS.includes(current);
  return {
    value: current,
    steps,
    isMaster,
    isKarmicDebt: karmicDebtNumber !== null,
    karmicDebtNumber
  };
}

/**
 * Convert a name string into an array of {letter, value} for consonants/vowels/all.
 * Non-alphabetic characters are ignored.
 */
function nameToLetters(name) {
  return name
    .toUpperCase()
    .split('')
    .filter((ch) => /[A-Z]/.test(ch))
    .map((ch) => ({ letter: ch, value: LETTER_MAP[ch] }));
}

function isVowel(letter) {
  return VOWELS.includes(letter);
}

/** Sum an array of {value} letter objects, returning digits string for display */
function sumLetterValues(letters) {
  return letters.reduce((acc, l) => acc + l.value, 0);
}

/* ============================================================
 * 3. DATE HELPERS
 * ============================================================ */

/**
 * Validate a Y/M/D date, checking real calendar validity + leap years + future dates.
 * @returns {{valid:boolean, message:string}}
 */
function validateBirthDate(day, month, year) {
  day = Number(day);
  month = Number(month);
  year = Number(year);

  if (!day || !month || !year) {
    return { valid: false, message: 'Please provide a complete birth date (day, month, and year).' };
  }
  if (month < 1 || month > 12) {
    return { valid: false, message: 'Month must be between 1 and 12.' };
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { valid: false, message: `That month only has ${daysInMonth} days.` };
  }
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (inputDate > today) {
    return { valid: false, message: 'Birth date cannot be in the future.' };
  }
  if (year < 1875) {
    return { valid: false, message: 'Please enter a realistic birth year.' };
  }
  return { valid: true, message: '' };
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/* ============================================================
 * 4. CORE NAME-BASED CALCULATIONS
 * ============================================================ */

/** 2. Destiny / Expression Number — sum of ALL letters in full name */
function calcDestinyNumber(fullName) {
  const letters = nameToLetters(fullName);
  const total = sumLetterValues(letters);
  const breakdown = letters.map((l) => `${l.letter}=${l.value}`).join(' + ');
  const result = reduceNumber(total, { trackKarmicDebt: true });
  result.steps.unshift(`Letters: ${breakdown}`, `Sum = ${total}`);
  return result;
}

/** 3. Soul Urge (Heart's Desire) — sum of VOWELS only */
function calcSoulUrgeNumber(fullName) {
  const letters = nameToLetters(fullName).filter((l) => isVowel(l.letter));
  const total = sumLetterValues(letters);
  const breakdown = letters.map((l) => `${l.letter}=${l.value}`).join(' + ') || 'No vowels found';
  const result = reduceNumber(total, { trackKarmicDebt: true });
  result.steps.unshift(`Vowels: ${breakdown}`, `Sum = ${total}`);
  return result;
}

/** 4. Personality Number — sum of CONSONANTS only */
function calcPersonalityNumber(fullName) {
  const letters = nameToLetters(fullName).filter((l) => !isVowel(l.letter));
  const total = sumLetterValues(letters);
  const breakdown = letters.map((l) => `${l.letter}=${l.value}`).join(' + ') || 'No consonants found';
  const result = reduceNumber(total, { trackKarmicDebt: true });
  result.steps.unshift(`Consonants: ${breakdown}`, `Sum = ${total}`);
  return result;
}

/** 21. First Vowel Number */
function calcFirstVowel(fullName) {
  const letters = nameToLetters(fullName);
  const firstVowel = letters.find((l) => isVowel(l.letter));
  if (!firstVowel) {
    return { value: null, steps: ['No vowel found in name'], isMaster: false, isKarmicDebt: false, karmicDebtNumber: null };
  }
  const result = reduceNumber(firstVowel.value, { allowMaster: false });
  result.steps.unshift(`First vowel: ${firstVowel.letter} = ${firstVowel.value}`);
  return result;
}

/** 22. First Consonant Number */
function calcFirstConsonant(fullName) {
  const letters = nameToLetters(fullName);
  const firstConsonant = letters.find((l) => !isVowel(l.letter));
  if (!firstConsonant) {
    return { value: null, steps: ['No consonant found in name'], isMaster: false, isKarmicDebt: false, karmicDebtNumber: null };
  }
  const result = reduceNumber(firstConsonant.value, { allowMaster: false });
  result.steps.unshift(`First consonant: ${firstConsonant.letter} = ${firstConsonant.value}`);
  return result;
}

/** 16. Subconscious Self — 9 minus the number of missing Karmic Lesson numbers (1-9 not present in name) */
function calcSubconsciousSelf(fullName) {
  const lessons = calcKarmicLessons(fullName);
  const missingCount = lessons.missingNumbers.length;
  const value = 9 - missingCount;
  return {
    value,
    steps: [
      `Numbers present in name (1-9): ${lessons.presentNumbers.join(', ') || 'none'}`,
      `Missing numbers: ${lessons.missingNumbers.join(', ') || 'none'} (${missingCount} missing)`,
      `Subconscious Self = 9 - ${missingCount} = ${value}`
    ],
    isMaster: false,
    isKarmicDebt: false,
    karmicDebtNumber: null
  };
}

/** 22 (list #22) Karmic Lessons — digits 1-9 absent from the full name letter values */
function calcKarmicLessons(fullName) {
  const letters = nameToLetters(fullName);
  const present = new Set(letters.map((l) => l.value));
  const presentNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => present.has(n));
  const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !present.has(n));
  return { presentNumbers, missingNumbers };
}

/** Hidden Passion Number — most frequently occurring digit-value in the full name */
function calcHiddenPassion(fullName) {
  const letters = nameToLetters(fullName);
  const freq = {};
  letters.forEach((l) => {
    freq[l.value] = (freq[l.value] || 0) + 1;
  });
  let best = null;
  let bestCount = 0;
  Object.keys(freq).forEach((k) => {
    if (freq[k] > bestCount) {
      bestCount = freq[k];
      best = Number(k);
    }
  });
  const freqDisplay = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([num, count]) => `${num}×${count}`)
    .join(', ');
  return {
    value: best,
    steps: [`Letter-value frequency: ${freqDisplay}`, `Most frequent value = ${best} (appears ${bestCount} times)`],
    isMaster: false,
    isKarmicDebt: false,
    karmicDebtNumber: null
  };
}

/** Cornerstone — value of the FIRST letter of the first name */
function calcCornerstone(firstName) {
  const letters = nameToLetters(firstName);
  if (!letters.length) return { value: null, steps: ['First name is empty'], isMaster: false, isKarmicDebt: false, karmicDebtNumber: null };
  const first = letters[0];
  return {
    value: first.value,
    steps: [`First letter of first name: ${first.letter} = ${first.value}`],
    isMaster: false,
    isKarmicDebt: false,
    karmicDebtNumber: null
  };
}

/** Capstone — value of the LAST letter of the last name (or full name if last is empty) */
function calcCapstone(lastName, fullName) {
  const source = lastName && lastName.trim() ? lastName : fullName;
  const letters = nameToLetters(source);
  if (!letters.length) return { value: null, steps: ['Name is empty'], isMaster: false, isKarmicDebt: false, karmicDebtNumber: null };
  const last = letters[letters.length - 1];
  return {
    value: last.value,
    steps: [`Last letter: ${last.letter} = ${last.value}`],
    isMaster: false,
    isKarmicDebt: false,
    karmicDebtNumber: null
  };
}

/** Plane of Expression — classifies letters of the name into Physical/Mental/Emotional/Intuitive planes */
function calcPlaneOfExpression(fullName) {
  const PLANES = {
    Physical: ['A', 'E', 'I', 'J', 'Q', 'Y'],       // 1 & 9 group letters approx (P/E model varies by school)
    Mental: ['C', 'F', 'L', 'O', 'R', 'U'],
    Emotional: ['B', 'G', 'K', 'P', 'T', 'W'],
    Intuitive: ['D', 'H', 'M', 'N', 'S', 'V', 'X', 'Z']
  };
  const letters = nameToLetters(fullName);
  const counts = { Physical: 0, Mental: 0, Emotional: 0, Intuitive: 0 };
  letters.forEach((l) => {
    Object.keys(PLANES).forEach((plane) => {
      if (PLANES[plane].includes(l.letter)) counts[plane]++;
    });
  });
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return {
    counts,
    dominant,
    steps: [
      `Physical: ${counts.Physical}, Mental: ${counts.Mental}, Emotional: ${counts.Emotional}, Intuitive: ${counts.Intuitive}`,
      `Dominant plane = ${dominant}`
    ]
  };
}

/** Bridge Numbers — absolute difference between key core numbers, used to smooth energies between them */
function calcBridgeNumbers(lifePath, destiny, soulUrge, personality) {
  const lifePathDestinyBridge = Math.abs(lifePath.value - destiny.value);
  const soulPersonalityBridge = Math.abs(soulUrge.value - personality.value);
  return {
    lifePathDestinyBridge,
    soulPersonalityBridge,
    steps: [
      `Life Path (${lifePath.value}) to Destiny (${destiny.value}) Bridge = |${lifePath.value} - ${destiny.value}| = ${lifePathDestinyBridge}`,
      `Soul Urge (${soulUrge.value}) to Personality (${personality.value}) Bridge = |${soulUrge.value} - ${personality.value}| = ${soulPersonalityBridge}`
    ]
  };
}

/* ============================================================
 * 5. CORE DATE-BASED CALCULATIONS
 * ============================================================ */

/** 1. Life Path Number — sum of full birth date, reduced (each part reduced first, then combined, standard method) */
function calcLifePathNumber(day, month, year) {
  const daySteps = reduceNumber(day, { trackKarmicDebt: true });
  const monthSteps = reduceNumber(month, { trackKarmicDebt: true });
  const yearSteps = reduceNumber(year, { trackKarmicDebt: true });

  const total = daySteps.value + monthSteps.value + yearSteps.value;
  const final = reduceNumber(total, { trackKarmicDebt: true });

  final.steps = [
    `Day ${day} → ${daySteps.steps.join(' → ')} → ${daySteps.value}`,
    `Month ${month} → ${monthSteps.steps.join(' → ')} → ${monthSteps.value}`,
    `Year ${year} → ${yearSteps.steps.join(' → ')} → ${yearSteps.value}`,
    `Sum: ${daySteps.value} + ${monthSteps.value} + ${yearSteps.value} = ${total}`,
    ...final.steps.slice(1)
  ];
  return final;
}

/** 5. Birthday Number — the day of the month reduced */
function calcBirthdayNumber(day) {
  const result = reduceNumber(day, { trackKarmicDebt: true });
  result.steps.unshift(`Birth day = ${day}`);
  return result;
}

/** 6. Maturity Number — Life Path + Destiny, reduced */
function calcMaturityNumber(lifePath, destiny) {
  const total = lifePath.value + destiny.value;
  const result = reduceNumber(total, { trackKarmicDebt: true });
  result.steps.unshift(`Life Path (${lifePath.value}) + Destiny (${destiny.value}) = ${total}`);
  return result;
}

/** 7. Balance Number — sum of initials of each name part, reduced */
function calcBalanceNumber(nameParts) {
  const initials = nameParts
    .filter((p) => p && p.trim())
    .map((p) => nameToLetters(p)[0])
    .filter(Boolean);
  const total = initials.reduce((acc, l) => acc + l.value, 0);
  const breakdown = initials.map((l) => `${l.letter}=${l.value}`).join(' + ');
  const result = reduceNumber(total, { allowMaster: false });
  result.steps.unshift(`Initials: ${breakdown || 'none'}`, `Sum = ${total}`);
  return result;
}

/** 9. Karmic Debt detection across core numbers is embedded via trackKarmicDebt flag in reduceNumber */

/** 11. Challenge Numbers — 4 challenges derived from day/month/year parts */
function calcChallengeNumbers(day, month, year) {
  const d = reduceNumber(day, { allowMaster: false }).value;
  const m = reduceNumber(month, { allowMaster: false }).value;
  const y = reduceNumber(year, { allowMaster: false }).value;

  const first = Math.abs(m - d);
  const second = Math.abs(d - y);
  const third = Math.abs(first - second);
  const fourth = Math.abs(m - y);

  return {
    first,
    second,
    third,
    fourth,
    steps: [
      `Reduced Month = ${m}, Day = ${d}, Year = ${y}`,
      `1st Challenge (early life) = |Month - Day| = |${m} - ${d}| = ${first}`,
      `2nd Challenge (early adulthood) = |Day - Year| = |${d} - ${y}| = ${second}`,
      `3rd Challenge (main, midlife) = |1st - 2nd| = |${first} - ${second}| = ${third}`,
      `4th Challenge (later life) = |Month - Year| = |${m} - ${y}| = ${fourth}`
    ]
  };
}

/** 12. Pinnacle Numbers — 4 pinnacles + age ranges based on Life Path */
function calcPinnacleNumbers(day, month, year, lifePathValue) {
  const d = reduceNumber(day, { allowMaster: false }).value;
  const m = reduceNumber(month, { allowMaster: false }).value;
  const y = reduceNumber(year, { allowMaster: false }).value;

  const first = reduceNumber(m + d, { trackKarmicDebt: false }).value;
  const second = reduceNumber(d + y, { trackKarmicDebt: false }).value;
  const third = reduceNumber(first + second, { trackKarmicDebt: false }).value;
  const fourth = reduceNumber(m + y, { trackKarmicDebt: false }).value;

  // Age range boundary = 36 - Life Path number reduced to single digit (use non-master base)
  const basePath = MASTER_NUMBERS.includes(lifePathValue) ? sumDigits(lifePathValue) : lifePathValue;
  const firstEnd = 36 - basePath;

  return {
    first, second, third, fourth,
    ageRanges: [
      `Birth – ${firstEnd}`,
      `${firstEnd + 1} – ${firstEnd + 9}`,
      `${firstEnd + 10} – ${firstEnd + 18}`,
      `${firstEnd + 19}+`
    ],
    steps: [
      `Reduced Month = ${m}, Day = ${d}, Year = ${y}`,
      `1st Pinnacle = Month + Day = ${m} + ${d} → ${first}`,
      `2nd Pinnacle = Day + Year = ${d} + ${y} → ${second}`,
      `3rd Pinnacle = 1st + 2nd → ${third}`,
      `4th Pinnacle = Month + Year = ${m} + ${y} → ${fourth}`,
      `1st Pinnacle age range ends at 36 - Life Path base (${basePath}) = ${firstEnd}`
    ]
  };
}

/** 13. Personal Year Number */
function calcPersonalYear(day, month, targetYear) {
  const d = reduceNumber(day, { allowMaster: false }).value;
  const m = reduceNumber(month, { allowMaster: false }).value;
  const y = reduceNumber(targetYear, { allowMaster: false }).value;
  const total = d + m + y;
  const result = reduceNumber(total, { allowMaster: false });
  result.steps = [
    `Birth Day (${d}) + Birth Month (${m}) + Target Year (${y}) reduced`,
    ...result.steps
  ];
  return result;
}

/** 14. Personal Month Number — Personal Year + calendar month, reduced */
function calcPersonalMonth(personalYearValue, calendarMonth) {
  const m = reduceNumber(calendarMonth, { allowMaster: false }).value;
  const total = personalYearValue + m;
  const result = reduceNumber(total, { allowMaster: false });
  result.steps.unshift(`Personal Year (${personalYearValue}) + Month (${m}) = ${total}`);
  return result;
}

/** 15. Personal Day Number — Personal Month + calendar day, reduced */
function calcPersonalDay(personalMonthValue, calendarDay) {
  const d = reduceNumber(calendarDay, { allowMaster: false }).value;
  const total = personalMonthValue + d;
  const result = reduceNumber(total, { allowMaster: false });
  result.steps.unshift(`Personal Month (${personalMonthValue}) + Day (${d}) = ${total}`);
  return result;
}

/** 16(list #16). Attitude Number — birth month + birth day, reduced */
function calcAttitudeNumber(day, month) {
  const total = day + month;
  const result = reduceNumber(total, { trackKarmicDebt: true });
  result.steps.unshift(`Month (${month}) + Day (${day}) = ${total}`);
  return result;
}

/** 17. Rational Thought Number — same technique as Attitude in many systems: birth day reduced non-master */
function calcRationalThoughtNumber(day) {
  const result = reduceNumber(day, { allowMaster: false });
  result.steps.unshift(`Birth day = ${day} (reduced fully, no master numbers)`);
  return result;
}

/** 25. Life Cycles — three life periods (Formative, Productive, Harvest) with their governing numbers */
function calcLifeCycles(month, day, year) {
  const formative = reduceNumber(month, { trackKarmicDebt: true });
  const productive = reduceNumber(day, { trackKarmicDebt: true });
  const harvest = reduceNumber(year, { trackKarmicDebt: true });
  return {
    formative: formative.value,
    productive: productive.value,
    harvest: harvest.value,
    steps: [
      `Formative Cycle (birth → ~28-34): Month ${month} → ${formative.value}`,
      `Productive Cycle (~28-34 → ~56-63): Day ${day} → ${productive.value}`,
      `Harvest Cycle (~56-63 → end of life): Year ${year} → ${harvest.value}`
    ]
  };
}

/** 26. Period Cycles — alias grouping of Pinnacle age spans (reuses Pinnacle calc for consistency) */
function calcPeriodCycles(pinnacles) {
  return {
    periods: [pinnacles.first, pinnacles.second, pinnacles.third, pinnacles.fourth],
    ageRanges: pinnacles.ageRanges,
    steps: ['Period Cycles mirror the four Pinnacle stages and their associated age ranges.']
  };
}

/** 27. Essence Number — Personal Year style calc that advances yearly using the letters of the birth name across life; simplified as current year vibration layered onto Destiny */
function calcEssenceNumber(fullName, currentAge) {
  const destiny = calcDestinyNumber(fullName);
  const total = destiny.value + currentAge;
  const result = reduceNumber(total, { trackKarmicDebt: true });
  result.steps.unshift(`Destiny (${destiny.value}) + Current Age (${currentAge}) = ${total}`);
  return result;
}

/** 28-30. Universal Year / Month / Day — reduces the calendar date itself (not tied to the person) */
function calcUniversalYear(year) {
  const result = reduceNumber(year, { allowMaster: false });
  result.steps.unshift(`Calendar Year = ${year}`);
  return result;
}
function calcUniversalMonth(year, month) {
  const uy = calcUniversalYear(year).value;
  const total = uy + month;
  const result = reduceNumber(total, { allowMaster: false });
  result.steps.unshift(`Universal Year (${uy}) + Calendar Month (${month}) = ${total}`);
  return result;
}
function calcUniversalDay(year, month, day) {
  const um = calcUniversalMonth(year, month).value;
  const total = um + day;
  const result = reduceNumber(total, { allowMaster: false });
  result.steps.unshift(`Universal Month (${um}) + Calendar Day (${day}) = ${total}`);
  return result;
}

/* ============================================================
 * 6. KARMIC DEBT SCAN (across all computed core numbers)
 * ============================================================ */

/**
 * Scan a set of raw pre-reduction totals for karmic debt numbers (13,14,16,19).
 * @param {Object.<string, number>} rawTotals - label -> raw sum before first reduction
 */
function scanKarmicDebts(rawTotals) {
  const found = [];
  Object.entries(rawTotals).forEach(([label, total]) => {
    if (KARMIC_DEBT_NUMBERS.includes(total)) {
      found.push({ label, number: total });
    }
  });
  return found;
}

/* ============================================================
 * 7. MASTER ORCHESTRATOR
 * ============================================================ */

/**
 * Run the full numerology profile for a person.
 * @param {Object} input
 * @param {string} input.firstName
 * @param {string} input.middleName
 * @param {string} input.lastName
 * @param {number} input.day
 * @param {number} input.month
 * @param {number} input.year
 * @param {string} [input.gender]
 * @returns {Object} complete profile
 */
function calculateFullProfile(input) {
  const { firstName, middleName, lastName, day, month, year } = input;
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  const lifePath = calcLifePathNumber(day, month, year);
  const destiny = calcDestinyNumber(fullName);
  const soulUrge = calcSoulUrgeNumber(fullName);
  const personality = calcPersonalityNumber(fullName);
  const birthday = calcBirthdayNumber(day);
  const maturity = calcMaturityNumber(lifePath, destiny);
  const balance = calcBalanceNumber([firstName, middleName, lastName]);
  const hiddenPassion = calcHiddenPassion(fullName);
  const karmicLessons = calcKarmicLessons(fullName);
  const subconsciousSelf = calcSubconsciousSelf(fullName);
  const challenges = calcChallengeNumbers(day, month, year);
  const pinnacles = calcPinnacleNumbers(day, month, year, lifePath.value);
  const periodCycles = calcPeriodCycles(pinnacles);

  const now = new Date();
  const personalYear = calcPersonalYear(day, month, now.getFullYear());
  const personalMonth = calcPersonalMonth(personalYear.value, now.getMonth() + 1);
  const personalDay = calcPersonalDay(personalMonth.value, now.getDate());

  const attitude = calcAttitudeNumber(day, month);
  const rationalThought = calcRationalThoughtNumber(day);
  const cornerstone = calcCornerstone(firstName);
  const capstone = calcCapstone(lastName, fullName);
  const firstVowel = calcFirstVowel(fullName);
  const firstConsonant = calcFirstConsonant(fullName);
  const plane = calcPlaneOfExpression(fullName);
  const bridges = calcBridgeNumbers(lifePath, destiny, soulUrge, personality);
  const lifeCycles = calcLifeCycles(month, day, year);

  const birthDate = new Date(year, month - 1, day);
  const ageMs = now - birthDate;
  const currentAge = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
  const essence = calcEssenceNumber(fullName, currentAge);

  const universalYear = calcUniversalYear(now.getFullYear());
  const universalMonth = calcUniversalMonth(now.getFullYear(), now.getMonth() + 1);
  const universalDay = calcUniversalDay(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const karmicDebts = scanKarmicDebts({
    'Life Path': day + month + year,
    'Destiny': sumLetterValues(nameToLetters(fullName)),
    'Soul Urge': sumLetterValues(nameToLetters(fullName).filter((l) => isVowel(l.letter))),
    'Personality': sumLetterValues(nameToLetters(fullName).filter((l) => !isVowel(l.letter))),
    'Birthday': day,
    'Attitude': day + month
  });

  return {
    meta: { fullName, firstName, middleName, lastName, day, month, year, gender: input.gender || '', currentAge },
    lifePath, destiny, soulUrge, personality, birthday, maturity, balance,
    hiddenPassion, karmicLessons, subconsciousSelf, challenges, pinnacles, periodCycles,
    personalYear, personalMonth, personalDay,
    attitude, rationalThought, cornerstone, capstone, firstVowel, firstConsonant,
    plane, bridges, lifeCycles, essence,
    universalYear, universalMonth, universalDay,
    karmicDebts
  };
}

/* ============================================================
 * 7b. NUMBER MEANINGS DICTIONARY
 * Keyed by number (1-9, 11, 22, 33, 44). Reused across every
 * calculation type so interpretations stay consistent.
 * ============================================================ */
const NUMBER_MEANINGS = {
  1: {
    title: 'The Leader', keywords: ['independent', 'pioneering', 'ambitious'],
    positive: ['Confident', 'Original', 'Determined', 'Self-reliant', 'Courageous'],
    negative: ['Egotistical', 'Domineering', 'Stubborn', 'Impatient', 'Selfish'],
    career: ['Entrepreneur', 'Executive', 'Inventor', 'Director', 'Freelancer'],
    relationships: 'Needs a partner who respects independence; can struggle to compromise but is fiercely loyal once committed.',
    finance: 'Strong earning drive through initiative; risk of overspending on status or new ventures.',
    health: 'Prone to stress and headaches from overwork; benefits from competitive physical activity.',
    lifeLessons: 'Learning to collaborate and listen without losing individuality.',
    strengths: ['Leadership', 'Initiative', 'Originality'],
    weaknesses: ['Impatience', 'Arrogance'],
    professions: ['CEO', 'Entrepreneur', 'Athlete', 'Politician'],
    compatibility: [3, 5, 7],
    luckyColors: ['Red', 'Gold'],
    luckyDays: ['Sunday', 'Monday'],
    luckyNumbers: [1, 10, 19, 28],
    improvements: 'Practice patience and delegate more; make room for others' + "'" + ' ideas.'
  },
  2: {
    title: 'The Diplomat', keywords: ['cooperative', 'sensitive', 'harmonious'],
    positive: ['Diplomatic', 'Considerate', 'Patient', 'Supportive', 'Intuitive'],
    negative: ['Overly sensitive', 'Indecisive', 'Codependent', 'Timid'],
    career: ['Counselor', 'Mediator', 'HR Specialist', 'Diplomat', 'Teacher'],
    relationships: 'Deeply devoted partner who thrives on emotional connection and harmony.',
    finance: 'Cautious saver; best in partnership finances rather than solo speculation.',
    health: 'Sensitive nervous system; benefits from calming routines like yoga and meditation.',
    lifeLessons: 'Building self-confidence and setting healthy boundaries.',
    strengths: ['Empathy', 'Cooperation', 'Tact'],
    weaknesses: ['Over-sensitivity', 'Avoidance of conflict'],
    professions: ['Counselor', 'Diplomat', 'Nurse', 'Social Worker'],
    compatibility: [4, 6, 8],
    luckyColors: ['Silver', 'White', 'Cream'],
    luckyDays: ['Monday', 'Friday'],
    luckyNumbers: [2, 11, 20, 29],
    improvements: 'Speak up for personal needs instead of always accommodating others.'
  },
  3: {
    title: 'The Communicator', keywords: ['expressive', 'creative', 'social'],
    positive: ['Charismatic', 'Artistic', 'Optimistic', 'Witty', 'Sociable'],
    negative: ['Scattered', 'Superficial', 'Moody', 'Exaggerating'],
    career: ['Artist', 'Writer', 'Performer', 'Marketer', 'Public Speaker'],
    relationships: 'Playful and affectionate, needs a partner who enjoys fun and open conversation.',
    finance: 'Earns well through creativity but can be impulsive with spending.',
    health: 'Vibrant energy; watch for throat, nerves, and mood-related stress.',
    lifeLessons: 'Learning discipline and follow-through on creative ideas.',
    strengths: ['Creativity', 'Communication', 'Optimism'],
    weaknesses: ['Lack of focus', 'Over-indulgence'],
    professions: ['Writer', 'Actor', 'Designer', 'Musician'],
    compatibility: [1, 5, 7],
    luckyColors: ['Yellow', 'Purple'],
    luckyDays: ['Thursday', 'Wednesday'],
    luckyNumbers: [3, 12, 21, 30],
    improvements: 'Channel scattered energy into one project at a time.'
  },
  4: {
    title: 'The Builder', keywords: ['practical', 'disciplined', 'reliable'],
    positive: ['Organized', 'Hardworking', 'Loyal', 'Methodical', 'Honest'],
    negative: ['Rigid', 'Stubborn', 'Overly cautious', 'Workaholic'],
    career: ['Engineer', 'Accountant', 'Project Manager', 'Architect'],
    relationships: 'Dependable and steady; shows love through consistent action rather than words.',
    finance: 'Excellent long-term planner; naturally frugal and security-focused.',
    health: 'Sturdy constitution; risk of tension from overwork, benefits from routine exercise.',
    lifeLessons: 'Embracing flexibility and allowing spontaneity into a structured life.',
    strengths: ['Discipline', 'Reliability', 'Practicality'],
    weaknesses: ['Rigidity', 'Resistance to change'],
    professions: ['Engineer', 'Accountant', 'Builder', 'Analyst'],
    compatibility: [2, 6, 8],
    luckyColors: ['Blue', 'Green'],
    luckyDays: ['Sunday', 'Saturday'],
    luckyNumbers: [4, 13, 22, 31],
    improvements: 'Allow room for spontaneity and trust the process without over-controlling it.'
  },
  5: {
    title: 'The Free Spirit', keywords: ['adventurous', 'versatile', 'curious'],
    positive: ['Adaptable', 'Adventurous', 'Progressive', 'Energetic', 'Curious'],
    negative: ['Restless', 'Impulsive', 'Inconsistent', 'Irresponsible'],
    career: ['Sales', 'Travel Industry', 'Journalist', 'Consultant'],
    relationships: 'Craves freedom and variety; needs a partner who won\u2019t feel threatened by independence.',
    finance: 'Earns in bursts; needs discipline to avoid impulsive spending on new experiences.',
    health: 'High energy; prone to nervous tension and needs regular movement and variety.',
    lifeLessons: 'Finding balance between freedom and commitment.',
    strengths: ['Adaptability', 'Curiosity', 'Charm'],
    weaknesses: ['Impulsiveness', 'Inconsistency'],
    professions: ['Sales', 'Travel Writer', 'Entrepreneur', 'Pilot'],
    compatibility: [1, 3, 7],
    luckyColors: ['Turquoise', 'Silver'],
    luckyDays: ['Wednesday', 'Friday'],
    luckyNumbers: [5, 14, 23],
    improvements: 'Commit to seeing key projects through instead of chasing the next new thing.'
  },
  6: {
    title: 'The Nurturer', keywords: ['responsible', 'caring', 'harmonious'],
    positive: ['Compassionate', 'Responsible', 'Nurturing', 'Generous', 'Balanced'],
    negative: ['Self-sacrificing', 'Controlling', 'Worrying', 'Meddling'],
    career: ['Healthcare', 'Teaching', 'Counseling', 'Hospitality'],
    relationships: 'Deeply devoted to family and home; sometimes over-gives at their own expense.',
    finance: 'Generous spender on loved ones; needs to budget for personal needs too.',
    health: 'Prone to stress from caretaking others; benefits from self-care routines.',
    lifeLessons: 'Learning to care for others without losing themselves.',
    strengths: ['Compassion', 'Responsibility', 'Loyalty'],
    weaknesses: ['Over-giving', 'Controlling tendencies'],
    professions: ['Teacher', 'Doctor', 'Counselor', 'Chef'],
    compatibility: [2, 4, 9],
    luckyColors: ['Pink', 'Blue', 'Green'],
    luckyDays: ['Friday', 'Tuesday'],
    luckyNumbers: [6, 15, 24],
    improvements: 'Set boundaries and make space for personal needs, not only others\u2019.'
  },
  7: {
    title: 'The Seeker', keywords: ['analytical', 'spiritual', 'introspective'],
    positive: ['Analytical', 'Wise', 'Spiritual', 'Perceptive', 'Reflective'],
    negative: ['Aloof', 'Skeptical', 'Secretive', 'Overthinking'],
    career: ['Researcher', 'Scientist', 'Analyst', 'Spiritual Teacher'],
    relationships: 'Needs solitude to recharge; deeply loyal once trust is established.',
    finance: 'Prefers stability over speculation; good at long-term research-based investing.',
    health: 'Sensitive to mental fatigue; benefits from quiet reflection, nature, and sleep.',
    lifeLessons: 'Learning to trust others and open up emotionally.',
    strengths: ['Insight', 'Focus', 'Wisdom'],
    weaknesses: ['Isolation', 'Overanalysis'],
    professions: ['Scientist', 'Researcher', 'Philosopher', 'Analyst'],
    compatibility: [1, 3, 5],
    luckyColors: ['Violet', 'Grey', 'Sea green'],
    luckyDays: ['Monday', 'Sunday'],
    luckyNumbers: [7, 16, 25],
    improvements: 'Share thoughts and feelings openly instead of retreating into isolation.'
  },
  8: {
    title: 'The Powerhouse', keywords: ['ambitious', 'authoritative', 'material success'],
    positive: ['Ambitious', 'Efficient', 'Confident', 'Strategic', 'Resilient'],
    negative: ['Workaholic', 'Materialistic', 'Domineering', 'Ruthless'],
    career: ['Business Owner', 'Finance', 'Real Estate', 'Executive'],
    relationships: 'Loyal provider; needs to balance career ambition with quality time.',
    finance: 'Naturally skilled at building wealth and managing large-scale resources.',
    health: 'Risk of stress-related illness from overwork; needs regular downtime.',
    lifeLessons: 'Balancing material ambition with compassion and ethics.',
    strengths: ['Ambition', 'Organization', 'Strategic thinking'],
    weaknesses: ['Materialism', 'Controlling nature'],
    professions: ['CEO', 'Banker', 'Real Estate Developer', 'Lawyer'],
    compatibility: [2, 4, 6],
    luckyColors: ['Black', 'Dark blue'],
    luckyDays: ['Saturday', 'Tuesday'],
    luckyNumbers: [8, 17, 26],
    improvements: 'Remember that worth isn\u2019t only measured by achievement or wealth.'
  },
  9: {
    title: 'The Humanitarian', keywords: ['compassionate', 'idealistic', 'wise'],
    positive: ['Compassionate', 'Generous', 'Wise', 'Idealistic', 'Selfless'],
    negative: ['Martyrdom', 'Emotional', 'Aloof', 'Unrealistic'],
    career: ['Nonprofit Work', 'Arts', 'Healing Professions', 'Activism'],
    relationships: 'Gives generously in love but must avoid losing self-identity in others\u2019 needs.',
    finance: 'Generous to causes and others; needs structure to build personal savings.',
    health: 'Empathic sensitivity can lead to emotional burnout; needs boundaries and rest.',
    lifeLessons: 'Letting go gracefully and serving without self-sacrifice.',
    strengths: ['Compassion', 'Vision', 'Generosity'],
    weaknesses: ['Emotional overwhelm', 'Difficulty letting go'],
    professions: ['Humanitarian', 'Artist', 'Healer', 'Teacher'],
    compatibility: [3, 6, 8],
    luckyColors: ['Gold', 'Crimson'],
    luckyDays: ['Tuesday', 'Thursday'],
    luckyNumbers: [9, 18, 27],
    improvements: 'Practice releasing situations and people with grace rather than over-attachment.'
  },
  11: {
    title: 'The Intuitive Illuminator (Master Number)', keywords: ['visionary', 'inspirational', 'sensitive'],
    positive: ['Visionary', 'Inspiring', 'Intuitive', 'Idealistic', 'Charismatic'],
    negative: ['Anxious', 'Impractical', 'Highly strung', 'Self-doubting'],
    career: ['Spiritual Teacher', 'Counselor', 'Innovator', 'Public Speaker'],
    relationships: 'Deeply intuitive partner who senses others\u2019 needs; can be emotionally intense.',
    finance: 'Inspired ideas can generate income but need grounding and practical follow-through.',
    health: 'Highly sensitive nervous system; needs grounding practices and adequate rest.',
    lifeLessons: 'Grounding visionary ideas into practical, tangible action.',
    strengths: ['Intuition', 'Inspiration', 'Vision'],
    weaknesses: ['Nervous tension', 'Impracticality'],
    professions: ['Spiritual Teacher', 'Inventor', 'Artist', 'Counselor'],
    compatibility: [2, 6, 9],
    luckyColors: ['Silver', 'White'],
    luckyDays: ['Monday'],
    luckyNumbers: [11, 29],
    improvements: 'Ground big ideas in concrete plans and daily practice, not just inspiration.'
  },
  22: {
    title: 'The Master Builder (Master Number)', keywords: ['visionary', 'practical', 'powerful'],
    positive: ['Visionary', 'Practical', 'Disciplined', 'Powerful', 'Ambitious'],
    negative: ['Overwhelmed', 'Domineering', 'Perfectionistic', 'Stressed'],
    career: ['Large-scale Entrepreneur', 'Architect', 'Statesman', 'Engineer'],
    relationships: 'Devoted and protective; may need to slow down enough to nurture close bonds.',
    finance: 'Capable of building lasting wealth and institutions through disciplined vision.',
    health: 'High pressure self-expectations can cause burnout; needs balance and rest.',
    lifeLessons: 'Turning grand visions into practical, lasting structures for the greater good.',
    strengths: ['Vision', 'Discipline', 'Leadership'],
    weaknesses: ['Perfectionism', 'Overextension'],
    professions: ['Architect', 'Engineer', 'CEO', 'Statesman'],
    compatibility: [4, 6, 8],
    luckyColors: ['Deep blue', 'Earth tones'],
    luckyDays: ['Sunday'],
    luckyNumbers: [22, 4],
    improvements: 'Pace ambitious goals realistically and delegate rather than carrying it all alone.'
  },
  33: {
    title: 'The Master Teacher (Master Number)', keywords: ['selfless', 'nurturing', 'healing'],
    positive: ['Compassionate', 'Selfless', 'Healing', 'Wise', 'Devoted'],
    negative: ['Self-sacrificing', 'Martyrdom', 'Overburdened', 'Anxious'],
    career: ['Healer', 'Teacher', 'Humanitarian Leader', 'Counselor'],
    relationships: 'Extraordinarily giving partner; must guard against losing self in service to others.',
    finance: 'Best when finances support a larger mission rather than personal gain alone.',
    health: 'Emotional caretaking can cause burnout; needs strong boundaries and self-care.',
    lifeLessons: 'Serving humanity while still honoring personal needs and limits.',
    strengths: ['Compassion', 'Healing presence', 'Wisdom'],
    weaknesses: ['Self-neglect', 'Overwhelm'],
    professions: ['Healer', 'Teacher', 'Counselor', 'Humanitarian'],
    compatibility: [6, 9, 11],
    luckyColors: ['Pastel blue', 'Rose'],
    luckyDays: ['Friday'],
    luckyNumbers: [33, 6],
    improvements: 'Practice receiving as much as giving; protect personal energy reserves.'
  },
  44: {
    title: 'The Master Healer (Master Number)', keywords: ['grounded', 'powerful', 'transformative'],
    positive: ['Grounded', 'Resilient', 'Disciplined', 'Transformative', 'Protective'],
    negative: ['Rigid', 'Overworked', 'Controlling', 'Stubborn'],
    career: ['Systems Builder', 'Healer', 'Financial Strategist', 'Reformer'],
    relationships: 'Steady and protective; expresses love through tangible security and structure.',
    finance: 'Strong potential to build lasting material and organizational legacies.',
    health: 'Physically resilient but must avoid pushing the body past sustainable limits.',
    lifeLessons: 'Using discipline and structure to create lasting positive change for others.',
    strengths: ['Resilience', 'Structure', 'Transformational power'],
    weaknesses: ['Rigidity', 'Overwork'],
    professions: ['Systems Architect', 'Reformer', 'Healer', 'Strategist'],
    compatibility: [8, 22, 4],
    luckyColors: ['Grey', 'Forest green'],
    luckyDays: ['Saturday'],
    luckyNumbers: [44, 8],
    improvements: 'Balance relentless drive with rest, flexibility, and delegation.'
  }
};

/**
 * Get the interpretation record for a number, falling back to its
 * single-digit reduction if the exact number (e.g. a bridge value) isn't a core numerology number.
 */
function getMeaning(number) {
  if (NUMBER_MEANINGS[number]) return NUMBER_MEANINGS[number];
  const reduced = reduceNumber(number, { allowMaster: true }).value;
  return NUMBER_MEANINGS[reduced] || NUMBER_MEANINGS[9];
}

const KARMIC_DEBT_MEANINGS = {
  13: { theme: 'Laziness in a past life; this life demands discipline, hard work, and follow-through to earn success honestly.', lessons: ['Consistency', 'Self-discipline', 'Avoiding shortcuts'] },
  14: { theme: 'Misuse of freedom in a past life; this life brings lessons in moderation, adaptability, and responsible use of freedom.', lessons: ['Moderation', 'Adaptability', 'Avoiding overindulgence'] },
  16: { theme: 'Karmic debt tied to ego and broken trust; often brings sudden upheavals that rebuild humility and spiritual awareness.', lessons: ['Humility', 'Letting go of ego', 'Spiritual growth through change'] },
  19: { theme: 'Abuse of power or independence in a past life; this life teaches interdependence and the limits of pure self-reliance.', lessons: ['Interdependence', 'Asking for help', 'Balancing independence with cooperation'] }
};

/* ============================================================
 * 8. EXPORTS (browser-global — no bundler required)
 * ============================================================ */

window.Numerology = {
  LETTER_MAP, VOWELS, MASTER_NUMBERS, KARMIC_DEBT_NUMBERS,
  sumDigits, reduceNumber, nameToLetters, isVowel,
  validateBirthDate, isLeapYear,
  calcLifePathNumber, calcDestinyNumber, calcSoulUrgeNumber, calcPersonalityNumber,
  calcBirthdayNumber, calcMaturityNumber, calcBalanceNumber, calcHiddenPassion,
  calcKarmicLessons, calcSubconsciousSelf, calcChallengeNumbers, calcPinnacleNumbers,
  calcPersonalYear, calcPersonalMonth, calcPersonalDay, calcAttitudeNumber,
  calcRationalThoughtNumber, calcCornerstone, calcCapstone, calcFirstVowel,
  calcFirstConsonant, calcPlaneOfExpression, calcBridgeNumbers, calcLifeCycles,
  calcPeriodCycles, calcEssenceNumber, calcUniversalYear, calcUniversalMonth,
  calcUniversalDay, scanKarmicDebts, calculateFullProfile,
  NUMBER_MEANINGS, KARMIC_DEBT_MEANINGS, getMeaning
};
