"use server";
const sql = require('mssql')

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER, 
  port:process.env.DB_PORT,
  database: process.env.DB_BASE,
  options: {
    encrypt: false, // true se for Azure
    trustServerCertificate: true,
  }
}

async function getConnection() {
  try {
    const pool = await sql.connect(config)
    return pool
  } catch (err) {
    console.error('Erro de conexão:', err)
    throw err
  }
}

module.exports = { getConnection }
