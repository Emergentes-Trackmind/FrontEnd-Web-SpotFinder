const express = require('express');
const cors = require('cors');
const spotsMiddleware = require('./server/spots.middleware.js');

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Usar el middleware de spots
app.use(spotsMiddleware);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor de spots funcionando', timestamp: new Date().toISOString() });
});

// Iniciar servidor
const port = 3003;
app.listen(port, () => {
  console.log(`🚀 Servidor de spots funcionando en http://localhost:${port}`);
  console.log(`📋 Prueba: GET http://localhost:${port}/api/parkings/123456/spots`);
});
