import { calculateListingFee } from '@/lib/listing-fees'

declare const describe: (name: string, fn: () => void) => void
declare const it: (name: string, fn: () => void) => void
declare const expect: (value: unknown) => { toBe: (expected: unknown) => void }

describe('calculateListingFee', () => {
  it('returns 0 below $1000', () => {
    expect(calculateListingFee(999.99)).toBe(0)
  })

  it('returns 5 between $1000 and $4999.99', () => {
    expect(calculateListingFee(1000)).toBe(5)
    expect(calculateListingFee(4999.99)).toBe(5)
  })

  it('returns 10 between $5000 and $14999.99', () => {
    expect(calculateListingFee(5000)).toBe(10)
    expect(calculateListingFee(14999.99)).toBe(10)
  })

  it('returns 15 between $15000 and $49999.99', () => {
    expect(calculateListingFee(15000)).toBe(15)
    expect(calculateListingFee(49999.99)).toBe(15)
  })

  it('returns 25 between $50000 and $249999.99', () => {
    expect(calculateListingFee(50000)).toBe(25)
    expect(calculateListingFee(249999.99)).toBe(25)
  })

  it('returns 50 between $250000 and $999999.99', () => {
    expect(calculateListingFee(250000)).toBe(50)
    expect(calculateListingFee(999999.99)).toBe(50)
  })

  it('returns 100 for $1000000 and above', () => {
    expect(calculateListingFee(1000000)).toBe(100)
    expect(calculateListingFee(5000000)).toBe(100)
  })
})
