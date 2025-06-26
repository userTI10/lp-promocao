"use server";
import { NextResponse } from 'next/server';
import { getConnection } from '../conn/dbsever';

export async function POST(request) {
  try {
    const formData = await request.json();
    const pool = await getConnection();

    const result = await pool.request()
      .input('nome', formData.nome)
      .input('cpf', formData.cpf)
      .input('email', formData.email)
      .input('ddd', formData.ddd)
      .input('celular', formData.celular)
      .input('uf', formData.estado)
      .input('cidade', formData.cidade)
      .input('dtdata', formData.data)
      .input('aceito_termos', formData.aceitaTermos ? 1 : 0)
      .input('cupom', formData.cupom)
      .input('escolhahorario', formData.escolhahorario)
      .input('clientetouti', formData.clienteTouti === 'sim' ? 'sim' : 'não')
      .input('saurus', formData.saurus)
      .input('endereco', formData.endereco)
      .query(`
        INSERT INTO promocao (
          nome, cpf, email, ddd, celular, uf, cidade, dtdata, 
          aceito_termos, cupom, escolhahorario, clientetouti, saurus, endereco
        ) VALUES (
          @nome, @cpf, @email, @ddd, @celular, @uf, @cidade, @dtdata, 
          @aceito_termos, @cupom, @escolhahorario, @clientetouti, @saurus, @endereco
        )
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar usuário' },
      { status: 500 }
    );
  }
}
