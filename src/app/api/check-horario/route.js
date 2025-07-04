// app/api/check-horario/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../conn/dbsever'; // ajuste o caminho conforme seu projeto

export async function GET() {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT escolhahorario, COUNT(*) as total
      FROM promocao
      GROUP BY escolhahorario
      HAVING COUNT(*) >= 50
    `);

    const rows = result.recordset;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum horário encontrado',
        horariosOcupados: {},
        horariosDesabilitados: []
      });
    }

    const horariosOcupados = {};
    rows.forEach(row => {
      horariosOcupados[row.escolhahorario] = parseInt(row.total);
    });

    return NextResponse.json({
      success: true,
      horariosOcupados,
      horariosDesabilitados: rows.map(row => row.escolhahorario)
    });

  } catch (error) {
    console.error('Erro na verificação dos horários:', error);
    return NextResponse.json({
      success: false,
      error: `Erro ao verificar horários: ${error.message}`
    }, { status: 500 });
  }
}
