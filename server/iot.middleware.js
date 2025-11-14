/**
 * Middleware para endpoints IoT
 * Maneja CRUD de dispositivos, telemetría, KPIs y operaciones especiales
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'spotfinder_secret_key_2024';

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = (req, res, next) => {
  const db = req.app.db;

  // GET /api/iot/devices/kpis O /iot/devices/kpis - KPIs de dispositivos IoT
  if (req.method === 'GET' && (req.path === '/api/iot/devices/kpis' || req.path === '/iot/devices/kpis')) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Obtener parkings del usuario
    const userParkings = db.get('parkingProfiles')
      .filter(p => p.ownerId === decoded.userId || p.ownerId === decoded.userId.toString())
      .value();

    const parkingIds = userParkings.map(p => p.id);

    // 🔧 SOLUCIÓN: Obtener dispositivos que pertenecen al usuario (propios + en parkings)
    const userDevices = db.get('iotDevices')
      .filter(d => {
        const belongsToUser = d.ownerId === decoded.userId || d.ownerId === decoded.userId.toString();
        const belongsToUserParking = d.parkingId && parkingIds.includes(d.parkingId);
        return belongsToUser || belongsToUserParking;
      })
      .value();

    const totalDevices = userDevices.length;
    const onlineDevices = userDevices.filter(d => d.status === 'online').length;
    const offlineDevices = userDevices.filter(d => d.status === 'offline').length;
    const maintenanceDevices = userDevices.filter(d => d.status === 'maintenance').length;

    const averageBattery = totalDevices > 0
      ? Math.round(userDevices.reduce((sum, d) => sum + d.battery, 0) / totalDevices)
      : 0;

    const criticalBatteryCount = userDevices.filter(d => d.battery < 15).length;
    const lowBatteryCount = userDevices.filter(d => d.battery >= 15 && d.battery < 30).length;

    const kpis = {
      totalDevices,
      onlineDevices,
      offlineDevices,
      maintenanceDevices,
      averageBattery,
      criticalBatteryCount,
      lowBatteryCount
    };

    // Deshabilitar caché
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return res.status(200).json(kpis);
  }

  // GET /api/iot/devices O /iot/devices - Listar dispositivos con filtros
  if (req.method === 'GET' && (req.path === '/api/iot/devices' || req.path === '/iot/devices')) {
    console.log('🔵 [IOT] GET', req.path, 'interceptado por middleware personalizado');

    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Obtener parkings del usuario
    const userParkings = db.get('parkingProfiles')
      .filter(p => p.ownerId === decoded.userId || p.ownerId === decoded.userId.toString())
      .value();

    const parkingIds = userParkings.map(p => p.id);

    // Filtros de query params
    const { type, status, parking_id, q, page = 1, size = 10 } = req.query;

    // 🔧 SOLUCIÓN: Incluir dispositivos que pertenecen al usuario directamente O tienen un parkingId del usuario
    let devices = db.get('iotDevices')
      .filter(d => {
        // Dispositivo pertenece al usuario directamente (por ownerId)
        const belongsToUser = d.ownerId === decoded.userId || d.ownerId === decoded.userId.toString();
        // O el dispositivo está en un parking del usuario
        const belongsToUserParking = d.parkingId && parkingIds.includes(d.parkingId);

        return belongsToUser || belongsToUserParking;
      })
      .value();

    console.log(`📊 [IOT] Usuario ${decoded.userId} tiene ${devices.length} dispositivos (propios + en parkings)`);

    // Aplicar filtros
    if (type && type !== 'all') {
      devices = devices.filter(d => d.type === type);
    }

    if (status && status !== 'all') {
      devices = devices.filter(d => d.status === status);
    }

    if (parking_id && parking_id !== 'all') {
      devices = devices.filter(d => d.parkingId === parking_id);
    }

    if (q) {
      const query = q.toLowerCase();
      devices = devices.filter(d => {
        const model = (d.model || d.name || '').toLowerCase();
        const serial = (d.serialNumber || '').toLowerCase();
        return model.includes(query) || serial.includes(query);
      });
    }

    // Enriquecer con datos relacionados y normalizar campos
    devices = devices.map(device => {
      const parking = userParkings.find(p => p.id === device.parkingId);
      const spot = device.parkingSpotId
        ? db.get('parkingSpots').find({ id: device.parkingSpotId }).value()
        : null;

      return {
        ...device,
        // 🔧 Normalizar: Si tiene 'name' pero no 'model', copiar name a model
        model: device.model || device.name || 'Sin modelo',
        // Agregar parkingName siempre (incluso si es null)
        parkingName: parking?.name || 'Sin asignar',
        parkingSpotLabel: spot?.label || null,
        // Normalizar lastCheckIn a lastCheckIn
        lastCheckIn: device.lastCheckIn || device.lastSeen || new Date().toISOString()
      };
    });

    // Paginación
    const total = devices.length;
    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    const totalPages = Math.ceil(total / pageSize);
    const start = (pageNum - 1) * pageSize;
    const paginatedDevices = devices.slice(start, start + pageSize);

    const response = {
      data: paginatedDevices,
      total,
      page: pageNum,
      size: pageSize,
      totalPages
    };

    console.log('✅ [IOT] Respuesta GET /api/iot/devices:', {
      total: response.total,
      dataLength: response.data?.length,
      page: response.page
    });

    // 🔧 SOLUCIÓN: Deshabilitar caché para asegurar que se devuelve la respuesta completa
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return res.status(200).json(response);
  }

  // GET /api/iot/devices/:id O /iot/devices/:id - Obtener dispositivo por ID
  if (req.method === 'GET' && (req.path.match(/^\/api\/iot\/devices\/[^/]+$/) || req.path.match(/^\/iot\/devices\/[^/]+$/))) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const deviceId = req.path.split('/')[4];
    const device = db.get('iotDevices').find({ id: deviceId }).value();

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // 🔧 SOLUCIÓN: Verificar permisos por ownerId O por parkingId
    const deviceBelongsToUser = device.ownerId === decoded.userId || device.ownerId === decoded.userId.toString();

    let hasPermission = deviceBelongsToUser;

    // Si no es dueño directo, verificar si tiene acceso por parking
    if (!hasPermission && device.parkingId) {
      const parking = db.get('parkingProfiles').find({ id: device.parkingId }).value();
      hasPermission = parking && (parking.ownerId === decoded.userId || parking.ownerId === decoded.userId.toString());
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Enriquecer con datos relacionados
    const parking = device.parkingId ? db.get('parkingProfiles').find({ id: device.parkingId }).value() : null;
    const spot = device.parkingSpotId
      ? db.get('parkingSpots').find({ id: device.parkingSpotId }).value()
      : null;

    const enrichedDevice = {
      ...device,
      parkingName: parking?.name || 'Sin asignar',
      parkingSpotLabel: spot?.label || null
    };

    return res.status(200).json(enrichedDevice);
  }

  // POST /api/iot/devices O /iot/devices - Crear dispositivo
  if (req.method === 'POST' && (req.path === '/api/iot/devices' || req.path === '/iot/devices')) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { serialNumber, model, type, parkingId, parkingSpotId, status = 'offline' } = req.body;

    // 🔧 SOLUCIÓN: parkingId ahora es opcional - se puede crear dispositivo sin parking asignado
    // Validaciones básicas
    if (!serialNumber || !model || !type) {
      return res.status(400).json({ error: 'Campos requeridos: serialNumber, model, type' });
    }

    // Verificar que el serial sea único
    const existingDevice = db.get('iotDevices').find({ serialNumber }).value();
    if (existingDevice) {
      return res.status(409).json({ error: 'Serial number ya existe' });
    }

    // Si se proporciona parkingId, verificar que pertenezca al usuario
    if (parkingId) {
      const parking = db.get('parkingProfiles').find({ id: parkingId }).value();
      if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
        return res.status(403).json({ error: 'Parking no pertenece al usuario' });
      }

      // Si hay parkingSpotId, verificar que pertenezca al mismo parking
      if (parkingSpotId) {
        const spot = db.get('parkingSpots').find({ id: parkingSpotId }).value();
        if (!spot || spot.parkingId !== parkingId) {
          return res.status(400).json({ error: 'Parking spot no pertenece al parking especificado' });
        }
      }
    }

    // Crear dispositivo con ownerId para rastrear el propietario
    const newDevice = {
      id: `dev-${Date.now()}`,
      ownerId: decoded.userId, // 🔧 CRÍTICO: Agregar ownerId para rastrear propietario
      parkingId: parkingId || null, // Puede ser null si no está asignado a parking
      parkingSpotId: parkingSpotId || null,
      serialNumber,
      model,
      type,
      status,
      battery: 100,
      lastCheckIn: new Date().toISOString(),
      deviceToken: `token_${serialNumber}_${Date.now()}`,
      mqttTopic: parkingId ? `iot/${parkingId}/${serialNumber}/telemetry` : `iot/${decoded.userId}/${serialNumber}/telemetry`,
      webhookEndpoint: `http://localhost:3001/api/iot/devices/${serialNumber}/telemetry`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.get('iotDevices').push(newDevice).write();

    console.log(`✅ [IOT] Dispositivo creado para usuario ${decoded.userId}:`, newDevice.id);
    return res.status(201).json(newDevice);
  }

  // PUT /api/iot/devices/:id O /iot/devices/:id - Actualizar dispositivo
  if (req.method === 'PUT' && (req.path.match(/^\/api\/iot\/devices\/[^/]+$/) || req.path.match(/^\/iot\/devices\/[^/]+$/))) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const deviceId = req.path.split('/')[4];
    const device = db.get('iotDevices').find({ id: deviceId }).value();

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // 🔧 SOLUCIÓN: Verificar permisos por ownerId O por parkingId
    const deviceBelongsToUser = device.ownerId === decoded.userId || device.ownerId === decoded.userId.toString();

    let hasPermission = deviceBelongsToUser;

    if (!hasPermission && device.parkingId) {
      const parking = db.get('parkingProfiles').find({ id: device.parkingId }).value();
      hasPermission = parking && (parking.ownerId === decoded.userId || parking.ownerId === decoded.userId.toString());
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { model, type, parkingSpotId, status } = req.body;

    // Si cambia parkingSpotId, validar
    if (parkingSpotId !== undefined && parkingSpotId !== null) {
      const spot = db.get('parkingSpots').find({ id: parkingSpotId }).value();
      if (!spot || spot.parkingId !== device.parkingId) {
        return res.status(400).json({ error: 'Parking spot no válido' });
      }
    }

    const updatedDevice = {
      ...device,
      model: model !== undefined ? model : device.model,
      type: type !== undefined ? type : device.type,
      parkingSpotId: parkingSpotId !== undefined ? parkingSpotId : device.parkingSpotId,
      status: status !== undefined ? status : device.status,
      updatedAt: new Date().toISOString()
    };

    db.get('iotDevices').find({ id: deviceId }).assign(updatedDevice).write();

    return res.status(200).json(updatedDevice);
  }

  // DELETE /api/iot/devices/:id O /iot/devices/:id - Eliminar dispositivo
  if (req.method === 'DELETE' && (req.path.match(/^\/api\/iot\/devices\/[^/]+$/) || req.path.match(/^\/iot\/devices\/[^/]+$/))) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const deviceId = req.path.split('/')[4];
    const device = db.get('iotDevices').find({ id: deviceId }).value();

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // 🔧 SOLUCIÓN: Verificar permisos por ownerId O por parkingId
    const deviceBelongsToUser = device.ownerId === decoded.userId || device.ownerId === decoded.userId.toString();

    let hasPermission = deviceBelongsToUser;

    if (!hasPermission && device.parkingId) {
      const parking = db.get('parkingProfiles').find({ id: device.parkingId }).value();
      hasPermission = parking && (parking.ownerId === decoded.userId || parking.ownerId === decoded.userId.toString());
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    db.get('iotDevices').remove({ id: deviceId }).write();

    console.log(`✅ [IOT] Dispositivo eliminado: ${deviceId}`);
    return res.status(204).send();
  }

  // POST /api/iot/devices/:id/maintenance - Poner en mantenimiento
  if (req.method === 'POST' && req.path.match(/^\/api\/iot\/devices\/[^/]+\/maintenance$/)) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const deviceId = req.path.split('/')[4];
    const device = db.get('iotDevices').find({ id: deviceId }).value();

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // Verificar permisos
    const parking = db.get('parkingProfiles').find({ id: device.parkingId }).value();
    if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const updatedDevice = {
      ...device,
      status: 'maintenance',
      updatedAt: new Date().toISOString()
    };

    db.get('iotDevices').find({ id: deviceId }).assign(updatedDevice).write();

    return res.status(200).json(updatedDevice);
  }

  // POST /api/iot/devices/:id/restore - Restaurar de mantenimiento
  if (req.method === 'POST' && req.path.match(/^\/api\/iot\/devices\/[^/]+\/restore$/)) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const deviceId = req.path.split('/')[4];
    const device = db.get('iotDevices').find({ id: deviceId }).value();

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // Verificar permisos
    const parking = db.get('parkingProfiles').find({ id: device.parkingId }).value();
    if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const updatedDevice = {
      ...device,
      status: 'online',
      updatedAt: new Date().toISOString()
    };

    db.get('iotDevices').find({ id: deviceId }).assign(updatedDevice).write();

    return res.status(200).json(updatedDevice);
  }

  // POST /api/iot/devices/:serial/telemetry - Recibir telemetría
  if (req.method === 'POST' && req.path.match(/^\/api\/iot\/devices\/[^/]+\/telemetry$/)) {
    const serialNumber = req.path.split('/')[4];
    const { status, battery, checkedAt, occupied } = req.body;

    const device = db.get('iotDevices').find({ serialNumber }).value();

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // Actualizar telemetría
    const updatedDevice = {
      ...device,
      status: status || device.status,
      battery: battery !== undefined ? battery : device.battery,
      lastCheckIn: checkedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.get('iotDevices').find({ serialNumber }).assign(updatedDevice).write();

    // Si es sensor de ocupación y tiene parkingSpotId, actualizar disponibilidad
    if (device.type === 'sensor' && device.parkingSpotId && occupied !== undefined) {
      const spot = db.get('parkingSpots').find({ id: device.parkingSpotId }).value();

      if (spot) {
        const updatedSpot = {
          ...spot,
          available: !occupied,
          updatedAt: new Date().toISOString()
        };

        db.get('parkingSpots').find({ id: device.parkingSpotId }).assign(updatedSpot).write();

        // Recalcular available_spots del parking
        const parkingSpots = db.get('parkingSpots').filter({ parkingId: device.parkingId }).value();
        const availableCount = parkingSpots.filter(s => s.available).length;

        db.get('parkingProfiles')
          .find({ id: device.parkingId })
          .assign({ availableSpaces: availableCount })
          .write();
      }
    }

    return res.status(200).json({ message: 'Telemetría recibida' });
  }

  // POST /api/iot/devices/bulk - Crear múltiples dispositivos
  if (req.method === 'POST' && req.path === '/api/iot/devices/bulk') {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { parkingId, devices } = req.body;

    if (!parkingId || !Array.isArray(devices)) {
      return res.status(400).json({ error: 'parkingId y devices[] requeridos' });
    }

    // Verificar permisos
    const parking = db.get('parkingProfiles').find({ id: parkingId }).value();
    if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
      return res.status(403).json({ error: 'Parking no pertenece al usuario' });
    }

    const created = [];
    const warnings = [];

    devices.forEach(deviceData => {
      const { serialNumber, model, type, spotLabel } = deviceData;

      // Validar serial único
      const existing = db.get('iotDevices').find({ serialNumber }).value();
      if (existing) {
        warnings.push(`Serial ${serialNumber} ya existe, omitido`);
        return;
      }

      // Resolver parkingSpotId por label
      let parkingSpotId = null;
      if (spotLabel) {
        const spot = db.get('parkingSpots')
          .find({ parkingId, label: spotLabel })
          .value();

        if (spot) {
          parkingSpotId = spot.id;
        } else {
          warnings.push(`Spot ${spotLabel} no encontrado para ${serialNumber}`);
        }
      }

      const newDevice = {
        id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parkingId,
        parkingSpotId,
        serialNumber,
        model,
        type,
        status: 'offline',
        battery: 100,
        lastCheckIn: new Date().toISOString(),
        deviceToken: `token_${serialNumber}_${Date.now()}`,
        mqttTopic: `iot/${parkingId}/${serialNumber}/telemetry`,
        webhookEndpoint: `http://localhost:3001/api/iot/devices/${serialNumber}/telemetry`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.get('iotDevices').push(newDevice).write();
      created.push(newDevice);
    });

    return res.status(201).json({ created, warnings });
  }

  // POST /api/iot/devices/:id/token - Generar token de dispositivo
  if (req.method === 'POST' && req.path.match(/^\/api\/iot\/devices\/[^/]+\/token$/)) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const deviceId = req.path.split('/')[4];
    const device = db.get('iotDevices').find({ id: deviceId }).value();

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    // Verificar permisos
    const parking = db.get('parkingProfiles').find({ id: device.parkingId }).value();
    if (!parking || (parking.ownerId !== decoded.userId && parking.ownerId !== decoded.userId.toString())) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const newToken = `token_${device.serialNumber}_${Date.now()}`;
    const mqttTopic = `iot/${device.parkingId}/${device.serialNumber}/telemetry`;
    const webhookEndpoint = `http://localhost:3001/api/iot/devices/${device.serialNumber}/telemetry`;

    db.get('iotDevices')
      .find({ id: deviceId })
      .assign({
        deviceToken: newToken,
        mqttTopic,
        webhookEndpoint,
        updatedAt: new Date().toISOString()
      })
      .write();

    return res.status(200).json({
      token: newToken,
      mqttTopic,
      webhookEndpoint
    });
  }

  next();
};

