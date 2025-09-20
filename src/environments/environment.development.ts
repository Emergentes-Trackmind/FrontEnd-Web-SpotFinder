export const environment = {
  production: false,
  apiBase: 'http://localhost:3001/api',
  endpoints: {
    parkingProfiles: '/parkingProfiles',
    analytics: '/analytics',
    locations: '/locations',
    pricing: '/pricing',
    features: '/features',
    uploads: '/uploads'
  },
  auth: {
    base: 'http://localhost:3001/api/auth',
    endpoints: {
      login: '/login',
      register: '/register',
      refresh: '/refresh',
      forgot: '/forgot-password',
      reset: '/reset-password'
    }
  },
  profile: {
    base: 'http://localhost:3001/api/profile'
  },
  account: {
    base: 'http://localhost:3001/api/account',
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
    base: 'http://localhost:3001/api/reservations'
  },
  payments: {
    base: 'http://localhost:3001/api/reservationPayments'
  },
  featureFlags: {
    useMockApi: true,
    logHttp: true,
    enableOfflineMode: false
  },
  analytics: {
    base: 'http://localhost:3001/api/analytics',
    endpoints: {
      totals: '/totals',
      revenueByMonth: '/revenue',
      occupancyByHour: '/occupancy',
      recentActivity: '/activity',
      topParkings: '/top-parkings'
    }
  }
};
