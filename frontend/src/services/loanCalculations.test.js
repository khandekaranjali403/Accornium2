import { calculateMonthlyEmi } from './loanCalculations';

describe('calculateMonthlyEmi', () => {
  it('calculates the standard monthly payment for a positive annual rate', () => {
    expect(calculateMonthlyEmi(100000, 12, 12)).toBeCloseTo(8884.88, 2);
  });

  it('uses straight principal installments when the rate is zero', () => {
    expect(calculateMonthlyEmi(12000, 0, 12)).toBe(1000);
  });
});
