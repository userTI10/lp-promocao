"use server";
import { NextResponse } from 'next/server';
import { getData } from '../conn/neon';

export async function POST(request) {
  try {
    const client = await getData();
    const { email, cpf } = await request.json();

   const query = 'SELECT * FROM promocao WHERE email = $1 OR cpf = $2';
    const result = await client.query(query, [email, cpf]); // Linha 10
    console.log('o result: ', result);

    if (result.length > 0) {
      const existingUser = result[0];
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
