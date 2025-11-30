import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiBase: 'https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api',
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
  maps: {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    nominatim: {
      geocodeUrl: 'https://nominatim.openstreetmap.org/search',
      reverseUrl: 'https://nominatim.openstreetmap.org/reverse'
    }
  },
  reservations: {
    base: '/reservations'
  },
  payments: {
    base: '/reservationPayments'
  },
  featureFlags: {
    useMockApi: false,
    logHttp: false, // Deshabilitado en producción para mejor performance
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
  spots: {
    base: '/spots',
    endpoints: {
      list: (parkingId: string) => `/parkings/${parkingId}/spots`,
      create: (parkingId: string) => `/parkings/${parkingId}/spots`,
      createBulk: (parkingId: string) => `/parkings/${parkingId}/spots/bulk`,
      update: (parkingId: string, spotId: string) => `/parkings/${parkingId}/spots/${spotId}`,
      delete: (parkingId: string, spotId: string) => `/parkings/${parkingId}/spots/${spotId}`
    }
  },
  stripePublicKey: 'pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE',
  // Configuración de Firebase Cloud Messaging
  // IMPORTANTE: Reemplazar con tus credenciales reales de Firebase
  firebase: {
    apiKey: 'AIzaSyAuG2UFUsYthFQSf7cHaHowXV7E_3j7TNM',
    authDomain: 'spotfinder-notification.firebaseapp.com',
    projectId: 'spotfinder-notification',
    storageBucket: 'spotfinder-notification.firebasestorage.app',
    messagingSenderId: '1020617092469',
    appId: '1:1020617092469:web:91d0bcf8b4a18f091bb73c',
    vapidKey: 'G-NWKEM9YZ6K'
  },
  // IoT configuration (production ready) - apunta al backend de Azure
  iot: {
    sensorApiUrl: 'https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api/iot',
    endpoints: {
      devices: '/devices',
      register: '/devices',
      telemetry: '/telemetry',
      bind: (serial: string) => `/devices/${serial}/bind`,
      unbind: (serial: string) => `/devices/${serial}/unbind`
    },
    simulation: {
      enabled: false, // Deshabilitado en producción
      mockDataInterval: 300000 // 5 minutos si se habilita
    }
  }
};

