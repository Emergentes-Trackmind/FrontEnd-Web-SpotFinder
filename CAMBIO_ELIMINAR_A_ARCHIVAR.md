# 📦 Cambio de "Eliminar" a "Ocultar/Archivar" Reviews

## 🎯 Objetivo
En lugar de **eliminar permanentemente** las reviews, ahora el administrador puede **ocultarlas/archivarlas** para que no se visualicen, pero sin perder los datos.

## ✅ Cambios Implementados

### 1. **Nueva Propiedad en Review Entity**
```typescript
export interface Review {
  // ...existing fields...
  archived?: boolean;           // Indica si está archivada
  archivedAt?: string | null;   // Fecha de archivo
}
```

### 2. **Cambio en la UI**

#### Antes:
```
[⋮] Menú:
  - Edit Response
  - ❌ Delete
```

#### Ahora:
```
[⋮] Menú:
  - Edit Response
  - 👁️‍🗨️ Ocultar review
```

**Icono:** `visibility_off` (ojo tachado)
**Texto:** "Ocultar review"

### 3. **Confirmación al Ocultar**
```
¿Estás seguro de que deseas ocultar esta reseña?

No se eliminará, solo dejará de mostrarse en tu lista.

[Cancelar] [Aceptar]
```

### 4. **Comportamiento**

#### Al archivar una review:
1. ✅ Se marca `archived: true`
2. ✅ Se guarda `archivedAt: timestamp`
3. ✅ **NO se elimina** de la base de datos
4. ✅ Desaparece de la lista del administrador
5. ✅ Los KPIs se actualizan (no cuenta las archivadas)
6. ✅ Mensaje: "Reseña ocultada exitosamente"

#### Reviews archivadas:
- ❌ No aparecen en GET /reviews
- ❌ No se cuentan en los KPIs
- ✅ Siguen en la base de datos
- ✅ Se pueden recuperar si es necesario

---

## 🔧 Cambios Técnicos

### Frontend

#### 1. **review-item.component.ts**
```typescript
// Antes
@Output() delete = new EventEmitter<ReviewId>();

onDelete(): void {
  if (confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
    this.delete.emit(this.review.id);
  }
}

// Ahora
@Output() archive = new EventEmitter<ReviewId>();

onArchive(): void {
  if (confirm('¿Estás seguro de que deseas ocultar esta reseña?\n\nNo se eliminará, solo dejará de mostrarse en tu lista.')) {
    this.archive.emit(this.review.id);
  }
}
```

#### 2. **reviews.page.ts**
```typescript
// Antes
onDeleteReview(id: ReviewId): void {
  this.reviewsFacadeService.deleteReview(id).subscribe({
    next: () => this.snackBar.open('Review deleted successfully', ...)
  });
}

// Ahora
onArchiveReview(id: ReviewId): void {
  this.reviewsFacadeService.archiveReview(id).subscribe({
    next: () => {
      this.snackBar.open('Reseña ocultada exitosamente', ...);
      this.loadReviews(); // Refresh
      this.loadKpis();    // Refresh KPIs
    }
  });
}
```

#### 3. **reviews.facade.ts**
```typescript
// Antes
deleteReview(id: ReviewId): Observable<boolean> {
  return this.repository.deleteReview(id).pipe(...)
}

// Ahora
archiveReview(id: ReviewId): Observable<boolean> {
  return this.repository.archiveReview(id).pipe(
    map(() => true),
    tap(() => {
      // Quitar de la lista local
      const currentReviews = this.reviews();
      const updatedReviews = currentReviews.filter(r => !r.id.equals(id));
      this.reviews.set(updatedReviews);
      this.totalReviews.set(this.totalReviews() - 1);
    })
  );
}
```

#### 4. **reviews.api.ts**
```typescript
// Antes
deleteReview(id: ReviewId): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id.value}`);
}

// Ahora
archiveReview(id: ReviewId): Observable<Review> {
  const url = `${this.baseUrl}/${id.value}/archive`;
  const body = {
    archived: true,
    archivedAt: new Date().toISOString()
  };
  return this.http.patch<Review>(url, body);
}
```

### Backend (Middleware)

#### 1. **Filtrar reviews archivadas en GET**
```javascript
if (req.method === 'GET' && path === '/reviews') {
  // ...filtros de privacidad...
  
  // NO mostrar reviews archivadas
  req.query.archived_ne = 'true'; // json-server: archived != true
}
```

#### 2. **Endpoint de Archive**
```javascript
if (req.method === 'PATCH' && path.includes('/archive')) {
  const reviewId = path.split('/')[2];
  console.log(`[Reviews Middleware] Archivando review: ${reviewId}`);
  
  // Transformar a PATCH normal
  req.url = `/reviews/${reviewId}`;
  req.body = {
    archived: true,
    archivedAt: new Date().toISOString()
  };
}
```

#### 3. **KPIs solo cuentan no archivadas**
```javascript
if (path === '/reviews/kpis') {
  let userReviews = db.get('reviews')
    .filter({ parkingOwnerId: currentUserId })
    .value();
  
  // Excluir archivadas
  userReviews = userReviews.filter(r => !r.archived);
  
  // Calcular KPIs...
}
```

---

## 📊 Flujo Completo

### Ocultar una Review:

```
1. Usuario hace clic en [⋮] → "Ocultar review"
   ↓
