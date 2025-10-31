export const environment = {
  production: false,
  apiBase: 'http://localhost:3001/api',
  endpoints: {
    parkings: '/parkings',
    analytics: '/analytics',
    locations: '/locations',
    pricing: '/pricing',
    features: '/features',
    uploads: '/uploads'
  },
  auth: {
    base: '/auth',
    endpoints: {
      login: '/login',
      register: '/register',
      refresh: '/refresh',
      forgot: '/forgot-password',
      reset: '/reset-password'
    }
  },
  profile: {
    base: '/profile'
  },
  account: {
    base: '/account',
    endpoints: {
      changePassword: '/change-password',
      sessions: '/sessions',
      closeSession: (id: string) => `/sessions/${id}`,
      downloadData: '/download',
      delete: '/delete',
      toggle2fa: '/2fa/toggle'
    }
  },
  reservations: {
    base: '/reservations'
  },
  payments: {
    base: '/reservationPayments'
  },
  featureFlags: {
    useMockApi: true,
    logHttp: true,
    enableOfflineMode: false
  },
  analytics: {
    base: '/analytics',
    endpoints: {
      totals: '/totals',
      revenueByMonth: '/revenue',
      occupancyByHour: '/occupancy',
      recentActivity: '/activity',
      topParkings: '/top-parkings'
    }
  },
  stripePublicKey: 'pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE'
};
