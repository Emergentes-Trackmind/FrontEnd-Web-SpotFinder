export const environment = {
  production: true,
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
  maps: {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    nominatim: {
      geocodeUrl: 'https://nominatim.openstreetmap.org/search',
      reverseUrl: 'https://nominatim.openstreetmap.org/reverse'
    }
  },
  featureFlags: {
    useMockApi: true,
    logHttp: true,
    enableOfflineMode: false
  }
};
