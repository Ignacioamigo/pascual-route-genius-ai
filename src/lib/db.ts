import 'dotenv/config';
import { Client } from 'pg';

const connectionString = process.env.SUPABASE_DB_URL as string;

let isConnected = false;
export const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
}

export async function getClients() {
  try {
    await connectDB();
    const res = await client.query('SELECT * FROM client_summary LIMIT 10');
    return res.rows;
  } catch (err) {
    console.error("Error real en getClients:", err);
    throw err;
  }
}

export async function getClientById(clientId: string) {
  // Cliente inventado para prueba
  return {
    client_id: '123',
    city: 'CiudadEjemplo',
    channel: 'Test',
    promotor_id: '999999999',
    total_orders: 42,
    total_volume: 1234.56,
    total_income: 7890.12,
    median_ticket_year: 99.99,
    total_promotor_visits: 10,
    total_promotor_calls: 5,
    client_frequency: 3
  };
}

// Función de prueba para verificar la conexión
if (require.main === module) {
  getClients().then((clients) => {
    console.log('Clientes:', clients);
    process.exit(0);
  }).catch((err) => {
    console.error('Error al conectar o consultar:', err);
    process.exit(1);
  });
} 