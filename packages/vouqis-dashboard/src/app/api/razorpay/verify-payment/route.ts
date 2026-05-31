import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: {
    razorpay_payment_id?: string
    razorpay_order_id?: string
    razorpay_signature?: string
    email?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, email } = body

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  // Generate API key (64 hex chars = 32 bytes entropy)
  const apiKey = `vq_${crypto.randomBytes(32).toString('hex')}`

  // Provision subscription in Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    )
    const { error: dbError } = await supabase.from('subscriptions').insert({
      api_key: apiKey,
      status: 'active',
      email: email ?? null,
      plan: 'pro',
      report_history_days: 90,
      polar_customer_id: null,
      polar_subscription_id: null,
    })
    if (dbError) {
      console.error('[razorpay/verify-payment] db insert failed', dbError.message)
    }
  } catch (err) {
    console.error('[razorpay/verify-payment] db insert failed', err instanceof Error ? err.message : err)
    // Non-fatal: still send the email so the user gets their key
  }

  // Send welcome email with API key
  if (email) {
    try {
      await sendWelcomeEmail(email, apiKey, {
        number: `RZP-${razorpay_payment_id}`,
        amountPaid: 90000,
        currency: 'INR',
        date: Math.floor(Date.now() / 1000),
        pdfUrl: null,
        hostedUrl: null,
      })
    } catch (err) {
      console.error('[razorpay/verify-payment] email send failed', err instanceof Error ? err.message : err)
    }
  }

  return NextResponse.json({ success: true, payment_id: razorpay_payment_id })
}
