/**
 * Calculator metadata + page content. Pure data — every calculation lives in
 * lib/calculator-logic.ts and every tool UI in components/calculators/tools/.
 * The footer, sitemap and landing page all render from CALCULATORS, so the
 * three stay in sync automatically.
 */

export type CalculatorCategory = 'score' | 'gpa' | 'converter';

export interface CalculatorMeta {
  slug: string;
  name: string;
  category: CalculatorCategory;
  tagline: string;
  metaTitle: string;
  description: string;
  formula: string;
  howItWorks: string[];
}

export interface CalculatorCategoryInfo {
  id: CalculatorCategory;
  label: string;
  blurb: string;
  calculators: CalculatorMeta[];
}

export const CALCULATOR_CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  score: 'Exam Score Calculators',
  gpa: 'Academic Calculators',
  converter: 'Score Converters',
};

const CATEGORY_ORDER: CalculatorCategory[] = ['score', 'gpa', 'converter'];

export const CALCULATORS: CalculatorMeta[] = [
  {
    slug: 'pte-score-calculator',
    name: 'PTE Score Calculator',
    category: 'score',
    tagline: 'Average your four PTE Academic communicative skills into an estimated overall score on the 10–90 scale.',
    metaTitle: 'PTE Score Calculator – Calculate Your PTE Academic Score',
    description:
      'Work out your overall PTE Academic score from Listening, Reading, Speaking and Writing. Free calculator with CEFR levels, a worked example and scoring FAQs.',
    formula: 'Overall Score ≈ (Listening + Reading + Speaking + Writing) ÷ 4, each skill scored 10–90',
    howItWorks: [
      'PTE Academic reports four communicative skills — Listening, Reading, Speaking and Writing — each on a 10–90 scale.',
      'The overall score sits on the same 10–90 Global Scale of English and reflects performance across all skills.',
      'Pearson computes the official overall score with its own algorithm that also weighs individual item types; averaging the four skills gives a close estimate.',
      'The overall estimate is mapped to the CEFR levels (A1–C2) that universities and immigration programs quote.',
    ],
  },
  {
    slug: 'ielts-band-calculator',
    name: 'IELTS Band Calculator',
    category: 'score',
    tagline: 'Average your four IELTS skills into an overall band score using the official rounding rules.',
    metaTitle: 'IELTS Band Calculator – Calculate Your Overall IELTS Band',
    description:
      'Calculate your overall IELTS band score from Listening, Reading, Writing and Speaking, with the official half-band rounding explained. Includes a worked example and FAQs.',
    formula:
      'Overall band = mean of the four skills, rounded to the nearest 0.5 (means ending in .25 round up to .5, means ending in .75 round up to the next whole band)',
    howItWorks: [
      'IELTS reports four skills — Listening, Reading, Writing and Speaking — each on a 0–9 band scale in half-band steps.',
      'The overall band score is the arithmetic mean of the four skills, reported to the nearest half band.',
      'The official rounding rule: a mean ending in .25 rounds up to .5, and a mean ending in .75 rounds up to the next whole band.',
      'Your Test Report Form (TRF) shows the overall band plus all four skill bands; scores are valid for two years.',
    ],
  },
  {
    slug: 'toefl-score-calculator',
    name: 'TOEFL Score Calculator',
    category: 'score',
    tagline: 'Add your four TOEFL iBT section scores for your total out of 120.',
    metaTitle: 'TOEFL Score Calculator – Calculate Your TOEFL iBT Total',
    description:
      'Add up your TOEFL iBT Reading, Listening, Speaking and Writing scores for your total out of 120, with level guidance and an IELTS band equivalent.',
    formula: 'Total = Reading (0–30) + Listening (0–30) + Speaking (0–30) + Writing (0–30)',
    howItWorks: [
      'TOEFL iBT scores four sections — Reading, Listening, Speaking and Writing — each from 0 to 30.',
      'Your total score is the simple sum of the four sections and ranges from 0 to 120.',
      'ETS also reports MyBest Scores: the highest section score from any test date within two years.',
      'Scores are valid for two years and accepted by 12,000+ universities worldwide.',
    ],
  },
  {
    slug: 'gre-score-calculator',
    name: 'GRE Score Calculator',
    category: 'score',
    tagline: 'Combine Verbal and Quantitative Reasoning into your GRE total out of 340.',
    metaTitle: 'GRE Score Calculator – Calculate Your GRE Score',
    description:
      'Add your GRE Verbal Reasoning and Quantitative Reasoning sections for your total out of 340, with Analytical Writing reported separately. Worked example and FAQs included.',
    formula: 'Total = Verbal Reasoning (130–170) + Quantitative Reasoning (130–170), from 260 to 340',
    howItWorks: [
      'GRE Verbal Reasoning and Quantitative Reasoning are each reported on a 130–170 scale in 1-point increments.',
      'Your official total is the sum of both sections and ranges from 260 to 340.',
      'Analytical Writing (AWA) is scored separately from 0 to 6 in half-point increments and never counts toward the 340 total.',
      'GRE scores are valid for five years and accepted by graduate and business schools worldwide.',
    ],
  },
  {
    slug: 'sat-score-calculator',
    name: 'SAT Score Calculator',
    category: 'score',
    tagline: 'Add Evidence-Based Reading & Writing and Math for your SAT total out of 1600.',
    metaTitle: 'SAT Score Calculator – Calculate Your SAT Score',
    description:
      'Combine your SAT Reading & Writing and Math section scores for your total out of 1600. Includes a worked example, score context and FAQs about the digital SAT.',
    formula: 'Total = Reading & Writing (200–800) + Math (200–800), from 400 to 1600',
    howItWorks: [
      'The digital SAT reports two section scores: Reading & Writing and Math, each on a 200–800 scale in 10-point increments.',
      'Your total score is the sum of both sections and ranges from 400 to 1600.',
      'Each section score comes from two adaptive modules; once you know your section scores, the total is a simple sum.',
      'SAT scores are valid for five years, and many colleges superscore across multiple test dates.',
    ],
  },
  {
    slug: 'act-score-calculator',
    name: 'ACT Score Calculator',
    category: 'score',
    tagline: 'Average your four ACT subject scores into your composite score out of 36.',
    metaTitle: 'ACT Score Calculator – Calculate Your ACT Composite Score',
    description:
      'Average your ACT English, Math, Reading and Science scores into your composite out of 36, with rounding rules, score context and an SAT equivalent.',
    formula: 'Composite = round(mean of English, Math, Reading and Science), each scored 1–36',
    howItWorks: [
      'The ACT reports four subject scores — English, Math, Reading and Science — each on a 1–36 scale.',
      'The composite score is the average of the four subjects rounded to the nearest whole number.',
      'Averages ending in .5 round up (for example, a mean of 26.5 reports as 27).',
      'ACT scores are valid for five years and widely used for US undergraduate admissions.',
    ],
  },
  {
    slug: 'wes-gpa-calculator',
    name: 'WES GPA Calculator',
    category: 'gpa',
    tagline: 'Convert your transcript — courses, credits and letter grades — into a GPA on the 4.0 scale.',
    metaTitle: 'WES GPA Calculator – Convert Grades to a 4.0 GPA',
    description:
      'Convert your courses, credit hours and letter grades into a cumulative GPA on the 4.0 scale used by WES and US universities, with a full calculation breakdown.',
    formula: 'GPA = Σ (grade points × credits) ÷ Σ credits, on a 4.0 scale',
    howItWorks: [
      'Each letter grade maps to grade points on the 4.0 scale: A = 4.0, A− = 3.67, B+ = 3.33, B = 3.0, and so on down to F = 0.',
      'Courses are weighted by credit hours, so a 4-credit course moves your GPA more than a 1-credit course.',
      'GPA equals total grade points earned divided by total credits attempted.',
      'This mirrors the WES-style methodology for US letter-grade transcripts; official WES evaluations re-check your credential against its own tables.',
    ],
  },
  {
    slug: 'cgpa-to-gpa-calculator',
    name: 'CGPA To GPA Calculator',
    category: 'gpa',
    tagline: 'Convert your CGPA to a 4.0 GPA with a transparent, linear method you can verify.',
    metaTitle: 'CGPA to GPA Calculator – Convert CGPA to 4.0 GPA',
    description:
      'Convert a 10-point (or 5-point) CGPA to a 4.0 GPA with a transparent linear method, percentage equivalent and an honest explanation of its limits.',
    formula: 'GPA (4.0) = ( CGPA ÷ maximum CGPA ) × 4 · Percentage = CGPA × 9.5 (CBSE convention, 10-point only)',
    howItWorks: [
      'Enter your CGPA and the maximum CGPA your institution awards — 10 for most Indian universities, 5 for some, 4 for US-style systems.',
      'The linear method maps your CGPA proportionally onto the 4.0 scale: GPA = (CGPA ÷ max) × 4.',
      'For 10-point scales the calculator also shows a percentage equivalent using the CBSE convention of multiplying by 9.5.',
      'No single conversion is accepted by every institution — universities and evaluators like WES apply their own tables, so treat the result as a reference estimate.',
    ],
  },
  {
    slug: 'german-grade-calculator',
    name: 'German Grade Calculator',
    category: 'gpa',
    tagline: 'Convert your marks to the German 1.0–5.0 scale with the Modified Bavarian Formula.',
    metaTitle: 'German Grade Calculator – Convert Marks to the German Scale',
    description:
      'Convert your marks or percentage into the German 1.0–5.0 grading scale using the Modified Bavarian Formula, the same method German universities and uni-assist apply.',
    formula: 'German grade = 1 + 3 × ( Nmax − Nd ) ÷ ( Nmax − Nmin )',
    howItWorks: [
      'Nd is your score, Nmax is the best possible score in your system and Nmin is the minimum passing score.',
      'The Modified Bavarian Formula converts any marking scheme onto the German scale from 1.0 (best) to 5.0 (fail).',
      'Lower is better in Germany: 1.0–1.5 is excellent, 4.0 is the minimum pass and anything below the passing mark counts as failed (5.0).',
      'German universities and uni-assist use this exact formula to evaluate international transcripts, so your result matches what they will compute — provided you enter your system’s real passing mark.',
    ],
  },
  {
    slug: 'gre-to-gmat-conversion',
    name: 'GRE To GMAT Conversion',
    category: 'converter',
    tagline: 'Estimate your GMAT total from your GRE Verbal and Quantitative scores.',
    metaTitle: 'GRE to GMAT Converter – Estimate Your GMAT Score',
    description:
      'Convert GRE Verbal and Quantitative scores into an estimated GMAT total using published concordance data — with honest notes on what the estimate can and cannot tell you.',
    formula: 'Estimated GMAT = concordance estimate from GRE Verbal + Quantitative (260–340 total)',
    howItWorks: [
      'Business schools accept both the GRE and the GMAT, so published concordance tables translate scores between the two tests statistically.',
      'This tool interpolates published GMAC/ETS comparison data to estimate your GMAT total from your GRE Verbal + Quantitative score.',
      'The estimate applies to the classic GMAT total-score scale of 200–800; the newer GMAT Focus Edition uses a different 205–805 scale with its own concordance.',
      'Concordance matches percentile standing, not ability — admissions teams see your official GRE score and evaluate it directly.',
    ],
  },
  {
    slug: 'toefl-to-ielts-conversion',
    name: 'TOEFL To IELTS Conversion',
    category: 'converter',
    tagline: 'See the IELTS band equivalent of any TOEFL iBT total score.',
    metaTitle: 'TOEFL to IELTS Converter – Band Score Equivalent',
    description:
      'Convert any TOEFL iBT total score to its IELTS band equivalent using ETS-published comparison ranges, with the full table and honest caveats.',
    formula: 'IELTS band = comparison band for your TOEFL iBT total (0–120)',
    howItWorks: [
      'ETS publishes an official comparison table linking TOEFL iBT total scores to IELTS band scores.',
      'Enter your TOEFL total out of 120 to find the matching IELTS band from 4.0 to 9.0.',
      'The comparison matches how similarly-performing groups of test takers score, so it is a reference conversion, not a guarantee.',
      'Universities receive your official score from the test provider — the conversion simply tells you which requirement you already meet.',
    ],
  },
  {
    slug: 'sat-to-act-conversion',
    name: 'SAT To ACT Conversion',
    category: 'converter',
    tagline: 'See the ACT composite equivalent of any SAT total score.',
    metaTitle: 'SAT to ACT Converter – Score Concordance Tool',
    description:
      'Convert any SAT total score to its ACT composite equivalent using the official College Board and ACT concordance table, with the full reference table included.',
    formula: 'ACT composite = concordant ACT score for your SAT total (400–1600)',
    howItWorks: [
      'The College Board and ACT publish a joint concordance table linking SAT totals to ACT composites.',
      'Enter your SAT total out of 1600 to find the ACT composite that represents the same percentile standing.',
      'Concordant scores describe equivalent performance among test takers — they are statistical equivalents, not predictions.',
      'Colleges treat concordant scores as comparable, so you never need to take both tests.',
    ],
  },
];

export const SLUG_ALIASES: Record<string, string> = {
  'gre-to-gmat': 'gre-to-gmat-conversion',
  'toefl-to-ielts': 'toefl-to-ielts-conversion',
  'sat-to-act': 'sat-to-act-conversion',
};

export function getCalculator(slug: string): CalculatorMeta | undefined {
  const canonical = SLUG_ALIASES[slug] || slug;
  return CALCULATORS.find((c) => c.slug === canonical);
}

export function getCalculatorCategories(): CalculatorCategoryInfo[] {
  return CATEGORY_ORDER.map((id) => ({
    id,
    label: CALCULATOR_CATEGORY_LABELS[id],
    blurb:
      id === 'score'
        ? 'Add up your section scores to get your official total for GRE, SAT, TOEFL, IELTS, ACT and PTE.'
        : id === 'gpa'
          ? 'Convert grades, CGPA and marks into the scales universities actually ask for.'
          : 'Move between tests with reference conversions based on published comparison data.',
    calculators: CALCULATORS.filter((c) => c.category === id),
  }));
}
