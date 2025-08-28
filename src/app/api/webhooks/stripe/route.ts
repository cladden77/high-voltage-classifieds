import { NextRequest, NextResponse } from 'next/server'
import { StripePayments } from '@/lib/payments'
import { StripeConnect } from '@/lib/stripe'
import { createAdminSupabase } from '@/lib/supabase-server'
import { sendSellerOrderEmail } from '@/lib/email/send'

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
    const event = await StripeConnect.validateWebhook(body, signature)
    const supabase = createAdminSupabase()

    console.log('✅ Webhook validated:', {
      eventType: event.type,
      eventId: event.id,
      created: event.created
    })

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object
          const listingId = session.metadata?.listing_id
          const buyerId = session.metadata?.buyer_id
          const sellerId = session.metadata?.seller_id
          
          if (!listingId || !buyerId || !sellerId) {
            console.error('Missing metadata in checkout session:', session.id)
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

            // Update payment status to completed
            const { data: paymentUpdate, error: paymentError } = await supabase
              .from('payments')
              .update({ 
                status: 'completed',
                updated_at: new Date().toISOString()
              })
              .eq('payment_intent_id', session.payment_intent)
              .select()

            if (paymentError) {
              console.error('❌ Payment update error:', paymentError)
            } else {
              console.log('✅ Payment updated:', paymentUpdate)
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
            } else {
              console.log('✅ Listing marked as sold:', listingUpdate)
              
              // Create notification for seller
              try {
                await supabase.rpc('create_notification', {
                  p_user_id: sellerId,
                  p_title: 'Listing Sold!',
                  p_message: `Your listing "${listingData.title}" has been sold for $${(session.amount_total || 0) / 100}.`,
                  p_type: 'success',
                  p_related_id: listingId,
                  p_related_type: 'listing'
                })
                console.log('✅ Seller notification created')
              } catch (notifError) {
                console.error('❌ Error creating seller notification:', notifError)
              }
              
              // Create notification for buyer
              try {
                await supabase.rpc('create_notification', {
                  p_user_id: buyerId,
                  p_title: 'Purchase Successful!',
                  p_message: `You have successfully purchased "${listingData.title}" for $${(session.amount_total || 0) / 100}.`,
                  p_type: 'success',
                  p_related_id: listingId,
                  p_related_type: 'listing'
                })
                console.log('✅ Buyer notification created')
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
            // Update payment status to cancelled if it exists
            await supabase
              .from('payments')
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
          
          // Update payment status to completed
          await supabase
            .from('payments')
            .update({ status: 'completed' })
            .eq('payment_intent_id', paymentIntent.id)

          // Mark listing as sold
          const paymentRecord = await supabase
            .from('payments')
            .select('listing_id')
            .eq('payment_intent_id', paymentIntent.id)
            .single()

          if (paymentRecord.data) {
            await supabase
              .from('listings')
              .update({ is_sold: true })
              .eq('id', paymentRecord.data.listing_id)
          }

          console.log('Payment succeeded:', paymentIntent.id)
        }
        break

      case 'payment_intent.payment_failed':
        {
          const paymentIntent = event.data.object
          
          // Update payment status to failed
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('payment_intent_id', paymentIntent.id)

          console.log('Payment failed:', paymentIntent.id)
        }
        break

      case 'payment_intent.canceled':
        {
          const paymentIntent = event.data.object
          
          // Update payment status to canceled
          await supabase
            .from('payments')
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
              requirements: account.requirements
            })

            // Check if account is fully onboarded
            const isOnboarded = account.charges_enabled && account.payouts_enabled
            
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
            }
          } catch (error) {
            console.error('❌ Error processing account update:', error)
          }
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
        // Log helpful information for debugging
        if (event.type.startsWith('account.')) {
          console.log('💡 Connect account event received:', {
            type: event.type,
            accountId: event.account,
            created: event.created
          })
        }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
} 