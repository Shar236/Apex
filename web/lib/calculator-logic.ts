/**
 * Pure calculation logic for every calculator. No UI, no side effects —
 * every function here is testable in isolation.
 *
 * Methodology notes are documented per function. Where a published source
 * exists (ETS comparison, SAT–ACT concordance, Bavarian formula), the table
 * or formula follows it; where no authoritative source exists (linear CGPA
 * conversion, PTE overall average), the function is explicitly documented as
 * an estimate and the UI must say so.
 */

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/* ── GRE ─────────────────────────────────────────────────────────────────── */

export const GRE_SECTION_MIN = 130;
export const GRE_SECTION_MAX = 170;

export interface GreInput {
  verbal: number;
  quant: number;
  awa: number;
}

export interface GreResult {
  verbal: number;
  quant: number;
  total: number;
  awa: number;
}

/** Verbal and Quant are each clamped to 130–170 (1-point increments); AWA to 0–6 (0.5 steps). Total = V + Q (260–340). */
export function calculateGre(input: GreInput): GreResult {
  const verbal = clamp(Math.round(input.verbal), GRE_SECTION_MIN, GRE_SECTION_MAX);
  const quant = clamp(Math.round(input.quant), GRE_SECTION_MIN, GRE_SECTION_MAX);
  const awa = clamp(Math.round(input.awa * 2) / 2, 0, 6);
  return { verbal, quant, total: verbal + quant, awa };
}

/* ── SAT ─────────────────────────────────────────────────────────────────── */

export interface SatInput {
  rw: number;
  math: number;
}

export interface SatResult {
  rw: number;
  math: number;
  total: number;
}

/** Section scores snap to 10-point increments on a 200–800 scale; total 400–1600. */
export function calculateSat(input: SatInput): SatResult {
  const rw = clamp(Math.round(input.rw / 10) * 10, 200, 800);
  const math = clamp(Math.round(input.math / 10) * 10, 200, 800);
  return { rw, math, total: rw + math };
}

/* ── TOEFL ───────────────────────────────────────────────────────────────── */

export interface ToeflInput {
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
}

export interface ToeflResult {
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  total: number;
}

/** Each section clamps to 0–30 integer; total 0–120. */
export function calculateToefl(input: ToeflInput): ToeflResult {
  const reading = clamp(Math.round(input.reading), 0, 30);
  const listening = clamp(Math.round(input.listening), 0, 30);
  const speaking = clamp(Math.round(input.speaking), 0, 30);
  const writing = clamp(Math.round(input.writing), 0, 30);
  return { reading, listening, speaking, writing, total: reading + listening + speaking + writing };
}

/* ── IELTS ───────────────────────────────────────────────────────────────── */

export interface IeltsInput {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
}

export interface IeltsResult {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  overall: number;
}

/** Official IELTS rounding: overall = mean of four skills to the nearest half band,
 *  with means ending in .25 rounding UP to .5 and means ending in .75 rounding UP
 *  to the next whole band. */
export function calculateIelts(input: IeltsInput): IeltsResult {
  const snap = (value: number) => clamp(Math.round(value * 2) / 2, 0, 9);
  const listening = snap(input.listening);
  const reading = snap(input.reading);
  const writing = snap(input.writing);
  const speaking = snap(input.speaking);
  const mean = (listening + reading + writing + speaking) / 4;
  return { listening, reading, writing, speaking, overall: Math.round(mean * 2) / 2 };
}

/* ── ACT ─────────────────────────────────────────────────────────────────── */

export interface ActInput {
  english: number;
  math: number;
  reading: number;
  science: number;
}

export interface ActResult {
  english: number;
  math: number;
  reading: number;
  science: number;
  composite: number;
}

/** Subjects clamp to 1–36 integer; composite = round(mean), .5 rounds up (JS Math.round behavior). */
export function calculateAct(input: ActInput): ActResult {
  const snap = (value: number) => clamp(Math.round(value), 1, 36);
  const english = snap(input.english);
  const math = snap(input.math);
  const reading = snap(input.reading);
  const science = snap(input.science);
  const composite = Math.round((english + math + reading + science) / 4);
  return { english, math, reading, science, composite };
}

/* ── PTE ─────────────────────────────────────────────────────────────────── */

export interface PteInput {
  listening: number;
  reading: number;
  speaking: number;
  writing: number;
}

export interface PteResult {
  listening: number;
  reading: number;
  speaking: number;
  writing: number;
  overall: number;
  cefr: { level: string; label: string };
}

export const PTE_CEFR_LEVELS: Array<{ min: number; level: string; label: string }> = [
  { min: 85, level: 'C2', label: 'Expert user' },
  { min: 76, level: 'C1', label: 'Effective operational proficiency' },
  { min: 59, level: 'B2', label: 'Upper intermediate' },
  { min: 43, level: 'B1', label: 'Intermediate' },
  { min: 30, level: 'A2', label: 'Basic user' },
  { min: 10, level: 'A1', label: 'Beginner' },
];

export function pteCefr(score: number) {
  return PTE_CEFR_LEVELS.find((entry) => score >= entry.min) || PTE_CEFR_LEVELS[PTE_CEFR_LEVELS.length - 1];
}

/**
 * ESTIMATE: Pearson computes the official overall score with a proprietary
 * algorithm that weighs item types, not a simple average. Averaging the four
 * communicative skills is the standard estimation approach. Skills clamp to
 * 10–90; the average is rounded to the nearest whole point.
 */
