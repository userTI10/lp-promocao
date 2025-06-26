const sql = require('mssql')

const config = {
  user: 'rubens.pereira',
  password: 'Touti#2025',
  server: '191.234.202.14', // ou IP]
  port:14333,
  database: 'promocao_amostra',
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
