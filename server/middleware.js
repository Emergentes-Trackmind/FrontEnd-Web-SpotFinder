const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción esto debería ser una variable de entorno)
const JWT_SECRET = 'spotfinder_secret_key_2024';

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
    return decoded;
  } catch (error) {
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

  // GET /analytics/totals - Dashboard KPIs generales del usuario autenticado
  if (req.method === 'GET' && req.path === '/analytics/totals') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;

    // Obtener parkings del usuario
    const userParkings = db.get('parkingProfiles')
      .filter(p => p.ownerId === decoded.userId || p.ownerId === decoded.userId.toString())
      .value();

    // Calcular KPIs basados en los parkings del usuario
    const totalParkings = userParkings.length;
    const totalCapacity = userParkings.reduce((sum, p) => sum + (p.capacity || 0), 0);
    const totalOccupied = userParkings.reduce((sum, p) => sum + ((p.capacity || 0) - (p.availableSpaces || 0)), 0);
    const occupancyPercentage = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    // Simular ingresos basados en los parkings (precio promedio * ocupación)
    const estimatedRevenue = userParkings.reduce((sum, p) => {
      const occupied = (p.capacity || 0) - (p.availableSpaces || 0);
      return sum + (occupied * (p.pricePerHour || 0) * 8); // 8 horas promedio
    }, 0);

    const totalsKpi = {
      totalRevenue: {
        value: Math.round(estimatedRevenue),
        currency: '$',
        deltaPercentage: 12.5,
        deltaText: '+12.5% vs mes anterior'
      },
      occupiedSpaces: {
        occupied: totalOccupied,
        total: totalCapacity,
        percentage: occupancyPercentage
      },
      activeUsers: {
        count: totalOccupied > 0 ? Math.round(totalOccupied * 0.8) : 0,
        deltaPercentage: 8.3,
        deltaText: '+8.3% este mes'
      },
      registeredParkings: {
        total: totalParkings,
        newThisMonth: totalParkings > 0 ? Math.min(2, totalParkings) : 0,
        deltaText: `+${totalParkings > 0 ? Math.min(2, totalParkings) : 0} este mes`
      }
    };

    return res.status(200).json(totalsKpi);
  }

  // GET /analytics/revenue - Datos de ingresos por mes
  if (req.method === 'GET' && req.path === '/analytics/revenue') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;
    const userParkings = db.get('parkingProfiles')
      .filter(p => p.ownerId === decoded.userId || p.ownerId === decoded.userId.toString())
      .value();

    // Calcular ingresos estimados basados en parkings del usuario
    const baseRevenue = userParkings.reduce((sum, p) => sum + (p.pricePerHour || 0) * 50, 0);

    const revenueData = [
      { month: 'Ene', revenue: Math.round(baseRevenue * 0.7), currency: '$' },
      { month: 'Feb', revenue: Math.round(baseRevenue * 0.75), currency: '$' },
      { month: 'Mar', revenue: Math.round(baseRevenue * 0.8), currency: '$' },
      { month: 'Abr', revenue: Math.round(baseRevenue * 0.85), currency: '$' },
      { month: 'May', revenue: Math.round(baseRevenue * 0.95), currency: '$' },
      { month: 'Jun', revenue: Math.round(baseRevenue), currency: '$' }
    ];

    return res.status(200).json(revenueData);
  }

  // GET /analytics/occupancy - Datos de ocupación por hora
  if (req.method === 'GET' && req.path === '/analytics/occupancy') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;
    const userParkings = db.get('parkingProfiles')
      .filter(p => p.ownerId === decoded.userId || p.ownerId === decoded.userId.toString())
      .value();

    const totalCapacity = userParkings.reduce((sum, p) => sum + (p.capacity || 0), 0);

    const occupancyData = [
      { hour: 6, percentage: 25, occupied: Math.round(totalCapacity * 0.25), total: totalCapacity },
      { hour: 8, percentage: 65, occupied: Math.round(totalCapacity * 0.65), total: totalCapacity },
      { hour: 10, percentage: 85, occupied: Math.round(totalCapacity * 0.85), total: totalCapacity },
      { hour: 12, percentage: 92, occupied: Math.round(totalCapacity * 0.92), total: totalCapacity },
      { hour: 14, percentage: 88, occupied: Math.round(totalCapacity * 0.88), total: totalCapacity },
      { hour: 16, percentage: 95, occupied: Math.round(totalCapacity * 0.95), total: totalCapacity },
      { hour: 18, percentage: 78, occupied: Math.round(totalCapacity * 0.78), total: totalCapacity },
      { hour: 20, percentage: 45, occupied: Math.round(totalCapacity * 0.45), total: totalCapacity }
    ];

    return res.status(200).json(occupancyData);
  }

  // GET /analytics/activity - Actividad reciente
  if (req.method === 'GET' && req.path === '/analytics/activity') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;
    const userParkings = db.get('parkingProfiles')
      .filter(p => p.ownerId === decoded.userId || p.ownerId === decoded.userId.toString())
      .value();

    const activityData = [];

    if (userParkings.length > 0) {
      const newestParking = userParkings.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )[0];

      activityData.push({
        id: '1',
        type: 'parking_created',
        title: 'Parking registrado',
        description: `${newestParking.name} agregado al sistema`,
        timestamp: newestParking.createdAt || new Date().toISOString(),
        userName: decoded.email || 'Usuario',
        status: 'created',
        createdAt: newestParking.createdAt || new Date().toISOString(),
        relatedEntity: {
          id: newestParking.id,
          name: newestParking.name,
          type: 'parking'
        }
      });

      if (userParkings.length > 0) {
        activityData.push({
          id: '2',
          type: 'reservation_confirmed',
          title: 'Nueva reserva confirmada',
          description: `Reserva en ${userParkings[0].name}`,
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          userName: 'Cliente Demo',
          status: 'confirmed',
          createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
          relatedEntity: {
            id: userParkings[0].id,
            name: userParkings[0].name,
            type: 'parking'
          }
        });
      }
    } else {
      activityData.push({
        id: '1',
        type: 'welcome',
        title: 'Bienvenido a SpotFinder',
        description: 'Crea tu primer parking para empezar',
        timestamp: new Date().toISOString(),
        userName: decoded.email || 'Usuario',
        status: 'pending',
        createdAt: new Date().toISOString(),
        relatedEntity: {
          id: '0',
          name: 'Sistema',
          type: 'system'
        }
      });
    }

    return res.status(200).json(activityData);
  }

  // GET /analytics/top-parkings
  if (req.method === 'GET' && req.path === '/analytics/top-parkings') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;
    const userParkings = db.get('parkingProfiles')
      .filter(p => p.ownerId === decoded.userId || p.ownerId === decoded.userId.toString())
      .value();

    const topParkingsData = userParkings.slice(0, 5).map((parking, index) => {
      const occupancy = parking.capacity > 0
        ? Math.round(((parking.capacity - (parking.availableSpaces || 0)) / parking.capacity) * 100)
        : 0;

      return {
        id: parking.id,
        name: parking.name,
        occupancyPercentage: occupancy,
        rating: 4.5 - (index * 0.1),
        monthlyRevenue: Math.round((parking.pricePerHour || 0) * 200 * (1 - index * 0.1)),
        currency: '$',
        address: parking.address || 'Dirección no especificada',
        status: 'active'
      };
    });

    return res.status(200).json(topParkingsData);
  }

  // GET /profile - Obtener perfil del usuario autenticado
  if (req.method === 'GET' && req.path === '/profile') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;
    const userId = decoded.userId || decoded.sub;

    let profile = db.get('profiles').find({ userId: userId.toString() }).value();

    if (!profile) {
      const user = db.get('users').find({ id: userId.toString() }).value();

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'No se encontró el usuario autenticado'
        });
      }

      profile = {
        id: user.id,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
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

      db.get('profiles').push(profile).write();
    }

    return res.status(200).json(profile);
  }

  // PUT /profile - Actualizar perfil del usuario autenticado
  if (req.method === 'PUT' && req.path === '/profile') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;
    const userId = decoded.userId || decoded.sub;
    const updateData = req.body;

    const existingProfile = db.get('profiles').find({ userId: userId.toString() }).value();

    if (!existingProfile) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No se encontró el perfil del usuario'
      });
    }

    const updatedProfile = {
      ...existingProfile,
      firstName: updateData.firstName || existingProfile.firstName,
      lastName: updateData.lastName || existingProfile.lastName,
      phone: updateData.phone !== undefined ? updateData.phone : existingProfile.phone,
      avatar: updateData.avatar !== undefined ? updateData.avatar : existingProfile.avatar,
      bio: updateData.bio !== undefined ? updateData.bio : existingProfile.bio,
      preferences: updateData.preferences || existingProfile.preferences,
      updatedAt: new Date().toISOString()
    };

    db.get('profiles')
      .find({ userId: userId.toString() })
      .assign(updatedProfile)
      .write();

    return res.status(200).json(updatedProfile);
  }

  // POST /parkingProfiles - Crear nuevo parking
  if (req.method === 'POST' && req.path === '/parkingProfiles') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;
    const parkingData = req.body;

    const newParking = {
      id: Date.now().toString(),
      ...parkingData,
      ownerId: decoded.userId.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      availableSpaces: parkingData.capacity || 0
    };

    db.get('parkingProfiles').push(newParking).write();

    return res.status(201).json(newParking);
  }

  // GET /parkingProfiles - Obtener parkings del usuario
  if (req.method === 'GET' && req.path === '/parkingProfiles') {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const db = req.app.db;
    const userParkings = db.get('parkingProfiles')
      .filter(p => p.ownerId === decoded.userId || p.ownerId === decoded.userId.toString())
      .value();

    return res.status(200).json(userParkings);
  }

  // PUT /parkingProfiles/:id - Actualizar parking
  if (req.method === 'PUT' && req.path.startsWith('/parkingProfiles/')) {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const parkingId = req.path.split('/')[2];
    const db = req.app.db;
    const updateData = req.body;

    const parking = db.get('parkingProfiles').find({ id: parkingId }).value();

    if (!parking) {
      return res.status(404).json({
        error: 'Parking no encontrado'
      });
    }

    if (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString()) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para actualizar este parking'
      });
    }

    const updatedParking = {
      ...parking,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    db.get('parkingProfiles')
      .find({ id: parkingId })
      .assign(updatedParking)
      .write();

    return res.status(200).json(updatedParking);
  }

  // DELETE /parkingProfiles/:id - Eliminar parking
  if (req.method === 'DELETE' && req.path.startsWith('/parkingProfiles/')) {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación no es válido o ha expirado'
      });
    }

    const parkingId = req.path.split('/')[2];
    const db = req.app.db;

    const parking = db.get('parkingProfiles').find({ id: parkingId }).value();

    if (!parking) {
      return res.status(404).json({
        error: 'Parking no encontrado'
      });
    }

    if (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString()) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para eliminar este parking'
      });
    }

    db.get('parkingProfiles').remove({ id: parkingId }).write();

    return res.status(204).send();
  }

  next();
};
