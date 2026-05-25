import crypto from 'crypto'
import {NextRequest, NextResponse} from 'next/server'
import Stripe from 'stripe'
import {createClient} from '@supabase/supabase-js'
import {sendWelcomeEmail} from '@/lib/email'

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )

  const body = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({error: 'Invalid signature'}, {status: 403})
  }

  if (event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const email = customer.email ?? null

    console.log('[stripe/webhook] subscription.created', {id: sub.id, email})

    const {data: existing} = await supabaseAdmin
      .from('subscriptions')
      .select('api_key')
      .eq('stripe_subscription_id', sub.id)
      .single()

    const rawKey = existing?.api_key ?? crypto.randomBytes(32).toString('hex')

    const {error} = await supabaseAdmin.from('subscriptions').upsert(
      {
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId,
        email,
        status: sub.status,
        plan: 'pro',
        api_key: rawKey,
      },
      {onConflict: 'stripe_subscription_id'},
    )

    if (error) {
      console.error('[stripe/webhook] subscription save failed', {error: error.message, stripeId: sub.id})
      return NextResponse.json({error: error.message}, {status: 500})
    }

    console.log('[stripe/webhook] subscription saved', {stripeId: sub.id, email, status: 'success'})

    if (email) {
      try {
        await sendWelcomeEmail(email, rawKey)
        console.log('[stripe/webhook] welcome email sent', {email})
      } catch (emailError) {
        console.error('[stripe/webhook] welcome email failed', {
          error: emailError instanceof Error ? emailError.message : String(emailError),
          email,
        })
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    console.log('[stripe/webhook] subscription.updated', {id: sub.id, status: sub.status})

    const {error} = await supabaseAdmin
      .from('subscriptions')
      .update({status: sub.status})
      .eq('stripe_subscription_id', sub.id)

    if (error) {
      console.error('[stripe/webhook] update failed', {error: error.message, stripeId: sub.id})
      return NextResponse.json({error: error.message}, {status: 500})
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    console.log('[stripe/webhook] subscription.deleted', {id: sub.id})

    const {error} = await supabaseAdmin
      .from('subscriptions')
      .update({status: 'canceled', plan: 'free'})
      .eq('stripe_subscription_id', sub.id)

    if (error) {
      console.error('[stripe/webhook] cancel failed', {error: error.message, stripeId: sub.id})
      return NextResponse.json({error: error.message}, {status: 500})
    }
  }

  return NextResponse.json({received: true})
}