2. Aparece confirmación
   ↓
3. Si acepta:
   ↓
4. Frontend → PATCH /api/reviews/:id/archive { archived: true, archivedAt: ... }
   ↓
5. Middleware intercepta y transforma a PATCH /api/reviews/:id
   ↓
6. json-server actualiza la review en db.json
   ↓
7. Review ahora tiene: { archived: true, archivedAt: "2025-11-13T..." }
   ↓
8. Frontend refresca la lista
   ↓
9. GET /api/reviews?archived_ne=true → NO incluye la archivada
   ↓
10. La review desaparece de la lista
    ↓
11. KPIs se recalculan sin incluir la archivada
```

---

## 🔍 Recuperar Reviews Archivadas

Si en el futuro quieres ver las reviews archivadas:

### Opción 1: Consulta directa en db.json
```json
{
  "reviews": [
    {
      "id": "rev_1",
      "archived": true,        ← Archivada
      "archivedAt": "2025-11-13T10:00:00.000Z",
      "comment": "...",
      ...
    }
  ]
}
```

### Opción 2: Endpoint especial (futuro)
```typescript
// GET /api/reviews/archived
getArchivedReviews(): Observable<Review[]> {
  return this.http.get<Review[]>('/reviews?archived=true');
}
```

### Opción 3: Desarchivar (futuro)
```typescript
unarchiveReview(id: ReviewId): Observable<Review> {
  const url = `${this.baseUrl}/${id.value}`;
  return this.http.patch<Review>(url, { 
    archived: false,
    archivedAt: null 
  });
}
```

---

## ✅ Ventajas de Archivar vs Eliminar

### Archivar (✅ Implementado):
- ✅ No se pierde la información
- ✅ Se puede recuperar si fue un error
- ✅ Cumplimiento legal (algunos países requieren guardar reviews)
- ✅ Análisis histórico (métricas a largo plazo)
- ✅ Auditoría (quién archivó, cuándo)

### Eliminar (❌ Removido):
- ❌ Pérdida permanente de datos
- ❌ No se puede deshacer
- ❌ Puede violar regulaciones
- ❌ Pierdes histórico de clientes

---

## 📝 Ejemplo de Uso

### Caso: Review ofensiva

**Situación:** Un cliente dejó una review con lenguaje ofensivo.

**Antes (Eliminar):**
1. Admin elimina la review
2. Se pierde permanentemente
3. No hay registro de que existió
4. KPIs se calculan como si nunca hubiera pasado

**Ahora (Archivar):**
1. Admin oculta la review
2. Desaparece de la vista pública
3. Queda registrada en db.json con `archived: true`
4. KPIs no la cuentan (como si no existiera para el público)
5. Admin puede revisarla después si necesita
6. Queda registro de cuándo se archivó

---

## 🚀 Para Probar

1. **Reinicia el servidor:**
```bash
restart-server.bat
```

2. **Recarga el frontend:** Ctrl + Shift + R

3. **Prueba ocultar una review:**
   - Ve a Reviews
   - Haz clic en [⋮] de cualquier review
   - Selecciona "Ocultar review"
   - Confirma
   - ✅ La review desaparece
   - ✅ KPIs se actualizan

4. **Verifica en db.json:**
```json
{
  "id": "rev_X",
  "archived": true,
  "archivedAt": "2025-11-13T...",
  ...
}
```

---

## 📁 Archivos Modificados

### Frontend:
1. ✅ `review.entity.ts` - Campos archived y archivedAt
2. ✅ `review-item.component.ts` - Cambio de delete a archive
3. ✅ `reviews.page.ts` - onArchiveReview
4. ✅ `reviews.facade.ts` - archiveReview
5. ✅ `reviews.repository.port.ts` - archiveReview
6. ✅ `reviews.repository.ts` - archiveReview
7. ✅ `reviews.api.ts` - archiveReview endpoint

### Backend:
1. ✅ `reviews.middleware.js` - Filtro archived_ne y endpoint /archive

---

¡Listo! Ahora el sistema oculta las reviews en lugar de eliminarlas permanentemente. 🎉

