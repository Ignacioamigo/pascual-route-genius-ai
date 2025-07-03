// Eliminar la importación global de 'pg'

import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function getClients() {
  try {
    const res = await db.query('SELECT * FROM client_summary LIMIT 10');
    return res.rows;
  } catch (err) {
    console.error("Error real en getClients:", err);
    throw err;
  }
}

export async function getClientById(clientId) {
  try {
    const res = await db.query('SELECT * FROM client_summary WHERE client_id = $1 LIMIT 1', [clientId]);
    if (res.rows.length > 0) {
      return res.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error real en getClientById:', err);
    throw err;
  }
}

// --- INICIO BLOQUE COMPATIBLE CON NODE ---
if (require.main === module) {
  // Solo cargar dotenv y pg con require si se ejecuta directamente
  require('dotenv').config();
  const { Client } = require('pg');
  const connectionString = process.env.SUPABASE_DB_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  client.connect()
    .then(() => client.query('SELECT * FROM client_summary LIMIT 10'))
    .then((res) => {
      console.log('Clientes:', res.rows);
      return client.end();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error al conectar o consultar:', err);
      process.exit(1);
    });
}
// --- FIN BLOQUE COMPATIBLE CON NODE --- 