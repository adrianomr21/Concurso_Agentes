import { Agent } from './Agent.js';
import { GeminiService } from '../services/gemini.js';
import { StorageService } from '../services/storage.js';
import { DirectorPlan, TeacherLesson, TeacherDetailedLesson } from '../types/index.js';

export class TeacherAgent extends Agent {
  constructor() {
    super('Professor IA', 'teacher_system.md');
  }

  /**
   * Produz um conteúdo didático aprofundado a partir de um tema e instruções específicas.
   * Utiliza as novas diretrizes do prompt de sistema e a interface TeacherDetailedLesson.
   */
  public async generateDetailedLesson(
    tema: string,
    instrucoes?: string,
    professor?: string
  ): Promise<TeacherDetailedLesson> {
    if (!this.systemInstruction) {
      await this.initialize();
    }

    let customInstruction = this.systemInstruction;
    if (professor) {
      const fileMap: Record<string, string> = {
        'Professor de Português': 'teacher_portuguese.md',
        'Professor de Matemática': 'teacher_math.md',
        'Professor de Legislação': 'teacher_law.md',
        'Professor de TI': 'teacher_ti.md',
        'Professor de Conhecimentos Gerais': 'teacher_general_knowledge.md'
      };
      const promptFile = fileMap[professor];
      if (promptFile) {
        try {
          const specialistPrompt = await StorageService.loadPrompt(promptFile);
          customInstruction = `${this.systemInstruction}\n\n=== DIRETRIZES DA SUA ESPECIALIDADE ===\n${specialistPrompt}`;
          console.log(`[TEACHER AGENT] Especialidade de professor carregada: "${professor}"`);
        } catch (e) {
          console.warn(`[TEACHER AGENT] Não foi possível carregar o prompt especialista para: ${professor}`);
        }
      }
    }

    let prompt = `Elabore uma aula completa e estruturada sobre o seguinte tema:
Tema: "${tema}"`;

    if (instrucoes) {
      prompt += `\n\nDiretrizes pedagógicas do Diretor:\n"""\n${instrucoes}\n"""`;
    }

    prompt += `\n\nRetorne rigorosamente a resposta no formato JSON de material pedagógico especificado nas suas instruções de sistema.`;

    const messages = [
      { role: 'system' as const, content: customInstruction },
      { role: 'user' as const, content: prompt }
    ];

    const rawResponse = await GeminiService.getChatCompletion(messages, true);
    try {
      const cleaned = this.cleanJson(rawResponse);
      return JSON.parse(cleaned) as TeacherDetailedLesson;
    } catch (error) {
      console.error('Falha ao processar resposta da aula detalhada em JSON do Professor IA:', rawResponse);
      throw new Error('O Professor IA falhou ao gerar um material de aula JSON válido.');
    }
  }

  /**
   * Elabora o cronograma e a aula com base nas diretrizes do Diretor Pedagógico (MVP Original)
   * Carrega o prompt de sistema do MVP original de forma isolada (teacher_mvp_system.md).
   */
  public async generateLesson(plan: DirectorPlan, feedback?: string): Promise<TeacherLesson> {
    const mvpInstruction = await StorageService.loadPrompt('teacher_mvp_system.md');
    let prompt = '';

    if (feedback) {
      prompt = `O Diretor Pedagógico solicitou ajustes no material anteriormente gerado.
Por favor, revise o cronograma de estudos e a aula com base no seguinte feedback de correção:

Feedback de Correção:
"""
${feedback}
"""

Requisitos originais do Plano Macro:
"""
${JSON.stringify(plan, null, 2)}
"""

Retorne rigorosamente no formato JSON de resposta do material pedagógico.`;
    } else {
      prompt = `Crie um cronograma de estudos detalhado e redija a aula solicitada de acordo com o seguinte plano de diretrizes macro do Diretor Pedagógico:

Diretrizes Macro:
"""
${JSON.stringify(plan, null, 2)}
"""

Retorne rigorosamente no formato JSON de resposta do material pedagógico.`;
    }

    const messages = [
      { role: 'system' as const, content: mvpInstruction },
      { role: 'user' as const, content: prompt }
    ];

    const rawResponse = await GeminiService.getChatCompletion(messages, true);
    try {
      return JSON.parse(rawResponse) as TeacherLesson;
    } catch (error) {
      console.error('Falha ao analisar resposta em JSON do Professor IA no fluxo original:', rawResponse);
      throw new Error('O Professor IA falhou ao gerar um material pedagógico JSON válido para o MVP.');
    }
  }

