// Middleware para reviews con privacidad
// Solo retorna reviews de parkings que pertenecen al usuario autenticado

module.exports = (req, res, next) => {
  // Normalizar path (remover /api si existe)
  const path = req.path.replace('/api', '');

  console.log(`[Reviews Middleware] Path original: ${req.path}, Path normalizado: ${path}`);

  // Para GET /reviews - filtrar por parkingOwnerId
  if (req.method === 'GET' && path === '/reviews') {
    // Obtener el userId del header de autenticación o query param
    const currentUserId = req.headers['x-user-id'] || req.query.currentUserId;

    console.log(`[Reviews Middleware] GET /reviews`);
    console.log(`[Reviews Middleware] currentUserId: ${currentUserId}`);

    if (currentUserId) {
      // Agregar filtro de parkingOwnerId
      req.query.parkingOwnerId = currentUserId;
      console.log(`[Reviews Middleware] Filtrando reviews por parkingOwnerId: ${currentUserId}`);
    }

    // Guardar la referencia a res.json original
    const originalJson = res.json.bind(res);

    // Sobrescribir res.json para filtrar archivadas
    res.json = function(data) {
      console.log(`[Reviews Middleware] Datos antes de filtrar:`, data);

      // Si es un array de reviews, filtrar las archivadas
      if (Array.isArray(data)) {
        const filtered = data.filter(review => !review.archived);
        console.log(`[Reviews Middleware] Reviews totales: ${data.length}, No archivadas: ${filtered.length}`);
        return originalJson(filtered);
      }

      return originalJson(data);
    };
  }

  // Para PATCH /reviews/:id/respond - actualizar review con respuesta
  if (req.method === 'PATCH' && path.includes('/reviews/') && path.includes('/respond')) {
    const pathParts = path.split('/').filter(p => p);
    const reviewId = pathParts[1]; // ['reviews', 'rev_1', 'respond'] -> 'rev_1'
    console.log(`[Reviews Middleware] Respondiendo a review: ${reviewId}`);

    // Transformar a PATCH normal para json-server
    req.url = `/reviews/${reviewId}`;
    req.path = `/reviews/${reviewId}`;
    req.body = {
      ...req.body,
      responded: true,
      responseAt: new Date().toISOString()
    };

    console.log(`[Reviews Middleware] Transformado a: ${req.url}`);
  }

  // Para PATCH /reviews/:id/read - marcar como leído
  if (req.method === 'PATCH' && path.includes('/reviews/') && path.includes('/read')) {
    const pathParts = path.split('/').filter(p => p);
    const reviewId = pathParts[1]; // ['reviews', 'rev_1', 'read'] -> 'rev_1'
    console.log(`[Reviews Middleware] Marcando review como leído: ${reviewId}`);

    // Transformar a PATCH normal para json-server
    req.url = `/reviews/${reviewId}`;
    req.path = `/reviews/${reviewId}`;
    req.body = {
      ...req.body,
      readAt: new Date().toISOString()
    };
  }

  // Para PATCH /reviews/:id/archive - ocultar review
  if (req.method === 'PATCH' && path.includes('/reviews/') && path.includes('/archive')) {
    const pathParts = path.split('/').filter(p => p);
    const reviewId = pathParts[1]; // ['reviews', 'rev_1', 'archive'] -> 'rev_1'
    console.log(`[Reviews Middleware] Archivando review: ${reviewId}`);

    // Transformar a PATCH normal para json-server
    req.url = `/reviews/${reviewId}`;
    req.path = `/reviews/${reviewId}`;
    req.body = {
      ...req.body,
      archived: true,
      archivedAt: new Date().toISOString()
    };

    console.log(`[Reviews Middleware] Transformado a: ${req.url}`);
    console.log(`[Reviews Middleware] Body:`, req.body);
  }

  // Para GET /reviews/kpis - calcular KPIs basados en los reviews del usuario
  if (req.method === 'GET' && (path === '/reviews/kpis' || path.endsWith('/reviews/kpis'))) {
    console.log(`[Reviews Middleware] Calculando KPIs...`);

    const db = req.app.db;
    const currentUserId = req.headers['x-user-id'] || req.query.currentUserId;

    console.log(`[Reviews Middleware] currentUserId: ${currentUserId}`);

    // Filtrar reviews por parkingOwnerId y excluir archivadas
    let userReviews = currentUserId
      ? db.get('reviews').filter({ parkingOwnerId: currentUserId }).value()
      : db.get('reviews').value();

    // Filtrar reviews no archivadas
    userReviews = userReviews.filter(r => !r.archived);

    console.log(`[Reviews Middleware] Reviews encontradas (no archivadas): ${userReviews.length}`);

    const totalReviews = userReviews.length;
    const respondedReviews = userReviews.filter(r => r.responded).length;
    const unrespondedReviews = totalReviews - respondedReviews;
    const unreadReviews = userReviews.filter(r => !r.readAt).length;

    // Calcular rating promedio
    const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    // Distribución de ratings
    const ratingDistribution = {
      5: userReviews.filter(r => r.rating === 5).length,
      4: userReviews.filter(r => r.rating === 4).length,
      3: userReviews.filter(r => r.rating === 3).length,
      2: userReviews.filter(r => r.rating === 2).length,
      1: userReviews.filter(r => r.rating === 1).length
    };

    // Calcular deltas (para mostrar tendencias)
    const averageRatingDelta = -0.2; // Mock - puedes calcularlo comparando con mes anterior
    const totalReviewsDelta = 5; // Mock
    const responseRateDelta = 2.5; // Mock
    const avgResponseTimeDelta = -0.5; // Mock

    const kpis = {
      averageRating: parseFloat(averageRating),
      averageRatingDelta,
      totalReviews,
      totalReviewsDelta,
      responseRate: totalReviews > 0 ? Math.round((respondedReviews / totalReviews) * 100) : 0,
      responseRateDelta,
      avgResponseTimeHours: 2.4, // Mock - calcular tiempo promedio de respuesta
      avgResponseTimeDelta,
      respondedReviews,
      unrespondedReviews,
      unreadReviews,
      ratingDistribution
    };

    console.log(`[Reviews Middleware] KPIs calculados:`, kpis);

    return res.json(kpis);
  }

  next();
};

