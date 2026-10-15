import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeText,
  convertCase,
  cleanWhitespace,
  removeDuplicateLines,
  generateSlug,
  encodeHTMLEntities,
  decodeHTMLEntities,
  utf8ToBase64,
  base64ToUtf8,
  formatJSON,
  parseCSV,
} from './textProcessing.ts';

import {
  calculatePercentageOf,
  calculateIsWhatPercentage,
  calculatePercentageChange,
  calculateDiscount,
  calculateTipAndSplit,
  convertUnits,
  calculateLoanEMI,
  calculateCompoundInterest,
  calculateVAT,
  convertNumeralBases,
  calculateAspectRatio,
  gcd,
} from './calcProcessing.ts';

import {
  generatePassword,
  calculatePasswordStrength,
  parseURL,
  explainCron,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
} from './devProcessing.ts';

import { parsePageRanges } from './pdfProcessing.ts';

test('analyzeText calculates English and Bengali word counts accurately', () => {
  const english = 'The quick brown fox jumps over the lazy dog.';
  const statsEn = analyzeText(english);
  assert.equal(statsEn.words, 9);
  assert.equal(statsEn.characters, 44);
  assert.equal(statsEn.sentences, 1);

  // Bengali text test
  const bengali = 'নোভাটুলস একটি চমৎকার ফ্রি টুলস প্ল্যাটফর্ম। এখানে অনেক টুল আছে।';
  const statsBn = analyzeText(bengali);
  assert.equal(statsBn.words, 10);
  assert.equal(statsBn.sentences, 2);
});

test('convertCase handles various text casing formats', () => {
  const input = 'hello world test';
  assert.equal(convertCase(input, 'upper'), 'HELLO WORLD TEST');
  assert.equal(convertCase(input, 'camel'), 'helloWorldTest');
  assert.equal(convertCase(input, 'snake'), 'hello_world_test');
  assert.equal(convertCase(input, 'kebab'), 'hello-world-test');
});

test('cleanWhitespace and removeDuplicateLines operate correctly', () => {
  const messy = '  line 1   \n\n\n  line 2  \n  line 1  ';
  const cleaned = cleanWhitespace(messy, { removeMultipleSpaces: true, removeBlankLines: true, trimLines: true });
  assert.equal(cleaned, 'line 1\nline 2\nline 1');

  const deduped = removeDuplicateLines(cleaned);
  assert.equal(deduped.result, 'line 1\nline 2');
  assert.equal(deduped.removedCount, 1);
});

test('generateSlug strips special characters and normalizes', () => {
  const title = 'NovaTools: 80+ Powerful Tools & Free Utilities!';
  const slug = generateSlug(title);
  assert.equal(slug, 'novatools-80-powerful-tools-free-utilities');
});

test('HTML entity encoding and decoding', () => {
  const raw = '<div class="nova">Hello & Welcome!</div>';
  const encoded = encodeHTMLEntities(raw);
  assert.equal(encoded.includes('<'), false);
  const decoded = decodeHTMLEntities(encoded);
  assert.equal(decoded, raw);
});

test('UTF-8 Base64 roundtrip with Unicode', () => {
  const utf8Text = 'NovaTools 🚀 স্বাগতম';
  const b64 = utf8ToBase64(utf8Text);
  const back = base64ToUtf8(b64);
  assert.equal(back, utf8Text);
});

test('formatJSON handles valid and invalid JSON', () => {
  const valid = '{"name":"NovaTools","tools":82}';
  const resValid = formatJSON(valid, 2);
  assert.equal(resValid.isValid, true);
  assert.ok(resValid.formatted.includes('  "name": "NovaTools"'));

  const invalid = '{name:NovaTools}';
  const resInvalid = formatJSON(invalid);
  assert.equal(resInvalid.isValid, false);
  assert.ok(resInvalid.error);
});

test('parseCSV correctly handles quotes and commas', () => {
  const csv = 'Name,Category,Active\n"Tool 1, Pro",Image,true\nTool 2,PDF,false';
  const parsed = parseCSV(csv);
  assert.deepEqual(parsed.headers, ['Name', 'Category', 'Active']);
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0][0], 'Tool 1, Pro');
});

test('Percentage calculations are mathematically accurate', () => {
  assert.equal(calculatePercentageOf(25, 200), 50);
  assert.equal(calculateIsWhatPercentage(40, 200), 20);
  const change = calculatePercentageChange(100, 150);
  assert.equal(change.change, 50);
  assert.equal(change.type, 'increase');
});