export function calculatePte(input: PteInput): PteResult {
  const snap = (value: number) => clamp(Math.round(value), 10, 90);
  const listening = snap(input.listening);
  const reading = snap(input.reading);
  const speaking = snap(input.speaking);
  const writing = snap(input.writing);
  const overall = Math.round((listening + reading + speaking + writing) / 4);
  return { listening, reading, speaking, writing, overall, cefr: pteCefr(overall) };
}

/* ── WES-style GPA ────────────────────────────────────────────────────────── */

export const WES_GRADE_POINTS: Array<{ grade: string; points: number }> = [
  { grade: 'A+', points: 4.0 },
  { grade: 'A', points: 4.0 },
  { grade: 'A-', points: 3.67 },
  { grade: 'B+', points: 3.33 },
  { grade: 'B', points: 3.0 },
  { grade: 'B-', points: 2.67 },
  { grade: 'C+', points: 2.33 },
  { grade: 'C', points: 2.0 },
  { grade: 'C-', points: 1.67 },
  { grade: 'D+', points: 1.33 },
  { grade: 'D', points: 1.0 },
  { grade: 'F', points: 0.0 },
];

export const WES_POINTS_BY_GRADE: Record<string, number> = Object.fromEntries(
  WES_GRADE_POINTS.map((entry) => [entry.grade, entry.points]),
);

export interface GpaCourseInput {
  credits: number;
  grade: string;
}

export interface GpaResult {
  gpa: number | null;
  totalCredits: number;
  totalPoints: number;
  courseCount: number;
}

/** Credit-weighted GPA on the 4.0 scale. Unknown grades contribute 0 points but
 *  their credits still count as attempted. Returns null GPA when no credits. */
export function calculateGpa(courses: GpaCourseInput[]): GpaResult {
  let totalCredits = 0;
  let totalPoints = 0;
  for (const course of courses) {
    const credits = clamp(course.credits, 0, 24);
    totalCredits += credits;
    totalPoints += (WES_POINTS_BY_GRADE[course.grade] ?? 0) * credits;
  }
  const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : null;
  return { gpa, totalCredits: Math.round(totalCredits * 100) / 100, totalPoints: Math.round(totalPoints * 100) / 100, courseCount: courses.length };
}

/* ── CGPA → GPA ──────────────────────────────────────────────────────────── */

export interface CgpaInput {
  cgpa: number;
  maxCgpa: number;
}

export interface CgpaResult {
  gpa: number | null;
  percentage: number | null;
  scaleUsed: string;
}

/**
 * ESTIMATE: linear proportional mapping GPA = (CGPA ÷ max) × 4. Percentage
 * equivalent uses the CBSE convention (× 9.5) only for 10-point scales.
 * No universal conversion exists — universities apply their own tables.
 */
export function calculateCgpaToGpa(input: CgpaInput): CgpaResult {
  const max = clamp(input.maxCgpa, 1, 10);
  const cgpa = clamp(input.cgpa, 0, max);
  const gpa = Math.round((cgpa / max) * 4 * 100) / 100;
  const percentage = max === 10 ? Math.round(cgpa * 9.5 * 10) / 10 : null;
  return { gpa, percentage, scaleUsed: `${max}-point` };
}

/* ── German grade ────────────────────────────────────────────────────────── */

export const GERMAN_GRADE_LABELS: Array<{ max: number; label: string }> = [
  { max: 1.5, label: 'Sehr gut — Excellent' },
  { max: 2.5, label: 'Gut — Good' },
  { max: 3.5, label: 'Befriedigend — Satisfactory' },
  { max: 4.0, label: 'Ausreichend — Sufficient (pass)' },
  { max: Infinity, label: 'Nicht bestanden — Fail' },
];

export interface GermanInput {
  obtained: number;
  max: number;
  min: number;
}

export interface GermanResult {
  grade: number;
  label: string;
}

/**
 * Modified Bavarian Formula: grade = 1 + 3 × (Nmax − Nd) / (Nmax − Nmin).
 * Result clamps to [1, 4] for passing scores; scores below the pass mark
 * return 5.0 (fail). Returns null when the scale is invalid (max ≤ min).
 */
export function calculateGermanGrade(input: GermanInput): GermanResult | null {
  const { obtained, max, min } = input;
  if (max <= min || max <= 0 || min < 0) return null;
  if (obtained >= max) {
    return { grade: 1.0, label: GERMAN_GRADE_LABELS[0].label };
  }
  if (obtained < min) {
    return { grade: 5.0, label: GERMAN_GRADE_LABELS[GERMAN_GRADE_LABELS.length - 1].label };
  }
  const grade = Math.round(clamp(1 + 3 * ((max - obtained) / (max - min)), 1, 4) * 100) / 100;
  const label = GERMAN_GRADE_LABELS.find((entry) => grade <= entry.max)?.label || 'Nicht bestanden — Fail';
  return { grade, label };
}

/* ── GRE → GMAT ──────────────────────────────────────────────────────────── */

/** Linear interpolation over published GMAC/ETS concordance anchor pairs
 *  [GRE total, GMAT total]; estimates snap to 10-point GMAT increments. */
const GRE_GMAT_ANCHORS: Array<[gre: number, gmat: number]> = [
  [260, 200],
  [265, 230],
  [270, 270],
  [280, 340],
  [290, 420],
  [300, 500],
  [310, 590],
  [320, 680],
  [324, 700],
  [330, 750],
  [340, 800],
];

