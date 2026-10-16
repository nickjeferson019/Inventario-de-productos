const { Router } = require('express');
const {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
} = require('../controllers/productos.controller');

const router = Router();

router.get('/', getProductos);          // R - todos
router.get('/:id', getProducto);        // R - uno
router.post('/', createProducto);       // C
router.put('/:id', updateProducto);     // U
router.delete('/:id', deleteProducto);  // D

module.exports = router;