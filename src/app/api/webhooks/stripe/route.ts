import { NextRequest, NextResponse } from 'next/server'
import { StripePayments } from '@/lib/payments'
import { StripeConnect } from '@/lib/stripe'
import { createAdminSupabase } from '@/lib/supabase-server'
import { sendSellerOrderEmail } from '@/lib/email/send'

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint is accessible',
    endpoint: '/api/webhooks/stripe',
    instructions: [
      '1. Go to Stripe Dashboard → Developers → Webhooks',
      '2. Add endpoint: https://your-domain.com/api/webhooks/stripe',
      '3. Select events: checkout.session.completed, payment_intent.succeeded',
      '4. Test the webhook using Stripe\'s test feature',
      '5. Check server logs for webhook events'
    ]
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    console.log('🔔 Webhook received:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      signatureLength: signature?.length,
      headers: Object.fromEntries(request.headers.entries())
    })

    if (!signature) {
      console.error('❌ No signature provided')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature (using StripeConnect for new implementation)
    let event
    try {
      event = await StripeConnect.validateWebhook(body, signature)
      console.log('✅ Webhook validated:', {
        eventType: event.type,
        eventId: event.id,
        created: event.created,
        account: event.account // For Connect events
      })
    } catch (validationError) {
      console.error('❌ Webhook validation failed:', validationError)
      console.error('❌ Validation error details:', {
        error: validationError,
        signature: signature?.substring(0, 20) + '...',
        bodyLength: body.length
      })
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabase()

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object
          const listingId = session.metadata?.listing_id
          const buyerId = session.metadata?.buyer_id
          const sellerId = session.metadata?.seller_id
          
          console.log('🛒 Checkout session completed:', {
            sessionId: session.id,
            paymentIntentId: session.payment_intent,
            listingId,
            buyerId,
            sellerId,
            amount: session.amount_total,
            paymentStatus: session.payment_status
          })
          
          if (!listingId || !buyerId || !sellerId) {
            console.error('Missing metadata in checkout session:', session.id)
            break
          }

          // Only process if payment is actually completed
          if (session.payment_status !== 'paid') {
            console.log('⏳ Payment not yet completed, waiting for payment_intent.succeeded event')
            break
          }

          try {
            console.log('🔄 Processing checkout completion:', {
              sessionId: session.id,
              paymentIntentId: session.payment_intent,
              listingId,
              buyerId,
              sellerId,
              amount: session.amount_total
            })

            // Get listing and seller details first
            const { data: listingData, error: listingDataError } = await supabase
              .from('listings')
              .select(`
                id,
                title,
                price,
                seller_id,
                users!listings_seller_id_fkey (
                  id,
                  full_name,
                  email
                )
              `)
              .eq('id', listingId)
              .single()

            if (listingDataError || !listingData) {
              console.error('❌ Error fetching listing data:', listingDataError)
              break
            }

            // Update order status to completed and add payment intent ID
            const { data: orderUpdate, error: orderError } = await supabase
              .from('orders')
              .update({ 
                status: 'paid',
                payment_intent_id: session.payment_intent,
                updated_at: new Date().toISOString()
              })
              .eq('listing_id', listingId)
              .eq('buyer_id', buyerId)
              .eq('status', 'pending')
              .select()

            if (orderError) {
              console.error('❌ Order update error:', orderError)
              console.error('❌ Order update details:', {
                listingId,
                buyerId,
                paymentIntentId: session.payment_intent,
                error: orderError
              })
            } else {
              console.log('✅ Order updated:', orderUpdate)
            }

            // Mark listing as sold
            const { data: listingUpdate, error: listingError } = await supabase
              .from('listings')
              .update({ 
                is_sold: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', listingId)
              .select()

            if (listingError) {
              console.error('❌ Listing update error:', listingError)
              console.error('❌ Listing update details:', {
                listingId,
                error: listingError
              })
            } else {
              console.log('✅ Listing marked as sold:', listingUpdate)
              console.log('✅ Listing update details:', {
                listingId,
                isSold: listingUpdate?.[0]?.is_sold,
                updatedAt: listingUpdate?.[0]?.updated_at
              })
              
              // Create notification for seller
              try {
                console.log('🔄 Creating seller notification for user:', sellerId)
                const { data: notificationId, error: notifError } = await supabase.rpc('create_notification', {
                  p_user_id: sellerId,
                  p_title: 'Listing Sold!',
                  p_message: `Your listing "${listingData.title}" has been sold for $${(session.amount_total || 0) / 100}.`,
                  p_type: 'success',
                  p_related_id: listingId,
                  p_related_type: 'listing'
                })
                
                if (notifError) {
                  console.error('❌ Seller notification RPC error:', notifError)
                } else {
                  console.log('✅ Seller notification created with ID:', notificationId)
                }
              } catch (notifError) {
                console.error('❌ Error creating seller notification:', notifError)
              }
              
              // Create notification for buyer
              try {
                console.log('🔄 Creating buyer notification for user:', buyerId)
                const { data: notificationId, error: notifError } = await supabase.rpc('create_notification', {
                  p_user_id: buyerId,
                  p_title: 'Purchase Successful!',
                  p_message: `You have successfully purchased "${listingData.title}" for $${(session.amount_total || 0) / 100}.`,
                  p_type: 'success',
                  p_related_id: listingId,
                  p_related_type: 'listing'
                })
                
                if (notifError) {
                  console.error('❌ Buyer notification RPC error:', notifError)
                } else {
                  console.log('✅ Buyer notification created with ID:', notificationId)
                }
              } catch (notifError) {
                console.error('❌ Error creating buyer notification:', notifError)
              }

              // Send seller email via Resend
              try {
                if (listingData?.users?.email) {
                  const amountFormatted = `$${(session.amount_total / 100).toLocaleString()}`
                  // Use payment intent as an order id stand-in if no orders table
                  const orderId = session.payment_intent || 'order'
                  await sendSellerOrderEmail({
                    to: listingData.users.email,
                    sellerName: listingData.users.full_name || undefined,
                    listingTitle: listingData.title,
                    amount: amountFormatted,
                    orderId: orderId,
                  })
                  console.log('✅ Seller email sent')
                }
              } catch (emailError) {
                console.error('❌ Error sending seller email:', emailError)
              }
            }

          } catch (error) {
            console.error('❌ Error processing checkout completion:', error)
          }
        }
        break

      case 'checkout.session.expired':
        {
          const session = event.data.object
          
          try {
            // Update order status to cancelled if it exists
            await supabase
              .from('orders')
              .update({ 
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
              .eq('payment_intent_id', session.payment_intent)

            console.log('⏰ Checkout session expired:', session.id)
          } catch (error) {
            console.error('❌ Error processing checkout expiration:', error)
          }
        }
        break
      case 'payment_intent.succeeded':
        {
          const paymentIntent = event.data.object
          console.log('💰 Payment Intent succeeded:', {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            metadata: paymentIntent.metadata,
            transfer_data: paymentIntent.transfer_data,
            status: paymentIntent.status
          })
          
          // For Connect transfers, we need to handle this differently
          const listingId = paymentIntent.metadata?.listing_id
          const buyerId = paymentIntent.metadata?.buyer_id
          const sellerId = paymentIntent.metadata?.seller_id
          
          if (listingId && buyerId && sellerId) {
            try {
              console.log('🔄 Processing payment intent success for Connect transfer:', {
                paymentIntentId: paymentIntent.id,
                listingId,
                buyerId,
                sellerId
              })

              // First, check if there's an existing order
              const { data: existingOrder, error: checkError } = await supabase
                .from('orders')
                .select('*')
                .eq('listing_id', listingId)
                .eq('buyer_id', buyerId)
                .order('created_at', { ascending: false })
                .limit(1)

              if (checkError) {
                console.error('❌ Error checking existing order:', checkError)
              } else {
                console.log('📋 Existing order found:', existingOrder)
              }

              // Update order status to paid
              const { data: orderUpdate, error: orderError } = await supabase
                .from('orders')
                .update({ 
                  status: 'paid',
                  payment_intent_id: paymentIntent.id,
                  updated_at: new Date().toISOString()
                })
                .eq('listing_id', listingId)
                .eq('buyer_id', buyerId)
                .eq('status', 'pending')
                .select()

              if (orderError) {
                console.error('❌ Order update error:', orderError)
                console.error('❌ Order update details:', {
                  listingId,
                  buyerId,
                  paymentIntentId: paymentIntent.id,
                  error: orderError
                })
                
                // Try updating without the status filter
                console.log('🔄 Trying to update order without status filter...')
                const { data: orderUpdateRetry, error: orderErrorRetry } = await supabase
                  .from('orders')
                  .update({ 
                    status: 'paid',
                    payment_intent_id: paymentIntent.id,
                    updated_at: new Date().toISOString()
                  })
                  .eq('listing_id', listingId)
                  .eq('buyer_id', buyerId)
                  .select()

                if (orderErrorRetry) {
                  console.error('❌ Order update retry failed:', orderErrorRetry)
                } else {
                  console.log('✅ Order updated via retry:', orderUpdateRetry)
                }
              } else {
                console.log('✅ Order updated via payment intent:', orderUpdate)
              }

              // Add a small delay before updating listing
              await new Promise(resolve => setTimeout(resolve, 1000))

              // Mark listing as sold
              const { data: listingUpdate, error: listingError } = await supabase
                .from('listings')
                .update({ 
                  is_sold: true,
                  updated_at: new Date().toISOString()
                })
                .eq('id', listingId)
                .select()

              if (listingError) {
                console.error('❌ Listing update error:', listingError)
                console.error('❌ Listing update details:', {
                  listingId,
                  error: listingError
                })
              } else {
                console.log('✅ Listing marked as sold via payment intent:', listingUpdate)
                console.log('✅ Listing update details:', {
                  listingId,
                  isSold: listingUpdate?.[0]?.is_sold,
                  updatedAt: listingUpdate?.[0]?.updated_at
                })

                // Double-check the listing status
                const { data: verifyListing } = await supabase
                  .from('listings')
                  .select('id, is_sold, updated_at')
                  .eq('id', listingId)
                  .single()

                console.log('🔍 Verified listing status after update:', verifyListing)
              }
            } catch (error) {
              console.error('❌ Error processing payment intent success:', error)
            }
          } else {
            console.log('⚠️ Payment intent missing metadata:', {
              listingId,
              buyerId,
              sellerId,
              allMetadata: paymentIntent.metadata
            })
          }
        }
        break

      case 'payment_intent.payment_failed':
        {
          const paymentIntent = event.data.object
          
          // Update order status to failed
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('payment_intent_id', paymentIntent.id)

          console.log('Payment failed:', paymentIntent.id)
        }
        break

      case 'payment_intent.canceled':
        {
          const paymentIntent = event.data.object
          
          // Update order status to cancelled
          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('payment_intent_id', paymentIntent.id)

          console.log('Payment canceled:', paymentIntent.id)
        }
        break

      case 'account.updated':
        {
          const account = event.data.object
          
          try {
            console.log('🔔 Stripe Connect account updated:', {
              accountId: account.id,
              chargesEnabled: account.charges_enabled,
              payoutsEnabled: account.payouts_enabled,
              detailsSubmitted: account.details_submitted,
              requirements: account.requirements
            })

            // Check if account is fully onboarded
            // Use details_submitted as the primary indicator
            const isOnboarded = account.details_submitted && 
                               (!account.requirements?.currently_due || account.requirements.currently_due.length === 0)
            
            if (isOnboarded) {
              // Find user with this Stripe account ID and mark as verified
              const { data: userUpdate, error: userError } = await supabase
                .from('users')
                .update({ 
                  seller_verified: true,
                  seller_verification_date: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_account_id', account.id)
                .select()

              if (userError) {
                console.error('❌ Error updating user verification status:', userError)
              } else {
                console.log('✅ User marked as seller verified:', userUpdate)
              }
            } else {
              console.log('ℹ️ Account not yet fully onboarded:', {
                detailsSubmitted: account.details_submitted,
                currentlyDue: account.requirements?.currently_due
              })
            }
          } catch (error) {
            console.error('❌ Error processing account update:', error)
            // Don't throw the error, just log it to prevent webhook failures
          }
        }
        break

      default:
        console.log(`📝 Unhandled event type: ${event.type}`)
        console.log('📝 Event received but not processed:', {
          type: event.type,
          id: event.id,
          account: event.account,
          objectType: event.data.object.object
        })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    // Return 200 to prevent Stripe from retrying failed webhooks
    // This prevents webhook delivery failures
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 200 }
    )
  }
} 