test('calculateDiscount computes savings and final price correctly', () => {
  // $100 original, 20% discount, 10% coupon, 5% tax
  // 100 - 20 = 80; 80 - 8 = 72; 72 * 1.05 = 75.60
  const res = calculateDiscount(100, 20, 10, 5);
  assert.equal(res.baseDiscount, 20);
  assert.equal(res.couponDiscount, 8);
  assert.equal(res.taxableAmount, 72);
  assert.equal(Math.round(res.finalPrice * 100) / 100, 75.6);
});

test('calculateTipAndSplit splits bills evenly', () => {
  const res = calculateTipAndSplit(100, 15, 2);
  assert.equal(res.tipAmount, 15);
  assert.equal(res.totalWithTip, 115);
  assert.equal(res.totalPerPerson, 57.5);
});

test('Unit conversion factors are exact', () => {
  // 1 km = 1000 m
  const kmToM = convertUnits('length', 1, 'km', 'm');
  assert.equal(kmToM, 1000);

  // 1 mile = 1609.344 m
  const mileToM = convertUnits('length', 1, 'mile', 'm');
  assert.equal(mileToM, 1609.344);

  // 100 C to Fahrenheit = 212 F
  const cToF = convertUnits('temperature', 100, 'celsius', 'fahrenheit');
  assert.equal(cToF, 212);
});

test('Loan EMI formula matches standard banking calculation', () => {
  // 100000 at 10% annual interest for 12 months
  const res = calculateLoanEMI(100000, 10, 12);
  assert.ok(res.monthlyEMI > 8700 && res.monthlyEMI < 8850);
  assert.ok(res.totalInterest > 5000 && res.totalInterest < 6000);
});

test('VAT calculations for add and extract modes', () => {
  const add = calculateVAT(100, 20, 'add');
  assert.equal(add.vatAmount, 20);
  assert.equal(add.grossAmount, 120);

  const extract = calculateVAT(120, 20, 'extract');
  assert.equal(Math.round(extract.netAmount), 100);
  assert.equal(Math.round(extract.vatAmount), 20);
});

test('Numeral base conversions', () => {
  const res = convertNumeralBases('255', 10);
  assert.equal(res.hex, 'FF');
  assert.equal(res.bin, '11111111');
  assert.equal(res.oct, '377');
});

test('Aspect ratio calculation and gcd', () => {
  assert.equal(gcd(1920, 1080), 120);
  const ratio = calculateAspectRatio(1920, 1080);
  assert.equal(ratio.ratioStr, '16:9');
});

test('Password generator and strength evaluator', () => {
  const pass = generatePassword({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  assert.equal(pass.length, 16);
  const strength = calculatePasswordStrength(pass);
  assert.equal(strength.score, 4);
});

test('URL parser extracts components and search params', () => {
  const res = parseURL('https://novatools.app:8080/tools/pdf-reader?lang=en&theme=dark#preview');
  assert.equal(res.isValid, true);
  assert.equal(res.protocol, 'https:');
  assert.equal(res.hostname, 'novatools.app');
  assert.equal(res.port, '8080');
  assert.equal(res.pathname, '/tools/pdf-reader');
  assert.equal(res.hash, '#preview');
  assert.equal(res.searchParams?.length, 2);
});

test('Cron expression helper explains basic cron schedule', () => {
  const exp = explainCron('*/15 * * * *');
  assert.ok(exp.includes('every 15 minutes'));

  const expDaily = explainCron('0 9 * * *');
  assert.ok(expDaily.includes('at 09:00'));
});

test('Color conversions (hexToRgb, rgbToHex, rgbToHsl)', () => {
  const rgb = hexToRgb('#06b6d4');
  assert.ok(rgb);
  assert.equal(rgb.r, 6);
  assert.equal(rgb.g, 182);
  assert.equal(rgb.b, 212);

  const hex = rgbToHex(6, 182, 212);
  assert.equal(hex.toLowerCase(), '#06b6d4');

  const hsl = rgbToHsl(6, 182, 212);
  assert.equal(hsl.h, 189);
});

test('parsePageRanges handles ranges and individual page numbers', () => {
  const indices = parsePageRanges('1-3, 5, 8-9', 10);
  // 0-indexed: 0, 1, 2, 4, 7, 8
  assert.deepEqual(indices, [0, 1, 2, 4, 7, 8]);
});
