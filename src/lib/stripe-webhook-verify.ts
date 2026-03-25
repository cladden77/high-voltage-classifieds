import Stripe from 'stripe'
import { StripeConnect } from '@/lib/stripe'

export async function validateWebhookFromSecrets(
  payload: string,
  signature: string,
  secrets: Array<string | undefined>
): Promise<{ event: Stripe.Event; usedSecretName: string }> {
  const knownSecrets = secrets
    .map((value, idx) => ({ value: value?.trim(), name: `secret_${idx + 1}` }))
    .filter((item): item is { value: string; name: string } => !!item.value)

  if (!knownSecrets.length) {
    throw new Error('No webhook secrets configured')
  }

  for (const item of knownSecrets) {
    try {
      const event = await StripeConnect.validateWebhookWithSecret(payload, signature, item.value)
      return { event, usedSecretName: item.name }
    } catch {
      // Try next secret
    }
  }

  throw new Error('Invalid webhook signature')
}
