import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: { amount?: number; currency?: string; receipt?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const amount = body.amount ?? 90000
  const currency = body.currency ?? 'INR'
  const receipt = body.receipt ?? `rcpt_${Date.now()}`

  if (amount < 100) {
    return NextResponse.json({ error: 'Amount must be at least 100 paise' }, { status: 400 })
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  try {
    const order = await razorpay.orders.create({ amount, currency, receipt })
    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[razorpay/create-order]', msg)
    return NextResponse.json({ error: `Order creation failed: ${msg}` }, { status: 500 })
  }
}
