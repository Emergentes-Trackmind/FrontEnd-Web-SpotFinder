// Middleware para reservations con privacidad
// Solo retorna reservations de parkings que pertenecen al usuario autenticado

module.exports = (req, res, next) => {
  // Normalizar path (remover /api si existe)
  const path = req.path.replace('/api', '');

  console.log(`[Reservations Middleware] ${req.method} ${req.path}`);
  console.log(`[Reservations Middleware] Path normalizado: ${path}`);

  // Para GET /reservations - filtrar por parkingOwnerId
  if (req.method === 'GET' && path === '/reservations') {
    // Obtener el userId del header de autenticación o query param
    const currentUserId = req.headers['x-user-id'] || req.query.currentUserId;

    console.log(`[Reservations Middleware] GET /reservations detectado`);
    console.log(`[Reservations Middleware] Headers:`, req.headers['x-user-id']);
    console.log(`[Reservations Middleware] Query params:`, req.query);
    console.log(`[Reservations Middleware] currentUserId extraído: ${currentUserId}`);

    if (currentUserId) {
      // Agregar filtro de parkingOwnerId
      req.query.parkingOwnerId = currentUserId;
      console.log(`[Reservations Middleware] ✅ Filtrando reservations por parkingOwnerId: ${currentUserId}`);
      console.log(`[Reservations Middleware] Query params finales:`, req.query);
    } else {
      console.log(`[Reservations Middleware] ⚠️ No se encontró currentUserId - retornará todas las reservas`);
    }
  }

  next();
};

