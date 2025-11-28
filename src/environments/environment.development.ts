import { Environment } from './environment.interface';

export const environment: Environment = {
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
    useMockApi: false, // Usar datos reales del servidor
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
  stripePublicKey: 'pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE',
  firebase: {
    apiKey: 'AIzaSyAuG2UFUsYthFQSf7cHaHowXV7E_3j7TNM',
    authDomain: 'spotfinder-notification.firebaseapp.com',
    projectId: 'spotfinder-notification',
    storageBucket: 'spotfinder-notification.firebasestorage.app',
    messagingSenderId: '1020617092469',
    appId: '1:1020617092469:web:91d0bcf8b4a18f091bb73c',
    vapidKey: 'G-NWKEM9YZ6K'
  },
  // IoT configuration (opcional en desarrollo)
  iot: {
    // Apunta al backend local (ruta compatible con el controlador de IoT: /api/iot)
    sensorApiUrl: 'http://localhost:8080/api/iot',
    endpoints: {
      devices: '/devices',
      status: '/status',
      simulation: '/simulation',
      bind: '/bind'
    },
    simulation: {
      enabled: false, // Deshabilitado por defecto en desarrollo
      mockDataInterval: 60000
    }
  }
};

