import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { env } from '../config/env.js';

let genAIInstance: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAIInstance) {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não foi configurada no arquivo .env.');
    }
    genAIInstance = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAIInstance;
}

export class GeminiService {
  /**
   * Envia o histórico de mensagens traduzido e as instruções de sistema para o modelo Gemini e retorna o conteúdo em string.
   */
  static async getChatCompletion(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    jsonMode: boolean = false
  ): Promise<string> {
    const client = getGeminiClient();

    // Extrai a instrução de sistema
    const systemMessage = messages.find((m) => m.role === 'system');
    const systemInstruction = systemMessage ? systemMessage.content : undefined;

    // Converte o histórico genérico para o formato Content[] do Gemini
    const geminiHistory: Content[] = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Destaca a última mensagem como prompt ativo para o chat.sendMessage
    const lastMessage = geminiHistory.pop();
    if (!lastMessage) {
      throw new Error('Histórico de mensagens vazio ou sem mensagens ativas de usuário.');
    }

    const lastMessageText = lastMessage.parts[0]?.text || '';

    const model = client.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction,
    });

    const generationConfig = jsonMode
      ? { responseMimeType: 'application/json', maxOutputTokens: 4096 }
      : { maxOutputTokens: 4096 };

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig,
    });

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const responseResult = await chat.sendMessage(lastMessageText);
        return responseResult.response.text();
      } catch (error: any) {
        attempt++;
        const errorMessage = error.message || '';
        const isTemporaryError = 
          error.status === 503 || 
          error.status === 429 || 
          errorMessage.includes('503') || 
          errorMessage.includes('429') ||
          errorMessage.includes('demand'); // Experiencing high demand

        if (isTemporaryError && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[GEMINI SERVICE] Falha temporária da API (Tentativa ${attempt}/${maxRetries} - Erro: ${errorMessage.substring(0, 100)}). Aguardando ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error('Erro definitivo ou limite de tentativas atingido na chamada da API do Gemini:', error);
          throw error;
        }
      }
    }
    throw new Error('Falha inexplicável na chamada da API do Gemini.');
  }
}
