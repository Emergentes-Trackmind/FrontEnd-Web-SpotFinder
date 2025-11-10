# Wizard de Creación de Robots RPA

## ✅ COMPLETADO: Wizard Nuevo Robot RPA

Se ha creado un wizard completo para la creación de robots RPA con 4 pasos usando `MatDialog` y `mat-horizontal-stepper`.

### 📁 Archivos Creados

#### Interfaces
- `src/app/rpa/interfaces/rpa-robot.interface.ts` - Definiciones TypeScript

#### Componente Wizard
- `src/app/rpa/components/nuevo-robot-rpa-dialog/`
  - `nuevo-robot-rpa-dialog.component.ts` ✅
  - `nuevo-robot-rpa-dialog.component.html` ✅
  - `nuevo-robot-rpa-dialog.component.css` ✅

#### Integración
- ✅ **Centro RPA actualizado** con funcionalidad del botón "Nuevo Robot RPA"
- ✅ **MatDialog configurado** en el módulo de automatización robótica
- ✅ **Sin errores de compilación**

### 🎯 Flujo del Wizard - 4 Pasos

#### 1. **Seleccionar Plantilla de Robot**
- Grid de 4 plantillas predefinidas:
  - Bot Facturación SUNAT (Intermedio)
  - Bot Conciliación Bancaria (Avanzado)
  - Bot Reporte Excel (Básico)
  - Bot Actualización ERP (Avanzado)
- Cada plantilla muestra:
  - Icono y categoría
  - Nivel de complejidad con chip coloreado
  - Tiempo estimado de configuración
  - Sistemas que integra
- Campos personalizables: nombre y descripción del robot

#### 2. **Conectar Sistemas Externos**
- **Configuración SUNAT** (si aplica):
  - RUC, Usuario SOL, Clave SOL
- **Configuración Bancaria** (si aplica):
  - Selección de banco (BCP, Interbank, BBVA, Scotiabank)
  - Tipo de conexión (API o Web Scraping)
- **Configuración Excel** (si aplica):
  - Ruta del archivo, hoja de cálculo, formato

#### 3. **Configurar Disparador**
- **Por Evento**:
  - Cuando se confirme un pago
  - Cuando se cree una reserva
  - Al final del día
- **Por Horario**:
  - Diariamente, semanalmente, mensualmente
  - Configuración de hora específica
  - Días de la semana (para semanal)
  - Día del mes (para mensual)

#### 4. **Revisar y Confirmar**
- Resumen completo de la configuración:
  - Información básica del robot
  - Sistemas conectados con iconos
  - Configuración del disparador
- Checkbox de términos y condiciones
- Botón "Crear Robot" final

### 🎨 Características de Diseño

#### Visual y UX
- **Stepper horizontal** con 4 pasos claramente definidos
- **Cards interactivas** para selección de plantillas
- **Estados visuales** (hover, selected, loading)
- **Iconografía consistente** con Material Design
- **Responsive design** - adaptable a móviles y tablets

#### Validación de Formularios
- **FormBuilder** y **Reactive Forms** en cada paso
- **Validaciones** requeridas para avanzar entre pasos
- **Navegación inteligente** - botones Previous/Next habilitados según validación

#### Estados de Loading
- **Skeleton loaders** durante la carga
- **Progress indicators** en transiciones
- **Feedback visual** en todas las interacciones

### 🛠️ Integración Técnica

#### Módulos Angular Material
- `MatDialogModule` - Dialog principal
- `MatStepperModule` - Wizard de pasos
- `MatFormFieldModule` - Campos de formulario
- `MatSelectModule` - Dropdowns
- `MatCheckboxModule` - Checkboxes
- `MatRadioModule` - Radio buttons
- `MatChipsModule` - Badges de estado
- `MatCardModule` - Cards de plantilla

#### Arquitectura de Datos
```typescript
interface RpaRobotTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  systems: string[];
  icon: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

interface RpaRobotCreation {
  templateId: string;
  name: string;
  description: string;
  // Conexiones y configuración...
}
```

### 🚀 Cómo Usar

1. **Desde el Centro RPA**: Click en botón "Nuevo Robot RPA"
2. **Dialog se abre** con ancho 1000px (responsive)
3. **Completar los 4 pasos** del wizard
4. **Crear Robot** - devuelve objeto completo de configuración

#### Acciones Disponibles
- **Cancelar**: Cierra el dialog sin guardar
- **Anterior/Siguiente**: Navegación entre pasos
- **Crear Robot**: Finaliza y devuelve datos

### 🔧 Próximos Pasos (Opcionales)

Para convertir en funcionalidad real:

1. **Conectar API backend** en `onCreateRobot()`
2. **Validaciones avanzadas** de credenciales
3. **Test de conexiones** en tiempo real
4. **Guardar borradores** durante la configuración
5. **Plantillas personalizadas** definidas por el usuario
6. **Integración con UiPath/Automation Anywhere**

### 📋 Dependencias

Todas las dependencias ya están configuradas en el módulo:
- Angular Reactive Forms ✅
- Angular Material Completo ✅
- Interfaces TypeScript ✅
- Standalone Components ✅

¡El wizard está 100% funcional y listo para usar! 🎉

**Para probar**: Centro RPA → "Nuevo Robot RPA" → Completar wizard de 4 pasos
