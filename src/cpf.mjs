const isDigits = (value) => /^\d{11}$/.test(value);

export function cleanCpf(value = '') {
  return String(value).replace(/\D/g, '').slice(0, 11);
}

export function verificationDigit(base, start) {
  const total = [...base].reduce((sum, value, index) => sum + Number(value) * (start - index), 0);
  const result = (total * 10) % 11;
  return result === 10 ? 0 : result;
}

export function checkDigits(base) {
  const first = verificationDigit(base, 10);
  return `${first}${verificationDigit(`${base}${first}`, 11)}`;
}

export function isValidCpf(value) {
  const number = cleanCpf(value);
  if (!isDigits(number) || /^(\d)\1{10}$/.test(number)) return false;
  return verificationDigit(number.slice(0, 9), 10) === Number(number[9])
    && verificationDigit(number.slice(0, 10), 11) === Number(number[10]);
}

export function formatCpf(value = '') {
  return cleanCpf(value).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function corrections(value) {
  const source = cleanCpf(value);
  if (source.length === 9) return [{ value: source + checkDigits(source), reason: 'Dígitos verificadores ausentes', confidence: 98 }];
  if (source.length !== 11 || isValidCpf(source)) return [];
  const corrected = source.slice(0, 9) + checkDigits(source.slice(0, 9));
  return isValidCpf(corrected) ? [{ value: corrected, reason: 'Dígitos verificadores recalculados', confidence: 96 }] : [];
}
