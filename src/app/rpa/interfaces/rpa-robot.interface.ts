export interface RpaRobotTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  systems: string[]; // ej. ['SUNAT'], ['Banco'], ['Excel']
  icon: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: string; // ej. '2-3 min'
}

export interface RpaRobotCreation {
  templateId: string;
  name: string;
  description: string;

  // Conexiones externas
  sunatConnected: boolean;
  sunatConfig?: {
    ruc: string;
    usuario: string;
    clave: string;
  };

  bankConnected: boolean;
  bankConfig?: {
    banco: string;
    tipoConexion: 'api' | 'scraping';
    credenciales: any;
  };

  excelConnected: boolean;
  excelConfig?: {
    rutaArchivo: string;
    hojaCalculo: string;
    formatoReporte: string;
  };

  // Disparador
  triggerType: 'event' | 'schedule';
  eventType?: 'reservaPagada' | 'reservaCreada' | 'finDeDia';
  scheduleTime?: string; // '09:00'
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  scheduleConfig?: {
    diasSemana?: string[];
    diaMes?: number;
    horaEjecucion: string;
  };
}
