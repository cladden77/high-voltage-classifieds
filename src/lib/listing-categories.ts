export const LISTING_CATEGORIES = [
  'Distribution Hardware & Equipment',
  'Substation Hardware & Equipment',
  'Transmission Hardware & Equipment',
  'Arresters',
  'Breakers',
  'Clothing',
  'Conduit',
  'Insulators',
  'Switches & Switchgear',
  'Tools',
  'Trailers',
  'Transformers',
  'Trucks',
  'Voltage Regulators',
  'Wood & Steel Structures',
  'Wire & Cable',
  'Other',
] as const

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]
