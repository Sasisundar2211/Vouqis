import {Resend} from 'resend'

interface InvoiceDetails {
  number: string
  amountPaid: number
  currency: string
  date: number
  pdfUrl: string | null
  hostedUrl: string | null
}

export async function sendWelcomeEmail(
  email: string,
  rawApiKey: string,
  invoice?: InvoiceDetails,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const invoiceSection = invoice
    ? `
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb">
        <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#111827;text-transform:uppercase;letter-spacing:0.05em">Receipt</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:6px 0;color:#6b7280">Invoice</td>
            <td style="padding:6px 0;text-align:right;color:#111827;font-weight:500">${invoice.number}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">Date</td>
            <td style="padding:6px 0;text-align:right;color:#111827">${new Date(invoice.date * 1000).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">Plan</td>
            <td style="padding:6px 0;text-align:right;color:#111827">Vouqis Pro — Monthly</td>
          </tr>
          <tr style="border-top:1px solid #e5e7eb">
            <td style="padding:12px 0 6px;color:#111827;font-weight:600">Amount paid</td>
            <td style="padding:12px 0 6px;text-align:right;color:#111827;font-weight:600">${(invoice.amountPaid / 100).toLocaleString('en-US', {style:'currency',currency:invoice.currency.toUpperCase()})}</td>
          </tr>
        </table>
        ${invoice.pdfUrl ? `<p style="margin:16px 0 0"><a href="${invoice.pdfUrl}" style="color:#2563eb;font-size:13px">Download invoice PDF →</a></p>` : ''}
        ${invoice.hostedUrl ? `<p style="margin:8px 0 0"><a href="${invoice.hostedUrl}" style="color:#2563eb;font-size:13px">View invoice online →</a></p>` : ''}
      </div>
    `
    : ''

  await resend.emails.send({
    from: 'Vouqis <onboarding@resend.dev>',
    to: email,
    subject: 'Your Vouqis Pro API key',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">

          <!-- Header -->
          <div style="background:#0d0d0d;padding:24px 32px">
            <p style="margin:0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280">Vouqis</p>
            <h1 style="margin:4px 0 0;font-size:22px;font-weight:700;color:#ffffff">Welcome to Pro</h1>
          </div>

          <!-- Body -->
          <div style="padding:32px">
            <p style="margin:0 0 24px;font-size:15px;color:#374151">
              Your API key gives you <strong>90-day report history</strong> on every audit run.
            </p>

            <!-- API Key -->
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#111827">Your API key</p>
            <pre style="margin:0 0 20px;padding:14px 16px;background:#0d0d0d;color:#4ade80;border-radius:6px;font-size:13px;overflow-x:auto;word-break:break-all;white-space:pre-wrap">${rawApiKey}</pre>

            <!-- Usage -->
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#111827">Add it to your environment</p>
            <pre style="margin:0 0 20px;padding:14px 16px;background:#0d0d0d;color:#e2e8f0;border-radius:6px;font-size:13px;overflow-x:auto;white-space:pre-wrap">export VOUQIS_API_KEY="${rawApiKey}"</pre>

            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#111827">Then run</p>
            <pre style="margin:0 0 24px;padding:14px 16px;background:#0d0d0d;color:#e2e8f0;border-radius:6px;font-size:13px">vouqis audit https://your-mcp-server-url</pre>

            <p style="margin:0;font-size:13px;color:#6b7280">
              Keep this key secret. If it is exposed, contact <a href="mailto:support@vouqis.tech" style="color:#2563eb">support@vouqis.tech</a> for a replacement.
            </p>

            ${invoiceSection}
          </div>

          <!-- Footer -->
          <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:13px;color:#9ca3af">— Sasi at Vouqis · <a href="https://www.vouqis.tech" style="color:#6b7280">vouqis.tech</a></p>
          </div>

        </div>
      </body>
      </html>
    `,
  })
}
