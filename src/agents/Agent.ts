import { GeminiService } from '../services/gemini.js';
import { StorageService } from '../services/storage.js';
import { Message } from '../types/index.js';

export abstract class Agent {
  protected name: string;
  protected promptFileName: string;
  protected systemInstruction: string = '';
  protected chatMessages: Message[] = [];

  constructor(name: string, promptFileName: string) {
    this.name = name;
    this.promptFileName = promptFileName;
  }

  /**
   * Carrega o prompt de sistema do arquivo Markdown associado
   */
  public async initialize(): Promise<void> {
    this.systemInstruction = await StorageService.loadPrompt(this.promptFileName);
    this.resetChat();
  }

  /**
   * Reseta o histórico de mensagens e reinsere a instrução de sistema
   */
  public resetChat(): void {
    this.chatMessages = [
      {
        role: 'system',
        content: this.systemInstruction,
      },
    ];
  }

  /**
   * Envia uma mensagem para o agente (mantendo histórico na conversa) e retorna a resposta
   * @param userMessage Mensagem enviada ao agente
   * @param jsonMode Se true, força a API a responder em JSON estruturado
   */
  public async ask(userMessage: string, jsonMode: boolean = false): Promise<string> {
    if (!this.systemInstruction) {
      await this.initialize();
    }

    // Adiciona a mensagem do usuário ao histórico do agente
    this.chatMessages.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // Solicita a resposta do LLM usando o serviço do Gemini
      const reply = await GeminiService.getChatCompletion(this.chatMessages, jsonMode);

      // Adiciona a resposta do agente ao histórico local
      this.chatMessages.push({
        role: 'assistant',
        content: reply,
      });

      return reply;
    } catch (error) {
      console.error(`Erro na execução do agente ${this.name}:`, error);
      // Remove a última mensagem enviada em caso de falha para manter consistência
      this.chatMessages.pop();
      throw error;
    }
  }

  /**
   * Retorna o nome do agente
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Limpa formatações markdown e extrai o bloco JSON puro delimitado por { e }
   * Usa algoritmo de balanceamento de chaves que ignora lixo gerado no final do JSON.
   */
  protected cleanJson(raw: string): string {
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    const startIdx = cleaned.indexOf('{');
    if (startIdx === -1) return cleaned;

    let braceCount = 0;
    let endIdx = -1;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }

    if (endIdx !== -1) {
      return cleaned.substring(startIdx, endIdx + 1);
    }

    return cleaned;
  }
}
