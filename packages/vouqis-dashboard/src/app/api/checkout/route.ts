import {NextRequest, NextResponse} from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let email: string | undefined
  try {
    const body = await request.json()
    email = body.email
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400})
  }

  if (!email) {
    return NextResponse.json({error: 'Missing email'}, {status: 400})
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{price: process.env.STRIPE_PRICE_ID!, quantity: 1}],
      success_url: `${appUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pro`,
      metadata: {email},
    })

    return Response.json({url: session.url})
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[checkout] failed', {error: msg})
    return Response.json(
      {error: msg},
      {status: 503},
    )
  }
}
