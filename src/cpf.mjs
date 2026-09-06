const CPF_LENGTH = 11;
const BASE_LENGTH = 9;
const DIGITS = /^\d+$/;
const REPEATED_DIGITS = /^(\d)\1{10}$/;

function assertBase(base) {
  if (typeof base !== 'string' || base.length !== BASE_LENGTH || !DIGITS.test(base)) {
    throw new TypeError('A base do CPF deve conter exatamente 9 algarismos.');
  }
}

export function cleanCpf(value = '') {
  return String(value ?? '').replace(/\D/g, '').slice(0, CPF_LENGTH);
}

export function verificationDigit(base, start) {
  if (!Number.isInteger(start) || start < 2 || start > 11 || typeof base !== 'string' || base.length !== start - 1 || !DIGITS.test(base)) {
    throw new TypeError('Dados inválidos para o cálculo do dígito verificador.');
  }
  const total = [...base].reduce((sum, value, index) => sum + Number(value) * (start - index), 0);
  const result = (total * 10) % 11;
  return result === 10 ? 0 : result;
}

export function checkDigits(base) {
  assertBase(base);
  const first = verificationDigit(base, 10);
  return `${first}${verificationDigit(`${base}${first}`, 11)}`;
}

export function isValidCpf(value) {
  const number = cleanCpf(value);
  if (number.length !== CPF_LENGTH || REPEATED_DIGITS.test(number)) return false;
  const base = number.slice(0, BASE_LENGTH);
  return number.slice(BASE_LENGTH) === checkDigits(base);
}

export function formatCpf(value = '') {
  const number = cleanCpf(value);
  return number
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function corrections(value) {
  const source = cleanCpf(value);
  if (source.length === BASE_LENGTH) {
    return [{ value: source + checkDigits(source), reason: 'Dígitos verificadores ausentes', confidence: 98 }];
  }
  if (source.length !== CPF_LENGTH || isValidCpf(source) || REPEATED_DIGITS.test(source)) return [];
  const suggestions = [];
  const base = source.slice(0, BASE_LENGTH);
  const suppliedCheckDigits = source.slice(BASE_LENGTH);
  const correctedCheckDigits = base + checkDigits(base);

  suggestions.push({
    value: correctedCheckDigits,
    reason: 'Dígitos verificadores recalculados',
    confidence: 96,
    correctionType: 'check-digits'
  });

  // Assume the supplied verification digits are correct and test one typo in the base.
  // There may be more than one mathematically valid candidate, so callers must present
  // these as suggestions rather than asserting a unique correction.
  for (let index = 0; index < BASE_LENGTH; index += 1) {
    for (let replacement = 0; replacement <= 9; replacement += 1) {
      const nextDigit = String(replacement);
      if (nextDigit === base[index]) continue;
      const candidate = `${base.slice(0, index)}${nextDigit}${base.slice(index + 1)}${suppliedCheckDigits}`;
      if (!isValidCpf(candidate)) continue;
      suggestions.push({
        value: candidate,
        reason: `Possível erro no algarismo ${index + 1}: ${base[index]} → ${nextDigit}`,
        confidence: 82,
        correctionType: 'base-digit',
        changedIndex: index
      });
    }
  }

  return suggestions
    .filter((suggestion, index, list) => list.findIndex(({ value: candidate }) => candidate === suggestion.value) === index)
    .sort((first, second) => second.confidence - first.confidence || first.value.localeCompare(second.value))
    .slice(0, 5);
}
