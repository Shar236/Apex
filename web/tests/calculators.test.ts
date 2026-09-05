import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  actToSat,
  calculateAct,
  calculateCgpaToGpa,
  calculateGpa,
  calculateGermanGrade,
  calculateGre,
  calculateIelts,
  calculatePte,
  calculateSat,
  calculateToefl,
  clamp,
  greToGmat,
  pteCefr,
  satToAct,
  toeflToIelts,
} from '../lib/calculator-logic.ts';

describe('clamp', () => {
  it('keeps values inside the range', () => {
    assert.equal(clamp(5, 1, 10), 5);
    assert.equal(clamp(0, 1, 10), 1);
    assert.equal(clamp(11, 1, 10), 10);
  });
});

describe('calculateGre', () => {
  it('sums verbal and quant for the total', () => {
    const r = calculateGre({ verbal: 158, quant: 162, awa: 4.5 });
    assert.equal(r.total, 320);
    assert.equal(r.awa, 4.5);
  });
  it('clamps sections to the 130-170 scale', () => {
    const r = calculateGre({ verbal: 100, quant: 200, awa: 0 });
    assert.equal(r.verbal, 130);
    assert.equal(r.quant, 170);
    assert.equal(r.total, 300);
  });
  it('bounds the minimum and maximum totals', () => {
    assert.equal(calculateGre({ verbal: 130, quant: 130, awa: 0 }).total, 260);
    assert.equal(calculateGre({ verbal: 170, quant: 170, awa: 6 }).total, 340);
  });
  it('snaps AWA to half-point increments', () => {
    assert.equal(calculateGre({ verbal: 150, quant: 150, awa: 3.3 }).awa, 3.5);
    assert.equal(calculateGre({ verbal: 150, quant: 150, awa: 9 }).awa, 6);
  });
});

describe('calculateSat', () => {
  it('sums both sections to the 400-1600 total', () => {
    const r = calculateSat({ rw: 640, math: 680 });
    assert.deepEqual([r.rw, r.math, r.total], [640, 680, 1320]);
  });
  it('snaps section scores to 10-point increments and clamps to 200-800', () => {
    const r = calculateSat({ rw: 644, math: 995 });
    assert.equal(r.rw, 640);
    assert.equal(r.math, 800);
  });
  it('bounds the minimum and maximum totals', () => {
    assert.equal(calculateSat({ rw: 200, math: 200 }).total, 400);
    assert.equal(calculateSat({ rw: 800, math: 800 }).total, 1600);
  });
});

describe('calculateToefl', () => {
  it('sums four sections to the 0-120 total', () => {
    const r = calculateToefl({ reading: 27, listening: 26, speaking: 24, writing: 25 });
    assert.equal(r.total, 102);
  });
  it('clamps each section to 0-30', () => {
    const r = calculateToefl({ reading: 45, listening: -3, speaking: 30, writing: 30 });
    assert.deepEqual([r.reading, r.listening, r.speaking, r.writing], [30, 0, 30, 30]);
    assert.equal(r.total, 90);
  });
  it('bounds minimum and maximum totals', () => {
    assert.equal(calculateToefl({ reading: 0, listening: 0, speaking: 0, writing: 0 }).total, 0);
    assert.equal(calculateToefl({ reading: 30, listening: 30, speaking: 30, writing: 30 }).total, 120);
  });
});

describe('calculateIelts (official rounding)', () => {
  it('returns the mean when it lands on a whole or half band', () => {
    const r = calculateIelts({ listening: 7.5, reading: 7, writing: 6.5, speaking: 7 });
    assert.equal(r.overall, 7.0);
  });
  it('rounds a .25 mean UP to the next half band', () => {
    const r = calculateIelts({ listening: 6, reading: 6, writing: 6, speaking: 7 });
    assert.equal(r.overall, 6.5);
  });
  it('rounds a .75 mean UP to the next whole band', () => {
    const r = calculateIelts({ listening: 7, reading: 7, writing: 7, speaking: 6.5 });
    assert.equal(r.overall, 7.0);
  });
  it('keeps a mean closer to the lower band at the lower band', () => {
    const r = calculateIelts({ listening: 6, reading: 6, writing: 6.5, speaking: 6 });
    assert.equal(r.overall, 6.0);
  });
  it('clamps skills to the 0-9 band scale', () => {
    const r = calculateIelts({ listening: -2, reading: 12, writing: 6.3, speaking: 9 });
    assert.deepEqual([r.listening, r.reading, r.writing, r.speaking], [0, 9, 6.5, 9]);
  });
});

