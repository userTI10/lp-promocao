"use server";
import { NextResponse } from 'next/server';
import { getData } from '../conn/neon';


export async function POST(request) {
  
  try {
    const client = await getData();
    const formData = await request.json();
    
    const values = [
      formData.nome || '',
      formData.cpf || '',
      formData.email || '',
      formData.ddd || '',
      formData.celular || '',
      formData.estado || '',
      formData.cidade || '',
      formData.data || new Date().toISOString(),
      formData.aceitaTermos || false,
      formData.cupom || '',
      formData.escolhahorario || '',
      formData.clienteTouti || 'não',
      formData.saurus || '',
      formData.endereco || ''
    ];

    const query = `
      INSERT INTO promocao (
        nome, cpf, email, ddd, celular, uf, cidade, dtdata, 
        aceito_termos, cupom, escolhahorario, clienteTouti, saurus, endereco
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await client.query(query, values);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar usuário' },
      { status: 500 }
    );
  } 
}