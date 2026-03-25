import Stripe from 'stripe'
import { createAdminSupabase } from '@/lib/supabase-server'
import { sendSellerOrderEmail } from '@/lib/email/send'

export async function processStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  const supabase = createAdminSupabase()

  switch (event.type) {
    case 'checkout.session.completed':
      {
        const session = event.data.object as Stripe.Checkout.Session
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
          paymentStatus: session.payment_status,
        })

        if (!listingId || !buyerId || !sellerId) {
          console.error('Missing metadata in checkout session:', session.id)
          break
        }

        if (session.payment_status !== 'paid') {
          console.log('⏳ Payment not yet completed, waiting for payment_intent.succeeded event')
          break
        }

        try {
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

          const { data: buyerData, error: buyerDataError } = await supabase
            .from('users')
            .select('id, full_name, email, phone')
            .eq('id', buyerId)
            .single()

          if (buyerDataError) {
            console.error('❌ Error fetching buyer data:', buyerDataError)
          }

          const { data: orderUpdate, error: orderError } = await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_intent_id: session.payment_intent as string | null,
              updated_at: new Date().toISOString(),
            })
            .eq('listing_id', listingId)
            .eq('buyer_id', buyerId)
            .eq('status', 'pending')
            .select()

          if (orderError) {
            console.error('❌ Order update error:', orderError)
          } else {
            console.log('✅ Order updated:', orderUpdate)
          }

          const { data: listingUpdate, error: listingError } = await supabase
            .from('listings')
            .update({
              is_sold: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', listingId)
            .select()

          if (listingError) {
            console.error('❌ Listing update error:', listingError)
          } else {
            console.log('✅ Listing marked as sold:', listingUpdate)

            try {
              const { data: sellerNotifId, error: sellerNotifError } = await supabase.rpc('create_notification', {
                p_user_id: sellerId,
                p_title: 'Listing Sold!',
                p_message: `Your listing "${listingData.title}" has been sold for $${(session.amount_total || 0) / 100}.`,
                p_type: 'success',
                p_related_id: listingId,
                p_related_type: 'listing',
              })

              if (sellerNotifError) {
                console.error('❌ Seller notification RPC error:', sellerNotifError)
              } else {
                console.log('✅ Seller notification created with ID:', sellerNotifId)
              }
            } catch (notifError) {
              console.error('❌ Error creating seller notification:', notifError)
            }

            try {
              const { data: buyerNotifId, error: buyerNotifError } = await supabase.rpc('create_notification', {
                p_user_id: buyerId,
                p_title: 'Purchase Successful!',
                p_message: `You have successfully purchased "${listingData.title}" for $${(session.amount_total || 0) / 100}.`,
                p_type: 'success',
                p_related_id: listingId,
                p_related_type: 'listing',
              })

              if (buyerNotifError) {
                console.error('❌ Buyer notification RPC error:', buyerNotifError)
              } else {
                console.log('✅ Buyer notification created with ID:', buyerNotifId)
              }
            } catch (notifError) {
              console.error('❌ Error creating buyer notification:', notifError)
            }

            try {
              const seller = listingData.users as { email?: string; full_name?: string } | null
              if (seller?.email && session.amount_total) {
                await sendSellerOrderEmail({
                  to: seller.email,
                  sellerName: seller.full_name || undefined,
                  listingTitle: listingData.title,
                  amount: `$${(session.amount_total / 100).toLocaleString()}`,
                  orderId: (session.payment_intent as string) || 'order',
                  buyerName: buyerData?.full_name || undefined,
                  buyerEmail: buyerData?.email,
                  buyerPhone: buyerData?.phone || undefined,
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
        const session = event.data.object as Stripe.Checkout.Session

        try {
          await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('payment_intent_id', session.payment_intent as string | null)

          console.log('⏰ Checkout session expired:', session.id)
        } catch (error) {
          console.error('❌ Error processing checkout expiration:', error)
        }
      }
      break

    case 'payment_intent.succeeded':
      {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const listingId = paymentIntent.metadata?.listing_id
        const buyerId = paymentIntent.metadata?.buyer_id
        const sellerId = paymentIntent.metadata?.seller_id

        console.log('💰 Payment Intent succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata,
          transfer_data: paymentIntent.transfer_data,
          status: paymentIntent.status,
        })

        if (listingId && buyerId && sellerId) {
          try {
            const { data: orderUpdate, error: orderError } = await supabase
              .from('orders')
              .update({
                status: 'paid',
                payment_intent_id: paymentIntent.id,
                updated_at: new Date().toISOString(),
              })
              .eq('listing_id', listingId)
              .eq('buyer_id', buyerId)
              .eq('status', 'pending')
              .select()

            if (orderError) {
              console.error('❌ Order update error:', orderError)
            } else {
              console.log('✅ Order updated via payment intent:', orderUpdate)
            }

            const { data: listingUpdate, error: listingError } = await supabase
              .from('listings')
              .update({
                is_sold: true,
                updated_at: new Date().toISOString(),
              })
              .eq('id', listingId)
              .select()

            if (listingError) {
              console.error('❌ Listing update error:', listingError)
            } else {
              console.log('✅ Listing marked as sold via payment intent:', listingUpdate)
            }
          } catch (error) {
            console.error('❌ Error processing payment intent success:', error)
          }
        } else {
          console.log('⚠️ Payment intent missing metadata:', {
            listingId,
            buyerId,
            sellerId,
            allMetadata: paymentIntent.metadata,
          })
        }
      }
      break

    case 'payment_intent.payment_failed':
      {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await supabase.from('orders').update({ status: 'failed' }).eq('payment_intent_id', paymentIntent.id)
        console.log('Payment failed:', paymentIntent.id)
      }
      break

    case 'payment_intent.canceled':
      {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await supabase.from('orders').update({ status: 'cancelled' }).eq('payment_intent_id', paymentIntent.id)
        console.log('Payment canceled:', paymentIntent.id)
      }
      break

    case 'account.updated':
      {
        const account = event.data.object as Stripe.Account

        try {
          const isOnboarded =
            account.details_submitted &&
            (!account.requirements?.currently_due || account.requirements.currently_due.length === 0)

          if (isOnboarded) {
            const { data: userUpdate, error: userError } = await supabase
              .from('users')
              .update({
                seller_verified: true,
                seller_verification_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
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
      console.log(`📝 Unhandled event type: ${event.type}`)
  }
}
