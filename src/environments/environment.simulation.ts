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
    useMockApi: false, // Usamos la API externa real para simulación
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
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_PROJECT_ID.firebaseapp.com',
    projectId: 'TU_PROJECT_ID',
    storageBucket: 'TU_PROJECT_ID.appspot.com',
    messagingSenderId: 'TU_SENDER_ID',
    appId: 'TU_APP_ID',
    vapidKey: 'TU_WEB_PUSH_CERTIFICATE_KEY'
  },
  // Configuración específica para edge server IoT en Azure
  iot: {
    sensorApiUrl: 'https://tu-edge-server.azurewebsites.net/api/sensors', // Tu edge server en Azure
    endpoints: {
      devices: '/devices',
      status: '/status',
      simulation: '/simulation',
      bind: '/bind'
    },
    simulation: {
      enabled: false, // Deshabilitado ya que usamos edge server real
      mockDataInterval: 30000 // Intervalo para polling si es necesario
    }
  }
};