describe('calculateAct', () => {
  it('averages four subjects into the composite', () => {
    const r = calculateAct({ english: 28, math: 27, reading: 29, science: 26 });
    assert.equal(r.composite, 28);
  });
  it('rounds a .5 mean up', () => {
    assert.equal(calculateAct({ english: 28, math: 27, reading: 28, science: 27 }).composite, 28);
  });
  it('clamps subjects to 1-36', () => {
    const r = calculateAct({ english: 0, math: 40, reading: 1, science: 36 });
    assert.deepEqual([r.english, r.math, r.reading, r.science, r.composite], [1, 36, 1, 36, 19]);
  });
});

describe('calculatePte (estimate)', () => {
  it('averages the four communicative skills', () => {
    const r = calculatePte({ listening: 72, reading: 68, speaking: 75, writing: 69 });
    assert.equal(r.overall, 71);
    assert.equal(r.cefr.level, 'B2');
  });
  it('clamps skills to the 10-90 scale', () => {
    const r = calculatePte({ listening: 5, reading: 95, speaking: 50, writing: 50 });
    assert.deepEqual([r.listening, r.reading, r.speaking, r.writing, r.overall], [10, 90, 50, 50, 50]);
  });
  it('maps CEFR boundaries correctly', () => {
    assert.equal(pteCefr(90).level, 'C2');
    assert.equal(pteCefr(85).level, 'C2');
    assert.equal(pteCefr(84).level, 'C1');
    assert.equal(pteCefr(76).level, 'C1');
    assert.equal(pteCefr(59).level, 'B2');
    assert.equal(pteCefr(43).level, 'B1');
    assert.equal(pteCefr(30).level, 'A2');
    assert.equal(pteCefr(10).level, 'A1');
  });
});

describe('calculateGpa (WES-style)', () => {
  it('computes a credit-weighted GPA', () => {
    const r = calculateGpa([
      { credits: 4, grade: 'A-' },
      { credits: 3, grade: 'B+' },
      { credits: 3, grade: 'B' },
    ]);
    assert.equal(r.totalCredits, 10);
    assert.equal(r.totalPoints, 33.67);
    assert.equal(r.gpa, 3.37);
  });
  it('treats unknown grades as zero points but counts credits', () => {
    const r = calculateGpa([
      { credits: 3, grade: 'A' },
      { credits: 3, grade: 'ZZ' },
    ]);
    assert.equal(r.gpa, 2.0);
  });
  it('returns null GPA when no credits are entered', () => {
    const r = calculateGpa([
      { credits: 0, grade: 'A' },
      { credits: 0, grade: 'B' },
    ]);
    assert.equal(r.gpa, null);
  });
  it('maps boundary grades to the standard points', () => {
    const all = calculateGpa(
      ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map((grade) => ({ credits: 1, grade })),
    );
    assert.equal(all.totalPoints, 29.0);
    assert.equal(all.gpa, 2.42);
  });
});

