const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción esto debería ser una variable de entorno)
const JWT_SECRET = 'quadrapp_secret_key_2024';

// Función para extraer token del header Authorization
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Función para verificar y decodificar token JWT
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log('🔓 [DEBUG] Token decodificado exitosamente:', {
    //   userId: decoded.userId,
    //   email: decoded.email,
    //   userIdType: typeof decoded.userId
    // });
    return decoded;
  } catch (error) {
    // console.error('❌ [DEBUG] Error al verificar token:', error.message);
    return null;
  }
}

// Función para generar token JWT
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      roles: user.roles
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

module.exports = (req, res, next) => {
  // Middleware para simular endpoints de autenticación

  // POST /auth/login (después del rewrite de routes.json)
  if (req.method === 'POST' && req.path === '/auth/login') {
    const { email, password } = req.body;

    const db = req.app.db;
    const user = db.get('users').find({ email: email }).value();

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'Credenciales inválidas'
      });
    }

    // Para el mock, aceptamos cualquier contraseña
    const accessToken = generateToken(user);
    const refreshToken = `refresh_token_${user.id}_${Date.now()}`;

    // Actualizar último login
    db.get('users').find({ id: user.id }).assign({
      lastLoginAt: new Date().toISOString()
    }).write();

    const authResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        lastLoginAt: new Date().toISOString()
      },
      accessToken,
      refreshToken,
      expiresIn: 3600
    };

    return res.status(200).json(authResponse);
  }

  // POST /auth/register (después del rewrite de routes.json)
  if (req.method === 'POST' && req.path === '/auth/register') {
    const { email, password, firstName, lastName, acceptTerms } = req.body;

    if (!acceptTerms) {
      return res.status(400).json({
        error: 'Términos no aceptados',
        message: 'Debe aceptar los términos y condiciones'
      });
    }

    const db = req.app.db;
    const existingUser = db.get('users').find({ email: email }).value();

    if (existingUser) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: 'Ya existe una cuenta con este email'
      });
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      email,
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      firstName,
      lastName,
      roles: ['user'],
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    db.get('users').push(newUser).write();

    // Crear perfil por defecto
    const newProfile = {
      id: newUser.id,
      userId: newUser.id,
      firstName,
      lastName,
      email,
      phone: null,
      avatar: null,
      bio: '',
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
          parkingAlerts: true,
          systemUpdates: true
        },
        language: 'es',
        timezone: 'America/Mexico_City',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light'
      },
      updatedAt: new Date().toISOString()
    };

    db.get('profiles').push(newProfile).write();

    const accessToken = generateToken(newUser);
    const refreshToken = `refresh_token_${newUser.id}_${Date.now()}`;

    const authResponse = {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        roles: newUser.roles,
        isEmailVerified: newUser.isEmailVerified,
        createdAt: newUser.createdAt,
        lastLoginAt: newUser.lastLoginAt
      },
      accessToken,
      refreshToken,
      expiresIn: 3600
    };

    return res.status(201).json(authResponse);
  }

  // POST /auth/refresh (después del rewrite)
  if (req.method === 'POST' && req.path === '/auth/refresh') {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token requerido',
        message: 'Token de actualización no proporcionado'
      });
    }

    // En un sistema real, verificaríamos el refresh token
    const tokenResponse = {
      accessToken: `mock_token_refresh_${Date.now()}`,
      refreshToken: `refresh_token_new_${Date.now()}`,
      expiresIn: 3600
    };

    return res.status(200).json(tokenResponse);
  }

  // POST /auth/forgot-password
  if (req.method === 'POST' && req.path === '/auth/forgot-password') {
    return res.status(200).json({
      message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
    });
  }

  // POST /auth/reset-password
  if (req.method === 'POST' && req.path === '/auth/reset-password') {
    return res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    });
  }

  // Middleware de autenticación para endpoints protegidos
  const protectedEndpoints = ['/parkingProfiles', '/analytics', '/profiles', '/sessions', '/locations', '/pricing', '/features'];

  if (protectedEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'Token requerido',
        message: 'Se requiere autenticación para acceder a este recurso'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación es inválido o ha expirado'
      });
    }

    // Agregar información del usuario autenticado al request
    req.user = decoded;

    // GET /parkingProfiles - Solo parkings del usuario autenticado
    if (req.method === 'GET' && req.path === '/parkingProfiles') {
      const db = req.app.db;
      const userParkings = db.get('parkingProfiles')
        .filter(parking => parking.ownerId === decoded.userId || parking.ownerId === decoded.userId.toString())
        .value();

      return res.status(200).json(userParkings);
    }

    // GET /analytics/:id - Solo analytics de parkings del usuario
    if (req.method === 'GET' && req.path.startsWith('/analytics/')) {
      const profileId = req.path.split('/')[2];
      const db = req.app.db;

      // Verificar que el parking pertenezca al usuario
      const parking = db.get('parkingProfiles').find({ id: profileId }).value();
      if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para ver estos analytics'
        });
      }

      const analytics = db.get('analytics').find({ profileId: profileId }).value();
      return res.status(200).json(analytics || {});
    }

    // GET /profiles - Solo perfil del usuario autenticado
    if (req.method === 'GET' && req.path === '/profiles') {
      const db = req.app.db;

      // Buscar perfil del usuario autenticado
      let userProfile = db.get('profiles')
        .find(profile =>
          profile.userId === decoded.userId ||
          profile.userId === decoded.userId.toString() ||
          profile.id === decoded.userId ||
          profile.id === decoded.userId.toString()
        )
        .value();

      // Si no existe el perfil, crearlo automáticamente
      if (!userProfile) {
        const userData = db.get('users')
          .find(user => user.id === decoded.userId || user.id === decoded.userId.toString())
          .value();

        if (userData) {
          const newProfile = {
            id: decoded.userId.toString(),
            userId: decoded.userId.toString(),
            firstName: userData.firstName || 'Usuario',
            lastName: userData.lastName || 'Sin Apellido',
            email: userData.email,
            phone: null,
            avatar: null,
            bio: '',
            preferences: {
              notifications: {
                email: true,
                push: true,
                sms: false,
                marketing: false,
                parkingAlerts: true,
                systemUpdates: true
              },
              language: 'es',
              timezone: 'America/Mexico_City',
              dateFormat: 'DD/MM/YYYY',
              theme: 'light'
            },
            updatedAt: new Date().toISOString()
          };

          db.get('profiles').push(newProfile).write();
          userProfile = newProfile;
        } else {
          return res.status(404).json({
            error: 'Usuario no encontrado',
            message: 'No se pudo encontrar la información del usuario'
          });
        }
      }

      return res.status(200).json(userProfile);
    }

    // PUT /profiles - Solo actualizar perfil del usuario autenticado
    if (req.method === 'PUT' && req.path === '/profiles') {
      const updateData = req.body;
      const db = req.app.db;

      // Buscar y actualizar el perfil
      let updatedProfile = db.get('profiles')
        .find(profile =>
          profile.userId === decoded.userId ||
          profile.userId === decoded.userId.toString() ||
          profile.id === decoded.userId ||
          profile.id === decoded.userId.toString()
        )
        .assign({
          ...updateData,
          updatedAt: new Date().toISOString()
        })
        .write();

      if (!updatedProfile) {
        return res.status(404).json({
          error: 'Perfil no encontrado',
          message: 'No se pudo encontrar el perfil del usuario'
        });
      }

      return res.status(200).json(updatedProfile);
    }

    // GET /sessions - Solo sesiones del usuario autenticado
    if (req.method === 'GET' && req.path === '/sessions') {
      const db = req.app.db;
      const userSessions = db.get('sessions')
        .filter(session => session.userId === decoded.userId)
        .value();

      return res.status(200).json(userSessions);
    }

    // GET /locations/:id - Solo ubicaciones de parkings del usuario
    if (req.method === 'GET' && req.path.startsWith('/locations/')) {
      const profileId = req.path.split('/')[2];
      const db = req.app.db;

      // Verificar que el parking pertenezca al usuario
      const parking = db.get('parkingProfiles').find({ id: profileId }).value();
      if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para ver esta ubicación'
        });
      }

      const location = db.get('locations').find({ profileId: profileId }).value();
      return res.status(200).json(location || {});
    }

    // GET /pricing/:id - Solo precios de parkings del usuario
    if (req.method === 'GET' && req.path.startsWith('/pricing/')) {
      const profileId = req.path.split('/')[2];
      const db = req.app.db;

      // Verificar que el parking pertenezca al usuario
      const parking = db.get('parkingProfiles').find({ id: profileId }).value();
      if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para ver estos precios'
        });
      }

      const pricing = db.get('pricing').find({ profileId: profileId }).value();
      return res.status(200).json(pricing || {});
    }

    // GET /features/:id - Solo características de parkings del usuario
    if (req.method === 'GET' && req.path.startsWith('/features/')) {
      const profileId = req.path.split('/')[2];
      const db = req.app.db;

      // Verificar que el parking pertenezca al usuario
      const parking = db.get('parkingProfiles').find({ id: profileId }).value();
      if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para ver estas características'
        });
      }

      const features = db.get('features').find({ profileId: profileId }).value();
      return res.status(200).json(features || {});
    }
  }

  next();
};
