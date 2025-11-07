# Actualización de Planes de Suscripción

## Cambios Realizados

Se han actualizado los planes de suscripción según los nuevos requisitos:

### Plan Básico
- **Precio**: S/ 0 (gratis)
- **Moneda**: PEN (Soles Peruanos)
- **Características**:
  - Hasta 3 parkings
  - Hasta 10 dispositivos IoT
  - ✅ Se eliminaron las características adicionales (Dashboard básico, Soporte por email)

### Plan Avanzado
- **Precio**: S/ 79
- **Moneda**: PEN (Soles Peruanos)
- **Características**:
  - Hasta 10 parkings
  - Hasta 50 dispositivos IoT
  - ✅ Se eliminaron las características adicionales (Dashboard avanzado, Soporte prioritario, Analytics avanzados)

## Archivos Modificados

### 1. `server/db.json`
- Actualizado `billingPlans` con los nuevos precios y moneda
- Actualizado todas las suscripciones existentes (`billingSubscriptions`) con los nuevos datos

### 2. `src/app/billing/components/plan-card/plan-card.component.ts`
- Agregado método `getCurrencySymbol()` para manejar el símbolo de soles peruanos (S/)
- El componente ahora muestra correctamente:
  - `€` para EUR
  - `S/` para PEN
  - `$` para USD

## Resultado Visual

Los planes ahora se muestran así:

### Plan Básico
```
S/ 0 /mes

✓ Hasta 3 parkings
✓ Hasta 10 dispositivos IoT
```

### Plan Avanzado
```
S/ 79 /mes

✓ Hasta 10 parkings
✓ Hasta 50 dispositivos IoT
```

## Notas Técnicas

- El array `features` está vacío `[]` para que solo se muestren los límites de parkings y dispositivos IoT
- El componente `plan-card` ya muestra automáticamente estos límites usando `plan.parkingLimit` y `plan.iotLimit`
- No se requieren cambios adicionales en el frontend ya que el componente es dinámico

## Próximos Pasos

Si necesitas agregar más características en el futuro, simplemente añade elementos al array `features` en el archivo `db.json`.

