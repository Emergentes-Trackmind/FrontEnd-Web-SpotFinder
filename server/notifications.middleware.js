/**
 * Middleware de Notificaciones para json-server
 * Simula los endpoints de notificaciones del backend
 */

module.exports = function (req, res, next) {
  const path = req.path;
  const method = req.method;

  // Listar notificaciones
  if (method === 'GET' && path === '/api/notifications') {
    // Simular respuesta con formato correcto
    return res.status(200).json({
      data: [],
      total: 0,
      unreadCount: 0,
      page: 1,
      size: 20
    });
  }

  // Registrar token FCM
  if (method === 'POST' && path === '/api/notifications/register-fcm-token') {
    console.log('✅ Token FCM registrado:', req.body.token);
    return res.status(200).json({ success: true });
  }

  // Obtener contador de no leídas
  if (method === 'GET' && path === '/api/notifications/unread-count') {
    // Simular contador
    return res.status(200).json({ count: 3 });
  }

  // Marcar todas como leídas
  if (method === 'PATCH' && path === '/api/notifications/read-all') {
    console.log('✅ Todas las notificaciones marcadas como leídas');
    return res.status(200).json({ success: true });
  }

  // Marcar una como leída
  if (method === 'PATCH' && path.match(/\/api\/notifications\/(.+)\/read/)) {
    const id = path.match(/\/api\/notifications\/(.+)\/read/)[1];
    console.log(`✅ Notificación ${id} marcada como leída`);
    return res.status(200).json({ success: true });
  }

  // Eliminar todas
  if (method === 'DELETE' && path === '/api/notifications') {
    console.log('✅ Todas las notificaciones eliminadas');
    return res.status(200).json({ success: true });
  }

  // Enviar notificación (dispara FCM + email en backend real)
  if (method === 'POST' && path === '/api/notifications/send') {
    console.log('📧 Enviando notificación y email:', req.body);
    // En producción, aquí el backend enviaría FCM y email
    return res.status(200).json({ success: true });
  }

  next();
};

