import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY')
}

if (!process.env.RESEND_FROM) {
  console.warn('⚠️ Missing RESEND_FROM environment variable, using default')
}

if (!process.env.APP_URL) {
  console.warn('⚠️ Missing APP_URL environment variable, using localhost')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
export const FROM = process.env.RESEND_FROM || 'notifications@example.com'
export const APP_URL = process.env.APP_URL || 'http://localhost:3000'



