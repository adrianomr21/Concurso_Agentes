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
    instrucoes?: string
  ): Promise<TeacherDetailedLesson> {
    let prompt = `Elabore uma aula completa e estruturada sobre o seguinte tema:
Tema: "${tema}"`;

    if (instrucoes) {
      prompt += `\n\nDiretrizes pedagógicas do Diretor:\n"""\n${instrucoes}\n"""`;
    }

    prompt += `\n\nRetorne rigorosamente a resposta no formato JSON de material pedagógico especificado nas suas instruções de sistema.`;

    const rawResponse = await this.ask(prompt, true);
    try {
      return JSON.parse(rawResponse) as TeacherDetailedLesson;
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
