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
}
