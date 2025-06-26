// check-horario.ts
import { NextResponse } from 'next/server';
import { getData } from '../conn/neon';

export async function GET() {
  let client;

  try {
    client = await getData();

    const result = await client.query(`
      SELECT escolhahorario, COUNT(*) as total 
      FROM promocao 
      GROUP BY escolhahorario 
      HAVING COUNT(*) >= 2
    `);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum horário encontrado',
        horariosOcupados: {},
        horariosDesabilitados: []
      });
    }

    const horariosOcupados = {};
    result.rows.forEach(row => {
      horariosOcupados[row.escolhahorario] = parseInt(row.total);
    });

    return NextResponse.json({
      success: true,
      horariosOcupados,
      horariosDesabilitados: result.rows.map(row => row.escolhahorario)
    });

  } catch (error) {
    console.error('Erro na verificação dos horários:', error);
    return NextResponse.json({
      success: false,
      error: `Erro ao verificar horários: ${error.message}`
    }, { status: 500 });

  }
  
}
