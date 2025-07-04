// app/api/verificar-dados/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../conn/dbsever';  // ajuste o caminho conforme seu projeto

export async function POST(request) {
  try {
    const pool = await getConnection();
    const { email, cpf } = await request.json();

    const result = await pool.request()
      .input('email', email)
      .input('cpf', cpf)
      .query(`
        SELECT * FROM promocao
        WHERE email = @email OR cpf = @cpf
      `);

    const rows = result.recordset;

    if (rows.length > 0) {
      const existingUser = rows[0];
      let message = '';

      if (existingUser.email === email && existingUser.cpf === cpf) {
        message = 'Email e CPF já cadastrados no sistema';
      } else if (existingUser.email === email) {
        message = 'Email já cadastrado no sistema';
      } else {
        message = 'CPF já cadastrado no sistema';
      }

      return NextResponse.json({ exists: true, message });
    }

    return NextResponse.json({ exists: false });

  } catch (error) {
    console.error('Erro na verificação:', error);
    return NextResponse.json(
      { error: true, message: 'Erro ao verificar dados' },
      { status: 500 }
    );
  }
}