export function greToGmat(verbal: number, quant: number): number {
  const total = clamp(Math.round(verbal), GRE_SECTION_MIN, GRE_SECTION_MAX) + clamp(Math.round(quant), GRE_SECTION_MIN, GRE_SECTION_MAX);
  if (total <= GRE_GMAT_ANCHORS[0][0]) return GRE_GMAT_ANCHORS[0][1];
  for (let i = 1; i < GRE_GMAT_ANCHORS.length; i++) {
    const [greHi, gmatHi] = GRE_GMAT_ANCHORS[i];
    if (total <= greHi) {
      const [greLo, gmatLo] = GRE_GMAT_ANCHORS[i - 1];
      const t = (total - greLo) / (greHi - greLo);
      const estimate = gmatLo + t * (gmatHi - gmatLo);
      return clamp(Math.round(estimate / 10) * 10, 200, 800);
    }
  }
  return GRE_GMAT_ANCHORS[GRE_GMAT_ANCHORS.length - 1][1];
}

/* ── TOEFL → IELTS ───────────────────────────────────────────────────────── */

/** ETS-published TOEFL iBT total → IELTS band comparison ranges. */
export const TOEFL_IELTS_TABLE: Array<{ min: number; max: number; band: number }> = [
  { min: 118, max: 120, band: 9 },
  { min: 115, max: 117, band: 8.5 },
  { min: 110, max: 114, band: 8 },
  { min: 102, max: 109, band: 7.5 },
  { min: 94, max: 101, band: 7 },
  { min: 79, max: 93, band: 6.5 },
  { min: 60, max: 78, band: 6 },
  { min: 46, max: 59, band: 5.5 },
  { min: 35, max: 45, band: 5 },
  { min: 32, max: 34, band: 4.5 },
  { min: 31, max: 31, band: 4 },
];

/** Returns the comparison band, or null below the table's floor (≈ IELTS 4.0). */
export function toeflToIelts(toefl: number): number | null {
  const total = clamp(Math.round(toefl), 0, 120);
  const row = TOEFL_IELTS_TABLE.find((entry) => total >= entry.min && total <= entry.max);
  return row ? row.band : null;
}

/* ── SAT ↔ ACT ───────────────────────────────────────────────────────────── */

/** Official College Board / ACT concordance: [ACT, SAT low, SAT high]. */
export const SAT_ACT_TABLE: Array<{ act: number; satLow: number; satHigh: number }> = [
  { act: 36, satLow: 1570, satHigh: 1600 },
  { act: 35, satLow: 1530, satHigh: 1560 },
  { act: 34, satLow: 1490, satHigh: 1520 },
  { act: 33, satLow: 1450, satHigh: 1480 },
  { act: 32, satLow: 1420, satHigh: 1440 },
  { act: 31, satLow: 1390, satHigh: 1410 },
  { act: 30, satLow: 1360, satHigh: 1380 },
  { act: 29, satLow: 1330, satHigh: 1350 },
  { act: 28, satLow: 1300, satHigh: 1320 },
  { act: 27, satLow: 1260, satHigh: 1290 },
  { act: 26, satLow: 1230, satHigh: 1250 },
  { act: 25, satLow: 1200, satHigh: 1220 },
  { act: 24, satLow: 1160, satHigh: 1190 },
  { act: 23, satLow: 1130, satHigh: 1150 },
  { act: 22, satLow: 1100, satHigh: 1120 },
  { act: 21, satLow: 1080, satHigh: 1090 },
  { act: 20, satLow: 1040, satHigh: 1070 },
  { act: 19, satLow: 1010, satHigh: 1030 },
  { act: 18, satLow: 970, satHigh: 1000 },
  { act: 17, satLow: 940, satHigh: 960 },
  { act: 16, satLow: 900, satHigh: 930 },
  { act: 15, satLow: 860, satHigh: 890 },
  { act: 14, satLow: 820, satHigh: 850 },
  { act: 13, satLow: 770, satHigh: 810 },
  { act: 12, satLow: 730, satHigh: 760 },
  { act: 11, satLow: 690, satHigh: 720 },
  { act: 10, satLow: 650, satHigh: 680 },
  { act: 9, satLow: 610, satHigh: 640 },
  { act: 8, satLow: 570, satHigh: 600 },
  { act: 7, satLow: 520, satHigh: 560 },
  { act: 6, satLow: 480, satHigh: 510 },
  { act: 5, satLow: 440, satHigh: 470 },
  { act: 4, satLow: 410, satHigh: 430 },
  { act: 3, satLow: 400, satHigh: 400 },
];

/** SAT total → concordant ACT composite. */
export function satToAct(sat: number): number {
  const total = clamp(sat, 400, 1600);
  const row = SAT_ACT_TABLE.find((entry) => total >= entry.satLow);
  return row ? row.act : 3;
}

/** ACT composite → midpoint of the concordant SAT range. */
export function actToSat(act: number): number {
  const composite = clamp(Math.round(act), 3, 36);
  const row = SAT_ACT_TABLE.find((entry) => entry.act === composite);
  return row ? Math.round((row.satLow + row.satHigh) / 2) : 400;
}

/* ── Per-calculator page content (SEO + FAQ) ─────────────────────────────── */

export interface CalculatorFaq {
  question: string;
  answer: string;
}

export interface CalculatorPageContent {
  intro: string;
  exampleTitle: string;
  example: { label: string; value: string }[];
  exampleConclusion: string;
  meaningTitle: string;
  meaning: string[];
  faq: CalculatorFaq[];
  relatedSlugs: string[];
}

