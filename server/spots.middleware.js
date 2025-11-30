
module.exports = (req, res, next) => {
  // Middleware específico para gestión de spots
  console.log(`🔧 SPOTS MIDDLEWARE: ${req.method} ${req.originalUrl || req.url}`);

  // Detectar si es una ruta de spots - usar req.originalUrl que tiene la ruta completa
  const spotsRouteMatch = req.originalUrl && req.originalUrl.match(/^\/api\/parkings\/(\d+)\/spots/);

  if (spotsRouteMatch) {
    console.log(`🎯 Ruta de spots detectada: ${req.originalUrl}`);

    // Extraer parkingId de la URL
    const parkingId = parseInt(spotsRouteMatch[1]);
    console.log(`🆔 Parking ID extraído: ${parkingId}`);

    // Extraer la parte de la ruta después de /spots
    const spotsPath = req.originalUrl.replace(/^\/api\/parkings\/\d+\/spots/, '');
    console.log(`📍 Ruta de spots: '${spotsPath}'`);

    // GET - Listar spots de un parking
    if (req.method === 'GET' && (spotsPath === '' || spotsPath === '/')) {
      console.log(`📋 Obteniendo spots para parking ${parkingId}`);

      // Generar spots mock para el parking
      const mockSpots = generateMockSpots(parkingId);

      console.log(`✅ Enviando ${mockSpots.length} spots como respuesta`);
      return res.status(200).json(mockSpots);
    }

    // POST - Crear spot individual
    if (req.method === 'POST' && (spotsPath === '' || spotsPath === '/')) {
      console.log(`✅ Creando spot para parking ${parkingId}`, req.body);

      const { row, column, label, rowLabel, columnLabel, isAccessible } = req.body;

      if (!row || !column || !label) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: row, column, label'
        });
      }

      const fs = require('fs');
      const path = require('path');

      try {
        const dbPath = path.join(__dirname, 'db.json');
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        if (!dbData.spots) {
          dbData.spots = [];
        }

        const newSpot = {
          id: `spot_${parkingId}_${label}`,
          parkingId: parkingId, // Como number, no string
          rowIndex: row, // Cambiar de row a rowIndex
          columnIndex: column, // Cambiar de column a columnIndex
          label: label,
          status: 'UNASSIGNED', // Usar formato correcto del enum
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Agregar spot a db.json
        dbData.spots.push(newSpot);
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

        console.log(`✅ Spot ${label} guardado en db.json para parking ${parkingId}`);
        return res.status(201).json(newSpot);

      } catch (error) {
        console.error('❌ Error guardando spot:', error);
        return res.status(500).json({ error: 'Error guardando spot' });
      }
    }

    // POST - Crear spots masivamente
    if (req.method === 'POST' && spotsPath === '/bulk') {
      console.log(`📦 Creando spots masivos para parking ${parkingId}`, req.body.length, 'spots');

      const spotsToCreate = req.body;
      const fs = require('fs');
      const path = require('path');

      try {
        const dbPath = path.join(__dirname, 'db.json');
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        if (!dbData.spots) {
          dbData.spots = [];
        }

        const createdSpots = spotsToCreate.map((spot, index) => ({
          id: `spot_${parkingId}_${spot.label}`,
          parkingId: parkingId, // Como number, no string
          rowIndex: spot.row, // Cambiar de row a rowIndex
          columnIndex: spot.column, // Cambiar de column a columnIndex
          label: spot.label,
          status: 'UNASSIGNED', // Usar formato correcto del enum
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        // Agregar spots a db.json
        dbData.spots.push(...createdSpots);
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

        console.log(`✅ ${createdSpots.length} spots guardados en db.json para parking ${parkingId}`);
        return res.status(201).json(createdSpots);

      } catch (error) {
        console.error('❌ Error guardando spots:', error);
        return res.status(500).json({ error: 'Error guardando spots' });
      }
    }

    // PATCH - Actualizar spot
    const spotIdMatch = spotsPath.match(/^\/([^\/]+)$/);
    if (req.method === 'PATCH' && spotIdMatch) {
      const spotId = spotIdMatch[1];
      console.log(`🔄 Actualizando spot ${spotId}`, req.body);

      // Validar que el status sea válido si se proporciona
      const validStatuses = ['UNASSIGNED', 'OCCUPIED', 'MAINTENANCE'];
      if (req.body.status && !validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`
        });
      }

      const updatedSpot = {
        id: spotId,
        parkingId: parkingId,
        rowIndex: Math.floor(Math.random() * 5) + 1, // Mock data
        columnIndex: Math.floor(Math.random() * 3) + 1, // Mock data
        label: `${String.fromCharCode(65 + Math.floor(Math.random() * 3))}${Math.floor(Math.random() * 5) + 1}`,
        status: req.body.status || 'UNASSIGNED',
        deviceId: req.body.deviceId !== undefined ? req.body.deviceId : null,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Mock: creado ayer
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json(updatedSpot);
    }

    // DELETE - Eliminar spot
    if (req.method === 'DELETE' && spotIdMatch) {
      const spotId = spotIdMatch[1];
      console.log(`🗑️ Eliminando spot ${spotId}`);

      return res.status(204).send();
    }
  }

  next();
};

function generateMockSpots(parkingId, count = 12) {
  // Primero, intentar cargar spots reales de db.json si existen
  const fs = require('fs');
  const path = require('path');

  try {
    const dbPath = path.join(__dirname, 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    if (dbData.spots && Array.isArray(dbData.spots)) {
      // Filtrar spots por parkingId
      const existingSpots = dbData.spots.filter(spot =>
        spot.parkingId === parkingId.toString() || spot.parkingId === parkingId
      );

      if (existingSpots.length > 0) {
        console.log(`📋 Encontrados ${existingSpots.length} spots reales para parking ${parkingId}`);
        return existingSpots.map(spot => ({
          id: spot.id,
          parkingId: spot.parkingId,
          rowIndex: spot.row,
          columnIndex: spot.column,
          label: spot.label,
          status: spot.status || 'available',
          deviceId: spot.deviceId || null,
          createdAt: spot.createdAt,
          updatedAt: spot.updatedAt
        }));
      }
    }
  } catch (error) {
    console.log('⚠️ Error leyendo db.json, usando spots mock');
  }

  // Si no hay spots reales, generar mock
  const spots = [];
  const statuses = ['available', 'occupied', 'maintenance'];
  const statusWeights = [0.6, 0.3, 0.1]; // 60% libre, 30% ocupado, 10% mantenimiento

  let currentColumn = 1;
  let currentRow = 1;

  for (let i = 0; i < count; i++) {
    const columnLetter = String.fromCharCode(64 + currentColumn); // A, B, C...
    const label = `${columnLetter}${currentRow}`;

    // Seleccionar status con pesos
    let randomValue = Math.random();
    let selectedStatus = 'available';
    let cumulativeWeight = 0;

    for (let j = 0; j < statuses.length; j++) {
      cumulativeWeight += statusWeights[j];
      if (randomValue <= cumulativeWeight) {
        selectedStatus = statuses[j];
        break;
      }
    }

    spots.push({
      id: `spot_${parkingId}_${label}`,
      parkingId: parkingId,
      rowIndex: currentRow,
      columnIndex: currentColumn,
      label: label,
      status: selectedStatus,
      deviceId: Math.random() > 0.5 ? `sensor-${parkingId}-${i + 1}` : null,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 3600000).toISOString()
    });

    // Implementar regla del 5: máximo 5 filas por columna
    currentRow++;
    if (currentRow > 5) {
      currentRow = 1;
      currentColumn++;
    }
  }

  console.log(`🎯 Generados ${spots.length} spots mock para parking ${parkingId}`);
  console.log(`📊 Distribución: ${spots.filter(s => s.status === 'available').length} libres, ${spots.filter(s => s.status === 'occupied').length} ocupadas, ${spots.filter(s => s.status === 'maintenance').length} mantenimiento`);

  return spots;
}
