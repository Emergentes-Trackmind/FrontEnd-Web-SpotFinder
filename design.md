# API Endpoints Design

## Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.spotfinder.com/api`

## Parking Profiles Endpoints

### CRUD Básico

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET    | `/parkingProfiles` | Lista todos los perfiles | - | `ParkingProfileDto[]` |
| GET    | `/parkingProfiles?_page=1&_limit=10` | Lista paginada | - | `ParkingProfileDto[]` |
| GET    | `/parkingProfiles?q=search` | Búsqueda por texto | - | `ParkingProfileDto[]` |
| GET    | `/parkingProfiles/:id` | Obtener perfil por ID | - | `ParkingProfileDto` |
| POST   | `/parkingProfiles` | Crear nuevo perfil | `CreateParkingProfileRequest` | `ParkingProfileDto` |
| PUT    | `/parkingProfiles/:id` | Actualizar perfil completo | `UpdateParkingProfileRequest` | `ParkingProfileDto` |
| PATCH  | `/parkingProfiles/:id` | Actualización parcial | `Partial<UpdateParkingProfileRequest>` | `ParkingProfileDto` |
| DELETE | `/parkingProfiles/:id` | Eliminar perfil | - | `204 No Content` |

### Secciones Específicas (mediante PATCH)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| PATCH  | `/parkingProfiles/:id` | Actualizar información básica | `{ name, type, description, ... }` |
| PATCH  | `/parkingProfiles/:id` | Actualizar ubicación | `{ location: LocationDto }` |
| PATCH  | `/parkingProfiles/:id` | Actualizar precios | `{ pricing: PricingDto }` |
| PATCH  | `/parkingProfiles/:id` | Actualizar características | `{ features: FeaturesDto }` |

### Upload de Imágenes

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST   | `/parkingProfiles/:id/upload` | Subir imagen del perfil | `FormData` con `image` field |

## Analytics Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET    | `/analytics/profiles/:id` | Analíticas completas del perfil | `AnalyticsDto` |
| GET    | `/analytics/profiles/:id/range?startDate=2024-01-01&endDate=2024-01-31` | Analíticas por rango de fechas | `AnalyticsDto` |

## Estructura de Datos

### ParkingProfileDto
```typescript
{
  "id": "1",
  "name": "Parking Centro Comercial",
  "type": "Comercial",
  "description": "Descripción del parking...",
  "totalSpaces": 150,
  "accessibleSpaces": 5,
  "phone": "+34 600 123 456",
  "email": "info@parking.com",
  "website": "https://parking.com",
  "imageUrl": "/uploads/image.jpg",
  "status": "active",
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-03-20T14:30:00Z",
  "location": LocationDto,
  "pricing": PricingDto,
  "features": FeaturesDto,
  "analytics": AnalyticsDto
}
```

### LocationDto
```typescript
{
  "addressLine": "Calle Gran Vía, 28",
  "city": "Madrid",
  "postalCode": "28013",
  "state": "Madrid",
  "country": "España",
  "latitude": 40.4168,
  "longitude": -3.7038
}
```

### PricingDto
```typescript
{
  "hourlyRate": 5,
  "dailyRate": 25,
  "monthlyRate": 150,
  "open24h": true,
  "operatingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "promotions": {
    "earlyBird": true,
    "weekend": true,
    "longStay": false
  }
}
```

### FeaturesDto
```typescript
{
  "security": ["security24h", "cameras", "lighting"],
  "amenities": ["covered", "elevator", "bathrooms"],
  "services": ["electricCharging", "freeWifi"],
  "payments": ["cardPayment", "mobilePayment"]
}
```

### AnalyticsDto
```typescript
{
  "kpis": {
    "avgOccupation": 78,
    "monthlyRevenue": 3240,
    "uniqueUsers": 456,
    "avgTime": 4.2,
    "trends": {
      "avgOccupation": 5.2,
      "monthlyRevenue": 12.8,
      "uniqueUsers": 8.1,
      "avgTime": -0.3
    }
  },
  "hourlyOccupation": [
    { "hour": "06:00", "percentage": 15 },
    { "hour": "08:00", "percentage": 78 }
  ],
  "recentActivity": [
    {
      "action": "Nueva reserva confirmada",
      "details": "Plaza A-15 • María González",
      "timestamp": "2024-03-20T14:25:00Z",
      "timeAgo": "Hace 5 min"
    }
  ]
}
```

## Manejo de Errores

### Códigos de Estado HTTP
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado
- `204 No Content` - Eliminación exitosa
- `400 Bad Request` - Datos inválidos
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: nombre duplicado)
- `422 Unprocessable Entity` - Validación fallida
- `500 Internal Server Error` - Error del servidor

### Estructura de Error
```typescript
{
  "error": {
    "message": "Mensaje de error legible",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "name",
      "reason": "required"
    }
  }
}
```

## Feature Flags

El sistema respeta los feature flags definidos en `environment.ts`:

- `useMockApi: true` → Usa JSON Server en puerto 3001
- `useMockApi: false` → Usa API real en `apiBase`
- `logHttp: true` → Logs detallados de requests HTTP
- `logHttp: false` → Sin logs HTTP

## Defaults y Fallbacks

### Regla General
- **number** → `0`
- **string** → `''` (string vacío)
- **boolean** → `false`
- **array** → `[]` (array vacío)
- **object** → objeto con defaults aplicados recursivamente

### Analytics Específicos
Si no hay datos de analytics, todos los valores se inicializan en `0`:
- KPIs: `{ avgOccupation: 0, monthlyRevenue: 0, uniqueUsers: 0, avgTime: 0 }`
- Trends: `{ avgOccupation: 0, monthlyRevenue: 0, uniqueUsers: 0, avgTime: 0 }`
- hourlyOccupancy: array con 9 elementos (06:00 a 22:00) con percentage: 0
- recentActivity: array vacío `[]`

## Caching

### Estrategia de Cache
- **Profiles List**: Cache por 5 minutos
- **Profile Detail**: Cache hasta actualización
- **Analytics**: Cache hasta refresh manual
- **Cache Keys**: `profiles_{params}`, `profile_{id}`, `analytics_{id}`

### Invalidación de Cache
- Al crear/actualizar/eliminar: se limpia cache relacionada
- Método `clearCache()` disponible en todos los servicios
- Cache automática con `shareReplay(1)` en observables
