/**
 * Middleware para gestionar endpoints de Billing
 * Ahora usa el campo 'plan' del usuario directamente
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'spotfinder_secret_key_2024';

module.exports = (req, res, next) => {

  // Helper para extraer el userId del token
  const getUserIdFromToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId;
    } catch (error) {
      console.error('❌ [Billing] Error decodificando token:', error.message);
      return null;
    }
  };

  // GET /billing/me - Obtener información de suscripción del usuario
  if (req.method === 'GET' && req.path === '/billing/me') {
    const userId = getUserIdFromToken(req);

    console.log('🔍 [Billing] GET /billing/me - userId:', userId);

    if (!userId) {
      console.log('❌ [Billing] No userId found in token');
      return res.status(401).json({ message: 'No autorizado' });
    }

    const db = req.app.db;
    const user = db.get('users').find({ id: userId }).value();

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si el usuario no tiene plan, asignarle 'basic' por defecto
    if (!user.plan) {
      db.get('users').find({ id: userId }).assign({ plan: 'basic' }).write();
      user.plan = 'basic';
    }

    // Buscar el plan correspondiente
    const planCode = user.plan === 'premium' ? 'ADVANCED' : 'BASIC';
    const plan = db.get('billingPlans').find({ code: planCode }).value();

    if (!plan) {
      return res.status(500).json({ message: 'Error: Plan no encontrado' });
    }

    const subscriptionInfo = {
      userId: user.id,
      plan: plan,
      status: 'ACTIVE',
      currentPeriodStart: user.createdAt,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    };

    console.log('✅ [Billing] Devolviendo información de suscripción');
    return res.status(200).json(subscriptionInfo);
  }

  // GET /billing/plans - Obtener todos los planes disponibles
  if (req.method === 'GET' && req.path === '/billing/plans') {
    console.log('🔍 [Billing] GET /billing/plans');

    const db = req.app.db;
    const plans = db.get('billingPlans')
      .filter({ isActive: true })
      .value();

    console.log('📦 [Billing] Planes encontrados:', plans.length);
    return res.status(200).json(plans);
  }

  // POST /billing/subscribe - Cambiar plan del usuario
  if (req.method === 'POST' && req.path === '/billing/subscribe') {
    const userId = getUserIdFromToken(req);
    const { planCode } = req.body;

    console.log('🔍 [Billing] POST /billing/subscribe - userId:', userId, 'planCode:', planCode);

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (!planCode) {
      return res.status(400).json({ message: 'planCode es requerido' });
    }

    const db = req.app.db;
    const user = db.get('users').find({ id: userId }).value();

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Buscar el plan solicitado
    const plan = db.get('billingPlans').find({ code: planCode }).value();

    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    // Actualizar el plan del usuario
    const newPlan = planCode === 'ADVANCED' ? 'premium' : 'basic';
    db.get('users').find({ id: userId }).assign({ plan: newPlan }).write();

    console.log('✅ [Billing] Plan actualizado a:', newPlan);

    const subscriptionInfo = {
      userId: user.id,
      plan: plan,
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    };

    return res.status(200).json(subscriptionInfo);
  }

  // POST /billing/cancel - Cancelar suscripción (volver a basic)
  if (req.method === 'POST' && req.path === '/billing/cancel') {
    const userId = getUserIdFromToken(req);

    console.log('🔍 [Billing] POST /billing/cancel - userId:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const db = req.app.db;
    const user = db.get('users').find({ id: userId }).value();

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Volver a plan básico
    db.get('users').find({ id: userId }).assign({ plan: 'basic' }).write();

    const basicPlan = db.get('billingPlans').find({ code: 'BASIC' }).value();

    console.log('✅ [Billing] Suscripción cancelada, usuario regresado a plan básico');

    const subscriptionInfo = {
      userId: user.id,
      plan: basicPlan,
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    };

    return res.status(200).json(subscriptionInfo);
  }

  // Continuar con el siguiente middleware
  next();
};

