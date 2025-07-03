require('dotenv').config();

console.log('SUPABASE_DB_HOST =>', process.env.SUPABASE_DB_HOST);
console.log('SUPABASE_DB_PORT =>', process.env.SUPABASE_DB_PORT);
console.log('SUPABASE_DB_USER =>', process.env.SUPABASE_DB_USER);
console.log('SUPABASE_DB_PASSWORD =>', process.env.SUPABASE_DB_PASSWORD ? '***' : undefined);
console.log('SUPABASE_DB_NAME =>', process.env.SUPABASE_DB_NAME);

const { Client } = require('pg');

const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: process.env.SUPABASE_DB_PORT || 5432,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
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