export interface ListingFeeTier {
  min: number
  max: number | null
  fee: number
}

export const LISTING_FEE_TIERS: ListingFeeTier[] = [
  { min: 0, max: 1000, fee: 0 },
  { min: 1000, max: 5000, fee: 5 },
  { min: 5000, max: 15000, fee: 10 },
  { min: 15000, max: 50000, fee: 15 },
  { min: 50000, max: 250000, fee: 25 },
  { min: 250000, max: 1000000, fee: 50 },
  { min: 1000000, max: null, fee: 100 },
]

export function calculateListingFee(price: number): number {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Listing price must be a non-negative number')
  }

  const tier = LISTING_FEE_TIERS.find((item) => {
    const inLowerBound = price >= item.min
    const inUpperBound = item.max === null ? true : price < item.max
    return inLowerBound && inUpperBound
  })

  if (!tier) {
    throw new Error('Unable to determine listing fee')
  }

  return tier.fee
}
