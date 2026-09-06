import assert from 'node:assert/strict';
import test from 'node:test';
import { checkDigits, cleanCpf, corrections, formatCpf, isValidCpf, verificationDigit } from '../src/cpf.mjs';

test('cleans and formats a CPF without retaining non-numeric characters', () => {
  assert.equal(cleanCpf('529.982.247-25abc'), '52998224725');
  assert.equal(formatCpf('52998224725'), '529.982.247-25');
  assert.equal(cleanCpf(null), '');
  assert.equal(cleanCpf('123456789012345'), '12345678901');
});

test('rejects invalid low-level calculation input explicitly', () => {
  assert.throws(() => checkDigits('52998224'), /9 algarismos/);
  assert.throws(() => checkDigits('529982247x'), /9 algarismos/);
  assert.throws(() => verificationDigit('abc', 10), /inválidos/);
});

test('validates CPF verification digits and rejects repeated sequences', () => {
  assert.equal(isValidCpf('52998224725'), true);
  assert.equal(isValidCpf('111.444.777-35'), true);
  assert.equal(isValidCpf('52998224724'), false);
  assert.equal(isValidCpf('00000000000'), false);
});

test('corrects only missing or invalid verification digits', () => {
  assert.equal(checkDigits('529982247'), '25');
  assert.deepEqual(corrections('52998224724'), [{ value: '52998224725', reason: 'Dígitos verificadores recalculados', confidence: 96, correctionType: 'check-digits' }]);
  assert.deepEqual(corrections('529982247'), [{ value: '52998224725', reason: 'Dígitos verificadores ausentes', confidence: 98 }]);
  assert.deepEqual(corrections('52998224725'), []);
  assert.deepEqual(corrections('00000000000'), []);
});

test('identifies candidates where one base digit conflicts with supplied verification digits', () => {
  const suggestions = corrections('52998234725');
  const baseDigitCandidate = suggestions.find(({ correctionType }) => correctionType === 'base-digit');

  assert.deepEqual(baseDigitCandidate, {
    value: '52998224725',
    reason: 'Possível erro no algarismo 7: 3 → 2',
    confidence: 82,
    correctionType: 'base-digit',
    changedIndex: 6
  });
  assert.equal(isValidCpf(baseDigitCandidate.value), true);
  assert.equal(baseDigitCandidate.value.slice(9), '25');
});

test('computed check digits create valid CPF values for representative bases', () => {
  for (const base of ['001002003', '123456789', '987654321', '999999998']) {
    assert.equal(isValidCpf(base + checkDigits(base)), true);
  }
});
