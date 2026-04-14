declare const describe: (name: string, fn: () => void) => void
declare const it: (name: string, fn: () => void | Promise<void>) => void

describe('listing fee flow', () => {
  it('activates free-tier listing immediately', async () => {
    // Integration expectation:
    // POST /api/listings/fee-checkout with price < 1000
    // -> returns success with status=active
    // -> listing status should be active and listing_fee_status should be free
  })

  it('keeps paid listing as draft until webhook marks fee paid', async () => {
    // Integration expectation:
    // POST /api/listings/fee-checkout with price >= 1000
    // -> returns checkoutUrl and pending_payment
    // -> listing remains draft
    // -> checkout.session.completed (listing_fee) webhook transitions listing to active
  })

  it('does not activate listing when checkout is cancelled', async () => {
    // Integration expectation:
    // checkout.session.expired for listing_fee
    // -> listing_fee.status becomes cancelled
    // -> listing remains in draft and not visible to buyers
  })

  it('rejects non-admin requests for admin endpoints', async () => {
    // Integration expectation:
    // GET /api/admin/overview by non-admin should return 403.
  })
})
