// El controlador tiene la lógica: recibe la petición, habla con la BD y responde.
const pool = require('../db');
 
// ---------- Validación sencilla de los datos que llegan ----------
function validarProducto(body) {
  const errores = [];
  const { nombre, precio, stock } = body;
 
  if (!nombre || String(nombre).trim() === '') {
    errores.push('El nombre es obligatorio');
  }
  if (precio === undefined || precio === null || precio === '' || isNaN(precio) || Number(precio) < 0) {
    errores.push('El precio debe ser un número mayor o igual a 0');
  }
  if (stock !== undefined && stock !== null && stock !== '' &&
      (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
    errores.push('El stock debe ser un número entero mayor o igual a 0');
  }
  return errores;
}
 
// Convierte el :id de la URL a número y revisa que sea válido
function obtenerId(req) {
  const id = parseInt(req.params.id, 10);
  return isNaN(id) ? null : id;
}
 
// ---------- R: Leer todos ----------
// GET /api/productos
async function getProductos(req, res) {
  const resultado = await pool.query('SELECT * FROM productos ORDER BY id DESC');
  res.json(resultado.rows);
}
 
// ---------- R: Leer uno ----------
// GET /api/productos/:id
async function getProducto(req, res) {
  const id = obtenerId(req);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un número' });
 
  const resultado = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(resultado.rows[0]);
}
 
// ---------- C: Crear ----------
// POST /api/productos
async function createProducto(req, res) {
  const errores = validarProducto(req.body);
  if (errores.length > 0) return res.status(400).json({ errores });
 
  const { nombre, descripcion, precio, stock } = req.body;
 
  // $1, $2... son parámetros: evitan la inyección SQL. ¡Nunca concatenes texto en un query!
  const resultado = await pool.query(
    `INSERT INTO productos (nombre, descripcion, precio, stock)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [String(nombre).trim(), descripcion || null, Number(precio), Number(stock ?? 0)]
  );
  res.status(201).json(resultado.rows[0]); // 201 = Created
}
 
// ---------- U: Actualizar ----------
// PUT /api/productos/:id
async function updateProducto(req, res) {
  const id = obtenerId(req);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un número' });
 
  const errores = validarProducto(req.body);
  if (errores.length > 0) return res.status(400).json({ errores });
 
  const { nombre, descripcion, precio, stock } = req.body;
  const resultado = await pool.query(
    `UPDATE productos
     SET nombre = $1, descripcion = $2, precio = $3, stock = $4
     WHERE id = $5
     RETURNING *`,
    [String(nombre).trim(), descripcion || null, Number(precio), Number(stock ?? 0), id]
  );
 
  if (resultado.rows.length === 0) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(resultado.rows[0]);
}
 
// ---------- D: Eliminar ----------
// DELETE /api/productos/:id
async function deleteProducto(req, res) {
  const id = obtenerId(req);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un número' });
 
  const resultado = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json({ mensaje: 'Producto eliminado', producto: resultado.rows[0] });
}
 
module.exports = {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
}; 