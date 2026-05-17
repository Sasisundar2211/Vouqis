import {NextRequest, NextResponse} from 'next/server'
import {Polar} from '@polar-sh/sdk'

const polar = new Polar({accessToken: process.env.POLAR_ACCESS_TOKEN!})

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vouqis.vercel.app'
  const productId = process.env.POLAR_PRODUCT_ID!

  const checkout = await polar.checkouts.create({
    products: [productId],
    customerEmail: email,
    successUrl: `${appUrl}/pro/success`,
  })

  return NextResponse.json({url: checkout.url})
}
