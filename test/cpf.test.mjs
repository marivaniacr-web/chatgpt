import assert from 'node:assert/strict';
import test from 'node:test';
import { checkDigits, cleanCpf, corrections, formatCpf, isValidCpf } from '../src/cpf.mjs';

test('cleans and formats a CPF without retaining non-numeric characters', () => {
  assert.equal(cleanCpf('529.982.247-25abc'), '52998224725');
  assert.equal(formatCpf('52998224725'), '529.982.247-25');
});

test('validates CPF verification digits and rejects repeated sequences', () => {
  assert.equal(isValidCpf('52998224725'), true);
  assert.equal(isValidCpf('111.444.777-35'), true);
  assert.equal(isValidCpf('52998224724'), false);
  assert.equal(isValidCpf('00000000000'), false);
});

test('corrects only missing or invalid verification digits', () => {
  assert.equal(checkDigits('529982247'), '25');
  assert.deepEqual(corrections('52998224724'), [{ value: '52998224725', reason: 'Dígitos verificadores recalculados', confidence: 96 }]);
  assert.deepEqual(corrections('529982247'), [{ value: '52998224725', reason: 'Dígitos verificadores ausentes', confidence: 98 }]);
  assert.deepEqual(corrections('52998224725'), []);
});
