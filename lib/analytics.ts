export function gtagEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params)
  }
}

export function fbqEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, params)
  }
}

export function trackWhatsAppClick(professionalName: string, category: string) {
  gtagEvent('whatsapp_click', {
    event_category: 'engagement',
    event_label: `${professionalName} — ${category}`,
    professional_name: professionalName,
    category,
  })
  fbqEvent('Contact', {
    content_name: professionalName,
    content_category: category,
  })
}

export function trackProfileView(professionalName: string, category: string) {
  gtagEvent('profile_view', {
    event_category: 'engagement',
    event_label: `${professionalName} — ${category}`,
    professional_name: professionalName,
    category,
  })
  fbqEvent('ViewContent', {
    content_name: professionalName,
    content_category: category,
    content_type: 'professional_profile',
  })
}

export function trackClientSignUp() {
  gtagEvent('sign_up', {
    event_category: 'conversion',
    event_label: 'cliente',
    method: 'email',
  })
  fbqEvent('CompleteRegistration', {
    content_name: 'cliente',
  })
}

export function trackProfessionalSignUp(category: string) {
  gtagEvent('sign_up', {
    event_category: 'conversion',
    event_label: 'profissional',
    method: 'email',
    category,
  })
  fbqEvent('Lead', {
    content_name: 'profissional',
    content_category: category,
  })
}

export function trackProfessionalCTA() {
  gtagEvent('cta_click', {
    event_category: 'engagement',
    event_label: 'seja_profissional',
  })
  fbqEvent('InitiateCheckout', {
    content_name: 'seja_profissional',
  })
}

export function trackCategoryView(category: string) {
  gtagEvent('category_view', {
    event_category: 'engagement',
    event_label: category,
    category,
  })
  fbqEvent('Search', {
    search_string: category,
  })
}

export function trackSubscriptionStart(plan: string, value: number) {
  gtagEvent('begin_checkout', {
    event_category: 'conversion',
    event_label: plan,
    value,
    currency: 'BRL',
  })
  fbqEvent('InitiateCheckout', {
    content_name: plan,
    value,
    currency: 'BRL',
  })
}

export function trackSubscriptionComplete(plan: string, value: number) {
  gtagEvent('purchase', {
    event_category: 'conversion',
    event_label: plan,
    value,
    currency: 'BRL',
    transaction_id: `sub_${Date.now()}`,
  })
  fbqEvent('Purchase', {
    content_name: plan,
    value,
    currency: 'BRL',
  })
}
