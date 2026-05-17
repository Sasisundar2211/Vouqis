import {NextRequest, NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {validateEvent, WebhookVerificationError} from '@polar-sh/sdk/webhooks'

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

  if (
    event.type === 'subscription.active' ||
    event.type === 'subscription.created' ||
    event.type === 'subscription.updated'
  ) {
    const sub = event.data
    await supabaseAdmin.from('subscriptions').upsert(
      {
        polar_subscription_id: sub.id,
        polar_customer_id: sub.customerId,
        customer_email: sub.customer?.email ?? null,
        status: sub.status,
        product_id: sub.productId,
        current_period_end: sub.currentPeriodEnd,
      },
      {onConflict: 'polar_subscription_id'},
    )
  }

  if (event.type === 'subscription.revoked' || event.type === 'subscription.canceled') {
    const sub = event.data
    await supabaseAdmin
      .from('subscriptions')
      .update({status: sub.status})
      .eq('polar_subscription_id', sub.id)
  }

  return NextResponse.json({received: true})
}
