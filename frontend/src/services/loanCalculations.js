export function calculateMonthlyEmi(principal, annualRate, termMonths) {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(termMonths) ||
    principal <= 0 ||
    annualRate < 0 ||
    termMonths <= 0
  ) {
    throw new RangeError('Loan amount and term must be positive, and the annual rate cannot be negative.');
  }

  const monthlyRate = annualRate / 1200;
  const emi = monthlyRate === 0
    ? principal / termMonths
    : (principal * monthlyRate * (1 + monthlyRate) ** termMonths)
      / ((1 + monthlyRate) ** termMonths - 1);
  return Math.round(emi * 100) / 100;
}
