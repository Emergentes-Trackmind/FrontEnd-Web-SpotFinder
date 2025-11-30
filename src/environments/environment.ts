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
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_PROJECT_ID.firebaseapp.com',
    projectId: 'TU_PROJECT_ID',
    storageBucket: 'TU_PROJECT_ID.appspot.com',
    messagingSenderId: 'TU_SENDER_ID',
    appId: 'TU_APP_ID',
    vapidKey: 'TU_WEB_PUSH_CERTIFICATE_KEY' // Clave pública para Web Push
  },
  // IoT configuration (production ready)
  iot: {
    sensorApiUrl: 'https://edgeserverspot-dudqatdsf5cebwe3.eastus2-01.azurewebsites.net/api/iot',
    endpoints: {
      devices: '/devices',              // GET /api/iot/devices  (listar dispositivos del usuario)
      register: '/devices',             // POST /api/iot/devices (auto-registro del simulador)
      telemetry: '/telemetry',          // POST /api/iot/telemetry
      bind: (serial: string) => `/devices/${serial}/bind`,
      unbind: (serial: string) => `/devices/${serial}/unbind`
    },
    simulation: {
      enabled: false,
      mockDataInterval: 300000
    }
  }
};
