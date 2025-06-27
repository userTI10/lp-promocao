import nodemailer from 'nodemailer';
import { EmailTemplate } from '@/Components/EmailTemplate';

export async function POST(request) {
  const { nome, email, escolhahorario, cupom, endereco, cidade, cpf } = await request.json();

  const transporter = nodemailer.createTransport({
  host: 'cloud21.mailgrid.net.br',
  port: 587,
  secure: false,
  auth: {
    user: 'smtp1@touticosmetics.com.br',
    pass: 'ddas37wn2b42x',
  }
});

  const htmlContent = EmailTemplate({
    nome,
    email,
    escolhahorario,
    cupom,
    endereco,
    cidade,
    cpf
  });

  try {
    await transporter.sendMail({
      from: '"Touti" <no-reply@touticosmetics.com.br>',
      to: email,
      subject: 'Confirmação de Cadastro - Brinde Touti',
      html: htmlContent,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Erro ao enviar email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}