  /**
   * Responde as duvidas do aluno no chat, mantendo o contexto da aula e o historico da conversa.
   */
  public async answerStudentQuestion(
    detailedLesson: TeacherDetailedLesson,
    chatHistory: { role: 'user' | 'assistant'; message: string; timestamp: string; }[],
    newQuestion: string,
    professorName: string
  ): Promise<string> {
    if (!this.systemInstruction) {
      await this.initialize();
    }

    let customInstruction = this.systemInstruction;
    const fileMap: Record<string, string> = {
      'Professor de Português': 'teacher_portuguese.md',
      'Professor de Matemática': 'teacher_math.md',
      'Professor de Legislação': 'teacher_law.md',
      'Professor de TI': 'teacher_ti.md',
      'Professor de Conhecimentos Gerais': 'teacher_general_knowledge.md'
    };
    const promptFile = fileMap[professorName];
    if (promptFile) {
      try {
        const specialistPrompt = await StorageService.loadPrompt(promptFile);
        customInstruction = `${this.systemInstruction}\n\n=== DIRETRIZES DA SUA ESPECIALIDADE ===\n${specialistPrompt}`;
      } catch (e) {
        console.warn(`[TEACHER AGENT] Nao foi possivel carregar o prompt especialista para chat: ${professorName}`);
      }
    }

    const contextInstruction = `Voce e o "${professorName}" da AcademiaIA. O aluno esta atualmente estudando a aula que voce gerou sobre o tema "${detailedLesson.tema}".
Voce deve atuar estritamente como este professor especialista, respondendo de forma clara, didatica, pedagogica e tirando qualquer duvida que o aluno apresente em relacao ao conteudo da aula. Fale diretamente com o aluno Adriano. Seja encorajador.
Se ele perguntar sobre alguma questao do simulado da aula, nao de o gabarito diretamente; ajude-o no raciocinio passo a passo para ele encontrar a resposta.
Importante: Responda em formato de texto Markdown legivel e direto ao ponto. Nao use JSON.

REQUISITO CRITICO DE FORMATACAO MATEMATICA E LINGUAGEM:
- NUNCA utilize delimitadores de formulas ou LaTeX com cifroes como $...$ ou $$...$$.
- NUNCA use comandos de LaTeX como \\times, \\mathbf, \\frac, \\cdot, etc.
- Use exclusivamente notacao matematica simples e amigavel (ex: use "x" ou "*" para multiplicacao, e "/" para divisao).
- Para termos em negrito, use notacao padrao Markdown (ex: **7** em vez de \\mathbf{7}).
- Para potencias, use caracteres normais e sobrescritos comuns (ex: 2³ ou 2^3 em vez de formulas com cifroes).
- Mantenha o texto extremamente limpo, fluido e facil de ler no navegador comum.`;

    const messages = [
      { role: 'system' as const, content: `${customInstruction}\n\n=== CONTEXTO DO CHAT DA AULA ===\n${contextInstruction}` },
      { role: 'user' as const, content: `Aqui esta a aula detalhada que voce preparou:\n\n=== TEMA: ${detailedLesson.tema} ===\n${JSON.stringify(detailedLesson, null, 2)}` },
      { role: 'assistant' as const, content: `Ola, Adriano! Eu sou o seu ${professorName} para esta aula sobre "${detailedLesson.tema}". Analisei as diretrizes e elaborei o material. Como posso tirar suas duvidas hoje?` },
      ...chatHistory.map(ch => ({
        role: ch.role === 'user' ? 'user' as const : 'assistant' as const,
        content: ch.message
      })),
      { role: 'user' as const, content: newQuestion }
    ];

    const rawResponse = await GeminiService.getChatCompletion(messages, false);
    return rawResponse;
  }
}
