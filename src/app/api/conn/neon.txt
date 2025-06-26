"use server";
import {Pool} from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

export async function getData() {
    try {
      const client = await pool.connect();
    //   console.log(client)
      return client
    }catch(error){
      console.error('Erro ao conectar ao banco de dados:', error);
    }
}