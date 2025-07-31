// Simple toast implementation for the Stripe Connect integration

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function toast({ title, description, variant = 'default' }: ToastOptions) {
  // Simple browser alert for now - can be enhanced with a proper toast library later
  const message = title && description 
    ? `${title}: ${description}` 
    : title || description || 'Notification'
  
  if (variant === 'destructive') {
    alert(`❌ ${message}`)
  } else {
    alert(`✅ ${message}`)
  }
  
  // Log to console as well for debugging
  console.log(`Toast [${variant}]:`, { title, description })
}