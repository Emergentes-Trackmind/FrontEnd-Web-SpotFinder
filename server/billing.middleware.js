/**
 * Middleware para gestionar endpoints de Billing y Stripe
 * NOTA: Las rutas ya vienen con rewrite aplicado por routes.json
 * /api/billing/me -> /billing/me
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

  // GET /billing/me - Obtener información de suscripción del usuario (DESPUÉS del rewrite)
  if (req.method === 'GET' && (req.path === '/billing/me' || req.path === '/api/billing/me')) {
    const userId = getUserIdFromToken(req);

    console.log('🔍 [Billing] GET /billing/me - userId:', userId);
    console.log('🔍 [Billing] Request path:', req.path);

    if (!userId) {
      console.log('❌ [Billing] No userId found in token');
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Buscar suscripción del usuario
    const db = req.app.db;
    const subscription = db.get('billingSubscriptions')
      .find({ userId: userId })
      .value();

    console.log('📦 [Billing] Subscription found:', subscription ? 'YES' : 'NO');

    if (!subscription) {
      // Si no tiene suscripción, buscar el Plan Básico y crear una
      const basicPlan = db.get('billingPlans').find({ code: 'BASIC' }).value();

      if (!basicPlan) {
        console.error('❌ [Billing] Plan Básico no encontrado en la base de datos');
        return res.status(500).json({ message: 'Error: Plan Básico no configurado' });
      }

      // Crear suscripción automáticamente
      const newSubscription = {
        userId: userId,
        plan: basicPlan,
        status: 'ACTIVE',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        stripeCustomerId: 'cus_mock_' + userId,
        stripeSubscriptionId: 'sub_mock_' + userId
      };

      // Guardar en la base de datos
      db.get('billingSubscriptions').push(newSubscription).write();

      console.log('✅ [Billing] Suscripción creada automáticamente para usuario:', userId);
      console.log('📄 [Billing] Suscripción:', JSON.stringify(newSubscription, null, 2));

      return res.status(200).json(newSubscription);
    }

    console.log('✅ [Billing] Devolviendo suscripción existente');
    return res.status(200).json(subscription);
  }

  // GET /billing/plans - Obtener todos los planes disponibles (DESPUÉS del rewrite)
  if (req.method === 'GET' && (req.path === '/billing/plans' || req.path === '/api/billing/plans')) {
    console.log('🔍 [Billing] GET /billing/plans');
    console.log('🔍 [Billing] Request path:', req.path);

    const db = req.app.db;
    const plans = db.get('billingPlans')
      .filter({ isActive: true })
      .value();

    console.log('📦 [Billing] Planes encontrados:', plans.length);
    console.log('📄 [Billing] Planes:', JSON.stringify(plans, null, 2));

    return res.status(200).json(plans);
  }

  // GET /billing/payments - Obtener historial de pagos del usuario
  if (req.method === 'GET' && (req.path === '/billing/payments' || req.path === '/api/billing/payments')) {
    const userId = getUserIdFromToken(req);

    console.log('🔍 [Billing] GET /billing/payments - userId:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const db = req.app.db;
    const payments = db.get('billingPayments')
      .filter({ userId: userId })
      .orderBy(['date'], ['desc'])
      .value();

    console.log('📦 [Billing] Pagos encontrados:', payments.length);
    return res.status(200).json(payments);
  }

  // POST /billing/checkout - Crear sesión de checkout de Stripe
  if (req.method === 'POST' && (req.path === '/billing/checkout' || req.path === '/api/billing/checkout')) {
    const userId = getUserIdFromToken(req);

    console.log('🔍 [Billing] POST /billing/checkout - userId:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ message: 'priceId es requerido' });
    }

    console.log('✅ [Billing] Creando sesión de checkout para:', { userId, priceId });

    // Simular respuesta de Stripe
    return res.status(200).json({
      sessionId: 'cs_test_mock_' + Date.now(),
      url: 'https://checkout.stripe.com/pay/mock_session_' + Date.now()
    });
  }

  // POST /billing/portal - Crear sesión del portal de cliente de Stripe
  if (req.method === 'POST' && (req.path === '/billing/portal' || req.path === '/api/billing/portal')) {
    const userId = getUserIdFromToken(req);

    console.log('🔍 [Billing] POST /billing/portal - userId:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    console.log('✅ [Billing] Creando sesión de portal para:', { userId });

    // Simular respuesta de Stripe
    return res.status(200).json({
      url: 'https://billing.stripe.com/session/mock_portal_' + Date.now()
    });
  }

  // Si no coincide con ninguna ruta de billing, continuar
  next();
};
