import {NextRequest, NextResponse} from 'next/server'
import {Polar} from '@polar-sh/sdk'

export async function POST(request: NextRequest) {
  const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: (process.env.POLAR_SERVER as 'production' | 'sandbox') ?? 'production',
  })
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vouqis.vercel.app'
  const productId = process.env.POLAR_PRODUCT_ID!

  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: email,
      successUrl: `${appUrl}/pro/success`,
      metadata: {email},
    })
    return Response.json({url: checkout.url})
  } catch (err) {
    console.error('[checkout] polar.checkouts.create failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return Response.json(
      {error: 'Checkout unavailable. Please try again in a few minutes.'},
      {status: 503},
    )
  }
}
