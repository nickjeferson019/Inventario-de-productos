const { Pool, types } = require('pg');
require('dotenv').config();
 
// PostgreSQL devuelve los NUMERIC como texto ("180000.00").
// Con esto los convertimos a número automáticamente.
types.setTypeParser(1700, (valor) => parseFloat(valor));
 
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
 
module.exports = pool;