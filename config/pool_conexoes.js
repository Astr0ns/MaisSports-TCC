require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Testa a conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar ao Supabase:', err.message);
  } else {
    console.log('✅ Conectado ao Supabase (PostgreSQL) com sucesso!');
    release();
  }
});

module.exports = pool;
