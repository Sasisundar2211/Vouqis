import {Resend} from 'resend'

export async function sendWelcomeEmail(email: string, rawApiKey: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Vouqis <onboarding@resend.dev>',
    to: email,
    subject: 'Your Vouqis Pro API key',
    html: `
      <h2>Welcome to Vouqis Pro</h2>
      <p>Your API key gives you 90-day report history on every audit run.</p>
      <p><strong>Your API key:</strong></p>
      <pre style="background:#1a1a1a;color:#4ade80;padding:12px;border-radius:6px">${rawApiKey}</pre>
      <p>Add it to your environment:</p>
      <pre style="background:#1a1a1a;color:#e2e8f0;padding:12px;border-radius:6px">export VOUQIS_API_KEY="${rawApiKey}"</pre>
      <p>Then run:</p>
      <pre style="background:#1a1a1a;color:#e2e8f0;padding:12px;border-radius:6px">vouqis audit https://your-mcp-server-url</pre>
      <p>Keep this key secret. If it is exposed, contact support for a replacement.</p>
      <p>— Sasi at Vouqis</p>
    `,
  })
}
