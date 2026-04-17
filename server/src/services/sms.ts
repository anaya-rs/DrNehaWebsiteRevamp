import twilio from 'twilio'

const SMS_ENABLED = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
)

let client: ReturnType<typeof twilio> | null = null

if (SMS_ENABLED) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  console.log('[SMS] Twilio SMS service enabled')
} else {
  console.log('[SMS] Twilio SMS service disabled (missing env vars)')
}

export async function sendSms(to: string, body: string): Promise<void> {
  if (!SMS_ENABLED || !client) {
    console.warn('[SMS] SMS not enabled — skipping message to', to)
    return
  }

  try {
    // Normalize phone number: add + if missing
    const normalized = to.startsWith('+') ? to : `+${to}`
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalized,
    })
    console.log(`[SMS] Sent to ${normalized}`)
  } catch (err) {
    console.error('[SMS] Failed to send SMS:', err)
  }
}

export { SMS_ENABLED }
