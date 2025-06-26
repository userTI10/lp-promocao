"use server";
const sql = require('mssql')

const config = {
  user: process.env.dbuser,
  password: process.env.dbpass,
  server: process.env.dbserver, 
  port:process.env.dbport,
  database: process.env.dbbase,
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
