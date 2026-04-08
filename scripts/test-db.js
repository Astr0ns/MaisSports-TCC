require('dotenv').config();
const pool = require('../config/pool_conexoes');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    console.log('Conexão OK. Resultado:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Erro de conexão/consulta:', err);
    process.exit(1);
  }
})();
