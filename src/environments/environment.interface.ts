/**
 * Interfaz de configuración de Firebase
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

/**
 * Interfaz del objeto environment
 */
export interface Environment {
  production: boolean;
  apiBase: string;
  endpoints: {
    parkings: string;
    analytics: string;
    locations: string;
    pricing: string;
    features: string;
    uploads: string;
  };
  auth: {
    base: string;
    endpoints: {
      login: string;
      register: string;
      refresh: string;
      forgot: string;
      reset: string;
    };
  };
  profile: {
    base: string;
  };
  account: {
    base: string;
    endpoints: {
      changePassword: string;
      sessions: string;
      closeSession: (id: string) => string;
      downloadData: string;
      delete: string;
      toggle2fa: string;
    };
  };
  maps: {
    tileUrl: string;
    tileAttribution: string;
    nominatim: {
      geocodeUrl: string;
      reverseUrl: string;
    };
  };
  reservations: {
    base: string;
  };
  payments: {
    base: string;
  };
  featureFlags: {
    useMockApi: boolean;
    logHttp: boolean;
    enableOfflineMode: boolean;
  };
  analytics: {
    base: string;
    endpoints: {
      totals: string;
      revenueByMonth: string;
      occupancyByHour: string;
      recentActivity: string;
      topParkings: string;
    };
  };
  stripePublicKey: string;
  firebase?: FirebaseConfig; // Opcional para evitar errores si no está configurado
}

