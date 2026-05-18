import crypto from 'crypto'
import {NextRequest, NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {validateEvent, WebhookVerificationError} from '@polar-sh/sdk/webhooks'
import {sendWelcomeEmail} from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  let event: ReturnType<typeof validateEvent>
  try {
    event = validateEvent(body, headers, process.env.POLAR_WEBHOOK_SECRET!)
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return NextResponse.json({error: 'Invalid signature'}, {status: 403})
    }
    return NextResponse.json({error: 'Webhook error'}, {status: 400})
  }

  if (event.type === 'subscription.created') {
    const sub = event.data
    console.log('[polar/webhook] received', {type: event.type, id: sub.id})

    // Two-step idempotency: reuse existing api_key on Polar retries
    const {data: existing} = await supabaseAdmin
      .from('subscriptions')
      .select('api_key')
      .eq('polar_subscription_id', sub.id)
      .single()

    const rawKey = existing?.api_key ?? crypto.randomBytes(32).toString('hex')

    const {error} = await supabaseAdmin.from('subscriptions').upsert(
      {
        polar_subscription_id: sub.id,
        polar_customer_id: sub.customerId,
        email: sub.customer?.email ?? null,
        status: sub.status,
        plan: 'pro',
        api_key: rawKey,
      },
      {onConflict: 'polar_subscription_id'},
    )

    if (error) {
      console.error('[polar/webhook] subscription save failed', {error: error.message, polarId: sub.id})
      return NextResponse.json({error: error.message}, {status: 500})
    }

    console.log('[polar/webhook] subscription saved', {polarId: sub.id, email: sub.customer?.email, status: 'success'})

    if (sub.customer?.email) {
      try {
        await sendWelcomeEmail(sub.customer.email, rawKey)
        console.log('[polar/webhook] welcome email sent', {email: sub.customer.email})
      } catch (emailError) {
        // Non-fatal: key is in the DB — manual support can recover if email fails
        console.error('[polar/webhook] welcome email failed', {
          error: emailError instanceof Error ? emailError.message : String(emailError),
          email: sub.customer.email,
        })
      }
    }
  }

  if (event.type === 'subscription.updated') {
    const sub = event.data
    console.log('[polar/webhook] received', {type: event.type, id: sub.id})

    const {error} = await supabaseAdmin
      .from('subscriptions')
      .update({status: sub.status})
      .eq('polar_subscription_id', sub.id)

    if (error) {
      console.error('[polar/webhook] subscription save failed', {error: error.message, polarId: sub.id})
      return NextResponse.json({error: error.message}, {status: 500})
    }

    console.log('[polar/webhook] subscription saved', {polarId: sub.id, status: 'success'})
  }

  if (event.type === 'subscription.canceled') {
    const sub = event.data
    console.log('[polar/webhook] received', {type: event.type, id: sub.id})

    const {error} = await supabaseAdmin
      .from('subscriptions')
      .update({status: 'canceled', plan: 'free'})
      .eq('polar_subscription_id', sub.id)

    if (error) {
      console.error('[polar/webhook] subscription save failed', {error: error.message, polarId: sub.id})
      return NextResponse.json({error: error.message}, {status: 500})
    }

    console.log('[polar/webhook] subscription saved', {polarId: sub.id, status: 'success'})
  }

  return NextResponse.json({received: true})
}