describe('calculateCgpaToGpa (linear, reference only)', () => {
  it('maps a 10-point CGPA proportionally onto 4.0', () => {
    const r = calculateCgpaToGpa({ cgpa: 8.6, maxCgpa: 10 });
    assert.equal(r.gpa, 3.44);
    assert.equal(r.percentage, 81.7);
  });
  it('omits the percentage for non-10-point scales', () => {
    const r = calculateCgpaToGpa({ cgpa: 3, maxCgpa: 4 });
    assert.equal(r.gpa, 3);
    assert.equal(r.percentage, null);
  });
  it('handles a 5-point scale', () => {
    const r = calculateCgpaToGpa({ cgpa: 4, maxCgpa: 5 });
    assert.equal(r.gpa, 3.2);
  });
  it('returns the floor and ceiling cleanly', () => {
    assert.equal(calculateCgpaToGpa({ cgpa: 0, maxCgpa: 10 }).gpa, 0);
    assert.equal(calculateCgpaToGpa({ cgpa: 10, maxCgpa: 10 }).gpa, 4);
  });
});

describe('calculateGermanGrade (Modified Bavarian Formula)', () => {
  it('computes the documented example 78/100 with pass 35 -> ~2.02', () => {
    const r = calculateGermanGrade({ obtained: 78, max: 100, min: 35 });
    assert.ok(r);
    assert.equal(r!.grade, 2.02);
    assert.equal(r!.label.includes('Gut'), true);
  });
  it('returns 1.0 for a perfect score', () => {
    const r = calculateGermanGrade({ obtained: 100, max: 100, min: 35 });
    assert.ok(r);
    assert.equal(r!.grade, 1.0);
  });
  it('returns 4.0 at the exact passing mark', () => {
    const r = calculateGermanGrade({ obtained: 35, max: 100, min: 35 });
    assert.ok(r);
    assert.equal(r!.grade, 4.0);
  });
  it('returns 5.0 (fail) below the passing mark', () => {
    const r = calculateGermanGrade({ obtained: 30, max: 100, min: 35 });
    assert.ok(r);
    assert.equal(r!.grade, 5.0);
    assert.equal(r!.label.includes('Nicht bestanden'), true);
  });
  it('rejects an invalid scale', () => {
    assert.equal(calculateGermanGrade({ obtained: 50, max: 40, min: 40 }), null);
    assert.equal(calculateGermanGrade({ obtained: 50, max: 0, min: 35 }), null);
  });
});

describe('greToGmat (concordance estimate)', () => {
  it('maps the scale floors and ceilings', () => {
    assert.equal(greToGmat(130, 130), 200);
    assert.equal(greToGmat(170, 170), 800);
  });
  it('interpolates the published anchor region', () => {
    assert.equal(greToGmat(160, 160), 680);
    assert.equal(greToGmat(158, 160), 660);
  });
  it('increases monotonically with the GRE total', () => {
    const low = greToGmat(150, 150);
    const mid = greToGmat(155, 155);
    const high = greToGmat(160, 160);
    assert.equal(low < mid && mid < high, true);
  });
  it('never returns values outside the 200-800 GMAT range', () => {
    assert.equal(greToGmat(0, 0), 200);
    assert.equal(greToGmat(999, 999), 800);
  });
});

describe('toeflToIelts (ETS comparison)', () => {
  it('maps the documented ranges', () => {
    assert.equal(toeflToIelts(120), 9);
    assert.equal(toeflToIelts(118), 9);
    assert.equal(toeflToIelts(100), 7);
    assert.equal(toeflToIelts(96), 7);
    assert.equal(toeflToIelts(79), 6.5);
    assert.equal(toeflToIelts(31), 4);
  });
  it('returns null below the comparison floor', () => {
    assert.equal(toeflToIelts(30), null);
    assert.equal(toeflToIelts(0), null);
  });
});

describe('SAT <-> ACT concordance', () => {
  it('maps the documented example 1310 -> 28', () => {
    assert.equal(satToAct(1310), 28);
  });
  it('maps 1200 -> 25 and 1600 -> 36', () => {
    assert.equal(satToAct(1200), 25);
    assert.equal(satToAct(1600), 36);
  });
  it('floors the lowest SAT to the lowest concordant ACT', () => {
    assert.equal(satToAct(400), 3);
  });
  it('round-trips through the SAT range midpoint', () => {
    assert.equal(actToSat(36), 1585);
    assert.equal(actToSat(28), 1310);
    assert.equal(actToSat(3), 400);
  });
});
