import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Garante o carregamento do .env na raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};

// Validação simples
if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'seu_token_aqui') {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    'AVISO: A variável de ambiente GEMINI_API_KEY não está configurada corretamente no arquivo .env. Certifique-se de fornecer uma chave válida.'
  );
}