export const CALCULATOR_CONTENT: Record<string, CalculatorPageContent> = {
  'pte-score-calculator': {
    intro:
      'Enter your PTE Academic communicative skill scores to estimate your overall score on Pearson’s 10–90 Global Scale of English, along with the matching CEFR level.',
    exampleTitle: 'Example PTE calculation',
    example: [
      { label: 'Listening', value: '72' },
      { label: 'Reading', value: '68' },
      { label: 'Speaking', value: '75' },
      { label: 'Writing', value: '69' },
      { label: 'Average', value: '(72 + 68 + 75 + 69) ÷ 4 = 71' },
      { label: 'CEFR level', value: 'B2 — Upper intermediate' },
    ],
    exampleConclusion:
      'An estimated overall of 71 corresponds to CEFR B2, which meets the English requirement of many universities; programs asking for C1 typically quote PTE 76 or higher.',
    meaningTitle: 'What your PTE score means',
    meaning: [
      'PTE Academic scores everything on one 10–90 Global Scale of English, so your overall and your skills are directly comparable.',
      'Around 50–58 is the typical minimum universities ask for; 65+ satisfies most competitive programs, and 79+ is the level often quoted for Australian immigration points.',
      'Because Speaking and Writing are machine-scored, results are consistent and typically available within about 48 hours.',
      'PTE scores are valid for two years from the test date.',
    ],
    faq: [
      {
        question: 'How is the overall PTE score calculated?',
        answer:
          'Pearson computes the official overall score from your performance across all question types using its own algorithm. Averaging your four communicative skill scores — the method this calculator uses — gives a close estimate of the same 10–90 scale.',
      },
      {
        question: 'Is a PTE score of 65 good?',
        answer:
          'Yes. 65 maps to CEFR C1 and clears the English requirement of the large majority of universities in Australia, the UK, Canada and New Zealand. A few programs ask for 70–79, so always check your target institution.',
      },
      {
        question: 'How long are PTE scores valid?',
        answer: 'Two years from your test date, the same validity window as IELTS and TOEFL.',
      },
      {
        question: 'How does PTE compare to IELTS?',
        answer:
          'Pearson and IELTS publish comparison data: PTE 65 is broadly comparable to IELTS 7.0, and PTE 50 is comparable to IELTS 6.0. Use the TOEFL to IELTS converter below for band references between tests.',
      },
    ],
    relatedSlugs: ['ielts-band-calculator', 'toefl-score-calculator', 'toefl-to-ielts'],
  },
  'ielts-band-calculator': {
    intro:
      'Enter your four IELTS skill scores to calculate your overall band score exactly the way IELTS does — including the official half-band rounding rules.',
    exampleTitle: 'Example IELTS calculation',
    example: [
      { label: 'Listening', value: '7.5' },
      { label: 'Reading', value: '7.0' },
      { label: 'Writing', value: '6.5' },
      { label: 'Speaking', value: '7.0' },
      { label: 'Mean', value: '(7.5 + 7.0 + 6.5 + 7.0) ÷ 4 = 7.0' },
      { label: 'Overall band', value: '7.0' },
    ],
    exampleConclusion:
      'A mean that lands exactly on a whole or half number needs no rounding. If the four skills had averaged 7.25, the official rule would round it up to 7.5.',
    meaningTitle: 'What your IELTS band score means',
    meaning: [
      'Band 9 is expert user and band 6 is competent user; most universities ask for 6.0–7.0 overall with no skill below a stated minimum.',
      'Immigration programs often set both an overall requirement and per-skill minimums, so one weak skill can matter as much as the overall.',
      'The overall band is not rounded down arbitrarily — means ending in .25 or .75 always round up, which can work in your favour.',
      'Your Test Report Form is valid for two years.',
    ],
    faq: [
      {
        question: 'How is the overall IELTS band calculated?',
        answer:
          'It is the average of your four skills, rounded to the nearest half band. Means ending in .25 round up to .5, and means ending in .75 round up to the next whole band — for example, 6.125 reports as 6.0, but 6.25 reports as 6.5.',
      },
      {
        question: 'Is 6.5 a good IELTS score?',
        answer:
          'For most purposes, yes. 6.5 clears the standard admission requirement of many universities, though competitive programs and some visa categories ask for 7.0 or higher.',
      },
      {
        question: 'Can I combine scores from two test attempts?',
        answer:
          'No. IELTS does not superscore — each Test Report Form stands alone. (Note that some universities do accept IELTS One Skill Retake results.)',
      },
      {
        question: 'What IELTS band equals a TOEFL score of 100?',
        answer:
          'ETS’s comparison places a TOEFL iBT total of 94–101 at around IELTS 7.0. Try the TOEFL to IELTS converter for the full table.',
      },
    ],
    relatedSlugs: ['pte-score-calculator', 'toefl-score-calculator', 'toefl-to-ielts'],
  },
  'toefl-score-calculator': {
    intro:
      'Enter your four TOEFL iBT section scores to get your total out of 120, see where it stands, and find the IELTS band it compares to.',
    exampleTitle: 'Example TOEFL calculation',
    example: [
      { label: 'Reading', value: '27' },
      { label: 'Listening', value: '26' },
      { label: 'Speaking', value: '24' },
      { label: 'Writing', value: '25' },
      { label: 'Total', value: '27 + 26 + 24 + 25 = 102' },
      { label: 'IELTS comparison', value: '≈ 7.5' },
    ],
    exampleConclusion:
      'A total of 102 clears the requirement of most competitive universities — many ask for 90–100, and top programs often quote 100+.',
    meaningTitle: 'What your TOEFL score means',
    meaning: [
      'Below 80 total: many universities still admit, but competitive programs usually expect more; 80–100 is the standard competitive range; 100+ meets even top-tier requirements.',
      'ETS also issues MyBest Scores — your highest section scores across all test dates in two years — though not every institution accepts them.',
      'Section scores matter: some programs set per-section minimums (often 20–22 in Speaking), so check both the total and each section.',
      'TOEFL iBT scores are valid for two years.',
    ],
    faq: [
      {
        question: 'How is the TOEFL total score calculated?',
        answer:
          'Simply add the four section scores — Reading, Listening, Speaking and Writing — each reported from 0 to 30, giving a total from 0 to 120.',
      },
      {
        question: 'What is a good TOEFL score?',
        answer:
          '90–100 satisfies most competitive graduate programs, and 100+ is the usual bar at top universities. Always confirm the requirement, since some programs also set per-section minimums.',
      },
      {
        question: 'What TOEFL score equals IELTS 7.0?',
        answer:
          'ETS’s published comparison maps IELTS 7.0 to a TOEFL iBT total of 94–101. See the TOEFL to IELTS converter for every band.',
      },
      {
        question: 'Is 80 a passing TOEFL score?',
        answer:
          'TOEFL has no pass or fail. 80 is enough for many universities, while selective programs typically look for 90–100+.',
      },
    ],
    relatedSlugs: ['ielts-band-calculator', 'toefl-to-ielts', 'pte-score-calculator'],
  },
  'gre-score-calculator': {
    intro:
      'Enter your Verbal Reasoning and Quantitative Reasoning scores to get your GRE total out of 340 — Analytical Writing stays separate, exactly as ETS reports it.',
    exampleTitle: 'Example GRE calculation',
    example: [
      { label: 'Verbal Reasoning', value: '158' },
      { label: 'Quantitative Reasoning', value: '162' },
      { label: 'Analytical Writing', value: '4.5 (reported separately)' },
      { label: 'Total', value: '158 + 162 = 320' },
    ],
    exampleConclusion:
      'A 320 total with a 4.5 AWA is a strong, competitive score for most graduate programs — roughly the 80th percentile combined.',
    meaningTitle: 'What your GRE score means',
    meaning: [
      'The section mean is about 150–151, so 155+ in a section is above average; 160+ puts you in roughly the top 15–20 percent.',
      'AWA is scored separately from 0 to 6 and never changes the 340 total, but programs in writing-heavy fields do read it.',
      'Engineering and business programs usually weigh Quantitative more heavily; humanities programs lean on Verbal.',
      'GRE scores are valid for five years — the longest validity of any major admissions test.',
    ],
    faq: [
      {
        question: 'How is the GRE total score calculated?',
        answer:
          'Add your Verbal Reasoning and Quantitative Reasoning scores. Each section is reported from 130 to 170 in 1-point increments, so the total ranges from 260 to 340. Analytical Writing (0–6) is reported separately and is not part of the total.',
      },
      {
        question: 'Why does the GRE start at 130 instead of 0?',
        answer:
          'ETS chose the 130–170 scale so section scores cannot be zero, which keeps the percentile math statistically stable across large populations.',
      },
      {
        question: 'What is a good GRE score?',
        answer:
          '310–320 combined is competitive for most programs; 325+ is strong for the most selective schools. The right target depends on your field — Quant matters most for engineering and finance.',
      },
      {
        question: 'How does the GRE compare to the GMAT?',
        answer:
          'Published concordance data converts between them statistically. Use the GRE to GMAT converter for a reference estimate of your GMAT equivalent.',
      },
    ],
    relatedSlugs: ['gre-to-gmat', 'sat-score-calculator', 'act-score-calculator'],
  },
  'sat-score-calculator': {
    intro:
      'Enter your two digital SAT section scores — Reading & Writing and Math — for your total out of 1600, the same way the College Board reports it.',
    exampleTitle: 'Example SAT calculation',
    example: [
      { label: 'Reading & Writing', value: '640' },
      { label: 'Math', value: '680' },
      { label: 'Total', value: '640 + 680 = 1320' },
      { label: 'ACT equivalent', value: '≈ 28' },
    ],
    exampleConclusion:
      'A 1320 total sits comfortably above the national average (around 1050) and is concordant with an ACT composite of 28.',
    meaningTitle: 'What your SAT score means',
    meaning: [
      'The national average total is roughly 1050; 1200+ is above average, 1350+ is competitive for most state flagships and private universities, and 1450+ is strong for selective institutions.',
      'Section scores matter as much as the total — engineering programs typically expect Math 650+, regardless of the total.',
      'Most colleges superscore: they combine your best section scores across multiple test dates.',
      'Digital SAT scores arrive within days, and scores remain valid for five years.',
    ],
    faq: [
      {
        question: 'How is the SAT total score calculated?',
        answer:
          'Add the two section scores: Reading & Writing (200–800) and Math (200–800). The total ranges from 400 to 1600 and is always a multiple of 10.',
      },
      {
        question: 'How is the digital SAT different from the paper SAT?',
        answer:
          'It is shorter, section-adaptive (module two adjusts to your module-one performance) and calculator-allowed throughout Math. Scoring scales and the 400–1600 range are unchanged.',
      },
      {
        question: 'What is a good SAT score?',
        answer:
          '1200+ is above average, 1350+ is competitive for most four-year universities, and 1450+ is typical at the most selective institutions.',
      },
      {
        question: 'How does the SAT compare to the ACT?',
        answer:
          'The College Board and ACT publish an official concordance table between the two. Use the SAT to ACT converter to see your composite equivalent.',
      },
    ],
    relatedSlugs: ['act-score-calculator', 'sat-to-act', 'gre-score-calculator'],
  },
  'act-score-calculator': {
    intro:
      'Enter your four ACT subject scores to get your composite score out of 36, plus the SAT total it compares to on the official concordance.',
    exampleTitle: 'Example ACT calculation',
    example: [
      { label: 'English', value: '28' },
      { label: 'Math', value: '27' },
      { label: 'Reading', value: '29' },
      { label: 'Science', value: '26' },
      { label: 'Mean', value: '(28 + 27 + 29 + 26) ÷ 4 = 27.5' },
      { label: 'Composite', value: 'rounds to 28' },
    ],
    exampleConclusion:
      'A composite of 28 is well above the national average (around 19–20) and matches an SAT total of roughly 1300–1320 on the concordance.',
    meaningTitle: 'What your ACT composite means',
    meaning: [
      'The national average composite hovers around 19–20; 24+ clears most public university bars, 28+ is competitive, and 32+ is strong for selective institutions.',
      'Because the composite is a rounded average, one strong subject can lift it — a 30 in Math can absorb a 26 in Science.',
      'Averages ending in .5 round up, so a 27.5 mean reports as 28.',
      'ACT scores are valid for five years and many colleges superscore across attempts.',
    ],
    faq: [
      {
        question: 'How is the ACT composite score calculated?',
        answer:
          'Average your four subject scores — English, Math, Reading and Science, each from 1 to 36 — and round to the nearest whole number. A mean of 27.5 rounds up to 28.',
      },
      {
        question: 'Is the ACT Science section a science test?',
        answer:
          'No. It measures scientific reasoning — reading graphs, evaluating experiments and drawing conclusions. It requires no subject-matter memorisation.',
      },
      {
        question: 'What is a good ACT score?',
        answer:
          '24+ is above average and meets most state university requirements; 28+ is competitive for selective schools and 32+ for the most selective ones.',
      },
      {
        question: 'How does the ACT compare to the SAT?',
        answer:
          'The official SAT–ACT concordance table links the two. A 28 composite matches roughly a 1300–1320 SAT total — try the SAT to ACT converter for the full table.',
      },
    ],
    relatedSlugs: ['sat-score-calculator', 'sat-to-act', 'gre-score-calculator'],
  },
  'wes-gpa-calculator': {
    intro:
      'Enter your courses with credit hours and letter grades to compute a credit-weighted GPA on the 4.0 scale — the methodology US universities and WES-style evaluations use.',
    exampleTitle: 'Example GPA calculation',
    example: [
      { label: 'Calculus II — 4 credits, A−', value: '3.67 × 4 = 14.68 points' },
      { label: 'Physics — 3 credits, B+', value: '3.33 × 3 = 9.99 points' },
      { label: 'History — 3 credits, B', value: '3.00 × 3 = 9.00 points' },
      { label: 'Totals', value: '10 credits, 33.67 points' },
      { label: 'GPA', value: '33.67 ÷ 10 = 3.37' },
    ],
    exampleConclusion:
      'A 3.37 GPA clears the common 3.0 graduate-admission bar; the 4-credit Calculus course carried more weight than either 3-credit course because GPA is credit-weighted.',
    meaningTitle: 'What your GPA means',
    meaning: [
      '3.0 is the standard minimum for US graduate admission; 3.5+ is competitive, and 3.7+ is strong for funded programs.',
      'Credit weighting means a 4-credit A moves your GPA more than a 2-credit A — matching how US transcripts are evaluated.',
      'WES converts international credentials with country-specific tables; this calculator follows the same grade-point logic for letter-grade systems.',
      'For an official evaluation, order a WES assessment — admissions offices often require it for foreign transcripts.',
    ],
    faq: [
      {
        question: 'How is a 4.0-scale GPA calculated?',
        answer:
          'Multiply each course’s grade points by its credits, sum those products, then divide by total credits. For example, an A− (3.67) in a 4-credit course earns 14.68 grade points.',
      },
      {
        question: 'Is this calculator the same as a WES evaluation?',
        answer:
          'It uses the same 4.0 grade-point methodology for US-style letter grades, but an official WES evaluation re-checks your credential against country-specific conversion tables and is the version institutions accept.',
      },
      {
        question: 'Do plus and minus grades matter?',
        answer:
          'Yes — A− = 3.67 and B+ = 3.33. Many international transcripts do not use +/- grades; if yours does not, simply use the plain letters.',
      },
      {
        question: 'What GPA do I need for a US master’s program?',
        answer:
          'Most programs set 3.0 as the floor and 3.5 as the competitive bar. Strong test scores and experience can offset a GPA slightly below 3.0.',
      },
    ],
    relatedSlugs: ['cgpa-to-gpa-calculator', 'german-grade-calculator'],
  },
  'cgpa-to-gpa-calculator': {
    intro:
      'Convert your CGPA to a 4.0 GPA with a fully transparent linear method — and an honest explanation of why no single conversion is officially standardized.',
    exampleTitle: 'Example CGPA conversion',
    example: [
      { label: 'CGPA', value: '8.6' },
      { label: 'Maximum CGPA', value: '10' },
      { label: 'Linear conversion', value: '(8.6 ÷ 10) × 4 = 3.44' },
      { label: 'Percentage (CBSE convention)', value: '8.6 × 9.5 = 81.7%' },
    ],
    exampleConclusion:
      'A 3.44 is the reference estimate this method produces. Some US universities publish their own CGPA tables and may arrive at a slightly different number — always follow the target institution’s stated method when one exists.',
    meaningTitle: 'How to use this conversion responsibly',
    meaning: [
      'The linear method (CGPA ÷ max × 4) is the most common back-of-envelope conversion because it is simple and transparent — not because it is official.',
      'No universal conversion exists: WES, individual universities and government bodies each publish their own tables, and they disagree by design.',
      'When a university provides its own conversion rule, that rule always wins over any calculator.',
      'The × 9.5 percentage equivalent applies only to 10-point scales and follows the CBSE convention used across Indian education.',
    ],
    faq: [
      {
        question: 'How do I convert a 10-point CGPA to a 4.0 GPA?',
        answer:
          'The common linear method is (CGPA ÷ 10) × 4. A CGPA of 8.5 therefore maps to about 3.4. Treat it as a reference estimate — universities may apply their own tables.',
      },
      {
        question: 'Does every university accept the same CGPA-to-GPA conversion?',
        answer:
          'No. There is no single official conversion. WES and each university use their own methodology, and results differ. This calculator shows the transparent linear method so you can verify every step.',
      },
      {
        question: 'What percentage is an 8.0 CGPA?',
        answer:
          'Under the CBSE convention for 10-point scales, 8.0 × 9.5 = 76%. Some state universities use different multipliers, so check your institution’s rule.',
      },
      {
        question: 'Which CGPA do US universities prefer to see?',
        answer:
          'Most US applications ask you to self-report your CGPA in its original scale. Admissions offices convert internally or request a WES evaluation — you rarely need to convert it yourself.',
      },
    ],
    relatedSlugs: ['wes-gpa-calculator', 'german-grade-calculator'],
  },
  'german-grade-calculator': {
    intro:
      'Convert your marks into the German 1.0–5.0 grading scale using the Modified Bavarian Formula — the exact method German universities and uni-assist apply to international transcripts.',
    exampleTitle: 'Example German grade calculation',
    example: [
      { label: 'Your score (Nd)', value: '78%' },
      { label: 'Best possible (Nmax)', value: '100' },
      { label: 'Minimum pass (Nmin)', value: '35' },
      { label: 'Formula', value: '1 + 3 × (100 − 78) ÷ (100 − 35)' },
      { label: 'German grade', value: '≈ 2.02 — Gut (Good)' },
    ],
    exampleConclusion:
      'A 2.02 is a solid grade by German standards — within the “Gut” band that most German master’s programs look for (roughly 2.5 or better).',
    meaningTitle: 'What your German grade means',
    meaning: [
      'German grades run from 1.0 (best) to 5.0 (fail) — lower is better, the reverse of most systems.',
      '1.0–1.5 = excellent, 1.6–2.5 = good, 2.6–3.5 = satisfactory, 3.6–4.0 = sufficient pass, above 4.0 = fail.',
      'Competitive German master’s programs commonly expect 2.5 or better; some quote 1.5–2.0 for selective tracks.',
      'uni-assist and German admissions offices compute this exact formula, so your result matches their evaluation when your inputs (especially the real passing mark) are correct.',
    ],
    faq: [
      {
        question: 'How does the German grading formula work?',
        answer:
          'The Modified Bavarian Formula is 1 + 3 × (Nmax − Nd) ÷ (Nmax − Nmin), where Nd is your score, Nmax the best possible score and Nmin the minimum passing score. It maps any marking scheme onto the German 1.0–5.0 scale.',
      },
      {
        question: 'Is 2.0 a good German grade?',
        answer:
          'Yes — 2.0 falls in the “Gut” (good) band and meets the bar of most German master’s programs. 1.0–1.5 is excellent.',
      },
      {
        question: 'What passing mark should I enter?',
        answer:
          'The genuine minimum pass mark of your system — 35 or 40 out of 100 in most Indian universities. This input changes the result more than any other, so use the real value from your transcript rules.',
      },
      {
        question: 'Why is a lower number a better grade in Germany?',
        answer:
          'The scale descends from 1.0 (sehr gut, excellent) toward 5.0 (nicht bestanden, fail). It is the inverse of systems where 100 or A is best.',
      },
    ],
    relatedSlugs: ['cgpa-to-gpa-calculator', 'wes-gpa-calculator'],
  },
  'gre-to-gmat-conversion': {
    intro:
      'Enter your GRE Verbal and Quantitative scores for an estimated GMAT equivalent, interpolated from published GMAC/ETS concordance data.',
    exampleTitle: 'Example GRE to GMAT conversion',
    example: [
      { label: 'GRE Verbal', value: '158' },
      { label: 'GRE Quantitative', value: '160' },
      { label: 'GRE total', value: '318' },
      { label: 'Estimated GMAT', value: '≈ 660' },
    ],
    exampleConclusion:
      'A GMAT estimate of 660 is a reference number for comparing yourself against a program’s stated GMAT range — schools will still see and evaluate your actual GRE score.',
    meaningTitle: 'How to read your estimated conversion',
    meaning: [
      'Concordance tables match how similarly-performing test takers score on each test — a statistical pairing, not a promise.',
      'Use the estimate to check whether you are in a program’s competitive range; never present it as an official score.',
      'The estimate applies to the classic GMAT 200–800 scale. The GMAT Focus Edition uses a different 205–805 scale with separate concordance.',
      'Business schools that accept both tests evaluate whichever official score you send — no conversion is needed on your application.',
    ],
    faq: [
      {
        question: 'How accurate is a GRE to GMAT conversion?',
        answer:
          'It is a statistical estimate. Concordance tables match percentile standing between the tests, so an individual result can drift from the estimate. Treat it as a reference, not an official equivalency.',
      },
      {
        question: 'Is GRE accepted instead of the GMAT for MBA programs?',
        answer:
          'Yes — the large majority of business schools worldwide now accept both tests, and many publish GRE ranges alongside GMAT ranges.',
      },
      {
        question: 'Which score does the estimate map to?',
        answer:
          'The classic GMAT total score of 200–800. The GMAT Focus Edition reports on a different 205–805 scale and has its own concordance data.',
      },
      {
        question: 'Should I take the GRE or the GMAT?',
        answer:
          'If your Quant is stronger than your Verbal, the GMAT’s weighting often favours you; if you are more balanced, the GRE treats both sections equally. Check which test your target programs prefer.',
      },
    ],
    relatedSlugs: ['gre-score-calculator', 'sat-to-act-conversion', 'toefl-to-ielts-conversion'],
  },
  'toefl-to-ielts-conversion': {
    intro:
      'Enter your TOEFL iBT total to find the IELTS band it compares to, using the score-comparison table ETS publishes. This is a reference conversion, not an official equivalency.',
    exampleTitle: 'Example TOEFL to IELTS conversion',
    example: [
      { label: 'TOEFL iBT total', value: '96' },
      { label: 'Comparison range', value: '94–101' },
      { label: 'IELTS band', value: '7.0' },
    ],
    exampleConclusion:
      'A 96 total compares to IELTS 7.0 — enough for most competitive universities that quote either test, though each institution sets its own minimums per test.',
    meaningTitle: 'How to use the comparison responsibly',
    meaning: [
      'The table matches how similarly-performing groups score on both tests — a reference conversion, not a guarantee for an individual.',
      'Universities publish minimums per test (for example “IELTS 6.5 or TOEFL 90”), so check which test your band actually satisfies.',
      'Both tests remain independent: institutions receive your official score from the provider, never a converted one.',
      'Section-level comparisons also exist, but the total-score table is the most commonly quoted reference.',
    ],
    faq: [
      {
        question: 'What IELTS band equals a TOEFL score of 100?',
        answer:
          'ETS’s published comparison maps TOEFL 94–101 to around IELTS 7.0, so 100 compares to about 7.0.',
      },
      {
        question: 'Is the TOEFL to IELTS conversion official?',
        answer:
          'The table originates from ETS’s own score-comparison research, which is the authoritative reference — but the conversion itself is a statistical comparison between tests, not an equivalency either test owner guarantees for individuals.',
      },
      {
        question: 'Which test is easier, TOEFL or IELTS?',
        answer:
          'Neither is easier — they are calibrated so equivalent performance produces equivalent scores. IELTS uses a face-to-face Speaking test; TOEFL records spoken responses. Choose the format that suits you.',
      },
      {
        question: 'Can I submit both TOEFL and IELTS scores?',
        answer:
          'Yes, and some applicants do — admissions teams will consider whichever presentation favours you. There is no penalty for submitting both.',
      },
    ],
    relatedSlugs: ['toefl-score-calculator', 'ielts-band-calculator', 'pte-score-calculator'],
  },
  'sat-to-act-conversion': {
    intro:
      'Enter your SAT total to find the ACT composite it compares to on the official College Board and ACT concordance table.',
    exampleTitle: 'Example SAT to ACT conversion',
    example: [
      { label: 'SAT total', value: '1310' },
      { label: 'Concordance range', value: '1300–1320' },
      { label: 'ACT composite', value: '28' },
    ],
    exampleConclusion:
      'A 1310 total is concordant with an ACT composite of 28 — colleges treat these as equivalent standing, so you only ever need one of the two tests.',
    meaningTitle: 'How the concordance works',
    meaning: [
      'The College Board and ACT jointly publish the table; it links score ranges that represent the same percentile standing among test takers.',
      'One ACT composite maps to a small range of SAT totals — for example ACT 28 covers SAT 1300–1320 — so your exact SAT may share its ACT value with neighbours.',
      'Concordance is a statistical comparison of populations, not a prediction of how you would score on the other test.',
      'Colleges treat concordant scores as equivalent; submitting both tests adds nothing to your application.',
    ],
    faq: [
      {
        question: 'What ACT score equals an SAT score of 1300?',
        answer:
          'The official concordance maps SAT 1300–1320 to an ACT composite of 28.',
      },
      {
        question: 'Is the SAT to ACT conversion official?',
        answer:
          'Yes — the table is published jointly by the College Board and ACT Inc., which makes it the authoritative reference. It is still a statistical comparison of score distributions, not a guarantee of how you would score on the other test.',
      },
      {
        question: 'Should I take the SAT or the ACT?',
        answer:
          'Both are accepted everywhere that accepts either. The ACT gives slightly less time per question but includes Science; the digital SAT is adaptive with shorter sections. Pick the format that fits your strengths.',
      },
      {
        question: 'Do colleges prefer the SAT or the ACT?',
        answer:
          'No preference — the concordance makes the two directly comparable, and admissions offices evaluate whichever official score you submit.',
      },
    ],
    relatedSlugs: ['sat-score-calculator', 'act-score-calculator', 'gre-to-gmat-conversion'],
  },
};

// Aliases so both canonical and legacy slug lookups succeed
CALCULATOR_CONTENT['gre-to-gmat'] = CALCULATOR_CONTENT['gre-to-gmat-conversion'];
CALCULATOR_CONTENT['toefl-to-ielts'] = CALCULATOR_CONTENT['toefl-to-ielts-conversion'];
CALCULATOR_CONTENT['sat-to-act'] = CALCULATOR_CONTENT['sat-to-act-conversion'];

