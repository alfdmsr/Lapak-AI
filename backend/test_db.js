require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    await client.connect();
    const res = await client.query('SELECT PostGIS_full_version();');
    console.log('✅ Berhasil connect ke PostGIS!');
    console.log('Versi PostGIS:', res.rows[0].postgis_full_version);
  } catch (err) {
    console.error('❌ Gagal connect:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
