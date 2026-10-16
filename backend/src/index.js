// Punto de entrada del servidor

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const productosRoutes = require('./routes/productos.routes');

const app = express();

// ---------- Middlewares ----------
app.use(
  cors({
    origin: 'http://localhost:4200',
  })
);

app.use(express.json());

// ---------- Rutas ----------
app.get('/', (req, res) => {
  res.json({ mensaje: 'API CRUD funcionando' });
});

app.use('/api/productos', productosRoutes);

// ---------- Ruta no encontrada ----------
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  });
});

// ---------- Manejador de errores ----------
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(500).json({
    error: 'Error interno del servidor',
  });
});

// ---------- Arrancar servidor ----------
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  try {
    await pool.query('SELECT 1');
    console.log('Conectado a PostgreSQL ✅');
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL ❌:', error.message);
  }
});