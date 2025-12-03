/**
 * Modelos e interfaces para el sistema de Parking Spots
 * Compatible con la API estricta del backend
 */

// ====== INTERFACES PARA API ======

/**
 * Para recibir datos del backend (GET)
 * El backend devuelve rowIndex y columnIndex
 */
export interface SpotResponse {
  id: string;
  parkingId: number;
  rowIndex: number;     // El backend lo manda así
  columnIndex: number;  // El backend lo manda así
  label: string;        // Ej: "A1"
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  iotStatus?: 'CONNECTED' | 'OFFLINE' | null;  // Estado de conexión del sensor IoT
  sensorSerialNumber?: string | null;           // Serial del sensor vinculado
}

/**
 * Para enviar datos al backend (POST)
 * El backend espera row y column como INTEGERS
 */
export interface CreateSpotRequest {
  row: number;    // Integer (Ej: 1)
  column: number; // Integer (Ej: 1 para 'A', 2 para 'B')
  label: string;  // String (Ej: "A1")
}

/**
 * Para la creación manual de spots
 */
export interface ManualSpotInput {
  columnLetter: string;  // Ej: "A", "B", "AA"
  rowNumber: number;     // Ej: 1, 2, 20
}

// ====== TIPOS PARA EL FRONTEND ======

export type SpotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

/**
 * Estado de conexión IoT del sensor vinculado al spot
 */
export enum ParkingSpotIotStatus {
  CONNECTED = 'CONNECTED',
  OFFLINE = 'OFFLINE'
}

/**
 * Modelo unificado para usar en el frontend
 */
export interface SpotData {
  id?: string;
  parkingId?: number;
  row: number;
  column: number;
  label: string;
  status: SpotStatus;
  deviceId?: string | null;
  lastUpdated?: Date;
  iotStatus?: ParkingSpotIotStatus | null;  // Estado de conexión del sensor IoT
  sensorSerialNumber?: string | null;        // Serial del sensor vinculado
}

/**
 * Para las estadísticas de spots
 */
export interface SpotStatistics {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
}

/**
 * Para los filtros en la UI
 */
export interface SpotFilters {
  status?: SpotStatus;
  hasDevice?: boolean;
  column?: number;
  searchTerm?: string;
}

/**
 * Constantes del sistema
 */
export const SPOT_CONSTANTS = {
  MAX_ROWS_PER_COLUMN: 5,  // Regla de negocio para generación automática
  MAX_TOTAL_SPOTS: 300,    // Límite máximo
  MIN_TOTAL_SPOTS: 1       // Límite mínimo
} as const;
